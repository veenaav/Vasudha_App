import { useState, useCallback } from 'react'
import type { LocationSource } from '@/db/database'
import {
  identifyWardFromCoordinates,
  type WardIdentificationStatus,
} from '@/lib/wardService'

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

  // Dedicated Automatic Ward Identification state (read-only for ordinary field workers)
  const [autoWardId, setAutoWardId] = useState<string | null>(null)
  const [autoWardName, setAutoWardName] = useState<string | null>(null)
  const [autoWardNumber, setAutoWardNumber] = useState<string | null>(null)
  const [wardStatus, setWardStatus] = useState<WardIdentificationStatus>('location_not_obtained')
  const [wardStatusMessage, setWardStatusMessage] = useState<string>(
    'Ward will be identified automatically after GPS acquisition.'
  )

  // Request high-accuracy device GPS coordinates and trigger automatic ward identification
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

            // Automatic GPS-based ward identification step
            setWardStatus('identifying_ward')
            setWardStatusMessage(
              'Matching coordinates against Thiruvananthapuram Corporation ward boundaries...'
            )

            try {
              const result = await identifyWardFromCoordinates(lat, lng)
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
            } catch {
              setWardStatus('ward_unidentified')
              setWardStatusMessage('Ward identification service error.')
            }

            resolve({ latitude: lat, longitude: lng })
          },
          (error) => {
            setIsGettingLocation(false)
            let userMessage = error.message

            if (error.code === error.PERMISSION_DENIED) {
              userMessage = 'Location permission denied. You can select your location on the map.'
            } else if (error.code === error.POSITION_UNAVAILABLE) {
              userMessage = 'GPS signal unavailable. You can retry outdoors or select location on the map.'
            } else if (error.code === error.TIMEOUT) {
              userMessage = 'GPS request timed out. You can retry or select location on the map.'
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

  // Set coordinates extracted from photograph EXIF metadata
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

      setWardStatus('identifying_ward')
      setWardStatusMessage('Matching photo EXIF coordinates against ward boundaries...')

      try {
        const result = await identifyWardFromCoordinates(lat, lng)
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
      } catch {
        setWardStatus('ward_unidentified')
        setWardStatusMessage('Ward identification service error.')
      }
    },
    []
  )

  // Handle manual correction or tap/drag on the interactive map, as well as GPS recenter
  const handleManualLocationChange = async (
    newLocation: Coordinates,
    source: 'manual' | 'gps' = 'manual'
  ) => {
    setLocation(newLocation)
    if (source === 'gps') {
      setLocationSource('GPS')
    } else {
      setLocationSource('Manual Pin Adjustment')
      setLocationAccuracy(null)
    }
    setLocationError(null)

    // Trigger automatic ward identification with the updated coordinates
    setWardStatus('identifying_ward')
    setWardStatusMessage(
      source === 'gps'
        ? 'Matching GPS coordinates against ward boundaries...'
        : 'Matching corrected coordinates against ward boundaries...'
    )

    try {
      const result = await identifyWardFromCoordinates(newLocation.latitude, newLocation.longitude)
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
    } catch {
      setWardStatus('ward_unidentified')
      setWardStatusMessage('Ward identification service error.')
    }
  }

  const resetLocation = () => {
    setGpsLocation(null)
    setLocation(null)
    setLocationAccuracy(null)
    setLocationSource(null)
    setGpsCapturedAt(null)
    setLocationError(null)
    setAutoWardId(null)
    setAutoWardName(null)
    setAutoWardNumber(null)
    setWardStatus('location_not_obtained')
    setWardStatusMessage('Ward will be identified automatically after GPS acquisition.')
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
    ? 'Location captured (Photo EXIF)'
    : locationSource === 'GPS'
    ? `Location captured (GPS${
        locationAccuracy !== null ? ` • ±${Math.round(locationAccuracy)}m` : ''
      })`
    : locationSource === 'Manual Pin Adjustment'
    ? 'Location pinned manually'
    : locationError
    ? 'Location unavailable'
    : 'Location pending'

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
    handleManualLocationChange,
    resetLocation,
  }
}
