import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Clock,
  Compass,
  Camera,
  FolderGit2,
  Leaf,
  WifiOff,
  ShieldCheck,
  Navigation,
} from 'lucide-react'
import BrandName from '@/components/BrandName'

interface FAQPageProps {
  onBack?: () => void
}

interface FAQItem {
  id: string
  number: number
  question: string
  status: 'working' | 'planned' | 'partial'
  statusLabel: string
  icon: React.ComponentType<{ className?: string }>
  answer: string
  bulletPoints?: string[]
}

const FAQ_ITEMS: FAQItem[] = [
  {
    id: 'navigation',
    number: 1,
    question: 'How to navigate the app',
    status: 'working',
    statusLabel: 'Operational',
    icon: Navigation,
    answer:
      'The interface is optimized for handheld outdoor fieldwork across three primary areas:',
    bulletPoints: [
      'Bottom Bar: Switch between Home dashboard, My Records, and Offline Sync.',
      'Header Area: Access your user profile, view live online/offline connectivity status, and toggle the app menu.',
      'Menu Drawer: Quick navigation to Projects, Field Guide, Settings, Offline Data, and Sign Out.',
    ],
  },
  {
    id: 'projects',
    number: 2,
    question: 'How to join projects and record observations',
    status: 'working',
    statusLabel: 'Operational',
    icon: FolderGit2,
    answer:
      'Projects organize field recordings into regional biodiversity initiatives:',
    bulletPoints: [
      'Browse Projects: Select "Projects" from the menu or dashboard to view active regional campaigns.',
      'Join & Pin: Tap "+ Join Project" to pin initiatives directly to your personal fieldwork list.',
      'Log Associated Records: Tap "Record Observation" inside any joined project to bind your entry automatically to that campaign.',
    ],
  },
  {
    id: 'species-info',
    number: 3,
    question: 'How to record species information & field notes',
    status: 'working',
    statusLabel: 'Operational',
    icon: Leaf,
    answer:
      'Each observation section expands as an accordion to keep data entry clear and focused:',
    bulletPoints: [
      'Identification Status: Mark as Identified, Needs verification, or Unknown.',
      'Taxonomy & Local Names: Record common name, scientific name, and vernacular names in regional script using the Malayalam phonetic keyboard.',
      'Ecological Details: Log micro-habitat, life stage, count, and classification tags (#Birds, #Mammals, #Flora, #Endemic to Western Ghats).',
      'Traditional Knowledge & Notes: Document oral ethnobotanical uses, behavior, and field context.',
    ],
  },
  {
    id: 'gps-collection',
    number: 4,
    question: 'How GPS location is collected',
    status: 'working',
    statusLabel: 'Operational',
    icon: Compass,
    answer:
      'GPS coordinates and timestamps are automatically extracted and locked directly from your field photographs:',
    bulletPoints: [
      'Automatic Photo EXIF: Latitude, longitude, and timestamps are read directly from photo metadata upon capturing or uploading photos.',
      'Device GPS Fallback: If a photo lacks embedded EXIF data, device GPS coordinates are captured automatically as a seamless fallback.',
      'Locked Read-Only View: Coordinates are locked to photographic evidence with zero manual pin dragging or position tampering.',
      'Reverse Geocoding: Locality and district names are resolved and displayed in English automatically.',
      'Multi-Photo Reference: When uploading multiple photos with distinct locations, tap any photo thumbnail to set its GPS as the primary reference.',
    ],
  },
  {
    id: 'auto-ward',
    number: 5,
    question: 'How administrative ward matching works',
    status: 'working',
    statusLabel: 'Operational',
    icon: Compass,
    answer:
      'Administrative divisions are matched automatically against local GIS boundary datasets:',
    bulletPoints: [
      'Boundary Matching: Photo coordinates are verified against official Corporation ward boundary polygons in the background.',
      'Zero Manual Guesswork: Eliminates manual ward selection, reducing administrative errors in People’s Biodiversity Registers (PBR).',
      'Graceful Fallback: Locations outside boundary polygons are tagged with their reverse-geocoded locality without interrupting fieldwork.',
    ],
  },
  {
    id: 'photos',
    number: 6,
    question: 'How field photographs are captured & attached',
    status: 'working',
    statusLabel: 'Operational',
    icon: Camera,
    answer:
      'Photographs serve as primary evidence for taxonomic verification and coordinate extraction:',
    bulletPoints: [
      'Take Photo / Choose Gallery: Capture directly with your camera or select existing high-resolution field photos.',
      'Multiple Angles: Attach multiple photos to document flowers, leaves, dorsal/ventral patterns, or surrounding habitat.',
      'Per-Photo GPS Indicators: Each uploaded image displays its extracted EXIF status badge.',
      'Carousel Card View: All attached photos can be browsed with a thumbnail carousel directly on observation cards.',
    ],
  },
  {
    id: 'offline-sync',
    number: 7,
    question: 'How offline collection and sync work',
    status: 'working',
    statusLabel: 'Operational',
    icon: WifiOff,
    answer:
      'B-LIFFE is offline-first, ensuring full functionality in wilderness areas with zero network connectivity:',
    bulletPoints: [
      'Local Storage: Records, photos, and GPS metadata save immediately to local device IndexedDB.',
      'Zero Data Loss: Continue uninterrupted fieldwork in Airplane Mode or deep forest reserves.',
      'Darwin Core Export: Export your local dataset at any time as standardized Darwin Core (DwC) JSON files.',
      'Automatic Cloud Sync: Records synchronize to backend registries when an internet connection becomes available.',
    ],
  },
  {
    id: 'verification',
    number: 8,
    question: 'How observations are reviewed and verified',
    status: 'working',
    statusLabel: 'Operational',
    icon: ShieldCheck,
    answer:
      'Quality control and scientific verification ensure data credibility for biodiversity registers:',
    bulletPoints: [
      'Review & Filter: View and filter records in My Records by status (Identified, Needs verification, Unknown) or by tag.',
      'Full Detail Inspection: Inspect locked photo coordinates, reverse geocoded locality, ward matching, and attached photos.',
      'Taxonomic Validation: Project experts review photographic evidence to confirm identifications and upgrade records to verified status.',
    ],
  },
]

