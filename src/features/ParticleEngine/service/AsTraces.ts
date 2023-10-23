
export class AsTraces {
  getItensity(i: number) {
    return this.get(i)[2];
  }
  constructor(private readonly traces: Float64Array | Float32Array) {}

  store(
    i: number,
    position_x: number,
    position_y: number,
    intensity: number
  ): void {
    this.traces[i * 3] = position_x;
    this.traces[i * 3 + 1] = position_y;
    this.traces[i * 3 + 2] = intensity;
  }

  get(i: number): [number, number, number] {
    return [this.traces[i * 3], this.traces[i * 3 + 1], this.traces[i * 3 + 2]];
  }

  length(): number {
    return this.traces.length / 3;
  }

  serialize(): Float64Array | Float32Array {
    return this.traces;
  }
}
