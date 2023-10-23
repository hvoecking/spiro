import Alpine from "alpinejs";

const _store = {
  calculationTime: 0,
  renderTime: 0,
};

Alpine.store("animation", _store);

export const animationStore = Alpine.store("animation") as typeof _store;
