import { useEffect, useState, useCallback } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  X,
  ChevronRight,
  ChevronLeft,
  FolderGit2,
  BookmarkCheck,
  BookOpen,
  Leaf,
  Sliders,
  Database,
  ShieldCheck,
  LogOut,
  type LucideIcon,
} from 'lucide-react'
import { useProfile } from '@/context/ProfileContext'
import { db } from '@/db/database'
import SettingsPage from '@/pages/SettingsPage'
import AboutPage from '@/pages/AboutPage'
import FAQPage from '@/pages/FAQPage'
import OfflineSyncPage from '@/pages/OfflineSyncPage'
import PrivacyPage from '@/pages/PrivacyPage'
import BrandName from '@/components/BrandName'
import BrandLockup from '@/components/BrandLockup'

interface NavigationDrawerProps {
  isOpen: boolean
  onClose: () => void
}

type DrawerSubView = 'menu' | 'settings' | 'about' | 'faq' | 'sync' | 'privacy'

interface BaseMenuItem {
  title: string | React.ReactNode
  description?: string
  icon: LucideIcon
  iconColor: string
  badge?: React.ReactNode
}

interface LinkMenuItem extends BaseMenuItem {
  kind: 'link'
  to: string
  activeColor?: string
}

interface SubviewMenuItem extends BaseMenuItem {
  kind: 'subview'
  subView: DrawerSubView
}

interface ActionMenuItem extends BaseMenuItem {
  kind: 'action'
  onAction: () => void
}

type MenuItemConfig = LinkMenuItem | SubviewMenuItem | ActionMenuItem

