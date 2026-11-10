# City Planner — Turn-Based City-Building Board Game

A React + TypeScript + Tailwind board game: roll dice, develop land, and grow a city across 714 hexagonal tiles. Built with Vite, Zustand for state, canvas hex map.

## Features

- Turn-based engine: dice rolls, cards, milestones, pending-action overlay
- Hex map (714 tiles), district management, history log, save/load via `localStorage`
- Main menu, rules modal, settings, toasts, mobile tabs (Board / City map / Management)
- Fully typed game core in `src/game/` (board, engine, hex, cards, milestones)

## Run it

```bash
npm install
npm run dev      # Vite dev server
npm run build    # production build to dist/
npm run typecheck
```

Requires Node 18+.

## Structure

| Path | What it is |
| --- | --- |
| `src/game/` | Rules core: `engine.ts`, `board.ts`, `hex.ts`, `cards.ts`, `milestones.ts`, `store.ts` |
| `src/components/` | UI: `GameBoard`, `HexMap`, `DicePanel`, `ManagementPanel`, `MapPanel`, modals |
| `src/App.tsx` | Screen shell + mobile tabs |
| `index.html` | Vite entry |
