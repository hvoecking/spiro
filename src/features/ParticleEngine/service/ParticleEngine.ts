import { particleEngineStore } from "../state/ParticleEngineStore";
import { AsParticle, AsTraces, CalculationState } from "../state/CalculationState";
import { Point } from "../../../lib/Point";
import { resetHandler } from "../../../core/services/ResetHandler";
import { shapesStore } from "../../Shapes/state/ShapsStore";

export class ParticleEngine {
  numTracesPerFrame: number = 0;
  multiplier: number = 0;
  // @Gettable
  // totalTraces: number = 0;
  frameCount = 0;

  constructor(private readonly stateHandler: CalculationState) {
    resetHandler.registerListener(() => this.reset());
    this.reset();
  }

  calcNumTraces(maxTracesPerFrame: number, maxTotalTraces: number) {
    if (particleEngineStore.totalTraces >= maxTotalTraces) {
      return 0;
    }
    if (this.frameCount === 0) {
      if (particleEngineStore.immediateFeedback) {
        return 2**12;
      }
    }
    this.numTracesPerFrame = Math.min(
      maxTracesPerFrame,
      this.numTracesPerFrame * this.multiplier,
    );
    return this.numTracesPerFrame;
  }

  calculateTraces(width: number, height: number, maxTracesPerFrame: number, maxTotalTraces: number): AsTraces | null {
    if (this.frameCount === 15 && particleEngineStore.immediateFeedback) {
      return null;
    }
    const numTraces = this.calcNumTraces(maxTracesPerFrame, maxTotalTraces);
    const tracesDrawn = this.stateHandler.calculateTraces(width, height, numTraces);
    particleEngineStore.totalTraces += tracesDrawn;
    this.frameCount++;
    return new AsTraces(this.stateHandler.getState().traces.slice(0, tracesDrawn * 3));
  }

  static calculateTracesFunction(width: number, height: number, particle: AsParticle, traces: AsTraces, numTraces: number) {
    let tracesDrawn = 0;
    const centerX = width / 2;
    const centerY = height / 2;
    for (let i = 0; i < Math.max(200, 10 * numTraces); i++) {
      const dx = particle.p_x - centerX;
      const dy = particle.p_y - centerY;
      const dist = Math.sqrt(dx*dx + dy*dy);
      const gd = (-particle.gravity / dist);
      particle.v_x += dx / gd * particle.mul_x + particle.add_x;
      particle.v_y += dy / gd * particle.mul_y + particle.add_y;
      particle.p_x += particle.v_x;
      particle.p_y += particle.v_y;

      if (particle.p_x > 0 && particle.p_x < width && particle.p_y > 0 && particle.p_y < height) {
        traces.store(tracesDrawn, particle.p_x, particle.p_y, Math.sqrt(particle.v_x*particle.v_x + particle.v_y*particle.v_y));
        tracesDrawn++;
        if (tracesDrawn >= numTraces) {
          break;
        }
      }
    }
    particle.store();
    return tracesDrawn;
  }

  reset() {
    const s = particleEngineStore;
    this.stateHandler.reset(
      s.center.subtract(s.initPosition.scale(s.scale)),
      s.initVelocity.scale(s.scale),
      s.gravity * s.scale,
      shapesStore.isShapesMode ? s.add.scale(s.scale) : Point.zero(),
      shapesStore.isShapesMode ? s.mul.scale(1) : Point.one(),
    );
    this.numTracesPerFrame = s.initTracesPerFrame;
    this.multiplier = s.minMultiplier + Math.random() * (s.maxMultiplier - s.minMultiplier);
    this.frameCount = 0;
    s.totalTraces = 0;
  }
}
