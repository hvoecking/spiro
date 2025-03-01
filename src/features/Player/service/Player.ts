import { mnemonicsStore } from "../../../experimental/Mnemonics";
import { playerStore } from "../state/PlayerStore";
import { dispatch } from "../../../lib/Event";
import { advancerStore } from "../../AutoAdvancer/state/AdvancerStore";
import { particleEngineStore } from "../../ParticleEngine/state/ParticleEngineStore";

// export interface Player {
//   startPause(reason: PauseStartReason): void;
//   endPause(reason: PauseStartReason): void;
//   togglePause(): void;
// }

export class ResetRequest {
  constructor(public readonly immediateFeedback: boolean) {}
}

export class Player {
  pauseStartReason: PauseStartReason | null = null;
  resetRequest: ResetRequest | null = null;

  private unpause() {
    advancerStore.autoAdvanceTimestamp = Date.now();
    playerStore.isPaused = false;
    dispatch("pause-changed");
  }

  previous() {
    mnemonicsStore.previousMnemonic();
  }

  next() {
    mnemonicsStore.nextMnemonic();
  }

  togglePause() {
    if (playerStore.isPaused) {
      this.endPause(PauseEndReason.PLAY_PAUSE_BUTTON_CLICKED);
    } else {
      this.startPause(PauseStartReason.PLAY_PAUSE_BUTTON_CLICKED);
    }
  }

  startPause(pauseStartReason: PauseStartReason) {
    if (playerStore.isPaused) {
      return;
    }
    playerStore.isPaused = true;
    this.pauseStartReason = pauseStartReason;
    dispatch("pause-changed");
  }

  endPause(pauseEndReason: PauseEndReason) {
    if (!playerStore.isPaused) {
      return;
    }

    if (
      this.pauseStartReason === PauseStartReason.MAX_TRACES_DRAWN ||
      this.pauseStartReason === PauseStartReason.AUTO_ADVANCE_DELAY_EXPIRED
    ) {
      if (pauseEndReason === PauseEndReason.AUTO_ADVANCE_ENABLED) {
        mnemonicsStore.nextMnemonic();
        this.unpause();
      } else if (pauseEndReason === PauseEndReason.PLAY_PAUSE_BUTTON_CLICKED) {
        particleEngineStore.currentMaxTotalTraces = Infinity;
        this.unpause();
      } else if (pauseEndReason === PauseEndReason.RESET_PERFORMED) {
        this.unpause();
      } else if (pauseEndReason === PauseEndReason.RESET_REQUESTED) {
        this.unpause();
      } else if (pauseEndReason === PauseEndReason.TAB_UNHIDDEN) {
        // Do not automatically start again if it was paused due to traces
      }
    } else if (this.pauseStartReason === PauseStartReason.PLAY_PAUSE_BUTTON_CLICKED) {
      if (pauseEndReason === PauseEndReason.AUTO_ADVANCE_ENABLED) {
        // Do not automatically start again if it was paused by user previously
      } else if (pauseEndReason === PauseEndReason.PLAY_PAUSE_BUTTON_CLICKED) {
        this.unpause();
      } else if (pauseEndReason === PauseEndReason.RESET_PERFORMED) {
        this.unpause();
      } else if (pauseEndReason === PauseEndReason.RESET_REQUESTED) {
        this.unpause();
      } else if (pauseEndReason === PauseEndReason.TAB_UNHIDDEN) {
        // Do not automatically start again if it was paused by user previously
      }
    } else if (this.pauseStartReason === PauseStartReason.TAB_HIDDEN) {
      if (pauseEndReason === PauseEndReason.TAB_UNHIDDEN) {
        this.unpause();
      }
    } else if (this.pauseStartReason === PauseStartReason.SHUTDOWN) {
      // Do not end pause for any reason in this case
    }
  }
}
export enum PauseStartReason {
  MAX_TRACES_DRAWN = "MAX_TRACES_DRAWN",
  PLAY_PAUSE_BUTTON_CLICKED = "PLAY_PAUSE_BUTTON_CLICKED",
  TAB_HIDDEN = "TAB_HIDDEN",
  SHUTDOWN = "SHUTDOWN",
  AUTO_ADVANCE_DELAY_EXPIRED = "AUTO_ADVANCE_DELAY_EXPIRED",
}
export enum PauseEndReason {
  AUTO_ADVANCE_ENABLED = "AUTO_ADVANCE_ENABLED",
  PLAY_PAUSE_BUTTON_CLICKED = "PLAY_PAUSE_BUTTON_CLICKED",
  RESET_PERFORMED = "RESET_PERFORMED",
  RESET_REQUESTED = "RESET_REQUESTED",
  TAB_UNHIDDEN = "TAB_UNHIDDEN",
}
