import { useEffect, useRef, useState } from 'react'
import { useGame } from '../game/store'
import { BOARD } from '../game/board'
import { DECKS, effectSummary } from '../game/cards'
import { CATEGORIES } from '../game/content'
import { formatMoney } from '../game/engine'
import { Icon, Modal } from './ui'

function useRollAnimation(): [number | null, () => void] {
  const [face, setFace] = useState<number | null>(null)
  const timers = useRef<number[]>([])
  useEffect(() => {
    return () => {
      timers.current.forEach((timer) => {
        window.clearTimeout(timer)
        window.clearInterval(timer)
      })
    }
  }, [])
  const start = () => {
    const interval = window.setInterval(() => setFace(1 + Math.floor(Math.random() * 6)), 70)
    const timeout = window.setTimeout(() => {
      window.clearInterval(interval)
      setFace(null)
      useGame.getState().rollOutcome()
    }, 520)
    timers.current.push(interval, timeout)
  }
  return [face, start]
}

function OpportunityModal() {
  const game = useGame((state) => state.game)
  const startConstruction = useGame((state) => state.startConstruction)
  const cancelPending = useGame((state) => state.cancelPending)
  const [face, spin] = useRollAnimation()

  const pending = game?.pending
  if (!game || !pending || pending.kind !== 'opportunity') return null

  const space = BOARD[pending.spaceId - 1]
  const category = CATEGORIES[pending.categoryId]
  const outcome = pending.outcomeIndex !== null ? category.outcomes[pending.outcomeIndex] : null
  const cost = pending.usingFreeToken ? 0 : pending.cost
  const canAfford = game.player.balance >= cost

  return (
    <Modal size="lg" label="Development opportunity">
      <div className="card overflow-hidden">
        <div className="relative px-6 py-5 text-white" style={{ backgroundColor: category.color }}>
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/80">
            Development opportunity · {space.name}
          </div>
          <div className="mt-1 font-display text-[26px] leading-tight">{category.name}</div>
          <div className="mt-1 text-[12px] text-white/85">
            Space {space.id} of 40 · construction cost {formatMoney(space.cost ?? 0)}
          </div>
          <svg className="pointer-events-none absolute -right-6 -top-8 h-40 w-40 opacity-20" viewBox="0 0 100 100" aria-hidden="true">
            <path d="M50 4l40 23v46L50 96 10 73V27z" fill="none" stroke="white" strokeWidth="2" />
            <path d="M50 24l23 13v26L50 76 27 63V37z" fill="none" stroke="white" strokeWidth="1.4" />
          </svg>
        </div>

        {!outcome ? (
          <div className="px-6 py-5">
            <p className="text-sm leading-relaxed text-stone-600">
              Roll the development die to see which scheme comes forward. Six outcomes are possible in this category.
            </p>

            <div className="mt-4 grid gap-1.5 sm:grid-cols-2">
              {category.outcomes.map((item, index) => (
                <div key={item.name} className="flex items-center gap-2.5 rounded-lg border border-stone-200/70 px-3 py-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-stone-100 text-[10px] font-bold text-stone-500">
                    {index + 1}
                  </span>
                  <span className="text-[12px] text-stone-700">{item.name}</span>
                  <span className="num ml-auto text-[10px] text-stone-400">{item.size}h</span>
                </div>
              ))}
            </div>

            <div className="mt-5 flex items-center gap-3">
              <button
                className="btn-primary flex-1 py-2.5"
                onClick={spin}
                disabled={face !== null}
                style={{ backgroundColor: category.color }}
              >
                <Icon name="dice" />
                {face !== null ? `Rolling… ${face}` : 'Roll development die'}
              </button>
              <button className="btn-secondary" onClick={cancelPending}>
                Leave it
              </button>
            </div>
            <p className="mt-2 text-center text-[11px] text-stone-400">Nothing is charged until you confirm construction.</p>
          </div>
        ) : (
          <div className="px-6 py-5">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg font-semibold text-white" style={{ backgroundColor: category.color }}>
                {pending.outcomeIndex! + 1}
              </div>
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-400">Outcome generated</div>
                <h3 className="font-display text-[24px] leading-tight text-ink">{outcome.name}</h3>
                <p className="mt-1 text-[12.5px] leading-relaxed text-stone-600">{outcome.description}</p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="rounded-lg border border-stone-200/70 bg-stone-50/60 px-3 py-2">
                <div className="label">Footprint</div>
                <div className="num mt-0.5 text-sm font-semibold">{outcome.size} hex{outcome.size > 1 ? 'es' : ''}</div>
              </div>
              <div className="rounded-lg border border-stone-200/70 bg-stone-50/60 px-3 py-2">
                <div className="label">Cost</div>
                <div className={`num mt-0.5 text-sm font-semibold ${pending.usingFreeToken ? 'text-emerald-700' : ''}`}>
                  {pending.usingFreeToken ? 'Free' : formatMoney(cost)}
                </div>
              </div>
              <div className="rounded-lg border border-stone-200/70 bg-stone-50/60 px-3 py-2">
                <div className="label">{outcome.population ? 'Population' : 'Jobs'}</div>
                <div className="num mt-0.5 text-sm font-semibold">
                  {(outcome.population ?? outcome.jobs ?? 0).toLocaleString('en-US')}
                </div>
              </div>
            </div>

            {pending.usingFreeToken ? (
              <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-[11.5px] text-emerald-800">
                Planning approval token available — this development will be built at no cost.
              </div>
            ) : null}

            <div className="mt-3 flex items-center justify-between rounded-lg bg-stone-50 px-3 py-2 text-[11.5px] text-stone-600">
              <span>Balance {formatMoney(game.player.balance)}</span>
              <span className="num">After build {formatMoney(game.player.balance - cost)}</span>
            </div>

            {!canAfford ? (
              <div className="mt-2 rounded-lg border border-[#eccfc2] bg-[#fbeee9] px-3 py-2 text-[11.5px] text-[#7c3620]">
                Insufficient funds. Cancel to keep your balance intact.
              </div>
            ) : null}

            <div className="mt-5 flex items-center gap-3">
              <button className="btn-primary flex-1 py-2.5" onClick={startConstruction} disabled={!canAfford} style={{ backgroundColor: category.color }}>
                <Icon name="building" />
                Construct — {pending.usingFreeToken ? 'free' : formatMoney(cost)}
              </button>
              <button className="btn-secondary" onClick={cancelPending}>
                Cancel
              </button>
            </div>
            <p className="mt-2 text-center text-[11px] text-stone-400">You will choose the site on the city map next.</p>
          </div>
        )}
      </div>
    </Modal>
  )
}

