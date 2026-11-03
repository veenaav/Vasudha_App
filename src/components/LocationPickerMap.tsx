import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  AlertTriangle,
  ChevronUp,
  Clock,
  MapPin,
  X,
} from 'lucide-react'

// Default initial viewport (configurable via environment variables with Thiruvananthapuram fallback)
const DEFAULT_LATITUDE = Number(import.meta.env.VITE_DEFAULT_LATITUDE) || 8.5241
const DEFAULT_LONGITUDE = Number(import.meta.env.VITE_DEFAULT_LONGITUDE) || 76.9366
const DEFAULT_CENTER: [number, number] = [DEFAULT_LATITUDE, DEFAULT_LONGITUDE]
const DEFAULT_ZOOM = Number(import.meta.env.VITE_DEFAULT_ZOOM) || 16

export interface LocationPickerMapProps {
  location: { latitude: number; longitude: number } | null
  rawGPS?: { latitude: number; longitude: number } | null
  locationSource?: string | null
  locationAccuracy?: number | null
  locationName?: string | null
  observationTime?: string
  onLocationChange?: (
    newLocation: { latitude: number; longitude: number },
    source: 'manual' | 'gps'
  ) => void
  disabled?: boolean
}

/**
 * Static, read-only Leaflet Map component centered strictly on photo GPS / EXIF coordinates.
 * Panning, dragging, clicking, and zoom controls are completely disabled to enforce
 * automatic photo-based GPS positioning.
 */
