import Alpine from "alpinejs";

const _inactivityTrackerStore = {
  isActive: true,
};

Alpine.store("inactivityTracker", _inactivityTrackerStore);

export const inactivityTrackerStore: typeof _inactivityTrackerStore = Alpine.store("inactivityTracker") as typeof _inactivityTrackerStore;
