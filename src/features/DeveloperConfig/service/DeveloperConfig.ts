

import { developerConfigStore } from "../../DeveloperConfig/state/PlayerStore";
import { Toaster } from "../../Toaster/service/Toaster";

export class DevloperConfig {
  countdown = 7;
  toastIndex = null as number | null;
  toaster = new Toaster();
  handleClick() {
    this.countdown--;

    if (this.countdown <= 0) {
      this.countdown = 0;
      if (this.toastIndex !== null) {
        this.toaster.hideToast(this.toastIndex, 200);
        this.toastIndex = null;
      }
      this.toaster.createToast("You are a developer now!", "success");
      developerConfigStore.isOpen = true;
    } else if (this.countdown < 5) {
      this.upsertToast(`Developer mode in ${this.countdown} clicks.`);
    }
  }

  upsertToast(message: string) {
    if (this.toastIndex === null) {
      this.toastIndex = this.toaster.createToast(message);
    } else {
      this.toastIndex = this.toaster.updateToast(this.toastIndex, message);
    }
  }
}
