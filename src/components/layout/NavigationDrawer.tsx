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
} from 'lucide-react'
import { db } from '@/db/database'
import SettingsPage from '@/pages/SettingsPage'
import AboutPage from '@/pages/AboutPage'
import FAQPage from '@/pages/FAQPage'
import OfflineSyncPage from '@/pages/OfflineSyncPage'
import PrivacyPage from '@/pages/PrivacyPage'

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

      {/* Drawer Surface: Side panel on desktop, comfortable drawer/sheet on mobile */}
      <aside
        className="relative ml-auto flex h-full w-full max-w-md flex-col border-l border-slate-200 bg-white/98 backdrop-blur-2xl text-slate-800 shadow-2xl overflow-hidden"
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
            <div className="relative z-10 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3.5 sm:px-5">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white border border-slate-200/80 p-0.5 shadow-xs overflow-hidden">
                  <img src="/logo.png" alt="B-liffe" className="h-full w-full object-contain" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-baseline font-sans font-extrabold text-lg tracking-normal leading-none">
                    <span style={{ color: '#39A935' }}>B</span>
                    <span style={{ color: '#39A935' }}>-</span>
                    <span style={{ color: '#39A935' }}>l</span>
                    <span style={{ color: '#39A935' }}>i</span>
                    <span style={{ color: '#F28C28' }}>f</span>
                    <span style={{ color: '#39A935' }}>f</span>
                    <span style={{ color: '#39A935' }}>e</span>
                  </div>
                  <p className="text-[10px] tracking-wider uppercase font-semibold text-slate-500 truncate mt-0.5">
                    Menu & Information
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all active:scale-95 focus:outline-none"
                aria-label="Close menu"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Scrollable Content - 7 Reorganised Menu Items in Exact Order */}
            <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-1.5">
              {/* 1. Projects & Field Hub */}
              <NavLink
                to="/projects"
                onClick={onClose}
                className={({ isActive }) =>
                  `group flex items-center justify-between rounded-2xl px-3.5 py-3 transition-colors ${isActive
                    ? 'bg-emerald-50 border border-emerald-200 text-[#165B33]'
                    : 'text-slate-800 hover:bg-slate-50 border border-transparent'
                  }`
                }
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-100 text-[#165B33]">
                    <FolderGit2 className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-sm font-semibold leading-snug">Projects & Field Hub</span>
                    <span className="block text-[11px] text-slate-500 truncate">
                      Explore and join biodiversity projects.
                    </span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-slate-600 ml-2" />
              </NavLink>

              {/* 2. My Joined Projects */}
              <NavLink
                to="/my-projects"
                onClick={onClose}
                className={({ isActive }) =>
                  `group flex items-center justify-between rounded-2xl px-3.5 py-3 transition-colors ${isActive
                    ? 'bg-orange-50 border border-orange-200 text-[#EA580C]'
                    : 'text-slate-800 hover:bg-slate-50 border border-transparent'
                  }`
                }
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-orange-50 border border-orange-100 text-[#EA580C]">
                    <BookmarkCheck className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-sm font-semibold leading-snug">My Joined Projects</span>
                    <span className="block text-[11px] text-slate-500 truncate">
                      Access your project activities.
                    </span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-slate-600 ml-2" />
              </NavLink>

              {/* 3. Field Guide & Help */}
              <button
                type="button"
                onClick={() => setSubView('faq')}
                className="group w-full flex items-center justify-between rounded-2xl px-3.5 py-3 text-left transition-colors text-slate-800 hover:bg-slate-50 border border-transparent"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-50 border border-blue-100 text-[#2563EB]">
                    <BookOpen className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-sm font-semibold leading-snug">Field Guide & Help</span>
                    <span className="block text-[11px] text-slate-500 truncate">
                      Recording instructions and FAQs.
                    </span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-slate-600 ml-2" />
              </button>

              {/* 4. About B-LIFFE */}
              <button
                type="button"
                onClick={() => setSubView('about')}
                className="group w-full flex items-center justify-between rounded-2xl px-3.5 py-3 text-left transition-colors text-slate-800 hover:bg-slate-50 border border-transparent"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-100 text-[#16A34A]">
                    <Leaf className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-sm font-semibold leading-snug">About B-LIFFE</span>
                    <span className="block text-[11px] text-slate-500 truncate">
                      Mission, features and conservation goals.
                    </span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-slate-600 ml-2" />
              </button>

              {/* 5. Settings */}
              <button
                type="button"
                onClick={() => setSubView('settings')}
                className="group w-full flex items-center justify-between rounded-2xl px-3.5 py-3 text-left transition-colors text-slate-800 hover:bg-slate-50 border border-transparent"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-50 border border-amber-100 text-[#D97706]">
                    <Sliders className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-sm font-semibold leading-snug">Settings</span>
                    <span className="block text-[11px] text-slate-500 truncate">
                      Preferences and appearance.
                    </span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-slate-600 ml-2" />
              </button>

              {/* 6. Offline Data & Sync */}
              <button
                type="button"
                onClick={() => setSubView('sync')}
                className="group w-full flex items-center justify-between rounded-2xl px-3.5 py-3 text-left transition-colors text-slate-800 hover:bg-slate-50 border border-transparent"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-teal-50 border border-teal-100 text-[#0D9488]">
                    <Database className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="block text-sm font-semibold leading-snug">Offline Data & Sync</span>
                      {localObservationCount !== null && (
                        <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-semibold text-[#0D9488] border border-teal-200">
                          {localObservationCount} on device
                        </span>
                      )}
                    </div>
                    <span className="block text-[11px] text-slate-500 truncate">
                      Saved data and synchronisation status.
                    </span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-slate-600 ml-2" />
              </button>

              {/* 7. Privacy & Data Sharing */}
              <button
                type="button"
                onClick={() => setSubView('privacy')}
                className="group w-full flex items-center justify-between rounded-2xl px-3.5 py-3 text-left transition-colors text-slate-800 hover:bg-slate-50 border border-transparent"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-50 border border-indigo-100 text-[#4F46E5]">
                    <ShieldCheck className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-sm font-semibold leading-snug">Privacy & Data Sharing</span>
                    <span className="block text-[11px] text-slate-500 truncate">
                      Understand how observation data is handled.
                    </span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-slate-600 ml-2" />
              </button>
            </div>

            {/* Drawer Footer */}
            <div className="border-t border-slate-200 bg-slate-50/80 px-4 py-3 text-center text-xs text-slate-600">
              <div className="flex items-baseline justify-center font-sans font-extrabold text-base tracking-normal leading-none">
                <span style={{ color: '#39A935' }}>B</span>
                <span style={{ color: '#39A935' }}>-</span>
                <span style={{ color: '#39A935' }}>l</span>
                <span style={{ color: '#39A935' }}>i</span>
                <span style={{ color: '#F28C28' }}>f</span>
                <span style={{ color: '#39A935' }}>f</span>
                <span style={{ color: '#39A935' }}>e</span>
              </div>
              <p className="text-[10px] text-slate-500 font-normal mt-0.5">
                Bharat Local Informatics for Flora, Fauna, and Ecosystems
              </p>
            </div>
          </>
        )}
      </aside>
    </div>
  )
}
