import type { AvatarPresetId, AvatarType } from '@/lib/profileTypes'
import { AVATAR_PRESETS, renderPresetIcon } from '@/lib/avatarPresets'
import { cn } from '@/lib/utils'

export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl'

interface AvatarDisplayProps {
  avatarType?: AvatarType
  avatarPresetId?: AvatarPresetId
  avatarCustomUrl?: string | null
  size?: AvatarSize
  className?: string
  alt?: string
}

const sizeConfig: Record<
  AvatarSize,
  {
    container: string
    icon: string
  }
> = {
  sm: {
    container: 'h-8 w-8',
    icon: 'h-4.5 w-4.5',
  },
  md: {
    container: 'h-10 w-10 sm:h-11 sm:w-11',
    icon: 'h-6 w-6 sm:h-6.5 sm:w-6.5',
  },
  lg: {
    container: 'h-14 w-14',
    icon: 'h-8 w-8',
  },
  xl: {
    container: 'h-24 w-24 sm:h-28 sm:w-28',
    icon: 'h-14 w-14 sm:h-16 sm:w-16',
  },
}

export default function AvatarDisplay({
  avatarType = 'preset',
  avatarPresetId = 'user',
  avatarCustomUrl = null,
  size = 'md',
  className,
  alt = 'Profile Avatar',
}: AvatarDisplayProps) {
  const currentSize = sizeConfig[size]
  const preset = AVATAR_PRESETS[avatarPresetId] || AVATAR_PRESETS.user

  // 1. Custom uploaded user photo
  if (avatarType === 'upload' && avatarCustomUrl) {
    return (
      <div
        className={cn(
          'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-emerald-400/80 bg-[#0A261D] transition-all',
          currentSize.container,
          className
        )}
      >
        <img
          src={avatarCustomUrl}
          alt={alt}
          className="h-full w-full object-cover rounded-full"
        />
      </div>
    )
  }

  // 2. Preset artwork image
  if (preset.imageUrl) {
    return (
      <div
        className={cn(
          'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-emerald-400/80 bg-[#0A261D] transition-all',
          currentSize.container,
          className
        )}
      >
        <img
          src={preset.imageUrl}
          alt={alt || preset.name}
          className="h-full w-full object-cover rounded-full"
        />
      </div>
    )
  }

  // 3. Default state: clean head-and-shoulders person silhouette (or vector icon)
  return (
    <div
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-emerald-400/80 bg-[#0A261D] text-emerald-400 transition-all',
        currentSize.container,
        className
      )}
      aria-label={preset.name}
    >
      {renderPresetIcon(avatarPresetId, currentSize.icon)}
    </div>
  )
}

