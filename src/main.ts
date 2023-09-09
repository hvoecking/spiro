import "./style.css";

import Alpine from "alpinejs";

import { chevronComponent, sideMenuComponent } from "./components/SideMenu";

window.Alpine = Alpine;

Alpine.data("chevronComponent", chevronComponent);
Alpine.data("sideMenuComponent", sideMenuComponent);
Alpine.data("initAlpine", initAlpine);
Alpine.start();

export function initAlpine() {
  return {
    isFullScreen: false,
    initAnimationTriggered: false,

    $refs: {
      canvas: HTMLElement,
      chevron: HTMLElement,
      sideMenu: HTMLElement,
      spiroName: HTMLElement,
    },

    init() {
      setTimeout(() => {
        this.initAnimationTriggered = true;
        const spacing = Math.min(100, window.innerWidth / 2 / "spiro".length);
        this.$refs.spiroName.style["letter-spacing"] = `var(--tracking, ${spacing}px)`;
      }, 500);
    },
  };
}
