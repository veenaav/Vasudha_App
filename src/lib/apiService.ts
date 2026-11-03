import { db, type Project, type Observation, type Ward, type Survey } from '@/db/database'
import { getAuthToken } from './profileService'
import { uploadImageToS3 } from './mediaService'
import type { WardIdentificationResult } from './wardService'

export const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

export interface SyncStatusResult {
  status: 'online' | 'offline'
  timestamp: string
  counts: {
    projects: number
    wards: number
    surveys: number
    observations: number
  }
}

export interface SyncAllResult {
  success: boolean
  timestamp: string
  synced: {
    projects: number
    wards: number
    surveys: number
    observations: number
  }
  error?: string
}

function getHeaders(customHeaders: Record<string, string> = {}): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...customHeaders,
  }
  const token = getAuthToken()
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }
  return headers
}

export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
      } else {
        reject(new Error('Failed to convert Blob to base64 string'))
      }
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

/**
 * Resolves an observation photo for cloud storage.
 * If already a remote URL (e.g. S3), returns it directly.
 * If a Blob, uploads to S3 bucket (bliffe-media).
 * If offline or S3 upload fails, falls back to base64 so field data is never lost.
 */
export async function resolvePhotoForBackend(photo: Blob | string): Promise<string> {
  if (typeof photo === 'string') {
    return photo.trim()
  }
  if (photo instanceof Blob) {
    try {
      const uploadRes = await uploadImageToS3(photo, 'observations')
      if (uploadRes?.url) return uploadRes.url
    } catch (err) {
      console.warn('[apiService] S3 direct upload failed, falling back to base64:', err)
    }
    try {
      return await blobToBase64(photo)
    } catch (err) {
      console.warn('[apiService] Failed to serialize blob to base64:', err)
    }
  }
  return ''
}

// ==========================================
// Projects API
// ==========================================

export async function fetchProjectsFromBackend(): Promise<Project[]> {
  const res = await fetch(`${API_BASE}/api/projects`, {
    headers: getHeaders(),
  })
  if (!res.ok) {
    throw new Error(`Failed to fetch projects: ${res.statusText}`)
  }
  return (await res.json()) as Project[]
}

export async function createProjectOnBackend(
  project: Partial<Project> & { name: string }
): Promise<Project> {
  const res = await fetch(`${API_BASE}/api/projects`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(project),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || `Failed to create project: ${res.statusText}`)
  }
  return (await res.json()) as Project
}

export async function updateProjectOnBackend(
  id: string,
  updates: Partial<Project>
): Promise<Project> {
  const res = await fetch(`${API_BASE}/api/projects/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(updates),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || `Failed to update project: ${res.statusText}`)
  }
  return (await res.json()) as Project
}

export async function deleteProjectOnBackend(id: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/api/projects/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || `Failed to delete project: ${res.statusText}`)
  }
  return true
}

// ==========================================
// Observations API
// ==========================================

export async function fetchObservationsFromBackend(filters?: {
  projectId?: string
  wardId?: string
  surveyId?: string
  status?: string
  tag?: string
  search?: string
}): Promise<Observation[]> {
  const params = new URLSearchParams()
  if (filters?.projectId) params.set('projectId', filters.projectId)
  if (filters?.wardId) params.set('wardId', filters.wardId)
  if (filters?.surveyId) params.set('surveyId', filters.surveyId)
  if (filters?.status) params.set('status', filters.status)
  if (filters?.tag) params.set('tag', filters.tag)
  if (filters?.search) params.set('search', filters.search)

  const url = `${API_BASE}/api/observations${params.toString() ? `?${params.toString()}` : ''}`
  const res = await fetch(url, {
    headers: getHeaders(),
  })
  if (!res.ok) {
    throw new Error(`Failed to fetch observations: ${res.statusText}`)
  }
  return (await res.json()) as Observation[]
}

export async function createObservationOnBackend(
  observation: Partial<Observation> & { speciesName: string }
): Promise<Observation> {
  // Resolve photos: uploads to Amazon S3 (bliffe-media) or falls back to base64
  const photoUrls: string[] = []
  const rawList: (Blob | string)[] = observation.photos?.length
    ? observation.photos
    : observation.photo
    ? [observation.photo]
    : []

  for (const item of rawList) {
    const resolved = await resolvePhotoForBackend(item)
    if (resolved) photoUrls.push(resolved)
  }

  const payload = {
    ...observation,
    photos: photoUrls,
    photo: photoUrls[0] || null,
  }

  const res = await fetch(`${API_BASE}/api/observations`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || `Failed to create observation: ${res.statusText}`)
  }

  return (await res.json()) as Observation
}

export async function updateObservationOnBackend(
  id: string,
  updates: Partial<Observation>
): Promise<Observation> {
  const photoUrls: string[] = []
  if (updates.photos && updates.photos.length > 0) {
    for (const p of updates.photos) {
      const resolved = await resolvePhotoForBackend(p)
      if (resolved) photoUrls.push(resolved)
    }
  } else if (updates.photo) {
    const resolved = await resolvePhotoForBackend(updates.photo)
    if (resolved) photoUrls.push(resolved)
  }

  const payload = {
    ...updates,
    ...(photoUrls.length > 0 && { photos: photoUrls }),
  }

  const res = await fetch(`${API_BASE}/api/observations/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || `Failed to update observation: ${res.statusText}`)
  }

  return (await res.json()) as Observation
}

