import { useEffect, useState, useMemo, useRef } from 'react'
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
} from '@/db/database'
import { useObservationGeolocation } from './useObservationGeolocation'
import { generateId } from '@/lib/utils'

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

  // Abundance & Ecology state
  const [individualCount, setIndividualCount] = useState<number>(1)
  const [lifeStage, setLifeStage] = useState('')
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

  // Photo attachments state
  const [photos, setPhotos] = useState<Blob[]>([])
  const [photoCapturedAt, setPhotoCapturedAt] = useState<string | null>(null)
  const [showPhotoTips, setShowPhotoTips] = useState(false)

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
            existing.location_source || (existing.gps_latitude ? 'GPS' : 'Manual Pin Adjustment')
          )
        }

        if (existing.wardId) {
          geoRef.current.setAutoWardId(existing.wardId)
          geoRef.current.setAutoWardName(existing.wardName || null)
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
        } else {
          geoRef.current.setWardStatus('location_not_obtained')
          geoRef.current.setWardStatusMessage('Ward will be identified automatically after GPS acquisition.')
        }

        const attached = existing.photos?.length
          ? existing.photos
          : existing.photo
          ? [existing.photo]
          : []
        setPhotos(attached)
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
    setIndividualCount(1)
    setLifeStage('')
    setMicroHabitat('')
    setOtherMicroHabitat('')
    setHasTraditionalKnowledge('')
    setTraditionalKnowledgeSource('')
    setOtherTraditionalKnowledgeSource('')
    geo.resetLocation()
    setPhotos([])
    setPhotoCapturedAt(null)
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
    if (!geo.location || !isValidCoordinate(geo.location.latitude, geo.location.longitude)) {
      alert(
        'Please provide valid location coordinates (latitude between -90 and 90, longitude between -180 and 180) before saving.'
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
          wardName: geo.autoWardName ?? existingRecord.wardName,
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

          individualCount: parsedCount,
          lifeStage: lifeStage || undefined,
          microHabitat: microHabitat || undefined,
          otherMicroHabitat: finalOtherMicroHabitat,

          hasTraditionalKnowledge: hasTraditionalKnowledge || undefined,
          traditionalKnowledgeSource:
            hasTraditionalKnowledge === 'Yes' ? traditionalKnowledgeSource : undefined,
          otherTraditionalKnowledgeSource: finalOtherTKSource,

          observationAt,
          recordedAt: existingRecord.recordedAt,
          latitude: geo.location.latitude,
          longitude: geo.location.longitude,
          gps_latitude: geo.gpsLocation ? geo.gpsLocation.latitude : null,
          gps_longitude: geo.gpsLocation ? geo.gpsLocation.longitude : null,
          location_source: geo.locationSource || 'Manual Pin Adjustment',
          accuracyMeters:
            geo.locationSource === 'GPS' && geo.locationAccuracy !== null
              ? geo.locationAccuracy
              : null,
          photo: photos[0] ?? null,
          photos,

          verificationStatus: existingRecord.verificationStatus || 'Unreviewed',
          verifiedBy: existingRecord.verifiedBy,
          verificationNotes: existingRecord.verificationNotes,
          syncStatus: 'pending',
          createdAt: existingRecord.createdAt || existingRecord.recordedAt,
          updatedAt: nowTimestamp,
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
          wardName: geo.autoWardName || undefined,
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

          individualCount: parsedCount,
          lifeStage: lifeStage || undefined,
          microHabitat: microHabitat || undefined,
          otherMicroHabitat: finalOtherMicroHabitat,

          hasTraditionalKnowledge: hasTraditionalKnowledge || undefined,
          traditionalKnowledgeSource:
            hasTraditionalKnowledge === 'Yes' ? traditionalKnowledgeSource : undefined,
          otherTraditionalKnowledgeSource: finalOtherTKSource,

          observationAt,
          recordedAt,
          latitude: geo.location.latitude,
          longitude: geo.location.longitude,
          gps_latitude: geo.gpsLocation ? geo.gpsLocation.latitude : null,
          gps_longitude: geo.gpsLocation ? geo.gpsLocation.longitude : null,
          location_source: geo.locationSource || 'Manual Pin Adjustment',
          accuracyMeters:
            geo.locationSource === 'GPS' && geo.locationAccuracy !== null
              ? geo.locationAccuracy
              : null,
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
    individualCount,
    setIndividualCount,
    lifeStage,
    setLifeStage,
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
    photoCapturedAt,
    showPhotoTips,
    setShowPhotoTips,
    saved,
    isSaving,
    photoPreviews,
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
