import { useEffect, useMemo, useState } from 'react'
import type { Observation, IdentificationStatus } from '@/db/database'
import {
  MapPin,
  Calendar,
  Clock,
  Trash2,
  BookOpen,
  Maximize2,
  X,
  Layers,
  Leaf,
} from 'lucide-react'

// Format ISO timestamp into Indian English localized string
const formatDateTime = (value?: string | null) => {
  if (!value) return 'Not recorded'
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? 'Invalid date'
    : date.toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
}

// Format coordinates to 5 decimal places with graceful fallback
const formatCoordinate = (value?: number | string | null) => {
  if (value === null || value === undefined || value === '') return 'Not recorded'
  const num = Number(value)
  return Number.isNaN(num) ? 'Not recorded' : num.toFixed(5)
}

// Visual style mapping for identification verification pills matching Shrishti palette
const STATUS_STYLES: Record<IdentificationStatus, { bg: string; text: string; border: string }> = {
  Identified: {
    bg: 'bg-[#263D2B]/90',
    text: 'text-[#C5D1BD]',
    border: 'border-[#C5D1BD]/40',
  },
  Unknown: {
    bg: 'bg-white/10',
    text: 'text-[#C5D1BD]',
    border: 'border-white/20',
  },
  'Needs verification': {
    bg: 'bg-[#B87555]/25',
    text: 'text-[#E8A585]',
    border: 'border-[#B87555]/40',
  },
}

interface ObservationCardProps {
  observation: Observation
  onDelete?: (id: string) => void
}