export async function deleteObservationOnBackend(id: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/api/observations/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || `Failed to delete observation: ${res.statusText}`)
  }
  return true
}

// ==========================================
// Wards & GIS Boundary API
// ==========================================

export async function identifyWardViaBackend(
  latitude: number,
  longitude: number
): Promise<WardIdentificationResult> {
  const res = await fetch(`${API_BASE}/api/wards/identify`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ latitude, longitude }),
  })
  if (!res.ok) {
    throw new Error(`Ward identification request failed: ${res.statusText}`)
  }
  return (await res.json()) as WardIdentificationResult
}

export async function fetchWardsFromBackend(projectId?: string): Promise<Ward[]> {
  const url = projectId ? `${API_BASE}/api/projects/${projectId}/wards` : `${API_BASE}/api/wards`
  const res = await fetch(url, {
    headers: getHeaders(),
  })
  if (!res.ok) {
    throw new Error(`Failed to fetch wards: ${res.statusText}`)
  }
  return (await res.json()) as Ward[]
}

export async function createWardOnBackend(ward: Partial<Ward>): Promise<Ward> {
  const res = await fetch(`${API_BASE}/api/wards`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(ward),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || `Failed to create ward: ${res.statusText}`)
  }
  return (await res.json()) as Ward
}

// ==========================================
// Surveys API
// ==========================================

export async function fetchSurveysFromBackend(
  projectId?: string,
  wardId?: string
): Promise<Survey[]> {
  const params = new URLSearchParams()
  if (projectId) params.set('projectId', projectId)
  if (wardId) params.set('wardId', wardId)

  const url = `${API_BASE}/api/surveys${params.toString() ? `?${params.toString()}` : ''}`
  const res = await fetch(url, {
    headers: getHeaders(),
  })
  if (!res.ok) {
    throw new Error(`Failed to fetch surveys: ${res.statusText}`)
  }
  return (await res.json()) as Survey[]
}

export async function createSurveyOnBackend(survey: Partial<Survey>): Promise<Survey> {
  const res = await fetch(`${API_BASE}/api/surveys`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(survey),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || `Failed to record survey: ${res.statusText}`)
  }
  return (await res.json()) as Survey
}

export async function deleteSurveyOnBackend(id: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/api/surveys/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || `Failed to delete survey: ${res.statusText}`)
  }
  return true
}

// ==========================================
// Sync & Database Health API
// ==========================================

export async function fetchSyncStatus(): Promise<SyncStatusResult> {
  try {
    const res = await fetch(`${API_BASE}/api/sync/status`, {
      headers: getHeaders(),
      signal: AbortSignal.timeout(6000),
    })
    if (!res.ok) {
      throw new Error(`Server status returned ${res.status}`)
    }
    const data = await res.json()
    return {
      status: 'online',
      timestamp: data.timestamp || new Date().toISOString(),
      counts: data.counts || { projects: 0, wards: 0, surveys: 0, observations: 0 },
    }
  } catch {
    return {
      status: 'offline',
      timestamp: new Date().toISOString(),
      counts: { projects: 0, wards: 0, surveys: 0, observations: 0 },
    }
  }
}

export async function syncAllStoresWithBackend(): Promise<SyncAllResult> {
  try {
    // 1. Gather all local records from IndexedDB
    const [localProjects, localWards, localSurveys, localObservations] = await Promise.all([
      db.projects.toArray(),
      db.wards.toArray(),
      db.surveys.toArray(),
      db.observations.toArray(),
    ])

    // Resolve photos for observations (upload to S3 bliffe-media or fallback to base64)
    const serializedObservations = await Promise.all(
      localObservations.map(async (obs) => {
        const photoUrls: string[] = []
        const rawPhotos: (Blob | string)[] = obs.photos?.length
          ? obs.photos
          : obs.photo
          ? [obs.photo]
          : []

        for (const p of rawPhotos) {
          const resolved = await resolvePhotoForBackend(p)
          if (resolved) photoUrls.push(resolved)
        }

        return {
          ...obs,
          photos: photoUrls,
          photo: photoUrls[0] || null,
        }
      })
    )

    const payload = {
      projects: localProjects,
      wards: localWards,
      surveys: localSurveys,
      observations: serializedObservations,
    }

    const res = await fetch(`${API_BASE}/api/sync`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}))
      throw new Error(errData.error || `Sync failed: ${res.statusText}`)
    }

    const result = (await res.json()) as SyncAllResult

    // 2. Mark all synced records in local Dexie as 'synced'
    await Promise.all([
      db.projects.toCollection().modify({ syncStatus: 'synced' }),
      db.wards.toCollection().modify({ syncStatus: 'synced' }),
      db.surveys.toCollection().modify({ syncStatus: 'synced' }),
      db.observations.toCollection().modify({ syncStatus: 'synced' }),
    ])

    return result
  } catch (err) {
    return {
      success: false,
      timestamp: new Date().toISOString(),
      synced: { projects: 0, wards: 0, surveys: 0, observations: 0 },
      error: err instanceof Error ? err.message : 'Unknown synchronization error',
    }
  }
}
