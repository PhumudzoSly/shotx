# ShotX

ShotX is an open-source Next.js app for turning X/Twitter posts into clean, shareable screenshots.

It supports fetching live tweet data, framing posts for common social aspect ratios, exporting PNGs, switching tweet light/dark presentation, adding glass and shadow treatments, and using gradient or image-based backgrounds.

## Features

- Fetch tweet data directly from public X/Twitter URLs
- Export polished screenshots as PNG
- Choose from multiple frame presets:
  - LinkedIn/X post
  - Square
  - Instagram Story
- Switch tweet theme independently from the app UI
- Add frosted-glass treatment to the tweet card
- Tune background blur, card padding, scale, roundness, and shadow angle/depth
- Upload custom background images
- Include reply context and attached media when available

## Stack

- Next.js 16
- React 19
- Tailwind CSS v4
- shadcn/ui primitives
- `html-to-image` for export

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm recommended

### Install

```bash
pnpm install
```

### Run locally

```bash
pnpm dev
```

Open `http://localhost:3000`.

## Scripts

```bash
pnpm dev
pnpm build
pnpm start
pnpm exec tsc --noEmit
```

Note: the current `lint` script points to ESLint, but ESLint is not installed in this repository yet.

## How Tweet Fetching Works

ShotX uses X/Twitter's public syndication endpoint from the server route in [`app/api/tweet/route.ts`](./app/api/tweet/route.ts). That means:

- no API keys are required
- some tweets may be unavailable depending on X/Twitter restrictions
- the app depends on a third-party endpoint that can change without notice

If a tweet cannot be fetched, the app falls back to demo content for previewing the UI.

## Project Structure

```text
app/                Next.js app router pages and API routes
components/         UI and feature components
lib/                shared helpers and background presets
public/             static assets
styles/             extra global styles
```

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](./CONTRIBUTING.md).

If you want to work on the project:

1. Fork the repository
2. Create a feature branch
3. Make focused changes
4. Run a type check before opening a PR
5. Open a pull request with a clear summary and screenshots for UI changes

## Roadmap

- Improve mobile editing ergonomics
- Add test coverage for the tweet fetch route and UI behavior
- Add optional manual tweet editing
- Add templates for more output formats
- Install and configure ESLint

## License

[MIT](./LICENSE)
