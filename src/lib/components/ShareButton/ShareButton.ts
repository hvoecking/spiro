import { toasterStore } from "../../../features/Toaster/state/ToasterStore";
import { XComponent } from "../../XComponent";
import template from "./ShareButton.html?raw";

export function shareButtonFactory() {
  function shareButtonComponent() {
    return {
      copied: false,
      copyURL: async function() {
        await navigator.clipboard.writeText(window.location.href);
        this.copied = true;
        setTimeout(() => this.copied = false, 3000);
        toasterStore.createToast("Link copied to clipboard", "success");
      },
    };
  }

  return new XComponent(template, "share-button", shareButtonComponent);
}
