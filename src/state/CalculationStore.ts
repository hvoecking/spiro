import Alpine from "alpinejs";

const _calculationStateStore = {
  isHighPrecisionMode: false,
  isWasmModuleLoaded: false,
  togglePrecisionMode() {
    this.isHighPrecisionMode = !this.isHighPrecisionMode;
  },
  isWasmMode: false,
  toggleWasmMode() {
    this.isWasmMode = !this.isWasmMode;
  },
};

Alpine.store("calculationState", _calculationStateStore);

export const calculationStateStore: typeof _calculationStateStore = Alpine.store("calculationState") as typeof _calculationStateStore;
