import { ParticleEngine } from "../service/ParticleEngine";
import { FpsManager } from "../../Performance/service/FpsManager";
import { PauseStartReason, Player } from "../../Player/service/Player";
import { playerStore } from "../../Player/state/PlayerStore";
import { performanceStore } from "../../Performance/state/PerformanceStore";
import { AUTO_ADVANCE_DELAY, advancerStore } from "../../AutoAdvancer/state/AdvancerStore";
import { particleEngineStore } from "../state/ParticleEngineStore";
import { Point } from "../../../lib/Point";
import { resetHandler } from "../../../core/services/ResetHandler";
import { shapesStore } from "../../Shapes/state/ShapsStore";
import { zoomStore } from "../../Zoom/state/ZoomStore";
import { config } from "../../../config/config";
import { mnemonicsStore } from "../../../experimental/Mnemonics";
import { renderSmoothnessStore } from "../../../experimental/RenderSmoothness/state/RenderSmoothnessStore";

import template from "./ParticleEngineCanvas.html?raw";
import { XComponent, XAlpineComponent } from "../../../lib/XComponent";

let animationFrameId: number | null = null;
export type AnimatedWindow = Window &
  typeof globalThis & { stopAnimation: boolean };
(window as AnimatedWindow).stopAnimation = false;

interface ParticleEngineCanvasComponent extends XAlpineComponent {
  $refs: {
    canvas: HTMLCanvasElement;
  };
}

export function particleEngineCanvasFactory(
  fpsManager: FpsManager,
  player: Player,
  particleEngine: ParticleEngine,
) {
  function particleEngineCanvasComponent(this: ParticleEngineCanvasComponent) {
    const canvas = this.$refs.canvas;
    return {
      pauseChanged() {
        if (!playerStore.isPaused && animationFrameId === null) {
          this.animate();
        }
      },
      player,
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

        particleEngineStore.adjustMaxTracesPerFrame(
          fpsManager.calculateAdjustment(),
          renderSmoothnessStore.renderingSmoothness
        );

        if (!particleEngine) return;

        if (
          advancerStore.isAutoAdvanceMode &&
          Date.now() - advancerStore.autoAdvanceTimestamp >=
            AUTO_ADVANCE_DELAY[advancerStore.autoAdvanceSpeed]
        ) {
          mnemonicsStore.nextMnemonic();
        }

        const ctx = canvas.getContext("2d")!;
        if (resetHandler.resetRequested()) {
          ctx.fillStyle = canvas.style.backgroundColor;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          resetHandler.performReset();
          return;
        }

        if (!resetHandler.initialResetPerformed) {
          console.warn("Performing initial reset");
          resetHandler.requestReset(false);
          return;
        }

        ctx.fillStyle = particleEngineStore.color.toString();
        const startCalculateTraces = performance.now();
        const traces = particleEngine.calculateTraces(
          canvas.width,
          canvas.height,
          particleEngineStore.maxTracesPerFrame,
          particleEngineStore.currentMaxTotalTraces
        );
        performanceStore.calculationTime =
          performance.now() - startCalculateTraces;

        if (!traces) {
          resetHandler.requestReset(false);
          return;
        }

        if (traces.length() === 0) {
          if (advancerStore.isAutoAdvanceMode) {
            mnemonicsStore.newMnemonic();
          } else {
            player.startPause(PauseStartReason.MAX_TRACES_DRAWN);
          }
          return;
        }

        const startDrawTraces = performance.now();
        if (!isFinite(renderSmoothnessStore.vScaling)) {
          renderSmoothnessStore.vScaling = 0;
          for (let i = 0; i < traces.length(); i++) {
            const v = traces.getItensity(i) ** 0.7;
            if (v > renderSmoothnessStore.vScaling) {
              renderSmoothnessStore.vScaling = v;
            }
          }
        }
        for (let i = 0; i < traces.length(); i++) {
          const [x, y, intensity] = traces.get(i);
          let v = 1;
          if (renderSmoothnessStore.isRenderVelocity) {
            v = intensity ** 0.7 / renderSmoothnessStore.vScaling;
          }
          v /= renderSmoothnessStore.renderingSmoothness;
          ctx.fillRect(x, y, v, v);
        }
        performanceStore.renderTime = performance.now() - startDrawTraces;
      },

      fitCanvasToWindow() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
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
          renderSmoothnessStore.vScaling = Infinity;
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
  return new XComponent(template, "particle-engine-canvas", particleEngineCanvasComponent);
}
