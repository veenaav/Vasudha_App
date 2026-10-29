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
      'B-LIFFE provides a clean, handheld field interface designed for outdoors and nature expeditions.',
    bulletPoints: [
      'Bottom Navigation Bar: Always accessible at the bottom of the screen with primary actions: "Home", "Records", "Sync", and quick drawer navigation.',
      'Branding Header: Displays the B-LIFFE emblem, live online/offline network indicator, and direct access to Welcome Tour and Sign In.',
      'Navigation Drawer: Open the menu to reach Projects, Surveys, Ward boundaries, About, Settings, and Field Guides.',
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
      'Tap "Projects" on the main dashboard or open the menu and select "Projects & Campaigns".',
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
      'The observation form captures taxonomic details, vernacular folk names, and ecological context.',
    bulletPoints: [
      'Step 1 (Status): Choose whether the species is "Identified", "Needs verification", or "Unknown".',
      'Step 2 (Names): Enter the common name, scientific name, and local vernacular name in regional Indian scripts with the phonetic Malayalam keyboard.',
      'Step 3 (Taxonomy & Habitat): Select the species group, micro-habitat, life stage, individual count, and basis of record (e.g. Human Observation).',
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
      'You can also fine-tune your position by dragging the pin on the interactive OpenStreetMap view.',
      'Coordinates and raw hardware audit records are stored locally alongside the timestamp of capture.',
    ],
  },
  {
    id: 'auto-ward',
    number: 5,
    question: 'How automatic ward identification works',
    status: 'working',
    statusLabel: 'Operational',
    icon: Compass,
    answer:
      'B-LIFFE eliminates manual ward selection by automatically identifying administrative divisions from GPS points.',
    bulletPoints: [
      'When an observation point is captured, the GPS coordinates are tested against official Corporation ward boundary polygons (100 wards of Thiruvananthapuram).',
      'Ordinary field workers do not need to create, search, or manually guess wards.',
      'If your location falls outside the boundary dataset, the system safely records "Outside designated wards" without interrupting your fieldwork.',
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
      'Under "Photographs", tap "Take Photo" to launch your device camera and snap a picture of the specimen.',
      'Or tap "Choose Gallery" to upload previously captured field images.',
      'You can attach multiple photos to capture dorsal, ventral, leaf, or floral details.',
      'Thumbnails are displayed immediately with a remove button if an unwanted image was selected.',
      'Unknown species require at least one photo before the observation can be saved.',
    ],
  },
  {
    id: 'offline-sync',
    number: 7,
    question: 'How offline collection and synchronisation work',
    status: 'partial',
    statusLabel: 'Offline Active • Sync Planned',
    icon: WifiOff,
    answer:
      'B-LIFFE operates offline-first, ensuring zero data loss in wilderness areas without network coverage.',
    bulletPoints: [
      'Working Now: All observations, photos, and coordinates save immediately to your browser IndexedDB database.',
      'You can conduct full day field visits in deep reserves with Airplane Mode enabled.',
      'Export at any time: Download your full observation dataset as Darwin Core-compliant JSON files from the Records screen.',
      'Planned Feature: Automated background synchronisation to institutional cloud registries when your device reconnects to Wi-Fi.',
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
      'Role Switcher: Switch between Field Worker, Project Expert, and Admin roles in Dev Mode to test validation workflows.',
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
