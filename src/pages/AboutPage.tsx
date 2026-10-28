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
import BrandName from '@/components/BrandName'

interface AboutPageProps {
  onBack?: () => void
}

export default function AboutPage({ onBack }: AboutPageProps) {
  return (
    <div className="mx-auto max-w-lg px-4 py-5 sm:px-6 space-y-5 text-[#F0F5EF]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1C4D3C]/70 pb-4">
        <div>
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#A6F16A]">
            Platform Overview
          </span>
          <h1 className="font-heading text-2xl sm:text-[28px] font-bold tracking-wide text-white mt-0.5 flex items-center gap-2">
            <span>About</span>
            <BrandName className="text-2xl sm:text-[28px]" />
          </h1>
          <p className="text-xs text-[#B2C8BA] mt-0.5">
            Mission, features and conservation goals
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

      {/* 1. Identity & Full Name */}
      <div className="rounded-3xl border border-[#1C4D3C] bg-[#0D2D22] p-6 shadow-xl text-[#F0F5EF]">
        <div className="flex items-center gap-3 border-b border-[#1C4D3C]/70 pb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#061812] border border-[#1C4D3C] text-[#A6F16A] shadow-md">
            <Leaf className="h-6 w-6 text-[#A6F16A]" />
          </div>
          <div>
            <h2>
              <BrandName className="text-2xl font-bold tracking-wider" />
            </h2>
            <p className="text-xs font-semibold text-[#A6F16A] leading-tight mt-0.5">
              Bharat Local Informatics for Flora, Fauna, and Ecosystems
            </p>
          </div>
        </div>

        {/* 2. Purpose & Vision */}
        <div className="mt-4 space-y-3 text-xs sm:text-sm text-[#B2C8BA] leading-relaxed">
          <div>
            <h3 className="font-semibold text-xs tracking-wider uppercase text-[#A6F16A] mb-1">
              Purpose and Vision
            </h3>
            <p>
              <BrandName /> is dedicated to bridging grassroots ecological fieldwork with
              structured scientific biodiversity informatics across India. The vision is to provide
              field researchers, local naturalists, community volunteers, and biodiversity management
              committees (BMCs) with a dependable, offline-first digital instrument to record, verify,
              and safeguard local ecological knowledge.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-xs tracking-wider uppercase text-[#A6F16A] mb-1">
              Why <BrandName /> Is Useful for Field Data Collection
            </h3>
            <ul className="list-disc pl-4 space-y-1.5 text-xs text-[#B2C8BA]">
              <li>
                <strong className="text-white">Offline-First Resilience:</strong> Works reliably deep in nature reserves,
                riparian zones, and remote forests without requiring an active cellular connection.
              </li>
              <li>
                <strong className="text-white">Direct Hardware Geolocation:</strong> Connects directly to native mobile GPS
                chips to capture precision coordinates, accuracy radii, and raw audit trail.
              </li>
              <li>
                <strong className="text-white">Outdoor-Optimized Dark Visual Design:</strong> High-contrast immersive dark nature palette
                engineered for maximum readability and visual comfort in the field.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 4. Main Features Currently Implemented */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#A6F16A]">
          Currently Implemented Features
        </h3>

        <div className="rounded-2xl border border-[#1C4D3C] bg-[#0D2D22] p-4 space-y-2 text-xs shadow-xs">
          <div className="flex items-center gap-2 font-semibold text-white">
            <CheckCircle2 className="h-4 w-4 text-[#A6F16A]" />
            <span>Structured Field Recording Form</span>
          </div>
          <p className="text-[#B2C8BA] leading-relaxed">
            Record species name, scientific binomial, regional local name, taxonomic group, life stage,
            micro-habitat, individual count, basis of record, and field notes with multi-photo camera attachment.
          </p>
        </div>

        <div className="rounded-2xl border border-[#1C4D3C] bg-[#0D2D22] p-4 space-y-2 text-xs shadow-xs">
          <div className="flex items-center gap-2 font-semibold text-white">
            <Compass className="h-4 w-4 text-[#20D6A0]" />
            <span>Automatic GPS & Spatial Ward Integration Architecture</span>
          </div>
          <p className="text-[#B2C8BA] leading-relaxed">
            Automatic GPS acquisition with interactive map adjustment, coordinates audit trail, and spatial boundary
            matching for 100 Corporation wards of Thiruvananthapuram.
          </p>
        </div>

        <div className="rounded-2xl border border-[#1C4D3C] bg-[#0D2D22] p-4 space-y-2 text-xs shadow-xs">
          <div className="flex items-center gap-2 font-semibold text-white">
            <Database className="h-4 w-4 text-[#A6F16A]" />
            <span>Local IndexedDB Database & Filterable Archive</span>
          </div>
          <p className="text-[#B2C8BA] leading-relaxed">
            Full on-device persistence for all observations and photos, with filterable status pills
            (Identified, Needs verification, Unknown), Darwin Core JSON export, and in-place record editing.
          </p>
        </div>

        <div className="rounded-2xl border border-[#1C4D3C] bg-[#0D2D22] p-4 space-y-2 text-xs shadow-xs">
          <div className="flex items-center gap-2 font-semibold text-white">
            <FolderGit2 className="h-4 w-4 text-[#20D6A0]" />
            <span>Projects & Survey Session Workflows</span>
          </div>
          <p className="text-[#B2C8BA] leading-relaxed">
            Explore regional initiatives, join active campaigns, and conduct hierarchical ward survey
            sessions with lead observers, role switcher, and environmental context.
          </p>
        </div>
      </div>

      {/* 5. How Observations Support Conservation */}
      <div className="rounded-3xl border border-[#1C4D3C] bg-[#0D2D22] p-5 sm:p-6 shadow-xl text-[#F0F5EF] space-y-3">
        <h3 className="font-heading text-lg font-bold text-white">
          Supporting Conservation Across India
        </h3>
        <p className="text-xs sm:text-sm text-[#B2C8BA] leading-relaxed">
          Accurate field data is the bedrock of habitat preservation and environmental policy. By
          cataloging micro-habitats, phenology stages, and sightings of vulnerable species at the ward
          level, B-LIFFE supports:
        </p>
        <ul className="list-disc pl-4 space-y-1.5 text-xs text-[#B2C8BA]">
          <li>
            <strong className="text-white">People&apos;s Biodiversity Registers (PBRs):</strong> Assisting local Grama
            Panchayats and Municipal Corporations in maintaining statutory biological inventories.
          </li>
          <li>
            <strong className="text-white">Safeguarding Traditional Knowledge:</strong> Documenting indigenous flora uses,
            folklore, and oral ecological heritage with source attribution.
          </li>
          <li>
            <strong className="text-white">Urban & Rural Ecology Mapping:</strong> Tracking habitat fragmentation and species
            resilience in developing landscapes.
          </li>
        </ul>
      </div>

      {/* 6. Organization & Verified Contacts */}
      <div className="rounded-2xl border border-[#1C4D3C] bg-[#0D2D22] p-4 space-y-3 text-xs shadow-xs">
        <div className="flex items-center gap-2 font-semibold text-white">
          <Building2 className="h-4 w-4 text-[#A6F16A]" />
          <span>Organization & Partnership Transparency</span>
        </div>
        <p className="text-[#B2C8BA] leading-relaxed">
          B-LIFFE is an open digital fieldwork platform developed to empower local biodiversity
          initiatives. Formal institutional partnerships and governmental endorsements will be listed
          here as official integration protocols and Memorandums of Understanding are ratified.
        </p>
        <div className="pt-2 border-t border-[#1C4D3C]/70 flex items-center gap-2 text-[#7B9586]">
          <Mail className="h-4 w-4 text-[#A6F16A]" />
          <span>Community feedback & GIS boundary contributions: Open repository project</span>
        </div>
      </div>
    </div>
  )
}
