import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  Database,
  HardDrive,
  CheckCircle2,
  Camera,
  MapPin,
  FolderGit2,
  Download,
  ShieldCheck,
} from 'lucide-react'
import { db } from '@/db/database'
import { downloadDarwinCoreExport } from '@/lib/darwinCoreExport'

interface OfflineSyncPageProps {
  onBack?: () => void
}

export default function OfflineSyncPage({ onBack }: OfflineSyncPageProps) {
  const [observationCount, setObservationCount] = useState<number | null>(null)
  const [projectCount, setProjectCount] = useState<number | null>(null)
  const [surveyCount, setSurveyCount] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadData = async () => {
    try {
      const [obsCount, projCount, survCount] = await Promise.all([
        db.observations.count(),
        db.projects.count(),
        db.surveys.count(),
      ])
      setObservationCount(obsCount)
      setProjectCount(projCount)
      setSurveyCount(survCount)
    } catch (err) {
      console.error('Failed to load storage counts:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleExportAll = async () => {
    try {
      const allObservations = await db.observations.toArray()
      downloadDarwinCoreExport(allObservations)
    } catch (err) {
      alert('Failed to export dataset: ' + (err instanceof Error ? err.message : 'Unknown error'))
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-5 sm:px-6 space-y-5 text-[#F0F5EF]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1C4D3C] pb-4">
        <div>
          <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#A6F16A]">
            Storage & Persistence
          </span>
          <h1 className="text-2xl sm:text-[28px] font-extrabold tracking-tight text-white mt-0.5">
            Offline Data & Storage
          </h1>
          <p className="text-xs text-[#B2C8BA] mt-0.5">
            Local device storage & IndexedDB persistence
          </p>
        </div>

        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#1C4D3C] bg-[#0D2D22] px-3.5 py-1.5 text-xs font-semibold tracking-wider uppercase text-[#B2C8BA] hover:text-white hover:bg-[#133D2F] transition-colors shadow-xs cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5 text-[#A6F16A]" />
            <span>Back</span>
          </button>
        ) : (
          <Link
            to="/home"
            className="inline-flex items-center gap-1.5 rounded-full border border-[#1C4D3C] bg-[#0D2D22] px-3.5 py-1.5 text-xs font-semibold tracking-wider uppercase text-[#B2C8BA] hover:text-white hover:bg-[#133D2F] transition-colors shadow-xs"
          >
            <ArrowLeft className="h-3.5 w-3.5 text-[#A6F16A]" />
            <span>Dashboard</span>
          </Link>
        )}
      </div>

      {/* Unified Storage Status Card */}
      <div className="rounded-3xl border border-[#1C4D3C] bg-[#0D2D22] p-5 sm:p-6 shadow-xl shadow-[#061812]/50 text-[#F0F5EF] space-y-4">
        <div className="flex items-center justify-between border-b border-[#1C4D3C] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#133D2F] text-[#A6F16A] border border-[#1C4D3C]">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                Local Device Storage
              </h2>
              <p className="text-xs text-[#7B9586]">
                Browser IndexedDB persistence
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border bg-emerald-950/70 text-emerald-300 border-emerald-800/70">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Active & Ready</span>
          </div>
        </div>

        {/* Unified Metrics Grid — Displayed Once */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="rounded-2xl bg-[#061812] p-3.5 border border-[#1C4D3C]">
            <span className="block text-[10px] font-semibold tracking-wider uppercase text-[#7B9586]">
              Observations
            </span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="font-mono text-2xl font-extrabold text-[#A6F16A]">
                {isLoading ? '...' : (observationCount ?? 0)}
              </span>
              <span className="text-xs text-[#B2C8BA]">records</span>
            </div>
            <div className="mt-2 flex items-center gap-1 text-[11px] font-medium text-[#20D6A0]">
              <CheckCircle2 className="h-3 w-3 shrink-0" />
              <span>Full metadata cached</span>
            </div>
          </div>

          <div className="rounded-2xl bg-[#061812] p-3.5 border border-[#1C4D3C]">
            <span className="block text-[10px] font-semibold tracking-wider uppercase text-[#7B9586]">
              Projects & Surveys
            </span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="font-mono text-2xl font-extrabold text-[#20D6A0]">
                {isLoading ? '...' : ((projectCount ?? 0) + (surveyCount ?? 0))}
              </span>
              <span className="text-xs text-[#B2C8BA]">entities</span>
            </div>
            <div className="mt-2 flex items-center gap-1 text-[11px] font-medium text-[#A6F16A]">
              <FolderGit2 className="h-3 w-3 shrink-0" />
              <span>{projectCount ?? 0} projects • {surveyCount ?? 0} surveys</span>
            </div>
          </div>
        </div>

        {/* Data Portability Action */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleExportAll}
            disabled={!observationCount}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-[#A6F16A] to-[#20D6A0] text-[#061812] font-bold text-sm shadow-md hover:opacity-95 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#061812]" />
            <span>Export Darwin Core (DwC) Dataset</span>
          </button>
        </div>
      </div>

      {/* Storage Architecture Overview — Clean & Concise */}
      <div className="rounded-3xl border border-[#1C4D3C] bg-[#0D2D22] p-5 sm:p-6 shadow-xl shadow-[#061812]/50 text-[#F0F5EF] space-y-3.5">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#A6F16A]">
          Storage Specifications
        </h3>

        <div className="space-y-3 text-xs text-[#B2C8BA]">
          <div className="flex items-start gap-3 rounded-2xl bg-[#061812] border border-[#1C4D3C] p-3.5">
            <HardDrive className="h-4 w-4 text-[#A6F16A] shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-white text-sm">IndexedDB Local Persistence</h4>
              <p className="mt-0.5 text-xs text-[#B2C8BA] leading-relaxed">
                All taxonomy names, Malayalam vernacular tags, and field notes are committed to local IndexedDB, providing complete offline resilience in wilderness areas.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-2xl bg-[#061812] border border-[#1C4D3C] p-3.5">
            <Camera className="h-4 w-4 text-[#20D6A0] shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-white text-sm">Binary Photo Blob Store</h4>
              <p className="mt-0.5 text-xs text-[#B2C8BA] leading-relaxed">
                Field photos are retained as high-fidelity binary Blobs directly in client storage with zero degradation, surviving browser reloads and offline sessions.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-2xl bg-[#061812] border border-[#1C4D3C] p-3.5">
            <MapPin className="h-4 w-4 text-[#A6F16A] shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-white text-sm">Automated EXIF GPS & GIS Matching</h4>
              <p className="mt-0.5 text-xs text-[#B2C8BA] leading-relaxed">
                Embedded photo EXIF coordinates and offline Corporation ward boundary polygons match administrative units automatically with zero manual pin adjustment.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-2xl bg-[#061812] border border-[#1C4D3C] p-3.5">
            <ShieldCheck className="h-4 w-4 text-[#20D6A0] shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-white text-sm">Cloud Infrastructure (Amazon RDS)</h4>
              <p className="mt-0.5 text-xs text-[#B2C8BA] leading-relaxed">
                When network connectivity is available, observation datasets sync to an institutional Amazon RDS relational registry for long-term archiving and validation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
