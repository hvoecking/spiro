import Alpine, { AlpineComponent } from "alpinejs";

import {
  ParticleEngine,
  ParticleEngineConfig,
  ParticleConfig,
  Point,
  traces,
  setPrecisionMode,
  PHYSICAL_MAX_TRACES_PER_FRAME,
} from "../ParticleEngine";
import { clamp, isDevMode, isTestMode } from "../Utilities";
import { MnemonicsStore } from "./Mnemonics";
import { SeedStore } from "./Seed";

// tracesPerFrame: min 200, good 400, max 2000
// totalTraces: min 181761, good 262144, max 500000
// seconds: min 4, good 8, max 16
// FPS: min 30, good 60, max 120

const RENDERING_SMOOTHNESS_TRACES_FACTOR = 10;

// Make an enum for coloring FPS status
enum FpsStatus {
  NOT_COUNTING = "NOT_COUNTING",
  ABOUT_TO_START = "ABOUT_TO_START",
  WITHIN_THRESHOLD = "WITHIN_THRESHOLD",
  BELOW_THRESHOLD = "BELOW_THRESHOLD",
  ABOVE_THRESHOLD = "ABOVE_THRESHOLD",
}

export enum AutoAdvanceSpeeds {
  SLOW = "slow",
  MEDIUM = "medium",
  FAST = "fast",
}

const INITIAL_AUTO_ADVANCE_SPEED = AutoAdvanceSpeeds.MEDIUM;

const AUTO_ADVANCE_DELAY = {
  [AutoAdvanceSpeeds.SLOW]: 16 * 1000,
  [AutoAdvanceSpeeds.MEDIUM]: 8 * 1000,
  [AutoAdvanceSpeeds.FAST]: (isTestMode() ? 0 : 4) * 1000,
};

const MAX_TRACES_PER_FRAME = {
  [AutoAdvanceSpeeds.SLOW]: 200,
  [AutoAdvanceSpeeds.MEDIUM]: 400,
  [AutoAdvanceSpeeds.FAST]: 2000, // This should must be smaller or equal to MAX_TRACES_PER_FRAME of the particle engine
};

const MAX_TOTAL_TRACES_PER_FRAME = {
  [AutoAdvanceSpeeds.SLOW]: 500000,
  [AutoAdvanceSpeeds.MEDIUM]: 262144,
  [AutoAdvanceSpeeds.FAST]: 181761,
};

// Possible target FPS values
const POSSIBLE_TARGET_FPS = [30, 60, 120];

class ResetRequest {
  constructor(public readonly immediateFeedback: boolean) {}
}

interface CanvasComponent extends AlpineComponent<Record<string | symbol, unknown>> {
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
  calculationTime: number;
  renderTime: number;
  renderingSmoothness: number;
  isRenderVelocity: boolean;
  vScaling: number;
  speeds: AutoAdvanceSpeeds[];
  autoAdvanceSpeed: AutoAdvanceSpeeds;
  autoAdvanceTimestamp: number;
  isFpsShown: boolean;
  currentFps: number;
  currentFpsCount: number;
  currentFpsStatus: string;
  isAutoAdvanceMode: boolean;
  toggleAutoAdvanceMode(): void;
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
  isPaused: boolean;
  togglePause(): void;
  startPause(reason: PauseStartReason): void;
  endPause(reason: PauseStartReason): void;
  resetRequest: ResetRequest | null;
  requestReset(immediateFeedback: boolean): void;
  particleEngine: ParticleEngine | null;
  useRNG: boolean;
  particleEngineConfig: ParticleEngineConfig | null;
  maxMultiplier: number;
  minMultiplier: number;
  initTracesPerFrame: number;
  maxTracesPerFrame: number;
  maxTotalTraces: number;
  currentMaxTotalTraces: number;
  reset(): void;
}

enum PauseStartReason {
  MAX_TRACES_DRAWN = "MAX_TRACES_DRAWN",
  PLAY_PAUSE_BUTTON_CLICKED = "PLAY_PAUSE_BUTTON_CLICKED",
  TAB_HIDDEN = "TAB_HIDDEN",
}
enum PauseEndReason {
  AUTO_ADVANCE_ENABLED = "AUTO_ADVANCE_ENABLED",
  PLAY_PAUSE_BUTTON_CLICKED = "PLAY_PAUSE_BUTTON_CLICKED",
  RESET_PERFORMED = "RESET_PERFORMED",
  RESET_REQUESTED = "RESET_REQUESTED",
  TAB_UNHIDDEN = "TAB_UNHIDDEN",
}

