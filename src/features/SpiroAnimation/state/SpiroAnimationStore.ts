import Alpine from "alpinejs";

const _spiroAnimationStore = {
  hasStarted: false,
};

Alpine.store("spiroAnimation", _spiroAnimationStore);

export const spiroAnimationStore: typeof _spiroAnimationStore = Alpine.store("spiroAnimation") as typeof _spiroAnimationStore;
