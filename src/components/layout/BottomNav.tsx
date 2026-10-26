import { NavLink } from 'react-router-dom'
import { Home, PlusCircle, Leaf, Menu } from 'lucide-react'

interface BottomNavProps {
  onOpenMenu: () => void
  isMenuOpen?: boolean
}

export default function BottomNav({ onOpenMenu, isMenuOpen }: BottomNavProps) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 flex h-16 items-center justify-around border-t border-slate-200 bg-white px-2 sm:px-6 pb-[env(safe-area-inset-bottom)]"
      aria-label="Bottom Navigation"
    >
      <div className="mx-auto flex w-full max-w-lg items-center justify-between">
        {/* Item 1: Home */}
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `group flex flex-1 flex-col items-center justify-center min-h-[48px] py-1 transition-all focus:outline-none ${
              isActive ? 'text-[#1B5E20]' : 'text-slate-500 hover:text-slate-700'
            }`
          }
          aria-label="Home"
        >
          {({ isActive }) => (
            <div
              className={`flex flex-col items-center justify-center px-3 py-1 rounded-xl transition-all ${
                isActive
                  ? 'bg-emerald-50 text-[#1B5E20] ring-2 ring-emerald-300'
                  : 'text-slate-500 group-active:scale-95 group-active:bg-emerald-50 group-active:ring-2 group-active:ring-emerald-200 group-active:text-[#1B5E20]'
              }`}
            >
              <Home
                className={`h-4.5 w-4.5 mb-0.5 transition-colors ${
                  isActive ? 'text-[#1B5E20]' : 'text-slate-500'
                }`}
                strokeWidth={isActive ? 2.25 : 1.75}
              />
              <span className="truncate text-[10px] tracking-normal font-medium">Home</span>
            </div>
          )}
        </NavLink>

        {/* Item 2: New Observation */}
        <NavLink
          to="/new-observation"
          className={({ isActive }) =>
            `group flex flex-1 flex-col items-center justify-center min-h-[48px] py-1 transition-all focus:outline-none ${
              isActive ? 'text-[#1B5E20]' : 'text-slate-500 hover:text-slate-700'
            }`
          }
          aria-label="New Observation"
          title="New Observation"
        >
          {({ isActive }) => (
            <div
              className={`flex flex-col items-center justify-center px-3 py-1 rounded-xl transition-all ${
                isActive
                  ? 'bg-emerald-50 text-[#1B5E20] ring-2 ring-emerald-300'
                  : 'text-slate-500 group-active:scale-95 group-active:bg-emerald-50 group-active:ring-2 group-active:ring-emerald-200 group-active:text-[#1B5E20]'
              }`}
            >
              <PlusCircle
                className={`h-4.5 w-4.5 mb-0.5 transition-colors ${
                  isActive ? 'text-[#1B5E20]' : 'text-slate-500'
                }`}
                strokeWidth={isActive ? 2.25 : 1.75}
              />
              <span className="truncate text-[10px] tracking-normal font-medium">New</span>
            </div>
          )}
        </NavLink>

        {/* Item 3: Records */}
        <NavLink
          to="/observations"
          className={({ isActive }) =>
            `group flex flex-1 flex-col items-center justify-center min-h-[48px] py-1 transition-all focus:outline-none ${
              isActive ? 'text-[#1B5E20]' : 'text-slate-500 hover:text-slate-700'
            }`
          }
          aria-label="Records"
        >
          {({ isActive }) => (
            <div
              className={`flex flex-col items-center justify-center px-3 py-1 rounded-xl transition-all ${
                isActive
                  ? 'bg-emerald-50 text-[#1B5E20] ring-2 ring-emerald-300'
                  : 'text-slate-500 group-active:scale-95 group-active:bg-emerald-50 group-active:ring-2 group-active:ring-emerald-200 group-active:text-[#1B5E20]'
              }`}
            >
              <Leaf
                className={`h-4.5 w-4.5 mb-0.5 transition-colors ${
                  isActive ? 'text-[#1B5E20]' : 'text-slate-500'
                }`}
                strokeWidth={isActive ? 2.25 : 1.75}
              />
              <span className="text-[10px] tracking-normal font-medium">Records</span>
            </div>
          )}
        </NavLink>

        {/* Item 4: Menu */}
        <button
          type="button"
          onClick={onOpenMenu}
          className={`group flex flex-1 flex-col items-center justify-center min-h-[48px] py-1 transition-all focus:outline-none ${
            isMenuOpen ? 'text-[#1B5E20]' : 'text-slate-500 hover:text-slate-700'
          }`}
          aria-label="Open secondary navigation menu"
          aria-expanded={isMenuOpen}
        >
          <div
            className={`flex flex-col items-center justify-center px-3 py-1 rounded-xl transition-all ${
              isMenuOpen
                ? 'bg-emerald-50 text-[#1B5E20] ring-2 ring-emerald-300'
                : 'text-slate-500 group-active:scale-95 group-active:bg-emerald-50 group-active:ring-2 group-active:ring-emerald-200 group-active:text-[#1B5E20]'
            }`}
          >
            <Menu
              className={`h-4.5 w-4.5 mb-0.5 transition-colors ${
                isMenuOpen ? 'text-[#1B5E20]' : 'text-slate-500'
              }`}
              strokeWidth={isMenuOpen ? 2.25 : 1.75}
            />
            <span className="text-[10px] tracking-normal font-medium">Menu</span>
          </div>
        </button>
      </div>
    </nav>
  )
}

