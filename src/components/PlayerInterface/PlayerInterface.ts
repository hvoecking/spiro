import template from "./PlayerInterface.html?raw";
import { XComponent, XAlpineComponent } from "../XComponent";
import { PauseEndReason, PauseStartReason } from "../../services/Player/Player";
import { Player } from "../../services/Player/Player";
import { listen } from "../../Utilities";

interface PlayerInterfaceComponent extends XAlpineComponent {
}

export function playerInterfaceFactory(player: Player) {
  function playerInterfaceComponent(this: PlayerInterfaceComponent) {
    return {
      player,
      init() {
        document.body.addEventListener("keydown", (ev) => ev.key === "ArrowLeft" && ev.target === document.body && player.next());
        document.body.addEventListener("keydown", (ev) => ev.key === " " && ev.target === document.body && player.togglePause());
        document.body.addEventListener("keydown", (ev) => ev.key === "ArrowRight" && ev.target === document.body && player.next());

        document.addEventListener("visibilitychange", function () {
          if (document.hidden) {
            player.startPause(PauseStartReason.TAB_HIDDEN);
          } else {
            player.endPause(PauseEndReason.TAB_UNHIDDEN);
          }
        });

        listen("shutdown", () => player.startPause(PauseStartReason.SHUTDOWN));
      },
    };
  }
  return new XComponent(template, "player-interface", playerInterfaceComponent);
}
