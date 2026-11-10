import type { CategoryId } from './types'

export type CardEffect =
  | { type: 'money'; amount: number }
  | { type: 'freeBuild'; category: CategoryId }
  | { type: 'halfPrice'; category: CategoryId }
  | { type: 'skipDevelopment' }
  | { type: 'freeDevelopment' }

export interface Card {
  title: string
  text: string
  effect: CardEffect
}

export const CHANCE_CARDS: Card[] = [
  { title: 'Population Boom', text: 'New residents arrive and the city coffers swell with registration fees.', effect: { type: 'money', amount: 500 } },
  { title: 'Economic Recession', text: 'A slowdown bites. Emergency support for local employers is required.', effect: { type: 'money', amount: -500 } },
  { title: 'Tourism Campaign', text: 'A national campaign puts your city on the map. Build a tourist attraction for free.', effect: { type: 'freeBuild', category: 'special' } },
  { title: 'Infrastructure Grant', text: 'The regional authority releases funding for your capital programme.', effect: { type: 'money', amount: 750 } },
  { title: 'Construction Delays', text: 'Materials are late. You must miss your next development.', effect: { type: 'skipDevelopment' } },
  { title: 'Foreign Investment', text: 'An overseas investor backs your growth plan.', effect: { type: 'money', amount: 1000 } },
  { title: 'Natural Disaster', text: 'Storms damage roads and bridges. Repairs must be paid for.', effect: { type: 'money', amount: -500 } },
  { title: 'New Highway Funding', text: 'A transport grant lets you build a road connection for free.', effect: { type: 'freeBuild', category: 'infrastructure' } },
  { title: 'Housing Crisis', text: 'Demand outstrips supply. Build a residential development at half price.', effect: { type: 'halfPrice', category: 'residential' } },
  { title: 'Industrial Boom', text: 'Manufacturing is thriving. Build industrial development at half price.', effect: { type: 'halfPrice', category: 'industrial' } },
  { title: 'Population Decline', text: 'Residents leave for cheaper cities. Services must be wound down.', effect: { type: 'money', amount: -300 } },
  { title: 'New Railway Funding', text: 'A rail grant covers the cost of a railway connection.', effect: { type: 'freeBuild', category: 'infrastructure' } },
  { title: 'Environmental Protection', text: 'A green fund lets you create a park at no cost.', effect: { type: 'freeBuild', category: 'park' } },
  { title: 'Government Election', text: 'Civic pride brings a boost in local levies.', effect: { type: 'money', amount: 400 } },
  { title: 'Trade Agreement', text: 'A new trade deal brings duty income into the city.', effect: { type: 'money', amount: 600 } },
  { title: 'Power Shortage', text: 'The grid is strained. Emergency generation must be hired.', effect: { type: 'money', amount: -400 } },
  { title: 'Infrastructure Failure', text: 'A water main bursts beneath the high street.', effect: { type: 'money', amount: -500 } },
  { title: 'Major Development Grant', text: 'A national growth fund backs your largest project.', effect: { type: 'money', amount: 1500 } },
]

export const COMMUNITY_CARDS: Card[] = [
  { title: 'Property Tax Refund', text: 'An assessment error is corrected in the city’s favour.', effect: { type: 'money', amount: 300 } },
  { title: 'Community Fundraiser', text: 'Local residents raise money for civic projects.', effect: { type: 'money', amount: 200 } },
  { title: 'School Funding', text: 'An education grant covers half the cost of a new school.', effect: { type: 'halfPrice', category: 'civic' } },
  { title: 'Hospital Donation', text: 'A charitable trust supports your health services.', effect: { type: 'money', amount: 400 } },
  { title: 'Park Restoration', text: 'Volunteers restore a neglected green space for free.', effect: { type: 'freeBuild', category: 'park' } },
  { title: 'Road Maintenance', text: 'Winter damage must be repaired across the district.', effect: { type: 'money', amount: -200 } },
  { title: 'Local Business Grant', text: 'A small-business fund is awarded to your high street.', effect: { type: 'money', amount: 350 } },
  { title: 'Public Transport Subsidy', text: 'A transit subsidy lets you build a tram stop for free.', effect: { type: 'freeBuild', category: 'tram' } },
  { title: 'Community Festival', text: 'The summer festival brings visitors and revenue.', effect: { type: 'money', amount: 250 } },
  { title: 'Planning Approval', text: 'Fast-tracked approval grants an additional development for free.', effect: { type: 'freeDevelopment' } },
  { title: 'Water Infrastructure Grant', text: 'Funding arrives for the city water programme.', effect: { type: 'money', amount: 500 } },
  { title: 'Council Fine', text: 'A compliance failure results in a penalty.', effect: { type: 'money', amount: -250 } },
  { title: 'New Housing Initiative', text: 'A housing programme brings matching funds.', effect: { type: 'money', amount: 400 } },
  { title: 'University Partnership', text: 'A research partnership brings sponsorship income.', effect: { type: 'money', amount: 300 } },
  { title: 'Volunteer Programme', text: 'Volunteers help deliver a community facility at half price.', effect: { type: 'halfPrice', category: 'civic' } },
  { title: 'Land Sale', text: 'Surplus land is sold to a developer.', effect: { type: 'money', amount: 500 } },
  { title: 'Council Inspection', text: 'An inspection finds minor breaches requiring remedial work.', effect: { type: 'money', amount: -150 } },
  { title: 'Government Infrastructure Grant', text: 'A national infrastructure fund supports your programme.', effect: { type: 'money', amount: 750 } },
]

export const DECKS = {
  chance: CHANCE_CARDS,
  community: COMMUNITY_CARDS,
} as const

export function effectSummary(effect: CardEffect): string {
  switch (effect.type) {
    case 'money':
      return effect.amount >= 0 ? `Collect $${effect.amount.toLocaleString()}` : `Pay $${Math.abs(effect.amount).toLocaleString()}`
    case 'freeBuild':
      return 'Free development to place'
    case 'halfPrice':
      return 'Development at half price'
    case 'skipDevelopment':
      return 'Miss your next development'
    case 'freeDevelopment':
      return 'One free development'
  }
}
