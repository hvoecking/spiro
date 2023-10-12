import "./config/style.css";
import Alpine from "alpinejs";

import { addAlpineToWindow } from "./lib/Alpine";
import { performanceDisplayFactory } from "./features/Performance/component/PerformanceDisplay";
import { addComponent, getXComponents, registerXComponent } from "./lib/XComponent";
import { FpsManager } from "./features/Performance/service/FpsManager";
import { playerInterfaceFactory } from "./features/Player/component/PlayerInterface";
import { Player } from "./features/Player/service/Player";
import { advanceSpeedSelectorFactory } from "./features/AutoAdvancer/component/AdvanceSpeedSelector";
import { ParticleEngine } from "./features/ParticleEngine/service/ParticleEngine";
import { CalculationState } from "./features/ParticleEngine/state/CalculationState";
import { zoomSliderFactory } from "./features/Zoom/component/ZoomSlider";
import { fullScreenButtonFactory } from "./features/FullScreen/component/FullScreenButton";
import { fullScreenHandler } from "./features/FullScreen/service/FullScreenHandler";
import { AutoAdvancer } from "./features/AutoAdvancer/service/Advancer";
import { shareButtonFactory } from "./lib/components/ShareButton/ShareButton";
import { toggleSwitchFactory } from "./lib/components/ToggleSwitch/ToggleSwitch";
import { config } from "./config/config";
import { seedMenuFactory } from "./experimental/Seed/component/SeedMenu";
import { dispatch } from "./lib/Event";
import { particleEngineCanvasFactory } from "./features/ParticleEngine/component/ParticleEngineCanvas";
import { playerGhostImageAnimationFactory } from "./features/Player/component/PlayerGhostImageAnimation";
import { aboutModalFactory } from "./features/About/component/AboutModal";
import { aboutStore } from "./features/About/state/AboutStore";
import { inactivityTrackerFactory } from "./features/InactivityTracker/component/InactivityTracker";
import { darkModeStore } from "./features/DarkMode/state/PlayerStore";
import { darkModeToggleSwitchFactory } from "./features/DarkMode/component/DarkModeToggleSwitch";
import { spiroAnimationFactory } from "./features/SpiroAnimation/component/SpiroAnimation";
import { toastRackFactory } from "./features/Toaster/component/ToastRack";
import { developerModalFactory } from "./features/DeveloperConfig/component/DeveloperModal";

if (config.appMode !== "production") {
  console.warn("config:", config);
  // TOOD: Remove these as soon as stores are used somewhere
  console.warn(aboutStore.isOpen);
  console.warn(darkModeStore.isDarkMode);
}

const player = new Player();
const fpsManager = new FpsManager();
const advancer = new AutoAdvancer(player);
const stateHandler = new CalculationState(ParticleEngine.calculateTracesFunction);
const particleEngine = new ParticleEngine(stateHandler);

addAlpineToWindow();

addComponent(aboutModalFactory());
addComponent(advanceSpeedSelectorFactory(advancer));
addComponent(darkModeToggleSwitchFactory());
addComponent(developerModalFactory());
addComponent(fullScreenButtonFactory());
addComponent(inactivityTrackerFactory());
addComponent(particleEngineCanvasFactory(fpsManager, player, particleEngine));
addComponent(performanceDisplayFactory());
addComponent(playerGhostImageAnimationFactory());
addComponent(playerInterfaceFactory(player));
if (config.enableSeedComponent) {
  addComponent(seedMenuFactory());
}
addComponent(shareButtonFactory());
addComponent(spiroAnimationFactory());
addComponent(toastRackFactory());
addComponent(toggleSwitchFactory());
addComponent(zoomSliderFactory());

Alpine.data("documentComponent", () => {
  return {
    config,
    fullScreenHandler,

    init() {
      window.addEventListener("touchmove", preventDefault, { passive: false });
      function preventDefault(e: TouchEvent) {
        e.preventDefault();
      }
      document.addEventListener("keydown", ev => ev.key === "Escape" && dispatch("escape"));
    },
  };
});

Alpine.start();

document.addEventListener("DOMContentLoaded", () => {
  getXComponents().forEach(c => registerXComponent(c));
});

document.addEventListener("shutdown", () => {
  document.body.childNodes.forEach(node => {
    node.remove();
  });
});
