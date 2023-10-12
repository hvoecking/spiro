import Alpine from "alpinejs";

const _aboutStore = {
  isOpen: false,
};

Alpine.store("about", _aboutStore);

export const aboutStore: typeof _aboutStore = Alpine.store("about") as typeof _aboutStore;
