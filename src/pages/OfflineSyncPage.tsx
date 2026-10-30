import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  Database,
  Cloud,
  CloudOff,
  HardDrive,
  CheckCircle2,
  AlertCircle,
  Camera,
  MapPin,
  FolderGit2,
  RefreshCw,
  Sparkles,
} from 'lucide-react'
import { db } from '@/db/database'
import { fetchSyncStatus, syncAllStoresWithBackend, type SyncStatusResult } from '@/lib/apiService'

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
    title: 'Field Photographs (Stored Locally & Cloud-Synced)',
    description:
      'Attached photographs are converted to binary Blobs inside IndexedDB and synced as optimized attachments to NeoDB PostgreSQL.',
  },
  {
    icon: MapPin,
    iconColor: 'text-[#A6F16A]',
    title: 'Hardware GPS Geolocation & GIS Ward Identification',
    description:
      "Receives satellite signals directly from device hardware and performs official Thiruvananthapuram Corporation ward matching online or offline.",
  },
] as const

interface OfflineSyncPageProps {
  onBack?: () => void
}

export default function OfflineSyncPage({ onBack }: OfflineSyncPageProps) {
  const [observationCount, setObservationCount] = useState<number | null>(null)
  const [projectCount, setProjectCount] = useState<number | null>(null)
  const [surveyCount, setSurveyCount] = useState<number | null>(null)
  const [pendingCount, setPendingCount] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)

  // Remote NeoDB Sync state
  const [syncStatus, setSyncStatus] = useState<SyncStatusResult | null>(null)
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncFeedback, setSyncFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const loadData = async () => {
    try {
      const [obsCount, projCount, survCount, pendingObs, pendingProj] = await Promise.all([
        db.observations.count(),
        db.projects.count(),
        db.surveys.count(),
        db.observations.where('syncStatus').equals('pending').count(),
        db.projects.where('syncStatus').equals('pending').count(),
      ])
      setObservationCount(obsCount)
      setProjectCount(projCount)
      setSurveyCount(survCount)
      setPendingCount(pendingObs + pendingProj)

      const status = await fetchSyncStatus()
      setSyncStatus(status)
    } catch (err) {
      console.error('Failed to load storage counts:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleTriggerSync = async () => {
    setIsSyncing(true)
    setSyncFeedback(null)
    try {
      const result = await syncAllStoresWithBackend()
      if (result.success) {
        setSyncFeedback({
          type: 'success',
          message: `Synchronized ${result.synced.projects} projects, ${result.synced.wards} wards, ${result.synced.surveys} surveys, and ${result.synced.observations} observations with NeoDB!`,
        })
      } else {
        setSyncFeedback({
          type: 'error',
          message: result.error || 'Failed to synchronize with server. Local changes are safe.',
        })
      }
      await loadData()
    } catch (err) {
      setSyncFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Synchronization failed',
      })
    } finally {
      setIsSyncing(false)
    }
  }

  const isOnline = syncStatus?.status === 'online'

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
            Local IndexedDB & NeoDB PostgreSQL synchronization
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

      {/* Sync Status Feedback */}
      {syncFeedback && (
        <div
          className={`p-3.5 rounded-2xl border text-xs flex items-start gap-2.5 ${
            syncFeedback.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
              : 'bg-rose-950/60 border-rose-500/40 text-rose-200'
          }`}
        >
          {syncFeedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          )}
          <span>{syncFeedback.message}</span>
        </div>
      )}

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

          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${
              isOnline
                ? 'bg-emerald-950/70 text-emerald-300 border-emerald-800/70'
                : 'bg-amber-950/70 text-amber-300 border-amber-800/70'
            }`}
          >
            {isOnline ? (
              <>
                <Cloud className="w-3.5 h-3.5 text-emerald-400" />
                <span>NeoDB Online</span>
              </>
            ) : (
              <>
                <CloudOff className="w-3.5 h-3.5 text-amber-400" />
                <span>Offline Cache</span>
              </>
            )}
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
              NeoDB Cloud Store
            </span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="font-mono text-2xl font-extrabold text-[#B2C8BA]">
                {isLoading ? '...' : (syncStatus?.counts?.observations ?? 0)}
              </span>
              <span className="text-xs text-[#7B9586]">records</span>
            </div>
            <div className="mt-2 flex items-center gap-1 text-[11px] font-medium text-[#A6F16A]">
              <Sparkles className="h-3 w-3 shrink-0" />
              <span>{isOnline ? 'PostgreSQL Connected' : 'Server Reachable Pending'}</span>
            </div>
          </div>
        </div>

        {/* Sync Action Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleTriggerSync}
            disabled={isSyncing}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-[#A6F16A] to-[#20D6A0] text-[#061812] font-bold text-sm shadow-md hover:opacity-95 active:scale-[0.98] transition-all disabled:opacity-60 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing to NeoDB...' : pendingCount > 0 ? `Sync ${pendingCount} Pending to NeoDB` : 'Sync All Stores to NeoDB'}</span>
          </button>
        </div>

        {/* Additional Counts */}
        <div className="pt-2 border-t border-[#1C4D3C] text-xs text-[#B2C8BA] space-y-1.5">
          <div className="flex justify-between">
            <span className="flex items-center gap-1.5 text-[#7B9586]">
              <FolderGit2 className="h-3.5 w-3.5 text-[#A6F16A]" />
              <span>Registered Projects:</span>
            </span>
            <span className="font-mono font-medium text-white">
              {isLoading ? '...' : `${projectCount ?? 0} (Device) / ${syncStatus?.counts?.projects ?? 0} (NeoDB)`}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="flex items-center gap-1.5 text-[#7B9586]">
              <MapPin className="h-3.5 w-3.5 text-[#20D6A0]" />
              <span>Field Surveys:</span>
            </span>
            <span className="font-mono font-medium text-white">
              {isLoading ? '...' : `${surveyCount ?? 0} (Device) / ${syncStatus?.counts?.surveys ?? 0} (NeoDB)`}
            </span>
          </div>
        </div>
      </div>

      {/* Operational Offline Capabilities */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#A6F16A]">
          Operational Field Data Capabilities
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
