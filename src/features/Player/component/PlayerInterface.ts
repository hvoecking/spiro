import template from "./PlayerInterface.html?raw";
import { XComponent } from "../../../lib/XComponent";
import { PauseEndReason, PauseStartReason } from "../service/Player";
import { Player } from "../service/Player";
import { listen } from "../../../lib/Event";

export function playerInterfaceFactory(player: Player) {
  function component() {
    return {
      player,
      init() {
        document.body.addEventListener("keydown", (ev) => ev.key === "ArrowLeft" && ev.target === document.body && player.previous());
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
  return new XComponent(template, "player-interface", component);
}
