import { useEffect, useState, useCallback } from 'react'
import { db, type Survey, type Ward, type Project } from '@/db/database'
import { generateId } from '@/lib/utils'

export const SURVEY_METHODS = [
  'Opportunistic Encounter',
  'Line Transect',
  'Point Count',
  'Fixed Area Plot',
  'Camera Trap',
  'Other',
] as const

export const HABITAT_TYPES = [
  'Urban Park / Garden',
  'Home Garden',
  'Wetland / Pond / Stream',
  'Canal / Drain',
  'Roadside Avenue',
  'Sacred Grove (Kavu)',
  'Agricultural Land',
  'Forest Patch',
  'Coastal / Beach',
  'Other',
] as const

export const TARGET_GROUPS = [
  'All Biodiversity',
  'Birds only',
  'Flora / Trees only',
  'Insects / Butterflies only',
  'Herpetofauna (Reptiles/Amphibians)',
  'Mammals only',
  'Other',
] as const

export type SurveyMethod = (typeof SURVEY_METHODS)[number]
export type HabitatType = (typeof HABITAT_TYPES)[number]
export type TargetGroup = (typeof TARGET_GROUPS)[number]

export function formatSurveyDateTime(isoString?: string): string {
  if (!isoString) return ''
  const d = new Date(isoString)
  return Number.isNaN(d.getTime())
    ? ''
    : d.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
}

export function useSurveys(projectId?: string, wardId?: string) {
  const [project, setProject] = useState<Project | null>(null)
  const [ward, setWard] = useState<Ward | null>(null)
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [observationCounts, setObservationCounts] = useState<Record<string, number>>({})
  const [showAddForm, setShowAddForm] = useState(false)

  // Form state
  const [leadObserver, setLeadObserver] = useState('')
  const [surveyMethod, setSurveyMethod] = useState<string>('Opportunistic Encounter')
  const [habitatType, setHabitatType] = useState<string>('Urban Park / Garden')
  const [targetGroup, setTargetGroup] = useState<string>('All Biodiversity')
  const [weatherNotes, setWeatherNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadData = useCallback(async () => {
    if (!projectId || !wardId) return
    const [p, w] = await Promise.all([
      db.projects.get(projectId),
      db.wards.get(wardId),
    ])
    if (p) setProject(p)
    if (w) setWard(w)

    const list = await db.surveys.where('wardId').equals(wardId).toArray()
    setSurveys(list.reverse())

    // Load observation count per survey visit
    const counts: Record<string, number> = {}
    for (const s of list) {
      const count = await db.observations.where('surveyId').equals(s.id).count()
      counts[s.id] = count
    }
    setObservationCounts(counts)
  }, [projectId, wardId])

  useEffect(() => {
    loadData()
  }, [loadData])

  const createSurvey = async (): Promise<string | null> => {
    if (!projectId || !wardId) return null
    if (!leadObserver.trim()) {
      alert('Please enter the name of the lead observer/researcher.')
      return null
    }

    setIsSubmitting(true)
    try {
      const newId = generateId()
      const now = new Date().toISOString()
      const newSurvey: Survey = {
        id: newId,
        projectId,
        wardId,
        leadObserver: leadObserver.trim(),
        surveyMethod,
        habitatType,
        targetGroup,
        startTime: now,
        weatherNotes: weatherNotes.trim() || undefined,
        createdAt: now,
        updatedAt: now,
        syncStatus: 'pending',
      }

      await db.surveys.add(newSurvey)
      setLeadObserver('')
      setWeatherNotes('')
      setShowAddForm(false)
      await loadData()
      return newId
    } catch (err) {
      alert(`Failed to start field visit: ${err instanceof Error ? err.message : 'Unknown error'}`)
      return null
    } finally {
      setIsSubmitting(false)
    }
  }

  const deleteSurvey = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this field visit record?')) {
      await db.surveys.delete(id)
      await loadData()
    }
  }

  return {
    project,
    ward,
    surveys,
    observationCounts,
    showAddForm,
    setShowAddForm,
    leadObserver,
    setLeadObserver,
    surveyMethod,
    setSurveyMethod,
    habitatType,
    setHabitatType,
    targetGroup,
    setTargetGroup,
    weatherNotes,
    setWeatherNotes,
    isSubmitting,
    createSurvey,
    deleteSurvey,
    refreshSurveys: loadData,
  }
}

