import "./style.css";
import Alpine, { AlpineComponent } from "alpinejs";

import { CanvasStore, canvasComponent } from "./components/Canvas";
import { seedComponent } from "./components/Seed";
import { mnemonicsComponent } from "./components/Mnemonics";
import fpsDisplay from "../html/fps-display.html?raw";
import { isDevMode } from "./Utilities";
import { shareButtonComponent } from "./components/ShareButton/ShareButton";

type AlpineWindow = Window & typeof globalThis & { Alpine: typeof Alpine };

(window as AlpineWindow).Alpine = Alpine;

function generateToggle(
  breakout: boolean,
  func: string,
  hint = "",
  iconLeft = "",
  iconRight = "",
  id: string,
  label: string,
  model: string,
  textLeft = "",
  textRight = "",
) {
  return `
  <div class="p-2 text-white bg-gray-700 flex items-center justify-between">
    <div>
      <p>${label}</p>
      <p class="text-zinc-400 text-[11px]" x-text="${hint}"></p>
    </div>
    <div :class="{ 'opacity-0': !isActive && !$store.sideMenu.isOpen, 'opacity-80 hover:opacity-100': isActive && !$store.sideMenu.isOpen, '-left-full slide-in': ${breakout} }" class="transition-all duration-200 ease-in">
      <div
        :class="{
          '-left-full': ${breakout} && !initAnimationStarted,
          'translate-x-[4.25rem]': ${breakout} && (!$store.sideMenu.isOpen && initAnimationStarted),
          'relative': !${breakout} || ($store.sideMenu.isOpen && initAnimationStarted),
          'slide-in': ${breakout},
        }"
        class="inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in overflow-visible"
      >
        <input type="checkbox" id="${id}" name="${id}" class="toggle-checkbox hidden" @click="${func}" x-model="${model}">
        <label
          :class="{
            'bg-transparent border color-black': !$store.sideMenu.isOpen,
            'bg-gray-600': $store.sideMenu.isOpen,
          }"
          for="${id}" class="toggle-label block overflow-hidden h-6 rounded-full bg-gray-600 cursor-pointer duration-200 ease-in transition-full">
          <span class="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition" :class="{'translate-x-4': ${model}}">
            <div
              :class="{'${iconLeft}': !${model}, '${iconRight}': ${model}}"
              class="text-black text-[11px] flex items-center justify-center w-2 h-2 m-1"
              x-text="${model} ? '${textRight}' : '${textLeft}'"
            ></div>
          </span>
        </label>
      </div>
    </div>
  </div>
  `;
}

document.addEventListener("DOMContentLoaded", () => {
  const toggleContainers = document.querySelectorAll(".toggle-container");

  toggleContainers.forEach((container: Element) => {
    const breakout = container.getAttribute("data-breakout") === "true";
    const func = container.getAttribute("data-function") || "";
    const hint = container.getAttribute("data-hint") || "";
    const iconLeft = container.getAttribute("data-icon-left") || "";
    const iconRight = container.getAttribute("data-icon-right") || "";
    const id = container.getAttribute("data-id") || "";
    const label = container.getAttribute("data-label") || "";
    const model = container.getAttribute("data-model") || "";
    const textLeft = container.getAttribute("data-text-left") || "";
    const textRight = container.getAttribute("data-text-right") || "";

    container.innerHTML = generateToggle(
      breakout,
      func,
      hint,
      iconLeft,
      iconRight,
      id,
      label,
      model,
      textLeft,
      textRight,
    );
  });
});

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
Alpine.data("shareButtonComponent", shareButtonComponent);
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
      this.isActive = wasActive || isOpen || isPaused;
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
      // chevron animation takes 300ms. We want a delay that makes both to end at the
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
  isFullScreen: boolean;
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
    isFullScreen: false,
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
