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
      'B LIFFE provides a clean, uncluttered interface tailored for handheld field recording.',
    bulletPoints: [
      'Top Header: Tap the Home icon on the left of the header at any time to return directly to the main dashboard.',
      'Bottom Navigation Bar: Always accessible at the bottom of the screen with three primary actions: "New Observation" (create new record), "Records" (browse saved observations), and "Menu" (open settings, guides, and project tools).',
      'Breadcrumbs: When inside specific projects or survey visits, breadcrumbs at the top of the screen allow you to step back to the project overview.',
    ],
  },
  {
    id: 'projects',
    number: 2,
    question: 'How to open a project and begin an observation',
    status: 'working',
    statusLabel: 'Operational',
    icon: FolderGit2,
    answer:
      'Projects help organize field recordings into regional initiatives (e.g., Thiruvananthapuram City Biodiversity Register).',
    bulletPoints: [
      'Tap "Projects" on the main dashboard or open the Menu and select "Projects & Field Visits".',
      'Select any active project card to view its scope, target region, guidelines, and recorded observations.',
      'Tap "+ Join Project" to pin it to your personal fieldwork list.',
      'To record an observation associated with that project, tap the prominent "Record Observation" button directly inside the project overview.',
    ],
  },
  {
    id: 'species-info',
    number: 3,
    question: 'How to enter species information and notes',
    status: 'working',
    statusLabel: 'Operational',
    icon: Leaf,
    answer:
      'The observation form allows capturing taxonomic details, vernacular folk names, and ecological context.',
    bulletPoints: [
      'Step 1 (Status): Choose whether the species is "Identified", "Needs verification", or "Unknown".',
      'Step 2 (Names): Enter the common name, scientific name, and local vernacular name in regional Indian scripts (e.g. Malayalam).',
      'Step 3 (Taxonomy & Habitat): Select the species group (Birds, Mammals, Plants, Butterflies, etc.), micro-habitat, life stage, and individual count.',
      'Step 4 (Traditional Knowledge): If you learned about this species from elders or traditional practitioners, toggle Traditional Knowledge to record the oral source.',
      'Step 5 (Field Notes): Add behavioural observations, surrounding weather, or habitat characteristics.',
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
      'GPS coordinates are recorded directly using your mobile phone or tablet hardware location sensor.',
    bulletPoints: [
      'Scroll to "2. Location & Ward" on the observation form.',
      'Tap "Acquire Coordinates". Your device browser will ask for location permission; select "Allow".',
      'The app captures high-precision latitude, longitude, and accuracy radius (in metres).',
      'If location fails or you are under heavy tree canopy, wait a moment and tap "Retry GPS Location" to re-poll satellites.',
      'Coordinates are stored locally alongside the timestamp of capture.',
    ],
  },
  {
    id: 'auto-ward',
    number: 5,
    question: 'How automatic ward identification is intended to work',
    status: 'partial',
    statusLabel: 'GIS Integration Planned',
    icon: Compass,
    answer:
      'B LIFFE is architected to eliminate manual ward selection by automatically identifying administrative divisions from GPS points.',
    bulletPoints: [
      'How it is designed: When an observation point is captured, the GPS coordinates are matched spatially against official municipal boundary polygons (starting with the 100 wards of Thiruvananthapuram Corporation).',
      'Ordinary field workers do not need to create, search, or manually assign wards.',
      'Current State: The dedicated read-only ward field displays an automated pending status ("Official boundary dataset integration pending"). Point-in-polygon GIS matching will become operational once official boundary shapefiles/GeoJSON files are loaded.',
    ],
  },
  {
    id: 'photos',
    number: 6,
    question: 'How photographs are attached',
    status: 'working',
    statusLabel: 'Operational',
    icon: Camera,
    answer:
      'Field photographs are vital evidence for taxonomic verification, especially for unknown species.',
    bulletPoints: [
      'Under "1. Photographs", tap "Take Photo" to launch your device camera and snap a picture of the specimen.',
      'Or tap "Choose Gallery" to upload previously captured field images.',
      'You can attach multiple photos to capture dorsal, ventral, leaf, or floral details.',
      'Thumbnails are displayed immediately with a remove button if an unwanted image was selected.',
      'Unknown species require at least one photo before the observation can be saved.',
    ],
  },
  {
    id: 'offline-sync',
    number: 7,
    question: 'How offline collection and synchronisation are intended to work',
    status: 'partial',
    statusLabel: 'Offline Active • Sync Planned',
    icon: WifiOff,
    answer:
      'B LIFFE operates offline-first, ensuring zero data loss in wilderness areas without network coverage.',
    bulletPoints: [
      'Working Now: All observations, high-resolution photos, and coordinates save immediately to your browser IndexedDB database.',
      'You can conduct full day field visits in deep reserves with Airplane Mode enabled.',
      'Planned Feature: Automated background synchronisation to institutional cloud registries (such as the Kerala State Biodiversity Board PBR portal) when your device reconnects to Wi-Fi or cellular networks.',
    ],
  },
  {
    id: 'verification',
    number: 8,
    question: 'How observations may be reviewed or verified',
    status: 'partial',
    statusLabel: 'Local Review Active • Expert Verification Planned',
    icon: ShieldCheck,
    answer:
      'Scientific integrity requires expert peer review and taxonomic validation.',
    bulletPoints: [
      'Working Now: You can open "Records" at any time, filter by status (Identified, Needs Verification, Unknown), open full detail cards, and edit observation entries if corrections are needed.',
      'Planned Feature: A dedicated Project Expert / Taxonomic Reviewer portal where qualified botanists, entomologists, and zoologists can review submitted photos, confirm scientific names, and upgrade statuses to "Verified".',
    ],
  },
]

