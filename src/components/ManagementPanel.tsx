import { useMemo, useState } from 'react'
import { useGame } from '../game/store'
import { computeCity, formatMoney } from '../game/engine'
import { CATEGORIES } from '../game/content'
import { MILESTONES } from '../game/milestones'
import { Icon, ProgressBar, SectionHeading, StatTile } from './ui'

type Tab = 'finance' | 'city' | 'log'

const TABS: Array<{ id: Tab; label: string }> = [
  { id: 'finance', label: 'Finance' },
  { id: 'city', label: 'City' },
  { id: 'log', label: 'Activity' },
]

const GROUP_COLORS: Array<{ label: string; color: string; count: (city: ReturnType<typeof computeCity>) => number }> = [
  { label: 'Residential', color: CATEGORIES.residential.color, count: (city) => city.residential },
  { label: 'Commercial', color: CATEGORIES.commercial.color, count: (city) => city.commercial },
  { label: 'Industrial', color: CATEGORIES.industrial.color, count: (city) => city.industrial },
  { label: 'Civic & special', color: CATEGORIES.civic.color, count: (city) => city.publicServices },
  { label: 'Infrastructure', color: CATEGORIES.infrastructure.color, count: (city) => city.infrastructure },
  { label: 'Nature & parks', color: CATEGORIES.park.color, count: (city) => city.nature },
]

