import { NavLink } from 'react-router-dom'
import { Home, PlusCircle, Leaf } from 'lucide-react'

export default function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 flex h-16 items-center justify-around border-t border-white/10 bg-[#142217]/90 backdrop-blur-lg px-4 shadow-xl"
      aria-label="Bottom Navigation"
    >
      {/* 1. Home */}
      <NavLink
        to="/"
        end
        className={({ isActive }) =>
          `flex flex-1 flex-col items-center justify-center min-h-[48px] py-1 text-[11px] tracking-wider uppercase transition-colors ${
            isActive
              ? 'text-[#F5F0E4] font-semibold'
              : 'text-[#C5D1BD]/70 hover:text-[#F5F0E4]'
          }`
        }
      >
        <Home className="h-4.5 w-4.5 mb-1" strokeWidth={1.75} />
        <span>Home</span>
      </NavLink>

      {/* 2. New Observation - MOYA Pill Button Style */}
      <NavLink
        to="/new-observation"
        className={({ isActive }) =>
          `flex flex-1 flex-col items-center justify-center min-h-[44px] mx-2 rounded-full py-1 px-3 text-[11px] tracking-wider uppercase transition-all active:scale-95 shadow-md ${
            isActive
              ? 'bg-[#263D2B] text-[#F5F0E4] border border-[#C5D1BD]/50 font-semibold'
              : 'bg-[#263D2B]/90 text-[#F5F0E4] border border-white/20 hover:bg-[#263D2B] font-medium'
          }`
        }
      >
        <PlusCircle className="h-4 w-4 mb-0.5 text-[#C5D1BD]" strokeWidth={2} />
        <span>New</span>
      </NavLink>

      {/* 3. Observations List */}
      <NavLink
        to="/observations"
        className={({ isActive }) =>
          `flex flex-1 flex-col items-center justify-center min-h-[48px] py-1 text-[11px] tracking-wider uppercase transition-colors ${
            isActive
              ? 'text-[#F5F0E4] font-semibold'
              : 'text-[#C5D1BD]/70 hover:text-[#F5F0E4]'
          }`
        }
      >
        <Leaf className="h-4.5 w-4.5 mb-1" strokeWidth={1.75} />
        <span>Records</span>
      </NavLink>
    </nav>
  )
}
