# Function Plotter

A small React web app for plotting math functions and turning the graph into sound.

You can enter an expression in terms of `x`, preview it on a Cartesian canvas, and play an animation
that draws the function from left to right while a tone changes pitch based on the current `y`
value.

## Features

- Live function input with validation
- Progressive graph drawing on canvas
- Web Audio playback mapped from `y` values
- Adjustable speed
- Editable `x`/`y` viewport bounds
- Local storage for the last valid function, speed, and bounds

## Tech Stack

- Vite
- React
- TypeScript
- Tailwind
- Canvas 2D API
- Web Audio API
- math.js

## Local Development

Install dependencies:

```bash
npm install
```

Start the dev server:

```bash
npm run dev
```

Build the app:

```bash
npm run build
```

Run linting:

```bash
npm run lint
```

Format the codebase:

```bash
npm run format
```

## Health And Info

The production build generates:

- `dist/health.json`
- `dist/info.json`

In the Docker/nginx runtime these are exposed as:

- `/health`
- `/info`

## Docker

Build the image:

```bash
docker build -t function-plotter .
```

Run it locally:

```bash
docker run --rm -p 8080:80 function-plotter
```

Then open:

- `http://localhost:8080/`
- `http://localhost:8080/health`
- `http://localhost:8080/info`
