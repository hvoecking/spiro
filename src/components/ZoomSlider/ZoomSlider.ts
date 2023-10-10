import template from "./ZoomSlider.html?raw";
import { XComponent, XAlpineComponent } from "../XComponent";
import { zoomStore } from "../../state/ZoomStore";

interface ZoomSliderComponent extends XAlpineComponent {
}

export function zoomSliderFactory() {
  function zoomSliderComponent(this: ZoomSliderComponent) {
    return {
      init() {
        // Listen for "wheel" event on the document
        document.addEventListener("wheel", function(event) {
          // Prevent default zoom
          event.preventDefault();

          zoomStore.setZoom(zoomStore.zoom - event.deltaY / 600);
        }, { passive: false });
      },
    };
  }
  return new XComponent(template, "zoom-slider", zoomSliderComponent);
}
