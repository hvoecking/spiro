import Alpine from "alpinejs";

const _developerConfigStore = {
  isOpen: false,
};

Alpine.store("developerConfig", _developerConfigStore);

export const developerConfigStore: typeof _developerConfigStore = Alpine.store("developerConfig") as typeof _developerConfigStore;
