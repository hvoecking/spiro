import Alpine from "alpinejs";

const _playerStore = {
  isPaused: false,
};

Alpine.store("player", _playerStore);

export const playerStore: typeof _playerStore = Alpine.store("player") as typeof _playerStore;
