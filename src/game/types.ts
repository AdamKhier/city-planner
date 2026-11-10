export type CategoryId =
  | 'residential'
  | 'commercial'
  | 'industrial'
  | 'civic'
  | 'special'
  | 'infrastructure'
  | 'terrain'
  | 'farming'
  | 'power'
  | 'water'
  | 'airport'
  | 'seaport'
  | 'motorway'
  | 'park'
  | 'cycling'
  | 'tram'

export type SpaceType =
  | 'start'
  | 'cityHall'
  | 'freeParking'
  | 'planningHold'
  | 'chance'
  | 'community'
  | 'tax'
  | 'development'

export interface BoardSpace {
  /** 1-40, clockwise from START. */
  id: number
  name: string
  /** Shorter label used on the board. */
  short: string
  type: SpaceType
  category?: CategoryId
  cost?: number
  tax?: number
}

export interface Outcome {
  name: string
  description: string
  /** Number of hexagons the finished development occupies. */
  size: number
  population?: number
  jobs?: number
}

export interface Category {
  id: CategoryId
  name: string
  /** Colour used for board strips, map tiles and cards. */
  color: string
  /** Soft tint used behind text. */
  tint: string
  /** Cost used when a card grants a free or discounted build. */
  baseCost: number
  /** Broad grouping used in the city statistics. */
  group: 'residential' | 'commercial' | 'industrial' | 'civic' | 'special' | 'infrastructure' | 'nature'
  outcomes: [Outcome, Outcome, Outcome, Outcome, Outcome, Outcome]
}

export type NaturalType = 'grass' | 'forest' | 'lake' | 'hill' | 'wetland' | 'beach'

export interface Development {
  groupId: string
  categoryId: CategoryId
  outcomeIndex: number
  name: string
  cost: number
  turn: number
  anchorId: string
}

export interface Tile {
  id: string
  q: number
  r: number
  col: number
  row: number
  natural: NaturalType
  road: boolean
  development: Development | null
}

export interface PlayerState {
  balance: number
  /** 0-based index into the 40-space board. */
  position: number
  turns: number
  /** Turns that must be missed because of Planning Hold. */
  skipTurns: number
  /** Next development opportunity is cancelled (Construction Delays). */
  blockNextDevelopment: number
  /** Free development tokens (Planning Approval). */
  freeDevelopmentTokens: number
}

export interface GameSettings {
  diceAnimation: boolean
  roadCost: number
}

export interface Transaction {
  id: string
  turn: number
  at: number
  kind: 'income' | 'expense' | 'tax' | 'treasury'
  label: string
  /** Signed amount, positive for income. */
  amount: number
  balance: number
}

export interface LogEntry {
  id: string
  turn: number
  at: number
  tone: 'info' | 'good' | 'bad'
  text: string
}

export interface DeckState {
  chance: number[]
  chanceDiscard: number[]
  community: number[]
  communityDiscard: number[]
}

export type Pending =
  | {
      kind: 'opportunity'
      spaceId: number
      categoryId: CategoryId
      cost: number
      outcomeIndex: number | null
      usingFreeToken: boolean
    }
  | {
      kind: 'placement'
      categoryId: CategoryId
      outcomeIndex: number
      name: string
      description: string
      cost: number
      size: number
      origin: 'board' | 'card'
      label: string
      /** A Planning Approval token is being spent on this build. */
      freeToken: boolean
    }
  | { kind: 'card'; deck: 'chance' | 'community'; cardIndex: number }
  | { kind: 'planningHold' }
  | { kind: 'cityHall' }

export interface GameState {
  version: number
  seed: number
  createdAt: number
  updatedAt: number
  turn: number
  player: PlayerState
  tiles: Record<string, Tile>
  dice: [number, number] | null
  pending: Pending | null
  decks: DeckState
  transactions: Transaction[]
  log: LogEntry[]
  milestones: string[]
  stats: {
    income: number
    spending: number
    taxes: number
    treasury: number
  }
  settings: GameSettings
  lastSpaceId: number
}

export interface CitySummary {
  developments: number
  developedHexes: number
  remainingLand: number
  roads: number
  residential: number
  commercial: number
  industrial: number
  publicServices: number
  infrastructure: number
  nature: number
  population: number
  jobs: number
  highRise: number
  majorTransport: number
  parks: number
}

export type ToolMode = 'inspect' | 'road' | 'clear'

export interface Notice {
  id: string
  tone: 'info' | 'good' | 'bad'
  text: string
}

export interface Snapshot {
  tiles: Record<string, Tile>
  player: PlayerState
  transactions: Transaction[]
  log: LogEntry[]
  stats: GameState['stats']
  turn: number
  milestones: string[]
  decks: DeckState
  lastSpaceId: number
  pending: Pending | null
}
