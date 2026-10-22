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
    <div className="relative min-h-screen nature-bg-container text-[#F5F0E4] antialiased selection:bg-[#B87555] selection:text-white">
      {/* Subtle dark green overlay across the background for contrast and earthy nature atmosphere */}
      <div
        className="fixed inset-0 pointer-events-none bg-[#142217]/85 backdrop-blur-[0.5px]"
        aria-hidden="true"
      />

      {/* Main content layer */}
      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Top Application Bar */}
        <TopBar onOpenDrawer={() => setIsDrawerOpen(true)} />

        {/* Main Viewport Content Area with padding for bottom nav on mobile */}
        <main className="flex-1 pb-24 md:pb-12">
          {children}
        </main>

        {/* Sticky Bottom Navigation for Mobile */}
        <BottomNav />

        {/* Slide-out Navigation Drawer */}
        <NavigationDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
        />
      </div>
    </div>
  )
}
