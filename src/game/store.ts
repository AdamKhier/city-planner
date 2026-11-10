import { create } from 'zustand'
import type {
  CategoryId,
  GameSettings,
  GameState,
  LogEntry,
  Notice,
  Pending,
  Snapshot,
  Tile,
  Transaction,
} from './types'
import { BOARD, PASS_START_BONUS, PLANNING_HOLD_FEE } from './board'
import { CATEGORIES } from './content'
import { DECKS } from './cards'
import { createGame, DEFAULT_SETTINGS, formatMoney, rollDie, shuffle, uid } from './engine'
import { evaluateMilestones } from './milestones'
import { footprintIds } from './hex'
import { scheduleAutosave, readSlot, writeSlot, type SlotId } from './persistence'

type Ctx = { notices: Notice[] }

function loadDefaultSettings(): GameSettings {
  try {
    const raw = localStorage.getItem('cityplanner:v1:settings')
    if (raw) return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<GameSettings>) }
  } catch {
    // ignore corrupted settings
  }
  return { ...DEFAULT_SETTINGS }
}

const MAX_LOG = 250

function snapshotOf(game: GameState): Snapshot {
  return structuredClone({
    tiles: game.tiles,
    player: game.player,
    transactions: game.transactions,
    log: game.log,
    stats: game.stats,
    turn: game.turn,
    milestones: game.milestones,
    decks: game.decks,
    lastSpaceId: game.lastSpaceId,
    pending: game.pending,
  })
}

function appendLog(game: GameState, text: string, tone: LogEntry['tone'] = 'info') {
  game.log = [{ id: uid('log'), turn: game.turn, at: Date.now(), tone, text }, ...game.log].slice(0, MAX_LOG)
}

function record(game: GameState, kind: Transaction['kind'], label: string, amount: number) {
  game.transactions = [
    {
      id: uid('tx'),
      turn: game.turn,
      at: Date.now(),
      kind,
      label,
      amount,
      balance: game.player.balance,
    },
    ...game.transactions,
  ]
}

function gain(game: GameState, amount: number, label: string) {
  game.player.balance += amount
  game.stats.income += amount
  record(game, 'income', label, amount)
}

function spend(game: GameState, amount: number, label: string, kind: 'expense' | 'tax' = 'expense') {
  game.player.balance -= amount
  game.stats.spending += amount
  if (kind === 'tax') {
    game.stats.taxes += amount
    game.stats.treasury += amount
  }
  record(game, kind, label, -amount)
}

function spendToTreasury(game: GameState, amount: number, label: string) {
  spend(game, amount, label, 'tax')
}

function notifyMoney(ctx: Ctx, label: string, amount: number) {
  ctx.notices.push({
    id: uid('notice'),
    tone: amount >= 0 ? 'good' : 'bad',
    text: `${label}: ${amount >= 0 ? '+' : ''}${formatMoney(amount)}`,
  })
}

function drawCard(game: GameState, deck: 'chance' | 'community') {
  const draw = deck === 'chance' ? game.decks.chance : game.decks.community
  const discard = deck === 'chance' ? game.decks.chanceDiscard : game.decks.communityDiscard
  if (draw.length === 0) {
    const reshuffled = shuffle(discard)
    discard.length = 0
    draw.push(...reshuffled)
  }
  const cardIndex = draw.shift()
  if (cardIndex === undefined) return
  discard.push(cardIndex)
  game.pending = { kind: 'card', deck, cardIndex }
}

