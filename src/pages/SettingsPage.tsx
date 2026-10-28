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
import BrandName from '@/components/BrandName'

interface SettingsPageProps {
  onBack?: () => void
}

export default function SettingsPage({ onBack }: SettingsPageProps) {
  return (
    <div className="mx-auto max-w-lg px-4 py-5 sm:px-6 space-y-5 text-[#F0F5EF]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1C4D3C] pb-4">
        <div>
          <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#A6F16A]">
            Configuration & Preferences
          </span>
          <h1 className="text-2xl sm:text-[28px] font-extrabold tracking-tight text-white mt-0.5">
            Settings
          </h1>
        </div>

        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#1C4D3C] bg-[#0D2D22] px-3.5 py-1.5 text-xs font-semibold tracking-wider uppercase text-[#B2C8BA] hover:text-white hover:bg-[#133D2F] transition-colors shadow-xs"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back</span>
          </button>
        ) : (
          <Link
            to="/home"
            className="inline-flex items-center gap-1.5 rounded-full border border-[#1C4D3C] bg-[#0D2D22] px-3.5 py-1.5 text-xs font-semibold tracking-wider uppercase text-[#B2C8BA] hover:text-white hover:bg-[#133D2F] transition-colors shadow-xs"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Dashboard</span>
          </Link>
        )}
      </div>

      <p className="text-xs text-[#B2C8BA] leading-relaxed">
        Manage your local storage, display options, and integration preferences. In accordance with{' '}
        <BrandName />&apos;s field-data transparency principles, all working options and planned features
        are clearly labelled.
      </p>

      {/* Settings Categories Container */}
      <div className="space-y-4">
        {/* 1. App Preferences */}
        <section className="rounded-3xl border border-[#1C4D3C] bg-[#0D2D22] p-5 shadow-xl shadow-[#061812]/50 text-[#F0F5EF]">
          <div className="flex items-center justify-between border-b border-[#1C4D3C] pb-2.5">
            <div className="flex items-center gap-2">
              <Sliders className="h-5 w-5 text-[#A6F16A]" />
              <h2 className="text-base font-bold tracking-wide text-white uppercase">
                App Preferences
              </h2>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#133D2F] border border-[#1C4D3C] px-2.5 py-0.5 text-[10px] font-semibold text-[#A6F16A] uppercase">
              <CheckCircle2 className="h-3 w-3 text-[#A6F16A]" />
              Active
            </span>
          </div>

          <div className="mt-3.5 space-y-2.5 text-xs sm:text-sm text-[#B2C8BA]">
            <div className="flex items-start gap-2.5">
              <Database className="h-4 w-4 text-[#20D6A0] shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white">Storage Engine: Local IndexedDB</p>
                <p className="text-xs text-[#7B9586] leading-relaxed mt-0.5">
                  All observations, full-resolution photographs, and GPS metadata are preserved
                  securely on your local device. Records persist even without network connectivity.
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-[#061812] p-3 border border-[#1C4D3C] text-xs space-y-1">
              <div className="flex justify-between font-medium text-white">
                <span>Local Database Status:</span>
                <span className="font-mono font-bold text-[#A6F16A]">Online & Active</span>
              </div>
              <p className="text-[11px] text-[#7B9586]">
                Data is isolated to this browser instance and not shared externally.
              </p>
            </div>
          </div>
        </section>

        {/* 2. Offline Map Management */}
        <section className="rounded-3xl border border-[#1C4D3C] bg-[#0D2D22] p-5 shadow-xl shadow-[#061812]/50 text-[#F0F5EF]">
          <div className="flex items-center justify-between border-b border-[#1C4D3C] pb-2.5">
            <div className="flex items-center gap-2">
              <Map className="h-5 w-5 text-[#20D6A0]" />
              <h2 className="text-base font-bold tracking-wide text-white uppercase">
                Offline Map Management
              </h2>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-950/60 border border-amber-800/60 px-2.5 py-0.5 text-[10px] font-semibold text-amber-300 uppercase">
              <Clock className="h-3 w-3 text-amber-300" />
              Planned Feature
            </span>
          </div>

          <div className="mt-3 space-y-2 text-xs text-[#B2C8BA]">
            <p className="leading-relaxed">
              Offline vector tile packaging and basemap caching for deep forest reserves and remote
              sanctuaries are planned for future updates.
            </p>
            <div className="rounded-2xl bg-[#061812] p-3 border border-[#1C4D3C] text-xs flex items-start gap-2 text-[#7B9586]">
              <Info className="h-4 w-4 text-[#A6F16A] shrink-0 mt-0.5" />
              <p className="leading-relaxed text-[11px]">
                <strong className="text-white">Current Capability:</strong> Geolocation coordinates (latitude, longitude,
                accuracy) are acquired directly via your device&apos;s native GPS sensor without requiring
                an active basemap or internet connection.
              </p>
            </div>
          </div>
        </section>

        {/* 3. Account Synchronisation */}
        <section className="rounded-3xl border border-[#1C4D3C] bg-[#0D2D22] p-5 shadow-xl shadow-[#061812]/50 text-[#F0F5EF]">
          <div className="flex items-center justify-between border-b border-[#1C4D3C] pb-2.5">
            <div className="flex items-center gap-2">
              <CloudOff className="h-5 w-5 text-[#A6F16A]" />
              <h2 className="text-base font-bold tracking-wide text-white uppercase">
                Account Synchronisation
              </h2>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-950/60 border border-amber-800/60 px-2.5 py-0.5 text-[10px] font-semibold text-amber-300 uppercase">
              <Clock className="h-3 w-3 text-amber-300" />
              Planned Feature
            </span>
          </div>

          <div className="mt-3 space-y-2 text-xs text-[#B2C8BA]">
            <p className="leading-relaxed">
              Cloud account authentication and synchronization with institutional biodiversity
              registries are planned.
            </p>
            <div className="rounded-2xl bg-[#061812] p-3 border border-[#1C4D3C] text-xs flex items-start gap-2 text-[#7B9586]">
              <Info className="h-4 w-4 text-[#20D6A0] shrink-0 mt-0.5" />
              <p className="leading-relaxed text-[11px]">
                <strong className="text-white">Current Architecture:</strong> <BrandName /> currently operates in a local-first,
                privacy-respecting mode. All records remain encrypted locally on this device.
              </p>
            </div>
          </div>
        </section>

        {/* 4. Living Nature Theme Preferences */}
        <section className="rounded-3xl border border-[#1C4D3C] bg-[#0D2D22] p-5 shadow-xl shadow-[#061812]/50 text-[#F0F5EF]">
          <div className="flex items-center justify-between border-b border-[#1C4D3C] pb-2.5">
            <div className="flex items-center gap-2">
              <SunMoon className="h-5 w-5 text-[#A6F16A]" />
              <h2 className="text-base font-bold tracking-wide text-white uppercase">
                Nature Theme
              </h2>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#133D2F] border border-[#1C4D3C] px-2.5 py-0.5 text-[10px] font-semibold text-[#A6F16A] uppercase">
              <CheckCircle2 className="h-3 w-3 text-[#A6F16A]" />
              Active
            </span>
          </div>

          <div className="mt-3 space-y-2 text-xs text-[#B2C8BA]">
            <p className="leading-relaxed">
              The application uses an immersive dark forest-green nature theme (`#061812`, `#08221A`, `#0D2D22`)
              with vivid lime-to-turquoise gradient CTAs (`#A6F16A` to `#20D6A0`), engineered for stunning visual depth
              and mobile battery efficiency.
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
