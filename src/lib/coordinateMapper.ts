import type { Viewport } from "./graphSampler";

export interface CanvasSize {
  width: number;
  height: number;
}

export function graphXToCanvasX(x: number, viewport: Viewport, canvasSize: CanvasSize): number {
  return ((x - viewport.xMin) / (viewport.xMax - viewport.xMin)) * canvasSize.width;
}

export function graphYToCanvasY(y: number, viewport: Viewport, canvasSize: CanvasSize): number {
  return (
    canvasSize.height - ((y - viewport.yMin) / (viewport.yMax - viewport.yMin)) * canvasSize.height
  );
}

export function canvasXToGraphX(x: number, viewport: Viewport, canvasSize: CanvasSize): number {
  return viewport.xMin + (x / canvasSize.width) * (viewport.xMax - viewport.xMin);
}

export function canvasYToGraphY(y: number, viewport: Viewport, canvasSize: CanvasSize): number {
  return (
    viewport.yMin + ((canvasSize.height - y) / canvasSize.height) * (viewport.yMax - viewport.yMin)
  );
}
