import Alpine, { AlpineComponent } from "alpinejs";

import {
  ParticleEngine,
  traces,
  setPrecisionMode,
} from "../ParticleEngine";
import { clamp, isTestMode } from "../Utilities";
import { MnemonicsStore } from "./Mnemonics";
import { FpsManager } from "../services/performance/FpsManager";
import { PauseEndReason, PauseStartReason, Player } from "../services/player/Player";
import { playerStore } from "../services/player/PlayerStore";
import { performanceStore } from "../services/performance/PerformanceStore";
import { AUTO_ADVANCE_DELAY, advancerStore } from "../services/advance/AdvancerStore";
import { Point, particleEngineStore } from "./../ParticleEngineStore";

class ResetRequest {
  constructor(public readonly immediateFeedback: boolean) {}
}

interface CanvasComponent extends AlpineComponent<Record<string | symbol, unknown>> {
  pauseChanged(): void;
  player: Player;
  $refs: { canvas: HTMLCanvasElement };
  $dispatch(event: string): void;
  currentFpsSecond: number | null;
  lastFrameTime: number;
  animate(): void;
  resizeCanvas(): void;
  init(): void;
}

export interface CanvasStore {
  isWasmModuleLoaded: boolean;
  renderingSmoothness: number;
  isRenderVelocity: boolean;
  vScaling: number;
  isWasmMode: boolean;
  toggleWasmMode(): void;
  isHighPrecisionMode: boolean;
  togglePrecisionMode(): void;
  isFullScreen(): boolean;
  toggleFullScreen(): void;
  isShapesMode: boolean;
  toggleShapesMode(): void;
  zoom: number;
  setZoom(zoom: number): void;
  seed: string[];
  setSeed(seed: string[], immediateFeedback?: boolean): void;
  resetRequest: ResetRequest | null;
  requestReset(immediateFeedback: boolean): void;
  particleEngine: ParticleEngine | null;
  useRNG: boolean;
  reset(): void;
}

let animationFrameId: number | null = null;
export type AnimatedWindow = Window & typeof globalThis & { stopAnimation: boolean };
(window as AnimatedWindow).stopAnimation = false;

export function canvasFactory(
  fpsManager: FpsManager,
  player: Player,
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
      currentFpsSecond: null as number | null,
      lastFrameTime: 0,
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

        const ctx = canvas.getContext("2d")!;
        const bcr = canvas.getBoundingClientRect();
        if (canvasStore.resetRequest) {
          canvasStore.reset();
          ctx.fillStyle = canvas.style.backgroundColor;
          ctx.fillRect(0, 0, bcr.width, bcr.height);
        }

        const particleEngine = canvasStore.particleEngine;
        if (!particleEngine) return;

        ctx.fillStyle = particleEngineStore.color.toString();
        const startCalculateTraces = performance.now();
        const tracesDrawn = particleEngine.calculateTraces(
          bcr.width,
          bcr.height,
          canvasStore.isWasmMode,
          particleEngineStore.maxTracesPerFrame,
          particleEngineStore.currentMaxTotalTraces
        );
        performanceStore.calculationTime = performance.now() - startCalculateTraces;

        if (tracesDrawn === -1) {
          canvasStore.requestReset(false);
        }

        if (advancerStore.isAutoAdvanceMode && Date.now() - advancerStore.autoAdvanceTimestamp >= AUTO_ADVANCE_DELAY[advancerStore.autoAdvanceSpeed]) {
          (Alpine.store("mnemonics") as MnemonicsStore).nextMnemonic();
        }

        if (tracesDrawn === 0) {
          if (advancerStore.isAutoAdvanceMode) {
            (Alpine.store("mnemonics") as MnemonicsStore).newMnemonic();
          } else {
            player.startPause(PauseStartReason.MAX_TRACES_DRAWN);
          }
          return;
        }

        if (!traces) {
          return;
        }

        const startDrawTraces = performance.now();
        if (!isFinite(canvasStore.vScaling)) {
          canvasStore.vScaling = 0;
          for (let i = 0; i < tracesDrawn; i++) {
            const v = traces[i * 3 + 2]**.7;
            if (v > canvasStore.vScaling) {
              canvasStore.vScaling = v;
            }
          }
        }
        for (let i = 0; i < tracesDrawn; i++) {
          const x = traces[i * 3];
          const y = traces[i * 3 + 1];
          let v = 1;
          if (canvasStore.isRenderVelocity) {
            v = traces[i * 3 + 2]**.7 / canvasStore.vScaling;
          }
          v /= canvasStore.renderingSmoothness;
          ctx.fillRect(x, y, v, v);
        }
        performanceStore.renderTime = performance.now() - startDrawTraces;
      },

      resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        if (!isTestMode()) {
          canvasStore.requestReset(true);
        }
      },

      init() {
        window.addEventListener("resize", () => this.resizeCanvas());
        this.resizeCanvas();
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

        // Listen for "wheel" event on the document
        document.addEventListener("wheel", function(event) {
          // Prevent default zoom
          event.preventDefault();

          canvasStore.setZoom(canvasStore.zoom - event.deltaY / 600);
        }, { passive: false });

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

      isWasmModuleLoaded: false,
      isWasmMode: false,
      toggleWasmMode() {
        this.isWasmMode = !this.isWasmMode;
      },

      isHighPrecisionMode: false,
      togglePrecisionMode() {
        this.isHighPrecisionMode = !this.isHighPrecisionMode;
        setPrecisionMode(this.isHighPrecisionMode);
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

      isShapesMode: false,
      toggleShapesMode() {
        this.isShapesMode = !this.isShapesMode;
        this.requestReset(false);
      },
      dummyVar: true,
      zoom: 0.75,
      setZoom(zoom: number) {
        component.$dispatch("zoom-changed");
        this.zoom = clamp(zoom, 0.01, 1);
        this.requestReset(true);
      },

      resetRequest: null as ResetRequest | null,
      requestReset(immediateFeedback: boolean) {
        this.resetRequest = new ResetRequest(immediateFeedback);
        if (playerStore.isPaused) {
          player.endPause(PauseEndReason.RESET_REQUESTED);
        }
      },

      particleEngine: null as ParticleEngine | null,
      useRNG: false,
      autoAdvanceTimestamp: 0,
      reset() {
        if (!traces) return;
        const bcr = canvas.getBoundingClientRect();
        const minCanvasDimension = Math.min(bcr.width, bcr.height);

        particleEngineStore.reset(
          !!this.resetRequest?.immediateFeedback,
          new Point(bcr.width, bcr.height).scale(0.5),
          (minCanvasDimension / ((1 + (1 - this.zoom) * 30) * 100000)) * (this.isShapesMode ? 3 : 7),
          this.useRNG,
        );

        this.particleEngine = new ParticleEngine();
        this.resetRequest = null;

        this.vScaling = Infinity;
        this.autoAdvanceTimestamp = Date.now();
      },
    };
    Alpine.store("canvas", canvasStore);
    return component;
  };
}
