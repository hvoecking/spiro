export const PHYSICAL_MAX_TRACES_PER_FRAME = 340000;
export const PARTICLE_STATE_SIZE = 9;
export const TRACES_SIZE = PHYSICAL_MAX_TRACES_PER_FRAME * 3;

import { Point } from "../../../lib/Point";
import { AsTraces } from "../service/AsTraces";
import init from "./../../../../build/release.wasm?init";
import { calculationStateStore } from "./CalculationStore";

// Create a WebAssembly Memory instance. This part should match your AssemblyScript's
// @memory decorator or the default settings if you didn't specify any.
const PAGES = ((TRACES_SIZE + PARTICLE_STATE_SIZE) / 64) * 4;

function newWasmF64Array(
  module: WebAssembly.Instance,
  memory: WebAssembly.Memory,
  size: number
) {
  return new Float64Array(
    memory.buffer,
    (module.exports.newFloat64Array as CallableFunction)(size),
    size
  );
}

function newWasmF32Array(
  module: WebAssembly.Instance,
  memory: WebAssembly.Memory,
  size: number
) {
  return new Float32Array(
    memory.buffer,
    (module.exports.newFloat32Array as CallableFunction)(size),
    size
  );
}

export class AsParticle {
  p_x: number = 0;
  p_y: number = 0;
  v_x: number = 0;
  v_y: number = 0;
  gravity: number = 0;
  add_x: number = 0;
  add_y: number = 0;
  mul_x: number = 0;
  mul_y: number = 0;

  constructor(private readonly particleState: Float64Array | Float32Array) {
    this.p_x = this.particleState[0];
    this.p_y = this.particleState[1];
    this.v_x = this.particleState[2];
    this.v_y = this.particleState[3];
    this.gravity = this.particleState[4];
    this.add_x = this.particleState[5];
    this.add_y = this.particleState[6];
    this.mul_x = this.particleState[7];
    this.mul_y = this.particleState[8];
  }

  store(): void {
    this.particleState[0] = this.p_x;
    this.particleState[1] = this.p_y;
    this.particleState[2] = this.v_x;
    this.particleState[3] = this.v_y;
    this.particleState[4] = this.gravity;
    this.particleState[5] = this.add_x;
    this.particleState[6] = this.add_y;
    this.particleState[7] = this.mul_x;
    this.particleState[8] = this.mul_y;
  }
}

interface State {
  traces: Float64Array | Float32Array;
  particleState: Float64Array | Float32Array;
}

class WasmF64State implements State {
  public readonly traces;
  public readonly particleState;

  constructor(module: WebAssembly.Instance, memory: WebAssembly.Memory) {
    this.traces = newWasmF64Array(module, memory, TRACES_SIZE);
    this.particleState = newWasmF64Array(module, memory, PARTICLE_STATE_SIZE);
  }
}

class WasmF32State implements State {
  public readonly traces;
  public readonly particleState;

  constructor(module: WebAssembly.Instance, memory: WebAssembly.Memory) {
    this.traces = newWasmF32Array(module, memory, TRACES_SIZE);
    this.particleState = newWasmF32Array(module, memory, PARTICLE_STATE_SIZE);
  }
}

class JsF64State implements State {
  public traces = new Float64Array(TRACES_SIZE);
  public particleState = new Float64Array(PARTICLE_STATE_SIZE);
}

class JsF32State implements State {
  public traces = new Float32Array(TRACES_SIZE);
  public particleState = new Float32Array(PARTICLE_STATE_SIZE);
}

export class CalculationState {
  private wasmF64State: WasmF64State | null = null;
  private wasmF32State: WasmF32State | null = null;
  private readonly jsF64State = new JsF64State();
  private readonly jsF32State = new JsF32State();

  public tracesF64: Float64Array | null = null;
  public tracesF32: Float32Array | null = null;
  public traces: Float64Array | Float32Array | null = null;
  private wasmCalculateTracesF32: CallableFunction | null = null;
  private wasmCalculateTracesF64: CallableFunction | null = null;

  constructor(private readonly jsCalculateTraces: CallableFunction) {
    this.setupWasm();
  }

  getState(): State {
    if (
      calculationStateStore.isWasmMode &&
      calculationStateStore.isWasmModuleLoaded &&
      this.wasmF64State &&
      this.wasmF32State
    ) {
      if (calculationStateStore.isHighPrecisionMode) {
        return this.wasmF64State;
      } else {
        return this.wasmF32State;
      }
    }
    if (calculationStateStore.isHighPrecisionMode) {
      return this.jsF64State;
    } else {
      return this.jsF32State;
    }
  }

  calculateTraces(width: number, height: number, maxTraces: number): number {
    if (calculationStateStore.isWasmMode && calculationStateStore.isWasmModuleLoaded && this.wasmCalculateTracesF32 && this.wasmCalculateTracesF64) {
      const wasmCalculateTraces = calculationStateStore.isHighPrecisionMode ? this.wasmCalculateTracesF64 : this.wasmCalculateTracesF32;
      return wasmCalculateTraces(
        width,
        height,
        this.getState().particleState,
        this.getState().traces,
        maxTraces,
      );
    } else {
      return this.jsCalculateTraces(
        width,
        height,
        new AsParticle(this.getState().particleState),
        new AsTraces(this.getState().traces),
        maxTraces
      );
    }
  }

  reset(
    position: Point,
    velocity: Point,
    gravity: number,
    add: Point,
    mul: Point
  ) {
    const state = this.getState();
    state.traces.fill(0);
    state.particleState[0] = position.x;
    state.particleState[1] = position.y;
    state.particleState[2] = velocity.x;
    state.particleState[3] = velocity.y;
    state.particleState[4] = gravity;
    state.particleState[5] = add.x;
    state.particleState[6] = add.y;
    state.particleState[7] = mul.x;
    state.particleState[8] = mul.y;
  }

  async setupWasm() {
    try {
      await this.initializeWebAssembly();
    } catch (e) {
      console.warn("Error initializing WASM: " + e);
    }
  }

  async initializeWebAssembly() {
    const memory = new WebAssembly.Memory({
      initial: PAGES,
      maximum: PAGES,
    });
    const instance = await init({
      env: {
        memory,
        "Math.sqrt": Math.sqrt,
        abort: this.abortHandler,
      },
    });
    this.populateStates(instance, memory);
  }

  populateStates(instance: WebAssembly.Instance, memory: WebAssembly.Memory) {
    calculationStateStore.isWasmModuleLoaded = true;
    this.wasmF32State = new WasmF32State(instance, memory);
    this.wasmF64State = new WasmF64State(instance, memory);
    this.wasmCalculateTracesF32 = instance.exports.calculateTracesF32 as CallableFunction;
    this.wasmCalculateTracesF64 = instance.exports.calculateTracesF64 as CallableFunction;
  }

  abortHandler(_msg: string, _file: string, line: number, column: number) {
    throw new Error(`abort called at ${_file}:${line}:${column} "${_msg}"`);
  }
}
