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
const SAMPLES_PER_X_UNIT = 64;
const MAX_SAMPLE_COUNT = 8000;

export function getRecommendedSampleCount(viewport: Viewport): number {
  const xRange = Math.max(0, viewport.xMax - viewport.xMin);
  const rangeDrivenSampleCount = Math.ceil(xRange * SAMPLES_PER_X_UNIT) + 1;

  return Math.min(MAX_SAMPLE_COUNT, Math.max(DEFAULT_SAMPLE_COUNT, rangeDrivenSampleCount));
}

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
