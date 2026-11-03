import { API_BASE, getAuthToken } from './profileService'

export interface UploadResult {
  url: string
  key: string
  bucket?: string
  size?: number
}

export interface MediaStatus {
  configured: boolean
  bucket: string
  region: string
  baseUrl: string
}

/**
 * Upload an image file or blob directly to the backend which streams it
 * to the Amazon S3 bucket (bliffe-media).
 */
export async function uploadImageToS3(
  fileOrBlob: File | Blob,
  folder: 'observations' | 'avatars' = 'observations'
): Promise<UploadResult> {
  const token = getAuthToken()
  const formData = new FormData()

  let filename = 'photo.jpg'
  if (fileOrBlob instanceof File && fileOrBlob.name) {
    filename = fileOrBlob.name
  } else {
    const ext = fileOrBlob.type.includes('png')
      ? '.png'
      : fileOrBlob.type.includes('webp')
      ? '.webp'
      : '.jpg'
    filename = `field_${Date.now()}${ext}`
  }

  formData.append('file', fileOrBlob, filename)
  formData.append('folder', folder)

  const headers: Record<string, string> = {}
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${API_BASE}/api/media/upload`, {
    method: 'POST',
    headers,
    body: formData,
  })

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.error || errorData.detail || `Upload failed with status ${res.status}`)
  }

  return (await res.json()) as UploadResult
}

/**
 * Checks whether Amazon S3 object storage is configured and accessible.
 */
export async function getS3Status(): Promise<MediaStatus | null> {
  try {
    const res = await fetch(`${API_BASE}/api/media/status`)
    if (!res.ok) return null
    return (await res.json()) as MediaStatus
  } catch {
    return null
  }
}

