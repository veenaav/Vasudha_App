import { Link } from 'react-router-dom'
import BrandLockup from '@/components/BrandLockup'
import { useProfile } from '@/context/ProfileContext'
import AvatarDisplay from '@/components/AvatarDisplay'

export default function TopBar() {
  const { profile, isGuest } = useProfile()

  // Extract logged-in user's first name, or 'Guest' for guest users
  const firstName = isGuest
    ? 'Guest'
    : (profile?.displayName?.trim() ? profile.displayName.trim().split(/\s+/)[0] : '') ||
      (profile?.fullName?.trim() ? profile.fullName.trim().split(/\s+/)[0] : '') ||
      'Profile'

  return (
    <header className="sticky top-0 z-20 border-b border-[#1C4D3C] bg-[#08221A]/95 backdrop-blur-md">
      <div className="flex w-full items-center justify-between px-3.5 py-2 sm:px-6 sm:py-2.5 gap-3">
        {/* Left-aligned Branding Group: Unified Compact Logo + B-LIFFE Lockup */}
        <Link
          to="/home"
          className="flex items-center text-left group min-w-0"
          title="B-Liffe - Bharat Local Informatics for Flora, Fauna, and Ecosystems"
        >
          <BrandLockup
            layout="horizontal"
            size="sm"
            subtitle="Bharat Local Informatics for Flora, Fauna, and Ecosystems"
            subtitleClassName="hidden md:block max-w-md"
          />
        </Link>

        {/* Right-aligned Profile Entry Point: Vertical stack of Avatar + First Name */}
        <div className="flex items-center shrink-0 pl-1">
          <Link
            to="/profile"
            className="group flex flex-col items-center justify-center gap-0.5 transition-transform active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A6F16A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#08221A] rounded-xl px-1.5 py-0.5 hover:bg-[#0D2D22]/60"
            title={`My Profile (${firstName})`}
            aria-label={`My Profile: ${firstName}`}
          >
            <AvatarDisplay
              avatarType={profile.avatarType}
              avatarPresetId={profile.avatarPresetId}
              avatarCustomUrl={profile.avatarCustomUrl}
              size="sm"
              className="transition-all duration-200 group-hover:scale-105 group-hover:border-[#A6F16A]"
            />
            <span className="text-[10px] sm:text-[11px] font-medium text-[#B2C8BA] group-hover:text-white transition-colors tracking-tight leading-tight max-w-[56px] sm:max-w-[72px] truncate text-center">
              {firstName}
            </span>
          </Link>
        </div>
      </div>
    </header>
  )
}
