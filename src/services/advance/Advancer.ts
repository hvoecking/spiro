import { MAX_TOTAL_TRACES_PER_FRAME, MAX_TRACES_PER_FRAME, particleEngineStore } from "../../ParticleEngineStore";
import { PauseEndReason, Player } from "../player/Player";
import { playerStore } from "../player/PlayerStore";
import { AutoAdvanceSpeeds, advancerStore } from "./AdvancerStore";


// tracesPerFrame: min 200, good 400, max 2000
// totalTraces: min 181761, good 262144, max 500000
// seconds: min 4, good 8, max 16
// FPS: min 30, good 60, max 120
export const RENDERING_SMOOTHNESS_TRACES_FACTOR = 10;

export class AutoAdvancer {
  constructor(private readonly player: Player) {
  }

  setAutoAdvanceSpeed(speed: AutoAdvanceSpeeds, renderingSmoothness: number) {
    if (!speed) return;
    advancerStore.autoAdvanceSpeed = speed;
    particleEngineStore.maxTracesPerFrame = MAX_TRACES_PER_FRAME[speed] * (renderingSmoothness > 1 ? renderingSmoothness * RENDERING_SMOOTHNESS_TRACES_FACTOR : 1);
    particleEngineStore.maxTotalTraces = MAX_TOTAL_TRACES_PER_FRAME[speed] * (renderingSmoothness > 1 ? renderingSmoothness * RENDERING_SMOOTHNESS_TRACES_FACTOR : 1);
    particleEngineStore.currentMaxTotalTraces = MAX_TOTAL_TRACES_PER_FRAME[speed] * (renderingSmoothness > 1 ? renderingSmoothness * RENDERING_SMOOTHNESS_TRACES_FACTOR : 1);
  }
  toggleAutoAdvanceMode() {
    advancerStore.isAutoAdvanceMode = !advancerStore.isAutoAdvanceMode;
    if (advancerStore.isAutoAdvanceMode && playerStore.isPaused) {
      this.player.endPause(PauseEndReason.AUTO_ADVANCE_ENABLED);
    }
  }
}
