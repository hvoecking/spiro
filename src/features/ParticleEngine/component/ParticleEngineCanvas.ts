import { ParticleEngine } from "../service/ParticleEngine";
import { FpsManager } from "../../Performance/service/FpsManager";
import { PauseStartReason, Player } from "../../Player/service/Player";
import { playerStore } from "../../Player/state/PlayerStore";
import { performanceStore } from "../../Performance/state/PerformanceStore";
import {
  AUTO_ADVANCE_DELAY,
  advancerStore,
} from "../../AutoAdvancer/state/AdvancerStore";
import { particleEngineStore } from "../state/ParticleEngineStore";
import { Point } from "../../../lib/Point";
import { resetHandler } from "../../../core/services/ResetHandler";
import { shapesStore } from "../../Shapes/state/ShapsStore";
import { zoomStore } from "../../Zoom/state/ZoomStore";
import { config } from "../../../config/config";
import { mnemonicsStore } from "../../../experimental/Mnemonics";
import { renderQualityStore } from "../../../experimental/RenderQuality/state/RenderQualityStore";

import template from "./ParticleEngineCanvas.html?raw";
import { XComponent, XAlpineComponent } from "../../../lib/XComponent";
import { renderReset, renderTraces } from "../service/Renderer";
import { RenderArgs, Renderer, ResetArgs, ResizeArgs } from "../service/RenderWorker";
import { PerformanceSampler } from "../../Performance/service/PerformanceTracker";
import { AsTraces } from "../service/AsTraces";

let animationFrameId: number | null = null;
export type AnimatedWindow = Window & typeof globalThis & { stopAnimation: boolean };
(window as AnimatedWindow).stopAnimation = false;

interface ParticleEngineCanvasComponent extends XAlpineComponent {
  $refs: {
    canvas: HTMLCanvasElement;
    oldCanvas: HTMLCanvasElement;
  };
}

