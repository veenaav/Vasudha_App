import { useEffect, useMemo } from 'react'
import type { Observation, IdentificationStatus } from '@/db/database'

// Format ISO timestamp into Indian English localized string
const formatDateTime = (value?: string | null) => {
  if (!value) return 'Not recorded'
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? 'Invalid date'
    : date.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
}

// Format coordinates to 5 decimal places with graceful fallback
const formatCoordinate = (value?: number | string | null) => {
  if (value === null || value === undefined || value === '') return 'Not recorded'
  const num = Number(value)
  return Number.isNaN(num) ? 'Not recorded' : num.toFixed(5)
}

// Visual style mapping for identification verification pills
const STATUS_STYLES: Record<IdentificationStatus, string> = {
  Identified: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  Unknown: 'border-gray-200 bg-gray-100 text-gray-700',
  'Needs verification': 'border-amber-200 bg-amber-50 text-amber-800',
}

interface ObservationCardProps {
  observation: Observation
  onDelete?: (id: number) => void
}

function ObservationCard({ observation }: ObservationCardProps) {
  // Extract photo blobs from props (supports both modern array and legacy single photo)
  const photoBlobs = useMemo(() => {
    const raw = observation.photos?.length ? observation.photos : observation.photo ? [observation.photo] : []
    return raw.filter((item): item is Blob => item instanceof Blob)
  }, [observation.photos, observation.photo])

  // Derive object URLs synchronously from photo blobs
  const photoUrls = useMemo(() => photoBlobs.map((blob) => URL.createObjectURL(blob)), [photoBlobs])

  // Clean up object URLs from memory when blobs change or on component unmount
  useEffect(() => {
    return () => {
      photoUrls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [photoUrls])

  const statusStyle = observation.identificationStatus ? STATUS_STYLES[observation.identificationStatus] : null

  const displaySpeciesGroup =
    observation.speciesGroups === 'Other' && observation.otherSpeciesGroup?.trim()
      ? `Other (${observation.otherSpeciesGroup.trim()})`
      : observation.speciesGroups

  return (
    <div className="rounded-lg border p-4">
      {/* Verification status badge */}
      {statusStyle && (
        <div className="mb-2">
          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusStyle}`}>
            {observation.identificationStatus}
          </span>
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
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 hover:text-red-700 active:scale-95"
            title="Delete observation"
          >
            🗑️ Delete
          </button>
        )}
      </div>

      {/* Common species name (displays 'Unknown species' fallback when unidentified) */}
      {observation.identificationStatus === 'Unknown' ? (
        <p>
          <strong>Species:</strong> Unknown species
        </p>
      ) : observation.speciesName?.trim() ? (
        <p>
          <strong>Species:</strong> {observation.speciesName}
        </p>
      ) : null}

      {/* Scientific name if provided */}
      {observation.scientificName?.trim() && (
        <p className="text-sm text-gray-600">
          <strong>Scientific Name:</strong>{' '}
          <span className="italic">{observation.scientificName}</span>
        </p>
      )}

      {/* Field notes if provided */}
      {observation.notes?.trim() && (
        <p>
          <strong>Notes:</strong> {observation.notes}
        </p>
      )}

      {/* Observation timestamps and GPS location */}
      <p>
        <strong>Observed:</strong> {formatDateTime(observation.observationAt)}
      </p>
      <p>
        <strong>Recorded:</strong> {formatDateTime(observation.recordedAt)}
      </p>
      <p>
        <strong>Latitude:</strong> {formatCoordinate(observation.latitude)}
      </p>
      <p>
        <strong>Longitude:</strong> {formatCoordinate(observation.longitude)}
      </p>

      {/* Photo attachments (single photo full-width or multi-photo grid) */}
      {photoUrls.length > 0 && (
        <div className="mt-4">
          {photoUrls.length === 1 ? (
            <img
              src={photoUrls[0]}
              alt="Observation"
              className="w-full rounded-lg object-cover"
            />
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {photoUrls.map((url, idx) => (
                <img
                  key={idx}
                  src={url}
                  alt={`Observation ${idx + 1}`}
                  className="aspect-square w-full rounded-lg object-cover"
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ObservationCard