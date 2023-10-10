import Alpine from "alpinejs";

const _shapesStore = {
  isShapesMode: false,
};

Alpine.store("shapes", _shapesStore);

export const shapesStore: typeof _shapesStore = Alpine.store("shapes") as typeof _shapesStore;
