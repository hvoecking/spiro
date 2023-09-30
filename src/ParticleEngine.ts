import Alpine from "alpinejs";
import init from "../build/release.wasm?init";

import { CanvasStore } from "./components/Canvas";
import { particleEngineStore, Point } from "./ParticleEngineStore";

export const PHYSICAL_MAX_TRACES_PER_FRAME = 340000;
export const PARTICLE_STATE_SIZE = 9;

// class SeededRNG {
//   private a: bigint = BigInt(1664525);
//   private c: bigint = BigInt(1013904223);
//   private m: bigint = BigInt(2 ** 32); // Using a 32-bit LCG here
//   private state: bigint;

//   constructor(seed: string) {
//     if (seed.length !== 128) {
//       throw new Error("Seed must be 128 bits");
//     }
//     // Split the seed into two 64-bit parts
//     const part1 = BigInt("0b" + seed.slice(0, 64));
//     const part2 = BigInt("0b" + seed.slice(64, 128));
//     this.state = (part1 ^ part2) % this.m;
//   }

//   // Generate a new random integer
//   private nextInt(): bigint {
//     this.state = (this.a * this.state + this.c) % this.m;
//     return this.state;
//   }

//   // Generate a float between min and max (inclusive)
//   public nextSign(): number {
//     return this.nextFloat() < 0.5 ? 1 : -1;
//   }

//   // Generate a float between min and max (inclusive)
//   public nextFloat(min: number = 0, max: number = 1): number {
//     const range = max - min;
//     const scaled = Number(this.nextInt()) / Number(this.m);
//     return min + scaled * range;
//   }
// }


// Create a WebAssembly Memory instance. This part should match your AssemblyScript's
// @memory decorator or the default settings if you didn't specify any.
let wasmMemory = null as WebAssembly.Memory | null;
const PAGES = (PHYSICAL_MAX_TRACES_PER_FRAME*3 + PARTICLE_STATE_SIZE) / 64 * 4;
try {
  wasmMemory = new WebAssembly.Memory({
    initial: PAGES,
    maximum: PAGES,
  });
} catch (e) {
  console.warn("Error creating wasm memory: " + e);
}
let wasmModule: WebAssembly.Instance | null = null;
export let tracesF64: Float64Array | null = null;
let particleStateF64: Float64Array | null = null;
export let tracesF32: Float32Array | null = null;
let particleStateF32: Float32Array | null = null;
export let traces: Float64Array | Float32Array | null = null;
let particleState: Float64Array | Float32Array | null = null;
let calculateTraces: WebAssembly.ExportValue | null = null;


function newWasmF32Array(size: number) {
  if (wasmMemory && wasmModule) {
    return new Float32Array(
      wasmMemory.buffer,
      (wasmModule.exports.newFloat32Array as CallableFunction)(size),
      size,
    );
  }
  return new Float32Array(size);
}

function newWasmF64Array(size: number) {
  if (wasmMemory && wasmModule) {
      return new Float64Array(
      wasmMemory.buffer,
      (wasmModule.exports.newFloat64Array as CallableFunction)(size),
      size,
    );
  }
  return new Float64Array(size);
}

export function setPrecisionMode(isHighPrecisionMode = false) {
  traces = isHighPrecisionMode ? tracesF64 : tracesF32;
  particleState = isHighPrecisionMode ? particleStateF64 : particleStateF32;
  if (wasmModule) {
    calculateTraces = (isHighPrecisionMode ? wasmModule.exports.calculateTracesF64 : wasmModule.exports.calculateTracesF32) as CallableFunction;
  }
  (Alpine.store("canvas") as CanvasStore).reset();
}

if (wasmMemory !== null) {
  init({
    env: {
      // Provide the memory to the wasm module
      memory: wasmMemory,
      "Math.sqrt": Math.sqrt,
      abort: (_msg: string, _file: string, line: number, column: number) => {
        throw new Error("abort called at index.ts:" + line + ":" + column);
      },
      // ... any other env functions if needed
    },
  }).then((instance) => {
    // Initialize the array in AssemblyScript
    wasmModule = instance;
    (Alpine.store("canvas") as CanvasStore).isWasmModuleLoaded = true;
    tracesF64 = newWasmF64Array(PHYSICAL_MAX_TRACES_PER_FRAME * 3);
    particleStateF64 = newWasmF64Array(PARTICLE_STATE_SIZE);
    tracesF32 = newWasmF32Array(PHYSICAL_MAX_TRACES_PER_FRAME * 3);
    particleStateF32 = newWasmF32Array(PARTICLE_STATE_SIZE);
    const isHighPrecisionMode = (Alpine.store("canvas") as CanvasStore).isHighPrecisionMode;
    setPrecisionMode(isHighPrecisionMode);
  });
} else {
  setTimeout(() => {
    tracesF64 = newWasmF64Array(PHYSICAL_MAX_TRACES_PER_FRAME * 3);
    particleStateF64 = newWasmF64Array(PARTICLE_STATE_SIZE);
    tracesF32 = newWasmF32Array(PHYSICAL_MAX_TRACES_PER_FRAME * 3);
    particleStateF32 = newWasmF32Array(PARTICLE_STATE_SIZE);
    const isHighPrecisionMode = (Alpine.store("canvas") as CanvasStore).isHighPrecisionMode;
    setPrecisionMode(isHighPrecisionMode);
  }, 100);
}

