import { useEffect, useState } from 'react'
import { useGame } from '../game/store'
import { BOARD } from '../game/board'
import { CATEGORIES } from '../game/content'
import type { BoardSpace, GameState } from '../game/types'
import { Modal } from './ui'

const SIDE = 11
const CELL = 76
const ORIGIN = 12
const SIZE = ORIGIN * 2 + SIDE * CELL

interface Cell {
  x: number
  y: number
  rot: number
}

const CELLS: Cell[] = (() => {
  const cells: Cell[] = []
  for (let i = 0; i < 11; i++) cells.push({ x: ORIGIN + (10 - i) * CELL, y: ORIGIN + 10 * CELL, rot: 0 })
  for (let i = 11; i < 20; i++) cells.push({ x: ORIGIN, y: ORIGIN + (19 - i) * CELL, rot: 90 })
  for (let i = 20; i < 31; i++) cells.push({ x: ORIGIN + (i - 20) * CELL, y: ORIGIN, rot: 180 })
  for (let i = 31; i < 40; i++) cells.push({ x: ORIGIN + 10 * CELL, y: ORIGIN + (i - 30) * CELL, rot: 270 })
  return cells
})()

function accentFor(space: BoardSpace): string {
  if (space.type === 'development' && space.category) return CATEGORIES[space.category].color
  switch (space.type) {
    case 'start':
      return '#2f5d62'
    case 'cityHall':
      return '#7b6a43'
    case 'freeParking':
      return '#4f7f6a'
    case 'planningHold':
      return '#8a5a3a'
    case 'chance':
      return '#b8802f'
    case 'community':
      return '#48749b'
    case 'tax':
      return '#9c4a33'
    default:
      return '#8a8578'
  }
}

function wrapLabel(text: string, perLine = 11): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let line = ''
  for (const word of words) {
    if (!line) line = word
    else if (`${line} ${word}`.length <= perLine) line += ` ${word}`
    else {
      lines.push(line)
      line = word
    }
  }
  if (line) lines.push(line)
  return lines.slice(0, 3)
}

