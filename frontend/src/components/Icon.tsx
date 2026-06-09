import React from 'react'

type IconProps = { size?: number; className?: string; color?: string }

// ── UI Icons ──────────────────────────────────────────────────────────────

export function SearchIcon({ size = 18, color = 'currentColor' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round">
      <circle cx="9" cy="9" r="6" />
      <line x1="14.2" y1="14.2" x2="18" y2="18" />
    </svg>
  )
}

export function LocationPinIcon({ size = 14, color = 'currentColor' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 20" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 1C4.686 1 2 3.686 2 7c0 4.5 6 12 6 12s6-7.5 6-12c0-3.314-2.686-6-6-6z" />
      <circle cx="8" cy="7" r="2" />
    </svg>
  )
}

export function ArrowLeftIcon({ size = 16, color = 'currentColor' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 4L6 10l6 6" />
    </svg>
  )
}

export function CloseIcon({ size = 12, color = 'currentColor' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round">
      <line x1="1" y1="1" x2="11" y2="11" />
      <line x1="11" y1="1" x2="1" y2="11" />
    </svg>
  )
}

export function BoltIcon({ size = 15, color = 'currentColor' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 20" fill={color}>
      <path d="M9 1L1 11h7l-1 8 8-10H8l1-8z" />
    </svg>
  )
}

export function ListIcon({ size = 40, color = 'currentColor' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.4" strokeLinecap="round">
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <circle cx="3" cy="6" r="1.2" fill={color} stroke="none" />
      <circle cx="3" cy="12" r="1.2" fill={color} stroke="none" />
      <circle cx="3" cy="18" r="1.2" fill={color} stroke="none" />
    </svg>
  )
}

export function MapPinIcon({ size = 13, color = 'currentColor' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 18" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 1C4.239 1 2 3.239 2 6c0 3.75 5 10 5 10s5-6.25 5-10c0-2.761-2.239-5-5-5z" />
      <circle cx="7" cy="6" r="1.8" />
    </svg>
  )
}

export function StoreIcon({ size = 16, color = 'currentColor' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
      <path d="M9 22V12h6v10" />
    </svg>
  )
}

// ── Category Icons ────────────────────────────────────────────────────────

export function MilkIcon({ size = 28 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 2h8M7 4c-1 2-2 3-2 5v14a2 2 0 002 2h10a2 2 0 002-2V9c0-2-1-3-2-5H7z" />
      <path d="M9 16a3 3 0 006 0" />
    </svg>
  )
}

export function EggsIcon({ size = 28 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <ellipse cx="12" cy="13" rx="7" ry="9" />
      <path d="M6 12c1-4 10-4 12 0" strokeWidth="1.2" />
    </svg>
  )
}

export function BreadIcon({ size = 28 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 26 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 10c0-4.5 2-8 10-8s10 3.5 10 8v7H3v-7z" />
      <line x1="3" y1="14" x2="23" y2="14" />
    </svg>
  )
}

export function ButterIcon({ size = 28 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="24" height="11" rx="2" />
      <line x1="2" y1="10" x2="26" y2="10" />
    </svg>
  )
}

export function CheeseIcon({ size = 28 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 18L14 3l12 15H2z" />
      <circle cx="10" cy="14" r="1.8" />
      <circle cx="17" cy="11" r="1.4" />
    </svg>
  )
}

export function YogurtIcon({ size = 28 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 22 26" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 8h14l-2 14H6L4 8z" />
      <path d="M3 5c0-1.5 3.5-3 8-3s8 1.5 8 3v3H3V5z" />
      <path d="M8 14c1 1 5 1 6 0" />
    </svg>
  )
}

export function JuiceIcon({ size = 28 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 26" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 8h12l-2 14H6L4 8z" />
      <path d="M3 8c0-2 3-3 7-3s7 1 7 3" />
      <line x1="10" y1="2" x2="10" y2="5" />
      <path d="M8 14h4" />
    </svg>
  )
}

export function WaterIcon({ size = 28 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 26" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 2C10 2 2 10 2 16a8 8 0 0016 0C18 10 10 2 10 2z" />
      <path d="M6 17c0 2 1.5 3.5 4 4" strokeWidth="1.2" />
    </svg>
  )
}

export function CerealIcon({ size = 28 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 26 22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 10c0-4 4.5-8 10-8s10 4 10 8v9H3v-9z" />
      <path d="M3 14h20" />
    </svg>
  )
}

export function CoffeeIcon({ size = 28 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 26" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 10h12l-2 12H6L4 10z" />
      <path d="M16 12h2a3 3 0 010 6h-2" />
      <path d="M8 6c0-2 2-2 2-4M13 6c0-2 2-2 2-4" strokeWidth="1.2" />
    </svg>
  )
}

export function ChickenIcon({ size = 28 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 20h10M12 20V8" />
      <ellipse cx="12" cy="7" rx="7" ry="5" />
    </svg>
  )
}

export function BeefIcon({ size = 28 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 26 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 10c0-5 4-8 10-8s10 3 10 8-4 8-10 8S3 15 3 10z" />
      <path d="M9 8c1 2 7 2 8 0" strokeWidth="1.2" />
      <path d="M10 12c1 1 5 1 6 0" strokeWidth="1.2" />
    </svg>
  )
}

export function PastaIcon({ size = 28 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M12 3v18M4 7h16M4 17h16" />
      <path d="M7 10c0 3 10 3 10 0M7 14c0 3 10 3 10 0" strokeWidth="1.1" />
    </svg>
  )
}

export function RiceIcon({ size = 28 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 14h20l-2 4H4l-2-4z" />
      <path d="M5 14c0-5 2-8 7-10 5 2 7 5 7 10" />
    </svg>
  )
}

export function CreamIcon({ size = 28 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 22 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8h16l-2 13H5L3 8z" />
      <path d="M3 8c0-3 3.5-6 8-6s8 3 8 6" />
      <path d="M19 10h1a2 2 0 010 4h-1" />
    </svg>
  )
}

export function GroceryIcon({ size = 28 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 01-8 0" />
    </svg>
  )
}

export function CategoryIcon({ category, size = 28 }: { category: string; size?: number }) {
  const props = { size }
  switch (category) {
    case 'milk':    return <MilkIcon {...props} />
    case 'eggs':    return <EggsIcon {...props} />
    case 'bread':   return <BreadIcon {...props} />
    case 'butter':  return <ButterIcon {...props} />
    case 'cheese':  return <CheeseIcon {...props} />
    case 'yogurt':  return <YogurtIcon {...props} />
    case 'juice':   return <JuiceIcon {...props} />
    case 'water':   return <WaterIcon {...props} />
    case 'cereal':  return <CerealIcon {...props} />
    case 'coffee':  return <CoffeeIcon {...props} />
    case 'chicken': return <ChickenIcon {...props} />
    case 'beef':    return <BeefIcon {...props} />
    case 'pasta':   return <PastaIcon {...props} />
    case 'rice':    return <RiceIcon {...props} />
    case 'cream':   return <CreamIcon {...props} />
    default:        return <GroceryIcon {...props} />
  }
}

// Legacy exports
export function BackIcon({ className = '', size = 18 }: { className?: string; size?: number }) {
  return <ArrowLeftIcon size={size} />
}
export function CheckIcon({ className = '', size = 16 }: { className?: string; size?: number }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 10l4 4 8-8" />
    </svg>
  )
}

export default function Icon() { return null }
