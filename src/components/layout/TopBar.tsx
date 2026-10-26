import { Link, useLocation } from 'react-router-dom'
import { Home } from 'lucide-react'

export default function TopBar() {
  const location = useLocation()
  const isHomeActive = location.pathname === '/'

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-[#142217]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-lg items-center justify-between px-3.5 py-2.5 sm:px-6 sm:py-3 gap-2">
        {/* Left: Dedicated Home icon - ONLY persistent Home button in the application */}
        <Link
          to="/"
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#C5D1BD]/50 ${
            isHomeActive
              ? 'border-[#C5D1BD]/50 bg-[#263D2B] text-[#F5F0E4] shadow-sm'
              : 'border-white/15 bg-white/5 text-[#C5D1BD] hover:bg-white/15 hover:text-[#F5F0E4]'
          }`}
          aria-label="Home - Return to Dashboard"
          title="Return to B LIFFE Dashboard"
        >
          <Home className="h-5 w-5" strokeWidth={1.85} />
        </Link>

        {/* Center: Prominent B LIFFE Title and Full Subtitle */}
        <Link
          to="/"
          className="flex min-w-0 flex-1 flex-col items-center text-center group px-1"
          title="B LIFFE - Bharat Local Informatics for Flora, Fauna, and Ecosystems"
        >
          <span className="font-heading text-lg sm:text-xl font-normal tracking-[0.22em] uppercase text-[#F5F0E4] transition-colors group-hover:text-white leading-tight">
            B LIFFE
          </span>
          <p className="text-[9px] sm:text-[10px] leading-tight sm:leading-snug tracking-wide text-[#C5D1BD]/90 font-medium text-center line-clamp-2 max-w-[240px] sm:max-w-md">
            Bharat Local Informatics for Flora, Fauna, and Ecosystems
          </p>
        </Link>

        {/* Right: Balance spacer for layout equilibrium (no profile control currently implemented) */}
        <div className="h-10 w-10 shrink-0" aria-hidden="true" />
      </div>
    </header>
  )
}
