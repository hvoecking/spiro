import { listen } from "../../../lib/Event";
import { playerStore } from "../../Player/state/PlayerStore";
import { AutoAdvanceSpeeds, advancerStore } from "../state/AdvancerStore";
import { PauseEndReason, Player } from "../../Player/service/Player";
import {
  adjustedMaxTotalTraces,
  adjustedMaxTracesPerFrame,
  particleEngineStore,
} from "../../ParticleEngine/state/ParticleEngineStore";

export class AutoAdvancer {
  constructor(private readonly player: Player) {
    listen("auto-advance-mode-changed", () => {
      if (advancerStore.isAutoAdvanceMode && playerStore.isPaused) {
        this.player.endPause(PauseEndReason.AUTO_ADVANCE_ENABLED);
      }
    });
  }

  setAutoAdvanceSpeed(speed: AutoAdvanceSpeeds, quality: number) {
    if (!speed) return;
    // If speed is a number, convert it to a valid AutoAdvanceSpeeds value
    if (typeof speed === "number") {
      speed = Object.values(AutoAdvanceSpeeds)[speed];
    }
    advancerStore.autoAdvanceSpeed = speed;
    particleEngineStore.maxTracesPerFrame = adjustedMaxTracesPerFrame(speed, quality);
    particleEngineStore.maxTotalTraces = adjustedMaxTotalTraces(speed, quality);
    particleEngineStore.currentMaxTotalTraces = adjustedMaxTotalTraces(speed, quality);
  }
}
