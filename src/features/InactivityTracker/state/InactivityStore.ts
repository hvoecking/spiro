import Alpine from "alpinejs";

const _store = {
  isActive: true,
};

Alpine.store("inactivityTracker", _store);

export const inactivityTrackerStore = Alpine.store("inactivityTracker") as typeof _store;
