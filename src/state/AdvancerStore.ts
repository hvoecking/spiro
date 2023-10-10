import Alpine from "alpinejs";
import { dispatch, isDevMode, isTestMode } from "../Utilities";
import { resetHandler } from "../services/reset/ResetHandler";

export enum AutoAdvanceSpeeds {
  SLOW = "slow",
  MEDIUM = "medium",
  FAST = "fast",
}

export const INITIAL_AUTO_ADVANCE_SPEED = AutoAdvanceSpeeds.MEDIUM;

export const AUTO_ADVANCE_DELAY = {
  [AutoAdvanceSpeeds.SLOW]: 16 * 1000,
  [AutoAdvanceSpeeds.MEDIUM]: 8 * 1000,
  [AutoAdvanceSpeeds.FAST]: (isTestMode() ? 0 : 4) * 1000,
};


const _advancerStore = {
  speeds: Object.values(AutoAdvanceSpeeds),
  autoAdvanceSpeed: INITIAL_AUTO_ADVANCE_SPEED,
  isAutoAdvanceMode: !isDevMode(),
  autoAdvanceTimestamp: Date.now(),

  reset() {
    this.autoAdvanceTimestamp = Date.now();
  },

  toggleAutoAdvanceMode() {
    advancerStore.isAutoAdvanceMode = !advancerStore.isAutoAdvanceMode;
    dispatch("auto-advance-mode-changed");
  },
};

Alpine.store("advancer", _advancerStore);

export const advancerStore: typeof _advancerStore = Alpine.store("advancer") as typeof _advancerStore;
resetHandler.registerListener(() => advancerStore.reset());
