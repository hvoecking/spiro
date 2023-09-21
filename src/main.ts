import "./style.css";
import Alpine, { AlpineComponent } from "alpinejs";

import { CanvasStore, canvasComponent } from "./components/Canvas";
import { seedComponent } from "./components/Seed";
import { mnemonicsComponent } from "./components/Mnemonics";
import fpsDisplay from "../html/fps-display.html?raw";
import { isDevMode, isTestMode } from "./Utilities";
import { shareButton } from "./components/ShareButton/ShareButton";
import { toggle } from "./components/Toggle/Toggle";
import { getXComponents, registerXComponent } from "./components/XComponent";

type AlpineWindow = Window & typeof globalThis & { Alpine: typeof Alpine };

(window as AlpineWindow).Alpine = Alpine;


function ghostImageComponent() {
  return {
    showGhostImage: false,
    triggerGhostImage() {
      this.showGhostImage = true;
      setTimeout(() => {
        this.showGhostImage = false;
      }, 100);
    }
  };
}
Alpine.data("ghostImageComponent", ghostImageComponent);
Alpine.data("canvasComponent", canvasComponent);
Alpine.data("globalSettings", globalSettings);
Alpine.data("initAlpine", initAlpine);
Alpine.data("mnemonicsComponent", mnemonicsComponent);
Alpine.data("seedComponent", seedComponent);
Alpine.data("shareButtonComponent", shareButton.alpineComponent);
Alpine.data("toggleComponent", toggle.alpineComponent);

export interface SideMenuStore {
  isOpen: boolean;
  toggle(): void;
  close(): void;
}
Alpine.store("sideMenu", {
  isOpen: false,
  isAdvancedMenuOpen: isDevMode(),
  isExperimentalMenuOpen: isDevMode(),
});
// about component
Alpine.store("about", {
  isOpen: false,
});
Alpine.start();

function importHtml(name: string, content: string) {
  const element = document.getElementById(name);
  if (!element) throw new Error(`Element with id ${name} not found`);
  element.innerHTML = content;
}

importHtml("fps-display", fpsDisplay);

interface GlobalSettings {
  isDarkMode: boolean;
  toggleDarkMode(): void;
  lastActivityTime: number;
  isActive: boolean;
  checkActivity(): void;
  reportActivity(): void;
  initAnimationStarted: boolean;
  init(): void;
}

let wakeLock: WakeLockSentinel | null = null;
const requestWakeLock = async () => {
  try {
    wakeLock = await navigator.wakeLock.request("screen");
    wakeLock.addEventListener("release", () => {
    });
  } catch (e: unknown) {
    const err = e as Error;
    console.error(`Could not obtain wake lock: ${err.name}, ${err.message}`);
  }
};

// Function to release the wake lock
const releaseWakeLock = () => {
  if (wakeLock !== null) {
    wakeLock.release();
    wakeLock = null;
  }
};

export function globalSettings(this: GlobalSettings) {
  const INACTIVITY_TIMEOUT = 2000;
  return {
    isDarkMode: window.matchMedia("(prefers-color-scheme: dark)").matches,
    toggleDarkMode() {
      this.isDarkMode = !this.isDarkMode;
    },

    lastActivityTime: Date.now(),
    isActive: true,
    checkActivity() {
      const wasActive = Date.now() - this.lastActivityTime < INACTIVITY_TIMEOUT;
      const isOpen = (Alpine.store("sideMenu") as SideMenuStore).isOpen;
      const isPaused = (Alpine.store("canvas") as CanvasStore).isPaused;
      this.isActive = wasActive || isOpen || isPaused || isTestMode();
      if (this.isActive) {
        releaseWakeLock();
      } else {
        requestWakeLock();
      }
    },

    reportActivity() {
      this.lastActivityTime = Date.now();
      this.checkActivity();
    },

    initAnimationStarted: false,

    init() {
      // The init animation starts at 500ms and takes another 700ms to complete. The
      // slide-in animation takes 300ms. We want a delay that makes both to end at the
      // same time.
      const delay = 500 + 700 - 300;
      setTimeout(() => this.initAnimationStarted = true, delay);

      // Consider these events as activity
      document.addEventListener("mousemove", () => {
        this.reportActivity();
      });
      // document.addEventListener("keydown", () => {
      //  this.reportActivity();
      // });
      document.addEventListener("click", () => {
        this.reportActivity();
      });

      // Kick off the activity check
      const checkActivity = () => this.checkActivity();
      function activityLoop() {
        setTimeout(() => {
          checkActivity();
          activityLoop();
        }, INACTIVITY_TIMEOUT);
      }
      activityLoop();
    },
  };
}

interface InitAlpineComponent extends AlpineComponent<Record<string | symbol, unknown>> {
  initAnimationTriggered: boolean;
  $refs: {
    canvas: HTMLElement;
    chevron: HTMLElement;
    sideMenu: HTMLElement;
    initAnimation: HTMLElement;
  };
  init(): void;
  $dispatch(event: string): void;
}

export function initAlpine(this: InitAlpineComponent): InitAlpineComponent {
  return {
    initAnimationTriggered: false,

    init() {
      setTimeout(() => {
        this.initAnimationTriggered = true;
        const spacing = Math.min(50, window.innerWidth / 2 / "SPIRO".length);
        this.$refs.initAnimation.style.setProperty("letter-spacing", `var(--tracking, ${spacing}px)`);
      }, 500);

      window.addEventListener("touchmove", preventDefault, { passive: false });
      function preventDefault(e: TouchEvent) {
        e.preventDefault();
      }
      document.addEventListener("keydown", ev => ev.key === "Escape" && this.$dispatch("escape"));
    },
  } as InitAlpineComponent;
}

document.addEventListener("DOMContentLoaded", () => {
  getXComponents().forEach(c => registerXComponent(c));
});
