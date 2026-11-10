import { memo, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useGame } from '../game/store'
import { HEX_RADIUS, MAP_BOUNDS, SQRT3, footprintIds, hexCenter, hexCorners, offsetOf, tileId } from '../game/hex'
import { CATEGORIES, NATURAL_COLORS } from '../game/content'
import type { Tile } from '../game/types'
import { BuildingGlyph } from './BuildingGlyph'

const BASE_W = Math.ceil(MAP_BOUNDS.width)
const BASE_H = Math.ceil(MAP_BOUNDS.height)
const R = HEX_RADIUS
const ROAD = '#575e60'

function centerOf(tile: Tile) {
  const { x, y } = hexCenter(tile.q, tile.r)
  return { x: x - MAP_BOUNDS.x, y: y - MAP_BOUNDS.y }
}

function neighborCenter(tile: Tile, dq: number, dr: number) {
  const { x, y } = hexCenter(tile.q + dq, tile.r + dr)
  return { x: x - MAP_BOUNDS.x, y: y - MAP_BOUNDS.y }
}

const HEX_DIRS = [
  [1, 0],
  [0, 1],
  [-1, 1],
  [-1, 0],
  [0, -1],
  [1, -1],
] as const

const TerrainTile = memo(function TerrainTile({ tile }: { tile: Tile }) {
  const c = centerOf(tile)
  const points = hexCorners(c.x, c.y, R - 0.15)
  const dev = tile.development
  const natural = NATURAL_COLORS[tile.natural]
  const fill = dev ? CATEGORIES[dev.categoryId].color : natural.fill
  return (
    <g data-tile-id={tile.id}>
      <polygon data-tile-id={tile.id} points={points} fill={fill} stroke="#f7f4ec" strokeWidth={1.1} />
      {!dev && tile.natural === 'forest' ? (
        <g pointerEvents="none" opacity={0.75} stroke="#78956a" strokeWidth={0.9} fill="none">
          <path d={`M${c.x - 8} ${c.y + 5}l4-7 4 7z`} />
          <path d={`M${c.x + 1} ${c.y + 8}l4-8 4 8z`} />
          <path d={`M${c.x - 4} ${c.y - 9}l4-7 4 7z`} />
        </g>
      ) : null}
      {!dev && (tile.natural === 'lake' || tile.natural === 'wetland') ? (
        <g pointerEvents="none" stroke="#8ab8cd" strokeWidth={1} fill="none" opacity={0.75}>
          <path d={`M${c.x - 9} ${c.y}q4.5-3.4 9 0t9 0`} />
          <path d={`M${c.x - 9} ${c.y + 6}q4.5-3.4 9 0t9 0`} />
        </g>
      ) : null}
      {!dev && tile.natural === 'hill' ? (
        <g pointerEvents="none" stroke="#b3a682" strokeWidth={1.1} fill="none" opacity={0.8}>
          <path d={`M${c.x - 10} ${c.y + 5}l6-8 5 5 4-4 6 7`} />
        </g>
      ) : null}
      {tile.road && !dev ? <circle cx={c.x} cy={c.y} r={2.1} fill={ROAD} /> : null}
    </g>
  )
})