export function ManagementPanel({ onOpenHistory }: { onOpenHistory: () => void }) {
  const game = useGame((state) => state.game)
  const [tab, setTab] = useState<Tab>('finance')
  const city = useMemo(() => computeCity(game?.tiles ?? {}), [game?.tiles])
  if (!game) return null

  const maxGroup = Math.max(1, ...GROUP_COLORS.map((group) => group.count(city)))

  return (
    <div className="card flex min-h-[440px] flex-col overflow-hidden lg:h-full">
      <div className="flex shrink-0 items-center gap-1 border-b border-stone-200/80 px-2">
        {TABS.map((item) => (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            className={`tab-btn ${tab === item.id ? 'tab-btn-active' : ''}`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="panel-scroll flex-1 px-3.5 py-3.5">
        {tab === 'finance' ? (
          <div className="space-y-3">
            <div className="rounded-xl border border-civic/15 bg-gradient-to-br from-civic/[0.07] to-transparent p-4">
              <div className="flex items-center justify-between">
                <span className="label">Available balance</span>
                <span className="chip num">Turn {game.turn}</span>
              </div>
              <div className="num mt-1.5 font-display text-[34px] leading-none text-ink">{formatMoney(game.player.balance)}</div>
              <div className="mt-2 flex items-center gap-3 text-[11px] text-stone-500">
                <span className="inline-flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" /> In {formatMoney(game.stats.income)}
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#a1472f]" /> Out {formatMoney(game.stats.spending)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <StatTile label="City treasury" value={formatMoney(game.stats.treasury)} hint="Collect at City Hall or Free Parking" />
              <StatTile label="Taxes paid" value={formatMoney(game.stats.taxes)} hint="Paid into the treasury" />
              <StatTile label="Construction" value={formatMoney(city.developments > 0 ? game.stats.spending : 0)} hint="Total capital spend" />
              <StatTile label="Free developments" value={String(game.player.freeDevelopmentTokens)} hint="Planning approval tokens" />
            </div>

            <div className="rounded-xl border border-stone-200/70 p-3">
              <SectionHeading
                title="Development activity"
                hint="Live totals from the city map"
              />
              <div className="mt-2.5 grid grid-cols-2 gap-2">
                <StatTile label="Developments" value={String(city.developments)} />
                <StatTile label="Hexes built" value={`${city.developedHexes} / 714`} />
                <StatTile label="Land remaining" value={String(city.remainingLand)} />
                <StatTile label="Road sections" value={String(city.roads)} />
              </div>
            </div>

            <div className="rounded-xl border border-stone-200/70 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-base">Recent transactions</h3>
                  <p className="text-[11px] text-stone-500">Newest first</p>
                </div>
                <button className="text-[11px] font-semibold text-civic hover:underline" onClick={onOpenHistory}>
                  View all
                </button>
              </div>
              <div className="mt-2 divide-y divide-stone-100">
                {game.transactions.slice(0, 6).map((transaction) => (
                  <div key={transaction.id} className="flex items-start gap-2 py-2">
                    <span
                      className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                        transaction.amount >= 0 ? 'bg-emerald-600' : 'bg-[#b4633f]'
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[12px] font-medium text-stone-700">{transaction.label}</div>
                      <div className="text-[10px] uppercase tracking-wide text-stone-400">Turn {transaction.turn}</div>
                    </div>
                    <div className={`num text-[12px] font-semibold ${transaction.amount >= 0 ? 'text-emerald-700' : 'text-[#a1472f]'}`}>
                      {transaction.amount >= 0 ? '+' : ''}
                      {formatMoney(transaction.amount)}
                    </div>
                  </div>
                ))}
              </div>
              <button className="btn-ghost btn-xs mt-1 w-full" onClick={onOpenHistory}>
                <Icon name="history" className="h-3.5 w-3.5" />
                Full transaction history
              </button>
            </div>
          </div>
        ) : null}

        {tab === 'city' ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl border border-stone-200/70 bg-stone-50/60 p-3">
                <div className="label">Population</div>
                <div className="num mt-1 font-display text-[26px] leading-none">{city.population.toLocaleString('en-US')}</div>
                <div className="mt-1 text-[11px] text-stone-500">Residents across the city</div>
              </div>
              <div className="rounded-xl border border-stone-200/70 bg-stone-50/60 p-3">
                <div className="label">Jobs</div>
                <div className="num mt-1 font-display text-[26px] leading-none">{city.jobs.toLocaleString('en-US')}</div>
                <div className="mt-1 text-[11px] text-stone-500">Commercial, industrial &amp; civic</div>
              </div>
            </div>

            <div className="rounded-xl border border-stone-200/70 p-3">
              <SectionHeading title="City composition" hint={`${city.developments} developments · ${city.developedHexes} hexes in use`} />
              <div className="mt-3 space-y-2.5">
                {GROUP_COLORS.map((group) => {
                  const count = group.count(city)
                  return (
                    <div key={group.label}>
                      <div className="mb-1 flex items-center justify-between text-[11px]">
                        <span className="flex items-center gap-1.5 text-stone-600">
                          <span className="h-2 w-2 rounded-sm" style={{ backgroundColor: group.color }} />
                          {group.label}
                        </span>
                        <span className="num font-semibold text-stone-700">{count}</span>
                      </div>
                      <ProgressBar value={count} max={maxGroup} color={group.color} />
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="rounded-xl border border-stone-200/70 p-3">
              <SectionHeading title="Milestones" hint={`${game.milestones.length} of ${MILESTONES.length} reached`} />
              <div className="mt-2 space-y-2.5">
                {MILESTONES.map((milestone) => {
                  const achieved = game.milestones.includes(milestone.id)
                  const value = milestone.progress(game, city)
                  const target = milestone.target
                  const formatted = milestone.format ? milestone.format(Math.min(value, target)) : Math.min(value, target).toLocaleString('en-US')
                  return (
                    <div key={milestone.id} className="rounded-lg border border-stone-100 bg-stone-50/50 px-2.5 py-2">
                      <div className="flex items-start gap-2">
                        <span
                          className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] ${
                            achieved ? 'bg-civic text-white' : 'bg-stone-200 text-stone-500'
                          }`}
                        >
                          {achieved ? '✓' : '·'}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-baseline justify-between gap-2">
                            <span className={`text-[12px] font-medium ${achieved ? 'text-civic' : 'text-stone-700'}`}>{milestone.name}</span>
                            <span className="num shrink-0 text-[10px] text-stone-400">
                              {formatted}/{milestone.format ? milestone.format(target) : target.toLocaleString('en-US')}
                            </span>
                          </div>
                          <div className="mt-0.5 text-[10.5px] leading-snug text-stone-500">{milestone.description}</div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        ) : null}

        {tab === 'log' ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1 pb-1">
              <SectionHeading title="Activity log" hint="What happened on each turn" />
            </div>
            {game.log.map((entry) => (
              <div
                key={entry.id}
                className={`rounded-lg border px-2.5 py-2 text-[11.5px] leading-snug ${
                  entry.tone === 'good'
                    ? 'border-emerald-100 bg-emerald-50/70 text-emerald-900'
                    : entry.tone === 'bad'
                      ? 'border-[#eed6cd] bg-[#fdf1ec] text-[#7c3620]'
                      : 'border-stone-200/70 bg-white text-stone-600'
                }`}
              >
                <div className="mb-0.5 flex items-center justify-between text-[9.5px] uppercase tracking-[0.12em] opacity-70">
                  <span>Turn {entry.turn}</span>
                  <span>{new Date(entry.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                {entry.text}
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <div className="shrink-0 border-t border-stone-200/80 bg-stone-50/60 px-3.5 py-2 text-[10.5px] text-stone-500">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-civic" />
          Autosaved · {city.remainingLand} hexes still open
        </span>
      </div>
    </div>
  )
}
