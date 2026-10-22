import { useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import {
  X,
  Home,
  PlusCircle,
  Leaf,
  FolderGit2,
  Database,
  ChevronRight,
  Info,
} from 'lucide-react'

interface NavigationDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export default function NavigationDrawer({ isOpen, onClose }: NavigationDrawerProps) {
  // Prevent background scrolling when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer surface */}
      <aside
        className="relative ml-auto flex h-full w-[84%] max-w-xs flex-col border-l border-white/15 bg-[#16251B]/95 backdrop-blur-xl text-[#F5F0E4] shadow-2xl overflow-hidden"
        role="dialog"
        aria-label="Navigation menu"
      >
        {/* Header */}
        <div className="relative z-10 flex items-center justify-between border-b border-white/15 bg-white/5 px-4 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#263D2B] border border-[#C5D1BD]/30 text-[#F5F0E4]">
              <Leaf className="h-4 w-4 text-[#C5D1BD]" />
            </div>
            <div>
              <h2 className="font-heading text-lg font-normal tracking-[0.15em] uppercase text-[#F5F0E4]">Shrishti</h2>
              <p className="text-[10px] tracking-[0.2em] uppercase text-[#C5D1BD]/80">Biodiversity Field Platform</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-[#F5F0E4] hover:bg-white/20 transition-all active:scale-95"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Menu links */}
        <nav className="flex-1 overflow-y-auto px-3.5 py-4 space-y-1.5">
          <NavLink
            to="/"
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center justify-between rounded-xl px-3.5 py-3 text-base transition-colors ${
                isActive
                  ? 'bg-white/15 border border-white/20 text-[#F5F0E4] font-semibold'
                  : 'text-[#F5F0E4]/90 hover:bg-white/10 border border-transparent'
              }`
            }
          >
            <div className="flex items-center gap-3">
              <Home className="h-5 w-5 text-[#C5D1BD]" />
              <span>Home</span>
            </div>
            <ChevronRight className="h-4 w-4 text-[#C5D1BD]/60" />
          </NavLink>

          <NavLink
            to="/new-observation"
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center justify-between rounded-xl px-3.5 py-3 text-base transition-colors ${
                isActive
                  ? 'bg-white/15 border border-white/20 text-[#F5F0E4] font-semibold'
                  : 'text-[#F5F0E4]/90 hover:bg-white/10 border border-transparent'
              }`
            }
          >
            <div className="flex items-center gap-3">
              <PlusCircle className="h-5 w-5 text-[#C5D1BD]" />
              <span>New Observation</span>
            </div>
            <ChevronRight className="h-4 w-4 text-[#C5D1BD]/60" />
          </NavLink>

          <NavLink
            to="/observations"
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center justify-between rounded-xl px-3.5 py-3 text-base transition-colors ${
                isActive
                  ? 'bg-white/15 border border-white/20 text-[#F5F0E4] font-semibold'
                  : 'text-[#F5F0E4]/90 hover:bg-white/10 border border-transparent'
              }`
            }
          >
            <div className="flex items-center gap-3">
              <Leaf className="h-5 w-5 text-[#C5D1BD]" />
              <span>My Records</span>
            </div>
            <ChevronRight className="h-4 w-4 text-[#C5D1BD]/60" />
          </NavLink>

          <div className="my-3.5 border-t border-white/15" />

          <p className="px-2 pb-1.5 text-xs font-semibold tracking-wider uppercase text-[#C5D1BD]/75">
            Field Workflows
          </p>

          <NavLink
            to="/projects"
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center justify-between rounded-xl px-3.5 py-3 text-base transition-colors ${
                isActive
                  ? 'bg-white/15 border border-white/20 text-[#F5F0E4] font-semibold'
                  : 'text-[#F5F0E4]/90 hover:bg-white/10 border border-transparent'
              }`
            }
          >
            <div className="flex items-center gap-3">
              <FolderGit2 className="h-5 w-5 text-[#C5D1BD]" />
              <span>Projects & Field Visits</span>
            </div>
            <ChevronRight className="h-4 w-4 text-[#C5D1BD]/60" />
          </NavLink>

          <div className="my-3.5 border-t border-white/15" />

          {/* Offline info */}
          <div className="rounded-xl border border-white/15 bg-white/5 p-3.5 text-sm text-[#C5D1BD] space-y-1">
            <div className="flex items-center gap-2 font-semibold text-[#F5F0E4]">
              <Database className="h-4 w-4 text-[#C5D1BD]" />
              <span>Offline Database</span>
            </div>
            <p className="text-xs leading-relaxed text-[#C5D1BD]/85">
              All observations, coordinates, and photographs are stored locally on your device in IndexedDB.
            </p>
          </div>
        </nav>

        {/* Footer */}
        <div className="border-t border-white/15 bg-white/5 p-3.5 text-center">
          <p className="text-xs text-[#C5D1BD]/80 flex items-center justify-center gap-1.5">
            <Info className="h-3.5 w-3.5 text-[#C5D1BD]" /> Shrishti • Field Biodiversity App
          </p>
        </div>
      </aside>
    </div>
  )
}
