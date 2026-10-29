import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  Edit3,
  Mail,
  User as UserIcon,
  Camera,
  Check,
  X,
  LogOut,
  Info,
  AlertTriangle,
  Sparkles,
  Trash2,
  Upload,
} from 'lucide-react'
import AvatarDisplay from '@/components/profile/AvatarDisplay'
import { AVATAR_PRESETS, renderPresetIcon } from '@/lib/avatarPresets'
import type { AvatarPresetId } from '@/lib/profileTypes'
import { useProfileForm } from '@/features/profile/hooks/useProfileForm'

export default function ProfilePage() {
  const {
    profile,
    isEditing,
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
    handleStartEditing,
    handleCancel,
    confirmDiscard,
    handleFileChange,
    handleRemovePhoto,
    handleSave,
    handleConfirmSignOut,
  } = useProfileForm()

  return (
    <div className="mx-auto max-w-2xl px-4 py-5 sm:px-6 sm:py-8 space-y-6">
      {/* Top Navigation Bar with Back Arrow & Title */}
      <div className="flex items-center justify-between">
        <Link
          to="/home"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#1C4D3C] bg-[#0D2D22] text-[#B2C8BA] hover:bg-[#133D2F] hover:text-[#F0F5EF] transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#A6F16A]"
          aria-label="Back to Home"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>

        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          My Profile
        </h1>

        {/* Temporary Frontend Badge */}
        <div className="inline-flex items-center gap-1.5 rounded-full border border-[#1C4D3C] bg-[#0D2D22]/80 px-2.5 py-1 text-[11px] font-medium text-[#A6F16A]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#A6F16A] animate-pulse" />
          <span>Demo Session</span>
        </div>
      </div>

      {/* Success Banner */}
      {saveSuccess && (
        <div className="flex items-center gap-3 rounded-2xl border border-[#20D6A0]/40 bg-[#0D2D22] p-4 text-[#F0F5EF] shadow-lg animate-in fade-in duration-300">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#20D6A0]/20 text-[#20D6A0]">
            <Check className="h-4.5 w-4.5" />
          </div>
          <div className="text-sm">
            <span className="font-semibold text-white">Profile updated successfully!</span>
            <p className="text-xs text-[#B2C8BA] mt-0.5">
              Your temporary changes are now displayed across B-Liffe.
            </p>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW MODE: PROFILE OVERVIEW
         ========================================================================= */}
      {!isEditing && (
        <div className="space-y-6">
          {/* Main Profile Card */}
          <div className="relative overflow-hidden rounded-3xl border border-[#1C4D3C] bg-gradient-to-b from-[#0D2D22] to-[#08221A] p-6 sm:p-8 shadow-xl">
            {/* Subtle nature radial glow in the background */}
            <div className="pointer-events-none absolute -top-12 -right-12 h-44 w-44 rounded-full bg-[#A6F16A]/10 blur-3xl" />

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
              {/* Selected Avatar Container with Overlaid Camera Button */}
              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={handleStartEditing}
                  className="relative block rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 cursor-pointer"
                  title="Click to edit avatar and profile"
                  aria-label="Click to edit avatar and profile"
                >
                  <AvatarDisplay
                    avatarType={profile.avatarType}
                    avatarPresetId={profile.avatarPresetId}
                    avatarCustomUrl={profile.avatarCustomUrl}
                    size="xl"
                    className="hover:border-emerald-300 transition-all duration-200"
                    alt={`${profile.fullName}'s profile avatar`}
                  />
                </button>
                <button
                  type="button"
                  onClick={handleStartEditing}
                  className="absolute bottom-0 right-0 flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-[#0A261D] bg-[#133D2F] text-emerald-400 shadow-md hover:bg-[#1C4D3C] hover:text-emerald-300 hover:scale-105 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer"
                  title="Change profile avatar"
                  aria-label="Change profile avatar"
                >
                  <Camera className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                </button>
              </div>

              {/* User Overview Information */}
              <div className="flex-1 space-y-2 min-w-0">
                <div className="space-y-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                      {profile.fullName}
                    </h2>
                    {profile.displayName && (
                      <span className="inline-flex items-center self-center sm:self-auto rounded-full bg-[#133D2F] px-2.5 py-0.5 text-xs font-medium text-[#A6F16A] border border-[#1C4D3C]">
                        @{profile.displayName}
                      </span>
                    )}
                  </div>

                  {profile.email && (
                    <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs sm:text-sm text-[#B2C8BA]">
                      <Mail className="h-4 w-4 text-[#7B9586]" />
                      <span>{profile.email}</span>
                    </div>
                  )}
                </div>

                {/* Short Bio */}
                <p className="text-xs sm:text-sm text-[#D1E2D7] leading-relaxed pt-1.5 max-w-lg">
                  {profile.bio || 'No personal bio added yet. Click edit to add a short introduction!'}
                </p>

                {/* Edit Profile Action Button */}
                <div className="pt-4">
                  <button
                    type="button"
                    onClick={handleStartEditing}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#A6F16A] to-[#20D6A0] px-5 py-2.5 text-sm font-bold text-[#061812] shadow-md shadow-[#20D6A0]/15 hover:shadow-[#A6F16A]/25 transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#A6F16A] cursor-pointer"
                  >
                    <Edit3 className="h-4 w-4" />
                    <span>Edit Profile</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Naturalist Stats & Status (Frontend Demonstration) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="rounded-2xl border border-[#1C4D3C] bg-[#0D2D22]/60 p-4">
              <span className="text-xs text-[#7B9586] block">Biodiversity Role</span>
              <span className="text-sm font-semibold text-white mt-1 block">Field Naturalist</span>
              <span className="text-[11px] text-[#A6F16A] block mt-0.5">Volunteer Level 1</span>
            </div>
            <div className="rounded-2xl border border-[#1C4D3C] bg-[#0D2D22]/60 p-4">
              <span className="text-xs text-[#7B9586] block">Selected Avatar</span>
              <span className="text-sm font-semibold text-white mt-1 block capitalize">
                {profile.avatarType === 'upload' ? 'Custom Photo' : AVATAR_PRESETS[profile.avatarPresetId]?.name || 'Standard'}
              </span>
              <span className="text-[11px] text-[#20D6A0] block mt-0.5">
                {profile.avatarType === 'upload' ? 'Uploaded file' : 'Biodiversity theme'}
              </span>
            </div>
            <div className="col-span-2 sm:col-span-1 rounded-2xl border border-[#1C4D3C] bg-[#0D2D22]/60 p-4">
              <span className="text-xs text-[#7B9586] block">Frontend Session</span>
              <span className="text-sm font-semibold text-white mt-1 block">Local Prototype</span>
              <span className="text-[11px] text-[#B2C8BA] block mt-0.5">Ready for Backend API</span>
            </div>
          </div>

          {/* Account Actions Section */}
          <div className="rounded-2xl border border-[#1C4D3C] bg-[#0D2D22]/40 p-5 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#B2C8BA]">
              Account Actions
            </h3>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <div>
                <p className="text-sm font-medium text-white">Sign Out from Demo</p>
                <p className="text-xs text-[#7B9586]">
                  Clears the temporary local session and returns to the welcome screen.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowSignOutModal(true)}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/40 bg-red-950/20 px-4 py-2.5 text-xs sm:text-sm font-semibold text-red-300 hover:bg-red-900/30 hover:border-red-500/60 transition-all active:scale-95 cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {/* Future Backend Notice */}
          <div className="rounded-2xl border border-[#1C4D3C]/70 bg-[#061812]/80 p-4 text-xs text-[#B2C8BA] flex items-start gap-3">
            <Info className="h-5 w-5 text-[#20D6A0] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-white">Backend Integration Notice</p>
              <p className="text-[#8FA799] leading-relaxed">
                The database, cloud syncing, and server authentication are not yet connected.
                This profile is maintained client-side in temporary localStorage for UI testing.
                No passwords or sensitive credentials are saved.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          EDIT MODE: PERSONAL INFORMATION FORM
         ========================================================================= */}
      {isEditing && (
        <form onSubmit={handleSave} className="space-y-6">
          <div className="rounded-3xl border border-[#1C4D3C] bg-[#0D2D22] p-5 sm:p-7 space-y-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#1C4D3C] pb-4">
              <div>
                <h2 className="text-lg font-bold text-white">Edit Personal Information</h2>
                <p className="text-xs text-[#B2C8BA]">
                  Update your name, greeting handle, bio, and biodiversity avatar.
                </p>
              </div>
              <button
                type="button"
                onClick={handleCancel}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#1C4D3C] bg-[#08221A] text-[#B2C8BA] hover:text-white cursor-pointer"
                aria-label="Close edit mode"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* 1. Avatar Selection Section */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-white">
                Profile Avatar
              </label>
              <p className="text-xs text-[#B2C8BA]">
                Choose a biodiversity-themed avatar or upload your own photo.
              </p>

              {/* Current Preview with Overlaid Edit/Camera Button */}
              <div className="flex items-center gap-4 rounded-2xl border border-[#1C4D3C] bg-[#08221A] p-3.5">
                <div
                  className="relative shrink-0 cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                  title="Click to upload custom photo"
                >
                  <AvatarDisplay
                    avatarType={formData.avatarType}
                    avatarPresetId={formData.avatarPresetId}
                    avatarCustomUrl={formData.avatarCustomUrl}
                    size="lg"
                    className="hover:border-emerald-300 transition-all duration-200"
                  />
                  {/* Overlaid Camera Button on Avatar Frame */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      fileInputRef.current?.click()
                    }}
                    className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border border-[#0A261D] bg-[#133D2F] text-emerald-400 shadow-sm hover:bg-[#1C4D3C] hover:scale-105 active:scale-95 transition-all focus:outline-none focus:ring-1 focus:ring-emerald-400 cursor-pointer"
                    title="Upload custom photo"
                    aria-label="Upload photo"
                  >
                    <Camera className="h-3 w-3" />
                  </button>
                </div>

                <div className="min-w-0 flex-1">
                  <span className="text-xs text-[#7B9586] block">Active Avatar</span>
                  <span className="text-sm font-semibold text-white truncate block">
                    {formData.avatarType === 'upload'
                      ? 'Custom Photo'
                      : AVATAR_PRESETS[formData.avatarPresetId]?.name || 'Default Person'}
                  </span>
                  <span className="text-[11px] text-[#A6F16A] block">
                    {formData.avatarType === 'upload'
                      ? 'Custom uploaded image'
                      : AVATAR_PRESETS[formData.avatarPresetId]?.subtitle}
                  </span>
                </div>

                {/* Photo Upload & Remove Buttons */}
                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="profile-photo-upload"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-[#1C4D3C] bg-[#133D2F] px-3 py-2 text-xs font-semibold text-[#A6F16A] hover:bg-[#1C4D3C] transition-all cursor-pointer"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    <span>Upload Photo</span>
                  </button>

                  {formData.avatarType === 'upload' && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="inline-flex items-center gap-1 rounded-xl border border-red-500/30 bg-red-950/20 p-2 text-xs font-semibold text-red-300 hover:bg-red-900/30 cursor-pointer"
                      title="Remove custom photo and use preset"
                      aria-label="Remove photo"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Preset Avatar Grid */}
              <div className="space-y-2 pt-1">
                <span className="text-xs font-medium text-[#7B9586] uppercase tracking-wider">
                  Biodiversity Themes
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {(Object.keys(AVATAR_PRESETS) as AvatarPresetId[]).map((presetId) => {
                    const preset = AVATAR_PRESETS[presetId]
                    const isSelected =
                      formData.avatarType === 'preset' && formData.avatarPresetId === presetId

                    return (
                      <button
                        key={presetId}
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            avatarType: 'preset',
                            avatarPresetId: presetId,
                          }))
                        }
                        className={`flex items-center gap-2.5 rounded-xl border p-2.5 text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#A6F16A] bg-[#133D2F] shadow-sm shadow-[#A6F16A]/20'
                            : 'border-[#1C4D3C] bg-[#08221A] hover:border-[#20D6A0]/50 hover:bg-[#0D2D22]'
                        }`}
                      >
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border overflow-hidden ${preset.borderColor} ${preset.bgColor} ${preset.textColor}`}
                        >
                          {preset.imageUrl ? (
                            <img
                              src={preset.imageUrl}
                              alt={preset.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            renderPresetIcon(presetId, 'h-4 w-4')
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <span
                            className={`block text-xs font-semibold truncate ${
                              isSelected ? 'text-[#A6F16A]' : 'text-white'
                            }`}
                          >
                            {preset.name}
                          </span>
                          <span className="block text-[10px] text-[#7B9586] truncate">
                            {preset.subtitle}
                          </span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* 2. Full Name Input (Required) */}
            <div className="space-y-1.5">
              <label htmlFor="fullName" className="block text-sm font-semibold text-white">
                Full Name <span className="text-[#A6F16A]">*</span>
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#7B9586]">
                  <UserIcon className="h-4 w-4" />
                </div>
                <input
                  id="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => {
                    setFormData({ ...formData, fullName: e.target.value })
                    if (errors.fullName) {
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                  }}
                  placeholder="e.g. Veena V"
                  className={`w-full rounded-xl border bg-[#08221A] py-2.5 pl-10 pr-4 text-sm text-white placeholder-[#526D5F] focus:outline-none focus:ring-2 ${
                    errors.fullName
                      ? 'border-red-500 focus:ring-red-500/50'
                      : 'border-[#1C4D3C] focus:border-[#A6F16A] focus:ring-[#A6F16A]/30'
                  }`}
                  aria-invalid={!!errors.fullName}
                  aria-describedby={errors.fullName ? 'fullName-error' : undefined}
                />
              </div>
              {errors.fullName && (
                <p id="fullName-error" className="text-xs text-red-400 mt-1 flex items-center gap-1">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>{errors.fullName}</span>
                </p>
              )}
            </div>

            {/* 3. Display Name Input */}
            <div className="space-y-1.5">
              <label htmlFor="displayName" className="block text-sm font-semibold text-white">
                Display Name (Greeting)
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#7B9586]">
                  <Sparkles className="h-4 w-4" />
                </div>
                <input
                  id="displayName"
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  placeholder="e.g. Veena"
                  className="w-full rounded-xl border border-[#1C4D3C] bg-[#08221A] py-2.5 pl-10 pr-4 text-sm text-white placeholder-[#526D5F] focus:border-[#A6F16A] focus:outline-none focus:ring-2 focus:ring-[#A6F16A]/30"
                />
              </div>
              <p className="text-[11px] text-[#7B9586]">
                Used for the personalised greeting on the Home screen (e.g. &quot;Hi,{' '}
                {formData.displayName || formData.fullName.split(' ')[0] || 'Naturalist'}!&quot;).
              </p>
            </div>

            {/* 4. Email (Informational / Read-Only in Demo) */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-semibold text-white">
                Email Address
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#7B9586]">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={profile.email}
                  disabled
                  className="w-full rounded-xl border border-[#1C4D3C]/50 bg-[#061812] py-2.5 pl-10 pr-4 text-sm text-[#7B9586] cursor-not-allowed"
                />
              </div>
              <p className="text-[11px] text-[#7B9586]">
                Email changes will be linked through your organization or identity provider when
                the backend authentication is active.
              </p>
            </div>

            {/* 5. Short Introduction / Bio */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="bio" className="block text-sm font-semibold text-white">
                  Short Introduction
                </label>
                <span className="text-[10px] text-[#7B9586]">
                  {formData.bio.length}/180 characters
                </span>
              </div>
              <div className="relative">
                <textarea
                  id="bio"
                  rows={3}
                  maxLength={180}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Share a short note about your biodiversity interests, local focus areas, or field experience..."
                  className="w-full rounded-xl border border-[#1C4D3C] bg-[#08221A] p-3 text-sm text-white placeholder-[#526D5F] focus:border-[#A6F16A] focus:outline-none focus:ring-2 focus:ring-[#A6F16A]/30 resize-none"
                />
              </div>
            </div>

            {/* Action Buttons: Save & Cancel */}
            <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-end gap-3 pt-3 border-t border-[#1C4D3C]">
              <button
                type="button"
                onClick={handleCancel}
                className="w-full sm:w-auto rounded-xl border border-[#1C4D3C] bg-[#08221A] px-5 py-2.5 text-sm font-semibold text-[#B2C8BA] hover:bg-[#133D2F] hover:text-white transition-all active:scale-95 cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#A6F16A] to-[#20D6A0] px-6 py-2.5 text-sm font-bold text-[#061812] shadow-md shadow-[#20D6A0]/20 hover:shadow-[#A6F16A]/30 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <Check className="h-4 w-4" />
                <span>{isSubmitting ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* =========================================================================
          CONFIRMATION DIALOG: DISCARD UNSAVED CHANGES
         ========================================================================= */}
      {showDiscardModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs animate-in fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="discard-title"
        >
          <div className="w-full max-w-sm rounded-3xl border border-[#1C4D3C] bg-[#08221A] p-6 text-center space-y-4 shadow-2xl">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/20 text-amber-300">
              <AlertTriangle className="h-6 w-6" />
            </div>

            <div className="space-y-1.5">
              <h3 id="discard-title" className="text-lg font-bold text-white">
                Discard unsaved changes?
              </h3>
              <p className="text-xs text-[#B2C8BA] leading-relaxed">
                You have modified your profile information. Exiting now will lose any unsaved edits.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDiscardModal(false)}
                className="flex-1 rounded-xl border border-[#1C4D3C] bg-[#0D2D22] py-2.5 text-xs font-semibold text-white hover:bg-[#133D2F] cursor-pointer"
              >
                Keep Editing
              </button>
              <button
                type="button"
                onClick={confirmDiscard}
                className="flex-1 rounded-xl bg-red-600 py-2.5 text-xs font-bold text-white hover:bg-red-700 active:scale-95 shadow-md cursor-pointer"
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          CONFIRMATION DIALOG: SIGN OUT
         ========================================================================= */}
      {showSignOutModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs animate-in fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="signout-title"
        >
          <div className="w-full max-w-sm rounded-3xl border border-[#1C4D3C] bg-[#08221A] p-6 text-center space-y-4 shadow-2xl">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20 text-red-300">
              <LogOut className="h-6 w-6" />
            </div>

            <div className="space-y-1.5">
              <h3 id="signout-title" className="text-lg font-bold text-white">
                Sign Out from Demo?
              </h3>
              <p className="text-xs text-[#B2C8BA] leading-relaxed">
                This will reset your temporary profile session and return you to the Welcome
                screen. Full authentication will be connected when backend services are ready.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowSignOutModal(false)}
                className="flex-1 rounded-xl border border-[#1C4D3C] bg-[#0D2D22] py-2.5 text-xs font-semibold text-white hover:bg-[#133D2F] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSignOut}
                className="flex-1 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 py-2.5 text-xs font-bold text-white hover:from-red-700 hover:to-rose-700 active:scale-95 shadow-md cursor-pointer"
              >
                Yes, Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