let animationFrameId: number | null = null;
export type AnimatedWindow = Window & typeof globalThis & { stopAnimation: boolean };
(window as AnimatedWindow).stopAnimation = false;

export function canvasComponent(this: CanvasComponent) {
  const canvas = this.$refs.canvas as HTMLCanvasElement;

  const component = {
    currentFpsSecond: null as number | null,
    lastFrameTime: 0,
    animate() {
      const canvasStore = Alpine.store("canvas") as CanvasStore;

      if (canvasStore.isPaused || (window as AnimatedWindow).stopAnimation) {
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
        }
        this.currentFpsSecond = null;
        canvasStore.currentFpsStatus = FpsStatus.NOT_COUNTING;
        return;
      }
      animationFrameId = requestAnimationFrame(() => this.animate());

      this.lastFrameTime = performance.now();

      const currentSecond = Math.floor(performance.now() / 1000);
      if (this.currentFpsSecond === null) {
        this.currentFpsSecond = currentSecond + 1;
        canvasStore.currentFpsCount = 0;
        canvasStore.currentFpsStatus = FpsStatus.ABOUT_TO_START;
      } else if (this.currentFpsSecond > currentSecond) {
        // Do nothing as this means that the current second should not be tracked
        canvasStore.currentFpsStatus = FpsStatus.ABOUT_TO_START;
        canvasStore.currentFpsCount = 0;
      } else if (this.currentFpsSecond < currentSecond) {
        if (this.currentFpsSecond === currentSecond - 1) {
          this.currentFpsSecond = currentSecond;
          canvasStore.currentFps = canvasStore.currentFpsCount;
          canvasStore.currentFpsCount = 0;

          // Determine the closest targetFps dynamically
          let minDeviation = Infinity;
          let targetFps = 60; // Default value

          for (const possibleFps of POSSIBLE_TARGET_FPS) {
            const deviation = canvasStore.currentFps - possibleFps;
            if (Math.abs(deviation) < Math.abs(minDeviation)) {
              minDeviation = deviation;
              targetFps = possibleFps - 1;
            }
          }

          // Calculate deviation based on the dynamically determined targetFps
          const deviation = minDeviation;

          const MAX_FPS = targetFps + 5;
          const MIN_FPS = targetFps - 5;

          if (canvasStore.currentFps < MIN_FPS) {
            canvasStore.currentFpsStatus = FpsStatus.BELOW_THRESHOLD;
          } else if (canvasStore.currentFps > MAX_FPS) {
            canvasStore.currentFpsStatus = FpsStatus.ABOVE_THRESHOLD;
          } else {
            canvasStore.currentFpsStatus = FpsStatus.WITHIN_THRESHOLD;
          }

          // Adjust tracesPerFrame based on deviation
          if (canvasStore.currentFpsStatus !== FpsStatus.WITHIN_THRESHOLD) {
            let newMaxTracesPerFrame = canvasStore.maxTracesPerFrame;
            newMaxTracesPerFrame *= 1 - (deviation / targetFps);

            // Ensure tracesPerFrame is within bounds
            canvasStore.maxTracesPerFrame = clamp(
              newMaxTracesPerFrame,
              MAX_TRACES_PER_FRAME[AutoAdvanceSpeeds.SLOW] * canvasStore.renderingSmoothness,
              MAX_TRACES_PER_FRAME[AutoAdvanceSpeeds.FAST] * canvasStore.renderingSmoothness,
            );
          }
        } else {
          this.currentFpsSecond = currentSecond + 1;
          canvasStore.currentFpsStatus = FpsStatus.ABOUT_TO_START;
          canvasStore.currentFpsCount = 0;
        }
      } else if (this.currentFpsSecond == currentSecond) {
        canvasStore.currentFpsCount++;
        // Do not update color
      }

      const ctx = canvas.getContext("2d")!;
      const bcr = canvas.getBoundingClientRect();
      if (canvasStore.resetRequest) {
        canvasStore.reset();
        ctx.fillStyle = canvas.style.backgroundColor;
        ctx.fillRect(0, 0, bcr.width, bcr.height);
      }

      const particleEngine = canvasStore.particleEngine;
      if (!particleEngine) return;

      ctx.fillStyle = particleEngine.getColor();
      const startCalculateTraces = performance.now();
      const tracesDrawn = particleEngine.calculateTraces(
        bcr.width,
        bcr.height,
        canvasStore.isWasmMode,
        canvasStore.maxTracesPerFrame,
        canvasStore.currentMaxTotalTraces
      );
      canvasStore.calculationTime = performance.now() - startCalculateTraces;

      if (tracesDrawn === -1) {
        canvasStore.requestReset(false);
      }

      if (canvasStore.isAutoAdvanceMode && Date.now() - canvasStore.autoAdvanceTimestamp >= AUTO_ADVANCE_DELAY[canvasStore.autoAdvanceSpeed]) {
        (Alpine.store("mnemonics") as MnemonicsStore).nextMnemonic();
      }

      if (tracesDrawn === 0) {
        if (canvasStore.isAutoAdvanceMode) {
          (Alpine.store("mnemonics") as MnemonicsStore).newMnemonic();
        } else {
          canvasStore.startPause(PauseStartReason.MAX_TRACES_DRAWN);
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
      canvasStore.renderTime = performance.now() - startDrawTraces;
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
      canvas.addEventListener("click", () => (Alpine.store("canvas") as CanvasStore).togglePause());

      document.body.addEventListener("keydown", (ev) => ev.key === "ArrowLeft" && ev.target === document.body && (Alpine.store("mnemonics") as MnemonicsStore).previousMnemonic());
      document.body.addEventListener("keydown", (ev) => ev.key === " " && ev.target === document.body && (Alpine.store("canvas") as CanvasStore).togglePause());
      document.body.addEventListener("keydown", (ev) => ev.key === "ArrowRight" && ev.target === document.body && (Alpine.store("mnemonics") as MnemonicsStore).nextMnemonic());

      document.addEventListener("visibilitychange", function () {
        if (document.hidden) {
          canvasStore.startPause(PauseStartReason.TAB_HIDDEN);
        } else {
          canvasStore.endPause(PauseEndReason.TAB_UNHIDDEN);
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
    speeds: Object.values(AutoAdvanceSpeeds),
    autoAdvanceSpeed: INITIAL_AUTO_ADVANCE_SPEED,
    renderingSmoothness: 1,
    isRenderVelocity: false,
    vScaling: Infinity,
    setRenderingSmoothness(smoothness: number) {
      this.renderingSmoothness = smoothness;
      this.maxTracesPerFrame = Math.min(PHYSICAL_MAX_TRACES_PER_FRAME, MAX_TRACES_PER_FRAME[this.autoAdvanceSpeed] * (this.renderingSmoothness > 1 ? this.renderingSmoothness * RENDERING_SMOOTHNESS_TRACES_FACTOR : 1));
      this.maxTotalTraces = MAX_TOTAL_TRACES_PER_FRAME[this.autoAdvanceSpeed] * (this.renderingSmoothness > 1 ? this.renderingSmoothness * RENDERING_SMOOTHNESS_TRACES_FACTOR : 1);
      this.currentMaxTotalTraces = MAX_TOTAL_TRACES_PER_FRAME[this.autoAdvanceSpeed] * (this.renderingSmoothness > 1 ? this.renderingSmoothness * RENDERING_SMOOTHNESS_TRACES_FACTOR : 1);
      this.maxMultiplier = 1.2 * smoothness*(1+smoothness/10);
      this.minMultiplier = 1.05 * smoothness*(1+smoothness/10);
    },
    setAutoAdvanceSpeed(speed: AutoAdvanceSpeeds) {
      if (!speed) return;
      this.autoAdvanceSpeed = speed;
      this.maxTracesPerFrame = MAX_TRACES_PER_FRAME[speed] * (this.renderingSmoothness > 1 ? this.renderingSmoothness * RENDERING_SMOOTHNESS_TRACES_FACTOR : 1);
      this.maxTotalTraces = MAX_TOTAL_TRACES_PER_FRAME[speed] * (this.renderingSmoothness > 1 ? this.renderingSmoothness * RENDERING_SMOOTHNESS_TRACES_FACTOR : 1);
      this.currentMaxTotalTraces = MAX_TOTAL_TRACES_PER_FRAME[speed] * (this.renderingSmoothness > 1 ? this.renderingSmoothness * RENDERING_SMOOTHNESS_TRACES_FACTOR : 1);
    },
    isFpsShown: isDevMode(),
    currentFps: 0,
    currentFpsCount: 0,
    currentFpsStatus: FpsStatus.NOT_COUNTING.toString(),
    isAutoAdvanceMode: !isDevMode(),
    toggleAutoAdvanceMode() {
      this.isAutoAdvanceMode = !this.isAutoAdvanceMode;
      if (this.isAutoAdvanceMode && this.isPaused) {
        this.endPause(PauseEndReason.AUTO_ADVANCE_ENABLED);
      }
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

    isPaused: false,
    pauseStartReason: null as PauseStartReason | null,
    togglePause() {
      if (this.isPaused) {
        this.endPause(PauseEndReason.PLAY_PAUSE_BUTTON_CLICKED);
      } else {
        this.startPause(PauseStartReason.PLAY_PAUSE_BUTTON_CLICKED);
      }
    },
    startPause(pauseStartReason: PauseStartReason) {
      if (this.isPaused) {
        return;
      }
      this.isPaused = true;
      this.pauseStartReason = pauseStartReason;
      component.$dispatch("pause-changed");
    },
    endPause(pauseEndReason: PauseEndReason) {
      if (!this.isPaused) {
        return;
      }

      const unpause = (startAnimation=true) => {
        this.autoAdvanceTimestamp = Date.now();
        this.isPaused = false;
        component.$dispatch("pause-changed");
        if (startAnimation) {
          component.animate();
        }
      };

      if (this.pauseStartReason === PauseStartReason.MAX_TRACES_DRAWN) {
        if (pauseEndReason === PauseEndReason.AUTO_ADVANCE_ENABLED) {
          (Alpine.store("mnemonics") as MnemonicsStore).nextMnemonic();
          unpause();
        } else if (pauseEndReason === PauseEndReason.PLAY_PAUSE_BUTTON_CLICKED) {
          this.currentMaxTotalTraces = Infinity;
          unpause();
        } else if (pauseEndReason === PauseEndReason.RESET_PERFORMED) {
          unpause(false);
        } else if (pauseEndReason === PauseEndReason.RESET_REQUESTED) {
          unpause();
        } else if (pauseEndReason === PauseEndReason.TAB_UNHIDDEN) {
          // Do not automatically start again if it was paused due to traces
        }
      }
      if (this.pauseStartReason === PauseStartReason.PLAY_PAUSE_BUTTON_CLICKED) {
        if (pauseEndReason === PauseEndReason.AUTO_ADVANCE_ENABLED) {
          // Do not automatically start again if it was paused by user previously
        } else if (pauseEndReason === PauseEndReason.PLAY_PAUSE_BUTTON_CLICKED) {
          unpause();
        } else if (pauseEndReason === PauseEndReason.RESET_PERFORMED) {
          unpause(false);
        } else if (pauseEndReason === PauseEndReason.RESET_REQUESTED) {
          unpause();
        } else if (pauseEndReason === PauseEndReason.TAB_UNHIDDEN) {
          // Do not automatically start again if it was paused by user previously
        }
      }
      if (this.pauseStartReason === PauseStartReason.TAB_HIDDEN) {
        if (pauseEndReason === PauseEndReason.TAB_UNHIDDEN) {
          unpause();
        }
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
      if (this.isPaused) {
        this.endPause(PauseEndReason.RESET_REQUESTED);
      }
    },

    particleEngine: null as ParticleEngine | null,
    useRNG: false,
    particleEngineConfig: null as ParticleEngineConfig | null,
    maxMultiplier: 1.2,
    minMultiplier: 1.05,
    initTracesPerFrame: 2,
    maxTracesPerFrame: MAX_TRACES_PER_FRAME[INITIAL_AUTO_ADVANCE_SPEED],
    maxTotalTraces: MAX_TOTAL_TRACES_PER_FRAME[INITIAL_AUTO_ADVANCE_SPEED],
    currentMaxTotalTraces: MAX_TOTAL_TRACES_PER_FRAME[INITIAL_AUTO_ADVANCE_SPEED],
    setMaxTotalTraces(newMaxTotalTraces: number) {
      this.currentMaxTotalTraces = newMaxTotalTraces;
      this.maxTotalTraces = newMaxTotalTraces;
    },
    autoAdvanceTimestamp: 0,
    reset() {
      if (!traces) return;
      const bcr = canvas.getBoundingClientRect();
      const minCanvasDimension = Math.min(bcr.width, bcr.height);
      const particleConfig = new ParticleConfig(
        new Point(bcr.width, bcr.height).scale(0.5),
        this.isShapesMode,
        (minCanvasDimension / (100000 + (1 - this.zoom) * 3000000)) * (this.isShapesMode ? 3 : 7),
        (Alpine.store("seed") as SeedStore).seed,
        this.useRNG
      );

      this.currentMaxTotalTraces = this.maxTotalTraces;
      this.particleEngineConfig = new ParticleEngineConfig(
        this.maxMultiplier,
        this.minMultiplier,
        this.initTracesPerFrame,
        particleConfig,
        !!this.resetRequest?.immediateFeedback,
      );

      this.particleEngine = new ParticleEngine(this.particleEngineConfig);
      this.resetRequest = null;

      this.vScaling = Infinity;
      this.autoAdvanceTimestamp = Date.now();
    },
  };
  Alpine.store("canvas", canvasStore);
  return component;
}
