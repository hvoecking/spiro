import template from "./DarkModeToggleSwitch.html?raw";
import { XComponent } from "../../../lib/XComponent";

export function darkModeToggleSwitchFactory() {
  function darkModeToggleSwitchComponent() {
    return {};
  }
  return new XComponent(template, "dark-mode-toggle-switch", darkModeToggleSwitchComponent);
}
