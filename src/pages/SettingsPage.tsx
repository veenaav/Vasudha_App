import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  Sliders,
  Database,
  Map,
  CloudOff,
  SunMoon,
  Info,
  CheckCircle2,
  Clock,
} from 'lucide-react'

interface SettingsPageProps {
  onBack?: () => void
}

export default function SettingsPage({ onBack }: SettingsPageProps) {
  return (
    <div className="mx-auto max-w-lg px-4 py-5 sm:px-6 space-y-5 text-slate-800">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#165B33]">
            Configuration & Preferences
          </span>
          <h1 className="font-heading text-2xl sm:text-[28px] font-semibold tracking-wide text-slate-900 mt-0.5">
            Settings
          </h1>
        </div>

        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-medium tracking-wider uppercase text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back</span>
          </button>
        ) : (
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold tracking-wider uppercase text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Dashboard</span>
          </Link>
        )}
      </div>

      <p className="text-xs text-slate-600 leading-relaxed">
        Manage your local storage, display options, and integration preferences. In accordance with
        B-LIFFE&apos;s field-data transparency principles, all working options and planned features
        are clearly labelled.
      </p>

      {/* Settings Categories Container */}
      <div className="space-y-4">
        {/* 1. App Preferences */}
        <section className="rounded-3xl border border-[#DCD5C5] bg-[#FAF7F0] p-5 shadow-xl text-[#263D2B]">
          <div className="flex items-center justify-between border-b border-[#DCD5C5] pb-2.5">
            <div className="flex items-center gap-2">
              <Sliders className="h-5 w-5 text-[#263D2B]" />
              <h2 className="font-heading text-base font-normal tracking-wider uppercase text-[#263D2B]">
                App Preferences
              </h2>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#E5EFE4] border border-[#C5D1BD] px-2.5 py-0.5 text-[10px] font-semibold text-[#263D2B] uppercase">
              <CheckCircle2 className="h-3 w-3 text-[#263D2B]" />
              Active
            </span>
          </div>

          <div className="mt-3.5 space-y-2.5 text-xs sm:text-sm text-[#414B32]">
            <div className="flex items-start gap-2.5">
              <Database className="h-4 w-4 text-[#263D2B] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-[#263D2B]">Storage Engine: Local IndexedDB</p>
                <p className="text-xs text-[#414B32]/85 leading-relaxed mt-0.5">
                  All observations, full-resolution photographs, and GPS metadata are preserved
                  securely on your local device. Records persist even without network connectivity.
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-[#EDE7DA] p-3 border border-[#DCD5C5] text-xs space-y-1">
              <div className="flex justify-between font-medium text-[#263D2B]">
                <span>Local Database Status:</span>
                <span className="font-mono font-semibold text-[#263D2B]">Online & Active</span>
              </div>
              <p className="text-[11px] text-[#414B32]/80">
                Data is isolated to this browser instance and not shared externally.
              </p>
            </div>
          </div>
        </section>

        {/* 2. Offline Map Management */}
        <section className="rounded-3xl border border-[#DCD5C5] bg-[#FAF7F0] p-5 shadow-xl text-[#263D2B]">
          <div className="flex items-center justify-between border-b border-[#DCD5C5] pb-2.5">
            <div className="flex items-center gap-2">
              <Map className="h-5 w-5 text-[#263D2B]" />
              <h2 className="font-heading text-base font-normal tracking-wider uppercase text-[#263D2B]">
                Offline Map Management
              </h2>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 border border-amber-300 px-2.5 py-0.5 text-[10px] font-semibold text-amber-800 uppercase">
              <Clock className="h-3 w-3 text-amber-800" />
              Planned Feature
            </span>
          </div>

          <div className="mt-3 space-y-2 text-xs text-[#414B32]">
            <p className="leading-relaxed">
              Offline vector tile packaging and basemap caching for deep forest reserves and remote
              sanctuaries are planned for future updates.
            </p>
            <div className="rounded-xl bg-[#EDE7DA] p-3 border border-[#DCD5C5] text-xs flex items-start gap-2 text-[#414B32]">
              <Info className="h-4 w-4 text-[#263D2B] shrink-0 mt-0.5" />
              <p className="leading-relaxed text-[11px]">
                <strong>Current Capability:</strong> Geolocation coordinates (latitude, longitude,
                accuracy) are acquired directly via your device&apos;s native GPS sensor without requiring
                an active basemap or internet connection.
              </p>
            </div>
          </div>
        </section>

        {/* 3. Account Synchronisation */}
        <section className="rounded-3xl border border-[#DCD5C5] bg-[#FAF7F0] p-5 shadow-xl text-[#263D2B]">
          <div className="flex items-center justify-between border-b border-[#DCD5C5] pb-2.5">
            <div className="flex items-center gap-2">
              <CloudOff className="h-5 w-5 text-[#263D2B]" />
              <h2 className="font-heading text-base font-normal tracking-wider uppercase text-[#263D2B]">
                Account Synchronisation
              </h2>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 border border-amber-300 px-2.5 py-0.5 text-[10px] font-semibold text-amber-800 uppercase">
              <Clock className="h-3 w-3 text-amber-800" />
              Planned Feature
            </span>
          </div>

          <div className="mt-3 space-y-2 text-xs text-[#414B32]">
            <p className="leading-relaxed">
              Cloud account authentication and synchronization with institutional biodiversity
              registries are planned.
            </p>
            <div className="rounded-xl bg-[#EDE7DA] p-3 border border-[#DCD5C5] text-xs flex items-start gap-2 text-[#414B32]">
              <Info className="h-4 w-4 text-[#263D2B] shrink-0 mt-0.5" />
              <p className="leading-relaxed text-[11px]">
                <strong>Current Architecture:</strong> B LIFFE currently operates in a local-first,
                privacy-respecting mode. No personal account registration or server login is required to
                conduct surveys or record observations.
              </p>
            </div>
          </div>
        </section>

        {/* 4. Light and Dark Theme Preferences */}
        <section className="rounded-3xl border border-[#DCD5C5] bg-[#FAF7F0] p-5 shadow-xl text-[#263D2B]">
          <div className="flex items-center justify-between border-b border-[#DCD5C5] pb-2.5">
            <div className="flex items-center gap-2">
              <SunMoon className="h-5 w-5 text-[#263D2B]" />
              <h2 className="font-heading text-base font-normal tracking-wider uppercase text-[#263D2B]">
                Theme Preferences
              </h2>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#E5EFE4] border border-[#C5D1BD] px-2.5 py-0.5 text-[10px] font-semibold text-[#263D2B] uppercase">
              <CheckCircle2 className="h-3 w-3 text-[#263D2B]" />
              Nature Palette Active
            </span>
          </div>

          <div className="mt-3 space-y-2 text-xs text-[#414B32]">
            <p className="leading-relaxed">
              The application uses an optimized, outdoor-contrast living biodiversity theme (luminous
              pearl canvas `#F8FAF7`, botanical emerald green `#165B33`, warm saffron orange `#EA580C`,
              and crisp off-white cards) specifically engineered for field readability in direct daylight.
            </p>
            <p className="text-[11px] text-[#414B32]/75 italic">
              Manual toggle between alternate light and dark themes is planned for subsequent releases.
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
