import template from "./ZoomSlider.html?raw";
import { XComponent } from "../../../lib/XComponent";
import { zoomStore } from "../state/ZoomStore";

export function zoomSliderFactory() {
  function zoomSliderComponent() {
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
