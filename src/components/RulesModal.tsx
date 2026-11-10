import { Icon, Modal } from './ui'

const SECTIONS = [
  {
    title: 'The board',
    body: 'Move clockwise around 40 spaces. Each development space offers a construction opportunity in its category. START pays $2,500 every time you pass it.',
  },
  {
    title: 'Dice and movement',
    body: 'Roll two six-sided dice to travel. The space you land on decides what happens next: an opportunity, a tax, a card, a corner space or a rest.',
  },
  {
    title: 'Development',
    body: 'On a development space, generate a six-sided outcome. Every category has six possible results. Pay the construction cost and choose where to place the development on the hexagonal map.',
  },
  {
    title: 'Placement and footprint',
    body: 'Small buildings occupy one hex; airports, seaports and parks can span many. Hover the map to preview the footprint, then confirm. Overlapping sites are blocked and nothing is charged until you confirm.',
  },
  {
    title: 'Money',
    body: 'You start with $5,000. Construction costs are deducted exactly once. Taxes are added to the city treasury, which can be collected at Free Parking or City Hall. You cannot build without sufficient funds.',
  },
  {
    title: 'Event cards',
    body: 'Chance and Community Chest each hold 18 cards. A card is shown before its effect applies. Some grant free or half-price developments, which enter placement mode directly.',
  },
  {
    title: 'Corner spaces',
    body: 'START pays passage. CITY HALL shows the city accounts and releases the treasury. FREE PARKING collects the treasury automatically. PLANNING HOLD costs you the next turn unless you pay $500 to continue.',
  },
  {
    title: 'Roads and tools',
    body: 'Use the road tool to lay connections between districts — each hex costs the configured amount. Undo and redo are available for map actions. Demolishing a development recovers 25% of its cost.',
  },
  {
    title: 'Milestones and saving',
    body: 'Optional milestones track landmarks such as your first district or 100 developed hexes. The game autosaves after every action, and you can keep three additional manual save slots.',
  },
]

export function RulesModal({ onClose }: { onClose: () => void }) {
  return (
    <Modal size="lg" onClose={onClose} label="Rules and instructions">
      <div className="card overflow-hidden">
        <div className="flex items-start justify-between border-b border-stone-200/80 px-5 py-4">
          <div>
            <h2 className="font-display text-xl text-ink">Rules and instructions</h2>
            <p className="mt-1 text-xs text-stone-500">A turn-based city-building board game. No forced ending — build until you are satisfied.</p>
          </div>
          <button className="btn-ghost px-2" onClick={onClose} aria-label="Close">
            <Icon name="close" />
          </button>
        </div>
        <div className="panel-scroll max-h-[60vh] px-5 py-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {SECTIONS.map((section, index) => (
              <section key={section.title} className="rounded-xl border border-stone-200/70 bg-stone-50/50 p-4">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-civic/10 text-[10px] font-bold text-civic">
                    {index + 1}
                  </span>
                  <h3 className="text-sm font-semibold text-ink">{section.title}</h3>
                </div>
                <p className="mt-2 text-[12px] leading-relaxed text-stone-600">{section.body}</p>
              </section>
            ))}
          </div>
          <div className="mt-4 rounded-xl border border-dashed border-stone-300 px-4 py-3 text-[11px] leading-relaxed text-stone-500">
            Tip: the board can be expanded for a larger view, and the city map supports zooming with the wheel and panning by dragging.
            Everything you build is permanent until you demolish it or undo the action.
          </div>
        </div>
        <div className="flex justify-end border-t border-stone-200/80 bg-stone-50/60 px-5 py-3">
          <button className="btn-primary btn-xs px-4" onClick={onClose}>
            Understood
          </button>
        </div>
      </div>
    </Modal>
  )
}
