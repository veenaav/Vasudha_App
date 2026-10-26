import { useEffect, useState, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  db,
  type Observation,
  type IdentificationStatus,
  type Project,
  type Ward,
  type Survey,
  MICRO_HABITATS,
  LIFE_STAGES,
  TRADITIONAL_KNOWLEDGE_SOURCES,
  type YesNo,
} from '@/db/database'
import {
  ArrowLeft,
  MapPin,
  Camera,
  Image as ImageIcon,
  CheckCircle2,
  RotateCcw,
  Loader2,
  X,
  Clock,
  AlertCircle,
  Compass,
} from 'lucide-react'
import {
  identifyWardFromCoordinates,
  type WardIdentificationStatus,
} from '@/lib/wardService'

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
  // Route params for hierarchical navigation: Project -> Ward -> Survey -> Observation
  const { projectId, wardId, surveyId, id } = useParams<{
    projectId?: string
    wardId?: string
    surveyId?: string
    id?: string
  }>()
  const navigate = useNavigate()
  const isEditMode = Boolean(id)
  const [existingRecord, setExistingRecord] = useState<Observation | null>(null)
  const [isLoadingExisting, setIsLoadingExisting] = useState(Boolean(id))

  // Context state for active survey session
  const [activeProject, setActiveProject] = useState<Project | null>(null)
  const [activeWard, setActiveWard] = useState<Ward | null>(null)
  const [activeSurvey, setActiveSurvey] = useState<Survey | null>(null)

  // Form field state
  const [speciesName, setSpeciesName] = useState('')
  // Local Name / Vernacular Name (supports Malayalam & other Indian regional scripts)
  const [localName, setLocalName] = useState('')
  // Unified singular naming: selected species group (e.g. 'Birds', 'Mammals')
  const [speciesGroup, setSpeciesGroup] = useState('')
  const [otherSpeciesGroup, setOtherSpeciesGroup] = useState('')
  const [scientificName, setScientificName] = useState('')
  const [identificationStatus, setIdentificationStatus] = useState<IdentificationStatus | ''>('')
  const [notes, setNotes] = useState('')

  // Abundance & Ecology state
  const [individualCount, setIndividualCount] = useState<number>(1)
  const [lifeStage, setLifeStage] = useState('')
  const [microHabitat, setMicroHabitat] = useState('')
  const [otherMicroHabitat, setOtherMicroHabitat] = useState('')

  // Traditional Knowledge documentation state
  const [hasTraditionalKnowledge, setHasTraditionalKnowledge] = useState<YesNo | ''>('')
  const [traditionalKnowledgeSource, setTraditionalKnowledgeSource] = useState('')
  const [otherTraditionalKnowledgeSource, setOtherTraditionalKnowledgeSource] = useState('')

  // Geolocation state
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null)
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null)
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

  // Photo attachments state
  const [photos, setPhotos] = useState<Blob[]>([])
  const [photoCapturedAt, setPhotoCapturedAt] = useState<string | null>(null)

  // Submission state
  const [saved, setSaved] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Load parent Project, Ward, and Survey if route params exist
  useEffect(() => {
    if (surveyId) {
      db.surveys.get(surveyId).then((s) => s && setActiveSurvey(s))
    }
    if (wardId) {
      db.wards.get(wardId).then((w) => w && setActiveWard(w))
    }
    if (projectId) {
      db.projects.get(projectId).then((p) => p && setActiveProject(p))
    }
  }, [projectId, wardId, surveyId])

  // Load existing observation if in edit mode
  useEffect(() => {
    if (!id) return
    let isMounted = true
    setIsLoadingExisting(true)
    db.observations
      .get(id)
      .then((existing) => {
        if (!isMounted) return
        if (!existing) {
          alert('Observation record not found.')
          navigate('/observations', { replace: true })
          return
        }
        setExistingRecord(existing)
        setSpeciesName(existing.speciesName || '')
        setLocalName(existing.localName || '')
        setScientificName(existing.scientificName || '')
        const group = existing.speciesGroup || existing.speciesGroups || ''
        setSpeciesGroup(group)
        setOtherSpeciesGroup(existing.otherSpeciesGroup || '')
        setIdentificationStatus(existing.identificationStatus || '')
        setNotes(existing.notes || '')
        setIndividualCount(existing.individualCount ?? 1)
        setLifeStage(existing.lifeStage || '')
        setMicroHabitat(existing.microHabitat || '')
        setOtherMicroHabitat(existing.otherMicroHabitat || '')
        setHasTraditionalKnowledge(existing.hasTraditionalKnowledge || '')
        setTraditionalKnowledgeSource(existing.traditionalKnowledgeSource || '')
        setOtherTraditionalKnowledgeSource(existing.otherTraditionalKnowledgeSource || '')
        if (
          existing.latitude !== null &&
          existing.longitude !== null &&
          existing.latitude !== undefined &&
          existing.longitude !== undefined
        ) {
          setLocation({ latitude: existing.latitude, longitude: existing.longitude })
          setLocationAccuracy(existing.accuracyMeters ?? null)
        }

        if (existing.wardId) {
          setAutoWardId(existing.wardId)
          setAutoWardName(existing.wardName || null)
          setWardStatus('ward_identified')
          setWardStatusMessage(existing.wardName ? `Ward: ${existing.wardName}` : `Ward ID: ${existing.wardId}`)
        } else if (existing.latitude && existing.longitude) {
          setAutoWardId(null)
          setAutoWardName(null)
          setWardStatus('ward_unidentified')
          setWardStatusMessage('Ward could not be identified from coordinates (Official boundary dataset pending).')
        } else {
          setWardStatus('location_not_obtained')
          setWardStatusMessage('Ward will be identified automatically after GPS acquisition.')
        }
        const attached = existing.photos?.length
          ? existing.photos
          : existing.photo
          ? [existing.photo]
          : []
        setPhotos(attached)
        setPhotoCapturedAt(existing.observationAt || null)
      })
      .catch((err) => {
        console.error('Failed to load observation for editing:', err)
        alert('Could not load observation record.')
        navigate('/observations', { replace: true })
      })
      .finally(() => {
        if (isMounted) setIsLoadingExisting(false)
      })

    return () => {
      isMounted = false
    }
  }, [id, navigate])

  // Derive photo preview URLs synchronously from attached blobs
  const photoPreviews = useMemo(() => photos.map((blob) => URL.createObjectURL(blob)), [photos])

  // Revoke preview object URLs from browser memory when photos change or on unmount
  useEffect(() => {
    return () => {
      photoPreviews.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [photoPreviews])

  // Request high-accuracy GPS coordinates and trigger automatic ward identification
  const getLocation = () => {
    setIsGettingLocation(true)
    setLocationError(null)
    setWardStatus('requesting_location')
    setWardStatusMessage('Requesting GPS coordinates from device...')

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude
        setLocation({
          latitude: lat,
          longitude: lng,
        })
        setLocationAccuracy(position.coords.accuracy)
        setIsGettingLocation(false)

        // Automatic GPS-based ward identification step
        setWardStatus('identifying_ward')
        setWardStatusMessage('Matching coordinates against Thiruvananthapuram Corporation ward boundaries...')

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
        setWardStatusMessage(`Location permission denied or unavailable: ${error.message}`)
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
    setLocalName('')
    setSpeciesGroup('')
    setOtherSpeciesGroup('')
    setScientificName('')
    setIdentificationStatus('')
    setNotes('')
    setIndividualCount(1)
    setLifeStage('')
    setMicroHabitat('')
    setOtherMicroHabitat('')
    setHasTraditionalKnowledge('')
    setTraditionalKnowledgeSource('')
    setOtherTraditionalKnowledgeSource('')
    setLocation(null)
    setLocationAccuracy(null)
    setLocationError(null)
    setAutoWardId(null)
    setAutoWardName(null)
    setAutoWardNumber(null)
    setWardStatus('location_not_obtained')
    setWardStatusMessage('Ward will be identified automatically after GPS acquisition.')
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
      setLocalName('')
      setScientificName('')
    }
  }

  // Handle Micro-habitat dropdown changes; auto-clear custom input if not 'Other'
  const handleMicroHabitatChange = (value: string) => {
    setMicroHabitat(value)
    if (value !== 'Other') {
      setOtherMicroHabitat('')
    }
  }

  // Handle Traditional Knowledge toggle; clear downstream source selections if switched to No or empty
  const handleTraditionalKnowledgeChange = (value: YesNo | '') => {
    setHasTraditionalKnowledge(value)
    if (value !== 'Yes') {
      setTraditionalKnowledgeSource('')
      setOtherTraditionalKnowledgeSource('')
    }
  }

  // Handle Traditional Knowledge source changes; auto-clear custom input if not 'Other'
  const handleTraditionalKnowledgeSourceChange = (value: string) => {
    setTraditionalKnowledgeSource(value)
    if (value !== 'Other') {
      setOtherTraditionalKnowledgeSource('')
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

    // Validate individual count (must be a positive integer >= 1)
    const parsedCount = Number(individualCount)
    if (!Number.isInteger(parsedCount) || parsedCount < 1) {
      alert('Please enter a valid individual count (1 or greater).')
      return
    }

    // Validate geolocation coordinates capture
    if (!location) {
      alert('Please acquire GPS location coordinates before saving.')
      return
    }

    // Validate Traditional Knowledge source when user selected "Yes"
    if (hasTraditionalKnowledge === 'Yes' && !traditionalKnowledgeSource) {
      alert('Please select the source of traditional knowledge.')
      return
    }

    setIsSaving(true)

    try {
      const nowTimestamp = new Date().toISOString()
      const observationAt = photoCapturedAt || nowTimestamp
      const recordedAt = nowTimestamp

      const finalOtherGroup = speciesGroup === 'Other' && otherSpeciesGroup.trim()
        ? otherSpeciesGroup.trim()
        : undefined

      const finalOtherMicroHabitat = microHabitat === 'Other' && otherMicroHabitat.trim()
        ? otherMicroHabitat.trim()
        : undefined

      const finalOtherTKSource = hasTraditionalKnowledge === 'Yes' && traditionalKnowledgeSource === 'Other' && otherTraditionalKnowledgeSource.trim()
        ? otherTraditionalKnowledgeSource.trim()
        : undefined

      if (isEditMode && existingRecord && id) {
        // Update existing record: preserve original ID, createdAt, and recordedAt
        const updatedObservation: Observation = {
          ...existingRecord,
          id: existingRecord.id,
          surveyId: existingRecord.surveyId,
          wardId: autoWardId ?? existingRecord.wardId,
          wardName: autoWardName ?? existingRecord.wardName,
          projectId: existingRecord.projectId,

          speciesName: speciesName.trim(),
          localName: localName.trim() || undefined,
          scientificName: scientificName.trim() || undefined,
          speciesGroup: speciesGroup || undefined,
          speciesGroups: speciesGroup || undefined,
          otherSpeciesGroup: finalOtherGroup,
          identificationStatus: identificationStatus as IdentificationStatus,
          notes: notes.trim(),

          individualCount: parsedCount,
          lifeStage: lifeStage || undefined,
          microHabitat: microHabitat || undefined,
          otherMicroHabitat: finalOtherMicroHabitat,

          hasTraditionalKnowledge: hasTraditionalKnowledge || undefined,
          traditionalKnowledgeSource: hasTraditionalKnowledge === 'Yes' ? traditionalKnowledgeSource : undefined,
          otherTraditionalKnowledgeSource: finalOtherTKSource,

          observationAt,
          recordedAt: existingRecord.recordedAt, // Preserve original recording timestamp
          latitude: location.latitude,
          longitude: location.longitude,
          accuracyMeters: locationAccuracy !== null ? locationAccuracy : null,
          photo: photos[0] ?? null,
          photos,

          verificationStatus: existingRecord.verificationStatus || 'Unreviewed',
          verifiedBy: existingRecord.verifiedBy,
          verificationNotes: existingRecord.verificationNotes,
          syncStatus: 'pending',
          createdAt: existingRecord.createdAt || existingRecord.recordedAt, // Preserve original creation timestamp
          updatedAt: nowTimestamp,
        }

        await db.observations.put(updatedObservation)
        setSaved(true)
      } else {
        const newObservation: Observation = {
          id: crypto.randomUUID(),
          // Link to parent Project / Survey session if active; ward is automatically identified
          surveyId: surveyId || undefined,
          wardId: autoWardId || undefined,
          wardName: autoWardName || undefined,
          projectId: projectId || undefined,

          // Core Taxonomy & Identification
          speciesName: speciesName.trim(),
          localName: localName.trim() || undefined,
          scientificName: scientificName.trim() || undefined,
          speciesGroup: speciesGroup || undefined,
          speciesGroups: speciesGroup || undefined,
          otherSpeciesGroup: finalOtherGroup,
          identificationStatus: identificationStatus as IdentificationStatus,
          notes: notes.trim(),

          // Ecological metadata
          individualCount: parsedCount,
          lifeStage: lifeStage || undefined,
          microHabitat: microHabitat || undefined,
          otherMicroHabitat: finalOtherMicroHabitat,

          // Traditional Knowledge documentation
          hasTraditionalKnowledge: hasTraditionalKnowledge || undefined,
          traditionalKnowledgeSource: hasTraditionalKnowledge === 'Yes' ? traditionalKnowledgeSource : undefined,
          otherTraditionalKnowledgeSource: finalOtherTKSource,

          observationAt,
          recordedAt,
          latitude: location.latitude,
          longitude: location.longitude,
          accuracyMeters: locationAccuracy !== null ? locationAccuracy : null,
          photo: photos[0] ?? null,
          photos,

          verificationStatus: 'Unreviewed',
          syncStatus: 'pending',
          createdAt: nowTimestamp,
          updatedAt: nowTimestamp,
        }

        await db.observations.add(newObservation)
        setSaved(true)
      }
    } catch (error) {
      alert(`Failed to save observation: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsSaving(false)
    }
  }

  const isUnknown = identificationStatus === 'Unknown'

  // Format observation time for display
  const displayObservationTime = photoCapturedAt
    ? new Date(photoCapturedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
    : new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })

  if (isLoadingExisting) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center text-[#C5D1BD]">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#C5D1BD]" />
        <p className="mt-3 text-sm">Loading observation record...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-5 sm:px-6">
      {/* Header Context */}
      {surveyId ? (
        <div className="mb-6">
          <nav className="mb-2.5 flex items-center gap-1.5 text-xs tracking-wider uppercase text-[#C5D1BD]">
            <Link
              to={`/projects/${projectId}/wards/${wardId}/surveys`}
              className="inline-flex items-center gap-1 text-[#F5F0E4] hover:underline"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Field Visits</span>
            </Link>
            <span>/</span>
            <span className="font-semibold text-[#F5F0E4]">Log Observation</span>
          </nav>

          <div className="rounded-3xl border border-[#DCD5C5] bg-[#FAF7F0] p-4 sm:p-5 shadow-xl text-[#263D2B]">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-[#263D2B] px-3 py-0.5 text-xs font-semibold tracking-wider uppercase text-[#F5F0E4]">
                Ward {activeWard?.wardNumber}
              </span>
              <span className="text-xs text-[#414B32] font-medium">
                {activeSurvey?.leadObserver ? `Lead: ${activeSurvey.leadObserver}` : 'Survey Session'}
              </span>
            </div>
            <p className="mt-1.5 font-heading text-lg font-normal tracking-wide text-[#263D2B]">
              {activeWard?.wardName || 'Ward'}
              {activeProject?.name ? ` • ${activeProject.name}` : ''}
            </p>
          </div>
        </div>
      ) : (
        <div className="mb-6 flex items-center justify-between border-b border-white/15 pb-4">
          <div>
            <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#C5D1BD]">
              {isEditMode ? 'Update Observation' : 'Field Recording'}
            </span>
            <h1 className="font-heading text-2xl sm:text-[28px] font-normal tracking-wide text-[#F5F0E4]">
              {isEditMode ? 'Edit Observation' : 'New Observation'}
            </h1>
          </div>
          {isEditMode && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Discard unsaved changes and return to records?')) {
                  navigate('/observations')
                }
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-medium tracking-wider uppercase text-[#C5D1BD] hover:bg-white/20 hover:text-[#F5F0E4] transition-colors"
            >
              <X className="h-3.5 w-3.5" />
              <span>Cancel</span>
            </button>
          )}
        </div>
      )}

      {/* Observation Form Container — MOYA-Inspired Warm Cream / Oatmeal Sections for Outdoor Contrast */}
      <div className="space-y-5">
        {/* 1. Photographs */}
        <section className="rounded-3xl border border-[#DCD5C5] bg-[#FAF7F0] p-5 sm:p-6 shadow-xl text-[#263D2B]">
          <div className="flex items-center justify-between border-b border-[#DCD5C5] pb-3">
            <h2 className="font-heading text-base sm:text-lg font-normal tracking-wider uppercase text-[#263D2B]">
              1. Photographs {isUnknown && <span className="text-[#B87555] text-base">*</span>}
            </h2>
            {photos.length > 0 && (
              <span className="rounded-full bg-[#263D2B] px-2.5 py-0.5 text-[11px] font-semibold text-[#F5F0E4]">
                {photos.length} {photos.length === 1 ? 'photo' : 'photos'}
              </span>
            )}
          </div>

          {/* Camera and Gallery Buttons */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <label
              htmlFor={saved ? undefined : 'camera-photo-input'}
              className={`flex min-h-[48px] items-center justify-center gap-2 rounded-2xl border border-dashed border-[#C5D1BD] p-3 text-center text-sm font-medium transition ${
                saved
                  ? 'cursor-not-allowed bg-gray-100 text-gray-400'
                  : 'cursor-pointer bg-white text-[#263D2B] hover:bg-[#EDE7DA] active:scale-98 shadow-xs'
              }`}
            >
              <Camera className="h-4.5 w-4.5 shrink-0 text-[#263D2B]" />
              <span>Take Photo</span>
            </label>

            <label
              htmlFor={saved ? undefined : 'gallery-photo-input'}
              className={`flex min-h-[48px] items-center justify-center gap-2 rounded-2xl border border-dashed border-[#C5D1BD] p-3 text-center text-sm font-medium transition ${
                saved
                  ? 'cursor-not-allowed bg-gray-100 text-gray-400'
                  : 'cursor-pointer bg-white text-[#263D2B] hover:bg-[#EDE7DA] active:scale-98 shadow-xs'
              }`}
            >
              <ImageIcon className="h-4.5 w-4.5 shrink-0 text-[#263D2B]" />
              <span>Choose Gallery</span>
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

          {/* Photo Previews */}
          {photoPreviews.length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-2.5">
              {photoPreviews.map((url, idx) => (
                <div key={idx} className="relative aspect-square overflow-hidden rounded-2xl border border-[#C5D1BD] bg-[#EDE7DA]">
                  <img
                    src={url}
                    alt={`Preview ${idx + 1}`}
                    className="h-full w-full object-cover"
                  />
                  {!saved && (
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(idx)}
                      className="absolute top-1.5 right-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-[#B87555] text-white shadow-md hover:bg-[#9F5F41] active:scale-95"
                      aria-label="Remove photo"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 2. Location & Administrative Ward (Automatic GPS Identification) */}
        <section className="rounded-3xl border border-[#DCD5C5] bg-[#FAF7F0] p-5 sm:p-6 shadow-xl text-[#263D2B]">
          <div className="flex items-center justify-between border-b border-[#DCD5C5] pb-3">
            <h2 className="font-heading text-base sm:text-lg font-normal tracking-wider uppercase text-[#263D2B]">
              2. Location & Ward <span className="text-[#B87555] text-base">*</span>
            </h2>
            {location && locationAccuracy !== null && (
              <span
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${
                  locationAccuracy <= 10
                    ? 'bg-[#E5EFE4] text-[#263D2B] border-[#C5D1BD]'
                    : 'bg-[#B87555]/20 text-[#B87555] border-[#B87555]/40'
                }`}
              >
                ±{Math.round(locationAccuracy)}m accuracy
              </span>
            )}
          </div>

          {/* GPS Acquire / Retry Button */}
          <div className="mt-4 flex gap-2">
            <Button
              type="button"
              className="min-h-[50px] flex-1 bg-[#263D2B] text-[#F5F0E4] border border-[#C5D1BD]/40 hover:bg-[#344F3A] font-medium text-base shadow-sm rounded-2xl transition-all active:scale-98 tracking-wide"
              disabled={saved || isGettingLocation}
              onClick={getLocation}
            >
              {isGettingLocation ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin text-[#C5D1BD]" />
                  <span>Acquiring Coordinates...</span>
                </>
              ) : location ? (
                <>
                  <MapPin className="h-5 w-5 mr-2 text-[#C5D1BD]" />
                  <span>Update GPS Location</span>
                </>
              ) : locationError ? (
                <>
                  <RotateCcw className="h-5 w-5 mr-2 text-[#C5D1BD]" />
                  <span>Retry GPS Location</span>
                </>
              ) : (
                <>
                  <MapPin className="h-5 w-5 mr-2 text-[#C5D1BD]" />
                  <span>Acquire Coordinates</span>
                </>
              )}
            </Button>
          </div>

          {/* Coordinates and Time Readout */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-[#EDE7DA] px-4 py-3 border border-[#DCD5C5] text-sm">
            <div className="flex items-center gap-2 font-mono text-sm sm:text-base font-medium text-[#263D2B]">
              <MapPin className="h-4 w-4 text-[#263D2B] shrink-0" />
              <span>
                {location
                  ? `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`
                  : 'Coordinates not captured'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#414B32]">
              <Clock className="h-3.5 w-3.5 text-[#414B32]" />
              <span>{displayObservationTime}</span>
            </div>
          </div>

          {/* Dedicated Read-Only Administrative Ward Information Field */}
          <div className="mt-4 pt-4 border-t border-[#DCD5C5]">
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold tracking-wider uppercase text-[#414B32]">
                Administrative Ward
              </label>
              <span className="rounded-full bg-white/80 border border-[#C5D1BD] px-2 py-0.5 text-[10px] font-semibold text-[#414B32] uppercase tracking-wider">
                Automatic GPS • Read-Only
              </span>
            </div>

            {/* Read-only Ward container supporting all 7 states */}
            <div
              className={`rounded-2xl border p-4 transition-all ${
                wardStatus === 'ward_identified'
                  ? 'border-[#C5D1BD] bg-[#E5EFE4] text-[#263D2B]'
                  : wardStatus === 'identifying_ward' || wardStatus === 'requesting_location'
                  ? 'border-[#C5D1BD] bg-white text-[#263D2B]'
                  : wardStatus === 'location_unavailable'
                  ? 'border-red-300 bg-red-50 text-red-900'
                  : 'border-[#DCD5C5] bg-white/70 text-[#414B32]'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 shrink-0">
                  {wardStatus === 'ward_identified' ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-700" />
                  ) : wardStatus === 'identifying_ward' || wardStatus === 'requesting_location' ? (
                    <Loader2 className="h-5 w-5 animate-spin text-[#263D2B]" />
                  ) : wardStatus === 'location_unavailable' ? (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  ) : (
                    <Compass className="h-5 w-5 text-[#414B32]/70" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-heading text-base font-medium">
                      {wardStatus === 'ward_identified' && autoWardName
                        ? `Ward ${autoWardNumber ? autoWardNumber + ' – ' : ''}${autoWardName}`
                        : wardStatus === 'location_not_obtained'
                        ? 'Ward will be identified automatically after GPS acquisition'
                        : wardStatus === 'requesting_location'
                        ? 'Requesting location...'
                        : wardStatus === 'identifying_ward'
                        ? 'Identifying ward from boundary dataset...'
                        : wardStatus === 'location_unavailable'
                        ? 'Location unavailable'
                        : 'Ward could not be identified'}
                    </span>

                    {autoWardId && (
                      <span className="rounded bg-[#263D2B] px-1.5 py-0.5 font-mono text-[10px] text-[#F5F0E4]">
                        ID: {autoWardId}
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-xs leading-relaxed text-[#414B32]/85">
                    {wardStatusMessage}
                  </p>

                  {/* Quick retry action if location permission failed outdoors */}
                  {wardStatus === 'location_unavailable' && (
                    <button
                      type="button"
                      onClick={getLocation}
                      disabled={isGettingLocation}
                      className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-red-800 hover:underline"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      <span>Retry acquiring GPS</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Identification Status */}
        <section className="rounded-3xl border border-[#DCD5C5] bg-[#FAF7F0] p-5 sm:p-6 shadow-xl text-[#263D2B]">
          <h2 className="font-heading text-base sm:text-lg font-normal tracking-wider uppercase text-[#263D2B] border-b border-[#DCD5C5] pb-3">
            3. Identification Status <span className="text-[#B87555] text-base">*</span>
          </h2>

          <div className="mt-4">
            <label htmlFor="identificationStatus" className="block text-xs font-semibold tracking-wider uppercase text-[#414B32]">
              Select Status
            </label>
            <select
              id="identificationStatus"
              value={identificationStatus}
              disabled={saved}
              onChange={(e) => handleStatusChange(e.target.value as IdentificationStatus | '')}
              className={`mt-2 w-full min-h-[48px] rounded-xl border border-[#C5D1BD] bg-white px-4 py-3 text-base font-medium outline-none focus:border-[#263D2B] focus:ring-1 focus:ring-[#263D2B] disabled:cursor-not-allowed disabled:bg-gray-100 ${
                !identificationStatus ? 'text-[#414B32]/60' : 'text-[#263D2B]'
              }`}
            >
              <option value="" disabled className="text-gray-400">Select status...</option>
              <option value="Identified">Identified (Known species)</option>
              <option value="Unknown">Unknown (Photo required for ID)</option>
              <option value="Needs verification">Needs verification (Tentative)</option>
            </select>
          </div>
        </section>

        {/* 4. Species Details */}
        <section className="rounded-3xl border border-[#DCD5C5] bg-[#FAF7F0] p-5 sm:p-6 shadow-xl text-[#263D2B]">
          <h2 className="font-heading text-base sm:text-lg font-normal tracking-wider uppercase text-[#263D2B] border-b border-[#DCD5C5] pb-3">
            4. Species Details
          </h2>

          {/* Common Name */}
          <div className="mt-4">
            <label htmlFor="speciesName" className="block text-xs font-semibold tracking-wider uppercase text-[#414B32]">
              Common Name {!isUnknown && <span className="text-[#B87555]">*</span>}
            </label>
            <input
              id="speciesName"
              type="text"
              value={speciesName}
              disabled={saved || isUnknown}
              onChange={(e) => setSpeciesName(e.target.value)}
              placeholder={isUnknown ? 'Locked for Unknown species' : 'e.g. Indian Peafowl, Cinnamon Tree'}
              className="mt-2 w-full min-h-[48px] rounded-xl border border-[#C5D1BD] bg-white px-4 py-3 text-base text-[#263D2B] placeholder-[#414B32]/40 outline-none focus:border-[#263D2B] focus:ring-1 focus:ring-[#263D2B] disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
            />
          </div>

          {/* Local Name / Vernacular Name */}
          <div className="mt-4">
            <label htmlFor="localName" className="block text-xs font-semibold tracking-wider uppercase text-[#414B32]">
              Local Name / Vernacular Name (optional)
            </label>
            <input
              id="localName"
              type="text"
              value={localName}
              disabled={saved || isUnknown}
              onChange={(e) => setLocalName(e.target.value)}
              placeholder="e.g. നാട്ടുമയിൽ, തുളസി, കണിക്കൊന്ന"
              className="mt-2 w-full min-h-[48px] rounded-xl border border-[#C5D1BD] bg-white px-4 py-3 text-base text-[#263D2B] placeholder-[#414B32]/40 outline-none focus:border-[#263D2B] focus:ring-1 focus:ring-[#263D2B] disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
            />
          </div>

          {/* Scientific Name */}
          <div className="mt-4">
            <label htmlFor="scientificName" className="block text-xs font-semibold tracking-wider uppercase text-[#414B32]">
              Scientific Name (optional)
            </label>
            <input
              id="scientificName"
              type="text"
              value={scientificName}
              disabled={saved || isUnknown}
              onChange={(e) => setScientificName(e.target.value)}
              placeholder="e.g. Pavo cristatus"
              className="mt-2 w-full min-h-[48px] rounded-xl border border-[#C5D1BD] bg-white px-4 py-3 text-base italic text-[#263D2B] placeholder-[#414B32]/40 outline-none focus:border-[#263D2B] focus:ring-1 focus:ring-[#263D2B] disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
            />
          </div>

          {/* Species Group */}
          <div className="mt-4">
            <label htmlFor="speciesGroup" className="block text-xs font-semibold tracking-wider uppercase text-[#414B32]">
              Species Group
            </label>
            <select
              id="speciesGroup"
              value={speciesGroup}
              disabled={saved}
              onChange={(e) => {
                setSpeciesGroup(e.target.value)
                if (e.target.value !== 'Other') setOtherSpeciesGroup('')
              }}
              className={`mt-2 w-full min-h-[48px] rounded-xl border border-[#C5D1BD] bg-white px-4 py-3 text-base outline-none focus:border-[#263D2B] focus:ring-1 focus:ring-[#263D2B] disabled:cursor-not-allowed disabled:bg-gray-100 ${
                !speciesGroup ? 'text-[#414B32]/60' : 'text-[#263D2B]'
              }`}
            >
              <option value="">Select Species Group...</option>
              {SPECIES_GROUPS.map((group) => (
                <option key={group} value={group}>{group}</option>
              ))}
            </select>

            {speciesGroup === 'Other' && (
              <div className="mt-3">
                <input
                  id="otherSpeciesGroup"
                  type="text"
                  value={otherSpeciesGroup}
                  disabled={saved}
                  onChange={(event) => setOtherSpeciesGroup(event.target.value)}
                  placeholder="Specify other group..."
                  className="w-full min-h-[48px] rounded-xl border border-[#C5D1BD] bg-white px-4 py-3 text-base text-[#263D2B] placeholder-[#414B32]/40 outline-none focus:border-[#263D2B] focus:ring-1 focus:ring-[#263D2B]"
                />
              </div>
            )}
          </div>
        </section>

        {/* 5. Ecological Details */}
        <section className="rounded-3xl border border-[#DCD5C5] bg-[#FAF7F0] p-5 sm:p-6 shadow-xl text-[#263D2B]">
          <h2 className="font-heading text-base sm:text-lg font-normal tracking-wider uppercase text-[#263D2B] border-b border-[#DCD5C5] pb-3">
            5. Ecological Details
          </h2>

          <div className="mt-4 grid grid-cols-2 gap-3.5">
            <div>
              <label htmlFor="individualCount" className="block text-xs font-semibold tracking-wider uppercase text-[#414B32]">
                Count <span className="text-[#B87555]">*</span>
              </label>
              <input
                id="individualCount"
                type="number"
                min={1}
                step={1}
                value={individualCount}
                disabled={saved}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10)
                  setIndividualCount(Number.isNaN(val) ? 1 : val)
                }}
                className="mt-2 w-full min-h-[48px] rounded-xl border border-[#C5D1BD] bg-white px-4 py-3 text-base font-semibold text-[#263D2B] outline-none focus:border-[#263D2B] focus:ring-1 focus:ring-[#263D2B]"
              />
            </div>

            <div>
              <label htmlFor="lifeStage" className="block text-xs font-semibold tracking-wider uppercase text-[#414B32]">
                Life Stage (optional)
              </label>
              <select
                id="lifeStage"
                value={lifeStage}
                disabled={saved}
                onChange={(e) => setLifeStage(e.target.value)}
                className={`mt-2 w-full min-h-[48px] rounded-xl border border-[#C5D1BD] bg-white px-4 py-3 text-base outline-none focus:border-[#263D2B] focus:ring-1 focus:ring-[#263D2B] ${
                  !lifeStage ? 'text-[#414B32]/60' : 'text-[#263D2B]'
                }`}
              >
                <option value="">Select stage...</option>
                {LIFE_STAGES.map((stage) => (
                  <option key={stage} value={stage}>{stage}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label htmlFor="microHabitat" className="block text-xs font-semibold tracking-wider uppercase text-[#414B32]">
              Micro-habitat / Substrate (optional)
            </label>
            <select
              id="microHabitat"
              value={microHabitat}
              disabled={saved}
              onChange={(e) => handleMicroHabitatChange(e.target.value)}
              className={`mt-2 w-full min-h-[48px] rounded-xl border border-[#C5D1BD] bg-white px-4 py-3 text-base outline-none focus:border-[#263D2B] focus:ring-1 focus:ring-[#263D2B] ${
                !microHabitat ? 'text-[#414B32]/60' : 'text-[#263D2B]'
              }`}
            >
              <option value="">Select substrate...</option>
              {MICRO_HABITATS.map((habitat) => (
                <option key={habitat} value={habitat}>{habitat}</option>
              ))}
            </select>

            {microHabitat === 'Other' && (
              <div className="mt-3">
                <input
                  id="otherMicroHabitat"
                  type="text"
                  value={otherMicroHabitat}
                  disabled={saved}
                  onChange={(e) => setOtherMicroHabitat(e.target.value)}
                  placeholder="Specify other micro-habitat..."
                  className="w-full min-h-[48px] rounded-xl border border-[#C5D1BD] bg-white px-4 py-3 text-base text-[#263D2B] placeholder-[#414B32]/40 outline-none focus:border-[#263D2B] focus:ring-1 focus:ring-[#263D2B]"
                />
              </div>
            )}
          </div>
        </section>

        {/* 6. Traditional Knowledge */}
        <section className="rounded-3xl border border-[#DCD5C5] bg-[#FAF7F0] p-5 sm:p-6 shadow-xl text-[#263D2B]">
          <h2 className="font-heading text-base sm:text-lg font-normal tracking-wider uppercase text-[#263D2B] border-b border-[#DCD5C5] pb-3">
            6. Traditional Knowledge
          </h2>

          <div className="mt-4">
            <label htmlFor="hasTraditionalKnowledge" className="block text-xs font-semibold tracking-wider uppercase text-[#414B32]">
              Is traditional knowledge associated?
            </label>
            <select
              id="hasTraditionalKnowledge"
              value={hasTraditionalKnowledge}
              disabled={saved}
              onChange={(e) => handleTraditionalKnowledgeChange(e.target.value as YesNo | '')}
              className={`mt-2 w-full min-h-[48px] rounded-xl border border-[#C5D1BD] bg-white px-4 py-3 text-base outline-none focus:border-[#263D2B] focus:ring-1 focus:ring-[#263D2B] ${
                !hasTraditionalKnowledge ? 'text-[#414B32]/60' : 'text-[#263D2B]'
              }`}
            >
              <option value="">Select Yes or No...</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>

            {hasTraditionalKnowledge === 'Yes' && (
              <div className="mt-3 space-y-3 rounded-2xl bg-[#EDE7DA] border border-[#DCD5C5] p-4 text-base">
                <div>
                  <label htmlFor="traditionalKnowledgeSource" className="block text-xs font-semibold tracking-wider uppercase text-[#263D2B]">
                    Source of Knowledge <span className="text-[#B87555]">*</span>
                  </label>
                  <select
                    id="traditionalKnowledgeSource"
                    value={traditionalKnowledgeSource}
                    disabled={saved}
                    onChange={(e) => handleTraditionalKnowledgeSourceChange(e.target.value)}
                    className="mt-2 w-full min-h-[48px] rounded-xl border border-[#C5D1BD] bg-white px-3.5 py-2.5 text-base text-[#263D2B]"
                  >
                    <option value="" disabled>Select source...</option>
                    {TRADITIONAL_KNOWLEDGE_SOURCES.map((source) => (
                      <option key={source} value={source}>{source}</option>
                    ))}
                  </select>
                </div>

                {traditionalKnowledgeSource === 'Other' && (
                  <div>
                    <input
                      id="otherTraditionalKnowledgeSource"
                      type="text"
                      value={otherTraditionalKnowledgeSource}
                      disabled={saved}
                      onChange={(e) => setOtherTraditionalKnowledgeSource(e.target.value)}
                      placeholder="Specify other source..."
                      className="w-full min-h-[48px] rounded-xl border border-[#C5D1BD] bg-white px-3.5 py-2.5 text-base text-[#263D2B] placeholder-[#414B32]/40"
                    />
                  </div>
                )}

                <p className="text-xs text-[#414B32]/80 leading-relaxed pt-1">
                  Community consent: Do not record private phone numbers or personal identifying details.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* 7. Notes */}
        <section className="rounded-3xl border border-[#DCD5C5] bg-[#FAF7F0] p-5 sm:p-6 shadow-xl text-[#263D2B]">
          <h2 className="font-heading text-base sm:text-lg font-normal tracking-wider uppercase text-[#263D2B] border-b border-[#DCD5C5] pb-3">
            7. Notes
          </h2>

          <div className="mt-4">
            <label htmlFor="notes" className="block text-xs font-semibold tracking-wider uppercase text-[#414B32]">
              Field Notes (optional)
            </label>
            <textarea
              id="notes"
              value={notes}
              disabled={saved}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Habit, weather, host plant, landmarks..."
              rows={3}
              className="mt-2 w-full rounded-xl border border-[#C5D1BD] bg-white px-4 py-3 text-base text-[#263D2B] placeholder-[#414B32]/40 outline-none focus:border-[#263D2B] focus:ring-1 focus:ring-[#263D2B] disabled:cursor-not-allowed disabled:bg-gray-100"
            />
          </div>
        </section>

        {/* 8. Save Observation Button (MOYA Checkout Style) */}
        <section className="pt-2">
          <Button
            type="button"
            className="min-h-[52px] w-full bg-[#263D2B] text-[#F5F0E4] hover:bg-[#1E3022] border border-[#C5D1BD]/40 font-medium text-base sm:text-lg tracking-wider uppercase shadow-xl rounded-full sm:rounded-2xl active:scale-[0.98] transition-all"
            disabled={saved || isSaving}
            onClick={handleSaveObservation}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin text-[#C5D1BD]" />
                <span>{isEditMode ? 'Updating Record...' : 'Saving Record...'}</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-5 w-5 mr-2 text-[#C5D1BD]" />
                <span>{isEditMode ? 'Save Changes' : 'Save Observation'}</span>
              </>
            )}
          </Button>

          {/* Saved Confirmation Banner */}
          {saved && (
            <div className="mt-4 rounded-3xl border border-[#C5D1BD] bg-[#E8EFE5] p-5 text-center shadow-xl text-[#263D2B]">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#263D2B] text-[#F5F0E4] mb-2">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <p className="text-base font-semibold text-[#263D2B]">
                {isEditMode ? 'Observation updated successfully!' : 'Observation saved to local database!'}
              </p>
              <p className="text-xs text-[#414B32] mt-0.5">
                Stored offline in IndexedDB on this device.
              </p>
              <div className="mt-4 flex gap-2.5">
                {isEditMode ? (
                  <Button
                    type="button"
                    className="flex-1 min-h-[46px] bg-[#263D2B] hover:bg-[#1E3022] text-[#F5F0E4] text-sm font-medium tracking-wider uppercase rounded-xl transition-all shadow-sm"
                    onClick={() => navigate('/observations')}
                  >
                    <span>Back to Records</span>
                  </Button>
                ) : (
                  <Button
                    type="button"
                    className="w-full min-h-[46px] bg-[#263D2B] hover:bg-[#1E3022] text-[#F5F0E4] text-sm font-medium tracking-wider uppercase rounded-xl transition-all shadow-sm"
                    onClick={resetForm}
                  >
                    <RotateCcw className="h-4 w-4 mr-1.5 text-[#C5D1BD]" />
                    <span>+ Record Next Observation</span>
                  </Button>
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default Home