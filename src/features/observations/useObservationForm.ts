import { useEffect, useState, useMemo, useRef, useCallback } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import {
  db,
  type Observation,
  type IdentificationStatus,
  type OrganismStatus,
  type LocationVisibility,
  type Project,
  type Ward,
  type Survey,
  type YesNo,
  isValidCoordinate,
  type BasisOfRecord,
  BASIS_OF_RECORD_OPTIONS,
  type PhotoLocationMetadata,
} from '@/db/database'
import { useObservationGeolocation } from './useObservationGeolocation'
import { generateId } from '@/lib/utils'
import { createObservationOnBackend, updateObservationOnBackend } from '@/lib/apiService'
import { extractExifLocation, type ExifLocationResult } from '@/lib/exifReader'

export function useObservationForm() {
  const { projectId, wardId, surveyId, id } = useParams<{
    projectId?: string
    wardId?: string
    surveyId?: string
    id?: string
  }>()
  const [searchParams] = useSearchParams()
  const queryProjectId = searchParams.get('projectId') || undefined
  const initialProjectId = projectId || queryProjectId || undefined
  const isProjectContext = Boolean(initialProjectId)
  const navigate = useNavigate()
  const isEditMode = Boolean(id)

  const [existingRecord, setExistingRecord] = useState<Observation | null>(null)
  const [isLoadingExisting, setIsLoadingExisting] = useState(Boolean(id))

  // Context state for active survey session
  const [activeProject, setActiveProject] = useState<Project | null>(null)
  const [activeWard, setActiveWard] = useState<Ward | null>(null)
  const [activeSurvey, setActiveSurvey] = useState<Survey | null>(null)

  // Project association state
  const [allProjects, setAllProjects] = useState<Project[]>([])
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>(
    initialProjectId ? [initialProjectId] : []
  )
  const [projectSearchQuery, setProjectSearchQuery] = useState('')
  const [showProjectsSection, setShowProjectsSection] = useState(false)
  const [showProjectTips, setShowProjectTips] = useState(false)

  // Form field state
  const [speciesName, setSpeciesName] = useState('')
  const [localName, setLocalName] = useState('')
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

  // Abundance & Ecological Details / Population Status fields
  const [individualCount, setIndividualCount] = useState<number>(1)
  const [habitatType, setHabitatType] = useState('')
  const [lifeStage, setLifeStage] = useState('')
  const [reproductiveAttributes, setReproductiveAttributes] = useState<string[]>([])
  const [sex, setSex] = useState('')
  const [evidenceOfPresence, setEvidenceOfPresence] = useState<string[]>([])
  const [season, setSeason] = useState('')
  const [microHabitat, setMicroHabitat] = useState('')
  const [otherMicroHabitat, setOtherMicroHabitat] = useState('')

  // Traditional Knowledge documentation state
  const [hasTraditionalKnowledge, setHasTraditionalKnowledge] = useState<YesNo | ''>('')
  const [traditionalKnowledgeSource, setTraditionalKnowledgeSource] = useState('')
  const [otherTraditionalKnowledgeSource, setOtherTraditionalKnowledgeSource] = useState('')

  // Modals & Tips visibility
  const [showLocationTips, setShowLocationTips] = useState(false)
  const [showEcologyTips, setShowEcologyTips] = useState(false)
  const [showTkTips, setShowTkTips] = useState(false)

  // Geolocation & Auto Ward identification hook
  const geo = useObservationGeolocation()
  const geoRef = useRef(geo)
  useEffect(() => {
    geoRef.current = geo
  }, [geo])

  // Photo attachments and metadata state
  const [photos, setPhotos] = useState<Blob[]>([])
  const [photoMetadata, setPhotoMetadata] = useState<PhotoLocationMetadata[]>([])
  const [photoCapturedAt, setPhotoCapturedAt] = useState<string | null>(null)
  const [primaryPhotoIndex, setPrimaryPhotoIndex] = useState<number>(0)
  const [showPhotoTips, setShowPhotoTips] = useState(false)
  const [isProcessingPhotos, setIsProcessingPhotos] = useState(false)

  // Submission state
  const [saved, setSaved] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Load parent Project, Ward, and Survey if route params or query params exist
  useEffect(() => {
    if (surveyId) {
      db.surveys.get(surveyId).then((s) => s && setActiveSurvey(s))
    }
    if (wardId) {
      db.wards.get(wardId).then((w) => w && setActiveWard(w))
    }
    if (initialProjectId) {
      db.projects.get(initialProjectId).then((p) => {
        if (p) {
          setActiveProject(p)
          setSelectedProjectIds((prev) => (prev.includes(p.id) ? prev : [...prev, p.id]))
        }
      })
    }
  }, [initialProjectId, wardId, surveyId])

  // Load all available projects for optional project association
  useEffect(() => {
    db.projects.toArray().then((list) => {
      setAllProjects(list)
    })
  }, [])

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

        // Ecological Details / Population status fields
        setIndividualCount(existing.individualCount ?? 1)
        setHabitatType(existing.habitatType || '')
        setLifeStage(existing.lifeStage || '')
        setReproductiveAttributes(existing.reproductiveAttributes || [])
        setSex(existing.sex || '')
        setEvidenceOfPresence(existing.evidenceOfPresence || [])
        setSeason(existing.season || '')
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
          geoRef.current.setLocation({ latitude: existing.latitude, longitude: existing.longitude })
          if (
            existing.gps_latitude !== null &&
            existing.gps_latitude !== undefined &&
            existing.gps_longitude !== null &&
            existing.gps_longitude !== undefined
          ) {
            geoRef.current.setGpsLocation({
              latitude: existing.gps_latitude,
              longitude: existing.gps_longitude,
            })
          } else {
            geoRef.current.setGpsLocation(null)
          }
          geoRef.current.setLocationAccuracy(existing.accuracyMeters ?? null)
          geoRef.current.setLocationSource(
            existing.location_source === 'EXIF' ? 'EXIF' : 'GPS'
          )
          if (existing.gpsCapturedAt) {
            geoRef.current.setGpsCapturedAt(existing.gpsCapturedAt)
          }
        }

        if (existing.wardId) {
          geoRef.current.setAutoWardId(existing.wardId)
          geoRef.current.setAutoWardName(existing.wardName || null)
          geoRef.current.setResolvedLocationName(existing.wardName || null)
          geoRef.current.setWardStatus('ward_identified')
          geoRef.current.setWardStatusMessage(
            existing.wardName ? `Ward: ${existing.wardName}` : `Ward ID: ${existing.wardId}`
          )
        } else if (existing.latitude && existing.longitude) {
          geoRef.current.setAutoWardId(null)
          geoRef.current.setAutoWardName(null)
          geoRef.current.setWardStatus('ward_unidentified')
          geoRef.current.setWardStatusMessage(
            'Ward could not be identified from coordinates (Official boundary dataset pending).'
          )
          if (existing.wardName) {
            geoRef.current.setResolvedLocationName(existing.wardName)
          } else {
            geoRef.current.triggerReverseGeocode(existing.latitude, existing.longitude)
          }
        } else {
          geoRef.current.setWardStatus('location_not_obtained')
          geoRef.current.setWardStatusMessage('Location and ward will be identified automatically after GPS acquisition.')
        }

        const attached = existing.photos?.length
          ? existing.photos
          : existing.photo
          ? [existing.photo]
          : []
        setPhotos(attached)
        setPhotoMetadata(existing.photoMetadata || [])
        setPhotoCapturedAt(existing.observationAt || null)

        if (existing.projectIds && existing.projectIds.length > 0) {
          setSelectedProjectIds(existing.projectIds)
          setShowProjectsSection(true)
        } else if (existing.projectId) {
          setSelectedProjectIds([existing.projectId])
          setShowProjectsSection(true)
        }
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

  // Project selection helpers
  const handleToggleProject = (projId: string) => {
    if (saved) return
    setSelectedProjectIds((prev) =>
      prev.includes(projId) ? prev.filter((pid) => pid !== projId) : [...prev, projId]
    )
  }

  const handleRemoveProject = (projId: string) => {
    if (saved) return
    setSelectedProjectIds((prev) => prev.filter((pid) => pid !== projId))
  }

  const filteredProjects = useMemo(() => {
    const q = projectSearchQuery.trim().toLowerCase()
    if (!q) return allProjects
    return allProjects.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.organization && p.organization.toLowerCase().includes(q)) ||
        (p.targetRegion && p.targetRegion.toLowerCase().includes(q))
    )
  }, [allProjects, projectSearchQuery])

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

    // Reset ecological fields
    setIndividualCount(1)
    setHabitatType('')
    setLifeStage('')
    setReproductiveAttributes([])
    setSex('')
    setEvidenceOfPresence([])
    setSeason('')
    setMicroHabitat('')
    setOtherMicroHabitat('')

    setHasTraditionalKnowledge('')
    setTraditionalKnowledgeSource('')
    setOtherTraditionalKnowledgeSource('')
    geo.resetLocation()
    setPhotos([])
    setPhotoMetadata([])
    setPhotoCapturedAt(null)
    setPrimaryPhotoIndex(0)
    setIsSaving(false)
    setSaved(false)
    setSelectedProjectIds(initialProjectId ? [initialProjectId] : [])
    setProjectSearchQuery('')
    setShowProjectsSection(false)
    setShowProjectTips(false)
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

  /**
   * Handle photo capture from camera or selection from gallery.
   *
   * 1. Automatically extracts latitude, longitude, and timestamp directly from photo EXIF metadata.
   * 2. If EXIF GPS coordinates are missing, falls back immediately to device navigator geolocation.
   * 3. Binds coordinates directly to the observation record as read-only.
   * 4. Associates appropriate location metadata with each photo in photoMetadata array.
   */
  // Allows user to designate which photo's coordinates serve as the primary observation location
  const selectPrimaryPhoto = useCallback(
    (idx: number) => {
      if (saved) return
      setPrimaryPhotoIndex(idx)
      const meta = photoMetadata[idx]
      if (meta && meta.latitude !== null && meta.longitude !== null) {
        if (meta.locationSource === 'EXIF') {
          geoRef.current.setExifLocation(
            { latitude: meta.latitude, longitude: meta.longitude },
            meta.capturedAt
          )
        } else {
          geoRef.current.setLocation({ latitude: meta.latitude, longitude: meta.longitude })
          geoRef.current.setLocationSource('GPS')
          geoRef.current.setLocationAccuracy(meta.accuracy ?? null)
          geoRef.current.triggerReverseGeocode(meta.latitude, meta.longitude)
        }
        if (meta.capturedAt) {
          setPhotoCapturedAt(meta.capturedAt)
        }
      }
    },
    [saved, photoMetadata]
  )

  const handleAddPhotos = useCallback(
    async (fileList: FileList | null, _isCameraCapture: boolean = false) => {
      if (saved || !fileList || fileList.length === 0) return
      setIsProcessingPhotos(true)

      const newFiles = Array.from(fileList)
      const nowIso = new Date().toISOString()
      const newMetaList: PhotoLocationMetadata[] = []
      let needsDeviceGps = false

      // Loop through and extract EXIF metadata for EVERY uploaded image file
      for (let i = 0; i < newFiles.length; i++) {
        const file = newFiles[i]
        const photoId = generateId()

        let exifResult: ExifLocationResult = { hasGps: false, latitude: null, longitude: null, capturedAt: null }
        try {
          exifResult = await extractExifLocation(file)
        } catch {
          // Ignore EXIF parsing error, fall back to device GPS
        }

        if (exifResult.hasGps && exifResult.latitude !== null && exifResult.longitude !== null) {
          // EXIF GPS metadata successfully extracted for this specific photo
          newMetaList.push({
            id: photoId,
            fileName: file.name,
            latitude: exifResult.latitude,
            longitude: exifResult.longitude,
            accuracy: null,
            capturedAt: exifResult.capturedAt || nowIso,
            gpsCapturedAt: nowIso,
            locationSource: 'EXIF',
          })
        } else {
          // Mark that this photo needs device GPS fallback
          needsDeviceGps = true
          newMetaList.push({
            id: photoId,
            fileName: file.name,
            latitude: geoRef.current.location?.latitude ?? null,
            longitude: geoRef.current.location?.longitude ?? null,
            accuracy: geoRef.current.locationAccuracy ?? null,
            capturedAt: nowIso,
            gpsCapturedAt: geoRef.current.gpsCapturedAt || nowIso,
            locationSource: 'GPS',
          })
        }
      }

      const combinedPhotos = [...photos, ...newFiles]
      const combinedMeta = [...photoMetadata, ...newMetaList]

      setPhotos(combinedPhotos)
      setPhotoMetadata(combinedMeta)

      // Automatically select best primary photo reference:
      // If no valid GPS lock is active, find the first photo with valid EXIF GPS coordinates
      const firstExifIdx = combinedMeta.findIndex(
        (m) => m.locationSource === 'EXIF' && m.latitude !== null && m.longitude !== null
      )

      if (firstExifIdx !== -1) {
        const currentPrimaryMeta = combinedMeta[primaryPhotoIndex]
        const shouldSwitchPrimary =
          !currentPrimaryMeta ||
          currentPrimaryMeta.latitude === null ||
          currentPrimaryMeta.locationSource !== 'EXIF'

        const targetPrimaryIdx = shouldSwitchPrimary ? firstExifIdx : primaryPhotoIndex
        setPrimaryPhotoIndex(targetPrimaryIdx)

        const primaryMeta = combinedMeta[targetPrimaryIdx]
        if (primaryMeta && primaryMeta.latitude !== null && primaryMeta.longitude !== null) {
          geoRef.current.setExifLocation(
            { latitude: primaryMeta.latitude, longitude: primaryMeta.longitude },
            primaryMeta.capturedAt
          )
          if (primaryMeta.capturedAt && !photoCapturedAt) {
            setPhotoCapturedAt(primaryMeta.capturedAt)
          }
        }
      }

      // If any photos need device GPS fallback, trigger device geolocation once
      if (needsDeviceGps && firstExifIdx === -1) {
        try {
          const coords = await geoRef.current.getLocation()
          if (coords) {
            setPhotoMetadata((prev) =>
              prev.map((meta) => {
                if (meta.locationSource === 'GPS' && meta.latitude === null) {
                  return {
                    ...meta,
                    latitude: coords.latitude,
                    longitude: coords.longitude,
                    accuracy: geoRef.current.locationAccuracy,
                    gpsCapturedAt: new Date().toISOString(),
                  }
                }
                return meta
              })
            )
            if (!photoCapturedAt) {
              setPhotoCapturedAt(nowIso)
            }
          }
        } finally {
          setIsProcessingPhotos(false)
        }
      } else {
        setIsProcessingPhotos(false)
      }
    },
    [saved, photos, photoMetadata, primaryPhotoIndex, photoCapturedAt]
  )

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
    setPhotoMetadata((prev) => {
      const updated = prev.filter((_, idx) => idx !== indexToRemove)
      setPrimaryPhotoIndex((prevPrimary) => {
        if (prevPrimary === indexToRemove) {
          const nextIdx = updated.findIndex((m) => m.latitude !== null)
          return nextIdx !== -1 ? nextIdx : 0
        } else if (prevPrimary > indexToRemove) {
          return prevPrimary - 1
        }
        return prevPrimary
      })
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

    // Coordinate validation: if coordinates are provided, ensure they are within bounds
    if (
      geo.location &&
      !isValidCoordinate(geo.location.latitude, geo.location.longitude)
    ) {
      alert(
        'Please provide valid coordinates (latitude between -90 and 90, longitude between -180 and 180).'
      )
      return
    }

    if (
      geo.gpsLocation &&
      !isValidCoordinate(geo.gpsLocation.latitude, geo.gpsLocation.longitude)
    ) {
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

      const finalOtherGroup =
        speciesGroup === 'Other' && otherSpeciesGroup.trim()
          ? otherSpeciesGroup.trim()
          : undefined

      const finalOtherMicroHabitat =
        microHabitat === 'Other' && otherMicroHabitat.trim()
          ? otherMicroHabitat.trim()
          : undefined

      const finalOtherTKSource =
        hasTraditionalKnowledge === 'Yes' &&
        traditionalKnowledgeSource === 'Other' &&
        otherTraditionalKnowledgeSource.trim()
          ? otherTraditionalKnowledgeSource.trim()
          : undefined

      const finalLatitude = geo.location ? geo.location.latitude : null
      const finalLongitude = geo.location ? geo.location.longitude : null
      const finalGpsLatitude = geo.gpsLocation ? geo.gpsLocation.latitude : finalLatitude
      const finalGpsLongitude = geo.gpsLocation ? geo.gpsLocation.longitude : finalLongitude
      const finalLocationSource =
        geo.locationSource || (finalLatitude !== null ? 'GPS' : null)

      if (isEditMode && existingRecord && id) {
        // Update existing record: preserve original ID, createdAt, and recordedAt
        const finalProjectId = isProjectContext
          ? initialProjectId
          : selectedProjectIds[0] || existingRecord.projectId
        const finalProjectIds = isProjectContext
          ? initialProjectId
            ? [initialProjectId]
            : existingRecord.projectIds
          : selectedProjectIds.length > 0
          ? selectedProjectIds
          : undefined

        const updatedObservation: Observation = {
          ...existingRecord,
          id: existingRecord.id,
          surveyId: existingRecord.surveyId,
          wardId: geo.autoWardId ?? existingRecord.wardId,
          wardName:
            geo.autoWardName
              ? geo.autoWardNumber
                ? `Ward ${geo.autoWardNumber} – ${geo.autoWardName}`
                : geo.autoWardName
              : (geo.resolvedLocationName || existingRecord.wardName || undefined),
          projectId: finalProjectId,
          projectIds: finalProjectIds,

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

          // Ecological Details / Population status fields
          individualCount: parsedCount,
          habitatType: habitatType || undefined,
          lifeStage: lifeStage || undefined,
          reproductiveAttributes:
            reproductiveAttributes.length > 0 ? reproductiveAttributes : undefined,
          sex: sex || undefined,
          evidenceOfPresence: evidenceOfPresence.length > 0 ? evidenceOfPresence : undefined,
          season: season || undefined,
          microHabitat: microHabitat || undefined,
          otherMicroHabitat: finalOtherMicroHabitat,

          hasTraditionalKnowledge: hasTraditionalKnowledge || undefined,
          traditionalKnowledgeSource:
            hasTraditionalKnowledge === 'Yes' ? traditionalKnowledgeSource : undefined,
          otherTraditionalKnowledgeSource: finalOtherTKSource,

          observationAt,
          recordedAt: existingRecord.recordedAt,
          latitude: finalLatitude,
          longitude: finalLongitude,
          gps_latitude: finalGpsLatitude,
          gps_longitude: finalGpsLongitude,
          location_source: finalLocationSource,
          accuracyMeters:
            finalLocationSource === 'GPS' && geo.locationAccuracy !== null
              ? geo.locationAccuracy
              : null,
          gpsCapturedAt: geo.gpsCapturedAt || existingRecord.gpsCapturedAt || null,
          photo: photos[primaryPhotoIndex] || photos[0] || null,
          photos,
          photoMetadata: photoMetadata.length > 0 ? photoMetadata : undefined,

          verificationStatus: existingRecord.verificationStatus || 'Unreviewed',
          verifiedBy: existingRecord.verifiedBy,
          verificationNotes: existingRecord.verificationNotes,
          syncStatus: 'pending',
          createdAt: existingRecord.createdAt || existingRecord.recordedAt,
          updatedAt: nowTimestamp,
        }

        try {
          if (updatedObservation.id) {
            await updateObservationOnBackend(updatedObservation.id, updatedObservation)
          }
          updatedObservation.syncStatus = 'synced'
        } catch (backendErr) {
          console.warn('[useObservationForm] Backend update failed, stored locally:', backendErr)
          updatedObservation.syncStatus = 'pending'
        }
        await db.observations.put(updatedObservation)
        setSaved(true)
      } else {
        const finalProjectId = isProjectContext
          ? initialProjectId
          : selectedProjectIds[0] || undefined
        const finalProjectIds = isProjectContext
          ? initialProjectId
            ? [initialProjectId]
            : undefined
          : selectedProjectIds.length > 0
          ? selectedProjectIds
          : undefined

        const newObservation: Observation = {
          id: generateId(),
          surveyId: surveyId || undefined,
          wardId: geo.autoWardId || undefined,
          wardName:
            geo.autoWardName
              ? geo.autoWardNumber
                ? `Ward ${geo.autoWardNumber} – ${geo.autoWardName}`
                : geo.autoWardName
              : (geo.resolvedLocationName || undefined),
          projectId: finalProjectId,
          projectIds: finalProjectIds,

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

          // Ecological Details / Population status fields
          individualCount: parsedCount,
          habitatType: habitatType || undefined,
          lifeStage: lifeStage || undefined,
          reproductiveAttributes:
            reproductiveAttributes.length > 0 ? reproductiveAttributes : undefined,
          sex: sex || undefined,
          evidenceOfPresence: evidenceOfPresence.length > 0 ? evidenceOfPresence : undefined,
          season: season || undefined,
          microHabitat: microHabitat || undefined,
          otherMicroHabitat: finalOtherMicroHabitat,

          hasTraditionalKnowledge: hasTraditionalKnowledge || undefined,
          traditionalKnowledgeSource:
            hasTraditionalKnowledge === 'Yes' ? traditionalKnowledgeSource : undefined,
          otherTraditionalKnowledgeSource: finalOtherTKSource,

          observationAt,
          recordedAt,
          latitude: finalLatitude,
          longitude: finalLongitude,
          gps_latitude: finalGpsLatitude,
          gps_longitude: finalGpsLongitude,
          location_source: finalLocationSource,
          accuracyMeters:
            finalLocationSource === 'GPS' && geo.locationAccuracy !== null
              ? geo.locationAccuracy
              : null,
          gpsCapturedAt: geo.gpsCapturedAt || null,
          photo: photos[primaryPhotoIndex] || photos[0] || null,
          photos,
          photoMetadata: photoMetadata.length > 0 ? photoMetadata : undefined,

          verificationStatus: 'Unreviewed',
          syncStatus: 'pending',
          createdAt: nowTimestamp,
          updatedAt: nowTimestamp,
        }

        try {
          const savedServer = await createObservationOnBackend(newObservation)
          newObservation.syncStatus = 'synced'
          if (savedServer?.id) newObservation.id = savedServer.id
        } catch (backendErr) {
          console.warn('[useObservationForm] Backend insert failed, stored locally:', backendErr)
          newObservation.syncStatus = 'pending'
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

  const displayObservationTime = photoCapturedAt
    ? new Date(photoCapturedAt).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })

  return {
    projectId,
    wardId,
    surveyId,
    id,
    initialProjectId,
    isProjectContext,
    isEditMode,
    existingRecord,
    isLoadingExisting,
    activeProject,
    activeWard,
    activeSurvey,
    allProjects,
    selectedProjectIds,
    projectSearchQuery,
    setProjectSearchQuery,
    showProjectsSection,
    setShowProjectsSection,
    showProjectTips,
    setShowProjectTips,
    filteredProjects,
    handleToggleProject,
    handleRemoveProject,
    speciesName,
    setSpeciesName,
    localName,
    setLocalName,
    speciesGroup,
    setSpeciesGroup,
    otherSpeciesGroup,
    setOtherSpeciesGroup,
    scientificName,
    setScientificName,
    identificationStatus,
    setIdentificationStatus,
    organismStatus,
    setOrganismStatus,
    locationVisibility,
    setLocationVisibility,
    showVisibilityHelp,
    setShowVisibilityHelp,
    basisOfRecord,
    setBasisOfRecord,
    tags,
    setTags,
    showTagsSection,
    setShowTagsSection,
    notes,
    setNotes,

    // Ecological Details / Population status fields
    individualCount,
    setIndividualCount,
    habitatType,
    setHabitatType,
    lifeStage,
    setLifeStage,
    reproductiveAttributes,
    setReproductiveAttributes,
    sex,
    setSex,
    evidenceOfPresence,
    setEvidenceOfPresence,
    season,
    setSeason,
    microHabitat,
    setMicroHabitat,
    otherMicroHabitat,
    setOtherMicroHabitat,

    hasTraditionalKnowledge,
    setHasTraditionalKnowledge,
    traditionalKnowledgeSource,
    setTraditionalKnowledgeSource,
    otherTraditionalKnowledgeSource,
    setOtherTraditionalKnowledgeSource,
    showLocationTips,
    setShowLocationTips,
    showEcologyTips,
    setShowEcologyTips,
    showTkTips,
    setShowTkTips,

    photos,
    photoMetadata,
    photoCapturedAt,
    showPhotoTips,
    setShowPhotoTips,
    isProcessingPhotos,
    saved,
    isSaving,
    photoPreviews,
    primaryPhotoIndex,
    selectPrimaryPhoto,
    geo,
    resetForm,
    handleStatusChange,
    handleMicroHabitatChange,
    handleTraditionalKnowledgeChange,
    handleTraditionalKnowledgeSourceChange,
    handleAddPhotos,
    handleRemovePhoto,
    handleSaveObservation,
    isUnknown,
    displayObservationTime,
    navigate,
  }
}
