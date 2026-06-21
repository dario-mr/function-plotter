import type { JSX } from "react";

interface FunctionInputProps {
  expression: string;
  error: string | null;
  onChange: (value: string) => void;
}

const EXAMPLES = ["tan(x / 3)", "x^2 / 5", "sin(x) * x", "sqrt(abs(x))"];

export function FunctionInput(props: FunctionInputProps): JSX.Element {
  const { expression, error, onChange } = props;

  return (
    <section className="rounded-2xl border border-white/10 bg-slate-800/70 p-4 shadow-lg shadow-slate-950/30 backdrop-blur-sm">
      <label
        className="block text-base font-semibold tracking-tight text-slate-50"
        htmlFor="expression"
      >
        Function expression
      </label>

      <div className="mt-4">
        <input
          id="expression"
          className="block w-full min-w-0 rounded-xl border border-white/10 bg-slate-950 px-4 py-3 font-mono text-sm text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
          onChange={(event) => {
            onChange(event.target.value);
          }}
          placeholder="sin(x)"
          spellCheck={false}
          type="text"
          value={expression}
        />
      </div>

      {error !== null ? (
        <div aria-live="polite" className="mt-3 text-sm text-rose-300">
          {error}
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        {EXAMPLES.map((example) => (
          <button
            key={example}
            className="rounded-full border border-cyan-400/20 bg-cyan-400/8 px-3 py-1 text-xs font-medium text-cyan-100 transition hover:border-cyan-300/40 hover:bg-cyan-300/15"
            onClick={() => {
              onChange(example);
            }}
            type="button"
          >
            {example}
          </button>
        ))}
      </div>
    </section>
  );
}
