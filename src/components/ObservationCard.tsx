import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Observation, IdentificationStatus } from '@/db/database'
import {
  Trash2,
  Camera,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

// Visual style mapping for identification verification pills matching B-LIFFE dark palette
const STATUS_STYLES: Record<IdentificationStatus, { bg: string; text: string; border: string }> = {
  Identified: {
    bg: 'bg-[#133D2F]',
    text: 'text-[#A6F16A]',
    border: 'border-[#1C4D3C]',
  },
  Unknown: {
    bg: 'bg-[#1C2C24]',
    text: 'text-[#B2C8BA]',
    border: 'border-[#1C4D3C]',
  },
  'Needs verification': {
    bg: 'bg-amber-950/70',
    text: 'text-amber-300',
    border: 'border-amber-800/70',
  },
}

interface ObservationCardProps {
  observation: Observation
  onDelete?: (id: string) => void
  onSelectTag?: (tagId: string) => void
}

function ObservationCard({ observation, onDelete }: ObservationCardProps) {
  const navigate = useNavigate()
  const [cardPhotoIdx, setCardPhotoIdx] = useState(0)

  // Extract photo URLs from props (supports both local Blobs and remote/string URLs)
  const [photoUrls, setPhotoUrls] = useState<string[]>([])

  useEffect(() => {
    const raw: any[] = observation.photos?.length
      ? observation.photos
      : observation.photo
      ? [observation.photo]
      : []

    const createdBlobUrls: string[] = []
    const resolvedUrls: string[] = []

    for (const item of raw) {
      if (item instanceof Blob) {
        const u = URL.createObjectURL(item)
        createdBlobUrls.push(u)
        resolvedUrls.push(u)
      } else if (typeof item === 'string' && item.trim()) {
        resolvedUrls.push(item.trim())
      }
    }

    setPhotoUrls(resolvedUrls)

    return () => {
      createdBlobUrls.forEach((u) => URL.revokeObjectURL(u))
    }
  }, [observation.photos, observation.photo])

  const statusConfig = observation.identificationStatus
    ? STATUS_STYLES[observation.identificationStatus]
    : null

  // Resolve display name safely
  const commonName = observation.speciesName?.trim()
  const displayTitle =
    commonName ||
    (observation.identificationStatus === 'Unknown' ? 'Unknown species' : 'Unnamed observation')

  const handleCardClick = () => {
    if (observation.id) {
      navigate(`/observations/${observation.id}`)
    }
  }

  return (
    <article
      onClick={handleCardClick}
      className="group cursor-pointer overflow-hidden rounded-xl sm:rounded-2xl border border-[#1C4D3C] bg-[#0D2D22] shadow-sm hover:shadow-xl transition-all duration-200 hover:border-[#A6F16A]/50 text-[#F0F5EF] flex flex-col h-full"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleCardClick()
        }
      }}
      aria-label={`View details for ${displayTitle}`}
    >
      {/* Photograph occupies top of card visible area: full width edge-to-edge with no black bars on sides */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#061812] shrink-0 border-b border-[#1C4D3C]/60">
        {photoUrls.length > 0 ? (
          <img
            src={photoUrls[cardPhotoIdx] || photoUrls[0]}
            alt={displayTitle}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105 filter brightness-[0.95]"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-[#061812] text-[#7B9586] p-2">
            <Camera className="h-6 w-6 sm:h-8 sm:w-8 stroke-[1.5] text-[#1C4D3C]" />
            <span className="mt-1 text-[9px] sm:text-xs font-medium tracking-wide text-center">
              No photo
            </span>
          </div>
        )}

        {/* Identification status label — Top-left corner over photograph */}
        {observation.identificationStatus && (
          <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 z-10">
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[8px] sm:text-[9px] tracking-wider uppercase font-semibold backdrop-blur-md shadow-md ${
                statusConfig?.bg || 'bg-[#061812]/80'
              } ${statusConfig?.text || 'text-white'} ${
                statusConfig?.border || 'border-[#1C4D3C]'
              }`}
            >
              <span className="h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full shrink-0 bg-current" />
              <span className="hidden sm:inline">
                {observation.identificationStatus}
              </span>
              <span className="inline sm:hidden">
                {observation.identificationStatus === 'Needs verification'
                  ? 'Verify'
                  : observation.identificationStatus === 'Identified'
                    ? 'ID'
                    : 'Unknown'}
              </span>
            </span>
          </div>
        )}

        {/* Minimal Action Elements: Carousel Arrows and Photo Counter (if multiple photos) */}
        {photoUrls.length > 1 && (
          <>
            {/* Previous Photo Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setCardPhotoIdx((prev) => (prev > 0 ? prev - 1 : photoUrls.length - 1))
              }}
              className="absolute left-1 top-1/2 -translate-y-1/2 z-20 flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-[#061812]/85 text-[#F0F5EF] hover:bg-[#133D2F] hover:text-[#A6F16A] border border-[#1C4D3C] transition-all cursor-pointer shadow-md active:scale-95"
              aria-label="Previous photo"
            >
              <ChevronLeft className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            </button>

            {/* Next Photo Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setCardPhotoIdx((prev) => (prev < photoUrls.length - 1 ? prev + 1 : 0))
              }}
              className="absolute right-1 top-1/2 -translate-y-1/2 z-20 flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-[#061812]/85 text-[#F0F5EF] hover:bg-[#133D2F] hover:text-[#A6F16A] border border-[#1C4D3C] transition-all cursor-pointer shadow-md active:scale-95"
              aria-label="Next photo"
            >
              <ChevronRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            </button>

            {/* Photo counter indicator at bottom right */}
            <div className="absolute bottom-1.5 right-1.5 z-10 pointer-events-none">
              <span className="rounded-full bg-[#061812]/90 backdrop-blur-md px-1.5 py-0.5 text-[8px] sm:text-[9px] font-semibold text-[#A6F16A] border border-[#1C4D3C] shadow-md pointer-events-auto">
                {cardPhotoIdx + 1}/{photoUrls.length}
              </span>
            </div>
          </>
        )}

        {/* Minimal Action Element: Delete Button — Top-right corner over photograph */}
        {onDelete && observation.id !== undefined && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              const label = observation.speciesName?.trim() || 'this observation'
              if (
                window.confirm(
                  `Are you sure you want to delete ${label} from local storage? This action cannot be undone.`
                )
              ) {
                onDelete(observation.id!)
              }
            }}
            className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 z-10 flex h-5 w-5 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-[#061812]/80 text-[#B2C8BA] backdrop-blur-md border border-[#1C4D3C] hover:bg-rose-900/80 hover:text-white hover:border-rose-700 transition-all shadow-sm focus:outline-none"
            title="Delete observation from local storage"
            aria-label={`Delete ${displayTitle}`}
          >
            <Trash2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          </button>
        )}
      </div>

      {/* 2. Clean species name header (No secondary metadata, coordinates, dates, or badges) */}
      <div className="p-2 sm:p-2.5 md:p-3 flex-1 flex flex-col justify-center">
        <h3 className="text-xs sm:text-sm md:text-base font-bold tracking-tight text-white line-clamp-1 group-hover:text-[#A6F16A] transition-colors leading-snug">
          {displayTitle}
        </h3>
        {observation.scientificName?.trim() && (
          <p className="text-[10px] sm:text-[11px] md:text-xs italic text-[#20D6A0] line-clamp-1 leading-tight mt-0.5">
            {observation.scientificName.trim()}
          </p>
        )}
      </div>
    </article>
  )
}

export default ObservationCard