function SpaceCell({ space, index, active }: { space: BoardSpace; index: number; active: boolean }) {
  const cell = CELLS[index]
  const accent = accentFor(space)
  const cx = cell.x + CELL / 2
  const cy = cell.y + CELL / 2
  const isCorner = index % 10 === 0
  const lines = wrapLabel(isCorner ? space.name : space.short, isCorner ? 12 : 12)
  const nameFont = lines.length >= 3 ? 9.4 : 10.6

  const glyph =
    space.type === 'chance' ? (
      <text x={cx} y={cell.y + 30} textAnchor="middle" fontSize={16} fontWeight={700} fill={accent} fontFamily="Georgia, serif">
        ?
      </text>
    ) : space.type === 'community' ? (
      <text x={cx} y={cell.y + 30} textAnchor="middle" fontSize={15} fontWeight={700} fill={accent} fontFamily="Georgia, serif">
        ✦
      </text>
    ) : space.type === 'tax' ? (
      <text x={cx} y={cell.y + 29} textAnchor="middle" fontSize={12} fontWeight={600} fill={accent}>
        %
      </text>
    ) : space.type === 'start' ? (
      <path d="M0 -6 L5.5 0 L0 6 L-5.5 0 Z" transform={`translate(${cx} ${cell.y + 26})`} fill="none" stroke={accent} strokeWidth={1.5} />
    ) : space.type === 'cityHall' ? (
      <g transform={`translate(${cx} ${cell.y + 26})`} stroke={accent} strokeWidth={1.2} fill="none">
        <path d="M-7.5 -1 L0 -6.5 L7.5 -1" />
        <path d="M-5.5 0 L5.5 0 M-5.5 0 L-5.5 4.5 M0 0 L0 4.5 M5.5 0 L5.5 4.5 M-7.5 4.5 L7.5 4.5" />
      </g>
    ) : space.type === 'freeParking' ? (
      <text x={cx} y={cell.y + 30} textAnchor="middle" fontSize={17} fontWeight={700} fill={accent} fontFamily="Georgia, serif">
        P
      </text>
    ) : space.type === 'planningHold' ? (
      <g transform={`translate(${cx} ${cell.y + 25})`} stroke={accent} strokeWidth={2} strokeLinecap="round">
        <path d="M-4 -6 V6 M4 -6 V6" />
      </g>
    ) : null

  const labelStart = space.type === 'development' ? cell.y + 42 : cell.y + 41

  return (
    <g transform={`rotate(${cell.rot} ${cx} ${cy})`}>
      <rect
        x={cell.x}
        y={cell.y}
        width={CELL}
        height={CELL}
        rx={3}
        fill={active ? '#fffdf7' : '#fbfaf6'}
        stroke={active ? '#2f5d62' : '#d8d3c6'}
        strokeWidth={active ? 2.4 : 1}
      />
      <rect x={cell.x + 7} y={cell.y + 7} width={CELL - 14} height={8} rx={1.5} fill={accent} />
      {active ? (
        <rect x={cell.x + 2.5} y={cell.y + 2.5} width={CELL - 5} height={CELL - 5} rx={4} fill="none" stroke="#2f5d62" strokeOpacity={0.3} strokeWidth={1} />
      ) : null}
      {glyph}
      <text
        textAnchor="middle"
        fontFamily="Inter, system-ui, sans-serif"
        fontSize={nameFont}
        fontWeight={isCorner ? 700 : 600}
        fill="#2a3335"
      >
        {lines.map((line, i) => (
          <tspan key={i} x={cx} y={labelStart + i * (nameFont + 1.6)}>
            {line}
          </tspan>
        ))}
      </text>
      {space.type === 'development' && space.cost ? (
        <text x={cx} y={cell.y + 69} textAnchor="middle" fontSize={8.6} fill="#7a7466" fontFamily="Inter, system-ui, sans-serif">
          {`$${space.cost}`}
        </text>
      ) : null}
      {space.type === 'tax' ? (
        <text x={cx} y={cell.y + 69} textAnchor="middle" fontSize={8.4} fill="#9c4a33" fontFamily="Inter, system-ui, sans-serif">
          {`$${space.tax}`}
        </text>
      ) : null}
    </g>
  )
}

