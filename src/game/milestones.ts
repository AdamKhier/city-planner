import type { CitySummary, GameState } from './types'
import { computeCity } from './engine'

export interface Milestone {
  id: string
  name: string
  description: string
  target: number
  progress: (game: GameState, city: CitySummary) => number
  format?: (value: number) => string
}

export const MILESTONES: Milestone[] = [
  {
    id: 'first-development',
    name: 'Groundbreaking',
    description: 'Complete your first development.',
    target: 1,
    progress: (_g, city) => city.developments,
  },
  {
    id: 'ten-developments',
    name: 'Growing district',
    description: 'Complete ten developments.',
    target: 10,
    progress: (_g, city) => city.developments,
  },
  {
    id: 'hundred-hexes',
    name: 'Hundred acres',
    description: 'Develop 100 hexagons of land.',
    target: 100,
    progress: (_g, city) => city.developedHexes,
  },
  {
    id: 'residential-district',
    name: 'Neighbourhood plan',
    description: 'Build five residential developments.',
    target: 5,
    progress: (_g, city) => city.residential,
  },
  {
    id: 'industrial-estate',
    name: 'Industrial estate',
    description: 'Build four industrial developments.',
    target: 4,
    progress: (_g, city) => city.industrial,
  },
  {
    id: 'major-transport',
    name: 'Major transport connection',
    description: 'Complete an airport, seaport, motorway or transport interchange.',
    target: 1,
    progress: (_g, city) => city.majorTransport,
  },
  {
    id: 'parkland',
    name: 'Green city',
    description: 'Create four parks or natural features.',
    target: 4,
    progress: (_g, city) => city.nature,
  },
  {
    id: 'road-network',
    name: 'Connected city',
    description: 'Lay 25 hexes of road.',
    target: 25,
    progress: (_g, city) => city.roads,
  },
  {
    id: 'residents-100k',
    name: 'Hundred thousand residents',
    description: 'Reach a population of 100,000.',
    target: 100000,
    progress: (_g, city) => city.population,
    format: (value) => value.toLocaleString('en-US'),
  },
  {
    id: 'fully-developed',
    name: 'Full build-out',
    description: 'Develop every buildable hexagon on the map.',
    target: 714,
    progress: (_g, city) => city.developedHexes,
  },
]

export function evaluateMilestones(game: GameState): Milestone[] {
  const city = computeCity(game.tiles)
  return MILESTONES.filter((m) => !game.milestones.includes(m.id) && m.progress(game, city) >= m.target)
}
