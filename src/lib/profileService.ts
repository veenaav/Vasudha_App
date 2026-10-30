import type { UserProfile, ProfileUpdateInput } from './profileTypes'

const PROFILE_STORAGE_KEY = 'bliffe_demo_profile'
const AUTH_TOKEN_KEY = 'bliffe_auth_token'

export const DEFAULT_MOCK_PROFILE: UserProfile = {
  id: 'bliffe-demo-user',
  fullName: 'Veena V',
  displayName: 'Veena',
  email: 'veena@field.b-liffe.org',
  bio: 'Biodiversity enthusiast & field observer documenting flora, fauna, and local ecosystems.',
  avatarType: 'preset',
  avatarPresetId: 'user',
  avatarCustomUrl: null,
  updatedAt: new Date().toISOString(),
}

export function getAuthToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY)
}

export function setAuthToken(token: string): void {
  localStorage.setItem(AUTH_TOKEN_KEY, token)
}

export function removeAuthToken(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY)
}

export function getLocalProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY)
    if (!raw) {
      return DEFAULT_MOCK_PROFILE
    }
    const parsed = JSON.parse(raw) as UserProfile
    if (!parsed || !parsed.fullName) {
      return DEFAULT_MOCK_PROFILE
    }
    return parsed
  } catch (err) {
    console.warn('[profileService] Failed to parse profile from localStorage:', err)
    return DEFAULT_MOCK_PROFILE
  }
}

export function setLocalProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile))
  } catch (err) {
    console.error('[profileService] Failed to save profile to localStorage:', err)
  }
}

export async function apiRegister(fullName: string, email: string, password: string): Promise<{ user: UserProfile; token: string }> {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fullName, email, password }),
  })

  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.error || 'Failed to register account')
  }

  const resolvedName = (data.user?.fullName || data.user?.name || fullName || '').trim()
  const resolvedDisplayName = data.user?.displayName || (resolvedName ? resolvedName.split(/\s+/)[0] : 'Researcher')

  const profile: UserProfile = {
    id: data.user?.id || `user-${Date.now()}`,
    fullName: resolvedName,
    displayName: resolvedDisplayName,
    email: data.user?.email || email,
    bio: data.user?.bio || data.user?.profile?.bio || '',
    avatarType: data.user?.avatarType || data.user?.profile?.avatarType || 'preset',
    avatarPresetId: data.user?.avatarPresetId || data.user?.profile?.avatarPresetId || 'user',
    avatarCustomUrl: data.user?.avatarCustomUrl || data.user?.profile?.avatarCustomUrl || null,
    updatedAt: data.user?.updatedAt || new Date().toISOString(),
  }

  setLocalProfile(profile)
  if (data.token) {
    setAuthToken(data.token)
  }
  window.dispatchEvent(new CustomEvent('bliffe:profile-changed', { detail: profile }))

  return { user: profile, token: data.token }
}

export async function apiLogin(email: string, password: string): Promise<{ user: UserProfile; token: string }> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.error || 'Invalid email or password')
  }

  const resolvedName = (data.user?.fullName || data.user?.name || email.split('@')[0] || '').trim()
  const resolvedDisplayName = data.user?.displayName || (resolvedName ? resolvedName.split(/\s+/)[0] : 'Researcher')

  const profile: UserProfile = {
    id: data.user?.id || `user-${Date.now()}`,
    fullName: resolvedName,
    displayName: resolvedDisplayName,
    email: data.user?.email || email,
    bio: data.user?.bio || data.user?.profile?.bio || '',
    avatarType: data.user?.avatarType || data.user?.profile?.avatarType || 'preset',
    avatarPresetId: data.user?.avatarPresetId || data.user?.profile?.avatarPresetId || 'user',
    avatarCustomUrl: data.user?.avatarCustomUrl || data.user?.profile?.avatarCustomUrl || null,
    updatedAt: data.user?.updatedAt || new Date().toISOString(),
  }

  setLocalProfile(profile)
  if (data.token) {
    setAuthToken(data.token)
  }
  window.dispatchEvent(new CustomEvent('bliffe:profile-changed', { detail: profile }))

  return { user: profile, token: data.token }
}

export async function apiUpdateProfile(input: ProfileUpdateInput): Promise<UserProfile> {
  const current = getLocalProfile()
  const token = getAuthToken()

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

  try {
    if (token) {
      await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updated),
      })
    }
  } catch (err) {
    console.warn('[profileService] Backend sync failed, keeping local copy:', err)
  }

  setLocalProfile(updated)
  return updated
}

export function resetLocalProfile(): UserProfile {
  setLocalProfile(DEFAULT_MOCK_PROFILE)
  return DEFAULT_MOCK_PROFILE
}

export function clearDemoSession(): void {
  try {
    localStorage.removeItem(PROFILE_STORAGE_KEY)
    removeAuthToken()
  } catch (err) {
    console.error('[profileService] Failed to clear session:', err)
  }
}
