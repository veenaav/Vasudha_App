import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { UserProfile, ProfileUpdateInput } from '@/lib/profileTypes'
import {
  getLocalProfile,
  apiUpdateProfile,
  resetLocalProfile,
  clearDemoSession,
} from '@/lib/profileService'

interface ProfileContextValue {
  profile: UserProfile
  isLoading: boolean
  updateProfile: (input: ProfileUpdateInput) => Promise<UserProfile>
  resetProfile: () => void
  signOut: () => void
  refreshProfile: () => void
}

const ProfileContext = createContext<ProfileContextValue | undefined>(undefined)

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(() => getLocalProfile())
  const [isLoading, setIsLoading] = useState(false)

  const refreshProfile = useCallback(() => {
    setProfile(getLocalProfile())
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
    }

    const handleCustomChange = (e: Event) => {
      const custom = e as CustomEvent<UserProfile>
      if (custom.detail) {
        setProfile(custom.detail)
      } else {
        refreshProfile()
      }
    }

    window.addEventListener('storage', handleStorage)
    window.addEventListener('bliffe:profile-changed', handleCustomChange)
    return () => {
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener('bliffe:profile-changed', handleCustomChange)
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
    // Re-initialize clean state
    setProfile(resetLocalProfile())
  }, [])

  return (
    <ProfileContext.Provider
      value={{
        profile,
        isLoading,
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
