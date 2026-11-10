import { useGame } from '../game/store'
import { Icon, Modal } from './ui'

function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean
  onChange: (value: boolean) => void
  label: string
  description: string
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div>
        <div className="text-sm font-medium text-ink">{label}</div>
        <div className="mt-0.5 text-[11px] leading-snug text-stone-500">{description}</div>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? 'bg-civic' : 'bg-stone-300'}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-[22px]' : 'translate-x-0.5'}`}
        />
      </button>
    </div>
  )
}

export function SettingsModal({ menuMode = false, onClose }: { menuMode?: boolean; onClose: () => void }) {
  const game = useGame((state) => state.game)
  const newGameSettings = useGame((state) => state.newGameSettings)
  const updateSettings = useGame((state) => state.updateSettings)
  const updateNewGameSettings = useGame((state) => state.updateNewGameSettings)

  const settings = game?.settings ?? newGameSettings
  const apply = (patch: Partial<typeof settings>) => {
    if (game) updateSettings(patch)
    else updateNewGameSettings(patch)
  }

  return (
    <Modal size="md" onClose={onClose} label="Game settings">
      <div className="card overflow-hidden">
        <div className="flex items-start justify-between border-b border-stone-200/80 px-5 py-4">
          <div>
            <h2 className="font-display text-xl text-ink">Game settings</h2>
            <p className="mt-1 text-xs text-stone-500">
              {menuMode || !game ? 'Defaults applied to your next city.' : 'Changes apply immediately to this city.'}
            </p>
          </div>
          <button className="btn-ghost px-2" onClick={onClose} aria-label="Close">
            <Icon name="close" />
          </button>
        </div>

        <div className="divide-y divide-stone-200/70 px-5">
          <Toggle
            label="Animate dice and movement"
            description="Show tumbling dice and step the marker around the board."
            checked={settings.diceAnimation}
            onChange={(value) => apply({ diceAnimation: value })}
          />

          <div className="py-4">
            <div className="text-sm font-medium text-ink">Road cost per hex</div>
            <div className="mt-0.5 text-[11px] leading-snug text-stone-500">
              Charged when you lay a road section with the road tool. Paid into the city treasury.
            </div>
            <div className="mt-3 flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={1000}
                step={50}
                value={settings.roadCost}
                onChange={(event) => apply({ roadCost: Number(event.target.value) })}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-stone-200 accent-civic"
                aria-label="Road cost per hex"
              />
              <div className="num w-20 rounded-md border border-stone-200 bg-stone-50 px-2 py-1 text-right text-sm">
                ${settings.roadCost}
              </div>
            </div>
          </div>

          <div className="py-4 text-[11px] leading-relaxed text-stone-500">
            All progress is stored in your browser. Use <span className="font-semibold text-stone-700">Saves</span> for manual slots
            and autosave for recovery. The game works offline once loaded.
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-stone-200/80 bg-stone-50/60 px-5 py-3">
          <button
            className="btn-ghost btn-xs"
            onClick={() =>
              apply({ diceAnimation: true, roadCost: 150 })
            }
          >
            Reset defaults
          </button>
          <button className="btn-primary btn-xs px-3" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </Modal>
  )
}
