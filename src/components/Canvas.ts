import Alpine, { AlpineComponent } from "alpinejs";

import { ParticleEngine } from "../services/ParticleEngine/ParticleEngine";
import { isTestMode } from "../Utilities";
import { MnemonicsStore } from "./Mnemonics";
import { FpsManager } from "../services/FpsManager/FpsManager";
import { PauseStartReason, Player } from "../services/Player/Player";
import { playerStore } from "../state/PlayerStore";
import { performanceStore } from "../state/PerformanceStore";
import { AUTO_ADVANCE_DELAY, advancerStore } from "../state/AdvancerStore";
import { particleEngineStore } from "../state/ParticleEngineStore";
import { Point } from "../services/ParticleEngine/Point";
import { resetHandler } from "../services/reset/ResetHandler";
import { shapesStore } from "../state/ShapsStore";
import { zoomStore } from "../state/ZoomStore";

interface CanvasComponent extends AlpineComponent<Record<string | symbol, unknown>> {
  pauseChanged(): void;
  player: Player;
  $refs: { canvas: HTMLCanvasElement };
  $dispatch(event: string): void;
  animate(): void;
  fitCanvasToWindow(): void;
  init(): void;
  reset(immediateFeedback: boolean): void;
}

export interface CanvasStore {
  renderingSmoothness: number;
  isRenderVelocity: boolean;
  vScaling: number;
  isFullScreen(): boolean;
  toggleFullScreen(): void;
}

let animationFrameId: number | null = null;
export type AnimatedWindow = Window & typeof globalThis & { stopAnimation: boolean };
(window as AnimatedWindow).stopAnimation = false;

export function canvasFactory(
  fpsManager: FpsManager,
  player: Player,
  particleEngine: ParticleEngine,
) {
  return function Component(this: CanvasComponent) {
    const canvas = this.$refs.canvas as HTMLCanvasElement;

    const component = {
      pauseChanged() {
        if (!playerStore.isPaused && animationFrameId === null) {
          this.animate();
        }
      },
      player,
      animate() {
        const canvasStore = Alpine.store("canvas") as CanvasStore;

        if (playerStore.isPaused || (window as AnimatedWindow).stopAnimation) {
          if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
          }
          fpsManager.startPause();
          return;
        }
        animationFrameId = requestAnimationFrame(() => this.animate());

        particleEngineStore.adjustMaxTracesPerFrame(fpsManager.calculateAdjustment(), canvasStore.renderingSmoothness);

        if (!particleEngine) return;

        if (advancerStore.isAutoAdvanceMode && Date.now() - advancerStore.autoAdvanceTimestamp >= AUTO_ADVANCE_DELAY[advancerStore.autoAdvanceSpeed]) {
          (Alpine.store("mnemonics") as MnemonicsStore).nextMnemonic();
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
        performanceStore.calculationTime = performance.now() - startCalculateTraces;

        if (!traces) {
          resetHandler.requestReset(false);
          return;
        }

        if (traces.length() === 0) {
          if (advancerStore.isAutoAdvanceMode) {
            (Alpine.store("mnemonics") as MnemonicsStore).newMnemonic();
          } else {
            player.startPause(PauseStartReason.MAX_TRACES_DRAWN);
          }
          return;
        }

        const startDrawTraces = performance.now();
        if (!isFinite(canvasStore.vScaling)) {
          canvasStore.vScaling = 0;
          for (let i = 0; i < traces.length(); i++) {
            const v = traces.getItensity(i)**.7;
            if (v > canvasStore.vScaling) {
              canvasStore.vScaling = v;
            }
          }
        }
        for (let i = 0; i < traces.length(); i++) {
          const [x, y, intensity] = traces.get(i);
          let v = 1;
          if (canvasStore.isRenderVelocity) {
            v = intensity**.7 / canvasStore.vScaling;
          }
          v /= canvasStore.renderingSmoothness;
          ctx.fillRect(x, y, v, v);
        }
        performanceStore.renderTime = performance.now() - startDrawTraces;
      },

      fitCanvasToWindow() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      },

      init() {
        window.addEventListener(
          "keydown",
          (ev) => ev.key === "f" && canvasStore.toggleFullScreen()
        );
        canvas.addEventListener("dblclick", () => {
          // TODO: This is a hack to avoid an error when the user double clicks
          try {
            canvasStore.toggleFullScreen();
          } catch (e) {
            // FIXME: Exception is not getting caught here for some reason
          }
        });

        resetHandler.registerProvider("scale", () => {
          const minCanvasDimension = Math.min(canvas.width, canvas.height);
          return (minCanvasDimension / ((1 + (1 - zoomStore.zoom) * 30) * 100000)) * (shapesStore.isShapesMode ? 3 : 7);
        });
        resetHandler.registerProvider("center", () => {
          return new Point(canvas.width, canvas.height).scale(0.5);
        });
        resetHandler.registerListener(() => {
          canvasStore.vScaling = Infinity;
        });
        window.addEventListener("resize", () => {
          this.fitCanvasToWindow();
          if (!isTestMode()) {
            resetHandler.requestReset(false);
          }
        });
        this.fitCanvasToWindow();

        this.animate();
      },
    } as CanvasComponent;

    const canvasStore = {
      calculationTime: 0,
      renderTime: 0,
      isRenderVelocity: false,
      vScaling: Infinity,
      renderingSmoothness: 1,
      setRenderingSmoothness(smoothness: number) {
        this.renderingSmoothness = smoothness;
        particleEngineStore.adjustToRenderingSmoothness(smoothness, advancerStore.autoAdvanceSpeed);
      },

      isFullScreen() {
        return document.fullscreenElement === document.body;
      },

      toggleFullScreen() {
        if (!this.isFullScreen()) {
          document.body.requestFullscreen();
        } else {
          document.exitFullscreen();
        }
      },
    };
    Alpine.store("canvas", canvasStore);
    return component;
  };
}
