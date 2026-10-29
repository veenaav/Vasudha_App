import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { AlertTriangle, LocateFixed, MapPin } from 'lucide-react'

// Custom SVG Pin Icon for Leaflet to eliminate broken asset image paths in Vite/React
const createPinIcon = () => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="
        position: relative;
        width: 32px;
        height: 42px;
        transform: translate(-16px, -40px);
        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.35));
        cursor: grab;
      ">
        <svg viewBox="0 0 24 32" width="32" height="42" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 0C5.372 0 0 5.373 0 12c0 9 12 20 12 20s12-11 12-20c0-6.627-5.372-12-12-12z" fill="#165B33"/>
          <path d="M12 2C6.477 2 2 6.477 2 12c0 7.5 10 17 10 17s10-9.5 10-17c0-5.523-4.477-10-10-10z" fill="#263D2B"/>
          <circle cx="12" cy="11" r="4.5" fill="#FAF7F0"/>
          <circle cx="12" cy="11" r="2" fill="#B87555"/>
        </svg>
      </div>
    `,
    iconSize: [32, 42],
    iconAnchor: [16, 42],
  })
}

// Default initial viewport (Thiruvananthapuram, Kerala) if no coordinates yet
const DEFAULT_CENTER: [number, number] = [8.5241, 76.9366]
const DEFAULT_ZOOM = 12

interface LocationPickerMapProps {
  location: { latitude: number; longitude: number } | null
  rawGPS?: { latitude: number; longitude: number } | null
  onLocationChange: (
    newLocation: { latitude: number; longitude: number },
    source: 'manual' | 'gps'
  ) => void
  disabled?: boolean
}

export default function LocationPickerMap({
  location,
  rawGPS,
  onLocationChange,
  disabled = false,
}: LocationPickerMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)
  const [tileError, setTileError] = useState(false)

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

  // Recenter map and marker back to raw GPS coordinates
  const handleRecenter = () => {
    if (!rawGPS) return
    const lat = rawGPS.latitude
    const lng = rawGPS.longitude

    if (mapRef.current) {
      mapRef.current.setView([lat, lng], 18, { animate: true })
    }

    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng])
    }
    onLocationChangeRef.current({ latitude: lat, longitude: lng }, 'gps')
  }

  // Preserve initial coordinates across re-renders for first map mount
  const initialCenterRef = useRef<[number, number]>(
    location ? [location.latitude, location.longitude] : DEFAULT_CENTER
  )
  const initialZoomRef = useRef<number>(location ? 16 : DEFAULT_ZOOM)

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    const map = L.map(mapContainerRef.current, {
      center: initialCenterRef.current,
      zoom: initialZoomRef.current,
      zoomControl: true,
      attributionControl: true,
      tapHold: true,
    })

    // OpenStreetMap tile layer
    const tileLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>',
    })

    tileLayer.on('tileerror', () => {
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
      markerRef.current = null
    }
  }, [])

  // Handle map click events to place/move marker manually
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      if (disabled) return
      onLocationChangeRef.current(
        {
          latitude: Number(e.latlng.lat.toFixed(6)),
          longitude: Number(e.latlng.lng.toFixed(6)),
        },
        'manual'
      )
    }

    map.on('click', handleMapClick)

    return () => {
      map.off('click', handleMapClick)
    }
  }, [disabled])

  // Sync marker and map center whenever `location` prop changes
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    if (!location) {
      if (markerRef.current) {
        markerRef.current.remove()
        markerRef.current = null
      }
      return
    }

    const { latitude, longitude } = location
    const latLng: [number, number] = [latitude, longitude]

    if (!markerRef.current) {
      const pinIcon = createPinIcon()
      const marker = L.marker(latLng, {
        icon: pinIcon,
        draggable: !disabled,
        autoPan: true,
      })

      marker.on('dragend', () => {
        if (disabled) return
        const pos = marker.getLatLng()
        onLocationChangeRef.current(
          {
            latitude: Number(pos.lat.toFixed(6)),
            longitude: Number(pos.lng.toFixed(6)),
          },
          'manual'
        )
      })

      marker.addTo(map)
      markerRef.current = marker
    } else {
      markerRef.current.setLatLng(latLng)
      if (disabled) {
        markerRef.current.dragging?.disable()
      } else {
        markerRef.current.dragging?.enable()
      }
    }

    // Keep map centered if distance is significant or if zoomed far out
    const currentCenter = map.getCenter()
    const dist = map.distance(currentCenter, latLng)
    if (dist > 50 || map.getZoom() < 14) {
      map.setView(latLng, Math.max(map.getZoom(), 16), {
        animate: true,
      })
    }
  }, [location, disabled])

  return (
    <div className="relative mt-3 w-full">
      <div
        ref={mapContainerRef}
        className="h-64 sm:h-72 w-full rounded-2xl border border-[#1C4D3C] overflow-hidden shadow-inner bg-[#061812] z-0"
        style={{ touchAction: 'pan-x pan-y' }}
        aria-label="Interactive map for selecting and adjusting observation coordinates"
      />

      {/* Floating 'Recenter GPS' button over the map container */}
      {isManuallyMoved && rawGPS && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            handleRecenter()
          }}
          onMouseDown={(e) => e.stopPropagation()}
          onDoubleClick={(e) => e.stopPropagation()}
          className="absolute top-3 right-3 z-[1000] inline-flex items-center gap-1.5 rounded-full bg-[#0D2D22]/95 hover:bg-[#133D2F] text-[#A6F16A] border border-[#20D6A0]/50 hover:border-[#A6F16A] px-3.5 py-1.5 text-xs font-semibold shadow-lg shadow-black/60 backdrop-blur-md transition-all active:scale-95 cursor-pointer animate-in fade-in zoom-in-95 duration-200"
          title="Recenter map and pin back to raw GPS coordinates"
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
            <strong>OpenStreetMap tiles could not be loaded.</strong> An internet connection is
            normally required to stream map tiles. You can still tap or drag to set coordinates, or
            use the device GPS button.
          </p>
        </div>
      )}

      {/* Helpful usage hint below map */}
      <div className="mt-2 flex items-center justify-between text-[11px] text-[#7B9586]">
        <span className="flex items-center gap-1.5 font-medium">
          <MapPin className="h-3.5 w-3.5 text-[#20D6A0]" />
          <span>Tap anywhere on the map or drag the pin to fine-tune location</span>
        </span>
        {location && (
          <span className="text-[10px] text-[#A6F16A] bg-[#061812] px-2 py-0.5 rounded-full border border-[#1C4D3C]">
            Pin placed
          </span>
        )}
      </div>
    </div>
  )
}
