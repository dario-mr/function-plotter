import type { JSX } from "react";
import type { Viewport } from "../lib/graphSampler";

interface ControlsProps {
  canPlay: boolean;
  isPlaying: boolean;
  speed: number;
  viewport: Record<keyof Viewport, string>;
  viewportError: string | null;
  onReset: () => void;
  onSpeedChange: (value: number) => void;
  onTogglePlayback: () => void;
  onViewportChange: (key: keyof Viewport, value: string) => void;
}

export function Controls(props: ControlsProps): JSX.Element {
  const {
    canPlay,
    isPlaying,
    speed,
    viewport,
    viewportError,
    onReset,
    onSpeedChange,
    onTogglePlayback,
    onViewportChange,
  } = props;

  return (
    <section className="flex h-full flex-col rounded-2xl border border-white/10 bg-slate-800/70 p-4 shadow-lg shadow-slate-950/30 backdrop-blur-sm">
      <p className="text-base font-semibold tracking-tight text-slate-50">Playback</p>

      <div className="mt-5">
        <div className="flex items-center justify-between text-sm text-slate-300">
          <label htmlFor="speed">Speed</label>
          <span>{speed.toFixed(2)}x</span>
        </div>
        <input
          id="speed"
          className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-700 accent-cyan-400"
          max="3"
          min="0.25"
          onChange={(event) => {
            onSpeedChange(Number(event.target.value));
          }}
          step="0.05"
          type="range"
          value={speed}
        />
      </div>

      <div className="mt-5">
        <p className="text-base font-semibold tracking-tight text-slate-100">Bounds</p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <label className="text-xs text-slate-400" htmlFor="xMin">
            xMin
            <input
              id="xMin"
              className="mt-1 block w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
              onChange={(event) => {
                onViewportChange("xMin", event.target.value);
              }}
              step="1"
              type="number"
              value={viewport.xMin}
            />
          </label>
          <label className="text-xs text-slate-400" htmlFor="xMax">
            xMax
            <input
              id="xMax"
              className="mt-1 block w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
              onChange={(event) => {
                onViewportChange("xMax", event.target.value);
              }}
              step="1"
              type="number"
              value={viewport.xMax}
            />
          </label>
          <label className="text-xs text-slate-400" htmlFor="yMin">
            yMin
            <input
              id="yMin"
              className="mt-1 block w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
              onChange={(event) => {
                onViewportChange("yMin", event.target.value);
              }}
              step="1"
              type="number"
              value={viewport.yMin}
            />
          </label>
          <label className="text-xs text-slate-400" htmlFor="yMax">
            yMax
            <input
              id="yMax"
              className="mt-1 block w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
              onChange={(event) => {
                onViewportChange("yMax", event.target.value);
              }}
              step="1"
              type="number"
              value={viewport.yMax}
            />
          </label>
        </div>
        {viewportError !== null ? (
          <p className="mt-3 text-sm text-rose-300">{viewportError}</p>
        ) : null}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          className="h-10 min-w-24 rounded-xl bg-cyan-400 px-3 py-2 text-sm font-semibold text-slate-950 transition enabled:hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
          disabled={!canPlay}
          onClick={onTogglePlayback}
          type="button"
        >
          {isPlaying ? "Pause" : "Play"}
        </button>

        <button
          className="h-10 min-w-24 rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm font-semibold text-slate-100 transition hover:border-cyan-300/40 hover:text-cyan-100"
          onClick={onReset}
          type="button"
        >
          Reset
        </button>
      </div>
    </section>
  );
}
