Goal
Build a simple Vite + React + TypeScript web app that lets the user enter a math function, draws it
progressively on a Cartesian canvas, and plays a tone whose pitch follows the current Y value.

Stack

- Vite
- React
- TypeScript with strict rules
- Tailwind CSS
- Canvas 2D API
- Web Audio API
- math.js
- ESLint
- Prettier

Implementation steps

1. Create project

npm create vite@latest function-sound -- --template react-ts
cd function-sound

npm install mathjs
npm install -D tailwindcss @tailwindcss/vite prettier eslint-config-prettier
eslint-plugin-react-hooks eslint-plugin-react-refresh @typescript-eslint/eslint-plugin
@typescript-eslint/parser

2. Configure TypeScript strictly

Update tsconfig.app.json:

{
"compilerOptions": {
"strict": true,
"noUncheckedIndexedAccess": true,
"noImplicitOverride": true,
"noPropertyAccessFromIndexSignature": true,
"exactOptionalPropertyTypes": true,
"noFallthroughCasesInSwitch": true,
"noImplicitReturns": true
}
}

Do not use any.
Prefer explicit types for function inputs/outputs.
Avoid unsafe casts.
Use unknown instead of any when needed.

3. Configure Tailwind

Create/update src/index.css:

@import "tailwindcss";

Configure Vite in vite.config.ts:

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
plugins: [react(), tailwindcss()],
});

4. Configure ESLint

Create eslint.config.js:

import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import prettier from "eslint-config-prettier";

export default tseslint.config(
js.configs.recommended,
...tseslint.configs.strictTypeChecked,
...tseslint.configs.stylisticTypeChecked,
{
languageOptions: {
parserOptions: {
projectService: true,
tsconfigRootDir: import.meta.dirname,
},
},
plugins: {
"react-hooks": reactHooks,
"react-refresh": reactRefresh,
},
rules: {
...reactHooks.configs.recommended.rules,
"react-refresh/only-export-components": "warn",
"@typescript-eslint/no-explicit-any": "error",
"@typescript-eslint/no-unused-vars": [
"error",
{ "argsIgnorePattern": "^_" }
],
"@typescript-eslint/consistent-type-imports": "error"
},
},
prettier
);

5. Configure Prettier

Create .prettierrc:

{
"semi": true,
"singleQuote": false,
"trailingComma": "all",
"printWidth": 100
}

Create .prettierignore:

dist
node_modules
coverage

6. Add package scripts

Update package.json scripts:

{
"dev": "vite",
"build": "tsc -b && vite build",
"preview": "vite preview",
"lint": "eslint .",
"format": "prettier . --write",
"format:check": "prettier . --check"
}

7. App structure

Create:

src/
App.tsx
main.tsx
index.css
lib/
functionParser.ts
graphSampler.ts
audioEngine.ts
coordinateMapper.ts
components/
FunctionInput.tsx
GraphCanvas.tsx
Controls.tsx

8. Function parser

In lib/functionParser.ts:

- Use math.js compile().
- Accept expressions like:
  - sin(x)
  - cos(x)
  - x^2
  - sqrt(abs(x))
  - log(abs(x) + 1)
- Return a safe evaluator:
  - input: x: number
  - output: number | null
- Catch parser/evaluation errors.
- Return null for NaN, Infinity, or invalid values.

9. Graph sampling

In lib/graphSampler.ts:

- Define:

type Point = {
x: number;
y: number | null;
};

- Sample the function from xMin to xMax.
- Use a configurable sample count, e.g. 1000.
- Skip invalid points by storing y as null.
- Default viewport:
  - xMin = -10
  - xMax = 10
  - yMin = -10
  - yMax = 10

10. Coordinate mapper

In lib/coordinateMapper.ts:

- Convert graph coordinates to canvas pixels.
- Implement:
  - graphXToCanvasX()
  - graphYToCanvasY()
  - canvasXToGraphX()
  - canvasYToGraphY()

Remember:

- Canvas Y grows downward.
- Graph Y grows upward.

11. Audio engine

In lib/audioEngine.ts:

Create a small class AudioEngine.

Responsibilities:

- Lazily create AudioContext on user interaction.
- Create OscillatorNode.
- Create GainNode.
- Start/stop sound.
- Update oscillator frequency from Y value.
- Clamp frequency between 80 and 2000 Hz.
- Keep gain low, e.g. 0.04.

Y to frequency mapping:

function yToFrequency(y: number): number {
const frequency = 220 \* Math.pow(2, y / 12);
return Math.min(2000, Math.max(80, frequency));
}

Use exponentialRampToValueAtTime or setTargetAtTime for smoother frequency changes.

12. Graph canvas

In components/GraphCanvas.tsx:

Props:

- expression: string
- isPlaying: boolean
- speed: number
- viewport config

Behavior:

- Draw axes and grid.
- Draw the function progressively from left to right.
- Use requestAnimationFrame.
- Track current sample index.
- On each animation frame:
  - clear canvas
  - draw grid
  - draw axes
  - draw function up to current index
  - update audio pitch using current valid Y value
- Stop audio when animation ends or when user pauses.

Use refs for:

- canvas element
- animation frame id
- audio engine
- current index

Clean up animation frame and audio on unmount.

13. UI

In App.tsx:

State:

- expression
- submittedExpression
- isPlaying
- speed
- error if parser fails

Initial expression:
sin(x)

Layout:

- Full-page centered app
- Header with title and short explanation
- Function input
- Play / Pause / Reset controls
- Speed slider
- Canvas card

Use Tailwind for styling.

14. Input behavior

FunctionInput:

- Text input for expression.
- Submit button.
- Pressing Enter applies the expression.
- Do not evaluate on every keystroke.
- Show examples below input:
  - sin(x)
  - x^2 / 5
  - sin(x) \* x
  - sqrt(abs(x))

15. Drawing details

Canvas:

- Use devicePixelRatio for crisp rendering.
- Resize canvas to container width.
- Keep a fixed logical height, e.g. 500px.
- Draw:
  - light grid
  - stronger X/Y axes
  - function line
  - current moving point

Handle discontinuities:

- If y is null, break the path.
- Do not connect across invalid values.

16. Safety and UX

- Audio must start only after user clicks Play.
- Handle browsers blocking AudioContext until interaction.
- Show a friendly error for invalid expressions.
- Disable Play if expression cannot be parsed.
- Stop audio when tab/app unmounts.
- Keep volume low by default.

17. Styling direction

Use a clean dark UI:

- Background: slate/neutral dark
- Main card: slightly lighter dark
- Canvas: near-white or very dark, but keep grid readable
- Accent color: blue/cyan
- Buttons: simple rounded Tailwind buttons
- Avoid overdesigning

18. Final checks

Run:

npm run format
npm run lint
npm run build

Fix all TypeScript, ESLint, and Prettier errors.

Acceptance criteria

- User can enter a function of x.
- App plots the function on Cartesian axes.
- Drawing progresses from left to right.
- A tone plays while drawing.
- Tone pitch changes based on current Y value.
- Invalid functions do not crash the app.
- App builds successfully with strict TypeScript.
- ESLint and Prettier pass.
