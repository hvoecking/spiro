import init from "../build/release.wasm?init";
import { CanvasStore } from "./components/Canvas";

export const PHYSICAL_MAX_TRACES_PER_FRAME = 340000;
export const PARTICLE_STATE_SIZE = 9;

class SeededRNG {
  private a: bigint = BigInt(1664525);
  private c: bigint = BigInt(1013904223);
  private m: bigint = BigInt(2 ** 32); // Using a 32-bit LCG here
  private state: bigint;

  constructor(seed: string) {
    if (seed.length !== 128) {
      throw new Error("Seed must be 128 bits");
    }
    // Split the seed into two 64-bit parts
    const part1 = BigInt("0b" + seed.slice(0, 64));
    const part2 = BigInt("0b" + seed.slice(64, 128));
    this.state = (part1 ^ part2) % this.m;
  }

  // Generate a new random integer
  private nextInt(): bigint {
    this.state = (this.a * this.state + this.c) % this.m;
    return this.state;
  }

  // Generate a float between min and max (inclusive)
  public nextSign(): number {
    return this.nextFloat() < 0.5 ? 1 : -1;
  }

  // Generate a float between min and max (inclusive)
  public nextFloat(min: number = 0, max: number = 1): number {
    const range = max - min;
    const scaled = Number(this.nextInt()) / Number(this.m);
    return min + scaled * range;
  }
}


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

export class Point {
  constructor(public x: number, public y: number) {}

  subtract(other: Point) {
    return new Point(this.x - other.x, this.y - other.y);
  }

  scale(factor: number) {
    return new Point(this.x * factor, this.y * factor);
  }
}

export class ParticleConfig {
  readonly add: Point;
  readonly gravity: number;
  readonly mul: Point;
  readonly initPosition: Point;
  readonly initVelocity: Point;
  readonly color: Color;

  constructor(
    readonly center: Point,
    readonly isShapesMode: boolean,
    readonly scale: number,
    readonly seed: string[],
    useRNG: boolean = false,
  ) {
    if (useRNG) {
      const rng = new SeededRNG(seed.join(""));
      this.initPosition = new Point(
        rng.nextFloat(-center.x, center.x),
        rng.nextFloat(-center.y, center.y),
      );
      this.initVelocity = new Point(
        rng.nextFloat(20, 30)*rng.nextSign(),
        rng.nextFloat(20, 30)*rng.nextSign(),
      );
      this.gravity = rng.nextFloat(1000, 2000);
    } else {
      this.initPosition = new Point(
        this.parseSingnedSlice(0, 16),
        this.parseSingnedSlice(16, 16),
      );
      this.initVelocity = new Point(
        this.parseSign(32) * 2 ** 8 + this.parseSingnedSlice(32, 16) * 2,
        this.parseSign(48) * 2 ** 8 + this.parseSingnedSlice(48, 16) * 2,
      );
      this.gravity = 2**17 + this.parseUnsingnedSlice(64, 16);
    }
    this.color = new Color(
      (this.parseUnsingnedSlice(80, 9) / 2 ** 9) * 360,
      50 + (this.parseUnsingnedSlice(89, 7) / 2 ** 7) * 100,
      50,
    );
    this.add = new Point(
      this.parseSingnedSlice(96, 8) / 10,
      this.parseSingnedSlice(104, 8) / 10,
    );
    this.mul = new Point(
      this.parseUnsingnedSlice(112, 8) / 100,
      this.parseUnsingnedSlice(120, 8) / 100,
    );
  }

  private parseUnsingnedSlice(index: number, length: number) {
    return parseInt(this.seed.slice(index, index + length).join(""), 2);
  }
  private parseSign(index: number) {
    return this.seed[index] === "0" ? 1 : -1;
  }
  private parseSingnedSlice(index: number, length: number) {
    return this.parseSign(index) * this.parseUnsingnedSlice(index + 1, length - 1);
  }
}

export class ParticleEngineConfig {
  constructor(
    readonly minMultiplier: number,
    readonly maxMultiplier: number,
    readonly initTracesPerFrame: number,
    readonly particleConfig: ParticleConfig,
    readonly immediateFeedback: boolean,
    ) {}
}

class Color {
  constructor(
    readonly hue: number,
    readonly saturation: number,
    readonly value: number,
  ) {}

  toString() {
    return `hsl(${this.hue},${this.saturation}%,${this.value}%)`;
  }
}

class Particle {
  // Keeps track of properly scaled values
  private position: Point;
  private velocity: Point;
  private gravity: number;
  private add: Point;
  private mul: Point;

  constructor(
    readonly config: ParticleConfig,
  ) {
    // Alias for readabilty
    const c = config;
    this.position = c.center.subtract(c.initPosition.scale(c.scale));
    this.velocity = c.initVelocity.scale(c.scale);
    this.gravity = c.gravity*c.scale;
    if (c.isShapesMode) {
      this.add = c.add.scale(c.scale);
      this.mul = c.mul.scale(1);
    } else {
      this.add = new Point(0, 0);
      this.mul = new Point(1, 1);
    }
  }

  color(): string {
    return this.config.color.toString();
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
  particle: Particle | null = null;
  numTracesPerFrame: number = 0;
  multiplier: number = 0;
  totalTraces: number = 0;
  frameCount = 0;

  constructor(private readonly config: ParticleEngineConfig) {
    this.reset();
  }

  getColor(): string {
    return this.particle!.color();
  }

  calcNumTraces(maxTracesPerFrame: number, maxTotalTraces: number) {
    if (this.totalTraces >= maxTotalTraces) {
      return 0;
    }
    if (this.frameCount === 0) {
      if (this.config.immediateFeedback) {
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
    if (this.frameCount === 15 && this.config.immediateFeedback) {
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
    this.totalTraces += tracesDrawn;
    this.frameCount++;
    return tracesDrawn;
  }

  reset() {
    if (particleState && traces) {
      traces.fill(0);
      this.numTracesPerFrame = this.config.initTracesPerFrame;
      this.multiplier = this.config.minMultiplier + Math.random() * (this.config.maxMultiplier - this.config.minMultiplier);
      this.totalTraces = 0;
      this.particle = new Particle(this.config.particleConfig);
      this.particle.store(particleState);
    }
  }
}