function BoardSurface({ game, displayPos }: { game: GameState; displayPos: number }) {
  const markerCell = CELLS[displayPos]
  const targetPos = game.player.position
  const dice = game.dice
  const total = dice ? dice[0] + dice[1] : null
  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="block w-full select-none" role="img" aria-label="City Planner board">
      <defs>
        <pattern id="board-inner" width="26" height="26" patternUnits="userSpaceOnUse">
          <path d="M0 26L13 0l13 26z" fill="none" stroke="#e6e1d4" strokeWidth="0.6" />
        </pattern>
        <filter id="marker-shadow" x="-60%" y="-60%" width="220%" height="220%">
          <feDropShadow dx="0" dy="1.4" stdDeviation="1.4" floodColor="#1f2a2e" floodOpacity="0.32" />
        </filter>
      </defs>

      <rect x={0} y={0} width={SIZE} height={SIZE} rx={16} fill="#f6f3ea" stroke="#e3ddcd" />
      <rect
        x={ORIGIN + CELL + 10}
        y={ORIGIN + CELL + 10}
        width={SIZE - (ORIGIN + CELL) * 2 - 20}
        height={SIZE - (ORIGIN + CELL) * 2 - 20}
        rx={12}
        fill="url(#board-inner)"
      />

      {BOARD.map((space, index) => (
        <SpaceCell key={space.id} space={space} index={index} active={index === targetPos} />
      ))}

      <g transform={`translate(${SIZE / 2} ${SIZE / 2})`}>
        <circle r={68} fill="#fbfaf6" stroke="#ddd8c9" />
        <circle r={61} fill="none" stroke="#c9c3b2" strokeDasharray="2 5" />
        <g transform="translate(0 -34)">
          <path d="M0 -11l9.5 5.5v11L0 11l-9.5-5.5v-11z" fill="none" stroke="#2f5d62" strokeWidth={2} />
          <circle r={2.8} fill="#2f5d62" />
        </g>
        <text y={-4} textAnchor="middle" fontFamily="Georgia, serif" fontSize={16} letterSpacing={3.4} fill="#2f3b3c">
          CITY PLANNER
        </text>
        <text y={13} textAnchor="middle" fontFamily="Inter, system-ui, sans-serif" fontSize={6.8} letterSpacing={2.2} fill="#8b8677">
          MUNICIPAL DEVELOPMENT BOARD
        </text>
        <text y={40} textAnchor="middle" fontFamily="Inter, system-ui, sans-serif" fontSize={9} fill="#2f5d62" letterSpacing={1.8}>
          TURN {game.turn}
        </text>
        {total !== null ? (
          <text y={53} textAnchor="middle" fontFamily="Inter, system-ui, sans-serif" fontSize={7.2} fill="#8b8677" letterSpacing={1}>
            LAST ROLL {dice?.[0]} + {dice?.[1]} = {total}
          </text>
        ) : (
          <text y={53} textAnchor="middle" fontFamily="Inter, system-ui, sans-serif" fontSize={7.2} fill="#a9a394" letterSpacing={1}>
            ROLL TO BEGIN
          </text>
        )}
      </g>

      <g transform={`translate(${markerCell.x + CELL / 2} ${markerCell.y + CELL / 2})`} filter="url(#marker-shadow)" style={{ transition: 'transform 110ms linear' }}>
        <circle r={13} fill="#2f5d62" stroke="#fdfcf8" strokeWidth={2.4} />
        <path d="M-4.2 3.4V-0.4L0 -3.8l4.2 3.4v3.8z" fill="#fdfcf8" />
      </g>
    </svg>
  )
}

export function GameBoard() {
  const game = useGame((state) => state.game)
  const [displayPos, setDisplayPos] = useState(game?.player.position ?? 0)
  const [expanded, setExpanded] = useState(false)
  const targetPos = game?.player.position ?? 0
  const animate = game?.settings.diceAnimation ?? true

  useEffect(() => {
    if (!animate) {
      setDisplayPos(targetPos)
      return
    }
    if (displayPos === targetPos) return
    if (Math.abs(displayPos - targetPos) > 12) {
      setDisplayPos(targetPos)
      return
    }
    const next = (displayPos + 1) % 40
    const timer = window.setTimeout(() => setDisplayPos(next), 95)
    return () => window.clearTimeout(timer)
  }, [displayPos, targetPos, animate])

  useEffect(() => {
    setDisplayPos(game?.player.position ?? 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game?.seed])

  if (!game) return null
  const current = BOARD[game.player.position]

  return (
    <div className="card overflow-hidden p-2.5">
      <div className="flex items-center justify-between gap-2 px-1 pb-2">
        <span className="label">Municipal board</span>
        <div className="flex items-center gap-1.5">
          <span className="chip num">
            {current.id}/40 · {current.short}
          </span>
          <button className="btn-ghost btn-xs" onClick={() => setExpanded(true)} title="Expand board">
            Expand
          </button>
        </div>
      </div>
      <BoardSurface game={game} displayPos={displayPos} />
      <div className="flex items-center justify-between px-1 pt-2 text-[11px] text-stone-500">
        <span>{current.name}</span>
        <span className="num">Balance {game.player.balance.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}</span>
      </div>

      {expanded ? (
        <Modal size="xl" onClose={() => setExpanded(false)} label="Expanded board">
          <div className="card overflow-hidden p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="label">Municipal board</span>
              <button className="btn-secondary btn-xs" onClick={() => setExpanded(false)}>
                Close
              </button>
            </div>
            <BoardSurface game={game} displayPos={displayPos} />
          </div>
        </Modal>
      ) : null}
    </div>
  )
}
