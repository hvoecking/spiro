import Alpine from "alpinejs";
import {
  AutoAdvanceSpeeds,
  INITIAL_AUTO_ADVANCE_SPEED,
} from "../../AutoAdvancer/state/AdvancerStore";
import { clamp } from "../../../lib/Math";
import { PHYSICAL_MAX_TRACES_PER_FRAME } from "./CalculationState";
import { Point } from "../../../lib/Point";
import { resetHandler } from "../../../core/services/ResetHandler";
import { RENDERING_SMOOTHNESS_TRACES_FACTOR } from "../../AutoAdvancer/service/Advancer";
import { seedStore } from "../../../experimental/Seed/state/SeedStore";

export const MAX_TRACES_PER_FRAME = {
  [AutoAdvanceSpeeds.SLOW]: 200,
  [AutoAdvanceSpeeds.MEDIUM]: 400,
  [AutoAdvanceSpeeds.FAST]: 2000, // This should must be smaller or equal to MAX_TRACES_PER_FRAME of the particle engine
};

export const MAX_TOTAL_TRACES_PER_FRAME = {
  [AutoAdvanceSpeeds.SLOW]: 500000,
  [AutoAdvanceSpeeds.MEDIUM]: 262144,
  [AutoAdvanceSpeeds.FAST]: 181761,
};

export class Color {
  constructor(
    readonly hue: number,
    readonly saturation: number,
    readonly value: number
  ) {}

  toString() {
    return `hsl(${this.hue},${this.saturation}%,${this.value}%)`;
  }
}

function parseUnsingnedSlice(index: number, length: number) {
  return parseInt(seedStore.seed.slice(index, index + length).join(""), 2);
}
function parseSign(index: number) {
  return seedStore.seed[index] === "0" ? 1 : -1;
}
function parseSingnedSlice(index: number, length: number) {
  return parseSign(index) * parseUnsingnedSlice(index + 1, length - 1);
}

const _particleEngineStore = {
  totalTraces: 0,
  minMultiplier: 1.05,
  maxMultiplier: 1.2,
  initTracesPerFrame: 2,
  immediateFeedback: false,
  maxTracesPerFrame: MAX_TRACES_PER_FRAME[INITIAL_AUTO_ADVANCE_SPEED],
  maxTotalTraces: MAX_TOTAL_TRACES_PER_FRAME[INITIAL_AUTO_ADVANCE_SPEED],
  currentMaxTotalTraces: MAX_TOTAL_TRACES_PER_FRAME[INITIAL_AUTO_ADVANCE_SPEED],
  center: Point.zero(),
  add: Point.zero(),
  gravity: 0,
  mul: Point.zero(),
  initPosition: Point.zero(),
  initVelocity: Point.zero(),
  color: new Color(0, 0, 0),
  scale: 0,

  adjustMaxTracesPerFrame(adjustment: number, renderingSmoothness: number) {
    // Ensure tracesPerFrame is within bounds
    this.maxTracesPerFrame = clamp(
      this.maxTracesPerFrame * adjustment,
      MAX_TRACES_PER_FRAME[AutoAdvanceSpeeds.SLOW] * renderingSmoothness,
      MAX_TRACES_PER_FRAME[AutoAdvanceSpeeds.FAST] * renderingSmoothness
    );
  },

  adjustToRenderingSmoothness(
    renderingSmoothness: number,
    autoAdvanceSpeed: AutoAdvanceSpeeds
  ) {
    this.maxTracesPerFrame = Math.min(
      PHYSICAL_MAX_TRACES_PER_FRAME,
      MAX_TRACES_PER_FRAME[autoAdvanceSpeed] *
        (renderingSmoothness > 1
          ? renderingSmoothness * RENDERING_SMOOTHNESS_TRACES_FACTOR
          : 1)
    );
    this.maxTotalTraces =
      MAX_TOTAL_TRACES_PER_FRAME[autoAdvanceSpeed] *
      (renderingSmoothness > 1
        ? renderingSmoothness * RENDERING_SMOOTHNESS_TRACES_FACTOR
        : 1);
    this.currentMaxTotalTraces =
      MAX_TOTAL_TRACES_PER_FRAME[autoAdvanceSpeed] *
      (renderingSmoothness > 1
        ? renderingSmoothness * RENDERING_SMOOTHNESS_TRACES_FACTOR
        : 1);
    this.maxMultiplier =
      1.2 * renderingSmoothness * (1 + renderingSmoothness / 10);
    this.minMultiplier =
      1.05 * renderingSmoothness * (1 + renderingSmoothness / 10);
  },

  setMaxTotalTraces(newMaxTotalTraces: number) {
    this.currentMaxTotalTraces = newMaxTotalTraces;
    this.maxTotalTraces = newMaxTotalTraces;
  },

  reset(immediateFeedback: boolean, center: Point, scale: number) {
    this.currentMaxTotalTraces = this.maxTotalTraces;
    this.immediateFeedback = immediateFeedback;
    this.center = center;
    this.scale = scale;
    this.initPosition = new Point(
      parseSingnedSlice(0, 16),
      parseSingnedSlice(16, 16)
    );
    this.initVelocity = new Point(
      parseSign(32) * 2 ** 8 + parseSingnedSlice(32, 16) * 2,
      parseSign(48) * 2 ** 8 + parseSingnedSlice(48, 16) * 2
    );
    this.gravity = 2 ** 17 + parseUnsingnedSlice(64, 16);
    this.color = new Color(
      (parseUnsingnedSlice(80, 9) / 2 ** 9) * 360,
      50 + (parseUnsingnedSlice(89, 7) / 2 ** 7) * 100,
      50
    );
    this.add = new Point(
      parseSingnedSlice(96, 8) / 10,
      parseSingnedSlice(104, 8) / 10
    );
    this.mul = new Point(
      parseUnsingnedSlice(112, 8) / 100,
      parseUnsingnedSlice(120, 8) / 100
    );
  },
};
Alpine.store("particleEngine", _particleEngineStore);

export const particleEngineStore = Alpine.store(
  "particleEngine"
) as typeof _particleEngineStore;
resetHandler.registerListener((store) => {
  particleEngineStore.reset(store.immediateFeedback, store.center, store.scale);
});
