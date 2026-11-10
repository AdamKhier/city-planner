import { useMemo, useState } from 'react'
import { useGame } from '../game/store'
import { formatMoney } from '../game/engine'
import { slotInfo } from '../game/persistence'
import { Icon } from './ui'
import { SaveLoadModal } from './SaveLoadModal'
import { SettingsModal } from './SettingsModal'
import { RulesModal } from './RulesModal'

const HIGHLIGHTS = [
  { title: '40 board spaces', text: 'Roll, move and land on development, tax and event spaces.' },
  { title: '714 hexagons', text: 'Place everything you build on a living city map.' },
  { title: '36 event cards', text: 'Chance and Community Chest decks keep every run different.' },
]

export function MainMenu() {
  const startNewGame = useGame((state) => state.startNewGame)
  const continueGame = useGame((state) => state.continueGame)
  const [savesOpen, setSavesOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [rulesOpen, setRulesOpen] = useState(false)
  const [tick, setTick] = useState(0)

  const autoSave = useMemo(() => slotInfo('auto'), [tick, savesOpen])
  const slots = useMemo(() => [1, 2, 3].map((slot) => slotInfo(String(slot) as '1' | '2' | '3')), [tick, savesOpen])

  return (
    <div className="relative min-h-full overflow-hidden bg-paper">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.55]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 18% 20%, rgba(47,93,98,0.10), transparent 42%), radial-gradient(circle at 82% 12%, rgba(201,162,63,0.10), transparent 38%), radial-gradient(circle at 70% 82%, rgba(111,169,90,0.10), transparent 40%)',
        }}
      />
      <svg className="pointer-events-none absolute -right-24 -top-24 h-[520px] w-[520px] opacity-[0.18]" viewBox="0 0 200 200" aria-hidden="true">
        <defs>
          <pattern id="menu-hexes" width="26" height="45" patternUnits="userSpaceOnUse" patternTransform="scale(1.15)">
            <path d="M13 0l13 7.5v15L13 30 0 22.5v-15z" fill="none" stroke="#2f5d62" strokeWidth="1" />
            <path d="M13 30v15" stroke="#2f5d62" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="200" height="200" fill="url(#menu-hexes)" />
      </svg>

      <div className="relative mx-auto flex min-h-full max-w-[1180px] flex-col px-6 py-10 lg:py-16">
        <div className="flex items-center gap-3">
          <svg viewBox="0 0 40 40" className="h-10 w-10" aria-hidden="true">
            <path d="M20 3l14.7 8.5v17L20 37 5.3 28.5v-17z" fill="#2f5d62" />
            <path d="M20 11l7.8 4.5v9L20 29l-7.8-4.5v-9z" fill="none" stroke="#f4f2ec" strokeWidth="1.6" />
            <circle cx="20" cy="20" r="2.6" fill="#f4f2ec" />
          </svg>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.3em] text-stone-500">Est. 2026 · Municipal authority</div>
            <div className="font-display text-lg tracking-[0.16em] text-ink">CITY PLANNER</div>
          </div>
        </div>

        <div className="mt-12 grid flex-1 gap-10 lg:mt-16 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
          <div>
            <h1 className="font-display text-5xl leading-[1.05] tracking-tight text-balance sm:text-6xl">
              Every dice roll
              <br />
              shapes your city.
            </h1>
            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-stone-600">
              Roll your way around a 40-space municipal board. Land on an opportunity, generate the scheme,
              pay for it and decide exactly where it belongs on a 714-hexagonal landscape. Then do it again —
              neighbourhood by neighbourhood, district by district.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                className="btn-primary px-6 py-3 text-[15px]"
                onClick={() => {
                  if (autoSave && !window.confirm('Start a new city? Your current autosave will be replaced.')) return
                  startNewGame()
                }}
              >
                <Icon name="play" className="h-4 w-4" />
                New game
              </button>
              <button
                className="btn-secondary px-5 py-3"
                onClick={() => continueGame()}
                disabled={!autoSave}
                title={autoSave ? 'Resume your most recent game' : 'No saved game yet'}
              >
                Continue game
              </button>
              <button className="btn-ghost px-4 py-3" onClick={() => setSavesOpen(true)}>
                Load game
              </button>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {HIGHLIGHTS.map((item) => (
                <div key={item.title} className="rounded-xl border border-stone-200/80 bg-white/70 px-4 py-3">
                  <div className="text-[13px] font-semibold text-ink">{item.title}</div>
                  <div className="mt-1 text-[11px] leading-snug text-stone-500">{item.text}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="card p-5">
              <div className="flex items-center justify-between">
                <span className="label">Most recent city</span>
                <span className="text-[10px] uppercase tracking-[0.14em] text-stone-400">Autosave</span>
              </div>
              {autoSave ? (
                <>
                  <div className="mt-3 flex items-baseline justify-between">
                    <div>
                      <div className="num font-display text-3xl text-ink">{formatMoney(autoSave.balance)}</div>
                      <div className="mt-1 text-xs text-stone-500">
                        Turn {autoSave.turn} · {autoSave.developments} development{autoSave.developments === 1 ? '' : 's'}
                      </div>
                    </div>
                    <div className="text-right text-[11px] text-stone-400">
                      {new Date(autoSave.savedAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                      <br />
                      {new Date(autoSave.savedAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <button className="btn-primary mt-4 w-full" onClick={() => continueGame()}>
                    Resume city
                    <Icon name="arrowRight" />
                  </button>
                </>
              ) : (
                <div className="mt-4 rounded-lg border border-dashed border-stone-300 px-4 py-6 text-center text-xs text-stone-500">
                  No city on file yet. Start a new game to break ground.
                </div>
              )}
            </div>

            <div className="card p-5">
              <div className="flex items-center justify-between">
                <span className="label">Save slots</span>
                <button className="text-[11px] font-semibold text-civic hover:underline" onClick={() => setSavesOpen(true)}>
                  Manage
                </button>
              </div>
              <div className="mt-3 space-y-2">
                {slots.map((slot, index) => (
                  <div key={`slot-${index + 1}`} className="flex items-center justify-between rounded-lg border border-stone-200/80 px-3 py-2">
                    <div className="flex items-center gap-2.5">
                      <Icon name="folder" className="h-4 w-4 text-stone-400" />
                      <div className="text-xs">
                        <div className="font-semibold text-stone-700">Slot {slot?.slot ?? ''}</div>
                        <div className="text-[11px] text-stone-500">
                          {slot ? `Turn ${slot.turn} · ${formatMoney(slot.balance)}` : 'Empty'}
                        </div>
                      </div>
                    </div>
                    <button
                      className="text-[11px] font-semibold text-civic hover:underline disabled:text-stone-300 disabled:no-underline"
                      disabled={!slot}
                      onClick={() => {
                        setSavesOpen(true)
                      }}
                    >
                      Load
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button className="btn-secondary justify-start px-4 py-3" onClick={() => setSettingsOpen(true)}>
                <Icon name="gear" />
                Settings
              </button>
              <button className="btn-secondary justify-start px-4 py-3" onClick={() => setRulesOpen(true)}>
                <Icon name="book" />
                Rules
              </button>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-stone-300/60 pt-5 text-[11px] uppercase tracking-[0.14em] text-stone-400">
          <span>40 board spaces</span>
          <span>714 hexagons</span>
          <span>2 event decks</span>
          <span>Offline &amp; autosaved</span>
        </div>
      </div>

      {savesOpen ? (
        <SaveLoadModal
          mode="load"
          onClose={() => {
            setSavesOpen(false)
            setTick((value) => value + 1)
          }}
        />
      ) : null}
      {settingsOpen ? <SettingsModal menuMode onClose={() => setSettingsOpen(false)} /> : null}
      {rulesOpen ? <RulesModal onClose={() => setRulesOpen(false)} /> : null}
    </div>
  )
}
