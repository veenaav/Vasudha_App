import { useEffect, useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { db, type Observation, type IdentificationStatus } from '@/db/database'
import ObservationCard from '@/components/ObservationCard'

export const SPECIES_GROUPS = [
  'Mammals',
  'Birds',
  'Reptiles',
  'Amphibians',
  'Fish',
  'Insects',
  'Arachnids',
  'Crustaceans',
  'Molluscs',
  'Plants',
  'Fungi',
  'Algae',
  'Arthropods',
  'Other',
  'Unknown',
] as const

function Home() {
  // Session & Form state
  const [started, setStarted] = useState(false)
  const [speciesName, setSpeciesName] = useState('')
  const [speciesGroups, setSpeciesGroups] = useState('')
  const [otherSpeciesGroup, setOtherSpeciesGroup] = useState('')
  const [scientificName, setScientificName] = useState('')
  const [identificationStatus, setIdentificationStatus] = useState<IdentificationStatus | ''>('')
  const [notes, setNotes] = useState('')

  // Geolocation state
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null)
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null)
  const [isGettingLocation, setIsGettingLocation] = useState(false)

  // Photo attachments state
  const [photos, setPhotos] = useState<Blob[]>([])
  const [photoCapturedAt, setPhotoCapturedAt] = useState<string | null>(null)

  // Submission & History state
  const [saved, setSaved] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [observations, setObservations] = useState<Observation[]>([])

  // Load existing observations from IndexedDB on initial mount (newest first)
  useEffect(() => {
    let isMounted = true
    db.observations.toArray().then((savedItems) => {
      if (isMounted) setObservations([...savedItems].reverse())
    })
    return () => {
      isMounted = false
    }
  }, [])

  // Derive photo preview URLs synchronously from attached blobs
  const photoPreviews = useMemo(() => photos.map((blob) => URL.createObjectURL(blob)), [photos])

  // Revoke preview object URLs from browser memory when photos change or on unmount
  useEffect(() => {
    return () => {
      photoPreviews.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [photoPreviews])

  // Request high-accuracy GPS coordinates from the browser geolocation API
  const getLocation = () => {
    setIsGettingLocation(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
        setLocationAccuracy(position.coords.accuracy)
        setIsGettingLocation(false)
      },
      (error) => {
        setIsGettingLocation(false)
        alert(`Unable to get location: ${error.message}`)
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    )
  }

  // Reset form inputs and locks back to an empty initial state
  const resetForm = () => {
    setSpeciesName('')
    setSpeciesGroups('')
    setOtherSpeciesGroup('')
    setScientificName('')
    setIdentificationStatus('')
    setNotes('')
    setLocation(null)
    setLocationAccuracy(null)
    setPhotos([])
    setPhotoCapturedAt(null)
    setIsGettingLocation(false)
    setIsSaving(false)
    setSaved(false)
  }

  // Handle identification status changes; auto-clear species names if set to Unknown
  const handleStatusChange = (status: IdentificationStatus | '') => {
    setIdentificationStatus(status)
    if (status === 'Unknown') {
      setSpeciesName('')
      setScientificName('')
    }
  }

  // Append photo files and record selection timestamp for the first photo
  const handleAddPhotos = (fileList: FileList | null) => {
    if (saved || !fileList || fileList.length === 0) return
    const newFiles = Array.from(fileList)
    setPhotos((prev) => [...prev, ...newFiles])
    if (!photoCapturedAt) {
      setPhotoCapturedAt(new Date().toISOString())
    }
  }

  // Remove photo thumbnail by index and clear timestamp if all photos are removed
  const handleRemovePhoto = (indexToRemove: number) => {
    if (saved) return
    setPhotos((prev) => {
      const updated = prev.filter((_, idx) => idx !== indexToRemove)
      if (updated.length === 0) {
        setPhotoCapturedAt(null)
      }
      return updated
    })
  }

  // Validate form fields, timestamps, coordinates, and persist record to IndexedDB
  const handleSaveObservation = async () => {
    if (saved || isSaving) return

    // Validate identification status selection
    if (!identificationStatus) {
      alert('Please select an identification status.')
      return
    }

    // Identified and Needs Verification observations require a common species name
    if (identificationStatus !== 'Unknown' && !speciesName.trim()) {
      alert('Please enter a species or common name.')
      return
    }

    // Unknown observations require at least one photo for identification
    if (identificationStatus === 'Unknown' && photos.length === 0) {
      alert('Please add a photograph for an unknown species.')
      return
    }

    // Validate GPS coordinates and ensure values lie within valid earthly ranges
    const isValidCoordinate =
      location &&
      typeof location.latitude === 'number' &&
      typeof location.longitude === 'number' &&
      !Number.isNaN(location.latitude) &&
      !Number.isNaN(location.longitude) &&
      location.latitude >= -90 &&
      location.latitude <= 90 &&
      location.longitude >= -180 &&
      location.longitude <= 180

    if (!isValidCoordinate) {
      alert('Valid GPS coordinates are required. Please tap "Get My Location" before saving.')
      return
    }

    // Establish observation and record timestamps
    const recordedAt = new Date().toISOString()
    const observationAt = photoCapturedAt ?? recordedAt

    const isValidTimestamp = (val: unknown): boolean =>
      typeof val === 'string' && !Number.isNaN(new Date(val).getTime())

    if (!isValidTimestamp(recordedAt) || !isValidTimestamp(observationAt)) {
      alert('Valid observation and recorded timestamps are required.')
      return
    }

    setIsSaving(true)

    // Save to IndexedDB database and prepend to active list
    try {
      const newObservation: Omit<Observation, 'id'> = {
        speciesName,
        scientificName,
        identificationStatus,
        notes,
        observationAt,
        recordedAt,
        latitude: location.latitude,
        longitude: location.longitude,
        photo: photos[0] ?? null,
        photos,
      }

      const id = await db.observations.add(newObservation)
      setObservations((current) => [{ id, ...newObservation }, ...current])
      setSaved(true)
    } catch (error) {
      alert(`Failed to save observation: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsSaving(false)
    }
  }

  const isUnknown = identificationStatus === 'Unknown'

  return (
    <main className="mx-auto max-w-md p-6">
      {/* Welcome Hero */}
      <section className="text-center">
        <h2 className="text-2xl font-bold">Welcome to Vasudha</h2>
        <p className="mt-2 text-gray-600">Biodiversity Field Data Collection</p>
        <Button
          className="mt-6 min-h-11 w-full text-base"
          onClick={() => {
            setStarted(true)
            resetForm()
          }}
        >
          Start Observation
        </Button>
      </section>

      {/* Observation Entry Form */}
      {started && (
        <section className="mt-8 rounded-xl border p-5">
          <h3 className="text-lg font-semibold">New Observation</h3>

          {/* Species / Common Name input */}
          <div className="mt-5">
            <label htmlFor="speciesName" className="text-sm font-medium">
              Species / Common Name
            </label>
            <input
              id="speciesName"
              type="text"
              value={speciesName}
              disabled={saved || isUnknown}
              onChange={(e) => setSpeciesName(e.target.value)}
              placeholder="Example: Indian Peafowl"
              className="mt-2 w-full rounded-lg border px-3 py-2.5 outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
            />
          </div>

          {/* Identification Status selector */}
          <div>
            <label htmlFor="identificationStatus" className="mb-1 block text-sm font-medium">
              Identification Status
            </label>
            <select
              id="identificationStatus"
              value={identificationStatus}
              disabled={saved}
              onChange={(e) => handleStatusChange(e.target.value as IdentificationStatus | '')}
              className={`mt-2 w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500 ${
                !identificationStatus ? 'text-gray-500' : 'text-gray-900'
              }`}
            >
              <option value="" disabled>
                Select identification status...
              </option>
              <option value="Identified" className="text-gray-900">
                Identified
              </option>
              <option value="Unknown" className="text-gray-900">
                Unknown
              </option>
              <option value="Needs verification" className="text-gray-900">
                Needs verification
              </option>
            </select>
          </div>

          {/* Scientific Name input */}
          <div className="mt-5">
            <label htmlFor="scientificName" className="text-sm font-medium">
              Scientific Name (optional)
            </label>
            <input
              id="scientificName"
              type="text"
              value={scientificName}
              disabled={saved || isUnknown}
              onChange={(e) => setScientificName(e.target.value)}
              placeholder="e.g. Elephas maximus"
              className="mt-2 w-full rounded-lg border px-3 py-2.5 outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
            />
          </div>

          {/* Observation Notes textarea */}
          <div className="mt-5">
            <label htmlFor="notes" className="text-sm font-medium">
              Notes
            </label>
            <textarea
              id="notes"
              value={notes}
              disabled={saved}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any details about the observation..."
              rows={4}
              className="mt-2 w-full rounded-lg border px-3 py-2.5 outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
            />
          </div>

          {/* GPS Location Acquisition and Coordinates Readout */}
          <div className="mt-5">
            <label className="text-sm font-medium">Location</label>
            <Button
              type="button"
              className="mt-2 min-h-11 w-full"
              disabled={saved || isGettingLocation}
              onClick={getLocation}
            >
              {isGettingLocation
                ? 'Acquiring GPS location...'
                : location
                  ? 'Update GPS Location'
                  : 'Get My Location'}
            </Button>

            {location && locationAccuracy !== null && (
              <div className="mt-2 rounded-lg bg-gray-50 p-3 text-xs text-gray-700">
                <p>
                  <strong>Coordinates:</strong> {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
                </p>
                <p className="mt-1">
                  <strong>Accuracy:</strong> ±{Math.round(locationAccuracy)} metres
                </p>
              </div>
            )}
          </div>

          {/* Photographs Attachment and Preview Grid */}
          <div className="mt-5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Photographs</label>
              {photos.length > 0 && (
                <span className="text-xs text-gray-500">
                  {photos.length} {photos.length === 1 ? 'photo' : 'photos'} attached
                </span>
              )}
            </div>

            {/* Camera / Gallery Trigger Buttons */}
            <div className="mt-2 grid grid-cols-2 gap-2">
              <label
                htmlFor={saved ? undefined : 'camera-photo-input'}
                className={`flex items-center justify-center rounded-lg border border-dashed p-3 text-center text-sm font-medium ${
                  saved
                    ? 'cursor-not-allowed bg-gray-100 text-gray-400 opacity-60'
                    : 'cursor-pointer hover:bg-gray-50 active:bg-gray-100'
                }`}
              >
                📷 Take Photo
              </label>

              <label
                htmlFor={saved ? undefined : 'gallery-photo-input'}
                className={`flex items-center justify-center rounded-lg border border-dashed p-3 text-center text-sm font-medium ${
                  saved
                    ? 'cursor-not-allowed bg-gray-100 text-gray-400 opacity-60'
                    : 'cursor-pointer hover:bg-gray-50 active:bg-gray-100'
                }`}
              >
                🖼️ Upload from Gallery
              </label>
            </div>

            <input
              id="camera-photo-input"
              type="file"
              accept="image/*"
              capture="environment"
              disabled={saved}
              className="hidden"
              onChange={(e) => {
                handleAddPhotos(e.target.files)
                e.target.value = ''
              }}
            />

            <input
              id="gallery-photo-input"
              type="file"
              accept="image/*"
              multiple
              disabled={saved}
              className="hidden"
              onChange={(e) => {
                handleAddPhotos(e.target.files)
                e.target.value = ''
              }}
            />

            {/* Preview Thumbnails */}
            {photoPreviews.length > 0 && (
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {photoPreviews.map((url, idx) => (
                  <div key={idx} className="relative overflow-hidden rounded-lg border bg-gray-50">
                    <img
                      src={url}
                      alt={`Photo preview ${idx + 1}`}
                      className="aspect-square w-full object-cover"
                    />
                    {!saved && (
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(idx)}
                        className="absolute top-1 right-1 flex h-7 w-7 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white shadow hover:bg-red-700 active:scale-95"
                        title="Remove photo"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Save Action Button */}
          <Button
            type="button"
            className="mt-6 min-h-11 w-full text-base"
            disabled={saved || isSaving}
            onClick={handleSaveObservation}
          >
            {isSaving ? 'Saving observation...' : 'Save Observation'}
          </Button>

          {/* Saved Confirmation Banner */}
          {saved && (
            <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-center">
              <p className="text-sm font-semibold text-emerald-800">
                ✓ Observation saved successfully!
              </p>
              <p className="mt-1 text-xs text-emerald-700">
                Form is locked to prevent accidental changes.
              </p>
              <Button
                type="button"
                className="mt-3 min-h-11 w-full text-base"
                onClick={resetForm}
              >
                + New Observation
              </Button>
            </div>
          )}
        </section>
      )}

      {/* Observations Collection Display */}
      <section className="mt-8 rounded-xl border p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">My Observations</h3>
          <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
            {observations.length} {observations.length === 1 ? 'observation' : 'observations'}
          </span>
        </div>

        {observations.length > 0 ? (
          <div className="mt-4 space-y-4">
            {observations.map((observation) => (
              <ObservationCard
                key={observation.id}
                observation={observation}
                onDelete={handleDeleteObservation}
              />
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm text-gray-600">
            No observations recorded yet.
          </p>
        )}
      </section>
    </main>
  )
}

export default Home