import { useState } from 'react'
import { useGame } from '../game/store'
import { deleteSlot, readSlot, slotInfo, type SlotId } from '../game/persistence'
import { formatMoney } from '../game/engine'
import { Icon, Modal } from './ui'

function formatWhen(timestamp: number): string {
  const date = new Date(timestamp)
  return `${date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })} · ${date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  })}`
}

export function SaveLoadModal({ mode = 'load', onClose }: { mode?: 'load' | 'save'; onClose: () => void }) {
  const game = useGame((state) => state.game)
  const saveToSlot = useGame((state) => state.saveToSlot)
  const loadSlotGame = useGame((state) => state.loadSlotGame)
  const [tick, setTick] = useState(0)

  const refresh = () => setTick((value) => value + 1)
  const auto = slotInfo('auto')
  const slots = [1, 2, 3].map((slot) => slotInfo(String(slot) as SlotId))

  const handleLoad = (slot: SlotId) => {
    if (!window.confirm('Load this save? Any unsaved progress in the current city will be replaced.')) return
    if (loadSlotGame(slot)) {
      onClose()
    }
  }

  const handleSave = (slot: SlotId) => {
    if (slotInfo(slot) && !window.confirm(`Overwrite slot ${slot}?`)) return
    saveToSlot(slot)
    refresh()
  }

  const handleDelete = (slot: SlotId) => {
    if (!window.confirm(`Delete the save in slot ${slot}? This cannot be undone.`)) return
    deleteSlot(slot)
    refresh()
  }

  return (
    <Modal size="lg" onClose={onClose} label="Saves">
      <div className="card overflow-hidden">
        <div className="flex items-start justify-between border-b border-stone-200/80 px-5 py-4">
          <div>
            <h2 className="font-display text-xl text-ink">Saves</h2>
            <p className="mt-1 text-xs text-stone-500">
              {mode === 'save' ? 'Store the current city, or switch to another save.' : 'Resume a saved city or manage your slots.'}
            </p>
          </div>
          <button className="btn-ghost px-2" onClick={onClose} aria-label="Close">
            <Icon name="close" />
          </button>
        </div>

        <div className="divide-y divide-stone-200/80">
          <div className="flex flex-wrap items-center gap-3 px-5 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-civic/10 text-civic">
              <Icon name="history" />
            </div>
            <div className="min-w-[140px] flex-1">
              <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                Autosave
                <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-stone-500">
                  automatic
                </span>
              </div>
              <div className="text-[11px] text-stone-500">
                {auto ? `Turn ${auto.turn} · ${formatMoney(auto.balance)} · ${formatWhen(auto.savedAt)}` : 'No autosave yet'}
              </div>
            </div>
            <button className="btn-secondary btn-xs" disabled={!game} onClick={() => { saveToSlot('auto'); refresh() }}>
              Save now
            </button>
            <button className="btn-primary btn-xs" disabled={!auto} onClick={() => handleLoad('auto')}>
              Load
            </button>
          </div>

          {slots.map((info, index) => {
            const slot = String(index + 1) as SlotId
            return (
              <div key={slot} className="flex flex-wrap items-center gap-3 px-5 py-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-stone-100 text-stone-500">
                  <Icon name="folder" />
                </div>
                <div className="min-w-[140px] flex-1">
                  <div className="text-sm font-semibold text-ink">Slot {slot}</div>
                  <div className="text-[11px] text-stone-500">
                    {info ? `Turn ${info.turn} · ${formatMoney(info.balance)} · ${info.developments} developments · ${formatWhen(info.savedAt)}` : 'Empty'}
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <button className="btn-secondary btn-xs" disabled={!game} onClick={() => handleSave(slot)}>
                    Save
                  </button>
                  <button className="btn-secondary btn-xs" disabled={!info} onClick={() => handleLoad(slot)}>
                    Load
                  </button>
                  <button className="btn-ghost btn-xs text-[#a1472f]" disabled={!info} onClick={() => handleDelete(slot)}>
                    Delete
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-stone-200/80 bg-stone-50/60 px-5 py-3 text-[11px] text-stone-500">
          <span>Autosave runs after every action. Manual saves are kept separately.</span>
          <button className="btn-ghost btn-xs" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </Modal>
  )
}
