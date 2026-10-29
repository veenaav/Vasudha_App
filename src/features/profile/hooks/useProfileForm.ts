import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProfile } from '@/context/ProfileContext'
import type { AvatarPresetId, AvatarType } from '@/lib/profileTypes'

export interface ProfileFormState {
  fullName: string
  displayName: string
  bio: string
  avatarType: AvatarType
  avatarPresetId: AvatarPresetId
  avatarCustomUrl: string | null
}

export function useProfileForm() {
  const navigate = useNavigate()
  const { profile, updateProfile, signOut } = useProfile()

  // View vs Edit Mode
  const [isEditing, setIsEditing] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Edit Form State
  const [formData, setFormData] = useState<ProfileFormState>({
    fullName: profile.fullName,
    displayName: profile.displayName,
    bio: profile.bio,
    avatarType: profile.avatarType,
    avatarPresetId: profile.avatarPresetId,
    avatarCustomUrl: profile.avatarCustomUrl || null,
  })

  // Validation & Modal states
  const [errors, setErrors] = useState<{ fullName?: string }>({})
  const [showDiscardModal, setShowDiscardModal] = useState(false)
  const [showSignOutModal, setShowSignOutModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Calculate if form is dirty
  const isDirty =
    formData.fullName !== profile.fullName ||
    formData.displayName !== profile.displayName ||
    formData.bio !== profile.bio ||
    formData.avatarType !== profile.avatarType ||
    formData.avatarPresetId !== profile.avatarPresetId ||
    formData.avatarCustomUrl !== profile.avatarCustomUrl

  // Open Edit Mode
  const handleStartEditing = () => {
    setFormData({
      fullName: profile.fullName,
      displayName: profile.displayName,
      bio: profile.bio,
      avatarType: profile.avatarType,
      avatarPresetId: profile.avatarPresetId,
      avatarCustomUrl: profile.avatarCustomUrl || null,
    })
    setErrors({})
    setSaveSuccess(false)
    setIsEditing(true)
  }

  // Handle Cancel with dirty protection
  const handleCancel = () => {
    if (isDirty) {
      setShowDiscardModal(true)
    } else {
      setIsEditing(false)
    }
  }

  const confirmDiscard = () => {
    setShowDiscardModal(false)
    setIsEditing(false)
    setFormData({
      fullName: profile.fullName,
      displayName: profile.displayName,
      bio: profile.bio,
      avatarType: profile.avatarType,
      avatarPresetId: profile.avatarPresetId,
      avatarCustomUrl: profile.avatarCustomUrl || null,
    })
    setErrors({})
  }

  // Handle Image Upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Quick size validation (max 5MB for local prototype)
    if (file.size > 5 * 1024 * 1024) {
      alert('Photo must be less than 5MB.')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string
      if (dataUrl) {
        setFormData((prev) => ({
          ...prev,
          avatarType: 'upload' as AvatarType,
          avatarCustomUrl: dataUrl,
        }))
      }
    }
    reader.readAsDataURL(file)
  }

  const handleRemovePhoto = () => {
    setFormData((prev) => ({
      ...prev,
      avatarType: 'preset',
      avatarCustomUrl: null,
    }))
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Save changes
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate required fields
    const newErrors: { fullName?: string } = {}
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    setIsSubmitting(true)

    try {
      await updateProfile({
        fullName: formData.fullName,
        displayName: formData.displayName,
        bio: formData.bio,
        avatarType: formData.avatarType,
        avatarPresetId: formData.avatarPresetId,
        avatarCustomUrl: formData.avatarCustomUrl,
      })

      setIsEditing(false)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3500)
    } catch (err) {
      console.error('Failed to update profile:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Sign out handler
  const handleConfirmSignOut = () => {
    setShowSignOutModal(false)
    signOut()
    navigate('/welcome', { replace: true })
  }

  return {
    profile,
    isEditing,
    setIsEditing,
    saveSuccess,
    formData,
    setFormData,
    errors,
    showDiscardModal,
    setShowDiscardModal,
    showSignOutModal,
    setShowSignOutModal,
    isSubmitting,
    fileInputRef,
    isDirty,
    handleStartEditing,
    handleCancel,
    confirmDiscard,
    handleFileChange,
    handleRemovePhoto,
    handleSave,
    handleConfirmSignOut,
  }
}

