import template from "./FpsDisplay.html?raw";
import { XComponent, XAlpineComponent } from "../XComponent";

interface FpsDisplayComponent extends XAlpineComponent {
  copied: boolean;
  copyURL(): void;
}

export function fpsDisplayComponent(this: FpsDisplayComponent) {
  return {
  };
}

export const fpsDisplay = new XComponent(template, "fps-display", fpsDisplayComponent);
