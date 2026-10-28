import { NavLink } from 'react-router-dom'
import { FolderGit2, Compass } from 'lucide-react'

function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3 sm:px-6">
        <div>
          <NavLink to="/" className="flex items-center gap-2 text-decoration-none">
            <span className="text-2xl font-bold tracking-tight text-emerald-800">🌿 B LIFFE</span>
          </NavLink>
          <p className="hidden md:block text-xs text-muted-foreground">Bharat Local Informatics for Flora, Fauna, and Ecosystems</p>
        </div>

        {/* Navigation links */}
        <nav className="flex items-center gap-1.5 sm:gap-2">
          <NavLink
            to="/projects"
            className={({ isActive }) =>
              `inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-emerald-100 text-emerald-900 font-semibold'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`
            }
          >
            <FolderGit2 className="h-4 w-4" />
            <span>Projects</span>
          </NavLink>

          <NavLink
            to="/observations"
            className={({ isActive }) =>
              `inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-emerald-100 text-emerald-900 font-semibold'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`
            }
          >
            <Compass className="h-4 w-4" />
            <span>Quick Log</span>
          </NavLink>
        </nav>
      </div>
    </header>
  )
}

export default Header