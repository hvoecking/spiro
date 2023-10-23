import Alpine from "alpinejs";

const _store = {
  isDarkMode: window.matchMedia("(prefers-color-scheme: dark)").matches,
  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
  },
};

Alpine.store("darkMode", _store);

export const darkModeStore = Alpine.store("darkMode") as typeof _store;
