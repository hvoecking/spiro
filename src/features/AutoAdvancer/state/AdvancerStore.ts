import Alpine from "alpinejs";
import { dispatch } from "../../../lib/Event";
import { resetHandler } from "../../../core/services/ResetHandler";
import { config } from "../../../config/config";

export enum AutoAdvanceSpeeds {
  SLOW = "slow",
  MEDIUM = "medium",
  FAST = "fast",
}

export const INITIAL_AUTO_ADVANCE_SPEED = AutoAdvanceSpeeds.MEDIUM;

export const AUTO_ADVANCE_DELAY = {
  [AutoAdvanceSpeeds.SLOW]: 16 * 1000,
  [AutoAdvanceSpeeds.MEDIUM]: 8 * 1000,
  [AutoAdvanceSpeeds.FAST]: config.autoAdvanceDelaySeconds * 1000,
};


const _store = {
  speeds: Object.values(AutoAdvanceSpeeds),
  autoAdvanceSpeed: INITIAL_AUTO_ADVANCE_SPEED,
  isAutoAdvanceMode: config.defaultIsAutoAdvanceMode,
  autoAdvanceTimestamp: Date.now(),

  reset() {
    this.autoAdvanceTimestamp = Date.now();
  },

  toggleAutoAdvanceMode() {
    advancerStore.isAutoAdvanceMode = !advancerStore.isAutoAdvanceMode;
    dispatch("auto-advance-mode-changed");
  },
};

Alpine.store("advancer", _store);

export const advancerStore = Alpine.store("advancer") as typeof _store;
resetHandler.registerListener(() => advancerStore.reset());