export default function LocationPickerMap({
  location,
  locationSource,
  locationAccuracy,
  locationName,
  observationTime,
}: LocationPickerMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<L.Map | null>(null)
  const [tileError, setTileError] = useState(false)
  const [isPopupOpen, setIsPopupOpen] = useState(true)
  const fallbackUsedRef = useRef(false)

  // Preserve initial coordinates across re-renders for first map mount
  const initialCenterRef = useRef<[number, number]>(
    location ? [location.latitude, location.longitude] : DEFAULT_CENTER
  )
  const initialZoomRef = useRef<number>(location ? 16 : DEFAULT_ZOOM)

  // Initialize Static Read-Only Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    // Strict static read-only configuration:
    // Panning, dragging, scroll zooming, double-click zooming, and zoom controls are all disabled.
    const map = L.map(mapContainerRef.current, {
      center: initialCenterRef.current,
      zoom: initialZoomRef.current,
      zoomControl: false, // Zoom controls (+/-) completely removed
      attributionControl: false,
      dragging: false, // Map panning/dragging disabled
      touchZoom: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
      tapHold: false,
    })

    L.control.attribution({ position: 'bottomleft', prefix: false }).addTo(map)

    // Check for Mapbox token in environment
    const mapboxToken =
      (import.meta.env.VITE_MAPBOX_TOKEN as string) ||
      (import.meta.env.VITE_MAPBOX_ACCESS_TOKEN as string) ||
      ''

    const tileLayer = mapboxToken
      ? L.tileLayer(
          `https://api.mapbox.com/styles/v1/mapbox/outdoors-v12/tiles/512/{z}/{x}/{y}@2x?access_token=${mapboxToken}`,
          {
            maxZoom: 22,
            tileSize: 512,
            zoomOffset: -1,
            attribution:
              '© <a href="https://www.mapbox.com/about/maps/" target="_blank" rel="noopener noreferrer">Mapbox</a> © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>',
          }
        )
      : L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '© OpenStreetMap contributors',
        })

    tileLayer.on('tileerror', () => {
      // Graceful fallback to standard OpenStreetMap if network/offline failure
      if (!fallbackUsedRef.current) {
        fallbackUsedRef.current = true
        tileLayer.remove()
        const fallbackLayer = L.tileLayer(
          'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
          {
            maxZoom: 19,
            attribution: '© OpenStreetMap contributors',
          }
        )
        fallbackLayer.addTo(map)
        return
      }
      setTileError(true)
    })

    tileLayer.addTo(map)
    mapRef.current = map

    // Ensure map tiles render accurately inside responsive containers
    const timer = setTimeout(() => {
      map.invalidateSize()
    }, 250)

    return () => {
      clearTimeout(timer)
      map.remove()
      mapRef.current = null
    }
  }, [])

  // Automatically fly/re-center map strictly when photo location updates
  useEffect(() => {
    const map = mapRef.current
    if (!map || !location) return

    const center = map.getCenter()
    const dist = map.distance(center, [location.latitude, location.longitude])

    if (dist > 1) {
      map.setView([location.latitude, location.longitude], Math.max(map.getZoom(), 16), {
        animate: true,
      })
    }
  }, [location])

  return (
    <div className="relative mt-3 w-full select-none">
      {/* Static Read-Only Map Viewport */}
      <div
        ref={mapContainerRef}
        className="h-72 sm:h-80 w-full rounded-2xl border border-[#1C4D3C] overflow-hidden shadow-inner bg-[#061812] z-0 cursor-default pointer-events-none"
        aria-label="Static map displaying locked photo GPS coordinates"
      />

      {/* Center Ground Target: Locked Crosshair & Shadow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-[500] flex items-center justify-center">
        {/* Dynamic Ground Shadow */}
        <div className="rounded-full bg-black/60 blur-[1px] h-2 w-4 scale-100 opacity-80" />

        {/* Precision Crosshair Center Point */}
        <div className="absolute h-2 w-2 rounded-full border border-white/90 bg-[#20D6A0] shadow-sm ring-2 ring-black/40" />
      </div>

      {/* 
        Single Locked Marker & Above-Placed Information Card
        Anchored precisely so the bottom tip of the pin touches center (top: 50%, left: 50%)
      */}
      <div
        className="absolute top-1/2 left-1/2 pointer-events-none z-[600] flex flex-col items-center"
        style={{
          transform: 'translate(-50%, -100%)',
        }}
      >
        {/* Themed Read-Only Location Card / Minimized Pill */}
        <div className="transition-all duration-200 opacity-100 scale-100 translate-y-0">
          {isPopupOpen ? (
            <div
              onClick={(e) => e.stopPropagation()}
              className="pointer-events-auto relative mb-2 w-max max-w-[270px] sm:max-w-[320px] rounded-2xl border border-[#1C4D3C] bg-[#061812]/95 px-3.5 py-2.5 text-xs text-[#F0F5EF] shadow-2xl shadow-black/90 backdrop-blur-md"
            >
              {/* Header: Location name or Coordinates + Source badge + Minimize button */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs sm:text-[13px] font-bold text-[#A6F16A] min-w-0">
                  <MapPin className="h-3.5 w-3.5 text-[#20D6A0] shrink-0" />
                  <span className="truncate">
                    {locationName
                      ? locationName
                      : location
                      ? `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`
                      : 'Awaiting photo GPS'}
                  </span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsPopupOpen(false)
                    }}
                    className="p-0.5 rounded-full text-[#7B9586] hover:text-white hover:bg-[#1C4D3C] transition-colors cursor-pointer"
                    title="Minimize popup"
                    aria-label="Minimize popup"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </div>

              {/* Formatted coordinates shown if human-readable address is resolved */}
              {location && locationName && (
                <div className="mt-0.5 font-mono text-[11px] text-[#7B9586]">
                  {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
                </div>
              )}

              {/* Observation Timestamp */}
              {observationTime && (
                <div className="mt-1 flex items-center gap-1.5 text-[11px] text-[#7B9586]">
                  <Clock className="h-3 w-3 text-[#7B9586] shrink-0" />
                  <span className="truncate">{observationTime}</span>
                </div>
              )}

              {/* Accuracy Details if available from Device GPS */}
              {locationSource !== 'EXIF' && locationAccuracy !== null && locationAccuracy !== undefined && (
                <div className="mt-1.5 pt-1.5 border-t border-[#1C4D3C] text-[10px] text-[#B2C8BA] flex items-center justify-between">
                  <span className="text-[#7B9586]">GPS Accuracy:</span>
                  <span className="text-[#A6F16A] font-medium">±{Math.round(locationAccuracy)}m</span>
                </div>
              )}

              {/* Downward Pointer connected cleanly to pin */}
              <div className="absolute left-1/2 -bottom-2 -translate-x-1/2 flex items-start justify-center pointer-events-none">
                <svg width="16" height="8" viewBox="0 0 16 8" fill="none">
                  <path
                    d="M0 0L6.58579 6.58579C7.36683 7.36683 8.63316 7.36683 9.41421 6.58579L16 0H0Z"
                    fill="#061812"
                    stroke="#1C4D3C"
                    strokeWidth="1"
                  />
                  <rect x="0" y="-1" width="16" height="2" fill="#061812" />
                </svg>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setIsPopupOpen(true)
              }}
              className="pointer-events-auto mb-1.5 flex items-center gap-1.5 rounded-full bg-[#061812]/95 border border-[#1C4D3C] hover:border-[#A6F16A]/60 px-2.5 py-1 text-[11px] font-medium text-[#A6F16A] shadow-lg shadow-black/70 backdrop-blur-md transition-all active:scale-95 cursor-pointer max-w-[280px]"
              title="Click to view locked location details"
            >
              <MapPin className="h-3 w-3 text-[#20D6A0] shrink-0" />
              <span className="truncate">
                {locationName
                  ? locationName
                  : location
                  ? `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`
                  : 'Tap for details'}
              </span>
              <ChevronUp className="h-3 w-3 text-[#7B9586] shrink-0" />
            </button>
          )}
        </div>

        {/* Single Locked Center Pin (Non-draggable, fixed at photo coordinates) */}
        <div className="relative filter drop-shadow(0 4px 6px rgba(0,0,0,0.6)) pointer-events-none">
          <svg
            viewBox="0 0 24 32"
            width="34"
            height="44"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="block"
          >
            <path
              d="M12 0C5.372 0 0 5.373 0 12c0 9 12 20 12 20s12-11 12-20c0-6.627-5.372-12-12-12z"
              fill="#0D2D22"
            />
            <path
              d="M12 1.5C6.201 1.5 1.5 6.201 1.5 12c0 8 10.5 18.5 10.5 18.5s10.5-10.5 10.5-18.5c0-5.799-4.701-10.5-10.5-10.5z"
              fill="#133D2F"
              stroke="#1C4D3C"
              strokeWidth="1"
            />
            <circle cx="12" cy="11" r="5" fill="#061812" />
            <circle cx="12" cy="11" r="3.5" fill="#20D6A0" />
            <circle cx="12" cy="11" r="1.5" fill="#A6F16A" />
          </svg>
        </div>
      </div>

      {/* Offline tile loading notice banner */}
      {tileError && (
        <div className="mt-2 flex items-start gap-2 rounded-xl bg-amber-950/40 p-2.5 text-xs text-amber-200 border border-amber-800/60">
          <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Basemap tiles cannot be streamed offline. Locked photo coordinates are recorded
            accurately in the observation record.
          </p>
        </div>
      )}
    </div>
  )
}
