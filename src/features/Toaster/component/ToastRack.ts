import template from "./ToastRack.html?raw";
import { XComponent } from "../../../lib/XComponent";

import toastErrorIcon from "../../../../assets/icons/toast-error.svg";
import toastInfoIcon from "../../../../assets/icons/toast-info.svg";
import toastSuccessIcon from "../../../../assets/icons/toast-success.svg";
import toastWarningIcon from "../../../../assets/icons/toast-warning.svg";
import { ToastType } from "../service/Toaster";

type ToastStyle = {
  icon: string;
  border: string;
  fill: string;
};

const TOAST_STYLES: Record<ToastType, ToastStyle> = {
  "info": {
    icon: toastInfoIcon,
    border: "border-zinc-500",
    fill: "fill-zinc-500",
  },
  "success": {
    icon: toastSuccessIcon,
    border: "border-green-500",
    fill: "fill-green-500",
  },
  "warning": {
    icon: toastWarningIcon,
    border: "border-yellow-400",
    fill: "fill-yellow-400",
  },
  "error": {
    icon: toastErrorIcon,
    border: "border-red-500",
    fill: "fill-red-500",
  },
};

export function toastRackFactory() {
  function component() {
    return {
      TOAST_STYLES,
      loadSvgSprite(el: HTMLElement, toastIcon: string) {
        el.setAttributeNS(
          "http://www.w3.org/1999/xlink",
          "href",
          `#${toastIcon}`
        );
      },
    };
  }
  return new XComponent(template, "toast-rack", component);
}
