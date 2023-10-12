import template from "./AboutModal.html?raw";
import { XComponent } from "../../../lib/XComponent";
import { config } from "../../../config/config";
import { toasterStore } from "../../Toaster/state/ToasterStore";
import { aboutStore } from "../state/AboutStore";
import { developerConfigStore } from "../../DeveloperConfig/state/PlayerStore";

export function aboutModalFactory() {
  function aboutModalComponent() {
    return {
      config,
      devModeCountdown: 7,
      devModeToastIndex: null as number | null,
      handleDevModeClick() {
        this.devModeCountdown--;
        if (this.devModeCountdown === 5) {
          this.devModeToastIndex = toasterStore.createToast("", "info");
        }
        if (this.devModeToastIndex !== null) {
          toasterStore.replaceText(
            this.devModeToastIndex,
            `You are ${this.devModeCountdown} clicks away from developer config.`
          );
        }
        if (this.devModeCountdown <= 0) {
          aboutStore.isOpen = false;
          this.devModeCountdown = 0;
          if (this.devModeToastIndex !== null) {
            toasterStore.destroyToast(this.devModeToastIndex);
            this.devModeToastIndex = null;
          }
          toasterStore.createToast("You are a developer now!", "success");
          developerConfigStore.isOpen = true;
        }
      },
    };
  }
  return new XComponent(template, "about-modal", aboutModalComponent);
}
