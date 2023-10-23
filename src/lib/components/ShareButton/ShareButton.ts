import { Toaster } from "../../../features/Toaster/service/Toaster";
import { XComponent } from "../../XComponent";
import template from "./ShareButton.html?raw";

export function shareButtonFactory() {
  function component() {
    return {
      toaster: new Toaster(),
      copyUrl: async function() {
        await navigator.clipboard.writeText(window.location.href);
        this.toaster.createToast("Link copied to clipboard", "success");
      },
    };
  }

  return new XComponent(template, "share-button", component);
}
