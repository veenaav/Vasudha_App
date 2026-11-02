import { useState, useCallback } from 'react'
import type { LocationSource } from '@/db/database'
import {
  identifyWardFromCoordinates,
  type WardIdentificationStatus,
} from '@/lib/wardService'
import {
  reverseGeocodeCoordinates,
  type ReverseGeocodeResult,
} from '@/lib/reverseGeocode'

export interface Coordinates {
  latitude: number
  longitude: number
}

export type GeolocationStatus = 'captured' | 'unavailable' | 'acquiring' | 'pending'

export function useObservationGeolocation() {
  const [gpsLocation, setGpsLocation] = useState<Coordinates | null>(null)
  const [location, setLocation] = useState<Coordinates | null>(null)
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null)
  const [locationSource, setLocationSource] = useState<LocationSource | null>(null)
  const [gpsCapturedAt, setGpsCapturedAt] = useState<string | null>(null)
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)

  // Client-Side Reverse Geocoding state (human-readable address components)
  const [resolvedLocationName, setResolvedLocationName] = useState<string | null>(null)
  const [reverseGeocodeDetails, setReverseGeocodeDetails] = useState<ReverseGeocodeResult | null>(null)
  const [isReverseGeocoding, setIsReverseGeocoding] = useState<boolean>(false)

  // Dedicated Automatic Ward Identification state (read-only for ordinary field workers)
  const [autoWardId, setAutoWardId] = useState<string | null>(null)
  const [autoWardName, setAutoWardName] = useState<string | null>(null)
  const [autoWardNumber, setAutoWardNumber] = useState<string | null>(null)
  const [wardStatus, setWardStatus] = useState<WardIdentificationStatus>('location_not_obtained')
  const [wardStatusMessage, setWardStatusMessage] = useState<string>(
    'Location and ward will be identified automatically after GPS acquisition.'
  )

  // Helper to trigger reverse geocoding directly for given coordinates
  const triggerReverseGeocode = useCallback(async (lat: number, lng: number) => {
    setIsReverseGeocoding(true)
    try {
      const geoResult = await reverseGeocodeCoordinates(lat, lng)
      if (geoResult?.locationName) {
        setResolvedLocationName(geoResult.locationName)
        setReverseGeocodeDetails(geoResult)
        return geoResult
      } else {
        // Fallback: gracefully fall back to formatted coordinates
        setResolvedLocationName(`${lat.toFixed(5)}, ${lng.toFixed(5)}`)
        setReverseGeocodeDetails(null)
        return null
      }
    } catch {
      setResolvedLocationName(`${lat.toFixed(5)}, ${lng.toFixed(5)}`)
      setReverseGeocodeDetails(null)
      return null
    } finally {
      setIsReverseGeocoding(false)
    }
  }, [])

  // Request high-accuracy device GPS coordinates (used as automatic fallback when EXIF is missing)
  const getLocation = useCallback(
    (): Promise<Coordinates | null> => {
      return new Promise((resolve) => {
        if (!navigator.geolocation) {
          const msg = 'Geolocation is not supported by this browser.'
          setLocationError(msg)
          setWardStatus('location_unavailable')
          setWardStatusMessage(msg)
          resolve(null)
          return
        }

        // Avoid simultaneous duplicate requests
        if (isGettingLocation) {
          resolve(location)
          return
        }

        setIsGettingLocation(true)
        setLocationError(null)
        setWardStatus('requesting_location')
        setWardStatusMessage('Requesting GPS coordinates from device...')

        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const lat = Number(position.coords.latitude.toFixed(6))
            const lng = Number(position.coords.longitude.toFixed(6))
            const now = new Date().toISOString()

            setGpsLocation({ latitude: lat, longitude: lng })
            setLocation({ latitude: lat, longitude: lng })
            setLocationSource('GPS')
            setLocationAccuracy(position.coords.accuracy)
            setGpsCapturedAt(now)
            setIsGettingLocation(false)
            setLocationError(null)

            // Concurrently trigger reverse geocoding and ward boundary identification
            setIsReverseGeocoding(true)
            setWardStatus('identifying_ward')
            setWardStatusMessage('Resolving location address and ward boundaries...')

            const [geoResult, wardResult] = await Promise.allSettled([
              reverseGeocodeCoordinates(lat, lng),
              identifyWardFromCoordinates(lat, lng),
            ])

            // 1. Process Reverse Geocoding
            if (geoResult.status === 'fulfilled' && geoResult.value?.locationName) {
              setResolvedLocationName(geoResult.value.locationName)
              setReverseGeocodeDetails(geoResult.value)
            } else {
              // Fallback handling: Gracefully fall back to displaying formatted lat/lng coordinates
              setResolvedLocationName(`${lat.toFixed(5)}, ${lng.toFixed(5)}`)
              setReverseGeocodeDetails(null)
            }
            setIsReverseGeocoding(false)

            // 2. Process Ward Boundary Result
            if (wardResult.status === 'fulfilled') {
              const result = wardResult.value
              setWardStatus(result.status)
              setWardStatusMessage(result.message)
              if (result.status === 'ward_identified' && result.ward) {
                setAutoWardId(result.ward.wardId)
                setAutoWardName(result.ward.wardName)
                setAutoWardNumber(result.ward.wardNumber)
              } else {
                setAutoWardId(null)
                setAutoWardName(null)
                setAutoWardNumber(null)
              }
            } else {
              setWardStatus('ward_unidentified')
              setWardStatusMessage('Ward identification service error.')
            }

            resolve({ latitude: lat, longitude: lng })
          },
          (error) => {
            setIsGettingLocation(false)
            let userMessage = error.message

            if (error.code === error.PERMISSION_DENIED) {
              userMessage = 'Location permission denied on device.'
            } else if (error.code === error.POSITION_UNAVAILABLE) {
              userMessage = 'GPS signal unavailable on device.'
            } else if (error.code === error.TIMEOUT) {
              userMessage = 'GPS request timed out.'
            }

            setLocationError(userMessage)
            setWardStatus('location_unavailable')
            setWardStatusMessage(userMessage)
            resolve(null)
          },
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0,
          }
        )
      })
    },
    [isGettingLocation, location]
  )

  // Set coordinates automatically extracted from photograph EXIF metadata
  const setExifLocation = useCallback(
    async (coords: Coordinates, captureTime?: string | null) => {
      const lat = Number(coords.latitude.toFixed(6))
      const lng = Number(coords.longitude.toFixed(6))
      const now = captureTime || new Date().toISOString()

      setGpsLocation({ latitude: lat, longitude: lng })
      setLocation({ latitude: lat, longitude: lng })
      setLocationSource('EXIF')
      setLocationAccuracy(null)
      setGpsCapturedAt(now)
      setLocationError(null)

      // Concurrently trigger reverse geocoding and ward boundary identification
      setIsReverseGeocoding(true)
      setWardStatus('identifying_ward')
      setWardStatusMessage('Resolving location address and ward boundaries from photo EXIF...')

      const [geoResult, wardResult] = await Promise.allSettled([
        reverseGeocodeCoordinates(lat, lng),
        identifyWardFromCoordinates(lat, lng),
      ])

      // 1. Process Reverse Geocoding
      if (geoResult.status === 'fulfilled' && geoResult.value?.locationName) {
        setResolvedLocationName(geoResult.value.locationName)
        setReverseGeocodeDetails(geoResult.value)
      } else {
        // Fallback handling: Gracefully fall back to displaying formatted lat/lng coordinates
        setResolvedLocationName(`${lat.toFixed(5)}, ${lng.toFixed(5)}`)
        setReverseGeocodeDetails(null)
      }
      setIsReverseGeocoding(false)

      // 2. Process Ward Boundary Result
      if (wardResult.status === 'fulfilled') {
        const result = wardResult.value
        setWardStatus(result.status)
        setWardStatusMessage(result.message)
        if (result.status === 'ward_identified' && result.ward) {
          setAutoWardId(result.ward.wardId)
          setAutoWardName(result.ward.wardName)
          setAutoWardNumber(result.ward.wardNumber)
        } else {
          setAutoWardId(null)
          setAutoWardName(null)
          setAutoWardNumber(null)
        }
      } else {
        setWardStatus('ward_unidentified')
        setWardStatusMessage('Ward identification service error.')
      }
    },
    []
  )

  const resetLocation = () => {
    setGpsLocation(null)
    setLocation(null)
    setLocationAccuracy(null)
    setLocationSource(null)
    setGpsCapturedAt(null)
    setLocationError(null)
    setResolvedLocationName(null)
    setReverseGeocodeDetails(null)
    setIsReverseGeocoding(false)
    setAutoWardId(null)
    setAutoWardName(null)
    setAutoWardNumber(null)
    setWardStatus('location_not_obtained')
    setWardStatusMessage('Location and ward will be identified automatically after GPS acquisition.')
    setIsGettingLocation(false)
  }

  // Derive small location status indicator text and badge type
  const locationStatus: GeolocationStatus = isGettingLocation
    ? 'acquiring'
    : location !== null
    ? 'captured'
    : locationError !== null
    ? 'unavailable'
    : 'pending'

  const locationStatusLabel = isGettingLocation
    ? 'Acquiring GPS location...'
    : locationSource === 'EXIF'
    ? 'Location locked (Photo EXIF)'
    : locationSource === 'GPS'
    ? `Location locked (Device GPS${
        locationAccuracy !== null ? ` • ±${Math.round(locationAccuracy)}m` : ''
      })`
    : locationError
    ? 'Location unavailable'
    : 'Awaiting photo GPS'

  return {
    gpsLocation,
    setGpsLocation,
    location,
    setLocation,
    locationAccuracy,
    setLocationAccuracy,
    locationSource,
    setLocationSource,
    gpsCapturedAt,
    setGpsCapturedAt,
    isGettingLocation,
    locationError,
    setLocationError,
    resolvedLocationName,
    setResolvedLocationName,
    reverseGeocodeDetails,
    isReverseGeocoding,
    triggerReverseGeocode,
    autoWardId,
    setAutoWardId,
    autoWardName,
    setAutoWardName,
    autoWardNumber,
    setAutoWardNumber,
    wardStatus,
    setWardStatus,
    wardStatusMessage,
    setWardStatusMessage,
    locationStatus,
    locationStatusLabel,
    getLocation,
    setExifLocation,
    resetLocation,
  }
}
