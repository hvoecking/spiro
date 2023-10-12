import template from "./ToastRack.html?raw";
import { XComponent } from "../../../lib/XComponent";

export function toastRackFactory() {
  function toastRackComponent() {
    return {
    };
  }
  return new XComponent(template, "toast-rack", toastRackComponent);
}
