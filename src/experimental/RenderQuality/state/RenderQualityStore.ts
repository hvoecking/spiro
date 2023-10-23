import Alpine from "alpinejs";
import { resetHandler } from "../../../core/services/ResetHandler";
import { particleEngineStore } from "../../../features/ParticleEngine/state/ParticleEngineStore";
import { advancerStore } from "../../../features/AutoAdvancer/state/AdvancerStore";

const _store = {
  isRenderVelocity: false,
  vScaling: Infinity,
  quality: 1,
  toggleRenderVelocityMode() {
    this.isRenderVelocity = !this.isRenderVelocity;
    resetHandler.requestReset(false);
  },
  setRenderingQuality(quality: number) {
    this.quality = quality;
    particleEngineStore.adjustToRenderingQuality(
      quality,
      advancerStore.autoAdvanceSpeed
    );
  },
};

Alpine.store("renderQuality", _store);

export const renderQualityStore = Alpine.store("renderQuality") as typeof _store;
