import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  ArrowLeft,
  Pencil,
  Trash2,
  MapPin,
  Calendar,
  Camera,
  ChevronLeft,
  ChevronRight,
  Tag as TagIcon,
  BookOpen,
  Info,
} from 'lucide-react'
import { db, type Observation, type IdentificationStatus, BASIS_OF_RECORD_OPTIONS } from '@/db/database'
import { getTagById } from '@/lib/tagCatalogue'
import { reverseGeocodeCoordinates } from '@/lib/reverseGeocode'

// Status styling configuration matching B-LIFFE dark forest palette
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

export default function ObservationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [observation, setObservation] = useState<Observation | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [photoUrls, setPhotoUrls] = useState<string[]>([])
  const [activePhotoIdx, setActivePhotoIdx] = useState(0)
  const [resolvedLocationName, setResolvedLocationName] = useState<string>('')
  const [isDeleting, setIsDeleting] = useState(false)

  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<L.Map | null>(null)

  // 1. Fetch observation record from Dexie
  useEffect(() => {
    async function loadObservation() {
      if (!id) {
        setIsLoading(false)
        return
      }
      try {
        const item = await db.observations.get(id)
        if (item) {
          setObservation(item)
        }
      } catch (err) {
        console.error('Failed to load observation:', err)
      } finally {
        setIsLoading(false)
      }
    }
    loadObservation()
  }, [id])

  // 2. Resolve photographs into object URLs with lifecycle cleanup
  useEffect(() => {
    if (!observation) return

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
  }, [observation])

  // 3. Resolve location place name (Reverse Geocoding or wardName)
  useEffect(() => {
    if (!observation) return

    let isMounted = true

    async function resolveLocation() {
      // If wardName is already formatted cleanly, set as immediate value
      if (observation?.wardName?.trim()) {
        // Strip verbose "Ward xx - " prefix if present to show pure place name
        const cleanWard = observation.wardName.replace(/^Ward\s*\d+\s*[-–—]\s*/i, '').trim()
        setResolvedLocationName(cleanWard || observation.wardName.trim())
      }

      // If latitude and longitude exist, attempt reverse geocoding for precise place name
      if (
        typeof observation?.latitude === 'number' &&
        typeof observation?.longitude === 'number' &&
        !Number.isNaN(observation.latitude) &&
        !Number.isNaN(observation.longitude)
      ) {
        try {
          const res = await reverseGeocodeCoordinates(observation.latitude, observation.longitude)
          if (isMounted && res?.locationName) {
            setResolvedLocationName(res.locationName)
          }
        } catch (err) {
          console.info('Reverse geocoding unavailable offline:', err)
        }
      }
    }

    resolveLocation()

    return () => {
      isMounted = false
    }
  }, [observation])

  // 4. Initialize Embedded Leaflet Map showing exact GPS coordinates pinned
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current || !observation) return

    const lat = observation.latitude
    const lng = observation.longitude

    if (
      typeof lat !== 'number' ||
      typeof lng !== 'number' ||
      Number.isNaN(lat) ||
      Number.isNaN(lng)
    ) {
      return
    }

    const map = L.map(mapContainerRef.current, {
      center: [lat, lng],
      zoom: 16,
      zoomControl: true,
      scrollWheelZoom: false, // Prevent intercepting page scrolling
      attributionControl: true,
    })

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors',
    }).addTo(map)

    // Themed B-LIFFE Pin Marker
    const customIcon = L.divIcon({
      className: 'bliffe-pin-marker',
      html: `<div style="display:flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:50%;background:#0D2D22;border:2.5px solid #20D6A0;box-shadow:0 4px 14px rgba(0,0,0,0.7);">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A6F16A" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>
      </div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
      popupAnchor: [0, -18],
    })

    const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map)
    const title = observation.speciesName?.trim() || 'Species Observation'
    marker.bindPopup(`
      <div style="font-family:sans-serif;font-size:12px;color:#061812;padding:2px;">
        <b style="font-size:13px;">${title}</b><br/>
        <span style="color:#555;">${lat.toFixed(5)}, ${lng.toFixed(5)}</span>
      </div>
    `)

    mapRef.current = map

    // Ensure tiles render seamlessly within responsive layout
    const timer = setTimeout(() => {
      map.invalidateSize()
    }, 250)

    return () => {
      clearTimeout(timer)
      map.remove()
      mapRef.current = null
    }
  }, [observation])

  // Delete observation handler
  const handleDelete = async () => {
    if (!observation?.id) return
    const name = observation.speciesName?.trim() || 'this observation'
    if (window.confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) {
      setIsDeleting(true)
      try {
        await db.observations.delete(observation.id)
        navigate('/observations', { replace: true })
      } catch (err) {
        console.error('Failed to delete observation:', err)
        alert('Failed to delete observation. Please try again.')
        setIsDeleting(false)
      }
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 text-center text-[#7B9586]">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-[#A6F16A] border-t-transparent mb-3" />
        <p className="text-sm font-medium">Loading observation details...</p>
      </div>
    )
  }

  if (!observation) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center text-[#F0F5EF] space-y-4">
        <h2 className="text-2xl font-bold text-white">Record Not Found</h2>
        <p className="text-sm text-[#B2C8BA]">
          This observation record could not be found or may have been removed.
        </p>
        <Link
          to="/observations"
          className="inline-flex items-center gap-2 rounded-full bg-[#0D2D22] border border-[#1C4D3C] px-5 py-2.5 text-sm font-semibold text-[#A6F16A] hover:bg-[#133D2F] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Records</span>
        </Link>
      </div>
    )
  }

  // Display names and titles
  const commonName = observation.speciesName?.trim()
  const displayTitle =
    commonName ||
    (observation.identificationStatus === 'Unknown' ? 'Unknown species' : 'Unnamed observation')

  // Unified Single Timestamp (no verbose prefixes)
  const unifiedTimestamp = observation.observationAt || observation.recordedAt || observation.createdAt
  const formattedDateTime = unifiedTimestamp
    ? new Date(unifiedTimestamp).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : 'Date not recorded'

  const hasCoordinates =
    typeof observation.latitude === 'number' &&
    typeof observation.longitude === 'number' &&
    !Number.isNaN(observation.latitude) &&
    !Number.isNaN(observation.longitude)

  const statusConfig = observation.identificationStatus
    ? STATUS_STYLES[observation.identificationStatus]
    : null

  const displayLocation =
    resolvedLocationName ||
    (hasCoordinates
      ? `${observation.latitude?.toFixed(5)}° N, ${observation.longitude?.toFixed(5)}° E`
      : 'Location not recorded')

  return (
    <div className="mx-auto max-w-2xl px-3.5 sm:px-6 py-4 sm:py-6 space-y-6 text-[#F0F5EF] pb-16">
      {/* 1. Clean Top Header Bar */}
      <div className="flex items-center justify-between border-b border-[#1C4D3C]/60 pb-3">
        <button
          type="button"
          onClick={() => navigate('/observations')}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#B2C8BA] hover:text-white transition-colors cursor-pointer group"
          aria-label="Back to My Records"
        >
          <ArrowLeft className="h-4 w-4 text-[#A6F16A] group-hover:-translate-x-0.5 transition-transform" />
          <span>My Records</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Edit Action */}
          <Link
            to={`/observations/${observation.id}/edit`}
            className="inline-flex h-9 items-center gap-1.5 px-3 rounded-xl bg-[#0D2D22] border border-[#1C4D3C] text-xs font-semibold text-[#A6F16A] hover:bg-[#133D2F] hover:text-white transition-all shadow-xs"
            title="Edit Observation"
          >
            <Pencil className="h-3.5 w-3.5" />
            <span>Edit</span>
          </Link>

          {/* Delete Action */}
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="inline-flex h-9 w-9 sm:w-auto sm:px-3 items-center justify-center gap-1.5 rounded-xl bg-[#0D2D22] border border-rose-900/50 text-xs font-semibold text-rose-400 hover:bg-rose-950/60 hover:text-rose-300 transition-all cursor-pointer shadow-xs disabled:opacity-50"
            title="Delete Observation"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{isDeleting ? 'Deleting...' : 'Delete'}</span>
          </button>
        </div>
      </div>

      {/* 2. Full-Width Edge-to-Edge Photograph Frame without empty side margins */}
      <div className="relative w-full overflow-hidden rounded-2xl sm:rounded-3xl border border-[#1C4D3C] bg-[#061812] shadow-xl">
        <div className="relative aspect-[4/3] sm:aspect-[16/10] w-full overflow-hidden bg-[#061812] flex items-center justify-center">
          {photoUrls.length > 0 ? (
            <img
              src={photoUrls[activePhotoIdx] || photoUrls[0]}
              alt={displayTitle}
              className="h-full w-full object-cover transition-transform duration-300 filter brightness-[0.98]"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center bg-[#061812] text-[#7B9586] p-6">
              <Camera className="h-10 w-10 sm:h-12 sm:w-12 stroke-[1.5] text-[#1C4D3C]" />
              <span className="mt-2 text-xs sm:text-sm font-medium tracking-wide">
                No photograph attached
              </span>
            </div>
          )}

          {/* Status Badge Overlaid on Photo */}
          {observation.identificationStatus && (
            <div className="absolute top-3 left-3 z-10">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] sm:text-xs font-semibold tracking-wider uppercase backdrop-blur-md shadow-md ${
                  statusConfig?.bg || 'bg-[#061812]/80'
                } ${statusConfig?.text || 'text-white'} ${
                  statusConfig?.border || 'border-[#1C4D3C]'
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full shrink-0 bg-current" />
                <span>{observation.identificationStatus}</span>
              </span>
            </div>
          )}

          {/* Multi-Photo Carousel Controls */}
          {photoUrls.length > 1 && (
            <>
              {/* Prev Button */}
              <button
                type="button"
                onClick={() =>
                  setActivePhotoIdx((prev) => (prev > 0 ? prev - 1 : photoUrls.length - 1))
                }
                className="absolute left-3 top-1/2 -translate-y-1/2 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-[#061812]/85 text-white hover:bg-[#133D2F] hover:text-[#A6F16A] border border-[#1C4D3C] transition-all cursor-pointer shadow-lg active:scale-95"
                aria-label="Previous photo"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              {/* Next Button */}
              <button
                type="button"
                onClick={() =>
                  setActivePhotoIdx((prev) => (prev < photoUrls.length - 1 ? prev + 1 : 0))
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-[#061812]/85 text-white hover:bg-[#133D2F] hover:text-[#A6F16A] border border-[#1C4D3C] transition-all cursor-pointer shadow-lg active:scale-95"
                aria-label="Next photo"
              >
                <ChevronRight className="h-5 w-5" />
              </button>

              {/* Counter Pill */}
              <div className="absolute bottom-3 right-3 z-10">
                <span className="rounded-full bg-[#061812]/90 backdrop-blur-md px-2.5 py-1 text-xs font-semibold text-[#A6F16A] border border-[#1C4D3C] shadow-md">
                  {activePhotoIdx + 1} / {photoUrls.length}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Thumbnail Strip if Multiple Photos */}
        {photoUrls.length > 1 && (
          <div className="flex gap-2 overflow-x-auto p-2.5 bg-[#061812] border-t border-[#1C4D3C]">
            {photoUrls.map((url, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActivePhotoIdx(idx)}
                className={`relative h-14 w-14 sm:h-16 sm:w-16 shrink-0 overflow-hidden rounded-xl border-2 transition-all cursor-pointer ${
                  activePhotoIdx === idx
                    ? 'border-[#A6F16A] ring-2 ring-[#A6F16A]/50 scale-102'
                    : 'border-[#1C4D3C] opacity-60 hover:opacity-100'
                }`}
                aria-label={`View photo ${idx + 1}`}
              >
                <img src={url} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 3. Species Name & Scientific Name (Continuous Clean Flow) */}
      <div className="space-y-1.5 pt-1">
        <div className="space-y-0.5">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
            {displayTitle}
          </h1>

          {/* Scientific Name in italics and smaller font right beneath or next to common name */}
          {observation.scientificName?.trim() && (
            <p className="text-base sm:text-lg italic text-[#20D6A0] font-medium leading-snug">
              {observation.scientificName.trim()}
            </p>
          )}

          {/* Regional Name if recorded */}
          {observation.localName?.trim() && (
            <p className="text-sm text-[#B2C8BA] font-normal pt-0.5">
              Regional name: <span className="text-white font-medium">{observation.localName.trim()}</span>
            </p>
          )}
        </div>

        {/* Simplified Single Timestamp (No separate observation/recorded time labels) */}
        <div className="flex items-center gap-2 pt-1 text-xs sm:text-sm text-[#B2C8BA]">
          <Calendar className="h-4 w-4 text-[#A6F16A] shrink-0" />
          <span>{formattedDateTime}</span>
        </div>
      </div>

      {/* Minimal Divider */}
      <div className="border-t border-[#1C4D3C]/50" />

      {/* 4. Continuous Key Observation Details (No Heavy Boxed Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-6 text-sm">
        {/* Basis of Record */}
        <div>
          <span className="block text-[11px] font-bold uppercase tracking-wider text-[#7B9586]">
            Basis of Record
          </span>
          <span className="font-semibold text-white mt-0.5 block">
            {BASIS_OF_RECORD_OPTIONS.find((o) => o.value === observation.basis_of_record)?.label ||
              observation.basis_of_record ||
              'Human Observation'}
          </span>
        </div>

        {/* Species Group */}
        {observation.speciesGroup && (
          <div>
            <span className="block text-[11px] font-bold uppercase tracking-wider text-[#7B9586]">
              Species Group
            </span>
            <span className="font-semibold text-[#A6F16A] mt-0.5 block">
              {observation.speciesGroup}
            </span>
          </div>
        )}

        {/* Organism Status */}
        {observation.organismStatus && (
          <div>
            <span className="block text-[11px] font-bold uppercase tracking-wider text-[#7B9586]">
              Organism Status
            </span>
            <span className="font-semibold text-white mt-0.5 block">
              {observation.organismStatus}
            </span>
          </div>
        )}

        {/* Life Stage */}
        {observation.lifeStage && (
          <div>
            <span className="block text-[11px] font-bold uppercase tracking-wider text-[#7B9586]">
              Life Stage
            </span>
            <span className="font-semibold text-white mt-0.5 block">
              {observation.lifeStage}
            </span>
          </div>
        )}

        {/* Individual Count */}
        {observation.individualCount !== undefined && observation.individualCount !== null && (
          <div>
            <span className="block text-[11px] font-bold uppercase tracking-wider text-[#7B9586]">
              Individual Count
            </span>
            <span className="font-semibold text-white mt-0.5 block">
              {observation.individualCount}
            </span>
          </div>
        )}

        {/* Micro-Habitat */}
        {observation.microHabitat && (
          <div>
            <span className="block text-[11px] font-bold uppercase tracking-wider text-[#7B9586]">
              Micro-Habitat
            </span>
            <span className="font-semibold text-white mt-0.5 block">
              {observation.microHabitat === 'Other' && observation.otherMicroHabitat?.trim()
                ? `Other (${observation.otherMicroHabitat.trim()})`
                : observation.microHabitat}
            </span>
          </div>
        )}

        {/* Habitat Type */}
        {observation.habitatType && (
          <div>
            <span className="block text-[11px] font-bold uppercase tracking-wider text-[#7B9586]">
              Habitat Type
            </span>
            <span className="font-semibold text-white mt-0.5 block">
              {observation.habitatType}
            </span>
          </div>
        )}

        {/* Location Visibility */}
        {observation.locationVisibility && (
          <div>
            <span className="block text-[11px] font-bold uppercase tracking-wider text-[#7B9586]">
              Coordinate Visibility
            </span>
            <span className="font-semibold text-white mt-0.5 block">
              {observation.locationVisibility}
            </span>
          </div>
        )}
      </div>

      {/* Field Notes (Continuous Flow) */}
      {observation.notes?.trim() && (
        <>
          <div className="border-t border-[#1C4D3C]/50" />
          <div className="space-y-1.5">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-[#7B9586]">
              Field Notes & Observations
            </span>
            <p className="text-sm leading-relaxed text-[#F0F5EF] whitespace-pre-wrap">
              {observation.notes.trim()}
            </p>
          </div>
        </>
      )}

      {/* Traditional Knowledge (Continuous Flow) */}
      {observation.hasTraditionalKnowledge === 'Yes' && (
        <>
          <div className="border-t border-[#1C4D3C]/50" />
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-300">
              <BookOpen className="h-3.5 w-3.5" />
              <span>Documented Traditional Knowledge</span>
            </div>
            {observation.traditionalKnowledgeSource && (
              <p className="text-sm text-[#F0F5EF]">
                <span className="text-[#B2C8BA]">Source: </span>
                <span className="font-semibold text-white">
                  {observation.traditionalKnowledgeSource === 'Other' &&
                  observation.otherTraditionalKnowledgeSource?.trim()
                    ? `Other (${observation.otherTraditionalKnowledgeSource.trim()})`
                    : observation.traditionalKnowledgeSource}
                </span>
              </p>
            )}
          </div>
        </>
      )}

      {/* Classification Tags (Continuous Flow) */}
      {observation.tags && observation.tags.length > 0 && (
        <>
          <div className="border-t border-[#1C4D3C]/50" />
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#7B9586]">
              <TagIcon className="h-3.5 w-3.5 text-[#A6F16A]" />
              <span>Classification Tags</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {observation.tags.map((tagId) => {
                const tag = getTagById(tagId)
                const label = tag ? tag.label : tagId.startsWith('#') ? tagId.slice(1) : tagId
                return (
                  <span
                    key={tagId}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#1C4D3C] bg-[#0D2D22] px-3 py-1 text-xs font-medium text-[#A6F16A] shadow-xs"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-[#20D6A0]" />
                    <span>#{label}</span>
                    {tag && tag.category !== 'General' && (
                      <span className="text-[10px] text-[#7B9586] border-l border-[#1C4D3C] pl-1.5 ml-0.5 font-normal">
                        {tag.category}
                      </span>
                    )}
                  </span>
                )
              })}
            </div>
          </div>
        </>
      )}

      {/* Minimal Divider */}
      <div className="border-t border-[#1C4D3C]/50" />

      {/* 5. Location Section with Place Name & Embedded Leaflet Map */}
      <div className="space-y-3">
        <div className="space-y-1">
          {/* Label changed from 'Administrative Ward' to 'Location' */}
          <span className="block text-[11px] font-bold uppercase tracking-wider text-[#7B9586]">
            Location
          </span>
          <div className="flex items-start gap-2">
            <MapPin className="h-4.5 w-4.5 text-[#20D6A0] shrink-0 mt-0.5" />
            <div className="space-y-0.5 min-w-0">
              <p className="text-base sm:text-lg font-bold text-white">
                {displayLocation}
              </p>
              {hasCoordinates && (
                <p className="text-xs font-mono text-[#20D6A0]">
                  {observation.latitude?.toFixed(5)}° N, {observation.longitude?.toFixed(5)}° E
                  {observation.accuracyMeters ? ` • Accuracy: ±${Math.round(observation.accuracyMeters)}m` : ''}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Embedded Leaflet Map Showing Exact Pinned GPS Coordinates */}
        {hasCoordinates ? (
          <div className="relative mt-2 w-full overflow-hidden rounded-2xl border border-[#1C4D3C] bg-[#061812] shadow-lg">
            <div
              ref={mapContainerRef}
              className="h-64 sm:h-72 w-full z-0"
              aria-label="Leaflet map showing exact GPS coordinates of observation"
            />
          </div>
        ) : (
          <div className="flex items-center gap-2.5 rounded-2xl border border-[#1C4D3C] bg-[#061812] p-4 text-xs text-[#7B9586]">
            <Info className="h-4 w-4 text-[#7B9586] shrink-0" />
            <span>GPS coordinates were not recorded for this observation entry.</span>
          </div>
        )}
      </div>
    </div>
  )
}