import shareButtonHtml from "./ShareButton.html?raw";
import { XAlpineComponent, createAndRegisterXComponent } from "../XComponent";

interface ShareButtonComponent extends XAlpineComponent<ShareButtonComponent> {
  copied: boolean;
  copyURL(): void;
  init(): void;
}

function shareButtonComponent(this: ShareButtonComponent) {
  return {
    copied: false,
    copyURL: async function() {
      await navigator.clipboard.writeText(window.location.href);
      this.copied = true;
      setTimeout(() => this.copied = false, 3000);
    },
  };
}

export const shareButton = createAndRegisterXComponent<ShareButtonComponent>(
  shareButtonComponent as unknown as (this: ShareButtonComponent) => ShareButtonComponent,
  shareButtonHtml,
  "share-button",
);
