import { AsTraces } from "./AsTraces";

export function renderTraces(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  color: string,
  traces: AsTraces,
  isRenderVelocity: boolean,
  vScaling: number,
  quality: number,
) {
  ctx.fillStyle = color;
  for (let i = 0; i < traces.length(); i++) {
    const [x, y, intensity] = traces.get(i);
    let v = 1;
    if (isRenderVelocity) {
      v = intensity ** 0.7 / vScaling;
    }
    v /= Math.max(1, Math.log(quality));
    ctx.fillRect(x, y, v, v);
  }
}

export function renderReset(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  color: string,
  width: number,
  height: number,
) {
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, width, height);
}
