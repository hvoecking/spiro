const createdArraysF32 = new Array<StaticArray<f32>>();

export function newFloat32Array(size: i32): usize {
  const array = new StaticArray<f32>(size);
  createdArraysF32.push(array);
  return changetype<usize>(array);
}

class ParticleF32 {
  p_x: f32 = 0;
  p_y: f32 = 0;
  v_x: f32 = 0;
  v_y: f32 = 0;

  load(particleState: StaticArray<f32>): void {
    this.p_x = particleState[0];
    this.p_y = particleState[1];
    this.v_x = particleState[2];
    this.v_y = particleState[3];
  }

  store(particleState: StaticArray<f32>): void {
    particleState[0] = this.p_x;
    particleState[1] = this.p_y;
    particleState[2] = this.v_x;
    particleState[3] = this.v_y;
  }
}

let particleF32: ParticleF32 = new ParticleF32();

export function calculateTracesF32(
  canvasWidth: f32,
  canvasHeight: f32,
  particleState: StaticArray<f32>,
  traces: StaticArray<f32>,
  numTraces: i32,
): i32 {
  // Simulation logic (simplified)
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;
  traces = createdArraysF32[0];
  particleState = createdArraysF32[1];
  particleF32.load(particleState);
  const gravity = particleState[4];
  const addX = particleState[5];
  const addY = particleState[6];
  const mulX = particleState[7];
  const mulY = particleState[8];
  let tracesDrawn = 0;
  for (let i = 0; i < 10*numTraces; i++) {
    const dx = particleF32.p_x - centerX;
    const dy = particleF32.p_y - centerY;
    const dist = Mathf.sqrt(dx*dx + dy*dy);
    const gd = (-gravity / dist);
    particleF32.v_x += dx / gd * mulX + addX;
    particleF32.v_y += dy / gd * mulY + addY;
    particleF32.p_x += particleF32.v_x;
    particleF32.p_y += particleF32.v_y;
    if (particleF32.p_x > 0 && particleF32.p_x < canvasWidth && particleF32.p_y > 0 && particleF32.p_y < canvasHeight) {
      traces[tracesDrawn * 3] = particleF32.p_x;
      traces[tracesDrawn * 3 + 1] = particleF32.p_y;
      traces[tracesDrawn * 3 + 2] = Mathf.sqrt(particleF32.v_x*particleF32.v_x + particleF32.v_y*particleF32.v_y);
      tracesDrawn++;
      if (tracesDrawn >= numTraces) {
        break;
      }
    }
  }
  particleF32.store(particleState);
  return tracesDrawn;
}


const createdArraysF64 = new Array<StaticArray<f64>>();

export function newFloat64Array(size: i32): usize {
  const array = new StaticArray<f64>(size);
  createdArraysF64.push(array);
  return changetype<usize>(array);
}

class ParticleF64 {
  p_x: f64 = 0;
  p_y: f64 = 0;
  v_x: f64 = 0;
  v_y: f64 = 0;

  load(particleState: StaticArray<f64>): void {
    this.p_x = particleState[0];
    this.p_y = particleState[1];
    this.v_x = particleState[2];
    this.v_y = particleState[3];
  }

  store(particleState: StaticArray<f64>): void {
    particleState[0] = this.p_x;
    particleState[1] = this.p_y;
    particleState[2] = this.v_x;
    particleState[3] = this.v_y;
  }
}

let particleF64: ParticleF64 = new ParticleF64();

export function calculateTracesF64(
  canvasWidth: f64,
  canvasHeight: f64,
  particleState: StaticArray<f64>,
  traces: StaticArray<f64>,
  numTraces: i32,
): i32 {
  // Simulation logic (simplified)
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;
  traces = createdArraysF64[0];
  particleState = createdArraysF64[1];
  particleF64.load(particleState);
  const gravity = particleState[4];
  const addX = particleState[5];
  const addY = particleState[6];
  const mulX = particleState[7];
  const mulY = particleState[8];
  let tracesDrawn = 0;
  for (let i = 0; i < 10*numTraces; i++) {
    const dx = particleF64.p_x - centerX;
    const dy = particleF64.p_y - centerY;
    const dist = Math.sqrt(dx*dx + dy*dy);
    const gd = (-gravity / dist);
    particleF64.v_x += dx / gd * mulX + addX;
    particleF64.v_y += dy / gd * mulY + addY;
    particleF64.p_x += particleF64.v_x;
    particleF64.p_y += particleF64.v_y;
    if (particleF64.p_x > 0 && particleF64.p_x < canvasWidth && particleF64.p_y > 0 && particleF64.p_y < canvasHeight) {
      traces[tracesDrawn * 3] = particleF64.p_x;
      traces[tracesDrawn * 3 + 1] = particleF64.p_y;
      traces[tracesDrawn * 3 + 2] = Math.sqrt(particleF64.v_x*particleF64.v_x + particleF64.v_y*particleF64.v_y);
      tracesDrawn++;
      if (tracesDrawn >= numTraces) {
        break;
      }
    }
  }
  particleF64.store(particleState);
  return tracesDrawn;
}
