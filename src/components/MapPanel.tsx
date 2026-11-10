import { useEffect, useMemo, useState } from 'react'
import { useGame } from '../game/store'
import { CATEGORIES, NATURAL_COLORS } from '../game/content'
import { computeCity, formatMoney } from '../game/engine'
import { footprintIds } from '../game/hex'
import type { ToolMode } from '../game/types'
import { HexMap } from './HexMap'
import { Icon } from './ui'

const LEGEND: Array<{ label: string; color: string }> = [
  { label: 'Residential', color: CATEGORIES.residential.color },
  { label: 'Commercial', color: CATEGORIES.commercial.color },
  { label: 'Industrial', color: CATEGORIES.industrial.color },
  { label: 'Civic', color: CATEGORIES.civic.color },
  { label: 'Special interest', color: CATEGORIES.special.color },
  { label: 'Infrastructure', color: CATEGORIES.infrastructure.color },
  { label: 'Parks & nature', color: CATEGORIES.park.color },
  { label: 'Water', color: '#5f9cbb' },
  { label: 'Roads', color: '#575e60' },
]

const TOOLS: Array<{ id: ToolMode; label: string; icon: 'cursor' | 'road' | 'close' }> = [
  { id: 'inspect', label: 'Inspect', icon: 'cursor' },
  { id: 'road', label: 'Road', icon: 'road' },
  { id: 'clear', label: 'Clear', icon: 'close' },
]

