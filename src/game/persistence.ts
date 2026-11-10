import type { GameState } from './types'
import { computeCity } from './engine'

export type SlotId = 'auto' | '1' | '2' | '3'

export const SLOT_IDS: SlotId[] = ['1', '2', '3']

const KEY_PREFIX = 'cityplanner:v1:'
const keyFor = (slot: SlotId) => `${KEY_PREFIX}slot:${slot}`

export interface SlotInfo {
  slot: SlotId
  savedAt: number
  turn: number
  balance: number
  developments: number
}

export function writeSlot(slot: SlotId, game: GameState): boolean {
  try {
    localStorage.setItem(keyFor(slot), JSON.stringify(game))
    return true
  } catch (error) {
    console.warn('City Planner: save failed', error)
    return false
  }
}

export function readSlot(slot: SlotId): GameState | null {
  try {
    const raw = localStorage.getItem(keyFor(slot))
    if (!raw) return null
    const parsed = JSON.parse(raw) as GameState
    if (!parsed || typeof parsed !== 'object' || !parsed.tiles || !parsed.player) return null
    return parsed
  } catch (error) {
    console.warn('City Planner: load failed', error)
    return null
  }
}

export function deleteSlot(slot: SlotId): void {
  try {
    localStorage.removeItem(keyFor(slot))
  } catch (error) {
    console.warn('City Planner: delete failed', error)
  }
}

export function slotInfo(slot: SlotId): SlotInfo | null {
  const game = readSlot(slot)
  if (!game) return null
  return {
    slot,
    savedAt: game.updatedAt ?? game.createdAt ?? Date.now(),
    turn: game.turn,
    balance: game.player.balance,
    developments: computeCity(game.tiles).developments,
  }
}

export function hasAutoSave(): boolean {
  return readSlot('auto') !== null
}

let autosaveTimer: number | undefined

export function scheduleAutosave(game: GameState): void {
  if (typeof window === 'undefined') return
  window.clearTimeout(autosaveTimer)
  autosaveTimer = window.setTimeout(() => {
    writeSlot('auto', game)
  }, 500)
}

export function flushAutosave(game: GameState): void {
  window.clearTimeout(autosaveTimer)
  writeSlot('auto', game)
}
