import type { FunctionEvaluator } from "./functionParser";

export interface Point {
  x: number;
  y: number | null;
}

export interface Viewport {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

export const DEFAULT_SAMPLE_COUNT = 1000;

export function sampleFunction(
  evaluator: FunctionEvaluator,
  viewport: Viewport,
  sampleCount: number = DEFAULT_SAMPLE_COUNT,
): Point[] {
  const safeSampleCount = Math.max(2, Math.floor(sampleCount));
  const points: Point[] = [];
  const step = (viewport.xMax - viewport.xMin) / (safeSampleCount - 1);

  for (let index = 0; index < safeSampleCount; index += 1) {
    const x = viewport.xMin + step * index;
    const y = evaluator(x);
    points.push({ x, y });
  }

  return points;
}
