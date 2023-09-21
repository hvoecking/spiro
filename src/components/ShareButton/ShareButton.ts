import template from "./ShareButton.html?raw";
import { XComponent, XAlpineComponent } from "../XComponent";

interface ShareButtonComponent extends XAlpineComponent {
  copied: boolean;
  copyURL(): void;
}

export function shareButtonComponent(this: ShareButtonComponent) {
  return {
    copied: false,
    copyURL: async function() {
      await navigator.clipboard.writeText(window.location.href);
      this.copied = true;
      setTimeout(() => this.copied = false, 3000);
    },
  };
}

export const shareButton = new XComponent(template, "share-button", shareButtonComponent);
