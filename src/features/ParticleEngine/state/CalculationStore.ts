import Alpine from "alpinejs";
import { resetHandler } from "../../../core/services/ResetHandler";

const _store = {
  isHighPrecisionMode: false,
  isWasmModuleLoaded: false,
  togglePrecisionMode() {
    this.isHighPrecisionMode = !this.isHighPrecisionMode;
    resetHandler.requestReset(false);
  },
  isWasmMode: false,
  toggleWasmMode() {
    this.isWasmMode = !this.isWasmMode;
    resetHandler.requestReset(false);
  },
};

Alpine.store("calculationState", _store);

export const calculationStateStore = Alpine.store("calculationState") as typeof _store;
