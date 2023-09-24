import template from "./ToggleSwitch.html?raw";
import { XComponent, XAlpineComponent } from "../XComponent";

interface ToggleSwitchComponent extends XAlpineComponent {
}

export function toggleSwitchComponent(this: ToggleSwitchComponent) {
  return {
  };
}

export const toggleSwitch = new XComponent(template, "toggle-switch", toggleSwitchComponent);
