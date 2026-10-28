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
}

const ProfileContext = createContext<ProfileContextValue | undefined>(undefined)

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(() => getLocalProfile())
  const [isLoading, setIsLoading] = useState(false)

  // Sync state if localStorage changes in another tab
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
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

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
