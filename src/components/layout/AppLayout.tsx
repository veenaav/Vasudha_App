import { useState } from 'react'
import TopBar from './TopBar'
import BottomNav from './BottomNav'
import NavigationDrawer from './NavigationDrawer'

interface AppLayoutProps {
  children: React.ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  return (
    <div className="relative min-h-screen bg-[#18261B] text-[#F5F0E4] antialiased selection:bg-[#B87555] selection:text-white">
      {/* Main content layer */}
      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Top Application Bar with B LIFFE branding & Home icon */}
        <TopBar />

        {/* Main Viewport Content Area with ample padding for bottom nav on mobile */}
        <main className="flex-1 pb-28 sm:pb-20">
          {children}
        </main>

        {/* Sticky Bottom Navigation (3 items: New Observation, Records, Menu) */}
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
