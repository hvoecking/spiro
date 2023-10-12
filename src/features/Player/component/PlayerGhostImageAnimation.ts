import template from "./PlayerGhostImageAnimation.html?raw";
import { XComponent } from "../../../lib/XComponent";

export function playerGhostImageAnimationFactory() {
  function playerGhostImageAnimationComponent() {
    return {
      showGhostImage: false,
      triggerGhostImage() {
        this.showGhostImage = true;
        setTimeout(() => {
          this.showGhostImage = false;
        }, 100);
      }
    };
  }
  return new XComponent(template, "player-ghost-image-animation", playerGhostImageAnimationComponent);
}