export function HexMap({
  placing,
  selectedId,
  onSelect,
  onPlace,
}: {
  placing: { size: number; color: string; anchorId: string | null } | null
  selectedId: string | null
  onSelect: (id: string | null) => void
  onPlace: (id: string) => void
}) {
  const game = useGame((state) => state.game)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const dragRef = useRef<{ x: number; y: number; ox: number; oy: number; moved: boolean } | null>(null)
  const interacted = useRef(false)
  const [view, setView] = useState({ x: 0, y: 0, k: 1 })
  const [hover, setHover] = useState<string | null>(null)
  const [pointer, setPointer] = useState({ x: 0, y: 0 })

  const tiles = game?.tiles ?? {}
  const tileList = Object.values(tiles)

  const fit = useCallback(() => {
    const element = containerRef.current
    if (!element) return
    const rect = element.getBoundingClientRect()
    if (rect.width < 20 || rect.height < 20) return
    const k = Math.min(rect.width / BASE_W, rect.height / BASE_H) * 0.98
    setView({ k, x: (rect.width - BASE_W * k) / 2, y: (rect.height - BASE_H * k) / 2 })
  }, [])

  useLayoutEffect(() => {
    fit()
    const element = containerRef.current
    if (!element) return
    const observer = new ResizeObserver(() => {
      if (!interacted.current) fit()
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [fit])

  useEffect(() => {
    const element = containerRef.current
    if (!element) return
    const onWheel = (event: WheelEvent) => {
      event.preventDefault()
      interacted.current = true
      const rect = element.getBoundingClientRect()
      const mx = event.clientX - rect.left
      const my = event.clientY - rect.top
      setView((current) => {
        const factor = Math.exp(-event.deltaY * 0.0016)
        const k = Math.min(3, Math.max(0.32, current.k * factor))
        const ratio = k / current.k
        return { k, x: mx - (mx - current.x) * ratio, y: my - (my - current.y) * ratio }
      })
    }
    element.addEventListener('wheel', onWheel, { passive: false })
    return () => element.removeEventListener('wheel', onWheel)
  }, [])

  const zoomBy = (factor: number) => {
    const element = containerRef.current
    if (!element) return
    const rect = element.getBoundingClientRect()
    const mx = rect.width / 2
    const my = rect.height / 2
    interacted.current = true
    setView((current) => {
      const k = Math.min(3, Math.max(0.32, current.k * factor))
      const ratio = k / current.k
      return { k, x: mx - (mx - current.x) * ratio, y: my - (my - current.y) * ratio }
    })
  }

  const handleActivate = (id: string) => {
    if (placing) onPlace(id)
    else onSelect(selectedId === id ? null : id)
  }

  const previewSource = hover ?? placing?.anchorId ?? null
  const preview = previewSource && placing ? footprintIds(tiles, previewSource, placing.size) : []
  const previewValid =
    preview.length === placing?.size && preview.every((id) => tiles[id] && !tiles[id].development)
  const selected = selectedId ? tiles[selectedId] : null
  const hovered = hover && !placing ? tiles[hover] : null

  return (
    <div className="relative h-full min-h-[320px] w-full min-w-0 overflow-hidden rounded-xl bg-[#eef0e6]">
      <div
        ref={containerRef}
        className="h-full w-full cursor-grab touch-none active:cursor-grabbing"
        onPointerDown={(event) => {
          dragRef.current = { x: event.clientX, y: event.clientY, ox: view.x, oy: view.y, moved: false }
        }}
        onPointerMove={(event) => {
          const drag = dragRef.current
          if (drag) {
            const dx = event.clientX - drag.x
            const dy = event.clientY - drag.y
            if (Math.abs(dx) > 3 || Math.abs(dy) > 3) drag.moved = true
            if (drag.moved) {
              interacted.current = true
              setView((current) => ({ ...current, x: drag.ox + dx, y: drag.oy + dy }))
            }
          }
          setPointer({ x: event.clientX, y: event.clientY })
        }}
        onPointerUp={(event) => {
          const drag = dragRef.current
          dragRef.current = null
          if (!drag || drag.moved) return
          const element = document.elementFromPoint(event.clientX, event.clientY) as Element | null
          const target = element?.closest('[data-tile-id]')
          const id = target?.getAttribute('data-tile-id')
          if (id) handleActivate(id)
          else onSelect(null)
        }}
        onPointerLeave={() => {
          dragRef.current = null
          setHover(null)
        }}
        onPointerOver={(event) => {
          const element = event.target as Element
          const target = element.closest('[data-tile-id]')
          const id = target?.getAttribute('data-tile-id') ?? null
          setHover(id)
        }}
      >
        <div
          className="origin-top-left"
          style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.k})`, width: BASE_W, height: BASE_H }}
        >
          <svg width={BASE_W} height={BASE_H} viewBox={`0 0 ${BASE_W} ${BASE_H}`} className="block select-none">
            <rect width={BASE_W} height={BASE_H} fill="#eef0e6" />
            <g>
              {tileList.map((tile) => (
                <TerrainTile key={tile.id} tile={tile} />
              ))}
            </g>

            {/* Road network */}
            <g pointerEvents="none">
              {tileList.map((tile) => {
                if (!tile.road || tile.development) return null
                const c = centerOf(tile)
                const connections = HEX_DIRS.map(([dq, dr]) => {
                  const { col, row } = offsetOf(tile.q + dq, tile.r + dr)
                  const neighbor = tiles[tileId(col, row)]
                  if (!neighbor) return null
                  if (!neighbor.road && !neighbor.development) return null
                  const nc = neighborCenter(tile, dq, dr)
                  return { x: nc.x, y: nc.y, developed: Boolean(neighbor.development) }
                })
                return (
                  <g key={`road-${tile.id}`}>
                    {connections.map((connection, index) =>
                      connection ? (
                        <line
                          key={index}
                          x1={c.x}
                          y1={c.y}
                          x2={connection.x}
                          y2={connection.y}
                          stroke={connection.developed ? '#8f8f87' : ROAD}
                          strokeWidth={4.6}
                          strokeLinecap="round"
                          opacity={connection.developed ? 0.55 : 1}
                        />
                      ) : null,
                    )}
                    <circle cx={c.x} cy={c.y} r={3.4} fill={ROAD} />
                  </g>
                )
              })}
            </g>

            {/* Buildings */}
            <g pointerEvents="none">
              {tileList.map((tile) => {
                if (!tile.development) return null
                const dev = tile.development
                const c = centerOf(tile)
                if (dev.anchorId !== tile.id) {
                  return (
                    <polygon
                      key={`b-${tile.id}`}
                      points={hexCorners(c.x, c.y, R * 0.52)}
                      fill="rgba(255,255,255,0.2)"
                      stroke="rgba(255,255,255,0.5)"
                      strokeWidth={0.7}
                    />
                  )
                }
                return (
                  <g key={`b-${tile.id}`} transform={`translate(${c.x} ${c.y})`}>
                    <polygon points={hexCorners(0, 0, R * 0.78)} fill="rgba(255,255,255,0.16)" stroke="rgba(255,255,255,0.6)" strokeWidth={0.9} />
                    <g transform="scale(0.95)">
                      <BuildingGlyph category={dev.categoryId} />
                    </g>
                  </g>
                )
              })}
            </g>

            {/* Placement preview */}
            {placing && preview.length > 0 ? (
              <g pointerEvents="none">
                {preview.map((id) => {
                  const tile = tiles[id]
                  if (!tile) return null
                  const c = centerOf(tile)
                  return (
                    <polygon
                      key={`p-${id}`}
                      points={hexCorners(c.x, c.y, R - 0.8)}
                      fill={previewValid ? '#2f5d62' : '#a1472f'}
                      fillOpacity={0.32}
                      stroke={previewValid ? '#2f5d62' : '#a1472f'}
                      strokeWidth={1.6}
                    />
                  )
                })}
              </g>
            ) : null}

            {selected ? (
              <g pointerEvents="none">
                <polygon
                  points={hexCorners(centerOf(selected).x, centerOf(selected).y, R - 1)}
                  fill="none"
                  stroke="#1f2a2e"
                  strokeWidth={2}
                  strokeDasharray="3 2"
                />
              </g>
            ) : null}
          </svg>
        </div>
      </div>

      {/* Zoom controls */}
      <div className="absolute right-3 top-3 flex flex-col overflow-hidden rounded-lg border border-stone-300/80 bg-white/95 shadow-sm">
        <button className="px-2 py-1.5 text-stone-600 hover:bg-stone-100" onClick={() => zoomBy(1.25)} aria-label="Zoom in">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
        <button className="border-y border-stone-200 px-2 py-1.5 text-stone-600 hover:bg-stone-100" onClick={() => zoomBy(0.8)} aria-label="Zoom out">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
            <path d="M5 12h14" />
          </svg>
        </button>
        <button
          className="px-2 py-1.5 text-stone-600 hover:bg-stone-100"
          onClick={() => {
            interacted.current = false
            fit()
          }}
          aria-label="Fit map"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
          </svg>
        </button>
      </div>

      {placing ? (
        <div className="pointer-events-none absolute left-3 top-3 rounded-lg border border-civic/25 bg-white/95 px-3 py-2 text-xs text-stone-700 shadow-sm">
          <span className="font-semibold text-civic">Placement mode</span>
          <span className="ml-2 text-stone-500">
            {placing.size} hex{placing.size > 1 ? 'es' : ''} required
          </span>
        </div>
      ) : null}

      {hover && (preview.length > 0 || hovered) ? (
        <div
          className="pointer-events-none fixed z-30 max-w-[220px] rounded-md bg-ink/90 px-2.5 py-1.5 text-[11px] leading-tight text-white shadow-lg"
          style={{ left: pointer.x + 14, top: pointer.y + 16 }}
        >
          {hovered?.development ? (
            <>
              <div className="font-semibold">{hovered.development.name}</div>
              <div className="text-white/70">
                {CATEGORIES[hovered.development.categoryId].name} · {hovered.development.cost > 0 ? `$${hovered.development.cost}` : 'free'}
              </div>
            </>
          ) : hovered ? (
            <>
              <div className="font-semibold">{hovered.road ? 'Road section' : NATURAL_COLORS[hovered.natural].label}</div>
              <div className="text-white/70">
                Hex {hovered.col + 1}·{hovered.row + 1}
              </div>
            </>
          ) : (
            <div>
              {previewValid ? 'Valid site' : 'Blocked'} · {preview.length}/{placing?.size} hexes
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}
