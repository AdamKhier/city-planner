import { useEffect, useState } from 'react'
import { useGame } from './game/store'
import { MainMenu } from './components/MainMenu'
import { TopBar } from './components/TopBar'
import { GameBoard } from './components/GameBoard'
import { DicePanel } from './components/DicePanel'
import { MapPanel } from './components/MapPanel'
import { ManagementPanel } from './components/ManagementPanel'
import { PendingOverlay } from './components/PendingOverlay'
import { HistoryModal } from './components/HistoryModal'
import { SaveLoadModal } from './components/SaveLoadModal'
import { SettingsModal } from './components/SettingsModal'
import { RulesModal } from './components/RulesModal'
import { Toasts } from './components/Toasts'

type MobileTab = 'board' | 'map' | 'manage'

const MOBILE_TABS: Array<{ id: MobileTab; label: string }> = [
  { id: 'board', label: 'Board' },
  { id: 'map', label: 'City map' },
  { id: 'manage', label: 'Management' },
]

function GameScreen() {
  const pendingKind = useGame((state) => state.game?.pending?.kind ?? null)
  const [tab, setTab] = useState<MobileTab>('board')
  const [historyOpen, setHistoryOpen] = useState(false)
  const [savesOpen, setSavesOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [rulesOpen, setRulesOpen] = useState(false)

  useEffect(() => {
    if (pendingKind === 'placement') setTab('map')
  }, [pendingKind])

  return (
    <div className="min-h-full bg-paper">
      <TopBar
        onOpenHistory={() => setHistoryOpen(true)}
        onOpenSaves={() => setSavesOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenRules={() => setRulesOpen(true)}
      />

      <main className="mx-auto max-w-[1800px] px-3 pb-4 pt-3 lg:h-[calc(100vh-4rem)] lg:px-4">
        <div className="mb-3 flex gap-1 rounded-xl border border-stone-200 bg-white p-1 lg:hidden">
          {MOBILE_TABS.map((item) => (
            <button
              key={item.id}
              className={`flex-1 rounded-lg px-2 py-2 text-[11px] font-semibold uppercase tracking-[0.1em] transition-colors ${
                tab === item.id ? 'bg-civic text-white' : 'text-stone-500'
              }`}
              onClick={() => setTab(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="grid gap-3 lg:h-full lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)_minmax(288px,320px)] lg:gap-3 xl:grid-cols-[minmax(0,400px)_minmax(0,1fr)_minmax(320px,350px)] xl:gap-4 2xl:grid-cols-[minmax(0,500px)_minmax(0,1fr)_minmax(340px,400px)]">
          <div className={`${tab === 'board' ? 'block' : 'hidden'} min-h-0 min-w-0 lg:block lg:overflow-y-auto lg:pr-0.5`}>
            <div className="space-y-3">
              <GameBoard />
              <DicePanel />
            </div>
          </div>

          <div className={`${tab === 'map' ? 'block' : 'hidden'} min-h-0 min-w-0 lg:block`}>
            <MapPanel />
          </div>

          <div className={`${tab === 'manage' ? 'block' : 'hidden'} min-h-0 min-w-0 lg:block`}>
            <ManagementPanel onOpenHistory={() => setHistoryOpen(true)} />
          </div>
        </div>
      </main>

      <PendingOverlay />
      {historyOpen ? <HistoryModal onClose={() => setHistoryOpen(false)} /> : null}
      {savesOpen ? <SaveLoadModal onClose={() => setSavesOpen(false)} /> : null}
      {settingsOpen ? <SettingsModal onClose={() => setSettingsOpen(false)} /> : null}
      {rulesOpen ? <RulesModal onClose={() => setRulesOpen(false)} /> : null}
    </div>
  )
}

export default function App() {
  const screen = useGame((state) => state.screen)
  return (
    <>
      {screen === 'menu' ? <MainMenu /> : <GameScreen />}
      <Toasts />
    </>
  )
}