export default function FAQPage({ onBack }: FAQPageProps) {
  const [openItem, setOpenItem] = useState<string | null>('navigation')

  const toggleItem = (id: string) => {
    setOpenItem((prev) => (prev === id ? null : id))
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-5 sm:px-6 space-y-5 text-[#F5F0E4]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/15 pb-4">
        <div>
          <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#C5D1BD]">
            Fieldwork Guidance & FAQ
          </span>
          <h1 className="font-heading text-2xl sm:text-[28px] font-normal tracking-wide text-[#F5F0E4] mt-0.5">
            Field Guide & Help
          </h1>
          <p className="text-xs text-[#C5D1BD]/85 mt-0.5">
            Recording instructions and FAQs
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

      <p className="text-xs text-[#C5D1BD] leading-relaxed">
        Step-by-step guidance for field workers and researchers using B LIFFE. Features currently
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
              className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md overflow-hidden transition-all shadow-md"
            >
              <button
                type="button"
                onClick={() => toggleItem(item.id)}
                className="w-full flex items-center justify-between gap-3 p-4 text-left transition-colors hover:bg-white/5 focus:outline-none"
                aria-expanded={isOpen}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#263D2B] border border-[#C5D1BD]/30 text-[#C5D1BD]">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-semibold text-[#C5D1BD]/80 uppercase tracking-wider">
                        Guide {item.number}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-semibold border ${
                          item.status === 'working'
                            ? 'bg-[#263D2B] text-[#C5D1BD] border-[#C5D1BD]/40'
                            : 'bg-amber-500/20 text-amber-200 border-amber-400/30'
                        }`}
                      >
                        {item.status === 'working' ? (
                          <CheckCircle2 className="h-2.5 w-2.5 text-[#C5D1BD]" />
                        ) : (
                          <Clock className="h-2.5 w-2.5 text-amber-300" />
                        )}
                        <span>{item.statusLabel}</span>
                      </span>
                    </div>
                    <h2 className="font-heading text-base font-normal text-[#F5F0E4] truncate mt-0.5">
                      {item.question}
                    </h2>
                  </div>
                </div>

                <div className="shrink-0 text-[#C5D1BD]">
                  {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </button>

              {isOpen && (
                <div className="border-t border-white/10 bg-black/20 p-4 text-xs sm:text-sm text-[#C5D1BD]/90 space-y-2.5 leading-relaxed">
                  <p>{item.answer}</p>
                  {item.bulletPoints && (
                    <ul className="space-y-1.5 pl-3 list-disc marker:text-[#C5D1BD]/60">
                      {item.bulletPoints.map((pt, idx) => (
                        <li key={idx} className="text-xs text-[#F5F0E4]/90">
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
