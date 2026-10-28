/**
 * Profile Service (Frontend Prototype / Temporary Mock Data Layer)
 * 
 * IMPORTANT ARCHITECTURAL & SECURITY NOTE:
 * ----------------------------------------
 * 1. The backend, database, and real authentication system have not yet been implemented.
 * 2. This service manages a temporary, client-side profile state using localStorage so that
 *    the frontend UI can be fully built, tested, and demonstrated.
 * 3. WARNING: localStorage is NOT secure account storage and must NEVER be used to store
 *    passwords, secret credentials, private authentication tokens, or sensitive identity records.
 * 4. This service is deliberately decoupled from UI components so that when the real backend
 *    API (e.g. POST/GET /api/v1/profile, OAuth2, or JWT sessions) is ready, the functions below
 *    can be swapped with genuine network requests without altering component view code.
 */

import type { UserProfile, ProfileUpdateInput } from './profileTypes'

const PROFILE_STORAGE_KEY = 'bliffe_demo_profile'

/**
 * Default initial mock profile for prototyping.
 * NOTE: When the backend is ready, this will be retrieved from the server session.
 */
export const DEFAULT_MOCK_PROFILE: UserProfile = {
  id: 'bliffe-demo-user',
  fullName: 'Veena V',
  displayName: 'Veena',
  email: 'veena@field.b-liffe.org',
  bio: 'Biodiversity enthusiast & field observer documenting flora, fauna, and local ecosystems.',
  avatarType: 'preset',
  avatarPresetId: 'user', // Default to generic clean person silhouette
  avatarCustomUrl: null,
  updatedAt: new Date().toISOString(),
}

/**
 * Retrieves the current profile from temporary localStorage or returns the default mock.
 */
export function getLocalProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY)
    if (!raw) {
      // Initialize with default
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(DEFAULT_MOCK_PROFILE))
      return DEFAULT_MOCK_PROFILE
    }
    const parsed = JSON.parse(raw) as UserProfile
    // Validate minimal structure
    if (!parsed || !parsed.fullName) {
      return DEFAULT_MOCK_PROFILE
    }

    // Ensure default avatar is cleanly set to 'user' generic silhouette if not custom uploaded
    if (parsed.id === 'bliffe-demo-user' && parsed.avatarPresetId !== 'user' && !parsed.avatarCustomUrl && parsed.avatarType === 'preset') {
      parsed.avatarPresetId = 'user'
      setLocalProfile(parsed)
    }

    return parsed

  } catch (err) {
    console.warn('[profileService] Failed to parse temporary profile from localStorage:', err)
    return DEFAULT_MOCK_PROFILE
  }
}

/**
 * Saves profile to temporary localStorage.
 */
export function setLocalProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile))
  } catch (err) {
    console.error('[profileService] Failed to save profile to localStorage:', err)
  }
}

/**
 * Update profile fields. Ready for future replacement with `fetch('/api/v1/profile', ...)`.
 */
export async function apiUpdateProfile(input: ProfileUpdateInput): Promise<UserProfile> {
  // Simulate network latency if desired, or return directly
  const current = getLocalProfile()

  const updated: UserProfile = {
    ...current,
    fullName: input.fullName.trim(),
    displayName: input.displayName ? input.displayName.trim() : input.fullName.trim().split(/\s+/)[0],
    bio: (input.bio || '').trim(),
    avatarType: input.avatarType,
    avatarPresetId: input.avatarPresetId,
    avatarCustomUrl: input.avatarType === 'upload' ? input.avatarCustomUrl : null,
    updatedAt: new Date().toISOString(),
  }

  setLocalProfile(updated)
  return updated
}

/**
 * Resets profile back to factory default mock state.
 */
export function resetLocalProfile(): UserProfile {
  setLocalProfile(DEFAULT_MOCK_PROFILE)
  return DEFAULT_MOCK_PROFILE
}

/**
 * Clears demo session on Sign Out.
 */
export function clearDemoSession(): void {
  try {
    localStorage.removeItem(PROFILE_STORAGE_KEY)
  } catch (err) {
    console.error('[profileService] Failed to clear session:', err)
  }
}