export default function FAQPage({ onBack }: FAQPageProps) {
  const [openItem, setOpenItem] = useState<string | null>('navigation')

  const toggleItem = (id: string) => {
    setOpenItem((prev) => (prev === id ? null : id))
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-5 sm:px-6 space-y-5 text-[#F0F5EF]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1C4D3C]/70 pb-4">
        <div>
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#A6F16A]">
            Fieldwork Guidance & FAQ
          </span>
          <h1 className="font-heading text-2xl sm:text-[28px] font-bold tracking-wide text-white mt-0.5">
            Field Guide & Help
          </h1>
          <p className="text-xs text-[#B2C8BA] mt-0.5">
            Recording instructions and operational guides
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

      <p className="text-xs text-[#B2C8BA] leading-relaxed">
        Step-by-step guidance for field workers and researchers using <BrandName />. Features currently
        operational on this device are clearly marked alongside planned capabilities.
      </p>

      {/* Accordion List */}
      <div className="space-y-3">
        {FAQ_ITEMS.map((item) => {
          const isOpen = openItem === item.id
          const Icon = item.icon

          return (
            <div
              key={item.id}
              className="rounded-2xl border border-[#1C4D3C] bg-[#0D2D22] overflow-hidden transition-all shadow-xs"
            >
              <button
                type="button"
                onClick={() => toggleItem(item.id)}
                className="w-full flex items-center justify-between gap-3 p-4 text-left transition-colors hover:bg-[#133D2F]/60 focus:outline-none"
                aria-expanded={isOpen}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#061812] border border-[#1C4D3C] text-[#A6F16A]">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-semibold text-[#7B9586] uppercase tracking-wider">
                        Guide {item.number}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold border ${
                          item.status === 'working'
                            ? 'bg-[#133D2F] text-[#A6F16A] border-[#1C4D3C]'
                            : 'bg-[#2D2410] text-[#F4D06F] border-[#685320]'
                        }`}
                      >
                        {item.status === 'working' ? (
                          <CheckCircle2 className="h-2.5 w-2.5 text-[#A6F16A]" />
                        ) : (
                          <Clock className="h-2.5 w-2.5 text-[#F4D06F]" />
                        )}
                        <span>{item.statusLabel}</span>
                      </span>
                    </div>
                    <h2 className="font-heading text-base font-semibold text-white truncate mt-0.5">
                      {item.question}
                    </h2>
                  </div>
                </div>

                <div className="shrink-0 text-[#7B9586]">
                  {isOpen ? <ChevronUp className="h-4 w-4 text-[#A6F16A]" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </button>

              {isOpen && (
                <div className="border-t border-[#1C4D3C]/70 bg-[#061812]/70 p-4 text-xs sm:text-sm text-[#B2C8BA] space-y-2.5 leading-relaxed">
                  <p>{item.answer}</p>
                  {item.bulletPoints && (
                    <ul className="space-y-1.5 pl-3 list-disc marker:text-[#A6F16A]">
                      {item.bulletPoints.map((pt, idx) => (
                        <li key={idx} className="text-xs text-[#F0F5EF]">
                          {pt}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
