# Contributing to ShotX

## Principles

- Keep changes focused
- Avoid unrelated refactors in the same PR
- Preserve existing user work if you are touching exports, styling, or fetch behavior
- Prefer simple, maintainable UI controls over flashy but brittle interactions

## Development Workflow

1. Fork the repo and create a branch from `main`
2. Install dependencies with `pnpm install`
3. Start the dev server with `pnpm dev`
4. Make your changes
5. Run:

```bash
pnpm exec tsc --noEmit
```

6. Open a pull request with:
   - a short problem statement
   - a summary of the change
   - screenshots or screen recordings for UI work
   - testing notes

## Pull Request Guidelines

- Keep PRs readable and scoped
- Update documentation when behavior changes
- Note tradeoffs or known limitations explicitly
- If you change exported visuals, include before/after screenshots

## Reporting Issues

When filing a bug, include:

- expected behavior
- actual behavior
- reproduction steps
- browser and OS
- screenshots when relevant

## Code Style

- TypeScript-first
- Follow existing naming and file organization patterns
- Use Tailwind utilities consistently with the current codebase
- Prefer small, composable components over large monoliths
