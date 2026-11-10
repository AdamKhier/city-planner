import type { ReactNode } from 'react'

export type IconName =
  | 'menu'
  | 'close'
  | 'save'
  | 'folder'
  | 'book'
  | 'gear'
  | 'dice'
  | 'history'
  | 'undo'
  | 'redo'
  | 'plus'
  | 'minus'
  | 'fit'
  | 'cursor'
  | 'road'
  | 'trash'
  | 'check'
  | 'arrowRight'
  | 'play'
  | 'pin'
  | 'building'

const ICONS: Record<IconName, ReactNode> = {
  menu: (
    <>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </>
  ),
  close: <path d="M6 6l12 12M18 6L6 18" />,
  save: (
    <>
      <path d="M5 3.5h10.5L20 8v12.5H5z" />
      <path d="M8.5 3.5V9h7V3.5" />
      <path d="M8.5 20.5v-7h7v7" />
    </>
  ),
  folder: <path d="M3.5 7.5h6l2 2H20.5V19a1.5 1.5 0 01-1.5 1.5H5A1.5 1.5 0 013.5 19z" />,
  book: (
    <>
      <path d="M5 4.5A1.5 1.5 0 016.5 3H19v18H6.5A1.5 1.5 0 015 19.5z" />
      <path d="M5 16.5h14" />
    </>
  ),
  gear: (
    <>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 3.2v2.2M12 18.6v2.2M4.8 7.8l1.9 1.1M17.3 15.1l1.9 1.1M4.8 16.2l1.9-1.1M17.3 8.9l1.9-1.1" />
    </>
  ),
  dice: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="4" />
      <circle cx="8.5" cy="8.5" r="1.15" fill="currentColor" stroke="none" />
      <circle cx="15.5" cy="8.5" r="1.15" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.15" fill="currentColor" stroke="none" />
      <circle cx="8.5" cy="15.5" r="1.15" fill="currentColor" stroke="none" />
      <circle cx="15.5" cy="15.5" r="1.15" fill="currentColor" stroke="none" />
    </>
  ),
  history: (
    <>
      <path d="M3.6 12a8.4 8.4 0 108.4-8.4A8.4 8.4 0 004.8 6.6" />
      <path d="M3.5 4v4.6h4.6" />
      <path d="M12 7.6V12l3 1.8" />
    </>
  ),
  undo: (
    <>
      <path d="M8.5 7.5L4 12l4.5 4.5" />
      <path d="M4 12h9.5a5 5 0 010 10H10" />
    </>
  ),
  redo: (
    <>
      <path d="M15.5 7.5L20 12l-4.5 4.5" />
      <path d="M20 12h-9.5a5 5 0 000 10H14" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  fit: <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />,
  cursor: <path d="M5 3.5l6.2 17 2.4-6.8 6.9-2.3z" />,
  road: (
    <>
      <path d="M8 3.5L5 20.5M16 3.5l3 17" />
      <path d="M12 5v3M12 11v3M12 17v2.5" />
    </>
  ),
  trash: (
    <>
      <path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13" />
      <path d="M10.5 10.5v6M13.5 10.5v6" />
    </>
  ),
  check: <path d="M4.5 12.5l5 5 10-11" />,
  arrowRight: <path d="M4 12h15M13.5 6l6 6-6 6" />,
  play: <path d="M8 4.8v14.4L19.5 12z" />,
  pin: (
    <>
      <path d="M12 21s6.5-6.4 6.5-11a6.5 6.5 0 10-13 0C5.5 14.6 12 21 12 21z" />
      <circle cx="12" cy="10" r="2.4" />
    </>
  ),
  building: (
    <>
      <path d="M4 20.5V8l6-3v15.5M10 20.5V11l7-2.5v12" />
      <path d="M2.5 20.5h19M6.5 10.5h1.5M6.5 14h1.5M13 13h1.5M13 16.5h1.5" />
    </>
  ),
}

export function Icon({ name, className = 'h-4 w-4' }: { name: IconName; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {ICONS[name]}
    </svg>
  )
}

export function Modal({
  children,
  onClose,
  size = 'md',
  label,
  className = '',
}: {
  children: ReactNode
  onClose?: () => void
  size?: 'sm' | 'md' | 'lg' | 'xl'
  label?: string
  className?: string
}) {
  const widths = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }
  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center overflow-y-auto bg-ink/35 p-4 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label={label}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose?.()
      }}
    >
      <div className={`w-full ${widths[size]} animate-pop-in ${className}`}>{children}</div>
    </div>
  )
}

export function SectionHeading({
  title,
  hint,
  action,
}: {
  title: string
  hint?: string
  action?: ReactNode
}) {
  return (
    <div className="flex items-end justify-between gap-3">
      <div>
        <h3 className="font-display text-base text-ink">{title}</h3>
        {hint ? <p className="mt-0.5 text-xs text-stone-500">{hint}</p> : null}
      </div>
      {action}
    </div>
  )
}

export function StatTile({
  label,
  value,
  hint,
  tone = 'default',
}: {
  label: string
  value: string
  hint?: string
  tone?: 'default' | 'good' | 'bad' | 'accent'
}) {
  const tones = {
    default: 'text-ink',
    good: 'text-emerald-700',
    bad: 'text-[#a1472f]',
    accent: 'text-civic',
  }
  return (
    <div className="rounded-xl border border-stone-200/70 bg-stone-50/60 px-3 py-2.5">
      <div className="label">{label}</div>
      <div className={`num mt-1 text-[15px] font-semibold ${tones[tone]}`}>{value}</div>
      {hint ? <div className="mt-0.5 text-[11px] leading-tight text-stone-500">{hint}</div> : null}
    </div>
  )
}

export function ProgressBar({ value, max, color = '#2f5d62' }: { value: number; max: number; color?: string }) {
  const pct = Math.max(0, Math.min(100, (value / Math.max(1, max)) * 100))
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-stone-200/80">
      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
    </div>
  )
}
