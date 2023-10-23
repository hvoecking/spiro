import Alpine from "alpinejs";

const _store = {
  isPaused: false,
};

Alpine.store("player", _store);

export const playerStore: typeof _store = Alpine.store("player") as typeof _store;
