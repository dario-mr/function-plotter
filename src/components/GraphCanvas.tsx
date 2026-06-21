import type { JSX } from "react";
import { useEffect, useEffectEvent, useMemo, useRef, useState } from "react";
import { AudioEngine } from "../lib/audioEngine";
import { graphXToCanvasX, graphYToCanvasY, type CanvasSize } from "../lib/coordinateMapper";
import { createFunctionEvaluator, getFunctionValidationMessage } from "../lib/functionParser";
import { sampleFunction, type Point, type Viewport } from "../lib/graphSampler";

const LOGICAL_CANVAS_HEIGHT_MOBILE = 500;
const LOGICAL_CANVAS_HEIGHT_DESKTOP = 660;
const SAMPLE_COUNT = 1000;
const SAMPLES_PER_SECOND = 240;

interface GraphCanvasProps {
  expression: string;
  isPlaying: boolean;
  onAnimationComplete: () => void;
  resetSignal: number;
  speed: number;
  viewport: Viewport;
}

interface CanvasDimensions {
  width: number;
  height: number;
}

export function GraphCanvas(props: GraphCanvasProps): JSX.Element {
  const { expression, isPlaying, onAnimationComplete, resetSignal, speed, viewport } = props;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioEngineRef = useRef<AudioEngine>(new AudioEngine());
  const currentSampleIndexRef = useRef<number>(0);
  const fractionalProgressRef = useRef<number>(0);
  const lastTimestampRef = useRef<number | null>(null);
  const [canvasDimensions, setCanvasDimensions] = useState<CanvasDimensions>({
    width: 0,
    height: LOGICAL_CANVAS_HEIGHT_MOBILE,
  });

  const expressionError = useMemo<string | null>(() => {
    return getFunctionValidationMessage(expression);
  }, [expression]);

  const points = useMemo<Point[]>(() => {
    if (expressionError !== null) {
      return [];
    }

    const evaluator = createFunctionEvaluator(expression);
    return sampleFunction(evaluator, viewport, SAMPLE_COUNT);
  }, [expression, expressionError, viewport]);

  const drawScene = useEffectEvent((): void => {
    const canvas = canvasRef.current;
    if (canvas === null || canvasDimensions.width === 0) {
      return;
    }

    const context = canvas.getContext("2d");
    if (context === null) {
      return;
    }

    const dpr = window.devicePixelRatio || 1;
    const displayWidth = canvasDimensions.width;
    const displayHeight = canvasDimensions.height;
    const pixelWidth = Math.floor(displayWidth * dpr);
    const pixelHeight = Math.floor(displayHeight * dpr);

    if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
      canvas.width = pixelWidth;
      canvas.height = pixelHeight;
      canvas.style.width = `${String(displayWidth)}px`;
      canvas.style.height = `${String(displayHeight)}px`;
    }

    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.clearRect(0, 0, displayWidth, displayHeight);
    context.fillStyle = "#e2e8f0";
    context.fillRect(0, 0, displayWidth, displayHeight);

    const logicalCanvasSize: CanvasSize = {
      width: displayWidth,
      height: displayHeight,
    };

    drawGrid(context, viewport, logicalCanvasSize);
    drawAxes(context, viewport, logicalCanvasSize);

    if (points.length > 0) {
      drawFunction(context, points, viewport, logicalCanvasSize, currentSampleIndexRef.current);
      drawCurrentPoint(context, points, viewport, logicalCanvasSize, currentSampleIndexRef.current);
    }
  });

  const handleAnimationComplete = useEffectEvent((): void => {
    onAnimationComplete();
  });

  useEffect(() => {
    const container = containerRef.current;
    if (container === null) {
      return undefined;
    }

    const updateDimensions = (): void => {
      const nextHeight =
        window.innerWidth >= 1024 ? LOGICAL_CANVAS_HEIGHT_DESKTOP : LOGICAL_CANVAS_HEIGHT_MOBILE;

      setCanvasDimensions({
        width: Math.max(320, Math.floor(container.clientWidth)),
        height: nextHeight,
      });
    };

    updateDimensions();

    const resizeObserver = new ResizeObserver(() => {
      updateDimensions();
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    currentSampleIndexRef.current = 0;
    fractionalProgressRef.current = 0;
    lastTimestampRef.current = null;
    audioEngineRef.current.stop();
    drawScene();
  }, [expression, viewport, resetSignal, points]);

  useEffect(() => {
    drawScene();
  }, [canvasDimensions, points, viewport]);

  useEffect(() => {
    if (!isPlaying || expressionError !== null || points.length === 0) {
      cancelAnimation();
      audioEngineRef.current.stop();
      drawScene();
      return undefined;
    }

    let isCancelled = false;
    const audioEngine = audioEngineRef.current;

    void audioEngine.start().then(() => {
      if (isCancelled) {
        return;
      }

      const step = (timestamp: number): void => {
        lastTimestampRef.current ??= timestamp;

        const previousTimestamp = lastTimestampRef.current;
        const deltaSeconds = (timestamp - previousTimestamp) / 1000;
        lastTimestampRef.current = timestamp;

        const nextProgress =
          fractionalProgressRef.current + deltaSeconds * SAMPLES_PER_SECOND * speed;
        const stepCount = Math.floor(nextProgress);
        fractionalProgressRef.current = nextProgress - stepCount;

        if (stepCount > 0) {
          currentSampleIndexRef.current = Math.min(
            currentSampleIndexRef.current + stepCount,
            Math.max(points.length - 1, 0),
          );
        }

        const currentPoint = getNearestValidPoint(points, currentSampleIndexRef.current);
        if (currentPoint?.y != null) {
          audioEngine.updateFromY(currentPoint.y);
        }

        drawScene();

        if (currentSampleIndexRef.current >= points.length - 1) {
          cancelAnimation();
          audioEngine.stop();
          handleAnimationComplete();
          return;
        }

        animationFrameRef.current = window.requestAnimationFrame(step);
      };

      animationFrameRef.current = window.requestAnimationFrame(step);
    });

    return () => {
      isCancelled = true;
      cancelAnimation();
      audioEngine.stop();
    };
  }, [expressionError, isPlaying, points, speed]);

  useEffect(() => {
    const audioEngine = audioEngineRef.current;

    return () => {
      cancelAnimation();
      audioEngine.dispose();
    };
  }, []);
  return (
    <section>
      <div className="overflow-hidden rounded-2xl bg-slate-100" ref={containerRef}>
        <canvas
          aria-label={`Graph of ${expression}`}
          className="block h-[500px] w-full lg:h-[660px]"
          ref={canvasRef}
        />
      </div>
    </section>
  );

  function cancelAnimation(): void {
    if (animationFrameRef.current !== null) {
      window.cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    lastTimestampRef.current = null;
    fractionalProgressRef.current = 0;
  }
}

function drawGrid(
  context: CanvasRenderingContext2D,
  viewport: Viewport,
  canvasSize: CanvasSize,
): void {
  context.save();
  context.strokeStyle = "rgba(148, 163, 184, 0.25)";
  context.lineWidth = 1;

  for (let x = Math.ceil(viewport.xMin); x <= Math.floor(viewport.xMax); x += 1) {
    const canvasX = graphXToCanvasX(x, viewport, canvasSize);
    context.beginPath();
    context.moveTo(canvasX, 0);
    context.lineTo(canvasX, canvasSize.height);
    context.stroke();
  }

  for (let y = Math.ceil(viewport.yMin); y <= Math.floor(viewport.yMax); y += 1) {
    const canvasY = graphYToCanvasY(y, viewport, canvasSize);
    context.beginPath();
    context.moveTo(0, canvasY);
    context.lineTo(canvasSize.width, canvasY);
    context.stroke();
  }

  context.restore();
}

function drawAxes(
  context: CanvasRenderingContext2D,
  viewport: Viewport,
  canvasSize: CanvasSize,
): void {
  context.save();
  context.strokeStyle = "rgba(15, 23, 42, 0.85)";
  context.lineWidth = 1.5;

  if (viewport.xMin <= 0 && viewport.xMax >= 0) {
    const axisX = graphXToCanvasX(0, viewport, canvasSize);
    context.beginPath();
    context.moveTo(axisX, 0);
    context.lineTo(axisX, canvasSize.height);
    context.stroke();
  }

  if (viewport.yMin <= 0 && viewport.yMax >= 0) {
    const axisY = graphYToCanvasY(0, viewport, canvasSize);
    context.beginPath();
    context.moveTo(0, axisY);
    context.lineTo(canvasSize.width, axisY);
    context.stroke();
  }

  context.restore();
}

function drawFunction(
  context: CanvasRenderingContext2D,
  points: Point[],
  viewport: Viewport,
  canvasSize: CanvasSize,
  visibleIndex: number,
): void {
  context.save();
  context.strokeStyle = "#0891b2";
  context.lineWidth = 2.5;
  context.lineJoin = "round";
  context.lineCap = "round";

  let hasStartedSegment = false;

  for (let index = 0; index <= visibleIndex && index < points.length; index += 1) {
    const point = points[index];
    if (point?.y == null) {
      hasStartedSegment = false;
      continue;
    }

    const canvasX = graphXToCanvasX(point.x, viewport, canvasSize);
    const canvasY = graphYToCanvasY(point.y, viewport, canvasSize);

    if (!hasStartedSegment) {
      context.beginPath();
      context.moveTo(canvasX, canvasY);
      hasStartedSegment = true;
      continue;
    }

    context.lineTo(canvasX, canvasY);

    const nextPoint = points[index + 1];
    if (nextPoint?.y == null || index === visibleIndex) {
      context.stroke();
      hasStartedSegment = false;
    }
  }

  context.restore();
}

function drawCurrentPoint(
  context: CanvasRenderingContext2D,
  points: Point[],
  viewport: Viewport,
  canvasSize: CanvasSize,
  currentIndex: number,
): void {
  const point = getNearestValidPoint(points, currentIndex);
  if (point?.y == null) {
    return;
  }

  context.save();
  context.fillStyle = "#22d3ee";
  context.strokeStyle = "rgba(8, 145, 178, 0.22)";
  context.lineWidth = 8;

  const canvasX = graphXToCanvasX(point.x, viewport, canvasSize);
  const canvasY = graphYToCanvasY(point.y, viewport, canvasSize);

  context.beginPath();
  context.arc(canvasX, canvasY, 5, 0, Math.PI * 2);
  context.fill();

  context.beginPath();
  context.arc(canvasX, canvasY, 11, 0, Math.PI * 2);
  context.stroke();
  context.restore();
}

function getNearestValidPoint(points: Point[], startingIndex: number): Point | undefined {
  for (let index = Math.min(startingIndex, points.length - 1); index >= 0; index -= 1) {
    const point = points[index];
    if (point?.y != null) {
      return point;
    }
  }

  return undefined;
}
