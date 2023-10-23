import template from "./AboutModal.html?raw";
import { XComponent } from "../../../lib/XComponent";
import { config } from "../../../config/config";
import { DevloperConfig } from "../../DeveloperConfig/service/DeveloperConfig";
import { developerConfigStore } from "../../DeveloperConfig/state/PlayerStore";
import { aboutStore } from "../state/AboutStore";

export function aboutModalFactory() {
  function component() {
    return {
      config,
      devConfig: new DevloperConfig(),
      handleDevModeClick() {
        this.devConfig.handleClick();
        if (developerConfigStore.isOpen) {
          aboutStore.isOpen = false;
        }
      },
    };
  }
  return new XComponent(template, "about-modal", component);
}