function resolveSpace(game: GameState, ctx: Ctx) {
  const space = BOARD[game.player.position]
  game.lastSpaceId = space.id
  switch (space.type) {
    case 'start': {
      appendLog(game, 'Landed on START. A fresh turn of planning begins.', 'info')
      break
    }
    case 'development': {
      if (game.player.blockNextDevelopment > 0) {
        game.player.blockNextDevelopment -= 1
        appendLog(game, `Construction delays: no development can start at ${space.name}.`, 'bad')
        ctx.notices.push({ id: uid('n'), tone: 'bad', text: 'Construction delays: development missed.' })
        return
      }
      const categoryId = space.category as CategoryId
      const free = game.player.freeDevelopmentTokens > 0
      game.pending = {
        kind: 'opportunity',
        spaceId: space.id,
        categoryId,
        cost: space.cost ?? 0,
        outcomeIndex: null,
        usingFreeToken: free,
      }
      appendLog(game, `Landed on ${space.name}: ${CATEGORIES[categoryId].name.toLowerCase()} opportunity available.`, 'info')
      break
    }
    case 'tax': {
      const amount = space.tax ?? 0
      spendToTreasury(game, amount, space.name)
      appendLog(game, `${space.name}: paid ${formatMoney(amount)} into the city treasury.`, 'bad')
      notifyMoney(ctx, space.name, -amount)
      break
    }
    case 'chance':
      drawCard(game, 'chance')
      appendLog(game, 'Landed on Chance and drew a card.', 'info')
      break
    case 'community':
      drawCard(game, 'community')
      appendLog(game, 'Landed on Community Chest and drew a card.', 'info')
      break
    case 'freeParking': {
      const treasury = game.stats.treasury
      if (treasury > 0) {
        game.stats.treasury = 0
        gain(game, treasury, 'City treasury (Free Parking)')
        appendLog(game, `Free Parking: collected the ${formatMoney(treasury)} holding in the city treasury.`, 'good')
        notifyMoney(ctx, 'Free Parking', treasury)
      } else {
        appendLog(game, 'Free Parking. The city treasury is empty for now.', 'info')
      }
      break
    }
    case 'cityHall':
      game.pending = { kind: 'cityHall' }
      appendLog(game, 'Stopped at City Hall to review the city accounts.', 'info')
      break
    case 'planningHold':
      game.pending = { kind: 'planningHold' }
      appendLog(game, 'Planning Hold: the review board wants changes before work continues.', 'bad')
      break
  }
}

function checkMilestones(game: GameState, ctx: Ctx) {
  const reached = evaluateMilestones(game)
  if (reached.length === 0) return
  const ids = new Set(game.milestones)
  for (const milestone of reached) {
    if (ids.has(milestone.id)) continue
    ids.add(milestone.id)
    appendLog(game, `Milestone reached: ${milestone.name}.`, 'good')
    ctx.notices.push({ id: uid('n'), tone: 'good', text: `Milestone reached: ${milestone.name}` })
  }
  game.milestones = Array.from(ids)
}

function basicPlacement(
  game: GameState,
  categoryId: CategoryId,
  cost: number,
  label: string,
  ctx: Ctx,
): Extract<Pending, { kind: 'placement' }> | null {
  const category = CATEGORIES[categoryId]
  const outcomeIndex = rollDie() - 1
  const outcome = category.outcomes[outcomeIndex]
  const cardBuild = cost === 0
  appendLog(
    game,
    `${label}: ${outcome.name} approved (${outcome.size} hex${outcome.size > 1 ? 'es' : ''})${cardBuild ? ' at no cost' : ` for ${formatMoney(cost)}`}.`,
    'good',
  )
  ctx.notices.push({ id: uid('n'), tone: 'good', text: `${label}: ${outcome.name} ready to place.` })
  return {
    kind: 'placement',
    categoryId,
    outcomeIndex,
    name: outcome.name,
    description: outcome.description,
    cost,
    size: outcome.size,
    origin: 'card',
    label,
    freeToken: false,
  }
}

interface GameStore {
  screen: 'menu' | 'game'
  game: GameState | null
  undo: Snapshot[]
  redo: Snapshot[]
  notices: Notice[]
  newGameSettings: GameSettings
  updateNewGameSettings: (patch: Partial<GameSettings>) => void
  startNewGame: (seed?: number) => void
  continueGame: () => boolean
  loadSlotGame: (slot: SlotId) => boolean
  saveToSlot: (slot: SlotId) => boolean
  goToMenu: () => void
  dismissNotice: (id: string) => void
  pushNotice: (text: string, tone?: Notice['tone']) => void
  roll: () => void
  rollOutcome: () => void
  startConstruction: () => void
  cancelPending: () => void
  placeDevelopment: (tileId: string) => void
  acknowledgeCard: () => void
  planningHoldDecision: (pay: boolean) => void
  collectTreasury: () => void
  closePending: () => void
  toggleRoad: (tileId: string) => void
  demolish: (tileId: string) => void
  undoAction: () => void
  redoAction: () => void
  updateSettings: (patch: Partial<GameSettings>) => void
}

