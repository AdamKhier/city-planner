import { useEffect } from 'react'
import { useGame } from '../game/store'

export function Toasts() {
  const notices = useGame((state) => state.notices)
  const dismiss = useGame((state) => state.dismissNotice)

  useEffect(() => {
    if (notices.length === 0) return
    const timers = notices.map((notice) => window.setTimeout(() => dismiss(notice.id), 4600))
    return () => timers.forEach((timer) => window.clearTimeout(timer))
  }, [notices, dismiss])

  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-50 flex w-[320px] flex-col gap-2">
      {notices.map((notice) => (
        <div
          key={notice.id}
          className={`pointer-events-auto animate-slide-up rounded-xl border px-3.5 py-2.5 text-[12.5px] shadow-lg ${
            notice.tone === 'good'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
              : notice.tone === 'bad'
                ? 'border-[#e2c3b8] bg-[#fbeee9] text-[#7c3620]'
                : 'border-stone-200 bg-white text-stone-700'
          }`}
          role="status"
        >
          <div className="flex items-start gap-2">
            <span className="mt-[3px] h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-60" />
            <span className="leading-snug">{notice.text}</span>
            <button className="ml-auto text-current/50 hover:text-current" onClick={() => dismiss(notice.id)} aria-label="Dismiss">
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
