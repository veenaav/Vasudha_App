import { useEffect, useMemo, useState } from 'react'
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

// Visual style mapping for identification verification pills matching B-LIFFE palette
const STATUS_STYLES: Record<IdentificationStatus, { bg: string; text: string; border: string }> = {
  Identified: {
    bg: 'bg-[#165B33]',
    text: 'text-white',
    border: 'border-emerald-600',
  },
  Unknown: {
    bg: 'bg-slate-700',
    text: 'text-white',
    border: 'border-slate-600',
  },
  'Needs verification': {
    bg: 'bg-[#EA580C]',
    text: 'text-white',
    border: 'border-orange-500',
  },
}

interface ObservationCardProps {
  observation: Observation
  onDelete?: (id: string) => void
}

function ObservationCard({ observation, onDelete }: ObservationCardProps) {
  const navigate = useNavigate()
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [activePhotoIdx, setActivePhotoIdx] = useState(0)

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
        className="group cursor-pointer overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-xs transition-all duration-200 hover:border-emerald-300 hover:shadow-md text-slate-800"
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
        {/* Photograph occupies 60–70% of card visible area */}
        <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-100">
          {photoUrls.length > 0 ? (
            <img
              src={photoUrls[0]}
              alt={displayTitle}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center bg-slate-100 text-slate-400">
              <Camera className="h-10 w-10 stroke-[1.5] text-slate-300" />
              <span className="mt-2 text-xs font-medium tracking-wide">No photograph attached</span>
            </div>
          )}

          {/* 2. Identification status badge — Top-left corner over photograph */}
          {observation.identificationStatus && (
            <div className="absolute top-3 left-3 z-10">
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] tracking-wider uppercase font-medium shadow-xs ${
                  statusConfig?.bg || 'bg-slate-700'
                } ${statusConfig?.text || 'text-white'} ${
                  statusConfig?.border || 'border-slate-600'
                }`}
              >
                {observation.identificationStatus}
              </span>
            </div>
          )}

          {/* 4. Delete button inside the card — Top-right corner over photograph */}
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
              className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-700 backdrop-blur-md border border-slate-200 hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              title="Delete observation from local storage"
              aria-label={`Delete ${displayTitle}`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* 3. Information visible on the card — Only Name, Scientific Name, Recorded Time, Coordinates */}
        <div className="p-4 sm:p-5 space-y-2">
          {/* Common / species name — prominent and bold */}
          <div>
            <h3 className="font-heading text-lg sm:text-xl font-semibold tracking-tight text-slate-900 line-clamp-1">
              {displayTitle}
            </h3>

            {/* Scientific name — secondary text, if available */}
            {observation.scientificName?.trim() && (
              <p className="mt-0.5 text-xs sm:text-sm italic text-emerald-800 line-clamp-1">
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
                    className="inline-flex items-center rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-800 border border-emerald-100/80"
                  >
                    #{tag ? tag.label : tagId}
                  </span>
                )
              })}
              {observation.tags.length > 3 && (
                <span className="text-[10px] text-slate-400 font-medium">
                  +{observation.tags.length - 3} more
                </span>
              )}
            </div>
          )}

          <div className="pt-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 text-xs text-slate-500 border-t border-slate-100">
            {/* Recorded time — smaller text */}
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <Clock className="h-3.5 w-3.5 shrink-0 text-[#165B33]" />
              <span>{formatDateTime(recordedTimestamp)}</span>
            </div>

            {/* Location coordinates — latitude and longitude */}
            <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-700">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-[#165B33]" />
              <span>
                {hasCoordinates ? `${latStr}, ${lngStr}` : 'Coordinates not recorded'}
              </span>
            </div>
          </div>
        </div>
      </article>

      {/* 5. Detailed View Modal — Extended information, only non-empty fields */}
      {isDetailOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto"
          onClick={() => setIsDetailOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label={`Observation Details: ${displayTitle}`}
        >
          <div
            className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200 bg-white text-slate-800 shadow-2xl p-5 sm:p-6 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-[10px] font-semibold tracking-widest uppercase text-[#165B33]">
                  Observation Details
                </span>
                <h2 className="font-heading text-xl sm:text-2xl font-semibold text-slate-900">
                  {displayTitle}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsDetailOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors"
                aria-label="Close detailed view"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Full-size photograph and any additional photos */}
            {photoUrls.length > 0 ? (
              <div className="space-y-2">
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
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
                            ? 'border-[#165B33] ring-2 ring-[#165B33]/40'
                            : 'border-slate-200 opacity-70 hover:opacity-100'
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
              <div className="flex h-36 w-full flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-400">
                <Camera className="h-8 w-8 stroke-[1.5] text-slate-300" />
                <span className="mt-1.5 text-xs font-medium">No photograph attached</span>
              </div>
            )}

            {/* Taxonomy & Identification details */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold tracking-wider uppercase text-slate-500">
                  Identification Status
                </span>
                {observation.identificationStatus ? (
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] tracking-wider uppercase font-semibold shadow-xs ${
                      statusConfig?.bg || 'bg-slate-700'
                    } ${statusConfig?.text || 'text-white'} ${
                      statusConfig?.border || 'border-slate-600'
                    }`}
                  >
                    {observation.identificationStatus}
                  </span>
                ) : (
                  <span className="text-xs text-slate-400">Not specified</span>
                )}
              </div>

              {/* Organism Status (only present on observations recorded after this field was added) */}
              {observation.organismStatus && (
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-semibold tracking-wider uppercase text-slate-500">
                    Organism Status
                  </span>
                  <span className="inline-flex items-center rounded-full border border-slate-300 bg-slate-100 px-2.5 py-0.5 text-[10px] tracking-wider uppercase font-semibold text-slate-700">
                    {observation.organismStatus}
                  </span>
                </div>
              )}

              {/* Basis of Record (Darwin Core standard evidence nature) */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold tracking-wider uppercase text-slate-500">
                  Basis of Record
                </span>
                <span className="inline-flex items-center rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-0.5 text-[10px] tracking-wider uppercase font-semibold text-emerald-800">
                  {BASIS_OF_RECORD_OPTIONS.find((o) => o.value === observation.basis_of_record)?.label ||
                    observation.basis_of_record ||
                    'Human Observation'}
                </span>
              </div>

              {observation.scientificName?.trim() && (
                <div className="text-sm">
                  <span className="text-xs text-slate-500 block">Scientific Name:</span>
                  <span className="italic font-semibold text-emerald-800">
                    {observation.scientificName.trim()}
                  </span>
                </div>
              )}

              {observation.localName?.trim() && (
                <div className="text-sm">
                  <span className="text-xs text-slate-500 block">Local / Regional Name:</span>
                  <span className="font-semibold text-slate-800">
                    {observation.localName.trim()}
                  </span>
                </div>
              )}

              {displaySpeciesGroup?.trim() && (
                <div className="text-sm flex items-center gap-1.5 text-slate-700">
                  <Leaf className="h-3.5 w-3.5 text-[#165B33]" />
                  <span className="text-xs text-slate-500">Group:</span>
                  <span className="font-semibold text-slate-800">{displaySpeciesGroup}</span>
                </div>
              )}
            </div>

            {/* Temporal info */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-2 text-xs text-slate-600">
              {observation.observationAt && (
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-[#165B33]" />
                    <span>Observation Time:</span>
                  </span>
                  <span className="font-medium text-slate-800">
                    {formatDateTime(observation.observationAt)}
                  </span>
                </div>
              )}

              {recordedTimestamp && (
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-[#165B33]" />
                    <span>Recorded Time:</span>
                  </span>
                  <span className="font-medium text-slate-800">
                    {formatDateTime(recordedTimestamp)}
                  </span>
                </div>
              )}
            </div>

            {/* Geolocation & GPS Accuracy */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-500">
                  <MapPin className="h-3.5 w-3.5 text-[#165B33]" />
                  <span>Final Coordinates:</span>
                </span>
                <span className="font-mono font-medium text-slate-800">
                  {hasCoordinates ? `${latStr}, ${lngStr}` : 'Not recorded'}
                </span>
              </div>

              {observation.location_source && (
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <Crosshair className="h-3.5 w-3.5 text-[#165B33]" />
                    <span>Location Source:</span>
                  </span>
                  <span
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase ${
                      observation.location_source === 'GPS'
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                        : 'bg-amber-50 border-amber-300 text-amber-800'
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
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <Compass className="h-3.5 w-3.5 text-[#165B33]" />
                      <span>Raw GPS:</span>
                    </span>
                    <span className="font-mono font-medium text-slate-600">
                      {formatCoordinate(observation.gps_latitude)}, {formatCoordinate(observation.gps_longitude)}
                    </span>
                  </div>
                )}

              {observation.accuracyMeters !== null && observation.accuracyMeters !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <Crosshair className="h-3.5 w-3.5 text-[#165B33]" />
                    <span>GPS Sensor Accuracy:</span>
                  </span>
                  <span className="font-medium text-slate-800">
                    ±{Math.round(observation.accuracyMeters)} metres
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                <span className="flex items-center gap-1.5 text-slate-500">
                  <Compass className="h-3.5 w-3.5 text-[#165B33]" />
                  <span>Administrative Ward:</span>
                </span>
                <span className="font-medium text-slate-800 text-right">
                  {observation.wardName || (observation.wardId ? `Ward ID: ${observation.wardId}` : 'Automatic GIS identification pending')}
                </span>
              </div>

              {/* Location Visibility preference — only shown if set; absent on older records */}
              {observation.locationVisibility && (
                <div className="flex items-start justify-between gap-2 pt-1 border-t border-slate-200">
                  <span className="flex items-center gap-1.5 text-slate-500 shrink-0">
                    {observation.locationVisibility === 'Open' ? (
                      <Eye className="h-3.5 w-3.5 text-[#165B33]" />
                    ) : (
                      <EyeOff className="h-3.5 w-3.5 text-[#B87555]" />
                    )}
                    <span>Location Visibility:</span>
                  </span>
                  <div className="text-right">
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase ${
                        observation.locationVisibility === 'Open'
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                          : observation.locationVisibility === 'Obscured'
                          ? 'bg-amber-50 border-amber-300 text-amber-800'
                          : 'bg-rose-50 border-rose-300 text-rose-800'
                      }`}
                    >
                      {observation.locationVisibility}
                    </span>
                    <p className="mt-1 text-[10px] text-slate-400 leading-snug">
                      Stored preference only — public enforcement requires a future backend.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Habitat & Ecology (only if data exists) */}
            {(displayMicroHabitat || observation.individualCount !== undefined || observation.lifeStage) && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-2 text-xs">
                <span className="text-[10px] font-semibold tracking-widest uppercase text-slate-500 block">
                  Ecology & Count
                </span>

                {observation.individualCount !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <Hash className="h-3.5 w-3.5 text-[#165B33]" />
                      <span>Individual Count:</span>
                    </span>
                    <span className="font-medium text-slate-800">
                      {observation.individualCount}
                    </span>
                  </div>
                )}

                {observation.lifeStage && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Life Stage:</span>
                    <span className="font-medium text-slate-800">{observation.lifeStage}</span>
                  </div>
                )}

                {displayMicroHabitat && (
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <Layers className="h-3.5 w-3.5 text-[#165B33]" />
                      <span>Micro-Habitat:</span>
                    </span>
                    <span className="font-medium text-slate-800">{displayMicroHabitat}</span>
                  </div>
                )}
              </div>
            )}

            {/* Classification Tags (only if present) */}
            {observation.tags && observation.tags.length > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[10px] font-semibold tracking-widest uppercase text-slate-500">
                    <TagIcon className="h-3.5 w-3.5 text-[#165B33]" />
                    <span>Classification Tags ({observation.tags.length})</span>
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {observation.tags.map((tagId) => {
                    const tag = getTagById(tagId)
                    return (
                      <span
                        key={tagId}
                        className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-800 shadow-2xs"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-[#165B33]" />
                        <span>{tag ? tag.label : tagId}</span>
                        {tag && (
                          <span className="text-[9px] uppercase tracking-wider text-slate-400 border-l border-slate-200 pl-1 ml-0.5 font-normal">
                            {tag.category}
                          </span>
                        )}
                      </span>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Traditional Knowledge information (only if present) */}
            {observation.hasTraditionalKnowledge === 'Yes' && (
              <div className="rounded-2xl border border-orange-200 bg-orange-50/80 p-4 text-xs text-orange-950 space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-[#EA580C] uppercase tracking-wider">
                  <BookOpen className="h-4 w-4" />
                  <span>Traditional Knowledge Documented</span>
                </div>
                {displayTKSource && (
                  <p className="text-slate-700 pt-1">
                    <span className="font-medium text-slate-900">Source:</span> {displayTKSource}
                  </p>
                )}
              </div>
            )}

            {/* Field Notes (only if present) */}
            {observation.notes?.trim() && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs">
                <span className="text-[10px] font-semibold tracking-widest uppercase text-slate-500 block mb-1">
                  Field Notes
                </span>
                <p className="whitespace-pre-wrap leading-relaxed text-slate-800 text-sm">
                  {observation.notes}
                </p>
              </div>
            )}

            {/* Verification Status (only if present) */}
            {observation.verificationStatus && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-xs flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-500">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#165B33]" />
                  <span>Expert Verification:</span>
                </span>
                <span className="font-medium text-slate-800">{observation.verificationStatus}</span>
              </div>
            )}

            {/* 6. Footer Actions: Edit Observation Button and Close Button */}
            <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
              {observation.id && (
                <button
                  type="button"
                  onClick={() => {
                    setIsDetailOpen(false)
                    navigate(`/observations/${observation.id}/edit`)
                  }}
                  className="flex-1 inline-flex min-h-[46px] items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#165B33] to-[#1E7B46] hover:from-[#134D2C] hover:to-[#17663A] border border-emerald-600/30 px-5 py-2.5 text-xs font-medium tracking-wider uppercase text-white transition-all shadow-md active:scale-95"
                >
                  <Pencil className="h-4 w-4 text-emerald-100" />
                  <span>Edit Observation</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsDetailOpen(false)}
                className="inline-flex min-h-[46px] items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-medium tracking-wider uppercase text-slate-700 hover:bg-slate-50 transition-all active:scale-95 shadow-xs"
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