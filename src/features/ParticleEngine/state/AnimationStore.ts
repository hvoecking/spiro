import Alpine from "alpinejs";

const _animationStore = {
  calculationTime: 0,
  renderTime: 0,
};

Alpine.store("animation", _animationStore);

export const animationStore: typeof _animationStore = Alpine.store("animation") as typeof _animationStore;
