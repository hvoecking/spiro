import template from "./AdvanceSpeedSelector.html?raw";
import { XComponent, XAlpineComponent } from "../XComponent";
import { AutoAdvancer } from "../../services/advance/Advancer";

interface AdvanceSpeedSelectorComponent extends XAlpineComponent {
}

export function advanceSpeedSelectorFactory(advancer: AutoAdvancer) {
  function advanceSpeedSelectorComponent(this: AdvanceSpeedSelectorComponent) {
    return {
      advancer,
    };
  }
  return new XComponent(template, "advance-speed-selector", advanceSpeedSelectorComponent);
}
