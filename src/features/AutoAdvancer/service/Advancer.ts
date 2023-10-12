import { MAX_TOTAL_TRACES_PER_FRAME, MAX_TRACES_PER_FRAME, particleEngineStore } from "../../ParticleEngine/state/ParticleEngineStore";
import { listen } from "../../../lib/Event";
import { playerStore } from "../../Player/state/PlayerStore";
import { AutoAdvanceSpeeds, advancerStore } from "../state/AdvancerStore";
import { PauseEndReason, Player } from "../../Player/service/Player";


// tracesPerFrame: min 200, good 400, max 2000
// totalTraces: min 181761, good 262144, max 500000
// seconds: min 4, good 8, max 16
// FPS: min 30, good 60, max 120
export const RENDERING_SMOOTHNESS_TRACES_FACTOR = 10;

export class AutoAdvancer {
  constructor(private readonly player: Player) {
    listen("auto-advance-mode-changed", () => {
      if (advancerStore.isAutoAdvanceMode && playerStore.isPaused) {
        this.player.endPause(PauseEndReason.AUTO_ADVANCE_ENABLED);
      }
    });
  }

  setAutoAdvanceSpeed(speed: AutoAdvanceSpeeds, renderingSmoothness: number) {
    if (!speed) return;
    advancerStore.autoAdvanceSpeed = speed;
    particleEngineStore.maxTracesPerFrame = MAX_TRACES_PER_FRAME[speed] * (renderingSmoothness > 1 ? renderingSmoothness * RENDERING_SMOOTHNESS_TRACES_FACTOR : 1);
    particleEngineStore.maxTotalTraces = MAX_TOTAL_TRACES_PER_FRAME[speed] * (renderingSmoothness > 1 ? renderingSmoothness * RENDERING_SMOOTHNESS_TRACES_FACTOR : 1);
    particleEngineStore.currentMaxTotalTraces = MAX_TOTAL_TRACES_PER_FRAME[speed] * (renderingSmoothness > 1 ? renderingSmoothness * RENDERING_SMOOTHNESS_TRACES_FACTOR : 1);
  }
}
