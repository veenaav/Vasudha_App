import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  Leaf,
  Database,
  Compass,
  CheckCircle2,
  FolderGit2,
  Building2,
  Mail,
} from 'lucide-react'

interface AboutPageProps {
  onBack?: () => void
}

export default function AboutPage({ onBack }: AboutPageProps) {
  return (
    <div className="mx-auto max-w-lg px-4 py-5 sm:px-6 space-y-5 text-[#F5F0E4]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/15 pb-4">
        <div>
          <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#C5D1BD]">
            Platform Overview
          </span>
          <h1 className="font-heading text-2xl sm:text-[28px] font-normal tracking-wide text-[#F5F0E4] mt-0.5">
            About B LIFFE
          </h1>
          <p className="text-xs text-[#C5D1BD]/85 mt-0.5">
            Mission, features and conservation goals
          </p>
        </div>

        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-medium tracking-wider uppercase text-[#C5D1BD] hover:bg-white/20 hover:text-[#F5F0E4] transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back</span>
          </button>
        ) : (
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-medium tracking-wider uppercase text-[#C5D1BD] hover:bg-white/20 hover:text-[#F5F0E4] transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Dashboard</span>
          </Link>
        )}
      </div>

      {/* 1. Identity & Full Name */}
      <div className="rounded-3xl border border-[#DCD5C5] bg-[#FAF7F0] p-6 shadow-xl text-[#263D2B]">
        <div className="flex items-center gap-3 border-b border-[#DCD5C5] pb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#263D2B] text-[#F5F0E4] shadow-md">
            <Leaf className="h-6 w-6 text-[#C5D1BD]" />
          </div>
          <div>
            <h2 className="font-heading text-2xl font-bold tracking-wider uppercase text-[#263D2B]">
              B LIFFE
            </h2>
            <p className="text-xs font-semibold text-[#414B32] leading-tight mt-0.5">
              Bharat Local Informatics for Flora, Fauna, and Ecosystems
            </p>
          </div>
        </div>

        {/* 2. Purpose & Vision */}
        <div className="mt-4 space-y-3 text-xs sm:text-sm text-[#414B32] leading-relaxed">
          <div>
            <h3 className="font-semibold text-xs tracking-wider uppercase text-[#263D2B] mb-1">
              Purpose and Vision
            </h3>
            <p>
              <strong>B LIFFE</strong> is dedicated to bridging grassroots ecological fieldwork with
              structured scientific biodiversity informatics across India. The vision is to provide
              field researchers, local naturalists, community volunteers, and biodiversity management
              committees (BMCs) with a dependable, offline-first digital instrument to record, verify,
              and safeguard local ecological knowledge.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-xs tracking-wider uppercase text-[#263D2B] mb-1">
              Why B LIFFE Is Useful for Field Data Collection
            </h3>
            <ul className="list-disc pl-4 space-y-1 text-xs">
              <li>
                <strong>Offline-First Resilience:</strong> Works reliably deep in nature reserves,
                riparian zones, and remote forests without requiring an active cellular connection.
              </li>
              <li>
                <strong>Direct Hardware Geolocation:</strong> Connects directly to native mobile GPS
                chips to capture precision coordinates and accuracy radii.
              </li>
              <li>
                <strong>Regional Vernacular Taxonomy:</strong> Prioritizes native Indian languages and
                scripts (including Malayalam) alongside scientific binomials to honor community folk
                taxonomy.
              </li>
              <li>
                <strong>Outdoor-Optimized Visual Design:</strong> High-contrast natural palette
                engineered for maximum readability under intense daylight.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 4. Main Features Currently Implemented */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#C5D1BD]">
          Currently Implemented Features
        </h3>

        <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md p-4 space-y-2 text-xs">
          <div className="flex items-center gap-2 font-semibold text-[#F5F0E4]">
            <CheckCircle2 className="h-4 w-4 text-[#C5D1BD]" />
            <span>Structured Field Recording Form</span>
          </div>
          <p className="text-[#C5D1BD]/85 leading-relaxed">
            Record species name, scientific binomial, regional local name, taxonomic group, life stage,
            micro-habitat, individual count, and field notes with multi-photo camera attachment.
          </p>
        </div>

        <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md p-4 space-y-2 text-xs">
          <div className="flex items-center gap-2 font-semibold text-[#F5F0E4]">
            <Compass className="h-4 w-4 text-[#C5D1BD]" />
            <span>Automatic GPS & Spatial Ward Integration Architecture</span>
          </div>
          <p className="text-[#C5D1BD]/85 leading-relaxed">
            Automatic GPS acquisition with dedicated administrative ward identification designed to
            match spatial boundaries automatically without manual surveyor selection.
          </p>
        </div>

        <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md p-4 space-y-2 text-xs">
          <div className="flex items-center gap-2 font-semibold text-[#F5F0E4]">
            <Database className="h-4 w-4 text-[#C5D1BD]" />
            <span>Local IndexedDB Database & Filterable Archive</span>
          </div>
          <p className="text-[#C5D1BD]/85 leading-relaxed">
            Full on-device persistence for all observations and photos, with filterable status pills
            (Identified, Needs verification, Unknown) and in-place record editing.
          </p>
        </div>

        <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md p-4 space-y-2 text-xs">
          <div className="flex items-center gap-2 font-semibold text-[#F5F0E4]">
            <FolderGit2 className="h-4 w-4 text-[#C5D1BD]" />
            <span>Projects & Survey Session Workflows</span>
          </div>
          <p className="text-[#C5D1BD]/85 leading-relaxed">
            Explore regional initiatives, join active campaigns, and conduct hierarchical ward survey
            sessions with lead observers and environmental context.
          </p>
        </div>
      </div>

      {/* 5. How Observations Support Conservation */}
      <div className="rounded-3xl border border-[#DCD5C5] bg-[#FAF7F0] p-5 sm:p-6 shadow-xl text-[#263D2B] space-y-3">
        <h3 className="font-heading text-lg font-normal text-[#263D2B]">
          Supporting Conservation Across India
        </h3>
        <p className="text-xs sm:text-sm text-[#414B32] leading-relaxed">
          Accurate field data is the bedrock of habitat preservation and environmental policy. By
          cataloging micro-habitats, phenology stages, and sightings of vulnerable species at the ward
          level, B LIFFE supports:
        </p>
        <ul className="list-disc pl-4 space-y-1.5 text-xs text-[#414B32]">
          <li>
            <strong>People&apos;s Biodiversity Registers (PBRs):</strong> Assisting local Grama
            Panchayats and Municipal Corporations in maintaining statutory biological inventories.
          </li>
          <li>
            <strong>Safeguarding Traditional Knowledge:</strong> Documenting indigenous flora uses,
            folklore, and oral ecological heritage with source attribution.
          </li>
          <li>
            <strong>Urban & Rural Ecology Mapping:</strong> Tracking habitat fragmentation and species
            resilience in developing landscapes.
          </li>
        </ul>
      </div>

      {/* 6. Organization & Verified Contacts */}
      <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md p-4 space-y-3 text-xs">
        <div className="flex items-center gap-2 font-semibold text-[#F5F0E4]">
          <Building2 className="h-4 w-4 text-[#C5D1BD]" />
          <span>Organization & Partnership Transparency</span>
        </div>
        <p className="text-[#C5D1BD]/85 leading-relaxed">
          B LIFFE is an open digital fieldwork platform developed to empower local biodiversity
          initiatives. Formal institutional partnerships and governmental endorsements will be listed
          here as official integration protocols and Memorandums of Understanding are ratified.
        </p>
        <div className="pt-2 border-t border-white/15 flex items-center gap-2 text-[#C5D1BD]">
          <Mail className="h-4 w-4 text-[#C5D1BD]" />
          <span>Community feedback & GIS boundary contributions: Open repository project</span>
        </div>
      </div>
    </div>
  )
}
