/// <reference lib="webworker" />
import { PerformanceSampler } from "../../Performance/service/PerformanceTracker";
import { AsTraces } from "./AsTraces";
import { renderReset, renderTraces } from "./Renderer";

export type ResetArgs = {
  color: string,
}

export type RenderArgs = {
  color: string,
  traces: Float32Array | Float64Array,
  isRenderVelocity: boolean,
  vScaling: number,
  quality: number,
};

export type ResizeArgs = {
  canvasWidth: number,
  canvasHeight: number
}

export type MessageData = { type: keyof Renderer } & (RenderArgs | ResetArgs | ResizeArgs);

export class Renderer {
  private offscreenCanvas = new OffscreenCanvas(1000, 1000);
  reset({
    color,
  }: ResetArgs) {
    renderReset(this.offscreenCanvas.getContext("2d")!, color, this.offscreenCanvas.width, this.offscreenCanvas.height);
  }
  render(
    {
      color,
      traces,
      isRenderVelocity,
      vScaling,
      quality,
    }: RenderArgs,
  ) {
    if (!this.offscreenCanvas) {
      console.error("offscreenCanvas is null");
      return;
    }
    const sampler = new PerformanceSampler();
    renderTraces(
      this.offscreenCanvas.getContext("2d")!,
      color,
      new AsTraces(traces),
      isRenderVelocity,
      vScaling,
      quality,
    );
    sampler.end();
    const duration = sampler.getDuration();
    const imageBitmap = this.offscreenCanvas.transferToImageBitmap();
    self.postMessage({ imageBitmap, duration }, [imageBitmap]);
  }

  resize(
    {
      canvasWidth,
      canvasHeight,
    }: ResizeArgs,
  ) {
    this.offscreenCanvas = new OffscreenCanvas(canvasWidth, canvasHeight);
  }
}

const renderer = new Renderer();
self.onmessage = function(event: MessageEvent<MessageData>) {
  const data = event.data as MessageData;
  const functionName = data.type;
  renderer[functionName](data as unknown as RenderArgs & ResetArgs & ResizeArgs);
};

export default self;
