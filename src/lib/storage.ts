import type { Viewport } from "./graphSampler";

const STORAGE_KEYS = {
  expression: "function-plotter.expression",
  speed: "function-plotter.speed",
  viewport: "function-plotter.viewport",
} as const;

type ValidationFn<TValue> = (value: TValue) => string | null;

export function loadStoredExpression(
  fallbackExpression: string,
  validateExpression: ValidationFn<string>,
): string {
  if (typeof window === "undefined") {
    return fallbackExpression;
  }

  const storedExpression = window.localStorage.getItem(STORAGE_KEYS.expression);
  if (storedExpression === null) {
    return fallbackExpression;
  }

  return validateExpression(storedExpression) === null ? storedExpression : fallbackExpression;
}

export function saveStoredExpression(expression: string): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEYS.expression, expression);
}

export function loadStoredSpeed(fallbackSpeed: number): number {
  if (typeof window === "undefined") {
    return fallbackSpeed;
  }

  const storedSpeed = window.localStorage.getItem(STORAGE_KEYS.speed);
  if (storedSpeed === null) {
    return fallbackSpeed;
  }

  const parsedSpeed = Number(storedSpeed);
  if (!Number.isFinite(parsedSpeed)) {
    return fallbackSpeed;
  }

  return Math.min(3, Math.max(0.25, parsedSpeed));
}

export function saveStoredSpeed(speed: number): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEYS.speed, String(speed));
}

export function loadStoredViewport(
  fallbackViewport: Viewport,
  validateViewport: ValidationFn<Viewport>,
): Viewport {
  if (typeof window === "undefined") {
    return fallbackViewport;
  }

  const storedViewport = window.localStorage.getItem(STORAGE_KEYS.viewport);
  if (storedViewport === null) {
    return fallbackViewport;
  }

  try {
    const parsedViewport: unknown = JSON.parse(storedViewport);
    if (!isViewportLike(parsedViewport)) {
      return fallbackViewport;
    }

    const nextViewport: Viewport = {
      xMin: Number(parsedViewport.xMin),
      xMax: Number(parsedViewport.xMax),
      yMin: Number(parsedViewport.yMin),
      yMax: Number(parsedViewport.yMax),
    };

    if (
      !Number.isFinite(nextViewport.xMin) ||
      !Number.isFinite(nextViewport.xMax) ||
      !Number.isFinite(nextViewport.yMin) ||
      !Number.isFinite(nextViewport.yMax)
    ) {
      return fallbackViewport;
    }

    return validateViewport(nextViewport) === null ? nextViewport : fallbackViewport;
  } catch {
    return fallbackViewport;
  }
}

export function saveStoredViewport(viewport: Viewport): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEYS.viewport, JSON.stringify(viewport));
}

function isViewportLike(value: unknown): value is Record<keyof Viewport, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    "xMin" in value &&
    "xMax" in value &&
    "yMin" in value &&
    "yMax" in value
  );
}
