import { Button } from '@/components/ui/button'
import { X, Camera, MapPin, Leaf, BookOpen, type LucideIcon } from 'lucide-react'

interface TipItem {
  title: string
  description: string
}

interface GenericTipsModalProps {
  isOpen: boolean
  onClose: () => void
  icon: LucideIcon
  title: string
  tips: TipItem[]
  ariaLabelledBy: string
}

function GenericTipsModal({
  isOpen,
  onClose,
  icon: Icon,
  title,
  tips,
  ariaLabelledBy,
}: GenericTipsModalProps) {
  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={ariaLabelledBy}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-3xl border border-[#1C4D3C] bg-[#0D2D22] p-5 sm:p-6 shadow-2xl shadow-black/80 text-[#F0F5EF]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#1C4D3C] pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#061812] border border-[#1C4D3C] text-[#A6F16A]">
              <Icon className="h-4.5 w-4.5" />
            </div>
            <h3 id={ariaLabelledBy} className="text-base sm:text-lg font-bold text-white">
              {title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#B2C8BA] hover:text-white hover:bg-[#133D2F] transition-colors cursor-pointer"
            aria-label={`Close ${title}`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body / Guidelines */}
        <div className="mt-4 space-y-3 text-xs sm:text-sm">
          {tips.map((tip, index) => (
            <div
              key={index}
              className="flex items-start gap-3 rounded-2xl bg-[#061812] border border-[#1C4D3C] p-3.5"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#133D2F] text-[#A6F16A] text-xs font-bold border border-[#1C4D3C]">
                {index + 1}
              </span>
              <div>
                <h4 className="font-bold text-white text-sm">{tip.title}</h4>
                <p className="mt-0.5 text-xs text-[#B2C8BA] leading-relaxed">
                  {tip.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Modal Footer / Dismiss Action */}
        <div className="mt-5">
          <Button
            type="button"
            onClick={onClose}
            className="w-full min-h-[46px] bg-gradient-to-r from-[#A6F16A] to-[#20D6A0] text-[#061812] hover:opacity-95 font-bold text-sm tracking-wide rounded-2xl active:scale-98 transition-all shadow-md cursor-pointer"
          >
            Got It
          </Button>
        </div>
      </div>
    </div>
  )
}

export function PhotoTipsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <GenericTipsModal
      isOpen={isOpen}
      onClose={onClose}
      icon={Camera}
      title="Tips for Great Field Photos"
      ariaLabelledBy="photo-tips-title"
      tips={[
        {
          title: 'Get Close & Clear',
          description:
            'Take sharp, in-focus photos of the organism without standing too far away.',
        },
        {
          title: 'Show Key Parts',
          description:
            'Capture multiple angles or important features (like flowers, leaves, feathers, or patterns).',
        },
        {
          title: 'Good Lighting',
          description:
            'Ensure natural daylight illuminates the subject clearly; avoid dark silhouettes or heavy shadows.',
        },
        {
          title: 'Clear Background',
          description:
            'Keep the focus on the subject and avoid blurry or cluttered shots.',
        },
      ]}
    />
  )
}

export function LocationTipsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <GenericTipsModal
      isOpen={isOpen}
      onClose={onClose}
      icon={MapPin}
      title="Tips for Accurate Location"
      ariaLabelledBy="location-tips-title"
      tips={[
        {
          title: 'Use GPS for Precision',
          description:
            'Tap “Get My Location” when standing right at the observation spot for accurate coordinates.',
        },
        {
          title: 'Fine-Tune on Map',
          description:
            'If you are logging later or the GPS marker is slightly off, tap anywhere on the map or drag the pin directly to the correct spot.',
        },
        {
          title: 'Automatic Ward Lookup',
          description:
            'Once your location pin is set, the system will automatically match and identify your administrative ward.',
        },
      ]}
    />
  )
}

export function EcologyTipsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <GenericTipsModal
      isOpen={isOpen}
      onClose={onClose}
      icon={Leaf}
      title="Tips for Ecological Details"
      ariaLabelledBy="ecology-tips-title"
      tips={[
        {
          title: 'Accurate Count',
          description:
            'Enter the exact number of individuals observed, or a reasonable estimate for large groups.',
        },
        {
          title: 'Life Stage',
          description:
            'Select the developmental stage (e.g., Adult, Juvenile, Flowering, Fruiting) to track population cycles.',
        },
        {
          title: 'Micro-Habitat',
          description:
            'Specify the exact micro-habitat or substrate where the organism was found (e.g., Tree Canopy, Ground, Leaf Undersurface).',
        },
        {
          title: 'Organism Status',
          description:
            'Note whether the individual is Wild, Captive, or Cultivated.',
        },
      ]}
    />
  )
}

export function TraditionalKnowledgeTipsModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  return (
    <GenericTipsModal
      isOpen={isOpen}
      onClose={onClose}
      icon={BookOpen}
      title="What is Traditional Knowledge?"
      ariaLabelledBy="tk-tips-title"
      tips={[
        {
          title: 'What it is',
          description:
            'Cumulative ecological wisdom, traditional medicinal uses, and indigenous practices passed down through generations.',
        },
        {
          title: 'Community Consent',
          description:
            'Ensure information from local community members or elders is gathered with their explicit consent.',
        },
        {
          title: 'Privacy & Accuracy',
          description:
            'Do not record personal identifying details (like phone numbers or home addresses), and accurately note the source category (e.g., Elder, PBR record).',
        },
      ]}
    />
  )
}

