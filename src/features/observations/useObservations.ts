import { useEffect, useState, useMemo } from 'react'
import { db, type Observation } from '@/db/database'
import { getTagById } from '@/lib/tagCatalogue'
import {
  fetchObservationsFromBackend,
  deleteObservationOnBackend,
} from '@/lib/apiService'

export type ObservationFilterStatus = 'All' | 'Identified' | 'Needs verification' | 'Unknown'

export function useObservations() {
  const [observations, setObservations] = useState<Observation[]>([])
  const [selectedFilter, setSelectedFilter] = useState<ObservationFilterStatus>('All')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadObservations = async () => {
    try {
      const items = await db.observations.toArray()
      const sorted = [...items].sort((a, b) => {
        const tA = new Date(b.createdAt || b.recordedAt).getTime()
        const tB = new Date(a.createdAt || a.recordedAt).getTime()
        return tA - tB
      })
      setObservations(sorted)

      // Fetch from remote NeoDB and merge into local Dexie cache
      try {
        const serverObs = await fetchObservationsFromBackend()
        if (serverObs && Array.isArray(serverObs)) {
          for (const s of serverObs) {
            await db.observations.put({
              ...s,
              syncStatus: 'synced',
            })
          }
          const updatedItems = await db.observations.toArray()
          const updatedSorted = [...updatedItems].sort((a, b) => {
            const tA = new Date(b.createdAt || b.recordedAt).getTime()
            const tB = new Date(a.createdAt || a.recordedAt).getTime()
            return tA - tB
          })
          setObservations(updatedSorted)
        }
      } catch (err) {
        console.info('[useObservations] Backend observations fetch skipped/offline:', err)
      }
    } catch (err) {
      console.error('Failed to load observations:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadObservations()
  }, [])

  const handleDeleteObservation = async (id: string) => {
    try {
      try {
        await deleteObservationOnBackend(id)
      } catch (backendErr) {
        console.warn('[useObservations] Backend delete queued/failed:', backendErr)
      }
      await db.observations.delete(id)
      setObservations((current) => current.filter((obs) => obs.id !== id))
    } catch (error) {
      alert(
        `Failed to delete observation: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      )
    }
  }

  // Derive unique tags used across all observations
  const availableTags = useMemo(() => {
    const counts: Record<string, number> = {}
    observations.forEach((obs) => {
      obs.tags?.forEach((t) => {
        counts[t] = (counts[t] || 0) + 1
      })
    })
    return Object.entries(counts).map(([id, count]) => {
      const tag = getTagById(id)
      return {
        id,
        name: tag?.label || id,
        category: tag?.category || 'General',
        count,
      }
    })
  }, [observations])

  // Filter observations based on selected status pill and tag
  const filteredObservations = useMemo(() => {
    return observations.filter((obs) => {
      if (selectedFilter !== 'All' && obs.identificationStatus !== selectedFilter) {
        return false
      }
      if (selectedTag && (!obs.tags || !obs.tags.includes(selectedTag))) {
        return false
      }
      return true
    })
  }, [observations, selectedFilter, selectedTag])

  return {
    observations,
    filteredObservations,
    availableTags,
    selectedFilter,
    setSelectedFilter,
    selectedTag,
    setSelectedTag,
    isLoading,
    handleDeleteObservation,
    loadObservations,
  }
}
