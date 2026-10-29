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

const OFFLINE_CAPABILITIES = [
  {
    icon: HardDrive,
    iconColor: 'text-[#A6F16A]',
    title: 'Local IndexedDB Persistence (Active)',
    description:
      "All observation records, taxonomy names, and ecology notes are committed directly to your browser's IndexedDB store on this device.",
  },
  {
    icon: Camera,
    iconColor: 'text-[#20D6A0]',
    title: 'Field Photographs (Stored Locally)',
    description:
      'Attached photographs are converted to binary Blobs and stored inside IndexedDB. Photos remain viewable offline on this device.',
  },
  {
    icon: MapPin,
    iconColor: 'text-[#A6F16A]',
    title: 'Hardware GPS Geolocation (Active Offline)',
    description:
      "Geolocation relies on your phone's onboard GPS hardware chip, receiving satellite signals directly without needing cellular data or internet coverage.",
  },
] as const

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
    <div className="mx-auto max-w-lg px-4 py-5 sm:px-6 space-y-5 text-[#F0F5EF]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1C4D3C] pb-4">
        <div>
          <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#A6F16A]">
            Data Management & Sync
          </span>
          <h1 className="text-2xl sm:text-[28px] font-extrabold tracking-tight text-white mt-0.5">
            Offline Data & Sync
          </h1>
          <p className="text-xs text-[#B2C8BA] mt-0.5">
            Saved data and synchronisation status
          </p>
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

      {/* Real Local Storage vs Server Sync Breakdown */}
      <div className="rounded-3xl border border-[#1C4D3C] bg-[#0D2D22] p-5 sm:p-6 shadow-xl shadow-[#061812]/50 text-[#F0F5EF] space-y-4">
        <div className="flex items-center justify-between border-b border-[#1C4D3C] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#133D2F] text-[#A6F16A] border border-[#1C4D3C]">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                Device Storage Audit
              </h2>
              <p className="text-xs text-[#7B9586]">
                Actual records stored on this physical device
              </p>
            </div>
          </div>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="rounded-2xl bg-[#061812] p-3.5 border border-[#1C4D3C]">
            <span className="block text-[10px] font-semibold tracking-wider uppercase text-[#7B9586]">
              On-Device Records
            </span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="font-mono text-2xl font-extrabold text-[#A6F16A]">
                {isLoading ? '...' : (observationCount ?? 0)}
              </span>
              <span className="text-xs text-[#B2C8BA]">records</span>
            </div>
            <div className="mt-2 flex items-center gap-1 text-[11px] font-medium text-[#20D6A0]">
              <CheckCircle2 className="h-3 w-3 shrink-0" />
              <span>Saved in IndexedDB</span>
            </div>
          </div>

          <div className="rounded-2xl bg-[#061812] p-3.5 border border-[#1C4D3C]">
            <span className="block text-[10px] font-semibold tracking-wider uppercase text-[#7B9586]">
              Synced to Server
            </span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="font-mono text-2xl font-extrabold text-[#B2C8BA]">0</span>
              <span className="text-xs text-[#7B9586]">records</span>
            </div>
            <div className="mt-2 flex items-center gap-1 text-[11px] font-medium text-amber-400">
              <CloudOff className="h-3 w-3 shrink-0" />
              <span>Local Storage Only</span>
            </div>
          </div>
        </div>

        {/* Sync Status Banner */}
        <div className="rounded-2xl border border-amber-800/60 bg-amber-950/40 p-3.5 text-xs text-amber-200 flex items-start gap-2.5">
          <AlertCircle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold text-amber-300">
              Real Synchronisation Status: Local Only
            </p>
            <p className="text-amber-200/90 leading-relaxed text-[11px]">
              Data saved on this device is committed locally to IndexedDB and has not been transmitted
              to any remote institutional registry.
            </p>
          </div>
        </div>

        {/* Additional Counts */}
        <div className="pt-2 border-t border-[#1C4D3C] text-xs text-[#B2C8BA] space-y-1.5">
          <div className="flex justify-between">
            <span className="flex items-center gap-1.5 text-[#7B9586]">
              <FolderGit2 className="h-3.5 w-3.5 text-[#A6F16A]" />
              <span>Registered Projects:</span>
            </span>
            <span className="font-mono font-medium text-white">{isLoading ? '...' : (projectCount ?? 0)}</span>
          </div>
          <div className="flex justify-between">
            <span className="flex items-center gap-1.5 text-[#7B9586]">
              <MapPin className="h-3.5 w-3.5 text-[#20D6A0]" />
              <span>Field Surveys:</span>
            </span>
            <span className="font-mono font-medium text-white">{isLoading ? '...' : (surveyCount ?? 0)}</span>
          </div>
        </div>
      </div>

      {/* Operational Offline Capabilities */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#A6F16A]">
          Operational Offline Capabilities
        </h3>

        {OFFLINE_CAPABILITIES.map((cap) => {
          const Icon = cap.icon
          return (
            <div
              key={cap.title}
              className="rounded-2xl border border-[#1C4D3C] bg-[#0D2D22] p-4 space-y-2 text-xs shadow-md shadow-[#061812]/50"
            >
              <div className="flex items-center gap-2 font-bold text-white">
                <Icon className={`h-4 w-4 ${cap.iconColor}`} />
                <span>{cap.title}</span>
              </div>
              <p className="text-[#B2C8BA] leading-relaxed">
                {cap.description}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
