import Alpine from "alpinejs";

const _store = {
  isOpen: false,
};

Alpine.store("developerConfig", _store);

export const developerConfigStore = Alpine.store("developerConfig") as typeof _store;
