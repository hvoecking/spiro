import Alpine from "alpinejs";

import FpsStatus from "../service/FpsStatus";
import { config } from "../../../config/config";

const _performanceStore = {
  calculationTime: 0,
  currentFps: 0,
  currentFpsCount: 0,
  fpsStatus: FpsStatus.NOT_COUNTING,
  isOpen: config.defaultIsPerformanceDisplayOpen,
  renderTime: 0,
};

Alpine.store("performance", _performanceStore);

export const performanceStore = Alpine.store("performance") as typeof _performanceStore;
