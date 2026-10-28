import { Bird, Turtle, Squirrel, Leaf } from 'lucide-react'

import type { AvatarPresetId } from './profileTypes'

export interface AvatarPresetMeta {
  id: AvatarPresetId
  name: string
  subtitle: string
  bgColor: string
  borderColor: string
  textColor: string
  accentColor: string
  imageUrl?: string
}

/**
 * Friendly biodiversity SVG illustrations for icons not provided directly by Lucide
 */

export function FrogIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* Frog face outline */}
      <path d="M4 14c0 4.4 3.6 7 8 7s8-2.6 8-7c0-3-1.6-5.5-4-6.5V7a3 3 0 0 0-6 0v.5C7.6 8.5 6 11 4 14Z" />
      {/* Eyes */}
      <circle cx="8" cy="7" r="2.5" />
      <circle cx="16" cy="7" r="2.5" />
      <circle cx="8" cy="7" r="0.75" fill="currentColor" />
      <circle cx="16" cy="7" r="0.75" fill="currentColor" />
      {/* Smile */}
      <path d="M9 16c1.2 1 4.8 1 6 0" />
      {/* Nostrils */}
      <path d="M11 12.5h.01M13 12.5h.01" />
    </svg>
  )
}

export function ButterflyIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* Body */}
      <line x1="12" y1="6" x2="12" y2="19" />
      {/* Antennae */}
      <path d="M10 4c0-1.5 2-2 2-2s2 .5 2 2" />
      {/* Upper Wings */}
      <path d="M12 7c-3-5-9-3-9 2 0 3 4 5 9 3" />
      <path d="M12 7c3-5 9-3 9 2 0 3-4 5-9 3" />
      {/* Lower Wings */}
      <path d="M12 12c-4 0-7 2-7 5 0 2 3 3 7-1" />
      <path d="M12 12c4 0 7 2 7 5 0 2-3 3-7-1" />
    </svg>
  )
}

export function ElephantIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* Back and body */}
      <path d="M3 18v-5a6 6 0 0 1 6-6h5a6 6 0 0 1 6 6v3" />
      {/* Trunk curled */}
      <path d="M20 12v5a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2v-3" />
      {/* Head & Ear */}
      <path d="M14 7a4 4 0 0 1 4 4v3a4 4 0 0 1-4 4" />
      {/* Eye */}
      <circle cx="16.5" cy="10" r="0.8" fill="currentColor" />
      {/* Legs */}
      <path d="M7 18v3M11 18v3M17 18v3" />
    </svg>
  )
}

export function CleanUserSilhouetteIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      {/* Head */}
      <circle cx="12" cy="7.25" r="4.25" />
      {/* Torso & Shoulders */}
      <path d="M12 13.25c-4.42 0-8 2.8-8 6.25 0 .83.67 1.5 1.5 1.5h13c.83 0 1.5-.67 1.5-1.5 0-3.45-3.58-6.25-8-6.25Z" />
    </svg>
  )
}

export const AVATAR_PRESETS: Record<AvatarPresetId, AvatarPresetMeta> = {
  user: {
    id: 'user',
    name: 'Default Person',
    subtitle: 'Nature silhouette',
    bgColor: 'bg-[#0A261D]',
    borderColor: 'border-emerald-400/80',
    textColor: 'text-emerald-400',
    accentColor: '#34D399',
  },
  bird: {
    id: 'bird',
    name: 'Cute Bird',
    subtitle: 'Canopy singer',
    bgColor: 'bg-[#0A261D]',
    borderColor: 'border-emerald-400/80',
    textColor: 'text-emerald-400',
    accentColor: '#34D399',
    imageUrl: '/avatars/avatar_bird.jpg?v=2',
  },
  frog: {
    id: 'frog',
    name: 'Forest Frog',
    subtitle: 'Stream dweller',
    bgColor: 'bg-[#0A261D]',
    borderColor: 'border-emerald-400/80',
    textColor: 'text-emerald-400',
    accentColor: '#34D399',
    imageUrl: '/avatars/avatar_frog.jpg?v=2',
  },
  elephant: {
    id: 'elephant',
    name: 'Elephant',
    subtitle: 'Keystone giant',
    bgColor: 'bg-[#0A261D]',
    borderColor: 'border-emerald-400/80',
    textColor: 'text-emerald-400',
    accentColor: '#34D399',
    imageUrl: '/avatars/avatar_elephant.jpg?v=2',
  },
  turtle: {
    id: 'turtle',
    name: 'River Turtle',
    subtitle: 'River voyager',
    bgColor: 'bg-[#0A261D]',
    borderColor: 'border-emerald-400/80',
    textColor: 'text-emerald-400',
    accentColor: '#34D399',
    imageUrl: '/avatars/avatar_turtle.jpg?v=2',
  },
  squirrel: {
    id: 'squirrel',
    name: 'Squirrel',
    subtitle: 'Seed disperser',
    bgColor: 'bg-[#0A261D]',
    borderColor: 'border-emerald-400/80',
    textColor: 'text-emerald-400',
    accentColor: '#34D399',
    imageUrl: '/avatars/avatar_squirrel.jpg?v=2',
  },
  butterfly: {
    id: 'butterfly',
    name: 'Butterfly',
    subtitle: 'Meadow pollinator',
    bgColor: 'bg-[#0A261D]',
    borderColor: 'border-emerald-400/80',
    textColor: 'text-emerald-400',
    accentColor: '#34D399',
  },
  leaf: {
    id: 'leaf',
    name: 'Botanical Leaf',
    subtitle: 'Flora vitality',
    bgColor: 'bg-[#0A261D]',
    borderColor: 'border-emerald-400/80',
    textColor: 'text-emerald-400',
    accentColor: '#34D399',
  },
}

export function renderPresetIcon(presetId: AvatarPresetId, className = 'w-6 h-6') {
  switch (presetId) {
    case 'user':
      return <CleanUserSilhouetteIcon className={className} />
    case 'bird':
      return <Bird className={className} />
    case 'frog':
      return <FrogIcon className={className} />
    case 'butterfly':
      return <ButterflyIcon className={className} />
    case 'elephant':
      return <ElephantIcon className={className} />
    case 'turtle':
      return <Turtle className={className} />
    case 'squirrel':
      return <Squirrel className={className} />
    case 'leaf':
      return <Leaf className={className} />
    default:
      return <CleanUserSilhouetteIcon className={className} />
  }
}

