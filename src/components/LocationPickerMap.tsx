import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  AlertTriangle,
  ChevronUp,
  Clock,
  Compass,
  LocateFixed,
  MapPin,
  X,
} from 'lucide-react'

// Default initial viewport (Thiruvananthapuram, Kerala) if no coordinates yet
const DEFAULT_CENTER: [number, number] = [8.5241, 76.9366]
const DEFAULT_ZOOM = 16

export interface LocationPickerMapProps {
  location: { latitude: number; longitude: number } | null
  rawGPS?: { latitude: number; longitude: number } | null
  locationSource?: string | null
  locationAccuracy?: number | null
  observationTime?: string
  onLocationChange: (
    newLocation: { latitude: number; longitude: number },
    source: 'manual' | 'gps'
  ) => void
  disabled?: boolean
}

export default function LocationPickerMap({
  location,
  rawGPS,
  locationSource,
  locationAccuracy,
  observationTime,
  onLocationChange,
  disabled = false,
}: LocationPickerMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<L.Map | null>(null)
  const [tileError, setTileError] = useState(false)
  const [isMoving, setIsMoving] = useState(false)
  const [isDropping, setIsDropping] = useState(false)
  const [isPopupOpen, setIsPopupOpen] = useState(true)

  // Track whether the current movement is initiated by a user gesture
  const isUserInteractingRef = useRef(false)
  const dropTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const fallbackUsedRef = useRef(false)

  // Pure derived state: whether pin coordinates diverge from raw GPS
  const isManuallyMoved = Boolean(
    rawGPS &&
    location &&
    (Math.abs(location.latitude - rawGPS.latitude) >= 0.000001 ||
      Math.abs(location.longitude - rawGPS.longitude) >= 0.000001)
  )

  // Keep latest onLocationChange in a ref for event handlers
  const onLocationChangeRef = useRef(onLocationChange)
  useEffect(() => {
    onLocationChangeRef.current = onLocationChange
  }, [onLocationChange])

  // Trigger modern pin drop ripple & spring effect
  const triggerDropAnimation = () => {
    setIsMoving(false)
    setIsDropping(true)
    setIsPopupOpen(true)
    if (dropTimerRef.current) clearTimeout(dropTimerRef.current)
    dropTimerRef.current = setTimeout(() => {
      setIsDropping(false)
    }, 450)
  }

  // Recenter map back to raw GPS coordinates
  const handleRecenter = () => {
    if (!rawGPS) return
    const lat = rawGPS.latitude
    const lng = rawGPS.longitude

    isUserInteractingRef.current = false
    if (mapRef.current) {
      mapRef.current.setView([lat, lng], Math.max(mapRef.current.getZoom(), 17), {
        animate: true,
      })
    }
    triggerDropAnimation()
    onLocationChangeRef.current({ latitude: lat, longitude: lng }, 'gps')
  }

  // Preserve initial coordinates across re-renders for first map mount
  const initialCenterRef = useRef<[number, number]>(
    location ? [location.latitude, location.longitude] : DEFAULT_CENTER
  )
  const initialZoomRef = useRef<number>(location ? 16 : DEFAULT_ZOOM)

  // Initialize Leaflet Map with modern Mapbox basemap
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    // Position attribution at bottom-left so bottom-right is clear for 'Recenter GPS'
    const map = L.map(mapContainerRef.current, {
      center: initialCenterRef.current,
      zoom: initialZoomRef.current,
      zoomControl: true,
      attributionControl: false,
      tapHold: true,
    })

    L.control.attribution({ position: 'bottomleft', prefix: false }).addTo(map)

    // Check for Mapbox token in environment
    const mapboxToken =
      (import.meta.env.VITE_MAPBOX_TOKEN as string) ||
      (import.meta.env.VITE_MAPBOX_ACCESS_TOKEN as string) ||
      ''

    // Modern high-definition 512px Retina Mapbox Outdoors v12 basemap (if token is provided),
    // otherwise default directly to OpenStreetMap
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

    // Drag and movement events: map moves, center pin stays at 50% 50%
    const handleDragStart = () => {
      if (disabled) return
      isUserInteractingRef.current = true
      setIsMoving(true)
      setIsDropping(false)
    }

    const handleMoveStart = () => {
      if (disabled) return
      setIsMoving(true)
      setIsDropping(false)
    }

    const handleMoveEnd = () => {
      triggerDropAnimation()

      // Only trigger manual location change if movement was user-initiated
      if (!isUserInteractingRef.current || disabled) return
      isUserInteractingRef.current = false

      const center = map.getCenter()
      onLocationChangeRef.current(
        {
          latitude: Number(center.lat.toFixed(6)),
          longitude: Number(center.lng.toFixed(6)),
        },
        'manual'
      )
    }

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      if (disabled) return
      isUserInteractingRef.current = true
      map.panTo(e.latlng, { animate: true })
    }

    map.on('dragstart', handleDragStart)
    map.on('movestart', handleMoveStart)
    map.on('moveend', handleMoveEnd)
    map.on('click', handleMapClick)

    // Ensure map tiles render accurately inside responsive containers
    const timer = setTimeout(() => {
      map.invalidateSize()
    }, 250)

    return () => {
      clearTimeout(timer)
      if (dropTimerRef.current) clearTimeout(dropTimerRef.current)
      map.off('dragstart', handleDragStart)
      map.off('movestart', handleMoveStart)
      map.off('moveend', handleMoveEnd)
      map.off('click', handleMapClick)
      map.remove()
      mapRef.current = null
    }
  }, [disabled])

  // Sync disabled state on map interactions
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    if (disabled) {
      map.dragging.disable()
      map.touchZoom.disable()
      map.doubleClickZoom.disable()
      map.scrollWheelZoom.disable()
      map.boxZoom.disable()
      map.keyboard.disable()
    } else {
      map.dragging.enable()
      map.touchZoom.enable()
      map.doubleClickZoom.enable()
      map.scrollWheelZoom.enable()
      map.boxZoom.enable()
      map.keyboard.enable()
    }
  }, [disabled])

  // Sync map center whenever external `location` prop updates (e.g. GPS acquisition)
  useEffect(() => {
    const map = mapRef.current
    if (!map || !location) return

    const center = map.getCenter()
    const dist = map.distance(center, [location.latitude, location.longitude])

    // If external location changes and differs noticeably from current center, fly map to it
    if (dist > 2) {
      isUserInteractingRef.current = false
      map.setView([location.latitude, location.longitude], Math.max(map.getZoom(), 16), {
        animate: true,
      })
      triggerDropAnimation()
    }
  }, [location])

  return (
    <div className="relative mt-3 w-full">
      {/* Interactive Map Viewport */}
      <div
        ref={mapContainerRef}
        className="h-72 sm:h-80 w-full rounded-2xl border border-[#1C4D3C] overflow-hidden shadow-inner bg-[#061812] z-0 cursor-grab active:cursor-grabbing"
        style={{ touchAction: 'pan-x pan-y' }}
        aria-label="Interactive map for selecting and adjusting observation coordinates"
      />

      {/* Center Ground Target: Crosshair, Drop Ripple & Impact Shadow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-[500] flex items-center justify-center">
        {/* Animated Ground Ripple on Pin Drop */}
        <div
          className={`absolute rounded-full border-2 border-[#20D6A0] pointer-events-none transition-all duration-500 ease-out ${isDropping ? 'h-10 w-10 opacity-0 scale-150' : 'h-2 w-2 opacity-0 scale-50'
            }`}
        />

        {/* Dynamic Ground Shadow: contracts when pin is lifted, expands when placed */}
        <div
          className={`rounded-full bg-black/60 blur-[1px] transition-all duration-200 ${isMoving ? 'h-1 w-2.5 scale-50 opacity-25' : 'h-2 w-4 scale-100 opacity-80'
            }`}
        />

        {/* Precision Crosshair Center Point */}
        <div className="absolute h-2 w-2 rounded-full border border-white/90 bg-[#20D6A0] shadow-sm ring-2 ring-black/40" />
      </div>

      {/* 
        Always-Centered Marker & Above-Placed Popup Container
        Anchored precisely so the bottom tip of the pin touches (top: 50%, left: 50%)
      */}
      <div
        className="absolute top-1/2 left-1/2 pointer-events-none z-[600] flex flex-col items-center"
        style={{
          transform: 'translate(-50%, -100%)',
        }}
      >
        {/* Themed Popup Card / Minimized Pill */}
        <div
          className={`transition-all duration-200 ${isMoving
            ? 'opacity-0 scale-90 pointer-events-none -translate-y-2'
            : 'opacity-100 scale-100 translate-y-0'
            }`}
        >
          {isPopupOpen ? (
            <div
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              className="pointer-events-auto relative mb-2 w-max max-w-[270px] sm:max-w-[310px] rounded-2xl border border-[#1C4D3C] bg-[#061812]/95 px-3.5 py-2.5 text-xs text-[#F0F5EF] shadow-2xl shadow-black/90 backdrop-blur-md"
            >
              {/* Header: Coordinates + Source badge + Minimize button */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 font-mono text-xs sm:text-[13px] font-bold text-[#A6F16A]">
                  <MapPin className="h-3.5 w-3.5 text-[#20D6A0] shrink-0" />
                  <span>
                    {location
                      ? `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`
                      : 'Move map to place pin'}
                  </span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {location && (
                    <span
                      className={`text-[10px] font-sans font-semibold px-2 py-0.5 rounded-full border ${locationSource === 'GPS'
                        ? 'bg-[#133D2F] text-[#A6F16A] border-[#1C4D3C]'
                        : locationSource === 'Manual Pin Adjustment'
                          ? 'bg-amber-950/70 text-amber-300 border-amber-800/60'
                          : 'bg-[#133D2F] text-[#B2C8BA] border-[#1C4D3C]'
                        }`}
                    >
                      {locationSource === 'Manual Pin Adjustment'
                        ? 'Manual'
                        : locationSource || 'Pinned'}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsPopupOpen(false)
                    }}
                    className="ml-0.5 p-0.5 rounded-full text-[#7B9586] hover:text-white hover:bg-[#1C4D3C] transition-colors cursor-pointer"
                    title="Minimize popup"
                    aria-label="Minimize popup"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </div>

              {/* Observation Timestamp */}
              {observationTime && (
                <div className="mt-1 flex items-center gap-1.5 text-[11px] text-[#7B9586]">
                  <Clock className="h-3 w-3 text-[#7B9586] shrink-0" />
                  <span className="truncate">{observationTime}</span>
                </div>
              )}

              {/* Raw GPS Audit Details */}
              {rawGPS && (
                <div className="mt-2 pt-2 border-t border-[#1C4D3C] space-y-0.5 text-[11px] text-[#B2C8BA]">
                  <div className="flex items-center gap-1.5 font-mono">
                    <Compass className="h-3 w-3 text-[#20D6A0] shrink-0" />
                    <span className="truncate">
                      Raw GPS: {rawGPS.latitude.toFixed(5)}, {rawGPS.longitude.toFixed(5)}
                    </span>
                    {locationAccuracy !== null && locationAccuracy !== undefined && (
                      <span className="text-[10px] text-[#7B9586] font-sans">
                        (±{Math.round(locationAccuracy)}m)
                      </span>
                    )}
                  </div>
                  {locationSource === 'Manual Pin Adjustment' && (
                    <div className="text-[10px] font-sans text-amber-300/90 leading-tight">
                      Original GPS preserved • Adjusted on map
                    </div>
                  )}
                </div>
              )}

              {locationSource === 'Manual Pin Adjustment' && !rawGPS && (
                <div className="mt-2 pt-2 border-t border-[#1C4D3C] text-[10px] text-[#7B9586] font-sans">
                  📍 Manual pin placement without GPS acquisition
                </div>
              )}

              {/* Seamless Downward Pointer connected cleanly to card */}
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
              onMouseDown={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              className="pointer-events-auto mb-1.5 flex items-center gap-1.5 rounded-full bg-[#061812]/95 border border-[#1C4D3C] hover:border-[#A6F16A]/60 px-2.5 py-1 text-[11px] font-mono font-medium text-[#A6F16A] shadow-lg shadow-black/70 backdrop-blur-md transition-all active:scale-95 cursor-pointer"
              title="Click to view location details"
            >
              <MapPin className="h-3 w-3 text-[#20D6A0]" />
              <span>
                {location
                  ? `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`
                  : 'Tap for details'}
              </span>
              <ChevronUp className="h-3 w-3 text-[#7B9586]" />
            </button>
          )}
        </div>

        {/* 
          Centered Pin Icon with Modern Lift & Spring-Bounce Drop Animation
          Lifts when dragging, springs/bounces with organic overshoot on drop
        */}
        <div
          className="relative filter drop-shadow(0 4px 6px rgba(0,0,0,0.6)) cursor-grab"
          style={{
            transform: isMoving
              ? 'translateY(-18px) scale(1.08)'
              : 'translateY(0px) scale(1)',
            transition: isMoving
              ? 'transform 120ms ease-out'
              : 'transform 380ms cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
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

      {/* Floating 'Recenter GPS' button placed in bottom-right corner to prevent overlap */}
      {isManuallyMoved && rawGPS && !disabled && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            handleRecenter()
          }}
          onMouseDown={(e) => e.stopPropagation()}
          onDoubleClick={(e) => e.stopPropagation()}
          className="absolute bottom-3 right-3 z-[1000] inline-flex items-center gap-1.5 rounded-full bg-[#061812]/95 hover:bg-[#0D2D22] text-[#A6F16A] border border-[#20D6A0]/60 hover:border-[#A6F16A] px-3.5 py-1.5 text-xs font-semibold shadow-xl shadow-black/80 backdrop-blur-md transition-all active:scale-95 cursor-pointer animate-in fade-in zoom-in-95 duration-200"
          title="Recenter map back to raw GPS coordinates"
          aria-label="Recenter GPS"
        >
          <LocateFixed className="h-3.5 w-3.5 text-[#20D6A0] animate-pulse" />
          <span>Recenter GPS</span>
        </button>
      )}

      {/* Offline tile loading notice banner */}
      {tileError && (
        <div className="mt-2 flex items-start gap-2 rounded-xl bg-amber-50 p-2.5 text-xs text-amber-900 border border-amber-200">
          <AlertTriangle className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Basemap tiles could not be loaded.</strong> An internet connection is
            normally required to stream map tiles. You can still pan the map to set coordinates, or
            use the device GPS button.
          </p>
        </div>
      )}
    </div>
  )
}
