import { useEffect, useState, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  db,
  type Observation,
  type IdentificationStatus,
  type OrganismStatus,
  ORGANISM_STATUSES,
  type LocationVisibility,
  LOCATION_VISIBILITIES,
  type Project,
  type Ward,
  type Survey,
  MICRO_HABITATS,
  LIFE_STAGES,
  TRADITIONAL_KNOWLEDGE_SOURCES,
  type YesNo,
  type LocationSource,
  isValidCoordinate,
  type BasisOfRecord,
  BASIS_OF_RECORD_OPTIONS,
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
  Info,
  ChevronDown,
  Tag as TagIcon,
  Leaf,
  BookOpen,
} from 'lucide-react'
import {
  identifyWardFromCoordinates,
  type WardIdentificationStatus,
} from '@/lib/wardService'
import LocationPickerMap from '@/components/LocationPickerMap'
import TagSelector from '@/components/TagSelector'
import { generateId } from '@/lib/utils'

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
  const [organismStatus, setOrganismStatus] = useState<OrganismStatus | ''>('')
  const [locationVisibility, setLocationVisibility] = useState<LocationVisibility | ''>('')
  const [showVisibilityHelp, setShowVisibilityHelp] = useState(false)
  const [basisOfRecord, setBasisOfRecord] = useState<BasisOfRecord>('HumanObservation')
  const [tags, setTags] = useState<string[]>([])
  const [showTagsSection, setShowTagsSection] = useState(false)
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
  const [gpsLocation, setGpsLocation] = useState<{ latitude: number; longitude: number } | null>(null)
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null)
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null)
  const [locationSource, setLocationSource] = useState<LocationSource | null>(null)
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [showLocationTips, setShowLocationTips] = useState(false)
  const [showEcologyTips, setShowEcologyTips] = useState(false)
  const [showTkTips, setShowTkTips] = useState(false)

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
  const [showPhotoTips, setShowPhotoTips] = useState(false)

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
        setOrganismStatus(existing.organismStatus || '')
        setLocationVisibility(existing.locationVisibility || '')
        setBasisOfRecord(existing.basis_of_record || 'HumanObservation')
        setTags(existing.tags || [])
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
          if (
            existing.gps_latitude !== null &&
            existing.gps_latitude !== undefined &&
            existing.gps_longitude !== null &&
            existing.gps_longitude !== undefined
          ) {
            setGpsLocation({ latitude: existing.gps_latitude, longitude: existing.gps_longitude })
          } else {
            setGpsLocation(null)
          }
          setLocationAccuracy(existing.accuracyMeters ?? null)
          setLocationSource(
            existing.location_source ||
              (existing.gps_latitude ? 'GPS' : 'Manual Pin Adjustment')
          )
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
        const lat = Number(position.coords.latitude.toFixed(6))
        const lng = Number(position.coords.longitude.toFixed(6))

        // When Get My Location succeeds:
        // 1. Save returned coordinates to gps_latitude and gps_longitude
        setGpsLocation({
          latitude: lat,
          longitude: lng,
        })
        // 2. Initially copy same values into latitude and longitude
        setLocation({
          latitude: lat,
          longitude: lng,
        })
        // 3. Set location_source to GPS
        setLocationSource('GPS')
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
        setWardStatusMessage(`Location permission denied or unavailable (${error.message}). You can select your location manually on the map below.`)
        // If geolocation fails or permission is denied, do not fabricate coordinates
        // or overwrite a previously captured valid GPS reading.
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
    newLocation: { latitude: number; longitude: number },
    source: 'manual' | 'gps' = 'manual'
  ) => {
    // 1. Update final latitude and longitude
    setLocation(newLocation)
    // 2. Preserve original GPS coordinates (gpsLocation) unchanged!
    // 3. Set location_source to GPS or Manual Pin Adjustment
    if (source === 'gps') {
      setLocationSource('GPS')
    } else {
      setLocationSource('Manual Pin Adjustment')
      // Clear GPS accuracy radius since manual pin positioning has no device-measured error radius
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

  // Reset form inputs and locks back to an empty initial state
  const resetForm = () => {
    setSpeciesName('')
    setLocalName('')
    setSpeciesGroup('')
    setOtherSpeciesGroup('')
    setScientificName('')
    setIdentificationStatus('')
    setOrganismStatus('')
    setLocationVisibility('')
    setShowVisibilityHelp(false)
    setBasisOfRecord('HumanObservation')
    setTags([])
    setShowTagsSection(false)
    setNotes('')
    setIndividualCount(1)
    setLifeStage('')
    setMicroHabitat('')
    setOtherMicroHabitat('')
    setHasTraditionalKnowledge('')
    setTraditionalKnowledgeSource('')
    setOtherTraditionalKnowledgeSource('')
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

    // Validate geolocation coordinates capture and coordinate bounds (-90..90, -180..180)
    if (!location || !isValidCoordinate(location.latitude, location.longitude)) {
      alert('Please provide valid location coordinates (latitude between -90 and 90, longitude between -180 and 180) before saving.')
      return
    }

    if (gpsLocation && !isValidCoordinate(gpsLocation.latitude, gpsLocation.longitude)) {
      alert('Captured raw GPS coordinates are outside valid geographic bounds.')
      return
    }

    // Validate Basis of Record (Darwin Core required field)
    const validBasis = BASIS_OF_RECORD_OPTIONS.some((opt) => opt.value === basisOfRecord)
    if (!basisOfRecord || !validBasis) {
      alert('Please select a valid Basis of Record.')
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
          organismStatus: organismStatus || undefined,
          locationVisibility: locationVisibility || undefined,
          basis_of_record: basisOfRecord,
          tags: tags.length > 0 ? tags : undefined,
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
          gps_latitude: gpsLocation ? gpsLocation.latitude : null,
          gps_longitude: gpsLocation ? gpsLocation.longitude : null,
          location_source: locationSource || 'Manual Pin Adjustment',
          accuracyMeters: locationSource === 'GPS' && locationAccuracy !== null ? locationAccuracy : null,
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
          id: generateId(),
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
          organismStatus: organismStatus || undefined,
          locationVisibility: locationVisibility || undefined,
          basis_of_record: basisOfRecord,
          tags: tags.length > 0 ? tags : undefined,
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
          gps_latitude: gpsLocation ? gpsLocation.latitude : null,
          gps_longitude: gpsLocation ? gpsLocation.longitude : null,
          location_source: locationSource || 'Manual Pin Adjustment',
          accuracyMeters: locationSource === 'GPS' && locationAccuracy !== null ? locationAccuracy : null,
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
      <div className="mx-auto max-w-lg px-4 py-16 text-center text-slate-500">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#165B33]" />
        <p className="mt-3 text-sm">Loading observation record...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-5 sm:px-6">
      {/* Header Context */}
      {surveyId ? (
        <div className="mb-6">
          <nav className="mb-2.5 flex items-center gap-1.5 text-xs tracking-wider uppercase text-[#7B9586]">
            <Link
              to={`/projects/${projectId}/wards/${wardId}/surveys`}
              className="inline-flex items-center gap-1 text-[#A6F16A] font-medium hover:underline"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Field Visits</span>
            </Link>
            <span>/</span>
            <span className="font-semibold text-[#F0F5EF]">Log Observation</span>
          </nav>

          <div className="rounded-3xl border border-[#1C4D3C] bg-[#0D2D22] p-4 sm:p-5 shadow-xl shadow-[#061812]/50 text-[#F0F5EF]">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-[#133D2F] border border-[#1C4D3C] px-3 py-0.5 text-xs font-semibold tracking-wider uppercase text-[#A6F16A]">
                Ward {activeWard?.wardNumber}
              </span>
              <span className="text-xs text-[#B2C8BA] font-medium">
                {activeSurvey?.leadObserver ? `Lead: ${activeSurvey.leadObserver}` : 'Survey Session'}
              </span>
            </div>
            <p className="mt-1.5 text-lg font-bold text-white tracking-tight">
              {activeWard?.wardName || 'Ward'}
              {activeProject?.name ? ` • ${activeProject.name}` : ''}
            </p>
          </div>
        </div>
      ) : (
        <div className="mb-6 flex items-center justify-between border-b border-[#1C4D3C] pb-4">
          <div>
            <h1 className="text-2xl sm:text-[28px] font-extrabold tracking-tight text-white">
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
              className="inline-flex items-center gap-1.5 rounded-full border border-[#1C4D3C] bg-[#0D2D22] px-3.5 py-1.5 text-xs font-medium tracking-wider uppercase text-[#B2C8BA] hover:text-white hover:border-[#A6F16A]/50 transition-colors shadow-xs"
            >
              <X className="h-3.5 w-3.5" />
              <span>Cancel</span>
            </button>
          )}
        </div>
      )}

      {/* Observation Form Container — Dark Forest-Green Cards */}
      <div className="space-y-5">
        {/* Photographs */}
        <section className="rounded-3xl border border-[#1C4D3C] bg-[#0D2D22] p-5 sm:p-6 shadow-xl shadow-[#061812]/50 text-[#F0F5EF]">
          <div className="flex items-center justify-between border-b border-[#1C4D3C] pb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white">
                Photographs {isUnknown && <span className="text-red-500 font-bold text-base">*</span>}
              </h2>
              <button
                type="button"
                onClick={() => setShowPhotoTips(true)}
                className="flex h-5 w-5 sm:h-5.5 sm:w-5.5 items-center justify-center rounded-full bg-[#061812] border border-[#1C4D3C] text-[#A6F16A] hover:bg-[#133D2F] hover:border-[#A6F16A]/60 hover:text-white transition-colors cursor-pointer"
                aria-label="Tips for Great Field Photos"
                title="Tips for Great Field Photos"
              >
                <Info className="h-3 w-3" />
              </button>
            </div>
            {photos.length > 0 && (
              <span className="rounded-full bg-[#133D2F] border border-[#1C4D3C] px-2.5 py-0.5 text-[11px] font-semibold text-[#A6F16A]">
                {photos.length} {photos.length === 1 ? 'photo' : 'photos'}
              </span>
            )}
          </div>

          {/* Camera and Gallery Buttons */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <label
              htmlFor={saved ? undefined : 'camera-photo-input'}
              className={`flex min-h-[48px] items-center justify-center gap-2 rounded-2xl border border-dashed border-[#1C4D3C] p-3 text-center text-sm font-medium transition ${
                saved
                  ? 'cursor-not-allowed bg-[#061812]/50 text-[#7B9586]'
                  : 'cursor-pointer bg-[#061812] text-[#A6F16A] hover:bg-[#133D2F] hover:border-[#A6F16A]/50 active:scale-98 shadow-sm'
              }`}
            >
              <Camera className="h-4.5 w-4.5 shrink-0 text-[#A6F16A]" />
              <span>Take Photo</span>
            </label>

            <label
              htmlFor={saved ? undefined : 'gallery-photo-input'}
              className={`flex min-h-[48px] items-center justify-center gap-2 rounded-2xl border border-dashed border-[#1C4D3C] p-3 text-center text-sm font-medium transition ${
                saved
                  ? 'cursor-not-allowed bg-[#061812]/50 text-[#7B9586]'
                  : 'cursor-pointer bg-[#061812] text-[#20D6A0] hover:bg-[#133D2F] hover:border-[#20D6A0]/50 active:scale-98 shadow-sm'
              }`}
            >
              <ImageIcon className="h-4.5 w-4.5 shrink-0 text-[#20D6A0]" />
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
                <div key={idx} className="relative aspect-square overflow-hidden rounded-2xl border border-[#1C4D3C] bg-[#061812]">
                  <img
                    src={url}
                    alt={`Preview ${idx + 1}`}
                    className="h-full w-full object-cover"
                  />
                  {!saved && (
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(idx)}
                      className="absolute top-1.5 right-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-red-600/90 text-white shadow-md hover:bg-red-700 active:scale-95"
                      aria-label="Remove photo"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Tips for Great Field Photos Modal */}
          {showPhotoTips && (
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="photo-tips-title"
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150"
              onClick={() => setShowPhotoTips(false)}
            >
              <div
                className="relative w-full max-w-md rounded-3xl border border-[#1C4D3C] bg-[#0D2D22] p-5 sm:p-6 shadow-2xl shadow-black/80 text-[#F0F5EF]"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between border-b border-[#1C4D3C] pb-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#061812] border border-[#1C4D3C] text-[#A6F16A]">
                      <Camera className="h-4.5 w-4.5" />
                    </div>
                    <h3 id="photo-tips-title" className="text-base sm:text-lg font-bold text-white">
                      Tips for Great Field Photos
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPhotoTips(false)}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-[#B2C8BA] hover:text-white hover:bg-[#133D2F] transition-colors"
                    aria-label="Close photo tips"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Modal Body / Guidelines */}
                <div className="mt-4 space-y-3 text-xs sm:text-sm">
                  <div className="flex items-start gap-3 rounded-2xl bg-[#061812] border border-[#1C4D3C] p-3.5">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#133D2F] text-[#A6F16A] text-xs font-bold border border-[#1C4D3C]">
                      1
                    </span>
                    <div>
                      <h4 className="font-bold text-white text-sm">Get Close & Clear</h4>
                      <p className="mt-0.5 text-xs text-[#B2C8BA] leading-relaxed">
                        Take sharp, in-focus photos of the organism without standing too far away.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-2xl bg-[#061812] border border-[#1C4D3C] p-3.5">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#133D2F] text-[#A6F16A] text-xs font-bold border border-[#1C4D3C]">
                      2
                    </span>
                    <div>
                      <h4 className="font-bold text-white text-sm">Show Key Parts</h4>
                      <p className="mt-0.5 text-xs text-[#B2C8BA] leading-relaxed">
                        Capture multiple angles or important features (like flowers, leaves, feathers, or patterns).
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-2xl bg-[#061812] border border-[#1C4D3C] p-3.5">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#133D2F] text-[#A6F16A] text-xs font-bold border border-[#1C4D3C]">
                      3
                    </span>
                    <div>
                      <h4 className="font-bold text-white text-sm">Good Lighting</h4>
                      <p className="mt-0.5 text-xs text-[#B2C8BA] leading-relaxed">
                        Ensure natural daylight illuminates the subject clearly; avoid dark silhouettes or heavy shadows.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-2xl bg-[#061812] border border-[#1C4D3C] p-3.5">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#133D2F] text-[#A6F16A] text-xs font-bold border border-[#1C4D3C]">
                      4
                    </span>
                    <div>
                      <h4 className="font-bold text-white text-sm">Clear Background</h4>
                      <p className="mt-0.5 text-xs text-[#B2C8BA] leading-relaxed">
                        Keep the focus on the subject and avoid blurry or cluttered shots.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Modal Footer / Dismiss Action */}
                <div className="mt-5">
                  <Button
                    type="button"
                    onClick={() => setShowPhotoTips(false)}
                    className="w-full min-h-[46px] bg-gradient-to-r from-[#A6F16A] to-[#20D6A0] text-[#061812] hover:opacity-95 font-bold text-sm tracking-wide rounded-2xl active:scale-98 transition-all shadow-md"
                  >
                    Got It
                  </Button>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Location & Administrative Ward (Interactive Map & GPS) */}
        <section className="rounded-3xl border border-[#1C4D3C] bg-[#0D2D22] p-5 sm:p-6 shadow-xl shadow-[#061812]/50 text-[#F0F5EF]">
          <div className="flex items-center justify-between border-b border-[#1C4D3C] pb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white">
                Location & Ward <span className="text-red-500 font-bold text-base">*</span>
              </h2>
              <button
                type="button"
                onClick={() => setShowLocationTips(true)}
                className="flex h-5 w-5 sm:h-5.5 sm:w-5.5 items-center justify-center rounded-full bg-[#061812] border border-[#1C4D3C] text-[#A6F16A] hover:bg-[#133D2F] hover:border-[#A6F16A]/60 hover:text-white transition-colors cursor-pointer"
                aria-label="Tips for Accurate Location"
                title="Tips for Accurate Location"
              >
                <Info className="h-3 w-3" />
              </button>
            </div>
            {location && (
              <div className="flex items-center gap-1.5 flex-wrap">
                {locationSource === 'Manual Pin Adjustment' ? (
                  <span className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold border bg-amber-950/60 text-amber-300 border-amber-800/60">
                    Manual Pin Adjustment
                  </span>
                ) : locationSource === 'GPS' ? (
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${
                      locationAccuracy !== null && locationAccuracy <= 10
                        ? 'bg-[#133D2F] text-[#A6F16A] border-[#1C4D3C]'
                        : 'bg-amber-950/60 text-amber-300 border-amber-800/60'
                    }`}
                  >
                    GPS Fix {locationAccuracy !== null ? `(±${Math.round(locationAccuracy)}m)` : ''}
                  </span>
                ) : null}
              </div>
            )}
          </div>

          {/* GPS Acquire / Retry Button (Get My Location) */}
          <div className="mt-4 flex gap-2">
            <Button
              type="button"
              className="min-h-[50px] flex-1 bg-gradient-to-r from-[#A6F16A] to-[#20D6A0] text-[#061812] hover:opacity-95 font-bold text-base shadow-lg shadow-[#20D6A0]/20 rounded-2xl transition-all active:scale-98 tracking-wide"
              disabled={saved || isGettingLocation}
              onClick={getLocation}
            >
              {isGettingLocation ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin text-[#061812]" />
                  <span>Acquiring Coordinates...</span>
                </>
              ) : location ? (
                <>
                  <MapPin className="h-5 w-5 mr-2 text-[#061812]" />
                  <span>Get My Location</span>
                </>
              ) : locationError ? (
                <>
                  <RotateCcw className="h-5 w-5 mr-2 text-[#061812]" />
                  <span>Retry Get My Location</span>
                </>
              ) : (
                <>
                  <MapPin className="h-5 w-5 mr-2 text-[#061812]" />
                  <span>Get My Location</span>
                </>
              )}
            </Button>
          </div>

          {/* Interactive OpenStreetMap */}
          <LocationPickerMap
            location={location}
            rawGPS={gpsLocation}
            onLocationChange={handleManualLocationChange}
            disabled={saved}
          />

          {/* Coordinates and Time Readout */}
          <div className="mt-3 rounded-2xl bg-[#061812] px-4 py-3 border border-[#1C4D3C] text-sm space-y-2 text-[#F0F5EF]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 font-mono text-sm sm:text-base font-medium text-[#A6F16A]">
                <MapPin className="h-4 w-4 text-[#20D6A0] shrink-0" />
                <span>
                  {location
                    ? `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`
                    : 'Coordinates not selected yet'}
                </span>
                {locationSource && (
                  <span className="ml-1 text-[11px] font-sans font-semibold text-[#B2C8BA] bg-[#133D2F] px-2 py-0.5 rounded-full border border-[#1C4D3C]">
                    {locationSource}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#7B9586]">
                <Clock className="h-3.5 w-3.5 text-[#7B9586]" />
                <span>{displayObservationTime}</span>
              </div>
            </div>

            {/* Audit display: Raw GPS coordinates preserved when adjusted */}
            {gpsLocation && (
              <div className="pt-2 border-t border-[#1C4D3C] flex flex-wrap items-center justify-between gap-2 text-xs text-[#B2C8BA]">
                <div className="flex items-center gap-1.5 font-mono">
                  <Compass className="h-3.5 w-3.5 text-[#20D6A0] shrink-0" />
                  <span>
                    Raw GPS: {gpsLocation.latitude.toFixed(5)}, {gpsLocation.longitude.toFixed(5)}
                  </span>
                  {locationAccuracy !== null && (
                    <span className="text-[11px] text-[#7B9586]">
                      (±{Math.round(locationAccuracy)}m sensor accuracy)
                    </span>
                  )}
                </div>
                {locationSource === 'Manual Pin Adjustment' && (
                  <span className="text-[11px] text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-800/60">
                    Original GPS preserved • Final adjusted on map
                  </span>
                )}
              </div>
            )}

            {locationSource === 'Manual Pin Adjustment' && !gpsLocation && (
              <div className="pt-2 border-t border-[#1C4D3C] text-xs text-[#7B9586]">
                <span>📍 Manual pin placement without GPS acquisition. Raw GPS fields are null.</span>
              </div>
            )}
          </div>

          {/* Dedicated Read-Only Administrative Ward Information Field */}
          <div className="mt-4 pt-4 border-t border-[#1C4D3C]">
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold tracking-wider uppercase text-[#B2C8BA]">
                Administrative Ward
              </label>
              <span className="rounded-full bg-[#133D2F] border border-[#1C4D3C] px-2 py-0.5 text-[10px] font-semibold text-[#A6F16A] uppercase tracking-wider">
                Automatic GPS • Read-Only
              </span>
            </div>

            {/* Read-only Ward container supporting all 7 states */}
            <div
              className={`rounded-2xl border p-4 transition-all ${
                wardStatus === 'ward_identified'
                  ? 'border-[#A6F16A]/50 bg-[#133D2F] text-white'
                  : wardStatus === 'identifying_ward' || wardStatus === 'requesting_location'
                  ? 'border-[#1C4D3C] bg-[#061812] text-[#F0F5EF]'
                  : wardStatus === 'location_unavailable'
                  ? 'border-red-800/80 bg-red-950/40 text-red-200'
                  : 'border-[#1C4D3C] bg-[#061812] text-[#B2C8BA]'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 shrink-0">
                  {wardStatus === 'ward_identified' ? (
                    <CheckCircle2 className="h-5 w-5 text-[#A6F16A]" />
                  ) : wardStatus === 'identifying_ward' || wardStatus === 'requesting_location' ? (
                    <Loader2 className="h-5 w-5 animate-spin text-[#A6F16A]" />
                  ) : wardStatus === 'location_unavailable' ? (
                    <AlertCircle className="h-5 w-5 text-red-400" />
                  ) : (
                    <Compass className="h-5 w-5 text-[#7B9586]" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-base font-bold text-white">
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
                      <span className="rounded bg-[#061812] border border-[#1C4D3C] px-1.5 py-0.5 font-mono text-[10px] text-[#A6F16A]">
                        ID: {autoWardId}
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-xs leading-relaxed text-[#B2C8BA]">
                    {wardStatusMessage}
                  </p>

                  {/* Quick retry action if location permission failed outdoors */}
                  {wardStatus === 'location_unavailable' && (
                    <button
                      type="button"
                      onClick={getLocation}
                      disabled={isGettingLocation}
                      className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-red-300 hover:underline"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      <span>Retry acquiring GPS</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tips for Accurate Location Modal */}
          {showLocationTips && (
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="location-tips-title"
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150"
              onClick={() => setShowLocationTips(false)}
            >
              <div
                className="relative w-full max-w-md rounded-3xl border border-[#1C4D3C] bg-[#0D2D22] p-5 sm:p-6 shadow-2xl shadow-black/80 text-[#F0F5EF]"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between border-b border-[#1C4D3C] pb-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#061812] border border-[#1C4D3C] text-[#A6F16A]">
                      <MapPin className="h-4.5 w-4.5" />
                    </div>
                    <h3 id="location-tips-title" className="text-base sm:text-lg font-bold text-white">
                      Tips for Accurate Location
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowLocationTips(false)}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-[#B2C8BA] hover:text-white hover:bg-[#133D2F] transition-colors"
                    aria-label="Close location tips"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Modal Body / Guidelines */}
                <div className="mt-4 space-y-3 text-xs sm:text-sm">
                  <div className="flex items-start gap-3 rounded-2xl bg-[#061812] border border-[#1C4D3C] p-3.5">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#133D2F] text-[#A6F16A] text-xs font-bold border border-[#1C4D3C]">
                      1
                    </span>
                    <div>
                      <h4 className="font-bold text-white text-sm">Use GPS for Precision</h4>
                      <p className="mt-0.5 text-xs text-[#B2C8BA] leading-relaxed">
                        Tap &ldquo;Get My Location&rdquo; when standing right at the observation spot for accurate coordinates.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-2xl bg-[#061812] border border-[#1C4D3C] p-3.5">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#133D2F] text-[#A6F16A] text-xs font-bold border border-[#1C4D3C]">
                      2
                    </span>
                    <div>
                      <h4 className="font-bold text-white text-sm">Fine-Tune on Map</h4>
                      <p className="mt-0.5 text-xs text-[#B2C8BA] leading-relaxed">
                        If you are logging later or the GPS marker is slightly off, tap anywhere on the map or drag the pin directly to the correct spot.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-2xl bg-[#061812] border border-[#1C4D3C] p-3.5">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#133D2F] text-[#A6F16A] text-xs font-bold border border-[#1C4D3C]">
                      3
                    </span>
                    <div>
                      <h4 className="font-bold text-white text-sm">Automatic Ward Lookup</h4>
                      <p className="mt-0.5 text-xs text-[#B2C8BA] leading-relaxed">
                        Once your location pin is set, the system will automatically match and identify your administrative ward.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Modal Footer / Dismiss Action */}
                <div className="mt-5">
                  <Button
                    type="button"
                    onClick={() => setShowLocationTips(false)}
                    className="w-full min-h-[46px] bg-gradient-to-r from-[#A6F16A] to-[#20D6A0] text-[#061812] hover:opacity-95 font-bold text-sm tracking-wide rounded-2xl active:scale-98 transition-all shadow-md"
                  >
                    Got It
                  </Button>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Identification Status */}
        <section className="rounded-3xl border border-[#1C4D3C] bg-[#0D2D22] p-5 sm:p-6 shadow-xl shadow-[#061812]/50 text-[#F0F5EF]">
          <h2 className="text-base sm:text-lg font-bold text-white border-b border-[#1C4D3C] pb-3">
            Identification Status <span className="text-red-500 font-bold text-base">*</span>
          </h2>

          <div className="mt-4">
            <label htmlFor="identificationStatus" className="block text-xs font-semibold tracking-wider uppercase text-[#B2C8BA]">
              Select Status
            </label>
            <select
              id="identificationStatus"
              value={identificationStatus}
              disabled={saved}
              onChange={(e) => handleStatusChange(e.target.value as IdentificationStatus | '')}
              className={`mt-2 w-full min-h-[48px] rounded-xl border border-[#1C4D3C] bg-[#061812] px-4 py-3 text-base font-medium outline-none focus:border-[#A6F16A] focus:ring-1 focus:ring-[#A6F16A] disabled:cursor-not-allowed disabled:opacity-50 ${
                !identificationStatus ? 'text-[#7B9586]' : 'text-[#F0F5EF]'
              }`}
            >
              <option value="" disabled className="text-gray-500">Select status...</option>
              <option value="Identified">Identified</option>
              <option value="Unknown">Unknown</option>
              <option value="Needs verification">Needs verification</option>
            </select>
          </div>
        </section>

        {/* Species Details */}
        <section className="rounded-3xl border border-[#1C4D3C] bg-[#0D2D22] p-5 sm:p-6 shadow-xl shadow-[#061812]/50 text-[#F0F5EF]">
          <h2 className="text-base sm:text-lg font-bold text-white border-b border-[#1C4D3C] pb-3">
            Species Details
          </h2>

          {/* Common Name */}
          <div className="mt-4">
            <label htmlFor="speciesName" className="block text-xs font-semibold tracking-wider uppercase text-[#B2C8BA]">
              Common Name {!isUnknown && <span className="text-red-500 font-bold">*</span>}
            </label>
            <input
              id="speciesName"
              type="text"
              value={speciesName}
              disabled={saved || isUnknown}
              onChange={(e) => setSpeciesName(e.target.value)}
              placeholder={isUnknown ? 'Locked for Unknown species' : 'e.g. Indian Peafowl, Cinnamon Tree'}
              className="mt-2 w-full min-h-[48px] rounded-xl border border-[#1C4D3C] bg-[#061812] px-4 py-3 text-base text-[#F0F5EF] placeholder-[#7B9586] outline-none focus:border-[#A6F16A] focus:ring-1 focus:ring-[#A6F16A] disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {/* Local Name */}
          <div className="mt-4">
            <label htmlFor="localName" className="block text-xs font-semibold tracking-wider uppercase text-[#B2C8BA]">
              Local Name
            </label>
            <input
              id="localName"
              type="text"
              value={localName}
              disabled={saved || isUnknown}
              onChange={(e) => setLocalName(e.target.value)}
              placeholder={isUnknown ? 'Locked for Unknown species' : 'e.g., Naattu Mayil, Thulasi'}
              className="mt-2 w-full min-h-[48px] rounded-xl border border-[#1C4D3C] bg-[#061812] px-4 py-3 text-base text-[#F0F5EF] placeholder-[#7B9586] outline-none focus:border-[#A6F16A] focus:ring-1 focus:ring-[#A6F16A] disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {/* Scientific Name */}
          <div className="mt-4">
            <label htmlFor="scientificName" className="block text-xs font-semibold tracking-wider uppercase text-[#B2C8BA]">
              Scientific Name
            </label>
            <input
              id="scientificName"
              type="text"
              value={scientificName}
              disabled={saved || isUnknown}
              onChange={(e) => setScientificName(e.target.value)}
              placeholder="e.g. Pavo cristatus"
              className="mt-2 w-full min-h-[48px] rounded-xl border border-[#1C4D3C] bg-[#061812] px-4 py-3 text-base italic text-[#F0F5EF] placeholder-[#7B9586] outline-none focus:border-[#A6F16A] focus:ring-1 focus:ring-[#A6F16A] disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {/* Species Group */}
          <div className="mt-4">
            <label htmlFor="speciesGroup" className="block text-xs font-semibold tracking-wider uppercase text-[#B2C8BA]">
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
              className={`mt-2 w-full min-h-[48px] rounded-xl border border-[#1C4D3C] bg-[#061812] px-4 py-3 text-base outline-none focus:border-[#A6F16A] focus:ring-1 focus:ring-[#A6F16A] disabled:cursor-not-allowed disabled:opacity-50 ${
                !speciesGroup ? 'text-[#7B9586]' : 'text-[#F0F5EF]'
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
                  className="w-full min-h-[48px] rounded-xl border border-[#1C4D3C] bg-[#061812] px-4 py-3 text-base text-[#F0F5EF] placeholder-[#7B9586] outline-none focus:border-[#A6F16A] focus:ring-1 focus:ring-[#A6F16A]"
                />
              </div>
            )}
          </div>

          {/* Basis of Record (Darwin Core standard evidence nature) */}
          <div className="mt-4 pt-4 border-t border-[#1C4D3C]">
            <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
              <label htmlFor="basisOfRecord" className="block text-xs font-semibold tracking-wider uppercase text-[#B2C8BA]">
                Basis of Record <span className="text-red-500 font-bold">*</span>
              </label>
              <span className="rounded-full bg-[#133D2F] border border-[#1C4D3C] px-2 py-0.5 text-[10px] font-semibold text-[#A6F16A] uppercase tracking-wider">
                Darwin Core Standard
              </span>
            </div>
            <select
              id="basisOfRecord"
              value={basisOfRecord}
              disabled={saved}
              onChange={(e) => setBasisOfRecord(e.target.value as BasisOfRecord)}
              className="mt-1 w-full min-h-[48px] rounded-xl border border-[#1C4D3C] bg-[#061812] px-4 py-3 text-base font-medium outline-none focus:border-[#A6F16A] focus:ring-1 focus:ring-[#A6F16A] disabled:cursor-not-allowed disabled:opacity-50 text-[#F0F5EF]"
            >
              {BASIS_OF_RECORD_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </section>

        {/* Ecological Details */}
        <section className="rounded-3xl border border-[#1C4D3C] bg-[#0D2D22] p-5 sm:p-6 shadow-xl shadow-[#061812]/50 text-[#F0F5EF]">
          <div className="flex items-center justify-between border-b border-[#1C4D3C] pb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white">
                Ecological Details
              </h2>
              <button
                type="button"
                onClick={() => setShowEcologyTips(true)}
                className="flex h-5 w-5 sm:h-5.5 sm:w-5.5 items-center justify-center rounded-full bg-[#061812] border border-[#1C4D3C] text-[#A6F16A] hover:bg-[#133D2F] hover:border-[#A6F16A]/60 hover:text-white transition-colors cursor-pointer"
                aria-label="Tips for Ecological Details"
                title="Tips for Ecological Details"
              >
                <Info className="h-3 w-3" />
              </button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3.5">
            <div>
              <label htmlFor="individualCount" className="block text-xs font-semibold tracking-wider uppercase text-[#B2C8BA]">
                Count <span className="text-red-500 font-bold">*</span>
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
                className="mt-2 w-full min-h-[48px] rounded-xl border border-[#1C4D3C] bg-[#061812] px-4 py-3 text-base font-semibold text-[#F0F5EF] outline-none focus:border-[#A6F16A] focus:ring-1 focus:ring-[#A6F16A]"
              />
            </div>

            <div>
              <label htmlFor="lifeStage" className="block text-xs font-semibold tracking-wider uppercase text-[#B2C8BA]">
                Life Stage
              </label>
              <select
                id="lifeStage"
                value={lifeStage}
                disabled={saved}
                onChange={(e) => setLifeStage(e.target.value)}
                className={`mt-2 w-full min-h-[48px] rounded-xl border border-[#1C4D3C] bg-[#061812] px-4 py-3 text-base outline-none focus:border-[#A6F16A] focus:ring-1 focus:ring-[#A6F16A] ${
                  !lifeStage ? 'text-[#7B9586]' : 'text-[#F0F5EF]'
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
            <label htmlFor="microHabitat" className="block text-xs font-semibold tracking-wider uppercase text-[#B2C8BA]">
              Micro-habitat / Substrate
            </label>
            <select
              id="microHabitat"
              value={microHabitat}
              disabled={saved}
              onChange={(e) => handleMicroHabitatChange(e.target.value)}
              className={`mt-2 w-full min-h-[48px] rounded-xl border border-[#1C4D3C] bg-[#061812] px-4 py-3 text-base outline-none focus:border-[#A6F16A] focus:ring-1 focus:ring-[#A6F16A] ${
                !microHabitat ? 'text-[#7B9586]' : 'text-[#F0F5EF]'
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
                  className="w-full min-h-[48px] rounded-xl border border-[#1C4D3C] bg-[#061812] px-4 py-3 text-base text-[#F0F5EF] placeholder-[#7B9586] outline-none focus:border-[#A6F16A] focus:ring-1 focus:ring-[#A6F16A]"
                />
              </div>
            )}
          </div>

          {/* Organism Status */}
          <div className="mt-4">
            <label htmlFor="organismStatus" className="block text-xs font-semibold tracking-wider uppercase text-[#B2C8BA]">
              Organism Status
            </label>
            <select
              id="organismStatus"
              value={organismStatus}
              disabled={saved}
              onChange={(e) => setOrganismStatus(e.target.value as OrganismStatus | '')}
              className={`mt-2 w-full min-h-[48px] rounded-xl border border-[#1C4D3C] bg-[#061812] px-4 py-3 text-base outline-none focus:border-[#A6F16A] focus:ring-1 focus:ring-[#A6F16A] disabled:cursor-not-allowed disabled:opacity-50 ${
                !organismStatus ? 'text-[#7B9586]' : 'text-[#F0F5EF]'
              }`}
            >
              <option value="">Select organism status...</option>
              {ORGANISM_STATUSES.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          {/* Tips for Ecological Details Modal */}
          {showEcologyTips && (
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="ecology-tips-title"
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150"
              onClick={() => setShowEcologyTips(false)}
            >
              <div
                className="relative w-full max-w-md rounded-3xl border border-[#1C4D3C] bg-[#0D2D22] p-5 sm:p-6 shadow-2xl shadow-black/80 text-[#F0F5EF]"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between border-b border-[#1C4D3C] pb-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#061812] border border-[#1C4D3C] text-[#A6F16A]">
                      <Leaf className="h-4.5 w-4.5" />
                    </div>
                    <h3 id="ecology-tips-title" className="text-base sm:text-lg font-bold text-white">
                      Tips for Ecological Details
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowEcologyTips(false)}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-[#B2C8BA] hover:text-white hover:bg-[#133D2F] transition-colors"
                    aria-label="Close ecological tips"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Modal Body / Guidelines */}
                <div className="mt-4 space-y-3 text-xs sm:text-sm">
                  <div className="flex items-start gap-3 rounded-2xl bg-[#061812] border border-[#1C4D3C] p-3.5">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#133D2F] text-[#A6F16A] text-xs font-bold border border-[#1C4D3C]">
                      1
                    </span>
                    <div>
                      <h4 className="font-bold text-white text-sm">Accurate Count</h4>
                      <p className="mt-0.5 text-xs text-[#B2C8BA] leading-relaxed">
                        Enter the exact number of individuals observed, or a reasonable estimate for large groups.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-2xl bg-[#061812] border border-[#1C4D3C] p-3.5">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#133D2F] text-[#A6F16A] text-xs font-bold border border-[#1C4D3C]">
                      2
                    </span>
                    <div>
                      <h4 className="font-bold text-white text-sm">Life Stage</h4>
                      <p className="mt-0.5 text-xs text-[#B2C8BA] leading-relaxed">
                        Select the developmental stage (e.g., Adult, Juvenile, Flowering, Fruiting) to track population cycles.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-2xl bg-[#061812] border border-[#1C4D3C] p-3.5">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#133D2F] text-[#A6F16A] text-xs font-bold border border-[#1C4D3C]">
                      3
                    </span>
                    <div>
                      <h4 className="font-bold text-white text-sm">Micro-Habitat</h4>
                      <p className="mt-0.5 text-xs text-[#B2C8BA] leading-relaxed">
                        Specify the exact micro-habitat or substrate where the organism was found (e.g., Tree Canopy, Ground, Leaf Undersurface).
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-2xl bg-[#061812] border border-[#1C4D3C] p-3.5">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#133D2F] text-[#A6F16A] text-xs font-bold border border-[#1C4D3C]">
                      4
                    </span>
                    <div>
                      <h4 className="font-bold text-white text-sm">Organism Status</h4>
                      <p className="mt-0.5 text-xs text-[#B2C8BA] leading-relaxed">
                        Note whether the individual is Wild, Captive, or Cultivated.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Modal Footer / Dismiss Action */}
                <div className="mt-5">
                  <Button
                    type="button"
                    onClick={() => setShowEcologyTips(false)}
                    className="w-full min-h-[46px] bg-gradient-to-r from-[#A6F16A] to-[#20D6A0] text-[#061812] hover:opacity-95 font-bold text-sm tracking-wide rounded-2xl active:scale-98 transition-all shadow-md"
                  >
                    Got It
                  </Button>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Traditional Knowledge */}
        <section className="rounded-3xl border border-[#1C4D3C] bg-[#0D2D22] p-5 sm:p-6 shadow-xl shadow-[#061812]/50 text-[#F0F5EF]">
          <div className="flex items-center justify-between border-b border-[#1C4D3C] pb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white">
                Traditional Knowledge
              </h2>
              <button
                type="button"
                onClick={() => setShowTkTips(true)}
                className="flex h-5 w-5 sm:h-5.5 sm:w-5.5 items-center justify-center rounded-full bg-[#061812] border border-[#1C4D3C] text-[#A6F16A] hover:bg-[#133D2F] hover:border-[#A6F16A]/60 hover:text-white transition-colors cursor-pointer"
                aria-label="What is Traditional Knowledge?"
                title="What is Traditional Knowledge?"
              >
                <Info className="h-3 w-3" />
              </button>
            </div>
          </div>

          <div className="mt-4">
            <label htmlFor="hasTraditionalKnowledge" className="block text-xs font-semibold tracking-wider uppercase text-[#B2C8BA]">
              Is traditional knowledge associated?
            </label>
            <select
              id="hasTraditionalKnowledge"
              value={hasTraditionalKnowledge}
              disabled={saved}
              onChange={(e) => handleTraditionalKnowledgeChange(e.target.value as YesNo | '')}
              className={`mt-2 w-full min-h-[48px] rounded-xl border border-[#1C4D3C] bg-[#061812] px-4 py-3 text-base outline-none focus:border-[#A6F16A] focus:ring-1 focus:ring-[#A6F16A] ${
                !hasTraditionalKnowledge ? 'text-[#7B9586]' : 'text-[#F0F5EF]'
              }`}
            >
              <option value="">Select Yes or No...</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>

            {hasTraditionalKnowledge === 'Yes' && (
              <div className="mt-3 space-y-3 rounded-2xl bg-[#061812] border border-[#1C4D3C] p-4 text-base">
                <div>
                  <label htmlFor="traditionalKnowledgeSource" className="block text-xs font-semibold tracking-wider uppercase text-[#B2C8BA]">
                    Source of Knowledge <span className="text-red-500 font-bold">*</span>
                  </label>
                  <select
                    id="traditionalKnowledgeSource"
                    value={traditionalKnowledgeSource}
                    disabled={saved}
                    onChange={(e) => handleTraditionalKnowledgeSourceChange(e.target.value)}
                    className="mt-2 w-full min-h-[48px] rounded-xl border border-[#1C4D3C] bg-[#0D2D22] px-3.5 py-2.5 text-base text-[#F0F5EF]"
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
                      className="w-full min-h-[48px] rounded-xl border border-[#1C4D3C] bg-[#0D2D22] px-3.5 py-2.5 text-base text-[#F0F5EF] placeholder-[#7B9586]"
                    />
                  </div>
                )}

                <p className="text-xs text-[#7B9586] leading-relaxed pt-1">
                  Community consent: Do not record private phone numbers or personal identifying details.
                </p>
              </div>
            )}
          </div>

          {/* What is Traditional Knowledge Modal */}
          {showTkTips && (
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="tk-tips-title"
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150"
              onClick={() => setShowTkTips(false)}
            >
              <div
                className="relative w-full max-w-md rounded-3xl border border-[#1C4D3C] bg-[#0D2D22] p-5 sm:p-6 shadow-2xl shadow-black/80 text-[#F0F5EF]"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between border-b border-[#1C4D3C] pb-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#061812] border border-[#1C4D3C] text-[#A6F16A]">
                      <BookOpen className="h-4.5 w-4.5" />
                    </div>
                    <h3 id="tk-tips-title" className="text-base sm:text-lg font-bold text-white">
                      What is Traditional Knowledge?
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowTkTips(false)}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-[#B2C8BA] hover:text-white hover:bg-[#133D2F] transition-colors"
                    aria-label="Close traditional knowledge information"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Modal Body / Guidelines */}
                <div className="mt-4 space-y-3 text-xs sm:text-sm">
                  <div className="flex items-start gap-3 rounded-2xl bg-[#061812] border border-[#1C4D3C] p-3.5">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#133D2F] text-[#A6F16A] text-xs font-bold border border-[#1C4D3C]">
                      1
                    </span>
                    <div>
                      <h4 className="font-bold text-white text-sm">What it is</h4>
                      <p className="mt-0.5 text-xs text-[#B2C8BA] leading-relaxed">
                        Cumulative ecological wisdom, traditional medicinal uses, and indigenous practices passed down through generations.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-2xl bg-[#061812] border border-[#1C4D3C] p-3.5">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#133D2F] text-[#A6F16A] text-xs font-bold border border-[#1C4D3C]">
                      2
                    </span>
                    <div>
                      <h4 className="font-bold text-white text-sm">Community Consent</h4>
                      <p className="mt-0.5 text-xs text-[#B2C8BA] leading-relaxed">
                        Ensure information from local community members or elders is gathered with their explicit consent.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-2xl bg-[#061812] border border-[#1C4D3C] p-3.5">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#133D2F] text-[#A6F16A] text-xs font-bold border border-[#1C4D3C]">
                      3
                    </span>
                    <div>
                      <h4 className="font-bold text-white text-sm">Privacy & Accuracy</h4>
                      <p className="mt-0.5 text-xs text-[#B2C8BA] leading-relaxed">
                        Do not record personal identifying details (like phone numbers or home addresses), and accurately note the source category (e.g., Elder, PBR record).
                      </p>
                    </div>
                  </div>
                </div>

                {/* Modal Footer / Dismiss Action */}
                <div className="mt-5">
                  <Button
                    type="button"
                    onClick={() => setShowTkTips(false)}
                    className="w-full min-h-[46px] bg-gradient-to-r from-[#A6F16A] to-[#20D6A0] text-[#061812] hover:opacity-95 font-bold text-sm tracking-wide rounded-2xl active:scale-98 transition-all shadow-md"
                  >
                    Got It
                  </Button>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Notes */}
        <section className="rounded-3xl border border-[#1C4D3C] bg-[#0D2D22] p-5 sm:p-6 shadow-xl shadow-[#061812]/50 text-[#F0F5EF]">
          <h2 className="text-base sm:text-lg font-bold text-white border-b border-[#1C4D3C] pb-3">
            Notes
          </h2>

          {/* Field Notes */}
          <div className="mt-4">
            <label htmlFor="notes" className="block text-xs font-semibold tracking-wider uppercase text-[#B2C8BA]">
              Field Notes
            </label>
            <textarea
              id="notes"
              rows={3}
              value={notes}
              disabled={saved}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Habit, weather, host plant, landmarks..."
              className="mt-2 w-full rounded-xl border border-[#1C4D3C] bg-[#061812] px-4 py-3 text-base text-[#F0F5EF] placeholder-[#7B9586] outline-none focus:border-[#A6F16A] focus:ring-1 focus:ring-[#A6F16A] disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </section>

        {/* Classification Tags (Collapsible Accordion) */}
        <section className="rounded-3xl border border-[#1C4D3C] bg-[#0D2D22] p-5 sm:p-6 shadow-xl shadow-[#061812]/50 text-[#F0F5EF]">
          <button
            type="button"
            onClick={() => setShowTagsSection((v) => !v)}
            className="w-full flex items-center justify-between text-left focus:outline-none cursor-pointer"
            aria-expanded={showTagsSection}
          >
            <div className="flex items-center gap-2.5 flex-wrap">
              <TagIcon className="h-5 w-5 text-[#A6F16A]" />
              <h2 className="text-base sm:text-lg font-bold text-white">
                Classification Tags
              </h2>
              {tags.length > 0 && (
                <span className="rounded-full bg-[#133D2F] text-[#A6F16A] border border-[#1C4D3C] px-2.5 py-0.5 text-xs font-semibold">
                  {tags.length} selected
                </span>
              )}
            </div>
            <ChevronDown
              className={`h-5 w-5 text-[#A6F16A] transition-transform duration-200 shrink-0 ${
                showTagsSection ? 'rotate-180' : ''
              }`}
            />
          </button>

          {showTagsSection && (
            <div className="mt-4 pt-3 border-t border-[#1C4D3C]">
              <TagSelector
                selectedTagIds={tags}
                onChange={(newTags) => setTags(newTags)}
                disabled={saved}
              />
            </div>
          )}
        </section>

        {/* Location Visibility */}
        <section className="rounded-3xl border border-[#1C4D3C] bg-[#0D2D22] p-5 sm:p-6 shadow-xl shadow-[#061812]/50 text-[#F0F5EF]">
          <div className="flex items-center justify-between border-b border-[#1C4D3C] pb-3">
            <h2 className="text-base sm:text-lg font-bold text-white">
              Location Visibility
            </h2>
            <button
              type="button"
              onClick={() => setShowVisibilityHelp((v) => !v)}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-[#061812] border border-[#1C4D3C] text-[#A6F16A] hover:bg-[#133D2F] transition-colors"
              aria-label={showVisibilityHelp ? 'Hide location visibility help' : 'Show location visibility help'}
              aria-expanded={showVisibilityHelp}
            >
              <Info className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Collapsible help panel — descriptions for each option live here */}
          {showVisibilityHelp && (
            <div className="mt-3 rounded-2xl bg-[#061812] border border-[#1C4D3C] px-4 py-3 text-xs text-[#B2C8BA] leading-relaxed space-y-2">
              <p className="font-semibold text-white">What does each option mean?</p>
              {LOCATION_VISIBILITIES.map((opt) => (
                <div key={opt.value} className="flex gap-2">
                  <span className="font-semibold text-[#A6F16A] shrink-0">{opt.label}:</span>
                  <span>{opt.description}</span>
                </div>
              ))}
              <p className="font-semibold text-white pt-0.5">Current status</p>
              <p className="text-amber-300">⚠ This app is currently offline-only. No backend or public sharing pathway exists yet. "Obscured" and "Private" settings are stored and displayed faithfully, but coordinate restriction is not yet enforced. Enforcement will require a future server-side access system.</p>
            </div>
          )}

          <div className="mt-4 space-y-2.5" role="radiogroup" aria-label="Location Visibility Options">
            {LOCATION_VISIBILITIES.map((opt) => {
              const isSelected = locationVisibility === opt.value
              return (
                <div
                  key={opt.value}
                  role="radio"
                  aria-checked={isSelected}
                  tabIndex={saved ? -1 : 0}
                  onClick={() => {
                    if (saved) return
                    setLocationVisibility((current) => (current === opt.value ? '' : opt.value))
                  }}
                  onKeyDown={(e) => {
                    if (saved) return
                    if (e.key === ' ' || e.key === 'Enter') {
                      e.preventDefault()
                      setLocationVisibility((current) => (current === opt.value ? '' : opt.value))
                    }
                  }}
                  className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition-all select-none ${
                    saved ? 'cursor-not-allowed opacity-50' : ''
                  } ${
                    isSelected
                      ? 'border-[#A6F16A] bg-[#133D2F] shadow-md shadow-[#061812]/50'
                      : 'border-[#1C4D3C] bg-[#061812] hover:border-[#A6F16A]/40 hover:bg-[#0D2D22]'
                  }`}
                >
                  <span
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-all ${
                      isSelected
                        ? 'border-[#A6F16A] bg-[#A6F16A]'
                        : 'border-[#1C4D3C] bg-[#061812]'
                    }`}
                  >
                    {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-[#061812]" />}
                  </span>
                  <span className={`text-sm font-semibold ${isSelected ? 'text-white' : 'text-[#B2C8BA]'}`}>
                    {opt.label}
                  </span>
                </div>
              )
            })}
          </div>
        </section>

        {/* Save Observation Button (Lime-to-Turquoise Gradient) */}
        <section className="pt-2">
          <Button
            type="button"
            className="min-h-[54px] w-full bg-gradient-to-r from-[#A6F16A] to-[#20D6A0] hover:opacity-95 text-[#061812] font-extrabold text-base sm:text-lg tracking-wider uppercase shadow-xl shadow-[#20D6A0]/25 rounded-2xl active:scale-[0.98] transition-all"
            disabled={saved || isSaving}
            onClick={handleSaveObservation}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin text-[#061812]" />
                <span>{isEditMode ? 'Updating Record...' : 'Saving Record...'}</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-5 w-5 mr-2 text-[#061812]" />
                <span>{isEditMode ? 'Save Changes' : 'Save Observation'}</span>
              </>
            )}
          </Button>

          {/* Saved Confirmation Banner */}
          {saved && (
            <div className="mt-4 rounded-3xl border border-[#1C4D3C] bg-[#0D2D22] p-5 text-center shadow-xl shadow-[#061812] text-[#F0F5EF]">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#133D2F] border border-[#1C4D3C] text-[#A6F16A] mb-2 shadow-xs">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <p className="text-base font-bold text-white">
                {isEditMode ? 'Observation updated successfully!' : 'Observation saved to local database!'}
              </p>
              <p className="text-xs text-[#B2C8BA] mt-0.5">
                Stored offline in IndexedDB on this device.
              </p>
              <div className="mt-4 flex gap-2.5">
                {isEditMode ? (
                  <Button
                    type="button"
                    className="flex-1 min-h-[46px] bg-gradient-to-r from-[#A6F16A] to-[#20D6A0] text-[#061812] hover:opacity-95 text-sm font-bold tracking-wider uppercase rounded-xl transition-all shadow-xs"
                    onClick={() => navigate('/observations')}
                  >
                    <span>Back to Records</span>
                  </Button>
                ) : (
                  <Button
                    type="button"
                    className="w-full min-h-[46px] bg-gradient-to-r from-[#A6F16A] to-[#20D6A0] text-[#061812] hover:opacity-95 text-sm font-bold tracking-wider uppercase rounded-xl transition-all shadow-xs"
                    onClick={resetForm}
                  >
                    <RotateCcw className="h-4 w-4 mr-1.5 text-[#061812]" />
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