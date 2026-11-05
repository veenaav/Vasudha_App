import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { UserProfile, ProfileUpdateInput } from '@/lib/profileTypes'
import {
  getLocalProfile,
  apiUpdateProfile,
  resetLocalProfile,
  clearDemoSession,
  getIsGuestUser,
  setIsGuestUser,
} from '@/lib/profileService'

interface ProfileContextValue {
  profile: UserProfile
  isLoading: boolean
  isGuest: boolean
  setGuestSession: (isGuest: boolean) => void
  updateProfile: (input: ProfileUpdateInput) => Promise<UserProfile>
  resetProfile: () => void
  signOut: () => void
  refreshProfile: () => void
}

const ProfileContext = createContext<ProfileContextValue | undefined>(undefined)

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(() => getLocalProfile())
  const [isGuest, setIsGuest] = useState<boolean>(() => getIsGuestUser())
  const [isLoading, setIsLoading] = useState(false)

  const refreshProfile = useCallback(() => {
    setProfile(getLocalProfile())
    setIsGuest(getIsGuestUser())
  }, [])

  const setGuestSession = useCallback((guest: boolean) => {
    setIsGuestUser(guest)
    setIsGuest(guest)
  }, [])

  // Sync state if localStorage changes in another tab or in current tab via custom event
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'bliffe_demo_profile' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue)
          setProfile(parsed)
        } catch {
          // ignore parse errors
        }
      }
      if (e.key === 'bliffe_is_guest') {
        setIsGuest(e.newValue === 'true')
      }
    }

    const handleCustomChange = (e: Event) => {
      const custom = e as CustomEvent<UserProfile>
      if (custom.detail) {
        setProfile(custom.detail)
      } else {
        refreshProfile()
      }
    }

    const handleGuestModeChange = (e: Event) => {
      const custom = e as CustomEvent<{ isGuest: boolean }>
      if (custom.detail && typeof custom.detail.isGuest === 'boolean') {
        setIsGuest(custom.detail.isGuest)
      } else {
        setIsGuest(getIsGuestUser())
      }
    }

    window.addEventListener('storage', handleStorage)
    window.addEventListener('bliffe:profile-changed', handleCustomChange)
    window.addEventListener('bliffe:guest-mode-changed', handleGuestModeChange)
    return () => {
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener('bliffe:profile-changed', handleCustomChange)
      window.removeEventListener('bliffe:guest-mode-changed', handleGuestModeChange)
    }
  }, [refreshProfile])

  const updateProfile = useCallback(async (input: ProfileUpdateInput): Promise<UserProfile> => {
    setIsLoading(true)
    try {
      const updated = await apiUpdateProfile(input)
      setProfile(updated)
      return updated
    } finally {
      setIsLoading(false)
    }
  }, [])

  const resetProfile = useCallback(() => {
    const reset = resetLocalProfile()
    setProfile(reset)
  }, [])

  const signOut = useCallback(() => {
    clearDemoSession()
    setIsGuest(false)
    // Re-initialize clean state
    setProfile(resetLocalProfile())
  }, [])

  return (
    <ProfileContext.Provider
      value={{
        profile,
        isLoading,
        isGuest,
        setGuestSession,
        updateProfile,
        resetProfile,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfile() {
  const context = useContext(ProfileContext)
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider')
  }
  return context
}
