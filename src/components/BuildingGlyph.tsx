import type { CategoryId } from '../game/types'

/**
 * Small schematic icons drawn at a tile centre. Coordinates are relative to
 * (0,0) so the glyph can be translated and scaled by the caller.
 */
export function BuildingGlyph({ category, size = 1 }: { category: CategoryId; size?: number }) {
  const stroke = 'rgba(32,40,38,0.55)'
  const fill = 'rgba(255,255,255,0.9)'

  switch (category) {
    case 'residential':
      return (
        <g stroke={stroke} strokeWidth={0.9} fill={fill} strokeLinejoin="round">
          <path d="M-9 3v-5.5L-5.5 -7 2 -2.5V3z" />
          <path d="M2 3v-4l4-3 4 3v7z" fill="rgba(255,255,255,0.75)" />
          <path d="M-5.5 3v-2.6h2.4V3" fill="none" />
        </g>
      )
    case 'commercial':
      return (
        <g stroke={stroke} strokeWidth={0.9} fill={fill}>
          <rect x="-8" y="-6" width="7" height="9" rx="0.8" />
          <rect x="0" y="-9" width="8" height="12" rx="0.8" />
          <path d="M-6 -3.4h3M-6 -1h3M2 -6.4h4M2 -3.6h4M2 -0.8h4" stroke="rgba(60,90,110,0.65)" />
        </g>
      )
    case 'industrial':
      return (
        <g stroke={stroke} strokeWidth={0.9} fill={fill}>
          <path d="M-8 3v-5l4 2.2V-6l4 2.2V3z" />
          <rect x="2" y="-8" width="3" height="8" />
          <path d="M5 -6.5h4" stroke="rgba(120,110,100,0.8)" strokeWidth={1.4} strokeLinecap="round" />
        </g>
      )
    case 'civic':
      return (
        <g stroke={stroke} strokeWidth={0.9} fill={fill}>
          <path d="M-9 -2.2L0 -7l9 4.8z" />
          <rect x="-7.5" y="-2" width="15" height="5.4" />
          <path d="M-5.5 0.4v3M-2 0.4v3M2 0.4v3M5.5 0.4v3" stroke="rgba(90,80,115,0.7)" />
        </g>
      )
    case 'special':
      return (
        <g stroke={stroke} strokeWidth={0.9} fill={fill}>
          <path d="M-8 3v-4.4a8 8 0 0116 0V3z" />
          <path d="M-1.5 3V-8.6M1.5 3V-8.6" stroke="rgba(120,95,40,0.6)" />
        </g>
      )
    case 'infrastructure':
      return (
        <g stroke="rgba(255,255,255,0.95)" strokeWidth={1.5} fill="none" strokeLinecap="round">
          <path d="M-6 4L-1 -8M6 4L1 -8" />
          <path d="M0 -1.5v2" strokeDasharray="1.5 2" />
        </g>
      )
    case 'terrain':
    case 'park':
      return (
        <g stroke={stroke} strokeWidth={0.9} fill={fill}>
          <path d="M0 -8l5 6.5h-10z" />
          <path d="M0 -3l5.5 7h-11z" fill="rgba(255,255,255,0.82)" />
          <path d="M0 3.5v3" strokeWidth={1.6} strokeLinecap="round" />
        </g>
      )
    case 'farming':
      return (
        <g stroke={stroke} strokeWidth={0.9} fill={fill}>
          <rect x="-8" y="-5" width="8" height="6" rx="0.6" />
          <path d="M-8 -6.6L-4 -9.4l4 2.8" />
          <path d="M1 1.5h7M1 -0.6h7M1 -2.7h7" stroke="rgba(120,110,70,0.75)" />
        </g>
      )
    case 'power':
      return (
        <g stroke={stroke} strokeWidth={0.9} fill={fill}>
          <path d="M1 -9L-4.5 1h4l-1 8L5 -2H1z" />
        </g>
      )
    case 'water':
      return (
        <g stroke={stroke} strokeWidth={0.9} fill={fill}>
          <path d="M0 -8.5C3.5 -4 7 -1 7 2.6A7 7 0 01-7 2.6C-7 -1 -3.5 -4 0 -8.5z" />
          <path d="M-3.5 3.4c1.6-1.4 3.4-1.4 5 0" fill="none" stroke="rgba(60,110,140,0.7)" />
        </g>
      )
    case 'airport':
      return (
        <g stroke={stroke} strokeWidth={0.8} fill={fill}>
          <path d="M-9 -3.6h18v7.2h-18z" />
          <path d="M-1 3.6v2.4M-1 1.4l7-3.4M-1 1.4l-7-3.4" stroke="rgba(60,80,95,0.75)" strokeWidth={1.1} />
        </g>
      )
    case 'seaport':
      return (
        <g stroke={stroke} strokeWidth={0.9} fill={fill}>
          <rect x="-8" y="-6" width="6" height="4" />
          <rect x="-1" y="-6" width="6" height="4" />
          <rect x="-8" y="-1" width="6" height="4" />
          <rect x="-1" y="-1" width="6" height="4" />
          <path d="M3 3.6c2.8 0 5-1.6 5-4" stroke="rgba(50,100,125,0.75)" fill="none" />
        </g>
      )
    case 'motorway':
      return (
        <g stroke="rgba(255,255,255,0.95)" strokeWidth={1.6} fill="none" strokeLinecap="round">
          <path d="M-8 5L-2 -8M8 5L2 -8" />
          <path d="M0 -2v3M0 3v2" strokeDasharray="1.6 2" />
        </g>
      )
    case 'cycling':
      return (
        <g stroke={stroke} strokeWidth={1} fill="none">
          <circle cx="-4.6" cy="3" r="3.1" />
          <circle cx="4.6" cy="3" r="3.1" />
          <path d="M-4.6 3l2.4-5h4M-2.2 -2l3.4 5M-2.2 -2l-3 5M2.8 -2l1.8 5" />
        </g>
      )
    case 'tram':
      return (
        <g stroke={stroke} strokeWidth={0.9} fill={fill}>
          <rect x="-5.5" y="-8" width="11" height="11" rx="1.6" />
          <path d="M-3.5 -5h7v3.4h-7z" fill="rgba(70,120,115,0.55)" />
          <path d="M-4 3l-1.6 3.4M4 3l1.6 3.4M-8 6.4h16" stroke="rgba(55,80,80,0.6)" />
        </g>
      )
    default:
      return <circle r={6 * size} fill={fill} stroke={stroke} />
  }
}