function ObservationCard({ observation, onDelete }: ObservationCardProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)

  // Extract photo blobs from props (supports both modern array and legacy single photo)
  const photoBlobs = useMemo(() => {
    const raw = observation.photos?.length
      ? observation.photos
      : observation.photo
      ? [observation.photo]
      : []
    return raw.filter((item): item is Blob => item instanceof Blob)
  }, [observation.photos, observation.photo])

  // Derive object URLs synchronously from photo blobs
  const photoUrls = useMemo(
    () => photoBlobs.map((blob) => URL.createObjectURL(blob)),
    [photoBlobs]
  )

  // Clean up object URLs from memory when blobs change or on component unmount
  useEffect(() => {
    return () => {
      photoUrls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [photoUrls])

  const statusConfig = observation.identificationStatus
    ? STATUS_STYLES[observation.identificationStatus]
    : null

  // Resolve species group
  const selectedGroup = observation.speciesGroup || observation.speciesGroups
  const displaySpeciesGroup =
    selectedGroup === 'Other' && observation.otherSpeciesGroup?.trim()
      ? `Other (${observation.otherSpeciesGroup.trim()})`
      : selectedGroup

  // Resolve micro-habitat
  const displayMicroHabitat =
    observation.microHabitat === 'Other' && observation.otherMicroHabitat?.trim()
      ? `Other (${observation.otherMicroHabitat.trim()})`
      : observation.microHabitat

  // Resolve traditional knowledge source description
  const displayTKSource =
    observation.traditionalKnowledgeSource === 'Other' &&
    observation.otherTraditionalKnowledgeSource?.trim()
      ? `Other (${observation.otherTraditionalKnowledgeSource.trim()})`
      : observation.traditionalKnowledgeSource

  return (
    <>
      <article className="overflow-hidden rounded-3xl border border-white/20 bg-white/10 backdrop-blur-md shadow-2xl transition-all hover:border-white/30 text-[#F5F0E4]">
        {/* Card Header: Verification Status Pill & Delete Button */}
        <div className="flex items-center justify-between border-b border-white/15 bg-white/5 px-4 sm:px-5 py-3">
          <div className="flex items-center gap-2">
            {statusConfig && (
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] tracking-wider uppercase font-semibold ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
              >
                {observation.identificationStatus}
              </span>
            )}
            {observation.individualCount !== undefined && (
              <span className="rounded-full bg-white/10 border border-white/15 px-2.5 py-0.5 text-[10px] tracking-wider uppercase font-medium text-[#C5D1BD]">
                Count: {observation.individualCount}
              </span>
            )}
          </div>

          {onDelete && observation.id !== undefined && (
            <button
              type="button"
              onClick={() => {
                const label = observation.speciesName?.trim() || 'this observation'
                if (window.confirm(`Are you sure you want to delete ${label}?`)) {
                  onDelete(observation.id!)
                }
              }}
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium text-[#B87555] hover:bg-[#B87555]/20 hover:text-[#E8A585] transition-colors min-h-[36px]"
              title="Delete observation"
              aria-label="Delete observation"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete</span>
            </button>
          )}
        </div>

        <div className="p-5">
          {/* Species Names */}
          <div>
            {observation.identificationStatus === 'Unknown' ? (
              <div className="flex items-center gap-2">
                <Leaf className="h-5 w-5 text-[#C5D1BD]" />
                <h3 className="font-heading text-lg font-normal text-[#F5F0E4]">Unknown species</h3>
              </div>
            ) : (
              <div>
                <h3 className="font-heading text-xl sm:text-2xl font-normal text-[#F5F0E4]">
                  {observation.speciesName || 'Unnamed record'}
                </h3>
                {observation.localName?.trim() && (
                  <p className="mt-0.5 text-base font-normal text-[#C5D1BD]">
                    {observation.localName}
                  </p>
                )}
                {observation.scientificName?.trim() && (
                  <p className="mt-0.5 text-xs italic text-[#C5D1BD]/80">
                    {observation.scientificName}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Badges / Attributes Chips */}
          <div className="mt-3.5 flex flex-wrap items-center gap-2 text-xs text-[#C5D1BD]">
            {displaySpeciesGroup?.trim() && (
              <span className="inline-flex items-center gap-1 rounded-full bg-white/10 border border-white/15 px-3 py-1 text-xs font-medium text-[#F5F0E4]">
                <Leaf className="h-3 w-3 text-[#C5D1BD]" />
                {displaySpeciesGroup}
              </span>
            )}

            {observation.lifeStage && (
              <span className="inline-flex items-center rounded-full bg-white/10 border border-white/15 px-3 py-1 text-xs font-medium text-[#F5F0E4]">
                Stage: {observation.lifeStage}
              </span>
            )}

            {displayMicroHabitat && (
              <span className="inline-flex items-center gap-1 rounded-full bg-white/10 border border-white/15 px-3 py-1 text-xs font-medium text-[#F5F0E4]">
                <Layers className="h-3 w-3 text-[#C5D1BD]" />
                {displayMicroHabitat}
              </span>
            )}
          </div>

          {/* Traditional Knowledge Banner if present */}
          {observation.hasTraditionalKnowledge === 'Yes' && (
            <div className="mt-3.5 rounded-2xl border border-[#B87555]/40 bg-[#B87555]/15 p-3.5 text-sm text-[#F5F0E4]">
              <div className="flex items-center gap-1.5 font-medium text-[#E8A585] text-xs tracking-wider uppercase">
                <BookOpen className="h-4 w-4" />
                <span>Traditional Knowledge Documented</span>
              </div>
              {displayTKSource && (
                <p className="mt-1 text-xs text-[#C5D1BD]">
                  <span className="font-semibold text-[#F5F0E4]">Source:</span> {displayTKSource}
                </p>
              )}
            </div>
          )}

          {/* Field Notes */}
          {observation.notes?.trim() && (
            <div className="mt-3.5 rounded-2xl bg-black/25 p-3.5 text-sm text-[#F5F0E4] border border-white/10">
              <p className="font-semibold text-[#C5D1BD] text-[10px] tracking-widest uppercase mb-1">
                Field Notes
              </p>
              <p className="whitespace-pre-wrap leading-relaxed text-[#F5F0E4]/90 text-xs sm:text-sm">{observation.notes}</p>
            </div>
          )}

          {/* Photo Gallery Grid */}
          {photoUrls.length > 0 && (
            <div className="mt-4">
              <p className="text-[10px] font-semibold tracking-widest uppercase text-[#C5D1BD] mb-2">
                Photographs ({photoUrls.length})
              </p>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                {photoUrls.map((url, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => setSelectedPhoto(url)}
                    className="group relative aspect-4/3 overflow-hidden rounded-2xl border border-white/20 bg-black/30 focus:ring-2 focus:ring-[#C5D1BD] focus:outline-none shadow-sm"
                    aria-label={`View photo ${idx + 1} enlarged`}
                  >
                    <img
                      src={url}
                      alt={`Observation ${idx + 1}`}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center transition-colors">
                      <Maximize2 className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Location & Timestamps Footer */}
          <div className="mt-4 border-t border-white/15 pt-3.5 text-xs text-[#C5D1BD] space-y-1.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-[#F5F0E4] font-mono text-xs sm:text-sm font-medium">
                <MapPin className="h-3.5 w-3.5 text-[#C5D1BD] shrink-0" />
                <span>
                  {formatCoordinate(observation.latitude)}, {formatCoordinate(observation.longitude)}
                </span>
              </div>
              {observation.accuracyMeters !== null && observation.accuracyMeters !== undefined && (
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold border ${
                    observation.accuracyMeters <= 10
                      ? 'bg-[#263D2B]/90 text-[#C5D1BD] border-[#C5D1BD]/40'
                      : 'bg-[#B87555]/25 text-[#E8A585] border-[#B87555]/40'
                  }`}
                >
                  ±{Math.round(observation.accuracyMeters)}m accuracy
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-[#C5D1BD]/80 tracking-wide uppercase">
              <span className="flex items-center gap-1 font-normal">
                <Calendar className="h-3 w-3 text-[#C5D1BD]" />
                Observed: {formatDateTime(observation.observationAt)}
              </span>
              <span className="flex items-center gap-1 font-normal">
                <Clock className="h-3 w-3 text-[#C5D1BD]" />
                Recorded: {formatDateTime(observation.recordedAt)}
              </span>
            </div>
          </div>
        </div>
      </article>

      {/* Lightbox / Enlarged Photo Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md"
          onClick={() => setSelectedPhoto(null)}
          role="dialog"
          aria-label="Enlarged photo view"
        >
          <div className="relative max-h-[90vh] max-w-2xl overflow-hidden rounded-3xl bg-black border border-white/20 shadow-2xl">
            <button
              type="button"
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-3 right-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/70 text-white hover:bg-black/90 transition-colors"
              aria-label="Close enlarged photo"
            >
              <X className="h-5 w-5" />
            </button>
            <img
              src={selectedPhoto}
              alt="Observation zoomed"
              className="max-h-[85vh] w-auto object-contain"
            />
          </div>
        </div>
      )}
    </>
  )
}

export default ObservationCard