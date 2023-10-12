import template from "./DeveloperModal.html?raw";
import { XComponent } from "../../../lib/XComponent";
import { config } from "../../../config/config";
import { setTypedHashParam } from "../../../lib/UrlHashParams";

export function developerModalFactory() {
  function component() {
    console.warn("entries:", Object.entries(config));
    return {
      config,
      setHashParams() {
        Object.entries(this.config).forEach(([key, value]) => {
          setTypedHashParam(key, value);
        });
      },
    };
  }
  return new XComponent(template, "developer-modal", component);
}
