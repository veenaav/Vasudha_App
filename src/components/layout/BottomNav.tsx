import { NavLink } from 'react-router-dom'
import { PlusCircle, Leaf, Menu } from 'lucide-react'

interface BottomNavProps {
  onOpenMenu: () => void
  isMenuOpen?: boolean
}

export default function BottomNav({ onOpenMenu, isMenuOpen }: BottomNavProps) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 flex h-16 items-center justify-around border-t border-white/10 bg-[#142217]/95 backdrop-blur-lg px-2 sm:px-6 shadow-2xl pb-[env(safe-area-inset-bottom)]"
      aria-label="Bottom Navigation"
    >
      <div className="mx-auto flex w-full max-w-lg items-center justify-between">
        {/* Item 1: New Observation */}
        <NavLink
          to="/new-observation"
          className={({ isActive }) =>
            `flex flex-1 flex-col items-center justify-center min-h-[48px] py-1 text-[11px] tracking-wider uppercase transition-all active:scale-95 ${
              isActive
                ? 'text-[#F5F0E4] font-semibold'
                : 'text-[#C5D1BD]/75 hover:text-[#F5F0E4]'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full mb-0.5 transition-colors ${
                  isActive ? 'bg-[#263D2B] text-[#F5F0E4] border border-[#C5D1BD]/50 shadow-xs' : ''
                }`}
              >
                <PlusCircle className="h-4.5 w-4.5" strokeWidth={isActive ? 2.25 : 1.75} />
              </div>
              <span className="truncate">New Observation</span>
            </>
          )}
        </NavLink>

        {/* Item 2: Records */}
        <NavLink
          to="/observations"
          className={({ isActive }) =>
            `flex flex-1 flex-col items-center justify-center min-h-[48px] py-1 text-[11px] tracking-wider uppercase transition-all active:scale-95 ${
              isActive
                ? 'text-[#F5F0E4] font-semibold'
                : 'text-[#C5D1BD]/75 hover:text-[#F5F0E4]'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full mb-0.5 transition-colors ${
                  isActive ? 'bg-[#263D2B] text-[#F5F0E4] border border-[#C5D1BD]/50 shadow-xs' : ''
                }`}
              >
                <Leaf className="h-4.5 w-4.5" strokeWidth={isActive ? 2.25 : 1.75} />
              </div>
              <span>Records</span>
            </>
          )}
        </NavLink>

        {/* Item 3: Menu */}
        <button
          type="button"
          onClick={onOpenMenu}
          className={`flex flex-1 flex-col items-center justify-center min-h-[48px] py-1 text-[11px] tracking-wider uppercase transition-all active:scale-95 ${
            isMenuOpen
              ? 'text-[#F5F0E4] font-semibold'
              : 'text-[#C5D1BD]/75 hover:text-[#F5F0E4]'
          }`}
          aria-label="Open secondary navigation menu"
          aria-expanded={isMenuOpen}
        >
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-full mb-0.5 transition-colors ${
              isMenuOpen ? 'bg-[#263D2B] text-[#F5F0E4] border border-[#C5D1BD]/50 shadow-xs' : ''
            }`}
          >
            <Menu className="h-4.5 w-4.5" strokeWidth={isMenuOpen ? 2.25 : 1.75} />
          </div>
          <span>Menu</span>
        </button>
      </div>
    </nav>
  )
}
