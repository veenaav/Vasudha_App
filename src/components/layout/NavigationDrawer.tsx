import { useEffect, useState } from 'react'
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

  const handleClose = () => {
    setSubView('menu')
    onClose()
  }

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
  }, [isOpen, subView, onClose])

  if (!isOpen) return null

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
        {/* Render Subviews inline so form data on the active page is never lost */}
        {subView === 'settings' ? (
          <div className="flex-1 overflow-y-auto">
            <div className="p-3">
              <SettingsPage onBack={() => setSubView('menu')} />
            </div>
          </div>
        ) : subView === 'about' ? (
          <div className="flex-1 overflow-y-auto">
            <div className="p-3">
              <AboutPage onBack={() => setSubView('menu')} />
            </div>
          </div>
        ) : subView === 'faq' ? (
          <div className="flex-1 overflow-y-auto">
            <div className="p-3">
              <FAQPage onBack={() => setSubView('menu')} />
            </div>
          </div>
        ) : subView === 'sync' ? (
          <div className="flex-1 overflow-y-auto">
            <div className="p-3">
              <OfflineSyncPage onBack={() => setSubView('menu')} />
            </div>
          </div>
        ) : subView === 'privacy' ? (
          <div className="flex-1 overflow-y-auto">
            <div className="p-3">
              <PrivacyPage onBack={() => setSubView('menu')} />
            </div>
          </div>
        ) : (
          /* Main Menu View */
          <>
            {/* Header */}
            <div className="relative z-10 flex items-center justify-between border-b border-[#1C4D3C] bg-[#08221A] px-4 py-3.5 sm:px-5">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0D2D22] border border-[#1C4D3C] p-0.5 shadow-xs overflow-hidden">
                  <img src="/logo.png" alt="B-LIFFE" className="h-full w-full object-contain" />
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
              {/* 1. Projects & Field Hub */}
              <NavLink
                to="/projects"
                onClick={onClose}
                className={({ isActive }) =>
                  `group flex items-center justify-between rounded-2xl px-3.5 py-3 transition-colors ${isActive
                    ? 'bg-[#133D2F] border border-[#1C4D3C] text-[#A6F16A]'
                    : 'text-[#F0F5EF] hover:bg-[#0D2D22] border border-transparent'
                  }`
                }
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#133D2F] border border-[#1C4D3C] text-[#A6F16A]">
                    <FolderGit2 className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-sm font-semibold leading-snug">Projects & Field Hub</span>
                    <span className="block text-[11px] text-[#B2C8BA] truncate">
                      Explore and join biodiversity projects.
                    </span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-[#7B9586] group-hover:text-[#A6F16A] ml-2" />
              </NavLink>

              {/* 2. My Joined Projects */}
              <NavLink
                to="/my-projects"
                onClick={onClose}
                className={({ isActive }) =>
                  `group flex items-center justify-between rounded-2xl px-3.5 py-3 transition-colors ${isActive
                    ? 'bg-[#133D2F] border border-[#1C4D3C] text-[#20D6A0]'
                    : 'text-[#F0F5EF] hover:bg-[#0D2D22] border border-transparent'
                  }`
                }
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#133D2F] border border-[#1C4D3C] text-[#20D6A0]">
                    <BookmarkCheck className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-sm font-semibold leading-snug">My Joined Projects</span>
                    <span className="block text-[11px] text-[#B2C8BA] truncate">
                      Access your project activities.
                    </span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-[#7B9586] group-hover:text-[#A6F16A] ml-2" />
              </NavLink>

              {/* 3. Field Guide & Help */}
              <button
                type="button"
                onClick={() => setSubView('faq')}
                className="group w-full flex items-center justify-between rounded-2xl px-3.5 py-3 text-left transition-colors text-[#F0F5EF] hover:bg-[#0D2D22] border border-transparent cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#133D2F] border border-[#1C4D3C] text-[#A6F16A]">
                    <BookOpen className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-sm font-semibold leading-snug">Field Guide & Help</span>
                    <span className="block text-[11px] text-[#B2C8BA] truncate">
                      Recording instructions and FAQs.
                    </span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-[#7B9586] group-hover:text-[#A6F16A] ml-2" />
              </button>

              {/* 4. About B-LIFFE */}
              <button
                type="button"
                onClick={() => setSubView('about')}
                className="group w-full flex items-center justify-between rounded-2xl px-3.5 py-3 text-left transition-colors text-[#F0F5EF] hover:bg-[#0D2D22] border border-transparent cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#133D2F] border border-[#1C4D3C] text-[#20D6A0]">
                    <Leaf className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="flex items-center gap-1.5 text-sm font-semibold leading-snug">
                      About <BrandName className="text-sm" />
                    </span>
                    <span className="block text-[11px] text-[#B2C8BA] truncate">
                      Mission, features and conservation goals.
                    </span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-[#7B9586] group-hover:text-[#A6F16A] ml-2" />
              </button>

              {/* 5. Settings */}
              <button
                type="button"
                onClick={() => setSubView('settings')}
                className="group w-full flex items-center justify-between rounded-2xl px-3.5 py-3 text-left transition-colors text-[#F0F5EF] hover:bg-[#0D2D22] border border-transparent cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#133D2F] border border-[#1C4D3C] text-[#A6F16A]">
                    <Sliders className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-sm font-semibold leading-snug">Settings</span>
                    <span className="block text-[11px] text-[#B2C8BA] truncate">
                      Preferences and appearance.
                    </span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-[#7B9586] group-hover:text-[#A6F16A] ml-2" />
              </button>

              {/* 6. Offline Data & Sync */}
              <button
                type="button"
                onClick={() => setSubView('sync')}
                className="group w-full flex items-center justify-between rounded-2xl px-3.5 py-3 text-left transition-colors text-[#F0F5EF] hover:bg-[#0D2D22] border border-transparent cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#133D2F] border border-[#1C4D3C] text-[#20D6A0]">
                    <Database className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="block text-sm font-semibold leading-snug">Offline Data & Sync</span>
                      {localObservationCount !== null && (
                        <span className="rounded-full bg-[#133D2F] px-2 py-0.5 text-[10px] font-semibold text-[#A6F16A] border border-[#1C4D3C]">
                          {localObservationCount} on device
                        </span>
                      )}
                    </div>
                    <span className="block text-[11px] text-[#B2C8BA] truncate">
                      Saved data and synchronisation status.
                    </span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-[#7B9586] group-hover:text-[#A6F16A] ml-2" />
              </button>

              {/* 7. Privacy & Data Sharing */}
              <button
                type="button"
                onClick={() => setSubView('privacy')}
                className="group w-full flex items-center justify-between rounded-2xl px-3.5 py-3 text-left transition-colors text-[#F0F5EF] hover:bg-[#0D2D22] border border-transparent cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#133D2F] border border-[#1C4D3C] text-[#A6F16A]">
                    <ShieldCheck className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-sm font-semibold leading-snug">Privacy & Data Sharing</span>
                    <span className="block text-[11px] text-[#B2C8BA] truncate">
                      Understand how observation data is handled.
                    </span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-[#7B9586] group-hover:text-[#A6F16A] ml-2" />
              </button>

              {/* 8. My Profile */}
              <NavLink
                to="/profile"
                onClick={handleClose}
                className={({ isActive }) =>
                  `group flex items-center justify-between rounded-2xl px-3.5 py-3 transition-colors ${isActive
                    ? 'bg-[#133D2F] border border-[#1C4D3C] text-[#A6F16A]'
                    : 'text-[#F0F5EF] hover:bg-[#0D2D22] border border-transparent'
                  }`
                }
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#133D2F] border border-[#1C4D3C] text-[#A6F16A]">
                    <User className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-sm font-semibold leading-snug">My Profile</span>
                    <span className="block text-[11px] text-[#B2C8BA] truncate">
                      Manage avatar, display name, and bio.
                    </span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-[#7B9586] group-hover:text-[#A6F16A] ml-2" />
              </NavLink>

              {/* 9. Account & Opening Tour */}
              <NavLink
                to="/welcome"
                onClick={handleClose}
                className="group w-full flex items-center justify-between rounded-2xl px-3.5 py-3 text-left transition-colors text-[#F0F5EF] hover:bg-[#0D2D22] border border-transparent cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#133D2F] border border-[#1C4D3C] text-[#20D6A0]">
                    <User className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-sm font-semibold leading-snug">Sign In & Welcome Tour</span>
                    <span className="block text-[11px] text-[#B2C8BA] truncate">
                      Opening splash, login, and registration.
                    </span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-[#7B9586] group-hover:text-[#A6F16A] ml-2" />
              </NavLink>
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
