import {XComponent } from "../../XComponent";
import template from "./ToggleSwitch.html?raw";

export function toggleSwitchFactory() {
  function toggleSwitchComponent() {
    return {};
  }

  return new XComponent(template, "toggle-switch", toggleSwitchComponent);
}
