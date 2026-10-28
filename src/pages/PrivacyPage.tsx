import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  ShieldCheck,
  Database,
  MapPin,
  Camera,
  Share2,
  Trash2,
  EyeOff,
} from 'lucide-react'
import BrandName from '@/components/BrandName'

interface PrivacyPageProps {
  onBack?: () => void
}

export default function PrivacyPage({ onBack }: PrivacyPageProps) {
  return (
    <div className="mx-auto max-w-lg px-4 py-5 sm:px-6 space-y-5 text-[#F0F5EF]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1C4D3C]/70 pb-4">
        <div>
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#A6F16A]">
            Data Governance & Ethics
          </span>
          <h1 className="font-heading text-2xl sm:text-[28px] font-bold tracking-wide text-white mt-0.5">
            Privacy & Data Sharing
          </h1>
          <p className="text-xs text-[#B2C8BA] mt-0.5">
            Understand how observation data is handled
          </p>
        </div>

        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#1C4D3C] bg-[#0D2D22] px-3.5 py-1.5 text-xs font-semibold tracking-wider uppercase text-[#F0F5EF] hover:bg-[#133D2F] transition-colors shadow-xs"
          >
            <ArrowLeft className="h-3.5 w-3.5 text-[#A6F16A]" />
            <span>Back</span>
          </button>
        ) : (
          <Link
            to="/home"
            className="inline-flex items-center gap-1.5 rounded-full border border-[#1C4D3C] bg-[#0D2D22] px-3.5 py-1.5 text-xs font-semibold tracking-wider uppercase text-[#F0F5EF] hover:bg-[#133D2F] transition-colors shadow-xs"
          >
            <ArrowLeft className="h-3.5 w-3.5 text-[#A6F16A]" />
            <span>Dashboard</span>
          </Link>
        )}
      </div>

      {/* Summary Principle Card */}
      <div className="rounded-3xl border border-[#1C4D3C] bg-[#0D2D22] p-5 sm:p-6 shadow-xl text-[#F0F5EF] space-y-3">
        <div className="flex items-center gap-3 border-b border-[#1C4D3C]/70 pb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#061812] border border-[#1C4D3C] text-[#A6F16A]">
            <ShieldCheck className="h-5 w-5 text-[#A6F16A]" />
          </div>
          <div>
            <h2 className="font-heading text-lg font-bold text-white">
              Local-First Data Privacy
            </h2>
            <p className="text-xs text-[#A6F16A]">
              Field records remain solely under your control
            </p>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-[#B2C8BA] leading-relaxed">
          <BrandName /> operates as a <strong className="text-white">local-first client application</strong>. All field records,
          coordinates, and photographs you collect reside on your device in browser-managed local
          storage (IndexedDB). No observation data is transmitted across the internet without your explicit knowledge.
        </p>
      </div>

      {/* Structured Sections Based Strictly on Code Implementation */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#A6F16A]">
          Data Collection & Handling Practices
        </h3>

        {/* 1. What Data Is Collected */}
        <div className="rounded-2xl border border-[#1C4D3C] bg-[#0D2D22] p-4 space-y-2 text-xs shadow-xs">
          <div className="flex items-center gap-2 font-semibold text-white">
            <MapPin className="h-4 w-4 text-[#A6F16A]" />
            <span>1. GPS Coordinates & Location Data</span>
          </div>
          <p className="text-[#B2C8BA] leading-relaxed">
            Location data (latitude, longitude, and accuracy radius) is acquired <em className="text-white">only</em> when you
            explicitly tap <strong className="text-white">&quot;Acquire Coordinates&quot;</strong>. B-LIFFE does not run
            background location services, continuous tracking, or route tracking.
          </p>
        </div>

        {/* 2. Photographs */}
        <div className="rounded-2xl border border-[#1C4D3C] bg-[#0D2D22] p-4 space-y-2 text-xs shadow-xs">
          <div className="flex items-center gap-2 font-semibold text-white">
            <Camera className="h-4 w-4 text-[#20D6A0]" />
            <span>2. Photographs & Media</span>
          </div>
          <p className="text-[#B2C8BA] leading-relaxed">
            Photographs taken via your camera or selected from your gallery are stored directly as
            binary objects within IndexedDB on this device. They are not uploaded to any remote photo
            host or third-party image analysis service.
          </p>
        </div>

        {/* 3. Storage & Network Isolation */}
        <div className="rounded-2xl border border-[#1C4D3C] bg-[#0D2D22] p-4 space-y-2 text-xs shadow-xs">
          <div className="flex items-center gap-2 font-semibold text-white">
            <Database className="h-4 w-4 text-[#A6F16A]" />
            <span>3. Local Device Storage</span>
          </div>
          <p className="text-[#B2C8BA] leading-relaxed">
            All database operations use the standard W3C browser IndexedDB API. This database is
            sandboxed to your browser on this physical device. If you clear browser website data,
            locally stored observations will be removed unless exported to JSON first.
          </p>
        </div>

        {/* 4. Tracking and Third-Party Analytics */}
        <div className="rounded-2xl border border-[#1C4D3C] bg-[#0D2D22] p-4 space-y-2 text-xs shadow-xs">
          <div className="flex items-center gap-2 font-semibold text-white">
            <EyeOff className="h-4 w-4 text-[#20D6A0]" />
            <span>4. Zero Commercial Tracking</span>
          </div>
          <p className="text-[#B2C8BA] leading-relaxed">
            B-LIFFE contains no advertising SDKs, commercial marketing pixels, or telemetry trackers.
            Your biodiversity fieldwork remains private.
          </p>
        </div>

        {/* 5. Data Sharing & Future Integration */}
        <div className="rounded-2xl border border-[#1C4D3C] bg-[#0D2D22] p-4 space-y-2 text-xs shadow-xs">
          <div className="flex items-center gap-2 font-semibold text-white">
            <Share2 className="h-4 w-4 text-[#A6F16A]" />
            <span>5. Institutional Data Sharing Policy</span>
          </div>
          <p className="text-[#B2C8BA] leading-relaxed">
            Future synchronisation with institutional bodies (such as the Kerala State Biodiversity
            Board or local Biodiversity Management Committees) will require explicit surveyor
            authorization. Data will not be shared or publicly published automatically.
          </p>
        </div>

        {/* 6. Observer Rights & Record Deletion */}
        <div className="rounded-2xl border border-[#1C4D3C] bg-[#0D2D22] p-4 space-y-2 text-xs shadow-xs">
          <div className="flex items-center gap-2 font-semibold text-white">
            <Trash2 className="h-4 w-4 text-rose-400" />
            <span>6. Record Deletion & Control</span>
          </div>
          <p className="text-[#B2C8BA] leading-relaxed">
            You maintain full sovereignty over your records. Deleting an observation from the
            &quot;Records&quot; screen permanently removes it and all associated photograph data from
            your local device immediately.
          </p>
        </div>
      </div>
    </div>
  )
}
