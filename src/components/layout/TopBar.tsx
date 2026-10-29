import { Link } from 'react-router-dom'
import BrandName from '@/components/BrandName'
import { useProfile } from '@/context/ProfileContext'
import AvatarDisplay from '@/components/profile/AvatarDisplay'

export default function TopBar() {
  const { profile } = useProfile()

  return (
    <header className="sticky top-0 z-20 border-b border-[#1C4D3C] bg-[#08221A]/95 backdrop-blur-md">
      <div className="flex w-full items-center justify-between px-3.5 py-2.5 sm:px-6 sm:py-3 gap-3">
        {/* Left-aligned Branding Group: Logo Icon + Wordmark & Subtitle */}
        <Link
          to="/home"
          className="flex items-center text-left group gap-2.5 sm:gap-3.5 min-w-0"
          title="B-Liffe - Bharat Local Informatics for Flora, Fauna, and Ecosystems"
        >
          {/* Logo Icon */}
          <img
            src="/splash-logo.png"
            alt="B-Liffe Logo"
            className="h-10 w-10 sm:h-12 sm:w-12 object-contain rounded-xl shrink-0 border border-[#1C4D3C] bg-[#0D2D22] p-0.5"
          />

          {/* Wordmark and Subtitle in compact vertical arrangement */}
          <div className="flex flex-col justify-center items-start text-left min-w-0">
            {/* Standardized B-Liffe Wordmark */}
            <BrandName className="text-xl sm:text-2xl leading-none" />

            {/* Subtitle - hidden on mobile screens to prevent overlap, visible on md+ */}
            <p className="hidden md:block text-xs leading-tight tracking-normal text-[#B2C8BA] font-normal mt-1 max-w-md truncate">
              Bharat Local Informatics for Flora, Fauna, and Ecosystems
            </p>
          </div>
        </Link>

        {/* Right-aligned Profile Entry Point */}
        <div className="flex items-center shrink-0 pl-2">
          <Link
            to="/profile"
            className="group relative flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full p-0.5 transition-transform active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#08221A]"
            title="My Profile"
            aria-label="My Profile"
          >
            <AvatarDisplay
              avatarType={profile.avatarType}
              avatarPresetId={profile.avatarPresetId}
              avatarCustomUrl={profile.avatarCustomUrl}
              size="md"
              className="transition-all duration-200 group-hover:scale-105 group-hover:border-emerald-300"
            />
          </Link>
        </div>
      </div>
    </header>
  )
}