export function MapPanel() {
  const game = useGame((state) => state.game)
  const placeDevelopment = useGame((state) => state.placeDevelopment)
  const cancelPending = useGame((state) => state.cancelPending)
  const toggleRoad = useGame((state) => state.toggleRoad)
  const demolish = useGame((state) => state.demolish)
  const undoAction = useGame((state) => state.undoAction)
  const redoAction = useGame((state) => state.redoAction)
  const canUndo = useGame((state) => state.undo.length > 0)
  const canRedo = useGame((state) => state.redo.length > 0)

  const [tool, setTool] = useState<ToolMode>('inspect')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [anchor, setAnchor] = useState<string | null>(null)
  const [legendOpen, setLegendOpen] = useState(false)

  const placement = game?.pending?.kind === 'placement' ? game.pending : null
  const placementKey = placement ? `${placement.categoryId}-${placement.name}-${placement.origin}` : null

  useEffect(() => {
    setAnchor(null)
  }, [placementKey])

  const tiles = game?.tiles ?? {}
  const city = useMemo(() => computeCity(tiles), [tiles])
  const selected = selectedId ? tiles[selectedId] : null
  const footprint = placement && anchor ? footprintIds(tiles, anchor, placement.size) : []
  const siteValid = placement
    ? footprint.length === placement.size && footprint.every((id) => tiles[id] && !tiles[id].development)
    : false
  const affordable = placement ? (game?.player.balance ?? 0) >= placement.cost : false

  if (!game) return null

  const handleActivate = (id: string) => {
    if (placement) {
      setAnchor(id)
      return
    }
    if (tool === 'road') {
      toggleRoad(id)
      return
    }
    if (tool === 'clear') {
      if (tiles[id]?.road) toggleRoad(id)
      else setSelectedId(id)
      return
    }
    setSelectedId(id)
  }

  const selectedCategory = selected?.development ? CATEGORIES[selected.development.categoryId] : null

  return (
    <div className="card flex h-full min-h-[540px] min-w-0 flex-col overflow-hidden">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-stone-200/80 px-4 py-2.5">
        <div className="mr-auto">
          <h2 className="font-display text-[15px] leading-tight">City map</h2>
          <div className="num text-[11px] text-stone-500">
            {city.developedHexes} / 714 hexes developed · {city.roads} road sections · {city.remainingLand} open
          </div>
        </div>

        <div className="flex overflow-hidden rounded-lg border border-stone-300 bg-white">
          {TOOLS.map((item) => (
            <button
              key={item.id}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium transition-colors ${
                tool === item.id ? 'bg-civic text-white' : 'text-stone-600 hover:bg-stone-50'
              }`}
              onClick={() => setTool(item.id)}
              title={item.id === 'road' ? `Lay road — ${formatMoney(game.settings.roadCost)} per hex` : item.label}
            >
              <Icon name={item.icon} className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1">
          <button className="btn-secondary px-2 py-1.5" onClick={undoAction} disabled={!canUndo} title="Undo" aria-label="Undo">
            <Icon name="undo" className="h-4 w-4" />
          </button>
          <button className="btn-secondary px-2 py-1.5" onClick={redoAction} disabled={!canRedo} title="Redo" aria-label="Redo">
            <Icon name="redo" className="h-4 w-4" />
          </button>
        </div>
      </div>

      {tool !== 'inspect' && !placement ? (
        <div className="border-b border-amber-100 bg-amber-50/80 px-4 py-1.5 text-[11px] text-amber-900">
          {tool === 'road'
            ? `Road tool — click a hex to lay a road for ${formatMoney(game.settings.roadCost)}. Click again to lift it.`
            : 'Clear tool — click a road section to remove it. Developments can be demolished from their tile card.'}
        </div>
      ) : null}

      {placement ? (
        <div className="flex flex-wrap items-center gap-3 border-b border-stone-200/80 bg-parchment px-4 py-2.5">
          <span className="h-8 w-1.5 rounded-full" style={{ backgroundColor: CATEGORIES[placement.categoryId].color }} />
          <div className="mr-auto min-w-[180px]">
            <div className="text-[13px] font-semibold text-ink">{placement.name}</div>
            <div className="text-[11px] text-stone-500">
              {CATEGORIES[placement.categoryId].name} · {placement.size} hex{placement.size > 1 ? 'es' : ''} ·{' '}
              {placement.cost === 0 ? (
                <span className="font-semibold text-emerald-700">free</span>
              ) : (
                <span className="num">{formatMoney(placement.cost)}</span>
              )}{' '}
              · from {placement.label}
            </div>
          </div>
          <div className="text-[11px]">
            {!anchor ? (
              <span className="text-stone-500">Click the map to choose a site</span>
            ) : siteValid ? (
              <span className="text-emerald-700">Site ready · {footprint.length} hexes</span>
            ) : (
              <span className="text-[#a1472f]">Blocked — choose another site</span>
            )}
            {!affordable ? <div className="text-[#a1472f]">Insufficient funds for this build</div> : null}
          </div>
          <div className="flex items-center gap-2">
            <button className="btn-secondary btn-xs" onClick={cancelPending}>
              Cancel
            </button>
            <button
              className="btn-primary btn-xs px-3"
              disabled={!anchor || !siteValid || !affordable}
              onClick={() => {
                if (anchor) placeDevelopment(anchor)
              }}
            >
              <Icon name="check" className="h-3.5 w-3.5" />
              Confirm construction
            </button>
          </div>
        </div>
      ) : null}

      <div className="relative min-h-0 min-w-0 flex-1 p-2">
        <HexMap
          placing={placement ? { size: placement.size, color: CATEGORIES[placement.categoryId].color, anchorId: anchor } : null}
          selectedId={selectedId}
          onSelect={(id) => {
            if (id) handleActivate(id)
            else setSelectedId(null)
          }}
          onPlace={handleActivate}
        />

        <div className="pointer-events-none absolute bottom-4 right-4 flex flex-col items-end gap-2">
          {legendOpen ? (
            <div className="pointer-events-auto w-44 rounded-xl border border-stone-200 bg-white/95 p-3 shadow-lg">
              <div className="label mb-2">Legend</div>
              <div className="space-y-1.5">
                {LEGEND.map((item) => (
                  <div key={item.label} className="flex items-center gap-2 text-[11px] text-stone-600">
                    <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: item.color }} />
                    {item.label}
                  </div>
                ))}
              </div>
            </div>
          ) : null}
          <button
            className="pointer-events-auto rounded-lg border border-stone-300 bg-white/95 px-2.5 py-1 text-[10.5px] font-medium text-stone-600 shadow-sm hover:bg-white"
            onClick={() => setLegendOpen((open) => !open)}
          >
            {legendOpen ? 'Hide legend' : 'Legend'}
          </button>
        </div>

        {selected ? (
          <div className="absolute bottom-4 left-4 w-[262px] animate-pop-in rounded-xl border border-stone-200 bg-white p-3 shadow-lg">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="label">
                  Hex {selected.col + 1}·{selected.row + 1}
                </div>
                <div className="mt-0.5 text-sm font-semibold text-ink">
                  {selected.development ? selected.development.name : selected.road ? 'Road section' : NATURAL_COLORS[selected.natural].label}
                </div>
              </div>
              <button className="btn-ghost -mr-1 -mt-1 px-1.5 py-1" onClick={() => setSelectedId(null)} aria-label="Close tile details">
                <Icon name="close" className="h-3.5 w-3.5" />
              </button>
            </div>

            {selected.development && selectedCategory ? (
              <>
                <div className="mt-2 flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: selectedCategory.color }} />
                  <span className="text-[11px] text-stone-600">{selectedCategory.name}</span>
                </div>
                <p className="mt-1.5 text-[11px] leading-snug text-stone-500">
                  {selectedCategory.outcomes[selected.development.outcomeIndex].description}
                </p>
                <div className="mt-2 grid grid-cols-2 gap-1.5 text-[10.5px]">
                  <div className="rounded-md bg-stone-50 px-2 py-1">
                    <span className="text-stone-400">Cost </span>
                    <span className="num font-semibold text-stone-700">
                      {selected.development.cost === 0 ? 'Free' : formatMoney(selected.development.cost)}
                    </span>
                  </div>
                  <div className="rounded-md bg-stone-50 px-2 py-1">
                    <span className="text-stone-400">Built </span>
                    <span className="num font-semibold text-stone-700">Turn {selected.development.turn}</span>
                  </div>
                </div>
                <button
                  className="btn-secondary btn-xs mt-2.5 w-full text-[#a1472f]"
                  onClick={() => {
                    demolish(selected.id)
                    setSelectedId(null)
                  }}
                >
                  <Icon name="trash" className="h-3.5 w-3.5" />
                  Demolish (25% salvage)
                </button>
              </>
            ) : (
              <>
                <p className="mt-1.5 text-[11px] leading-snug text-stone-500">
                  {selected.road
                    ? 'A paved link in the city network. Roads connect neighbouring districts and count towards the road milestone.'
                    : 'Undeveloped land. Any development can be placed here if its footprint fits.'}
                </p>
                <button
                  className="btn-secondary btn-xs mt-2.5 w-full"
                  onClick={() => {
                    toggleRoad(selected.id)
                  }}
                >
                  <Icon name="road" className="h-3.5 w-3.5" />
                  {selected.road ? 'Remove road' : `Lay road (${formatMoney(game.settings.roadCost)})`}
                </button>
              </>
            )}
          </div>
        ) : null}
      </div>
    </div>
  )
}
