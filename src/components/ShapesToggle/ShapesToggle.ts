import template from "./PlayerToggle.html?raw";
import { XComponent, XAlpineComponent } from "../XComponent";
import { shapesStore } from "../../state/ShapsStore";
import { resetHandler } from "../../services/reset/ResetHandler";

interface PlayerToggleComponent extends XAlpineComponent {
}

function shapesToggleComponent(this: PlayerToggleComponent) {
  return {
    toggleShapesMode() {
      shapesStore.isShapesMode = !shapesStore.isShapesMode;
      resetHandler.requestReset(false);
    },
  };
}
export const shapesToggle = new XComponent(template, "shapes-toggle", shapesToggleComponent);
