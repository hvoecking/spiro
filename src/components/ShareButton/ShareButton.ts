import { AlpineComponent } from "alpinejs";
import shareButtonHtml from "./ShareButton.html?raw";

interface ShareButtonComponent extends AlpineComponent<Record<string | symbol, unknown>> {
  copied: boolean;
  copyURL(): void;
  init(): void;
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

document.addEventListener("DOMContentLoaded", () => {
  const elements = document.querySelectorAll(".spiro-share-button");

  elements.forEach((element: Element) => {
    let enrichedHtml = shareButtonHtml;
    element
      .getAttributeNames()
      .filter((attrName: string) => attrName.startsWith("data-"))
      .forEach((attrName: string) => {
        const attrValue = element.getAttribute(attrName);
        if (attrName === "data-test-id-prefix") {
          enrichedHtml = enrichedHtml.replace(/data-test-id-suffix="/g, `data-test-id="${attrValue}-`);
        } else {
          enrichedHtml = enrichedHtml.replace(attrName, `${attrName}="${attrValue}"`);
        }
      });
    element.innerHTML = enrichedHtml;
  });
});
