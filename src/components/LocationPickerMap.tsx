import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { AlertTriangle, MapPin } from 'lucide-react'

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

interface LocationPickerMapProps {
  location: { latitude: number; longitude: number } | null
  onLocationChange: (newLocation: { latitude: number; longitude: number }, source: 'manual') => void
  disabled?: boolean
}

export default function LocationPickerMap({
  location,
  onLocationChange,
  disabled = false,
}: LocationPickerMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)
  const [tileError, setTileError] = useState(false)

  // Default initial viewport (Thiruvananthapuram, Kerala) if no coordinates yet
  // We do NOT invent coordinates or select this location; it only frames the map initial view.
  const DEFAULT_CENTER: [number, number] = [8.5241, 76.9366]
  const DEFAULT_ZOOM = 12

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return

    const initialCenter = location
      ? [location.latitude, location.longitude] as [number, number]
      : DEFAULT_CENTER

    const initialZoom = location ? 16 : DEFAULT_ZOOM

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: initialZoom,
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
    mapInstanceRef.current = map

    // Ensure map tiles render accurately inside responsive containers
    const timer = setTimeout(() => {
      map.invalidateSize()
    }, 250)

    return () => {
      clearTimeout(timer)
      map.remove()
      mapInstanceRef.current = null
      markerRef.current = null
    }
  }, [])

  // Handle map click events to place/move marker manually
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      if (disabled) return
      onLocationChange(
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
  }, [disabled, onLocationChange])

  // Sync marker and map center whenever `location` prop changes
  useEffect(() => {
    const map = mapInstanceRef.current
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
        onLocationChange(
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
  }, [location, disabled, onLocationChange])

  return (
    <div className="relative mt-3 w-full">
      <div
        ref={mapContainerRef}
        className="h-64 sm:h-72 w-full rounded-2xl border border-[#DCD5C5] overflow-hidden shadow-inner bg-[#EDE7DA] z-0"
        style={{ touchAction: 'pan-x pan-y' }}
        aria-label="Interactive map for selecting and adjusting observation coordinates"
      />

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
      <div className="mt-2 flex items-center justify-between text-[11px] text-[#414B32]">
        <span className="flex items-center gap-1.5 font-medium">
          <MapPin className="h-3.5 w-3.5 text-[#263D2B]" />
          <span>Tap anywhere on the map or drag the pin to fine-tune location</span>
        </span>
        {location && (
          <span className="text-[10px] text-[#263D2B]/75 bg-white/70 px-2 py-0.5 rounded-full border border-[#DCD5C5]">
            Pin placed
          </span>
        )}
      </div>
    </div>
  )
}
