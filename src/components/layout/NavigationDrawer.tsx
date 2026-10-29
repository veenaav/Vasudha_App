import { useEffect, useState, useCallback } from 'react'
import { NavLink } from 'react-router-dom'
import {
  X,
  ChevronRight,
  FolderGit2,
  BookmarkCheck,
  BookOpen,
  Leaf,
  Sliders,
  Database,
  ShieldCheck,
  User,
  type LucideIcon,
} from 'lucide-react'
import { db } from '@/db/database'
import SettingsPage from '@/pages/SettingsPage'
import AboutPage from '@/pages/AboutPage'
import FAQPage from '@/pages/FAQPage'
import OfflineSyncPage from '@/pages/OfflineSyncPage'
import PrivacyPage from '@/pages/PrivacyPage'
import BrandName from '@/components/BrandName'

interface NavigationDrawerProps {
  isOpen: boolean
  onClose: () => void
}

type DrawerSubView = 'menu' | 'settings' | 'about' | 'faq' | 'sync' | 'privacy'

interface BaseMenuItem {
  title: string | React.ReactNode
  description: string
  icon: LucideIcon
  iconColor: string
  badge?: React.ReactNode
}

interface LinkMenuItem extends BaseMenuItem {
  kind: 'link'
  to: string
  activeColor?: string
}

interface ActionMenuItem extends BaseMenuItem {
  kind: 'subview'
  subView: DrawerSubView
}

type MenuItemConfig = LinkMenuItem | ActionMenuItem

export default function NavigationDrawer({ isOpen, onClose }: NavigationDrawerProps) {
  const [subView, setSubView] = useState<DrawerSubView>('menu')
  const [localObservationCount, setLocalObservationCount] = useState<number | null>(null)

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

  if (!isOpen) return null

  const menuItems: MenuItemConfig[] = [
    {
      kind: 'link',
      to: '/projects',
      title: 'Projects & Field Hub',
      description: 'Explore and join biodiversity projects.',
      icon: FolderGit2,
      iconColor: 'text-[#A6F16A]',
      activeColor: 'text-[#A6F16A]',
    },
    {
      kind: 'link',
      to: '/my-projects',
      title: 'My Joined Projects',
      description: 'Access your project activities.',
      icon: BookmarkCheck,
      iconColor: 'text-[#20D6A0]',
      activeColor: 'text-[#20D6A0]',
    },
    {
      kind: 'subview',
      subView: 'faq',
      title: 'Field Guide & Help',
      description: 'Recording instructions and FAQs.',
      icon: BookOpen,
      iconColor: 'text-[#A6F16A]',
    },
    {
      kind: 'subview',
      subView: 'about',
      title: (
        <span className="flex items-center gap-1.5">
          About <BrandName className="text-sm" />
        </span>
      ),
      description: 'Mission, features and conservation goals.',
      icon: Leaf,
      iconColor: 'text-[#20D6A0]',
    },
    {
      kind: 'subview',
      subView: 'settings',
      title: 'Settings',
      description: 'Preferences and appearance.',
      icon: Sliders,
      iconColor: 'text-[#A6F16A]',
    },
    {
      kind: 'subview',
      subView: 'sync',
      title: 'Offline Data & Sync',
      description: 'Saved data and synchronisation status.',
      icon: Database,
      iconColor: 'text-[#20D6A0]',
      badge:
        localObservationCount !== null ? (
          <span className="rounded-full bg-[#133D2F] px-2 py-0.5 text-[10px] font-semibold text-[#A6F16A] border border-[#1C4D3C]">
            {localObservationCount} on device
          </span>
        ) : null,
    },
    {
      kind: 'subview',
      subView: 'privacy',
      title: 'Privacy & Data Sharing',
      description: 'Understand how observation data is handled.',
      icon: ShieldCheck,
      iconColor: 'text-[#A6F16A]',
    },
    {
      kind: 'link',
      to: '/profile',
      title: 'My Profile',
      description: 'Manage avatar, display name, and bio.',
      icon: User,
      iconColor: 'text-[#A6F16A]',
      activeColor: 'text-[#A6F16A]',
    },
    {
      kind: 'link',
      to: '/welcome',
      title: 'Sign In & Welcome Tour',
      description: 'Opening splash, login, and registration.',
      icon: User,
      iconColor: 'text-[#20D6A0]',
    },
  ]

  const renderItemInner = (item: MenuItemConfig) => {
    const Icon = item.icon
    return (
      <>
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#133D2F] border border-[#1C4D3C] ${item.iconColor}`}
          >
            <Icon className="h-4.5 w-4.5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="block text-sm font-semibold leading-snug">{item.title}</span>
              {item.badge}
            </div>
            <span className="block text-[11px] text-[#B2C8BA] truncate">
              {item.description}
            </span>
          </div>
        </div>
        <ChevronRight className="h-4 w-4 shrink-0 text-[#7B9586] group-hover:text-[#A6F16A] ml-2" />
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
      <div className="flex-1 overflow-y-auto">
        <div className="p-3">{viewContent}</div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop overlay (dismisses without altering background page or form state) */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Drawer Surface */}
      <aside
        className="relative ml-auto flex h-full w-full max-w-md flex-col border-l border-[#1C4D3C] bg-[#08221A] text-[#F0F5EF] shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-label="Application Menu"
      >
        {subView !== 'menu' ? (
          renderSubView()
        ) : (
          /* Main Menu View */
          <>
            {/* Header */}
            <div className="relative z-10 flex items-center justify-between border-b border-[#1C4D3C] bg-[#08221A] px-4 py-3.5 sm:px-5">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0D2D22] border border-[#1C4D3C] p-0.5 shadow-xs overflow-hidden">
                  <img src="/splash-logo.png" alt="B-LIFFE" className="h-full w-full object-contain" />
                </div>
                <div className="min-w-0">
                  <BrandName className="text-lg" />
                  <p className="text-[10px] tracking-wider uppercase font-semibold text-[#B2C8BA] truncate mt-0.5">
                    Menu & Information
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#1C4D3C] bg-[#0D2D22] text-[#B2C8BA] hover:bg-[#133D2F] hover:text-[#F0F5EF] transition-all active:scale-95 focus:outline-none cursor-pointer"
                aria-label="Close menu"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-1.5">
              {menuItems.map((item, idx) => {
                if (item.kind === 'link') {
                  return (
                    <NavLink
                      key={item.to + idx}
                      to={item.to}
                      onClick={item.to === '/welcome' ? handleClose : onClose}
                      className={({ isActive }) =>
                        `group flex items-center justify-between rounded-2xl px-3.5 py-3 transition-colors ${
                          isActive
                            ? `bg-[#133D2F] border border-[#1C4D3C] ${item.activeColor || 'text-[#A6F16A]'}`
                            : 'text-[#F0F5EF] hover:bg-[#0D2D22] border border-transparent'
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
                    className="group w-full flex items-center justify-between rounded-2xl px-3.5 py-3 text-left transition-colors text-[#F0F5EF] hover:bg-[#0D2D22] border border-transparent cursor-pointer"
                  >
                    {renderItemInner(item)}
                  </button>
                )
              })}
            </div>

            {/* Drawer Footer */}
            <div className="border-t border-[#1C4D3C] bg-[#061812] px-4 py-3 text-center text-xs text-[#B2C8BA]">
              <div className="flex justify-center">
                <BrandName className="text-base" />
              </div>
              <p className="text-[10px] text-[#7B9586] font-normal mt-0.5">
                Bharat Local Informatics for Flora, Fauna, and Ecosystems
              </p>
            </div>
          </>
        )}
      </aside>
    </div>
  )
}
