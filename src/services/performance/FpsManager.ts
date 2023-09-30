import { dispatch } from "../../Utilities";
import FpsStatus from "./FpsStatus";
import { performanceStore } from "./PerformanceStore";

// Possible target FPS values
const POSSIBLE_TARGET_FPS = [30, 60, 120];

export class FpsManager {

  currentFpsSecond = null as number | null;
  lastFrameTime = 0;

  constructor() {
  }

  calculateAdjustment(): number {
    let adjustment = 1;
    this.lastFrameTime = performance.now();

    const currentSecond = Math.floor(performance.now() / 1000);
    if (this.currentFpsSecond === null) {
      this.currentFpsSecond = currentSecond + 1;
      performanceStore.currentFpsCount = 0;
      performanceStore.fpsStatus = FpsStatus.ABOUT_TO_START;
    } else if (this.currentFpsSecond > currentSecond) {
      // Do nothing as this means that the current second should not be tracked
      performanceStore.fpsStatus = FpsStatus.ABOUT_TO_START;
      performanceStore.currentFpsCount = 0;
    } else if (this.currentFpsSecond < currentSecond) {
      if (this.currentFpsSecond === currentSecond - 1) {
        this.currentFpsSecond = currentSecond;
        performanceStore.currentFps = performanceStore.currentFpsCount;
        performanceStore.currentFpsCount = 0;

        // Determine the closest targetFps dynamically
        let minDeviation = Infinity;
        let targetFps = 60; // Default value

        for (const possibleFps of POSSIBLE_TARGET_FPS) {
          const deviation = performanceStore.currentFps - possibleFps;
          if (Math.abs(deviation) < Math.abs(minDeviation)) {
            minDeviation = deviation;
            targetFps = possibleFps - 1;
          }
        }

        // Calculate deviation based on the dynamically determined targetFps
        const deviation = minDeviation;

        const MAX_FPS = targetFps + 5;
        const MIN_FPS = targetFps - 5;

        if (performanceStore.currentFps < MIN_FPS) {
          performanceStore.fpsStatus = FpsStatus.BELOW_THRESHOLD;
        } else if (performanceStore.currentFps > MAX_FPS) {
          performanceStore.fpsStatus = FpsStatus.ABOVE_THRESHOLD;
        } else {
          performanceStore.fpsStatus = FpsStatus.WITHIN_THRESHOLD;
        }

        // Adjust tracesPerFrame based on deviation
        if (performanceStore.fpsStatus !== FpsStatus.WITHIN_THRESHOLD) {
          adjustment = 1 - (deviation / targetFps);
        }
      } else {
        this.currentFpsSecond = currentSecond + 1;
        performanceStore.fpsStatus = FpsStatus.ABOUT_TO_START;
        performanceStore.currentFpsCount = 0;
      }
    } else if (this.currentFpsSecond == currentSecond) {
      performanceStore.currentFpsCount++;
      // Do not update color
    }
    dispatch("fps-update");
    return adjustment;
  }

  startPause() {
    this.currentFpsSecond = null;
    performanceStore.fpsStatus = FpsStatus.NOT_COUNTING;
  }
}
