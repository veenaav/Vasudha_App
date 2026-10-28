import { NavLink } from 'react-router-dom'
import { Home, PlusCircle, Leaf, Menu } from 'lucide-react'

interface BottomNavProps {
  onOpenMenu: () => void
  isMenuOpen?: boolean
}

export default function BottomNav({ onOpenMenu, isMenuOpen }: BottomNavProps) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 flex h-16 items-center justify-around border-t border-[#1C4D3C] bg-[#08221A]/95 backdrop-blur-lg px-2 sm:px-6 pb-[env(safe-area-inset-bottom)]"
      aria-label="Bottom Navigation"
    >
      <div className="mx-auto flex w-full max-w-lg items-center justify-between">
        {/* Item 1: Home */}
        <NavLink
          to="/home"
          end
          className={({ isActive }) =>
            `group flex flex-1 flex-col items-center justify-center min-h-[48px] py-1 transition-all focus:outline-none ${
              isActive ? 'text-[#A6F16A]' : 'text-[#7B9586] hover:text-[#B2C8BA]'
            }`
          }
          aria-label="Home"
        >
          {({ isActive }) => (
            <div
              className={`flex flex-col items-center justify-center px-3.5 py-1 rounded-2xl transition-all ${
                isActive
                  ? 'bg-[#133D2F] text-[#A6F16A] border border-[#1C4D3C] shadow-sm'
                  : 'text-[#7B9586] group-active:scale-95 group-active:bg-[#0D2D22]'
              }`}
            >
              <Home
                className={`h-4.5 w-4.5 mb-0.5 transition-colors ${
                  isActive ? 'text-[#A6F16A]' : 'text-[#7B9586]'
                }`}
                strokeWidth={isActive ? 2.25 : 1.75}
              />
              <span className="truncate text-[10px] tracking-normal font-semibold">Home</span>
            </div>
          )}
        </NavLink>

        {/* Item 2: New Observation */}
        <NavLink
          to="/new-observation"
          className={({ isActive }) =>
            `group flex flex-1 flex-col items-center justify-center min-h-[48px] py-1 transition-all focus:outline-none ${
              isActive ? 'text-[#A6F16A]' : 'text-[#7B9586] hover:text-[#B2C8BA]'
            }`
          }
          aria-label="New Observation"
          title="New Observation"
        >
          {({ isActive }) => (
            <div
              className={`flex flex-col items-center justify-center px-3.5 py-1 rounded-2xl transition-all ${
                isActive
                  ? 'bg-[#133D2F] text-[#A6F16A] border border-[#1C4D3C] shadow-sm'
                  : 'text-[#7B9586] group-active:scale-95 group-active:bg-[#0D2D22]'
              }`}
            >
              <PlusCircle
                className={`h-4.5 w-4.5 mb-0.5 transition-colors ${
                  isActive ? 'text-[#A6F16A]' : 'text-[#7B9586]'
                }`}
                strokeWidth={isActive ? 2.25 : 1.75}
              />
              <span className="truncate text-[10px] tracking-normal font-semibold">New</span>
            </div>
          )}
        </NavLink>

        {/* Item 3: Records */}
        <NavLink
          to="/observations"
          className={({ isActive }) =>
            `group flex flex-1 flex-col items-center justify-center min-h-[48px] py-1 transition-all focus:outline-none ${
              isActive ? 'text-[#A6F16A]' : 'text-[#7B9586] hover:text-[#B2C8BA]'
            }`
          }
          aria-label="Records"
        >
          {({ isActive }) => (
            <div
              className={`flex flex-col items-center justify-center px-3.5 py-1 rounded-2xl transition-all ${
                isActive
                  ? 'bg-[#133D2F] text-[#A6F16A] border border-[#1C4D3C] shadow-sm'
                  : 'text-[#7B9586] group-active:scale-95 group-active:bg-[#0D2D22]'
              }`}
            >
              <Leaf
                className={`h-4.5 w-4.5 mb-0.5 transition-colors ${
                  isActive ? 'text-[#A6F16A]' : 'text-[#7B9586]'
                }`}
                strokeWidth={isActive ? 2.25 : 1.75}
              />
              <span className="text-[10px] tracking-normal font-semibold">Records</span>
            </div>
          )}
        </NavLink>

        {/* Item 4: Menu */}
        <button
          type="button"
          onClick={onOpenMenu}
          className={`group flex flex-1 flex-col items-center justify-center min-h-[48px] py-1 transition-all focus:outline-none cursor-pointer ${
            isMenuOpen ? 'text-[#A6F16A]' : 'text-[#7B9586] hover:text-[#B2C8BA]'
          }`}
          aria-label="Open secondary navigation menu"
          aria-expanded={isMenuOpen}
        >
          <div
            className={`flex flex-col items-center justify-center px-3.5 py-1 rounded-2xl transition-all ${
              isMenuOpen
                ? 'bg-[#133D2F] text-[#A6F16A] border border-[#1C4D3C] shadow-sm'
                : 'text-[#7B9586] group-active:scale-95 group-active:bg-[#0D2D22]'
            }`}
          >
            <Menu
              className={`h-4.5 w-4.5 mb-0.5 transition-colors ${
                isMenuOpen ? 'text-[#A6F16A]' : 'text-[#7B9586]'
              }`}
              strokeWidth={isMenuOpen ? 2.25 : 1.75}
            />
            <span className="text-[10px] tracking-normal font-semibold">Menu</span>
          </div>
        </button>
      </div>
    </nav>
  )
}

