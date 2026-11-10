import type { CitySummary, GameState, GameSettings } from './types'
import { CATEGORIES } from './content'
import { createTiles } from './hex'
import { START_BALANCE, DEFAULT_ROAD_COST } from './board'
import { CHANCE_CARDS, COMMUNITY_CARDS } from './cards'

let counter = 0
export function uid(prefix = 'id'): string {
  counter += 1
  return `${prefix}_${Date.now().toString(36)}_${counter.toString(36)}`
}

export function rollDie(rng: () => number = Math.random): number {
  return 1 + Math.floor(rng() * 6)
}

export function shuffle<T>(items: T[], rng: () => number = Math.random): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export const DEFAULT_SETTINGS: GameSettings = {
  diceAnimation: true,
  roadCost: DEFAULT_ROAD_COST,
}

export function initialDeck(size: number): number[] {
  return Array.from({ length: size }, (_, i) => i)
}

export function createGame(seed = Math.floor(Math.random() * 1_000_000_000), settings?: Partial<GameSettings>): GameState {
  const now = Date.now()
  const chanceOrder = shuffle(initialDeck(CHANCE_CARDS.length))
  const communityOrder = shuffle(initialDeck(COMMUNITY_CARDS.length))
  return {
    version: 1,
    seed,
    createdAt: now,
    updatedAt: now,
    turn: 1,
    player: {
      balance: START_BALANCE,
      position: 0,
      turns: 0,
      skipTurns: 0,
      blockNextDevelopment: 0,
      freeDevelopmentTokens: 0,
    },
    tiles: createTiles(seed),
    dice: null,
    pending: null,
    decks: {
      chance: chanceOrder,
      chanceDiscard: [],
      community: communityOrder,
      communityDiscard: [],
    },
    transactions: [
      {
        id: uid('tx'),
        turn: 0,
        at: now,
        kind: 'income',
        label: 'Opening municipal budget',
        amount: START_BALANCE,
        balance: START_BALANCE,
      },
    ],
    log: [
      {
        id: uid('log'),
        turn: 1,
        at: now,
        tone: 'info',
        text: 'Welcome to City Planner. Roll the dice to begin your first development.',
      },
    ],
    milestones: [],
    stats: { income: START_BALANCE, spending: 0, taxes: 0, treasury: 0 },
    settings: { ...DEFAULT_SETTINGS, ...settings },
    lastSpaceId: 1,
  }
}

export function formatMoney(value: number): string {
  const rounded = Math.round(value)
  const sign = rounded < 0 ? '-' : ''
  return `${sign}$${Math.abs(rounded).toLocaleString('en-US')}`
}

export function computeCity(tiles: GameState['tiles']): CitySummary {
  const summary: CitySummary = {
    developments: 0,
    developedHexes: 0,
    remainingLand: 0,
    roads: 0,
    residential: 0,
    commercial: 0,
    industrial: 0,
    publicServices: 0,
    infrastructure: 0,
    nature: 0,
    population: 0,
    jobs: 0,
    highRise: 0,
    majorTransport: 0,
    parks: 0,
  }
  const groups = new Set<string>()
  for (const tile of Object.values(tiles)) {
    if (tile.road) summary.roads += 1
    if (!tile.development) {
      summary.remainingLand += 1
      continue
    }
    summary.developedHexes += 1
    const dev = tile.development
    const category = CATEGORIES[dev.categoryId]
    const outcome = category.outcomes[dev.outcomeIndex]
    if (!groups.has(dev.groupId)) {
      groups.add(dev.groupId)
      summary.developments += 1
      summary.population += outcome.population ?? 0
      summary.jobs += outcome.jobs ?? 0
      switch (category.group) {
        case 'residential':
          summary.residential += 1
          if (dev.outcomeIndex >= 4) summary.highRise += 1
          break
        case 'commercial':
          summary.commercial += 1
          if (dev.outcomeIndex >= 5) summary.highRise += 1
          break
        case 'industrial':
          summary.industrial += 1
          break
        case 'civic':
          summary.publicServices += 1
          break
        case 'special':
          summary.publicServices += 1
          break
        case 'nature':
          summary.nature += 1
          if (category.id === 'park') summary.parks += 1
          break
        case 'infrastructure':
          summary.infrastructure += 1
          break
      }
      if (
        category.id === 'airport' ||
        category.id === 'seaport' ||
        category.id === 'motorway' ||
        (category.id === 'infrastructure' && dev.outcomeIndex >= 4)
      ) {
        summary.majorTransport += 1
      }
    }
  }
  return summary
}
