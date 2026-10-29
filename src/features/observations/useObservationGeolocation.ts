import { useState } from 'react'
import type { LocationSource } from '@/db/database'
import {
  identifyWardFromCoordinates,
  type WardIdentificationStatus,
} from '@/lib/wardService'

export interface Coordinates {
  latitude: number
  longitude: number
}

export function useObservationGeolocation() {
  const [gpsLocation, setGpsLocation] = useState<Coordinates | null>(null)
  const [location, setLocation] = useState<Coordinates | null>(null)
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null)
  const [locationSource, setLocationSource] = useState<LocationSource | null>(null)
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

  // Request high-accuracy GPS coordinates and trigger automatic ward identification
  const getLocation = () => {
    setIsGettingLocation(true)
    setLocationError(null)
    setWardStatus('requesting_location')
    setWardStatusMessage('Requesting GPS coordinates from device...')

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = Number(position.coords.latitude.toFixed(6))
        const lng = Number(position.coords.longitude.toFixed(6))

        // When Get My Location succeeds:
        // 1. Save returned coordinates to gps_latitude and gps_longitude
        setGpsLocation({ latitude: lat, longitude: lng })
        // 2. Initially copy same values into latitude and longitude
        setLocation({ latitude: lat, longitude: lng })
        // 3. Set location_source to GPS
        setLocationSource('GPS')
        setLocationAccuracy(position.coords.accuracy)
        setIsGettingLocation(false)

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
      },
      (error) => {
        setIsGettingLocation(false)
        setLocationError(error.message)
        setWardStatus('location_unavailable')
        setWardStatusMessage(
          `Location permission denied or unavailable (${error.message}). You can select your location manually on the map below.`
        )
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    )
  }

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
    setLocationError(null)
    setAutoWardId(null)
    setAutoWardName(null)
    setAutoWardNumber(null)
    setWardStatus('location_not_obtained')
    setWardStatusMessage('Ward will be identified automatically after GPS acquisition.')
    setIsGettingLocation(false)
  }

  return {
    gpsLocation,
    setGpsLocation,
    location,
    setLocation,
    locationAccuracy,
    setLocationAccuracy,
    locationSource,
    setLocationSource,
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
    getLocation,
    handleManualLocationChange,
    resetLocation,
  }
}

