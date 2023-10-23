
export class PerformanceSampler {
  private readonly start = performance.now();
  private duration: number | null = null;

  end() {
    this.duration = performance.now() - this.start;
  }

  getDuration(): number {
    if (this.duration === null) {
      throw new Error("PerformanceSampler not ended");
    }
    return this.duration;
  }
}

export class PerformanceTracker {
  private readonly samples: Float64Array;
  private index = 0;

  constructor(numSamples: number) {
    this.samples = new Float64Array(numSamples);
    this.samples.fill(0);
  }

  start(): PerformanceSampler {
    return new PerformanceSampler();
  }

  end(sampler: PerformanceSampler, additionalDuration: number = 0) {
    sampler.end();
    this.samples[this.index] = sampler.getDuration() + additionalDuration;
    this.index = (this.index + 1) % this.samples.length;
  }

  getAverage(): number {
    return this.samples.reduce((a, b) => a + b, 0) / this.samples.length;
  }
}
