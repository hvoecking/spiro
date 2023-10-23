import Alpine from "alpinejs";
import { dispatch } from "../../../lib/Event";
import { resetHandler } from "../../../core/services/ResetHandler";

export type Seed = string[];

const _store = {
  isOpen: false,
  seed: [] as Seed,
  setSeed(seed: Seed, immediateFeedback: boolean) {
    this.seed = seed;
    Alpine.nextTick(() => {
      dispatch("update-seed");
      resetHandler.requestReset(immediateFeedback);
    });
  },
};
Alpine.store("seed", _store);

export const seedStore = Alpine.store("seed") as typeof _store;
