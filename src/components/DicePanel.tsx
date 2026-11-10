import { useEffect, useRef, useState } from 'react'
import { useGame } from '../game/store'
import { spaceAt } from '../game/board'
import { formatMoney } from '../game/engine'
import { Icon } from './ui'

const PIP_POSITIONS: Record<number, Array<[number, number]>> = {
  1: [[50, 50]],
  2: [
    [28, 28],
    [72, 72],
  ],
  3: [
    [26, 26],
    [50, 50],
    [74, 74],
  ],
  4: [
    [28, 28],
    [72, 28],
    [28, 72],
    [72, 72],
  ],
  5: [
    [27, 27],
    [73, 27],
    [50, 50],
    [27, 73],
    [73, 73],
  ],
  6: [
    [28, 24],
    [72, 24],
    [28, 50],
    [72, 50],
    [28, 76],
    [72, 76],
  ],
}

function DiceFace({ value, spinning }: { value: number | null; spinning: boolean }) {
  return (
    <div
      className={`relative grid h-12 w-12 place-items-center rounded-xl border bg-[#fdfcf8] shadow-inner transition-transform ${
        spinning ? 'dice-spin border-civic/40' : 'border-stone-300'
      }`}
    >
      {value ? (
        PIP_POSITIONS[value].map(([x, y], i) => (
          <span
            key={i}
            className="absolute h-1.5 w-1.5 rounded-full bg-civic"
            style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
          />
        ))
      ) : (
        <span className="text-stone-300">–</span>
      )}
    </div>
  )
}

export function DicePanel() {
  const game = useGame((state) => state.game)
  const roll = useGame((state) => state.roll)
  const [faces, setFaces] = useState<[number, number] | null>(null)
  const [spinning, setSpinning] = useState(false)
  const timers = useRef<number[]>([])
  const pending = game?.pending ?? null
  const pendingRef = useRef(pending)
  pendingRef.current = pending

  useEffect(() => {
    return () => {
      timers.current.forEach((timer) => {
        window.clearTimeout(timer)
        window.clearInterval(timer)
      })
    }
  }, [])

  if (!game) return null

  const space = spaceAt(game.player.position)
  const skip = game.player.skipTurns > 0
  const disabled = Boolean(pending) || spinning
  const shown: [number | null, number | null] = spinning
    ? [faces?.[0] ?? null, faces?.[1] ?? null]
    : game.dice
      ? [game.dice[0], game.dice[1]]
      : [null, null]

  const handleRoll = () => {
    if (disabled) return
    if (!game.settings.diceAnimation) {
      roll()
      return
    }
    setSpinning(true)
    const interval = window.setInterval(() => {
      setFaces([1 + Math.floor(Math.random() * 6), 1 + Math.floor(Math.random() * 6)])
    }, 65)
    const timeout = window.setTimeout(() => {
      window.clearInterval(interval)
      setSpinning(false)
      setFaces(null)
      roll()
    }, 560)
    timers.current.push(interval, timeout)
  }

  const hint = pending
    ? pending.kind === 'opportunity'
      ? pending.outcomeIndex === null
        ? 'Generate a development outcome to continue.'
        : 'Confirm or cancel the construction.'
      : pending.kind === 'placement'
        ? 'Choose a site on the city map.'
        : pending.kind === 'card'
          ? 'Acknowledge the card to continue.'
          : pending.kind === 'planningHold'
            ? 'Decide how to handle the planning hold.'
            : 'Collect the city treasury to continue.'
    : skip
      ? 'Planning hold: roll to serve your missed turn.'
      : 'Roll two dice and move around the board.'

  return (
    <div className="card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="label">Current position</div>
          <div className="mt-0.5 font-display text-[15px] leading-tight text-ink">{space.name}</div>
          <div className="mt-0.5 text-[11px] text-stone-500">
            Space {space.id} of 40{space.cost ? ` · build cost ${formatMoney(space.cost)}` : ''}
          </div>
        </div>
        <div className="flex gap-2">
          <DiceFace value={shown[0]} spinning={spinning} />
          <DiceFace value={shown[1]} spinning={spinning} />
        </div>
      </div>

      <button
        className="btn-primary mt-3.5 w-full py-2.5"
        onClick={handleRoll}
        disabled={disabled}
        title={pending ? 'Resolve the current action first' : undefined}
      >
        <Icon name="dice" className="h-4 w-4" />
        {spinning ? 'Rolling…' : skip ? 'Serve planning hold' : 'Roll dice'}
      </button>

      <p className="mt-2 text-center text-[11px] leading-snug text-stone-500">{hint}</p>

      <div className="mt-3 grid grid-cols-3 gap-2 border-t border-stone-200/80 pt-3 text-center">
        <div>
          <div className="label">Turn</div>
          <div className="num mt-0.5 text-sm font-semibold">{game.turn}</div>
        </div>
        <div>
          <div className="label">Rolls</div>
          <div className="num mt-0.5 text-sm font-semibold">{game.player.turns}</div>
        </div>
        <div>
          <div className="label">Balance</div>
          <div className="num mt-0.5 text-sm font-semibold text-civic">{formatMoney(game.player.balance)}</div>
        </div>
      </div>
    </div>
  )
}
