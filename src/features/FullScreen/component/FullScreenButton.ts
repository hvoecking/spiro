import template from "./FullScreenButton.html?raw";
import { XComponent } from "../../../lib/XComponent";
import { fullScreenHandler } from "../service/FullScreenHandler";

export function fullScreenButtonFactory() {
  function component() {
    return {
      isFullScreen: false,
      init() {
        document.addEventListener("keydown", (event) => {
          // Check if the pressed key is 'f'
          if (event.key !== "f" && event.key !== "F") return;

          // Check if the currently focused element is not a text input
          const activeElement = document.activeElement;
          if (!activeElement) return;
          if (activeElement.tagName === "INPUT") return;
          if (activeElement.getAttribute("type") === "text") return;

          // It's not a text input, so toggle full screen
          fullScreenHandler.toggleFullScreen();
        });

        document.addEventListener("fullscreenchange", () => {
          this.isFullScreen = fullScreenHandler.isFullScreen();
        });
      },
    };
  }
  return new XComponent(template, "full-screen-button", component);
}
