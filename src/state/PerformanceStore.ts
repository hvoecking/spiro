import Alpine from "alpinejs";

import { isDevMode } from "../Utilities";
import FpsStatus from "../services/FpsManager/FpsStatus";

const _performanceStore = {
  calculationTime: 0,
  currentFps: 0,
  currentFpsCount: 0,
  fpsStatus: FpsStatus.NOT_COUNTING,
  isOpen: isDevMode(),
  renderTime: 0,
};

Alpine.store("performance", _performanceStore);

export const performanceStore = Alpine.store("performance") as typeof _performanceStore;
