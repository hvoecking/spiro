import Alpine from "alpinejs";
import { clamp, dispatch } from "../Utilities";
import { resetHandler } from "../services/reset/ResetHandler";

const _zoomStore = {
  zoom: 0.75,
  setZoom(zoom: number) {
    dispatch("zoom-changed");
    this.zoom = clamp(zoom, 0.01, 1);
    resetHandler.requestReset(true);
  },
};

Alpine.store("zoom", _zoomStore);

export const zoomStore: typeof _zoomStore = Alpine.store("zoom") as typeof _zoomStore;
