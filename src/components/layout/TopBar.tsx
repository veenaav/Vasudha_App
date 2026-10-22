import { Link } from 'react-router-dom'
import { Menu } from 'lucide-react'

interface TopBarProps {
  onOpenDrawer: () => void
}

export default function TopBar({ onOpenDrawer }: TopBarProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-[#142217]/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3 sm:px-6">
        {/* Minimalist Hamburger Menu Button */}
        <button
          type="button"
          onClick={onOpenDrawer}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-[#F5F0E4] hover:bg-white/15 hover:border-white/25 transition-all active:scale-95 focus:outline-none"
          aria-label="Open menu"
        >
          <Menu className="h-4.5 w-4.5 text-[#C5D1BD]" />
        </button>

        {/* Centered Editorial Brand Identity */}
        <Link to="/" className="flex flex-col items-center text-center group">
          <div className="flex items-center gap-1.5">
            <span className="font-heading text-lg sm:text-xl font-normal tracking-[0.22em] uppercase text-[#F5F0E4] transition-colors group-hover:text-white">
              Shrishti
            </span>
          </div>
          <p className="text-[9px] sm:text-[10px] tracking-[0.25em] uppercase text-[#C5D1BD]/85 font-medium -mt-0.5">
            Biodiversity Field Platform
          </p>
        </Link>

        {/* Layout balance spacer (replaces duplicate quick-action button) */}
        <div className="h-10 w-10" aria-hidden="true" />
      </div>
    </header>
  )
}