export default function NavigationDrawer({ isOpen, onClose }: NavigationDrawerProps) {
  const navigate = useNavigate()
  const { signOut } = useProfile()
  const [subView, setSubView] = useState<DrawerSubView>('menu')
  const [localObservationCount, setLocalObservationCount] = useState<number | null>(null)

  // Smooth slide-over animation states
  const [isRendered, setIsRendered] = useState(isOpen)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true)
      const timer = requestAnimationFrame(() => {
        setIsAnimating(true)
      })
      return () => cancelAnimationFrame(timer)
    } else {
      setIsAnimating(false)
      const timer = setTimeout(() => {
        setIsRendered(false)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  const handleSignOut = () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      handleClose()
      signOut()
      navigate('/welcome', { replace: true })
    }
  }

  // Load real observation count whenever the drawer opens
  useEffect(() => {
    if (isOpen) {
      let isMounted = true
      db.observations
        .count()
        .then((count) => {
          if (isMounted) setLocalObservationCount(count)
        })
        .catch((err) => console.error('Failed to query local count in drawer:', err))

      return () => {
        isMounted = false
      }
    }
  }, [isOpen])

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

  const handleClose = useCallback(() => {
    setSubView('menu')
    onClose()
  }, [onClose])

  // Support Escape key to close the drawer or go back to main menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (subView !== 'menu') {
          setSubView('menu')
        } else {
          handleClose()
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, subView, handleClose])

  if (!isRendered) return null

  // Main primary navigation items
  const primaryMenuItems: (LinkMenuItem | SubviewMenuItem)[] = [
    {
      kind: 'link',
      to: '/projects',
      title: 'Projects',
      icon: FolderGit2,
      iconColor: 'text-[#08221A]',
      activeColor: 'text-[#08221A]',
    },
    {
      kind: 'link',
      to: '/my-projects',
      title: 'My Projects',
      icon: BookmarkCheck,
      iconColor: 'text-[#08221A]',
      activeColor: 'text-[#08221A]',
    },
    {
      kind: 'subview',
      subView: 'faq',
      title: 'Field Guide & Help',
      icon: BookOpen,
      iconColor: 'text-[#08221A]',
    },
    {
      kind: 'subview',
      subView: 'about',
      title: (
        <span className="flex items-center gap-1.5">
          About{' '}
          <BrandName
            className="text-sm sm:text-base font-bold"
            colorX="text-[#08221A]"
            colorY="text-[#1C4D3C]"
          />
        </span>
      ),
      icon: Leaf,
      iconColor: 'text-[#08221A]',
    },
    {
      kind: 'subview',
      subView: 'settings',
      title: 'Settings',
      icon: Sliders,
      iconColor: 'text-[#08221A]',
    },
    {
      kind: 'subview',
      subView: 'sync',
      title: 'Offline Data & Sync',
      icon: Database,
      iconColor: 'text-[#08221A]',
      badge:
        localObservationCount !== null ? (
          <span className="rounded-full bg-[#CCD8CD] px-2.5 py-0.5 text-[11px] font-semibold text-[#08221A] border border-[#1C4D3C]/30 w-fit mt-0.5">
            {localObservationCount} on device
          </span>
        ) : null,
    },
    {
      kind: 'subview',
      subView: 'privacy',
      title: 'Privacy & Data Sharing',
      icon: ShieldCheck,
      iconColor: 'text-[#08221A]',
    },
  ]

  // Sign out action item
  const signOutItem: ActionMenuItem = {
    kind: 'action',
    title: 'Sign Out',
    icon: LogOut,
    iconColor: 'text-rose-700',
    onAction: handleSignOut,
  }

  const renderItemInner = (item: MenuItemConfig) => {
    const Icon = item.icon
    const isSignOut = item.kind === 'action'
    return (
      <>
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl ${
              isSignOut
                ? 'bg-rose-100/80 border border-rose-300 text-rose-700'
                : 'bg-[#CCD8CD] border border-[#1C4D3C]/25 text-[#08221A]'
            }`}
          >
            <Icon className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
          </div>
          <div className="flex flex-col min-w-0">
            <span
              className={`text-sm sm:text-base font-semibold leading-snug truncate ${
                isSignOut ? 'text-rose-700' : 'text-[#08221A]'
              }`}
            >
              {item.title}
            </span>
            {item.badge}
          </div>
        </div>
        <ChevronRight
          className={`h-4 w-4 shrink-0 ml-1.5 ${
            isSignOut
              ? 'text-rose-400 group-hover:text-rose-600'
              : 'text-[#1C4D3C]/60 group-hover:text-[#08221A]'
          }`}
        />
      </>
    )
  }

  const renderSubView = () => {
    const onBack = () => setSubView('menu')
    let viewContent: React.ReactNode = null

    if (subView === 'settings') viewContent = <SettingsPage onBack={onBack} />
    else if (subView === 'about') viewContent = <AboutPage onBack={onBack} />
    else if (subView === 'faq') viewContent = <FAQPage onBack={onBack} />
    else if (subView === 'sync') viewContent = <OfflineSyncPage onBack={onBack} />
    else if (subView === 'privacy') viewContent = <PrivacyPage onBack={onBack} />

    if (!viewContent) return null

    return (
      <div className="flex flex-col h-full overflow-hidden bg-[#08221A]">
        {/* Subview Header with Solid Primary Dark Green Background (#08221A) matching B-Liffe Theme */}
        <div
          className="flex min-h-[56px] sm:min-h-[60px] items-center justify-between border-b border-[#1C4D3C] bg-[#08221A] px-4 py-2 sm:px-5 shrink-0"
          style={{ backgroundColor: '#08221A' }}
        >
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-sm text-white hover:underline font-bold cursor-pointer"
          >
            <ChevronLeft className="h-4.5 w-4.5" />
            <span>Back</span>
          </button>
          <button
            type="button"
            onClick={handleClose}
            className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-[#1C4D3C] bg-[#0D2D22] text-white hover:bg-[#133D2F] transition-all active:scale-95 cursor-pointer shadow-xs"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-4">
          {viewContent}
        </div>
      </div>
    )
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex justify-end overflow-hidden ${
        isAnimating ? 'pointer-events-auto' : 'pointer-events-none'
      }`}
    >
      {/* Backdrop overlay (dims the rest of the screen on the left) */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 ease-out ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Slide-over panel covering only the right portion of screen */}
      <aside
        className={`relative ml-auto flex h-full w-[75vw] min-w-[260px] max-w-[360px] sm:w-80 flex-col border-l border-[#1C4D3C]/35 bg-[#DBE4DC] text-[#08221A] shadow-2xl shadow-black/50 overflow-hidden transform transition-transform duration-300 ease-out ${
          isAnimating ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Application Menu"
      >
        {subView !== 'menu' ? (
          renderSubView()
        ) : (
          /* Main Menu View */
          <div className="flex flex-col h-full overflow-hidden">
            {/* Header: Solid Dark Green (#08221A) with Original Green Logo and Brand Text */}
            <div
              className="relative z-10 flex min-h-[56px] sm:min-h-[60px] items-center justify-between border-b border-[#1C4D3C] bg-[#08221A] px-4 py-2 sm:px-5 shrink-0"
              style={{ backgroundColor: '#08221A' }}
            >
              <BrandLockup
                layout="horizontal"
                size="sm"
              />

              {/* Close Button (X) at Top Right Corner */}
              <button
                type="button"
                onClick={handleClose}
                className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-[#1C4D3C] bg-[#0D2D22] text-white hover:bg-[#133D2F] transition-all active:scale-95 focus:outline-none cursor-pointer shrink-0 ml-2 shadow-xs"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content area: well-proportioned and comfortably filling the entire height */}
            <div className="flex-1 flex flex-col justify-between overflow-y-auto px-3.5 py-3 sm:px-4 sm:py-4 min-h-0">
              {/* Primary Navigation Items with Dark Forest Green Text and Icons */}
              <nav className="flex-1 flex flex-col justify-around gap-1 sm:gap-1.5 py-1 min-h-0" aria-label="Menu Items">
                {primaryMenuItems.map((item, idx) => {
                  if (item.kind === 'link') {
                    return (
                      <NavLink
                        key={item.to + idx}
                        to={item.to}
                        onClick={onClose}
                        className={({ isActive }) =>
                          `group flex items-center justify-between rounded-2xl px-3.5 py-3 sm:py-3.5 transition-colors ${
                            isActive
                              ? 'bg-[#C6D5C8] border border-[#1C4D3C]/40 text-[#08221A] font-bold shadow-xs'
                              : 'text-[#08221A] hover:bg-[#CCD8CD]/70 border border-transparent'
                          }`
                        }
                      >
                        {renderItemInner(item)}
                      </NavLink>
                    )
                  }

                  return (
                    <button
                      key={item.subView}
                      type="button"
                      onClick={() => setSubView(item.subView)}
                      className="group w-full flex items-center justify-between rounded-2xl px-3.5 py-3 sm:py-3.5 text-left transition-colors text-[#08221A] hover:bg-[#CCD8CD]/70 border border-transparent cursor-pointer"
                    >
                      {renderItemInner(item)}
                    </button>
                  )
                })}
              </nav>

              {/* Sign Out at the Bottom */}
              <div className="pt-1 shrink-0">
                <button
                  type="button"
                  onClick={signOutItem.onAction}
                  className="group w-full flex items-center justify-between rounded-2xl px-3.5 py-3 sm:py-3.5 text-left transition-colors text-rose-700 hover:bg-rose-100/70 hover:text-rose-800 border border-transparent hover:border-rose-300 cursor-pointer"
                >
                  {renderItemInner(signOutItem)}
                </button>
              </div>
            </div>
          </div>
        )}
      </aside>
    </div>
  )
}
