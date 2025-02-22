import Alpine from "alpinejs";
import { clamp } from "../../../lib/Math";
import { dispatch } from "../../../lib/Event";
import { resetHandler } from "../../../core/services/ResetHandler";

const _store = {
  zoom: 0.75,
  setZoom(zoom: number) {
    dispatch("zoom-changed");
    this.zoom = clamp(zoom, 0.01, 1);
    resetHandler.requestReset(true);
  },
};

Alpine.store("zoom", _store);

export const zoomStore = Alpine.store("zoom") as typeof _store;
