import Alpine from "alpinejs";
import { resetHandler } from "../../../core/services/ResetHandler";

const _store = {
  isShapesMode: false,
  toggleShapesMode() {
    this.isShapesMode = !this.isShapesMode;
    resetHandler.requestReset(false);
  },
};

Alpine.store("shapes", _store);

export const shapesStore: typeof _store = Alpine.store("shapes") as typeof _store;
