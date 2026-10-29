import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import TopBar from './TopBar'
import BottomNav from './BottomNav'
import NavigationDrawer from './NavigationDrawer'

interface AppLayoutProps {
  children: React.ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const location = useLocation()
  const normalizedPath = location.pathname.replace(/\/+$/, '') || '/'
  const staticRoutes = ['/', '/splash', '/welcome', '/login', '/create-account', '/register']
  const isStaticRoute = staticRoutes.includes(normalizedPath)

  if (isStaticRoute) {
    return (
      <div className="fixed inset-0 h-[100dvh] max-h-[100dvh] w-full overflow-hidden bg-[#08221A] text-[#F0F5EF] antialiased selection:bg-[#A6F16A] selection:text-[#061812]">
        {children}
      </div>
    )
  }

  const isProjectsRoute = normalizedPath === '/projects'

  if (isProjectsRoute) {
    return (
      <div className="fixed inset-0 h-screen h-[100dvh] max-h-[100dvh] w-full overflow-hidden bg-[#08221A] text-[#F0F5EF] antialiased selection:bg-[#A6F16A] selection:text-[#061812] flex flex-col">
        {/* Top Application Bar with B-LIFFE branding */}
        <div className="shrink-0 z-20">
          <TopBar />
        </div>

        {/* Main Viewport Content Area - fixed to remaining screen height with internal scroll support */}
        <main className="flex-1 min-h-0 overflow-hidden flex flex-col pb-16">
          {children}
        </main>

        {/* Sticky Bottom Navigation */}
        <BottomNav
          onOpenMenu={() => setIsDrawerOpen(true)}
          isMenuOpen={isDrawerOpen}
        />

        {/* Slide-out Menu Drawer / Bottom Sheet */}
        <NavigationDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
        />
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-[#08221A] text-[#F0F5EF] antialiased selection:bg-[#A6F16A] selection:text-[#061812]">
      {/* Main content layer */}
      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Top Application Bar with B-LIFFE branding */}
        <TopBar />

        {/* Main Viewport Content Area */}
        <main className="flex-1 pb-28 sm:pb-20">
          {children}
        </main>

        {/* Sticky Bottom Navigation */}
        <BottomNav
          onOpenMenu={() => setIsDrawerOpen(true)}
          isMenuOpen={isDrawerOpen}
        />

        {/* Slide-out Menu Drawer / Bottom Sheet */}
        <NavigationDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
        />
      </div>
    </div>
  )
}