class Particle {
  // Keeps track of properly scaled values
  private position: Point;
  private velocity: Point;
  private gravity: number;
  private add: Point;
  private mul: Point;

  constructor(
  ) {
    // Alias for readabilty
    const s = particleEngineStore;
    this.position = s.center.subtract(s.initPosition.scale(s.scale));
    this.velocity = s.initVelocity.scale(s.scale);
    this.gravity = s.gravity * s.scale;
    const canvasStore = Alpine.store("canvas") as CanvasStore;
    if (canvasStore.isShapesMode) {
      this.add = s.add.scale(s.scale);
      this.mul = s.mul.scale(1);
    } else {
      this.add = Point.zero();
      this.mul = Point.one();
    }
  }

  store(particleStatePtr: Float64Array | Float32Array) {
    particleStatePtr[0] = this.position.x;
    particleStatePtr[1] = this.position.y;
    particleStatePtr[2] = this.velocity.x;
    particleStatePtr[3] = this.velocity.y;
    particleStatePtr[4] = this.gravity;
    particleStatePtr[5] = this.add.x;
    particleStatePtr[6] = this.add.y;
    particleStatePtr[7] = this.mul.x;
    particleStatePtr[8] = this.mul.y;
  }
}

class AsParticle {
  p_x: number = 0;
  p_y: number = 0;
  v_x: number = 0;
  v_y: number = 0;

  load(particleState: Float64Array | Float32Array): void {
    this.p_x = particleState[0];
    this.p_y = particleState[1];
    this.v_x = particleState[2];
    this.v_y = particleState[3];
  }

  store(particleState: Float64Array | Float32Array): void {
    particleState[0] = this.p_x;
    particleState[1] = this.p_y;
    particleState[2] = this.v_x;
    particleState[3] = this.v_y;
  }
}

const particle = new AsParticle();

export class ParticleEngine {
  private particle: Particle | null = null;
  numTracesPerFrame: number = 0;
  multiplier: number = 0;
  // @Gettable
  // totalTraces: number = 0;
  frameCount = 0;

  constructor() {
    this.reset();
  }

  calcNumTraces(maxTracesPerFrame: number, maxTotalTraces: number) {
    if (particleEngineStore.totalTraces >= maxTotalTraces) {
      return 0;
    }
    if (this.frameCount === 0) {
      if (particleEngineStore.immediateFeedback) {
        return PHYSICAL_MAX_TRACES_PER_FRAME / 10;
      }
    }
    this.numTracesPerFrame = Math.min(
      maxTracesPerFrame,
      this.numTracesPerFrame * this.multiplier,
    );
    return this.numTracesPerFrame;
  }

  calculateTraces(width: number, height: number, isWasmMode: boolean, maxTracesPerFrame: number, maxTotalTraces: number) {
    if (this.frameCount === 15 && particleEngineStore.immediateFeedback) {
      return -1;
    }
    const numTraces = this.calcNumTraces(maxTracesPerFrame, maxTotalTraces);
    let tracesDrawn = 0;
    if (isWasmMode && calculateTraces) {
      tracesDrawn = (calculateTraces as CallableFunction)(
        width,
        height,
        particleState,
        traces,
        numTraces,
      );
    } else if (particleState && traces) {
      const centerX = width / 2;
      const centerY = height / 2;
      particle.load(particleState);
      const gravity = particleState[4];
      const addX = particleState[5];
      const addY = particleState[6];
      const mulX = particleState[7];
      const mulY = particleState[8];
      for (let i = 0; i < 10*numTraces; i++) {
        const dx = particle.p_x - centerX;
        const dy = particle.p_y - centerY;
        const dist = Math.sqrt(dx*dx + dy*dy);
        // logx("dist: " + dist.toString());
        const gd = (-gravity / dist);
        // logx("gd: " + gd.toString());
        particle.v_x += dx / gd * mulX + addX;
        particle.v_y += dy / gd * mulY + addY;
        particle.p_x += particle.v_x;
        particle.p_y += particle.v_y;

        if (particle.p_x > 0 && particle.p_x < width && particle.p_y > 0 && particle.p_y < height) {
          traces[tracesDrawn * 3] = particle.p_x;
          traces[tracesDrawn * 3 + 1] = particle.p_y;
          traces[tracesDrawn * 3 + 2] = Math.sqrt(particle.v_x*particle.v_x + particle.v_y*particle.v_y);
          tracesDrawn++;
          if (tracesDrawn >= numTraces) {
            break;
          }
        }
      }
      particle.store(particleState);
    }
    particleEngineStore.totalTraces += tracesDrawn;
    this.frameCount++;
    return tracesDrawn;
  }

  reset() {
    if (particleState && traces) {
      traces.fill(0);
      this.numTracesPerFrame = particleEngineStore.initTracesPerFrame;
      this.multiplier = particleEngineStore.minMultiplier + Math.random() * (particleEngineStore.maxMultiplier - particleEngineStore.minMultiplier);
      particleEngineStore.totalTraces = 0;
      this.particle = new Particle();
      this.particle.store(particleState);
    }
  }
}
