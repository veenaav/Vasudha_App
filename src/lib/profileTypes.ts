/**
 * Profile data types and interfaces for B-Liffe.
 * 
 * NOTE: The backend, database, and real authentication system have not yet
 * been implemented. These types define the contract for the frontend UI state
 * and temporary localStorage storage, designed for seamless replacement with
 * real REST/GraphQL API endpoints in future releases.
 */

export type AvatarPresetId =
  | 'user'
  | 'bird'
  | 'frog'
  | 'elephant'
  | 'turtle'
  | 'squirrel'
  | 'butterfly'
  | 'leaf'



export type AvatarType = 'preset' | 'upload'

export interface UserProfile {
  id: string
  fullName: string
  displayName: string
  email: string
  bio: string
  avatarType: AvatarType
  avatarPresetId: AvatarPresetId
  avatarCustomUrl?: string | null
  updatedAt: string
}

export interface ProfileUpdateInput {
  fullName: string
  displayName?: string
  bio?: string
  avatarType: AvatarType
  avatarPresetId: AvatarPresetId
  avatarCustomUrl?: string | null
}
