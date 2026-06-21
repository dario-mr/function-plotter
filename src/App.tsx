import type { JSX } from "react";
import { useEffect, useMemo, useState } from "react";
import { Controls } from "./components/Controls";
import { FunctionInput } from "./components/FunctionInput";
import { GraphCanvas } from "./components/GraphCanvas";
import { getFunctionValidationMessage } from "./lib/functionParser";
import type { Viewport } from "./lib/graphSampler";
import {
  loadStoredExpression,
  loadStoredSpeed,
  loadStoredViewport,
  saveStoredExpression,
  saveStoredSpeed,
  saveStoredViewport,
} from "./lib/storage";

const INITIAL_EXPRESSION = "sin(x)";
const DEFAULT_VIEWPORT: Viewport = {
  xMin: -10,
  xMax: 10,
  yMin: -10,
  yMax: 10,
};

function getViewportValidationMessage(viewport: Viewport): string | null {
  if (viewport.xMin >= viewport.xMax) {
    return "xMin must be smaller than xMax.";
  }

  if (viewport.yMin >= viewport.yMax) {
    return "yMin must be smaller than yMax.";
  }

  return null;
}

function App(): JSX.Element {
  const [expression, setExpression] = useState<string>(() =>
    loadStoredExpression(INITIAL_EXPRESSION, getFunctionValidationMessage),
  );
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(() => loadStoredSpeed(1));
  const [viewport, setViewport] = useState<Viewport>(() =>
    loadStoredViewport(DEFAULT_VIEWPORT, getViewportValidationMessage),
  );
  const [error, setError] = useState<string | null>(null);
  const [resetSignal, setResetSignal] = useState<number>(0);
  const [hasCompletedPlayback, setHasCompletedPlayback] = useState<boolean>(false);

  const expressionError = useMemo<string | null>(() => {
    return getFunctionValidationMessage(expression);
  }, [expression]);

  const viewportError = useMemo<string | null>(() => {
    return getViewportValidationMessage(viewport);
  }, [viewport]);

  const canPlay = expressionError === null && viewportError === null;

  const handleExpressionChange = (nextExpression: string): void => {
    setExpression(nextExpression);
    setError(getFunctionValidationMessage(nextExpression));
    setIsPlaying(false);
    setHasCompletedPlayback(false);
    setResetSignal((currentValue) => currentValue + 1);
  };

  const handleTogglePlayback = (): void => {
    if (isPlaying) {
      setIsPlaying(false);
      return;
    }

    const nextExpressionError = getFunctionValidationMessage(expression);
    if (nextExpressionError !== null) {
      setError(nextExpressionError);
      return;
    }

    if (viewportError !== null) {
      return;
    }

    setError(null);
    if (hasCompletedPlayback) {
      setResetSignal((currentValue) => currentValue + 1);
      setHasCompletedPlayback(false);
    }
    setIsPlaying(true);
  };

  const handleReset = (): void => {
    setIsPlaying(false);
    setHasCompletedPlayback(false);
    setResetSignal((currentValue) => currentValue + 1);
  };

  const handleViewportChange = (key: keyof Viewport, value: number): void => {
    setViewport((currentViewport) => ({
      ...currentViewport,
      [key]: value,
    }));
    setIsPlaying(false);
    setHasCompletedPlayback(false);
    setResetSignal((currentValue) => currentValue + 1);
  };

  const handleAnimationComplete = (): void => {
    setIsPlaying(false);
    setHasCompletedPlayback(true);
  };

  useEffect(() => {
    if (expressionError !== null) {
      return;
    }

    saveStoredExpression(expression);
  }, [expression, expressionError]);

  useEffect(() => {
    saveStoredSpeed(speed);
  }, [speed]);

  useEffect(() => {
    if (viewportError !== null) {
      return;
    }

    saveStoredViewport(viewport);
  }, [viewport, viewportError]);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.16),transparent_35%),linear-gradient(180deg,#020617_0%,#0f172a_42%,#111827_100%)] text-slate-100">
      <div className="mx-auto w-full max-w-6xl px-4 pb-8 pt-4 sm:px-6 lg:px-8">
        <div className="grid w-full items-start gap-8 lg:grid-cols-[340px_minmax(0,1fr)]">
          <div className="space-y-6">
            <FunctionInput
              expression={expression}
              error={error}
              onChange={handleExpressionChange}
            />

            <Controls
              canPlay={canPlay}
              isPlaying={isPlaying}
              speed={speed}
              viewport={viewport}
              viewportError={viewportError}
              onReset={handleReset}
              onSpeedChange={setSpeed}
              onTogglePlayback={handleTogglePlayback}
              onViewportChange={handleViewportChange}
            />
          </div>

          <GraphCanvas
            expression={expression}
            isPlaying={isPlaying}
            onAnimationComplete={handleAnimationComplete}
            resetSignal={resetSignal}
            speed={speed}
            viewport={viewport}
          />
        </div>
      </div>
    </main>
  );
}

export default App;
