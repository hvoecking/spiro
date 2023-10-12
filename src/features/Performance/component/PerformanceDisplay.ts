import template from "./PerformanceDisplay.html?raw";
import { XComponent } from "../../../lib/XComponent";
import { performanceStore } from "../state/PerformanceStore";
import { particleEngineStore } from "../../ParticleEngine/state/ParticleEngineStore";
import { advancerStore } from "../../AutoAdvancer/state/AdvancerStore";
import { zoomStore } from "../../Zoom/state/ZoomStore";

export function performanceDisplayFactory() {
  function performanceDisplayComponent() {
    return {
      calculationTime: "",
      elapsedSeconds: "",
      fps: "",
      frameCount: "",
      maxTotalTraces: "",
      maxTracesPerFrame: "",
      renderTime: "",
      totalTraces: "",
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
        this.zoom = (zoomStore.zoom * 100).toFixed();
      }
    };
  }
  return new XComponent(template, "performance-display", performanceDisplayComponent);
}
