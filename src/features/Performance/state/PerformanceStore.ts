import Alpine from "alpinejs";

import FpsStatus from "../service/FpsStatus";
import { config } from "../../../config/config";
import { PerformanceTracker } from "../service/PerformanceTracker";

const _store = {
  calculationTimeTracker: new PerformanceTracker(60),
  currentFps: 0,
  currentFpsCount: 0,
  fpsStatus: FpsStatus.NOT_COUNTING,
  isOpen: config.defaultIsPerformanceDisplayOpen,
  renderTimeTracker: new PerformanceTracker(60),
};

Alpine.store("performance", _store);

export const performanceStore = Alpine.store("performance") as typeof _store;
