import Alpine from "alpinejs";

const _store = {
  isOpen: false,
};

Alpine.store("about", _store);

export const aboutStore = Alpine.store("about") as typeof _store;
