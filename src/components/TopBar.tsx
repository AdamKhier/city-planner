import { useGame } from '../game/store'
import { formatMoney } from '../game/engine'
import { Icon } from './ui'

export function TopBar({
  onOpenHistory,
  onOpenSaves,
  onOpenSettings,
  onOpenRules,
}: {
  onOpenHistory: () => void
  onOpenSaves: () => void
  onOpenSettings: () => void
  onOpenRules: () => void
}) {
  const game = useGame((state) => state.game)
  const goToMenu = useGame((state) => state.goToMenu)
  if (!game) return null

  return (
    <header className="sticky top-0 z-20 border-b border-stone-200/80 bg-parchment/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1800px] items-center gap-3 px-4">
        <div className="flex items-center gap-2.5">
          <svg viewBox="0 0 40 40" className="h-8 w-8" aria-hidden="true">
            <path d="M20 3l14.7 8.5v17L20 37 5.3 28.5v-17z" fill="#2f5d62" />
            <path d="M20 11l7.8 4.5v9L20 29l-7.8-4.5v-9z" fill="none" stroke="#f4f2ec" strokeWidth="1.6" />
            <circle cx="20" cy="20" r="2.6" fill="#f4f2ec" />
          </svg>
          <div className="leading-tight">
            <div className="font-display text-[17px] tracking-[0.14em] text-ink">CITY PLANNER</div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-stone-500">Municipal development board</div>
          </div>
        </div>

        <div className="ml-2 hidden items-center gap-2 md:flex">
          <span className="chip num">Turn {game.turn}</span>
          <span className="chip">Planning hold {game.player.skipTurns > 0 ? 'active' : 'clear'}</span>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <div className="rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-right">
            <div className="text-[9px] font-semibold uppercase tracking-[0.14em] text-stone-500">Balance</div>
            <div className="num text-[15px] font-semibold leading-tight text-civic">{formatMoney(game.player.balance)}</div>
          </div>
          <div className="hidden rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-right sm:block">
            <div className="text-[9px] font-semibold uppercase tracking-[0.14em] text-stone-500">Treasury</div>
            <div className="num text-[15px] font-semibold leading-tight text-stone-700">{formatMoney(game.stats.treasury)}</div>
          </div>

          <div className="ml-1 flex items-center gap-0.5">
            <button className="btn-ghost px-2" onClick={onOpenHistory} title="Transaction history" aria-label="Transaction history">
              <Icon name="history" />
            </button>
            <button className="btn-ghost px-2" onClick={onOpenSaves} title="Save and load" aria-label="Save and load">
              <Icon name="save" />
            </button>
            <button className="btn-ghost px-2" onClick={onOpenSettings} title="Game settings" aria-label="Game settings">
              <Icon name="gear" />
            </button>
            <button className="btn-ghost px-2" onClick={onOpenRules} title="Rules and instructions" aria-label="Rules and instructions">
              <Icon name="book" />
            </button>
            <button className="btn-ghost ml-1 px-2" onClick={goToMenu} title="Main menu (progress is autosaved)" aria-label="Main menu">
              <Icon name="menu" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