function CardModal() {
  const game = useGame((state) => state.game)
  const acknowledgeCard = useGame((state) => state.acknowledgeCard)
  const pending = game?.pending
  if (!game || !pending || pending.kind !== 'card') return null

  const deck = DECKS[pending.deck]
  const card = deck[pending.cardIndex]
  const isChance = pending.deck === 'chance'
  const accent = isChance ? '#b8802f' : '#48749b'
  const remaining = isChance ? game.decks.chance.length : game.decks.community.length
  const positive = card.effect.type === 'money' ? card.effect.amount >= 0 : true

  return (
    <Modal size="md" label="Event card">
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 text-white" style={{ backgroundColor: accent }}>
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em]">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8}>
              <path d="M5 4h14v16H5z" />
              <path d="M8 8h8M8 12h8M8 16h5" />
            </svg>
            {isChance ? 'Chance' : 'Community Chest'}
          </div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-white/75">{remaining} cards left</div>
        </div>

        <div className="px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <h3 className="font-display text-[26px] leading-tight text-ink">{card.title}</h3>
            <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${positive ? 'bg-emerald-50 text-emerald-700' : 'bg-[#fbeee9] text-[#7c3620]'}`}>
              {positive ? 'Gain' : 'Pay'}
            </span>
          </div>
          <p className="mt-2 text-[13px] leading-relaxed text-stone-600">{card.text}</p>

          <div className="mt-4 rounded-xl border border-stone-200/80 bg-stone-50/70 px-4 py-3">
            <div className="label">Effect</div>
            <div className="mt-0.5 text-[13px] font-semibold text-ink">{effectSummary(card.effect)}</div>
          </div>

          <div className="mt-4 flex items-center justify-between rounded-lg bg-white px-1 text-[11.5px] text-stone-500">
            <span>Balance {formatMoney(game.player.balance)}</span>
            <span>Turn {game.turn}</span>
          </div>

          <button className="btn-primary mt-4 w-full py-2.5" onClick={acknowledgeCard} style={{ backgroundColor: accent }}>
            <Icon name="check" />
            Acknowledge card
          </button>
          <p className="mt-2 text-center text-[11px] text-stone-400">The effect is applied when you acknowledge.</p>
        </div>
      </div>
    </Modal>
  )
}

function PlanningHoldModal() {
  const game = useGame((state) => state.game)
  const decide = useGame((state) => state.planningHoldDecision)
  const pending = game?.pending
  if (!game || !pending || pending.kind !== 'planningHold') return null
  const canPay = game.player.balance >= 500

  return (
    <Modal size="sm" label="Planning hold">
      <div className="card overflow-hidden">
        <div className="bg-[#8a5a3a] px-5 py-4 text-white">
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/80">Corner space</div>
          <h3 className="mt-1 font-display text-2xl">Planning Hold</h3>
        </div>
        <div className="px-5 py-4">
          <p className="text-[12.5px] leading-relaxed text-stone-600">
            The review board has placed your schemes on hold. You can wait out the process and miss your next turn,
            or pay the expedited review fee to carry on immediately.
          </p>
          <div className="mt-3 flex items-center justify-between rounded-lg bg-stone-50 px-3 py-2 text-[11.5px] text-stone-600">
            <span>Balance</span>
            <span className="num font-semibold">{formatMoney(game.player.balance)}</span>
          </div>
          <div className="mt-4 space-y-2">
            <button className="btn-primary w-full py-2.5" onClick={() => decide(true)} disabled={!canPay}>
              Pay $500 and continue
            </button>
            <button className="btn-secondary w-full py-2.5" onClick={() => decide(false)}>
              Accept the hold — miss next turn
            </button>
          </div>
          {!canPay ? (
            <p className="mt-2 text-center text-[11px] text-[#a1472f]">Not enough funds to pay the fee.</p>
          ) : null}
        </div>
      </div>
    </Modal>
  )
}

function CityHallModal() {
  const game = useGame((state) => state.game)
  const collectTreasury = useGame((state) => state.collectTreasury)
  const closePending = useGame((state) => state.closePending)
  const pending = game?.pending
  if (!game || !pending || pending.kind !== 'cityHall') return null

  return (
    <Modal size="md" label="City Hall">
      <div className="card overflow-hidden">
        <div className="bg-[#7b6a43] px-6 py-5 text-white">
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/80">Corner space</div>
          <h3 className="mt-1 font-display text-2xl">City Hall</h3>
          <p className="mt-1 text-[12px] text-white/85">The city accounts are open for inspection.</p>
        </div>
        <div className="px-6 py-4">
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-stone-200/70 bg-stone-50/70 px-3 py-2">
              <div className="label">Your balance</div>
              <div className="num mt-0.5 text-sm font-semibold">{formatMoney(game.player.balance)}</div>
            </div>
            <div className="rounded-lg border border-stone-200/70 bg-stone-50/70 px-3 py-2">
              <div className="label">City treasury</div>
              <div className="num mt-0.5 text-sm font-semibold">{formatMoney(game.stats.treasury)}</div>
            </div>
            <div className="rounded-lg border border-stone-200/70 bg-stone-50/70 px-3 py-2">
              <div className="label">Total income</div>
              <div className="num mt-0.5 text-sm font-semibold">{formatMoney(game.stats.income)}</div>
            </div>
            <div className="rounded-lg border border-stone-200/70 bg-stone-50/70 px-3 py-2">
              <div className="label">Taxes paid</div>
              <div className="num mt-0.5 text-sm font-semibold">{formatMoney(game.stats.taxes)}</div>
            </div>
          </div>
          <div className="mt-3 rounded-lg bg-stone-50 px-3 py-2 text-[11.5px] leading-relaxed text-stone-600">
            The treasury collects taxes and fees. You can release it here or at Free Parking — whichever you reach first.
          </div>
          <div className="mt-4 flex gap-2">
            <button className="btn-primary flex-1 py-2.5" onClick={collectTreasury} disabled={game.stats.treasury <= 0}>
              Collect {formatMoney(game.stats.treasury)}
            </button>
            <button className="btn-secondary" onClick={closePending}>
              Close
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export function PendingOverlay() {
  const kind = useGame((state) => state.game?.pending?.kind ?? null)
  if (!kind) return null
  if (kind === 'opportunity') return <OpportunityModal />
  if (kind === 'card') return <CardModal />
  if (kind === 'planningHold') return <PlanningHoldModal />
  if (kind === 'cityHall') return <CityHallModal />
  return null
}
