import template from "./AdvanceSpeedSelector.html?raw";
import { XComponent } from "../../../lib/XComponent";
import { AutoAdvancer } from "../service/Advancer";

export function advanceSpeedSelectorFactory(advancer: AutoAdvancer) {
  function component() {
    return {
      advancer,
    };
  }
  return new XComponent(template, "advance-speed-selector", component);
}
