import Alpine from "alpinejs";
import { resetHandler } from "../../../core/services/ResetHandler";
import { particleEngineStore } from "../../../features/ParticleEngine/state/ParticleEngineStore";
import { advancerStore } from "../../../features/AutoAdvancer/state/AdvancerStore";

const _renderSmoothnessStore = {
  isRenderVelocity: false,
  vScaling: Infinity,
  renderingSmoothness: 1,
  toggleRenderVelocityMode() {
    this.isRenderVelocity = !this.isRenderVelocity;
    resetHandler.requestReset(false);
  },
  setRenderingSmoothness(smoothness: number) {
    this.renderingSmoothness = smoothness;
    particleEngineStore.adjustToRenderingSmoothness(
      smoothness,
      advancerStore.autoAdvanceSpeed
    );
  },
};

Alpine.store("renderSmoothness", _renderSmoothnessStore);

export const renderSmoothnessStore: typeof _renderSmoothnessStore = Alpine.store("renderSmoothness") as typeof _renderSmoothnessStore;
