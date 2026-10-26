import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  Database,
  CloudOff,
  HardDrive,
  CheckCircle2,
  AlertCircle,
  Camera,
  MapPin,
  FolderGit2,
} from 'lucide-react'
import { db } from '@/db/database'

interface OfflineSyncPageProps {
  onBack?: () => void
}

export default function OfflineSyncPage({ onBack }: OfflineSyncPageProps) {
  const [observationCount, setObservationCount] = useState<number | null>(null)
  const [projectCount, setProjectCount] = useState<number | null>(null)
  const [surveyCount, setSurveyCount] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const loadCounts = async () => {
      try {
        const [obsCount, projCount, survCount] = await Promise.all([
          db.observations.count(),
          db.projects.count(),
          db.surveys.count(),
        ])
        if (isMounted) {
          setObservationCount(obsCount)
          setProjectCount(projCount)
          setSurveyCount(survCount)
        }
      } catch (err) {
        console.error('Failed to load storage counts:', err)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    loadCounts()
    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div className="mx-auto max-w-lg px-4 py-5 sm:px-6 space-y-5 text-slate-800">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#165B33]">
            Data Management & Sync
          </span>
          <h1 className="font-heading text-2xl sm:text-[28px] font-semibold tracking-wide text-slate-900 mt-0.5">
            Offline Data & Sync
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Saved data and synchronisation status
          </p>
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

      {/* Real Local Storage vs Server Sync Breakdown */}
      <div className="rounded-3xl border border-[#DCD5C5] bg-[#FAF7F0] p-5 sm:p-6 shadow-xl text-[#263D2B] space-y-4">
        <div className="flex items-center justify-between border-b border-[#DCD5C5] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#263D2B] text-[#F5F0E4]">
              <Database className="h-5 w-5 text-[#C5D1BD]" />
            </div>
            <div>
              <h2 className="font-heading text-lg font-normal text-[#263D2B]">
                Device Storage Audit
              </h2>
              <p className="text-xs text-[#414B32]">
                Actual records stored on this physical device
              </p>
            </div>
          </div>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="rounded-2xl bg-[#EDE7DA] p-3.5 border border-[#DCD5C5]">
            <span className="block text-[10px] font-semibold tracking-wider uppercase text-[#414B32]">
              On-Device Records
            </span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="font-mono text-2xl font-bold text-[#263D2B]">
                {isLoading ? '...' : (observationCount ?? 0)}
              </span>
              <span className="text-xs text-[#414B32]">observations</span>
            </div>
            <div className="mt-2 flex items-center gap-1 text-[11px] font-medium text-emerald-800">
              <CheckCircle2 className="h-3 w-3 shrink-0" />
              <span>Saved in IndexedDB</span>
            </div>
          </div>

          <div className="rounded-2xl bg-[#EDE7DA] p-3.5 border border-[#DCD5C5]">
            <span className="block text-[10px] font-semibold tracking-wider uppercase text-[#414B32]">
              Synced to Server
            </span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="font-mono text-2xl font-bold text-[#263D2B]">0</span>
              <span className="text-xs text-[#414B32]">records</span>
            </div>
            <div className="mt-2 flex items-center gap-1 text-[11px] font-medium text-amber-800">
              <CloudOff className="h-3 w-3 shrink-0" />
              <span>No Cloud Connected</span>
            </div>
          </div>
        </div>

        {/* Sync Status Banner */}
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
          <AlertCircle className="h-4 w-4 shrink-0 text-amber-700 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-semibold text-amber-900">
              Real Synchronisation Status: Local Only
            </p>
            <p className="text-amber-800/90 leading-relaxed text-[11px]">
              Data saved on this device has <strong>not</strong> been transmitted to any remote
              server. A backend synchronisation engine is planned for future institutional releases.
            </p>
          </div>
        </div>

        {/* Additional Counts */}
        <div className="pt-1 border-t border-[#DCD5C5] text-xs text-[#414B32] space-y-1.5">
          <div className="flex justify-between">
            <span className="flex items-center gap-1.5">
              <FolderGit2 className="h-3.5 w-3.5 text-[#263D2B]" />
              <span>Registered Projects:</span>
            </span>
            <span className="font-mono font-medium text-[#263D2B]">{isLoading ? '...' : (projectCount ?? 0)}</span>
          </div>
          <div className="flex justify-between">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-[#263D2B]" />
              <span>Field Surveys:</span>
            </span>
            <span className="font-mono font-medium text-[#263D2B]">{isLoading ? '...' : (surveyCount ?? 0)}</span>
          </div>
        </div>
      </div>

      {/* Offline Capabilities Clarity */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#165B33]">
          Operational Offline Capabilities
        </h3>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 space-y-2 text-xs shadow-xs">
          <div className="flex items-center gap-2 font-semibold text-slate-900">
            <HardDrive className="h-4 w-4 text-[#165B33]" />
            <span>Local IndexedDB Persistence (Active)</span>
          </div>
          <p className="text-slate-600 leading-relaxed">
            All observation records, taxonomy names, and ecology notes are committed directly to your
            browser&apos;s IndexedDB store on this device.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 space-y-2 text-xs shadow-xs">
          <div className="flex items-center gap-2 font-semibold text-slate-900">
            <Camera className="h-4 w-4 text-[#165B33]" />
            <span>Field Photographs (Stored Locally)</span>
          </div>
          <p className="text-slate-600 leading-relaxed">
            Attached photographs are converted to binary Blobs and stored inside IndexedDB. Photos
            remain viewable offline on this device.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 space-y-2 text-xs shadow-xs">
          <div className="flex items-center gap-2 font-semibold text-slate-900">
            <MapPin className="h-4 w-4 text-[#165B33]" />
            <span>Hardware GPS Geolocation (Active Offline)</span>
          </div>
          <p className="text-slate-600 leading-relaxed">
            Geolocation relies on your phone&apos;s onboard GPS hardware chip, receiving satellite
            signals directly without needing cellular data or internet coverage.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 space-y-2 text-xs shadow-xs">
          <div className="flex items-center gap-2 font-semibold text-slate-900">
            <CloudOff className="h-4 w-4 text-[#EA580C]" />
            <span>What Requires Internet Connectivity</span>
          </div>
          <p className="text-slate-600 leading-relaxed">
            Interactive map base layer tile loading and future remote registry submissions require
            active network connections.
          </p>
        </div>
      </div>
    </div>
  )
}
