import type { GameState, NaturalType, Tile } from './types'

export const HEX_COLS = 34
export const HEX_ROWS = 21
export const HEX_RADIUS = 21
export const SQRT3 = Math.sqrt(3)
export const TILE_TOTAL = HEX_COLS * HEX_ROWS

export const DIRS: Array<[number, number]> = [
  [1, 0],
  [1, -1],
  [0, -1],
  [-1, 0],
  [-1, 1],
  [0, 1],
]

export function tileId(col: number, row: number): string {
  return `${col},${row}`
}

export function axialOf(col: number, row: number): { q: number; r: number } {
  return { q: col - Math.floor(row / 2), r: row }
}

export function offsetOf(q: number, r: number): { col: number; row: number } {
  return { col: q + Math.floor(r / 2), row: r }
}

export function hexCenter(q: number, r: number): { x: number; y: number } {
  return { x: SQRT3 * (q + r / 2) * HEX_RADIUS, y: 1.5 * r * HEX_RADIUS }
}

export function hexCorners(cx: number, cy: number, radius = HEX_RADIUS): string {
  const points: string[] = []
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 180) * (60 * i - 90)
    points.push(`${(cx + radius * Math.cos(angle)).toFixed(2)},${(cy + radius * Math.sin(angle)).toFixed(2)}`)
  }
  return points.join(' ')
}

/** Deterministic pseudo-random generator so a saved seed always rebuilds the same landscape. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function hash2(x: number, y: number, seed: number): number {
  let h = x * 374761393 + y * 668265263 + seed * 1274126177
  h = (h ^ (h >>> 13)) * 1274126177
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296
}

function smoothNoise(x: number, y: number, seed: number): number {
  const xi = Math.floor(x)
  const yi = Math.floor(y)
  const xf = x - xi
  const yf = y - yi
  const u = xf * xf * (3 - 2 * xf)
  const v = yf * yf * (3 - 2 * yf)
  const a = hash2(xi, yi, seed)
  const b = hash2(xi + 1, yi, seed)
  const c = hash2(xi, yi + 1, seed)
  const d = hash2(xi + 1, yi + 1, seed)
  return (a * (1 - u) + b * u) * (1 - v) + (c * (1 - u) + d * u) * v
}

function fbm(x: number, y: number, seed: number, octaves = 4): number {
  let value = 0
  let amplitude = 0.55
  let frequency = 1
  let total = 0
  for (let i = 0; i < octaves; i++) {
    value += amplitude * smoothNoise(x * frequency, y * frequency, seed + i * 31)
    total += amplitude
    amplitude *= 0.5
    frequency *= 2
  }
  return value / total
}

function pickNatural(elevation: number, moisture: number): NaturalType {
  if (elevation < 0.335) return 'lake'
  if (elevation < 0.375) return 'beach'
  if (elevation > 0.715) return 'hill'
  if (moisture > 0.655) return 'forest'
  if (moisture > 0.575 && elevation < 0.47) return 'wetland'
  return 'grass'
}

export function createTiles(seed: number): Record<string, Tile> {
  const tiles: Record<string, Tile> = {}
  for (let row = 0; row < HEX_ROWS; row++) {
    for (let col = 0; col < HEX_COLS; col++) {
      const { q, r } = axialOf(col, row)
      const elevation = fbm(col / 7.5 + 0.5, row / 5.2 + 0.5, seed)
      const moisture = fbm(col / 9.3 + 11.4, row / 7.1 + 3.2, seed + 977)
      tiles[tileId(col, row)] = {
        id: tileId(col, row),
        q,
        r,
        col,
        row,
        natural: pickNatural(elevation, moisture),
        road: false,
        development: null,
      }
    }
  }
  return tiles
}

export function neighborTiles(game: GameState, tile: Tile): Tile[] {
  const result: Tile[] = []
  for (const [dq, dr] of DIRS) {
    const { col, row } = offsetOf(tile.q + dq, tile.r + dr)
    const neighbor = game.tiles[tileId(col, row)]
    if (neighbor) result.push(neighbor)
  }
  return result
}

/**
 * Breadth-first footprint of `size` hexes grown from the anchor, spilling into
 * neighbouring free land. Returns fewer ids when the space runs out.
 */
export function footprintIds(tiles: Record<string, Tile>, anchorId: string, size: number): string[] {
  const anchor = tiles[anchorId]
  if (!anchor) return []
  const result = [anchorId]
  const seen = new Set(result)
  const queue: Tile[] = [anchor]
  while (result.length < size && queue.length > 0) {
    const current = queue.shift() as Tile
    for (const [dq, dr] of DIRS) {
      const { col, row } = offsetOf(current.q + dq, current.r + dr)
      const id = tileId(col, row)
      const next = tiles[id]
      if (next && !seen.has(id)) {
        seen.add(id)
        result.push(id)
        queue.push(next)
        if (result.length >= size) break
      }
    }
  }
  return result
}

/** Bounding box for the whole board in SVG user units, with padding. */
export const MAP_BOUNDS = (() => {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (let row = 0; row < HEX_ROWS; row++) {
    for (let col = 0; col < HEX_COLS; col++) {
      const { q, r } = axialOf(col, row)
      const { x, y } = hexCenter(q, r)
      minX = Math.min(minX, x - SQRT3 * HEX_RADIUS * 0.5)
      maxX = Math.max(maxX, x + SQRT3 * HEX_RADIUS * 0.5)
      minY = Math.min(minY, y - HEX_RADIUS)
      maxY = Math.max(maxY, y + HEX_RADIUS)
    }
  }
  const pad = 24
  return {
    x: minX - pad,
    y: minY - pad,
    width: maxX - minX + pad * 2,
    height: maxY - minY + pad * 2,
  }
})()
