import type { BoardSpace } from './types'

export const START_BALANCE = 5000
export const PASS_START_BONUS = 2500
export const PLANNING_HOLD_FEE = 500
export const DEFAULT_ROAD_COST = 150

/**
 * The 40 board spaces, clockwise from START.
 * Index 0 is START, index 10 CITY HALL, index 20 FREE PARKING, index 30 PLANNING HOLD.
 */
export const BOARD: BoardSpace[] = [
  { id: 1, name: 'START', short: 'START', type: 'start' },
  { id: 2, name: 'Village', short: 'Village', type: 'development', category: 'residential', cost: 450 },
  { id: 3, name: 'Chance', short: 'Chance', type: 'chance' },
  { id: 4, name: 'Suburb', short: 'Suburb', type: 'development', category: 'residential', cost: 600 },
  { id: 5, name: 'Terrain', short: 'Terrain', type: 'development', category: 'terrain', cost: 100 },
  { id: 6, name: 'Tram Network', short: 'Tram', type: 'development', category: 'tram', cost: 400 },
  { id: 7, name: 'Shopping', short: 'Shopping', type: 'development', category: 'commercial', cost: 500 },
  { id: 8, name: 'Community Chest', short: 'Community', type: 'community' },
  { id: 9, name: 'Industry', short: 'Industry', type: 'development', category: 'industrial', cost: 550 },
  { id: 10, name: 'Development Tax', short: 'Dev. Tax', type: 'tax', tax: 350 },
  { id: 11, name: 'CITY HALL', short: 'City Hall', type: 'cityHall' },
  { id: 12, name: 'Residential Estate', short: 'Res. Estate', type: 'development', category: 'residential', cost: 700 },
  { id: 13, name: 'Power', short: 'Power', type: 'development', category: 'power', cost: 700 },
  { id: 14, name: 'Special Interest', short: 'Special', type: 'development', category: 'special', cost: 600 },
  { id: 15, name: 'Commercial District', short: 'Commercial', type: 'development', category: 'commercial', cost: 650 },
  { id: 16, name: 'Traffic Management', short: 'Traffic', type: 'development', category: 'infrastructure', cost: 400 },
  { id: 17, name: 'Chance', short: 'Chance', type: 'chance' },
  { id: 18, name: 'Civic Services', short: 'Civic', type: 'development', category: 'civic', cost: 500 },
  { id: 19, name: 'Suburb Expansion', short: 'Suburb Exp.', type: 'development', category: 'residential', cost: 550 },
  { id: 20, name: 'Infrastructure Levy', short: 'Infra. Levy', type: 'tax', tax: 500 },
  { id: 21, name: 'FREE PARKING', short: 'Free Parking', type: 'freeParking' },
  { id: 22, name: 'Farming', short: 'Farming', type: 'development', category: 'farming', cost: 350 },
  { id: 23, name: 'Terrain', short: 'Terrain', type: 'development', category: 'terrain', cost: 100 },
  { id: 24, name: 'Airport', short: 'Airport', type: 'development', category: 'airport', cost: 2000 },
  { id: 25, name: 'Shopping Centre', short: 'Shop. Centre', type: 'development', category: 'commercial', cost: 750 },
  { id: 26, name: 'Community Chest', short: 'Community', type: 'community' },
  { id: 27, name: 'Industrial Estate', short: 'Ind. Estate', type: 'development', category: 'industrial', cost: 650 },
  { id: 28, name: 'Water Infrastructure', short: 'Water', type: 'development', category: 'water', cost: 600 },
  { id: 29, name: 'Residential Towers', short: 'Res. Towers', type: 'development', category: 'residential', cost: 800 },
  { id: 30, name: 'Environmental Tax', short: 'Env. Tax', type: 'tax', tax: 600 },
  { id: 31, name: 'PLANNING HOLD', short: 'Planning Hold', type: 'planningHold' },
  { id: 32, name: 'Parkland', short: 'Parkland', type: 'development', category: 'park', cost: 300 },
  { id: 33, name: 'Community Facilities', short: 'Community Hall', type: 'development', category: 'civic', cost: 450 },
  { id: 34, name: 'Bike Paths', short: 'Bike Paths', type: 'development', category: 'cycling', cost: 250 },
  { id: 35, name: 'Chance', short: 'Chance', type: 'chance' },
  { id: 36, name: 'Seaport', short: 'Seaport', type: 'development', category: 'seaport', cost: 1800 },
  { id: 37, name: 'Special Interest', short: 'Special', type: 'development', category: 'special', cost: 600 },
  { id: 38, name: 'Luxury Tax', short: 'Luxury Tax', type: 'tax', tax: 750 },
  { id: 39, name: 'Motorway', short: 'Motorway', type: 'development', category: 'motorway', cost: 900 },
  { id: 40, name: 'Civic Infrastructure', short: 'Civic Infra.', type: 'development', category: 'infrastructure', cost: 600 },
]

export const SPACE_COUNT = BOARD.length

export function spaceAt(position: number): BoardSpace {
  return BOARD[((position % SPACE_COUNT) + SPACE_COUNT) % SPACE_COUNT]
}
