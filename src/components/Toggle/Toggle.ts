import template from "./Toggle.html?raw";
import { XComponent, XAlpineComponent } from "../XComponent";

interface ToggleComponent extends XAlpineComponent {
}

export function toggleComponent(this: ToggleComponent) {
  return {
  };
}

export const toggle = new XComponent(template, "toggle", toggleComponent);