export function particleEngineCanvasFactory(
  fpsManager: FpsManager,
  player: Player,
  particleEngine: ParticleEngine,
) {
  function particleEngineCanvasComponent(this: ParticleEngineCanvasComponent) {
    const canvas = this.$refs.canvas;
    const currentCanvas = new OffscreenCanvas(canvas.width, canvas.height);
    let lastOldCanvas: OffscreenCanvas | null = null;
    let renderWorker: Worker | null = null;
    let lastChange: number | null = null;
    const renderOnscreen = (currentCanvas: OffscreenCanvas, duration: number) => {
      const sampler = performanceStore.renderTimeTracker.start();

      const ctx = canvas.getContext("2d")!;
      renderReset(ctx, canvas.style.backgroundColor, canvas.width, canvas.height);
      ctx.drawImage(currentCanvas, 0, 0);

      // Draw and scale the bitmap onto the canvas
      if (lastChange) {
        const lastOldCtx = lastOldCanvas!.getContext("2d")!;
        const timeSinceLastChange = Date.now() - lastChange;
        lastOldCtx.globalAlpha = 0.9 - 0.1 * Math.pow(0.9, timeSinceLastChange * 0.01);
        lastOldCtx.drawImage(lastOldCanvas!.transferToImageBitmap(), 0, 0);
        ctx.drawImage(lastOldCanvas!, 0, 0);
        if (timeSinceLastChange > 1000) {
          lastChange = null;
          lastOldCanvas = null;
        }
      }
      performanceStore.renderTimeTracker.end(sampler, duration);
    };
    try {
      renderWorker = new Worker(
        new URL("../service/RenderWorker.ts", import.meta.url),
        {
          type: "module",
        },
      );
      renderWorker.onmessage = (event) => {
        const { imageBitmap, duration } = event.data;

        currentCanvas.getContext("2d")!.drawImage(imageBitmap, 0, 0);
        renderOnscreen(currentCanvas, duration);
      };
    } catch (e) {
      console.error(e);
      particleEngineStore.useWebworker = false;
      particleEngineStore.isWebworkerEnabled = false;
    }
    return {
      player,

      pauseChanged() {
        if (!playerStore.isPaused && animationFrameId === null) {
          this.animate();
        }
      },

      animate() {
        if (playerStore.isPaused || (window as AnimatedWindow).stopAnimation) {
          if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
          }
          fpsManager.startPause();
          return;
        }
        animationFrameId = requestAnimationFrame(() => this.animate());
        this.nextFrame();
      },

      nextFrame(forceUpdate = false) {
        if (!forceUpdate && !this.shouldUpdate()) return;
        const traces = this.update();
        if (!traces) return;
        this.renderOffscreen(traces);
      },

      shouldUpdate() {
        particleEngineStore.adjustMaxTracesPerFrame(
          fpsManager.calculateAdjustment(),
          renderQualityStore.quality,
        );

        if (!particleEngine) return false;

        if (
          advancerStore.isAutoAdvanceMode &&
          Date.now() - advancerStore.autoAdvanceTimestamp >=
            AUTO_ADVANCE_DELAY[advancerStore.autoAdvanceSpeed]
        ) {
          lastOldCanvas = new OffscreenCanvas(canvas.width, canvas.height);
          lastOldCanvas.getContext("2d")?.drawImage(currentCanvas, 0, 0);
          lastChange = Date.now();
          mnemonicsStore.nextMnemonic();
        }

        if (resetHandler.resetRequested()) {
          if (!particleEngineStore.useWebworker) {
            currentCanvas
              .getContext("2d")!
              .clearRect(0, 0, canvas.width, canvas.height);
          }
          resetHandler.performReset();
          return false;
        }

        if (!resetHandler.initialResetPerformed) {
          console.warn("Performing initial reset");
          resetHandler.requestReset(false);
          return false;
        }
        return true;
      },

      update(): AsTraces | null {
        const calculationTimeSampler = performanceStore.calculationTimeTracker.start();
        const traces = particleEngine.calculateTraces(
          canvas.width,
          canvas.height,
          particleEngineStore.maxTracesPerFrame,
          particleEngineStore.currentMaxTotalTraces,
        );
        performanceStore.calculationTimeTracker.end(calculationTimeSampler);

        if (!traces) {
          resetHandler.requestReset(false);
          return null;
        }

        if (traces.length() === 0) {
          if (advancerStore.isAutoAdvanceMode) {
            mnemonicsStore.newMnemonic();
          } else {
            player.startPause(PauseStartReason.MAX_TRACES_DRAWN);
          }
          return null;
        }

        if (!isFinite(renderQualityStore.vScaling)) {
          renderQualityStore.vScaling = 0;
          for (let i = 0; i < traces.length(); i++) {
            const v = traces.getItensity(i) ** 0.7;
            if (v > renderQualityStore.vScaling) {
              renderQualityStore.vScaling = v;
            }
          }
        }
        return traces;
      },

      renderOffscreen(traces: AsTraces) {
        if (!particleEngineStore.useWebworker) {
          const renderTimeSampler = new PerformanceSampler();
          renderTraces(
            currentCanvas.getContext("2d")!,
            particleEngineStore.color.toString(),
            traces,
            renderQualityStore.isRenderVelocity,
            renderQualityStore.vScaling,
            renderQualityStore.quality,
          );
          renderTimeSampler.end();
          renderOnscreen(currentCanvas, renderTimeSampler.getDuration());
        } else {
          this.callRenderWorker("render", {
            color: particleEngineStore.color.toString(),
            traces: traces.serialize(),
            isRenderVelocity: renderQualityStore.isRenderVelocity,
            vScaling: renderQualityStore.vScaling,
            quality: renderQualityStore.quality,
          });
        }
      },

      callRenderWorker(
        type: keyof Renderer,
        args: RenderArgs | ResizeArgs | ResetArgs,
      ) {
        renderWorker!.postMessage({ type, ...args });
      },

      fitCanvasToWindow() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        currentCanvas.width = window.innerWidth;
        currentCanvas.height = window.innerHeight;
        if (particleEngineStore.useWebworker) {
          this.callRenderWorker("resize", {
            canvasWidth: canvas.width,
            canvasHeight: canvas.height,
          });
        }
      },

      init() {
        resetHandler.registerProvider("scale", () => {
          const minCanvasDimension = Math.min(canvas.width, canvas.height);
          return (
            (minCanvasDimension / ((1 + (1 - zoomStore.zoom) * 30) * 100000)) *
            (shapesStore.isShapesMode ? 3 : 7)
          );
        });
        resetHandler.registerProvider("center", () => {
          return new Point(canvas.width, canvas.height).scale(0.5);
        });
        resetHandler.registerListener(() => {
          renderQualityStore.vScaling = Infinity;
          this.callRenderWorker("reset", {
            color: canvas.style.backgroundColor,
          });
          this.nextFrame(true);
        });
        window.addEventListener("resize", () => {
          this.fitCanvasToWindow();
          if (config.resetOnWindowResize) {
            resetHandler.requestReset(false);
          }
        });
        this.fitCanvasToWindow();

        this.animate();
      },
    };
  }
  return new XComponent(
    template,
    "particle-engine-canvas",
    particleEngineCanvasComponent,
  );
}
