import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Observation, IdentificationStatus } from '@/db/database'
import { BASIS_OF_RECORD_OPTIONS } from '@/db/database'
import { getTagById } from '@/lib/tagCatalogue'
import {
  MapPin,
  Clock,
  Calendar,
  Trash2,
  X,
  Pencil,
  Camera,
  Layers,
  Leaf,
  BookOpen,
  Crosshair,
  Hash,
  ShieldCheck,
  Compass,
  Eye,
  EyeOff,
  Tag as TagIcon,
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
  if (value === null || value === undefined || value === '') return null
  const num = Number(value)
  return Number.isNaN(num) ? null : num.toFixed(5)
}

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

function DetailRow({
  icon: Icon,
  iconColor = 'text-[#A6F16A]',
  label,
  value,
  valueClass = 'font-medium text-white',
}: {
  icon?: React.ComponentType<{ className?: string }>
  iconColor?: string
  label: string
  value: React.ReactNode
  valueClass?: string
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-1.5 text-[#7B9586]">
        {Icon && <Icon className={`h-3.5 w-3.5 ${iconColor}`} />}
        <span>{label}:</span>
      </span>
      <span className={valueClass}>{value}</span>
    </div>
  )
}

interface ObservationCardProps {
  observation: Observation
  onDelete?: (id: string) => void
}

function ObservationCard({ observation, onDelete }: ObservationCardProps) {
  const navigate = useNavigate()
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [activePhotoIdx, setActivePhotoIdx] = useState(0)

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

  // Resolve recorded time safely from existing timestamp fields
  const recordedTimestamp = observation.recordedAt || observation.createdAt || observation.observationAt

  // Format coordinates
  const latStr = formatCoordinate(observation.latitude)
  const lngStr = formatCoordinate(observation.longitude)
  const hasCoordinates = latStr !== null && lngStr !== null

  // Extended values for detailed view
  const selectedGroup = observation.speciesGroup || observation.speciesGroups
  const displaySpeciesGroup =
    selectedGroup === 'Other' && observation.otherSpeciesGroup?.trim()
      ? `Other (${observation.otherSpeciesGroup.trim()})`
      : selectedGroup

  const displayMicroHabitat =
    observation.microHabitat === 'Other' && observation.otherMicroHabitat?.trim()
      ? `Other (${observation.otherMicroHabitat.trim()})`
      : observation.microHabitat

  const displayTKSource =
    observation.traditionalKnowledgeSource === 'Other' &&
    observation.otherTraditionalKnowledgeSource?.trim()
      ? `Other (${observation.otherTraditionalKnowledgeSource.trim()})`
      : observation.traditionalKnowledgeSource

  return (
    <>
      {/* 1. Image-first observation card — Entire card is clickable to open details */}
      <article
        onClick={() => setIsDetailOpen(true)}
        className="group cursor-pointer overflow-hidden rounded-3xl border border-[#1C4D3C] bg-[#0D2D22] shadow-lg shadow-[#061812]/50 transition-all duration-200 hover:border-[#A6F16A]/50 hover:shadow-2xl text-[#F0F5EF]"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setIsDetailOpen(true)
          }
        }}
        aria-label={`View details for ${displayTitle}`}
      >
        {/* Photograph occupies top of card visible area */}
        <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-[#061812]">
          {photoUrls.length > 0 ? (
            <img
              src={photoUrls[0]}
              alt={displayTitle}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03] filter brightness-[0.9]"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center bg-[#061812] text-[#7B9586]">
              <Camera className="h-10 w-10 stroke-[1.5] text-[#1C4D3C]" />
              <span className="mt-2 text-xs font-medium tracking-wide">No photograph attached</span>
            </div>
          )}

          {/* 2. Identification status badge — Top-left corner over photograph */}
          {observation.identificationStatus && (
            <div className="absolute top-3 left-3 z-10">
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] tracking-wider uppercase font-semibold backdrop-blur-md shadow-md ${
                  statusConfig?.bg || 'bg-[#061812]/80'
                } ${statusConfig?.text || 'text-white'} ${
                  statusConfig?.border || 'border-[#1C4D3C]'
                }`}
              >
                {observation.identificationStatus}
              </span>
            </div>
          )}

          {/* Delete button inside the card — Top-right corner over photograph */}
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
              className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-[#061812]/80 text-[#B2C8BA] backdrop-blur-md border border-[#1C4D3C] hover:bg-rose-900/80 hover:text-white hover:border-rose-700 transition-all shadow-sm focus:outline-none"
              title="Delete observation from local storage"
              aria-label={`Delete ${displayTitle}`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* 3. Information visible on the card */}
        <div className="p-4 sm:p-5 space-y-2">
          {/* Common / species name */}
          <div>
            <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white line-clamp-1 group-hover:text-[#A6F16A] transition-colors">
              {displayTitle}
            </h3>

            {/* Scientific name */}
            {observation.scientificName?.trim() && (
              <p className="mt-0.5 text-xs sm:text-sm italic text-[#20D6A0] line-clamp-1">
                {observation.scientificName.trim()}
              </p>
            )}
          </div>

          {/* Tags preview on card face */}
          {observation.tags && observation.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1 pt-0.5">
              {observation.tags.slice(0, 3).map((tagId) => {
                const tag = getTagById(tagId)
                return (
                  <span
                    key={tagId}
                    className="inline-flex items-center rounded-md bg-[#133D2F] px-1.5 py-0.5 text-[10px] font-medium text-[#A6F16A] border border-[#1C4D3C]"
                  >
                    #{tag ? tag.label : tagId}
                  </span>
                )
              })}
              {observation.tags.length > 3 && (
                <span className="text-[10px] text-[#7B9586] font-medium">
                  +{observation.tags.length - 3} more
                </span>
              )}
            </div>
          )}

          <div className="pt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 text-xs text-[#7B9586] border-t border-[#1C4D3C]">
            {/* Recorded time */}
            <div className="flex items-center gap-1.5 text-[11px] text-[#B2C8BA]">
              <Clock className="h-3.5 w-3.5 shrink-0 text-[#A6F16A]" />
              <span>{formatDateTime(recordedTimestamp)}</span>
            </div>

            {/* Location coordinates */}
            <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#20D6A0]">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-[#20D6A0]" />
              <span>
                {hasCoordinates ? `${latStr}, ${lngStr}` : 'Coordinates not recorded'}
              </span>
            </div>
          </div>
        </div>
      </article>

      {/* 5. Detailed View Modal */}
      {isDetailOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto"
          onClick={() => setIsDetailOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label={`Observation Details: ${displayTitle}`}
        >
          <div
            className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border border-[#1C4D3C] bg-[#0D2D22] text-[#F0F5EF] shadow-2xl p-5 sm:p-6 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#1C4D3C] pb-3">
              <div>
                <span className="text-[10px] font-semibold tracking-widest uppercase text-[#A6F16A]">
                  Observation Details
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                  {displayTitle}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsDetailOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#061812] border border-[#1C4D3C] text-[#B2C8BA] hover:text-white hover:bg-[#133D2F] transition-colors"
                aria-label="Close detailed view"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Full-size photograph and any additional photos */}
            {photoUrls.length > 0 ? (
              <div className="space-y-2">
                <div className="overflow-hidden rounded-2xl border border-[#1C4D3C] bg-[#061812]">
                  <img
                    src={photoUrls[activePhotoIdx] || photoUrls[0]}
                    alt={`${displayTitle} full size`}
                    className="max-h-72 w-full object-contain"
                  />
                </div>
                {/* Thumbnails if multiple photos */}
                {photoUrls.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {photoUrls.map((url, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActivePhotoIdx(idx)}
                        className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                          activePhotoIdx === idx
                            ? 'border-[#A6F16A] ring-2 ring-[#A6F16A]/40'
                            : 'border-[#1C4D3C] opacity-60 hover:opacity-100'
                        }`}
                        aria-label={`View photo ${idx + 1}`}
                      >
                        <img
                          src={url}
                          alt={`Thumbnail ${idx + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex h-36 w-full flex-col items-center justify-center rounded-2xl border border-[#1C4D3C] bg-[#061812] text-[#7B9586]">
                <Camera className="h-8 w-8 stroke-[1.5] text-[#1C4D3C]" />
                <span className="mt-1.5 text-xs font-medium">No photograph attached</span>
              </div>
            )}

            {/* Taxonomy & Identification details */}
            <div className="rounded-2xl border border-[#1C4D3C] bg-[#061812] p-4 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold tracking-wider uppercase text-[#B2C8BA]">
                  Identification Status
                </span>
                {observation.identificationStatus ? (
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] tracking-wider uppercase font-semibold shadow-xs ${
                      statusConfig?.bg || 'bg-[#133D2F]'
                    } ${statusConfig?.text || 'text-white'} ${
                      statusConfig?.border || 'border-[#1C4D3C]'
                    }`}
                  >
                    {observation.identificationStatus}
                  </span>
                ) : (
                  <span className="text-xs text-[#7B9586]">Not specified</span>
                )}
              </div>

              {/* Organism Status */}
              {observation.organismStatus && (
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-semibold tracking-wider uppercase text-[#B2C8BA]">
                    Organism Status
                  </span>
                  <span className="inline-flex items-center rounded-full border border-[#1C4D3C] bg-[#133D2F] px-2.5 py-0.5 text-[10px] tracking-wider uppercase font-semibold text-[#A6F16A]">
                    {observation.organismStatus}
                  </span>
                </div>
              )}

              {/* Basis of Record */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold tracking-wider uppercase text-[#B2C8BA]">
                  Basis of Record
                </span>
                <span className="inline-flex items-center rounded-full border border-[#1C4D3C] bg-[#133D2F] px-2.5 py-0.5 text-[10px] tracking-wider uppercase font-semibold text-[#20D6A0]">
                  {BASIS_OF_RECORD_OPTIONS.find((o) => o.value === observation.basis_of_record)?.label ||
                    observation.basis_of_record ||
                    'Human Observation'}
                </span>
              </div>

              {observation.scientificName?.trim() && (
                <div className="text-sm">
                  <span className="text-xs text-[#7B9586] block">Scientific Name:</span>
                  <span className="italic font-bold text-[#A6F16A]">
                    {observation.scientificName.trim()}
                  </span>
                </div>
              )}

              {observation.localName?.trim() && (
                <div className="text-sm">
                  <span className="text-xs text-[#7B9586] block">Local / Regional Name:</span>
                  <span className="font-semibold text-white">
                    {observation.localName.trim()}
                  </span>
                </div>
              )}

              {displaySpeciesGroup?.trim() && (
                <div className="text-sm flex items-center gap-1.5 text-[#F0F5EF]">
                  <Leaf className="h-3.5 w-3.5 text-[#A6F16A]" />
                  <span className="text-xs text-[#7B9586]">Group:</span>
                  <span className="font-semibold text-white">{displaySpeciesGroup}</span>
                </div>
              )}
            </div>

            {/* Temporal info */}
            <div className="rounded-2xl border border-[#1C4D3C] bg-[#061812] p-4 space-y-2 text-xs text-[#B2C8BA]">
              {observation.observationAt && (
                <DetailRow
                  icon={Calendar}
                  iconColor="text-[#A6F16A]"
                  label="Observation Time"
                  value={formatDateTime(observation.observationAt)}
                />
              )}

              {recordedTimestamp && (
                <DetailRow
                  icon={Clock}
                  iconColor="text-[#20D6A0]"
                  label="Recorded Time"
                  value={formatDateTime(recordedTimestamp)}
                />
              )}
            </div>

            {/* Geolocation & GPS Accuracy */}
            <div className="rounded-2xl border border-[#1C4D3C] bg-[#061812] p-4 space-y-2 text-xs">
              <DetailRow
                icon={MapPin}
                iconColor="text-[#A6F16A]"
                label="Final Coordinates"
                value={hasCoordinates ? `${latStr}, ${lngStr}` : 'Not recorded'}
                valueClass="font-mono font-medium text-[#A6F16A]"
              />

              {observation.location_source && (
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[#7B9586]">
                    <Crosshair className="h-3.5 w-3.5 text-[#20D6A0]" />
                    <span>Location Source:</span>
                  </span>
                  <span
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase ${
                      observation.location_source === 'GPS'
                        ? 'bg-[#133D2F] border-[#1C4D3C] text-[#A6F16A]'
                        : 'bg-amber-950/60 border-amber-800/60 text-amber-300'
                    }`}
                  >
                    {observation.location_source}
                  </span>
                </div>
              )}

              {observation.gps_latitude !== null &&
                observation.gps_latitude !== undefined &&
                observation.gps_longitude !== null &&
                observation.gps_longitude !== undefined && (
                  <DetailRow
                    icon={Compass}
                    iconColor="text-[#20D6A0]"
                    label="Raw GPS"
                    value={`${formatCoordinate(observation.gps_latitude)}, ${formatCoordinate(observation.gps_longitude)}`}
                    valueClass="font-mono font-medium text-[#B2C8BA]"
                  />
                )}

              {observation.accuracyMeters !== null && observation.accuracyMeters !== undefined && (
                <DetailRow
                  icon={Crosshair}
                  iconColor="text-[#A6F16A]"
                  label="GPS Sensor Accuracy"
                  value={`±${Math.round(observation.accuracyMeters)} metres`}
                />
              )}

              <div className="flex items-center justify-between pt-1 border-t border-[#1C4D3C]">
                <span className="flex items-center gap-1.5 text-[#7B9586]">
                  <Compass className="h-3.5 w-3.5 text-[#20D6A0]" />
                  <span>Administrative Ward:</span>
                </span>
                <span className="font-medium text-white text-right">
                  {observation.wardName || (observation.wardId ? `Ward ID: ${observation.wardId}` : 'Automatic GIS identification pending')}
                </span>
              </div>

              {/* Location Visibility preference */}
              {observation.locationVisibility && (
                <div className="flex items-start justify-between gap-2 pt-1 border-t border-[#1C4D3C]">
                  <span className="flex items-center gap-1.5 text-[#7B9586] shrink-0">
                    {observation.locationVisibility === 'Open' ? (
                      <Eye className="h-3.5 w-3.5 text-[#A6F16A]" />
                    ) : (
                      <EyeOff className="h-3.5 w-3.5 text-amber-400" />
                    )}
                    <span>Location Visibility:</span>
                  </span>
                  <div className="text-right">
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase ${
                        observation.locationVisibility === 'Open'
                          ? 'bg-[#133D2F] border-[#1C4D3C] text-[#A6F16A]'
                          : observation.locationVisibility === 'Obscured'
                          ? 'bg-amber-950/60 border-amber-800/60 text-amber-300'
                          : 'bg-rose-950/60 border-rose-800/60 text-rose-300'
                      }`}
                    >
                      {observation.locationVisibility}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Habitat & Ecology (only if data exists) */}
            {(displayMicroHabitat || observation.individualCount !== undefined || observation.lifeStage) && (
              <div className="rounded-2xl border border-[#1C4D3C] bg-[#061812] p-4 space-y-2 text-xs">
                <span className="text-[10px] font-semibold tracking-widest uppercase text-[#7B9586] block">
                  Ecology & Count
                </span>

                {observation.individualCount !== undefined && (
                  <DetailRow
                    icon={Hash}
                    iconColor="text-[#A6F16A]"
                    label="Individual Count"
                    value={observation.individualCount}
                  />
                )}

                {observation.lifeStage && (
                  <DetailRow
                    label="Life Stage"
                    value={observation.lifeStage}
                  />
                )}

                {displayMicroHabitat && (
                  <DetailRow
                    icon={Layers}
                    iconColor="text-[#20D6A0]"
                    label="Micro-Habitat"
                    value={displayMicroHabitat}
                  />
                )}
              </div>
            )}

            {/* Classification Tags */}
            {observation.tags && observation.tags.length > 0 && (
              <div className="rounded-2xl border border-[#1C4D3C] bg-[#061812] p-4 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[10px] font-semibold tracking-widest uppercase text-[#7B9586]">
                    <TagIcon className="h-3.5 w-3.5 text-[#A6F16A]" />
                    <span>Classification Tags ({observation.tags.length})</span>
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {observation.tags.map((tagId) => {
                    const tag = getTagById(tagId)
                    return (
                      <span
                        key={tagId}
                        className="inline-flex items-center gap-1 rounded-full border border-[#1C4D3C] bg-[#0D2D22] px-2.5 py-1 text-[11px] font-medium text-white shadow-2xs"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-[#A6F16A]" />
                        <span>{tag ? tag.label : tagId}</span>
                        {tag && (
                          <span className="text-[9px] uppercase tracking-wider text-[#7B9586] border-l border-[#1C4D3C] pl-1 ml-0.5 font-normal">
                            {tag.category}
                          </span>
                        )}
                      </span>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Traditional Knowledge */}
            {observation.hasTraditionalKnowledge === 'Yes' && (
              <div className="rounded-2xl border border-amber-800/60 bg-amber-950/40 p-4 text-xs text-amber-200 space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-amber-300 uppercase tracking-wider">
                  <BookOpen className="h-4 w-4" />
                  <span>Traditional Knowledge Documented</span>
                </div>
                {displayTKSource && (
                  <p className="text-[#B2C8BA] pt-1">
                    <span className="font-medium text-white">Source:</span> {displayTKSource}
                  </p>
                )}
              </div>
            )}

            {/* Field Notes */}
            {observation.notes?.trim() && (
              <div className="rounded-2xl border border-[#1C4D3C] bg-[#061812] p-4 text-xs">
                <span className="text-[10px] font-semibold tracking-widest uppercase text-[#7B9586] block mb-1">
                  Field Notes
                </span>
                <p className="whitespace-pre-wrap leading-relaxed text-[#F0F5EF] text-sm">
                  {observation.notes}
                </p>
              </div>
            )}

            {/* Verification Status */}
            {observation.verificationStatus && (
              <div className="rounded-2xl border border-[#1C4D3C] bg-[#061812] p-4 text-xs flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[#7B9586]">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#20D6A0]" />
                  <span>Expert Verification:</span>
                </span>
                <span className="font-medium text-white">{observation.verificationStatus}</span>
              </div>
            )}

            {/* Footer Actions */}
            <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
              {observation.id && (
                <button
                  type="button"
                  onClick={() => {
                    setIsDetailOpen(false)
                    navigate(`/observations/${observation.id}/edit`)
                  }}
                  className="flex-1 inline-flex min-h-[46px] items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#A6F16A] to-[#20D6A0] text-[#061812] font-bold px-5 py-2.5 text-xs tracking-wider uppercase transition-all shadow-md active:scale-95"
                >
                  <Pencil className="h-4 w-4 text-[#061812]" />
                  <span>Edit Observation</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsDetailOpen(false)}
                className="inline-flex min-h-[46px] items-center justify-center rounded-2xl border border-[#1C4D3C] bg-[#061812] px-5 py-2.5 text-xs font-semibold tracking-wider uppercase text-[#B2C8BA] hover:text-white hover:bg-[#133D2F] transition-all active:scale-95"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default ObservationCard
