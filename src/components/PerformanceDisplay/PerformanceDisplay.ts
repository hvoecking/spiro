import template from "./PerformanceDisplay.html?raw";
import { XComponent, XAlpineComponent } from "../XComponent";
import { performanceStore } from "../../services/performance/PerformanceStore";
import { particleEngineStore } from "../../ParticleEngineStore";
import { CanvasStore } from "../Canvas";
import { advancerStore } from "../../services/advance/AdvancerStore";

interface PerformanceDisplayComponent extends XAlpineComponent {
  fps: string;
  maxTraces: string;
  timings: string;
  totalTraces: string;
  elapsedSeconds: string;
  totalTracesPerSecond: string;
  zoom: number;
}

export function performanceDisplayComponent(this: PerformanceDisplayComponent) {
  return {
    frameCount: "",
    fps: "",
    maxTracesPerFrame: "",
    calculationTime: "",
    renderTime: "",
    totalTraces: "",
    maxTotalTraces: "",
    elapsedSeconds: "",
    totalTracesPerSecond: "",
    zoom: "",
    update() {
      this.frameCount = `${(performanceStore.currentFpsCount < 10 ? "0" : "")}${performanceStore.currentFpsCount}`;
      this.fps = String(performanceStore.currentFps);
      this.maxTracesPerFrame = particleEngineStore.maxTracesPerFrame.toFixed(0);
      this.calculationTime = performanceStore.calculationTime.toFixed(2);
      this.renderTime = performanceStore.renderTime.toFixed(2);
      if (particleEngineStore.totalTraces) {
        this.totalTraces = (particleEngineStore.totalTraces / particleEngineStore.maxTotalTraces * 100).toFixed(0);
        this.maxTotalTraces = (particleEngineStore.maxTotalTraces/1000).toFixed(0);
        this.elapsedSeconds = ((Date.now() - advancerStore.autoAdvanceTimestamp)/1000).toFixed(2);
        this.totalTracesPerSecond = (particleEngineStore.totalTraces / ((Date.now() - advancerStore.autoAdvanceTimestamp))).toFixed(0);
      } else {
        this.totalTraces = "";
        this.maxTotalTraces = "";
        this.elapsedSeconds = "";
        this.totalTracesPerSecond = "";
      }
      this.zoom = ((Alpine.store("canvas") as CanvasStore).zoom * 100).toFixed();
    }
  };
}

export const performanceDisplay = new XComponent(template, "performance-display", performanceDisplayComponent);
