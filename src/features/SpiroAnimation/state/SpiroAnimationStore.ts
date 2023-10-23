import Alpine from "alpinejs";

const _store = {
  hasStarted: false,
};

Alpine.store("spiroAnimation", _store);

export const spiroAnimationStore = Alpine.store("spiroAnimation") as typeof _store;
