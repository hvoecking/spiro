import Alpine from "alpinejs";
import { resetHandler } from "../../../core/services/ResetHandler";

const _shapesStore = {
  isShapesMode: false,
  toggleShapesMode() {
    this.isShapesMode = !this.isShapesMode;
    resetHandler.requestReset(false);
  },
};

Alpine.store("shapes", _shapesStore);

export const shapesStore: typeof _shapesStore = Alpine.store("shapes") as typeof _shapesStore;
