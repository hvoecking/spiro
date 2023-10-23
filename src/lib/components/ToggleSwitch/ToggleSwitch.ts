import {XComponent } from "../../XComponent";
import template from "./ToggleSwitch.html?raw";

export function toggleSwitchFactory() {
  function component() {
    return {};
  }

  return new XComponent(template, "toggle-switch", component);
}