export const useGame = create<GameStore>((set, get) => {
  const edit = (
    mutator: (game: GameState, ctx: Ctx) => void,
    options: { history?: boolean } = {},
  ) => {
    const state = get()
    if (!state.game) return
    const next = structuredClone(state.game)
    const ctx: Ctx = { notices: [] }
    const snapshot = options.history ? snapshotOf(state.game) : null
    mutator(next, ctx)
    next.updatedAt = Date.now()
    set({
      game: next,
      notices: [...state.notices, ...ctx.notices].slice(-4),
      undo: snapshot ? [...state.undo, snapshot].slice(-30) : state.undo,
      redo: snapshot ? [] : state.redo,
    })
    scheduleAutosave(next)
  }

  return {
    screen: 'menu',
    game: null,
    undo: [],
    redo: [],
    notices: [],
    newGameSettings: loadDefaultSettings(),

    updateNewGameSettings: (patch) => {
      const next = { ...get().newGameSettings, ...patch }
      set({ newGameSettings: next })
      try {
        localStorage.setItem('cityplanner:v1:settings', JSON.stringify(next))
      } catch {
        // storage unavailable — defaults still apply for this session
      }
    },

    startNewGame: (seed) => {
      const game = createGame(seed, get().newGameSettings)
      set({ game, screen: 'game', undo: [], redo: [], notices: [] })
      writeSlot('auto', game)
    },

    continueGame: () => {
      const game = readSlot('auto')
      if (!game) return false
      set({ game, screen: 'game', undo: [], redo: [], notices: [] })
      return true
    },

    loadSlotGame: (slot) => {
      const game = readSlot(slot)
      if (!game) return false
      set({ game, screen: 'game', undo: [], redo: [], notices: [] })
      writeSlot('auto', game)
      return true
    },

    saveToSlot: (slot) => {
      const state = get()
      if (!state.game) return false
      const ok = writeSlot(slot, state.game)
      const notice: Notice = {
        id: uid('n'),
        tone: ok ? 'good' : 'bad',
        text: ok ? `Game saved to slot ${slot}.` : 'Save failed — browser storage may be full.',
      }
      set({ notices: [...state.notices, notice].slice(-4) })
      return ok
    },

    goToMenu: () => {
      const state = get()
      if (state.game) writeSlot('auto', state.game)
      set({ screen: 'menu' })
    },

    dismissNotice: (id) => set({ notices: get().notices.filter((notice) => notice.id !== id) }),

    pushNotice: (text, tone: Notice['tone'] = 'info') =>
      set({ notices: [...get().notices, { id: uid('n'), tone, text } as Notice].slice(-4) }),

    roll: () =>
      edit((game, ctx) => {
        if (game.pending) return
        if (game.player.skipTurns > 0) {
          game.player.skipTurns -= 1
          game.player.turns += 1
          game.turn += 1
          appendLog(game, 'Planning hold served: this turn is missed.', 'info')
          ctx.notices.push({ id: uid('n'), tone: 'info', text: 'Planning hold served: turn missed.' })
          return
        }
        const dieOne = rollDie()
        const dieTwo = rollDie()
        const total = dieOne + dieTwo
        game.dice = [dieOne, dieTwo]
        game.player.turns += 1
        game.turn += 1
        appendLog(game, `Rolled ${dieOne} + ${dieTwo} = ${total}.`, 'info')
        if (game.player.position + total >= BOARD.length) {
          gain(game, PASS_START_BONUS, 'Passed START')
          appendLog(game, `Passed START and collected ${formatMoney(PASS_START_BONUS)}.`, 'good')
          notifyMoney(ctx, 'Passed START', PASS_START_BONUS)
        }
        game.player.position = (game.player.position + total) % BOARD.length
        resolveSpace(game, ctx)
      }),

    rollOutcome: () =>
      edit((game) => {
        const pending = game.pending
        if (!pending || pending.kind !== 'opportunity' || pending.outcomeIndex !== null) return
        const outcomeIndex = rollDie() - 1
        const category = CATEGORIES[pending.categoryId]
        const outcome = category.outcomes[outcomeIndex]
        game.pending = { ...pending, outcomeIndex }
        const space = BOARD[pending.spaceId - 1]
        appendLog(
          game,
          `${space.name}: generated ${outcome.name} — ${outcome.size} hex${outcome.size > 1 ? 'es' : ''}, ${outcome.description}`,
          'info',
        )
      }),

    startConstruction: () =>
      edit((game, ctx) => {
        const pending = game.pending
        if (!pending || pending.kind !== 'opportunity' || pending.outcomeIndex === null) return
        const outcome = CATEGORIES[pending.categoryId].outcomes[pending.outcomeIndex]
        const cost = pending.usingFreeToken ? 0 : pending.cost
        if (game.player.balance < cost) {
          ctx.notices.push({ id: uid('n'), tone: 'bad', text: 'Insufficient funds — this development cannot be built.' })
          return
        }
        game.pending = {
          kind: 'placement',
          categoryId: pending.categoryId,
          outcomeIndex: pending.outcomeIndex,
          name: outcome.name,
          description: outcome.description,
          cost,
          size: outcome.size,
          origin: 'board',
          label: BOARD[pending.spaceId - 1].name,
          freeToken: pending.usingFreeToken,
        }
      }),

    cancelPending: () =>
      edit((game, ctx) => {
        const pending = game.pending
        if (!pending) return
        if (pending.kind === 'placement') {
          appendLog(
            game,
            `Cancelled ${pending.name}. No charge was made.`,
            'info',
          )
          ctx.notices.push({ id: uid('n'), tone: 'info', text: 'Development cancelled — you were not charged.' })
        } else if (pending.kind === 'cityHall' || pending.kind === 'planningHold') {
          appendLog(game, 'No action taken.', 'info')
        }
        game.pending = null
      }),

    placeDevelopment: (tileId) =>
      edit(
        (game, ctx) => {
          const pending = game.pending
          if (!pending || pending.kind !== 'placement') return
          const ids = footprintIds(game.tiles, tileId, pending.size)
          if (ids.length !== pending.size) {
            ctx.notices.push({ id: uid('n'), tone: 'bad', text: 'There is not enough land here for this development.' })
            return
          }
          if (ids.some((id) => !game.tiles[id] || game.tiles[id].development)) {
            ctx.notices.push({ id: uid('n'), tone: 'bad', text: 'That site overlaps an existing development.' })
            return
          }
          if (game.player.balance < pending.cost) {
            ctx.notices.push({ id: uid('n'), tone: 'bad', text: 'Insufficient funds — choose a cheaper site or cancel.' })
            return
          }
          const groupId = uid('dev')
          const anchorId = ids[0]
          for (const id of ids) {
            const tile: Tile = game.tiles[id]
            tile.development = {
              groupId,
              categoryId: pending.categoryId,
              outcomeIndex: pending.outcomeIndex,
              name: pending.name,
              cost: pending.cost,
              turn: game.turn,
              anchorId,
            }
            tile.road = false
          }
          if (pending.freeToken) {
            game.player.freeDevelopmentTokens = Math.max(0, game.player.freeDevelopmentTokens - 1)
          }
          if (pending.cost > 0) {
            spend(game, pending.cost, `Built ${pending.name} (${pending.label})`)
            notifyMoney(ctx, `Built ${pending.name}`, -pending.cost)
          } else {
            appendLog(game, `${pending.name} completed at no cost.`, 'good')
            ctx.notices.push({ id: uid('n'), tone: 'good', text: `${pending.name} completed for free.` })
          }
          appendLog(
            game,
            `Placed ${pending.name} on ${ids.length} hex${ids.length > 1 ? 'es' : ''}.`,
            'good',
          )
          game.pending = null
          checkMilestones(game, ctx)
        },
        { history: true },
      ),

    acknowledgeCard: () =>
      edit((game, ctx) => {
        const pending = game.pending
        if (!pending || pending.kind !== 'card') return
        const card = DECKS[pending.deck][pending.cardIndex]
        const effect = card.effect
        game.pending = null
        switch (effect.type) {
          case 'money': {
            if (effect.amount >= 0) {
              gain(game, effect.amount, card.title)
            } else {
              spendToTreasury(game, Math.abs(effect.amount), card.title)
            }
            appendLog(game, `${card.title}: ${effect.amount >= 0 ? 'collected' : 'paid'} ${formatMoney(Math.abs(effect.amount))}.`, effect.amount >= 0 ? 'good' : 'bad')
            notifyMoney(ctx, card.title, effect.amount)
            break
          }
          case 'freeBuild': {
            const placement = basicPlacement(game, effect.category, 0, card.title, ctx)
            if (placement) game.pending = placement
            break
          }
          case 'halfPrice': {
            const half = Math.round(CATEGORIES[effect.category].baseCost / 2)
            const placement = basicPlacement(game, effect.category, half, card.title, ctx)
            if (placement) game.pending = placement
            break
          }
          case 'skipDevelopment': {
            game.player.blockNextDevelopment += 1
            appendLog(game, `${card.title}: your next development is delayed.`, 'bad')
            ctx.notices.push({ id: uid('n'), tone: 'bad', text: 'Construction delays: next development missed.' })
            break
          }
          case 'freeDevelopment': {
            game.player.freeDevelopmentTokens += 1
            appendLog(game, `${card.title}: one development will be built free of charge.`, 'good')
            ctx.notices.push({ id: uid('n'), tone: 'good', text: 'Free development token granted.' })
            break
          }
        }
      }),

    planningHoldDecision: (pay) =>
      edit((game, ctx) => {
        if (game.pending?.kind !== 'planningHold') return
        if (pay) {
          if (game.player.balance < PLANNING_HOLD_FEE) {
            ctx.notices.push({ id: uid('n'), tone: 'bad', text: 'Not enough funds to pay the planning fee.' })
            return
          }
          spendToTreasury(game, PLANNING_HOLD_FEE, 'Planning hold release fee')
          appendLog(game, `Paid ${formatMoney(PLANNING_HOLD_FEE)} to leave the planning hold immediately.`, 'bad')
          notifyMoney(ctx, 'Planning hold release', -PLANNING_HOLD_FEE)
        } else {
          game.player.skipTurns += 1
          appendLog(game, 'Accepted the planning hold — the next turn will be missed.', 'bad')
          ctx.notices.push({ id: uid('n'), tone: 'bad', text: 'Planning hold accepted: next turn missed.' })
        }
        game.pending = null
      }),

    collectTreasury: () =>
      edit((game, ctx) => {
        if (game.pending?.kind !== 'cityHall') return
        const treasury = game.stats.treasury
        game.pending = null
        if (treasury <= 0) {
          appendLog(game, 'City Hall: the treasury is currently empty.', 'info')
          ctx.notices.push({ id: uid('n'), tone: 'info', text: 'The city treasury is empty.' })
          return
        }
        game.stats.treasury = 0
        gain(game, treasury, 'Collected city treasury (City Hall)')
        appendLog(game, `City Hall released ${formatMoney(treasury)} from the city treasury.`, 'good')
        notifyMoney(ctx, 'City Hall treasury', treasury)
      }),

    closePending: () =>
      edit((game) => {
        game.pending = null
      }),

    toggleRoad: (tileId) =>
      edit(
        (game, ctx) => {
          const tile = game.tiles[tileId]
          if (!tile) return
          if (tile.development) {
            ctx.notices.push({ id: uid('n'), tone: 'bad', text: 'Roads cannot be laid under a development.' })
            return
          }
          if (tile.road) {
            tile.road = false
            appendLog(game, 'Removed a section of road.', 'info')
            return
          }
          const cost = game.settings.roadCost
          if (game.player.balance < cost) {
            ctx.notices.push({ id: uid('n'), tone: 'bad', text: `A road section costs ${formatMoney(cost)} — insufficient funds.` })
            return
          }
          spendToTreasury(game, cost, 'Road construction')
          tile.road = true
          appendLog(game, `Laid a road section for ${formatMoney(cost)}.`, 'info')
          notifyMoney(ctx, 'Road section', -cost)
          checkMilestones(game, ctx)
        },
        { history: true },
      ),

    demolish: (tileId) =>
      edit(
        (game, ctx) => {
          const tile = game.tiles[tileId]
          const development = tile?.development
          if (!development) return
          const group = Object.values(game.tiles).filter((t) => t.development?.groupId === development.groupId)
          const refund = Math.round(development.cost * 0.25)
          for (const t of group) t.development = null
          if (refund > 0) {
            gain(game, refund, `Demolished ${development.name} (25% salvage)`)
            notifyMoney(ctx, `Demolished ${development.name}`, refund)
          }
          appendLog(
            game,
            `Demolished ${development.name}, freeing ${group.length} hex${group.length > 1 ? 'es' : ''}${refund > 0 ? ` and recovering ${formatMoney(refund)}` : ''}.`,
            'info',
          )
        },
        { history: true },
      ),

    undoAction: () => {
      const state = get()
      if (!state.game || state.undo.length === 0) return
      const snapshot = structuredClone(state.undo[state.undo.length - 1])
      const current = snapshotOf(state.game)
      set({
        game: { ...structuredClone(state.game), ...snapshot, updatedAt: Date.now() },
        undo: state.undo.slice(0, -1),
        redo: [...state.redo, current].slice(-30),
      })
      scheduleAutosave(get().game as GameState)
    },

    redoAction: () => {
      const state = get()
      if (!state.game || state.redo.length === 0) return
      const snapshot = structuredClone(state.redo[state.redo.length - 1])
      const current = snapshotOf(state.game)
      set({
        game: { ...structuredClone(state.game), ...snapshot, updatedAt: Date.now() },
        redo: state.redo.slice(0, -1),
        undo: [...state.undo, current].slice(-30),
      })
      scheduleAutosave(get().game as GameState)
    },

    updateSettings: (patch) =>
      edit((game) => {
        game.settings = { ...game.settings, ...patch }
      }),
  }
})
