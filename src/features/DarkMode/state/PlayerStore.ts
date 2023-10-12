import Alpine from "alpinejs";

const _darkModeStore = {
  isDarkMode: window.matchMedia("(prefers-color-scheme: dark)").matches,
  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
  },
};

Alpine.store("darkMode", _darkModeStore);

export const darkModeStore: typeof _darkModeStore = Alpine.store("darkMode") as typeof _darkModeStore;
