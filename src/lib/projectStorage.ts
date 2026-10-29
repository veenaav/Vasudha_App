import type { Observation } from '@/db/database'

const STORAGE_KEY = 'shrishti_joined_project_ids'

/**
 * Retrieve the list of joined project IDs from local storage.
 */
export const getJoinedProjectIds = (): string[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

/**
 * Check if a project is currently joined.
 */
export const isProjectJoined = (projectId: string): boolean => {
  return getJoinedProjectIds().includes(projectId)
}

/**
 * Toggle join/leave state for a project ID in local storage.
 */
export const toggleJoinedProject = (projectId: string): string[] => {
  try {
    const current = getJoinedProjectIds()
    let updated: string[]
    if (current.includes(projectId)) {
      updated = current.filter((id) => id !== projectId)
    } else {
      updated = [...current, projectId]
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    return updated
  } catch {
    return []
  }
}

/**
 * Calculate observation count for a project, taking into account both scalar
 * `projectId` and the multi-project linkage array `projectIds`.
 */
export const countProjectObservations = (
  projectId: string,
  observations: Observation[]
): number => {
  return observations.filter(
    (obs) => obs.projectId === projectId || (obs.projectIds && obs.projectIds.includes(projectId))
  ).length
}

