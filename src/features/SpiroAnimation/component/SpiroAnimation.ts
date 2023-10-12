import template from "./SpiroAnimation.html?raw";
import { XComponent, XAlpineComponent } from "../../../lib/XComponent";
import { spiroAnimationStore } from "../state/SpiroAnimationStore";

interface SpiroAnimationComponent extends XAlpineComponent {
  $refs: {
    spiroAnimation: HTMLElement;
  };
}

export function spiroAnimationFactory() {
  function spiroAnimationComponent(this: SpiroAnimationComponent) {
    const spiroAnimation = this.$refs.spiroAnimation;
    return {
      wasTriggered: false,
      init() {
        // The init animation starts at 500ms and takes another 700ms to complete. The
        // slide-in animation takes 300ms. We want a delay that makes both to end at the
        // same time.
        const delay = 500 + 700 - 300;
        setTimeout(() => spiroAnimationStore.hasStarted = true, delay);

        setTimeout(() => {
          this.wasTriggered = true;
          const spacing = Math.min(50, window.innerWidth / 2 / "SPIRO".length);
          spiroAnimation.style.setProperty("letter-spacing", `var(--tracking, ${spacing}px)`);
        }, 500);
      },
    };
  }
  return new XComponent(template, "spiro-animation", spiroAnimationComponent);
}
