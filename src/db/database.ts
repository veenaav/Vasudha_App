import Dexie, { type Table } from 'dexie'

export type IdentificationStatus = 'Identified' | 'Unknown' | 'Needs verification'

export type SyncStatus = 'draft' | 'pending' | 'synced'

export type VerificationStatus = 'Unreviewed' | 'Validated' | 'Flagged'

export type YesNo = 'Yes' | 'No'

// Predefined micro-habitat options
export const MICRO_HABITATS = [
  'Tree Canopy',
  'Tree Trunk / Bark',
  'Leaf Undersurface',
  'Ground / Floor',
  'Floating on Water',
  'Submerged in Water',
  'Wall / Building Crevice',
  'In Flight',
  'Other',
] as const

export type MicroHabitat = (typeof MICRO_HABITATS)[number]

// Predefined life stage options accommodating plants, insects, birds, and animals
export const LIFE_STAGES = [
  'Adult',
  'Juvenile / Chick',
  'Larva / Caterpillar',
  'Egg',
  'Seedling',
  'Flowering',
  'Fruiting',
  'Dead / Specimen',
] as const

export type LifeStage = (typeof LIFE_STAGES)[number]

// Predefined traditional knowledge source categories
export const TRADITIONAL_KNOWLEDGE_SOURCES = [
  'Local community member',
  'Traditional healer / practitioner',
  'Elder / knowledgeable local resident',
  'Indigenous community member',
  "People's Biodiversity Register (PBR) / documented local record",
  'Published literature / documented source',
  'Other',
] as const

export type TraditionalKnowledgeSource = (typeof TRADITIONAL_KNOWLEDGE_SOURCES)[number]

/**
 * 1. Project Entity
 * Represents an overall biodiversity survey initiative or campaign.
 */
export interface Project {
  id: string // UUID
  name: string
  description?: string
  startDate?: string
  status: 'active' | 'completed' | 'archived'
  organization?: string // Organizing body (e.g. "Kerala State Biodiversity Board", "City Corporation")
  targetRegion?: string // Target geographic district or city (e.g. "Thiruvananthapuram District")
  createdAt: string
  updatedAt: string
  syncStatus: SyncStatus
}

/**
 * 2. Ward Entity
 * Represents an administrative municipal ward or geographic subdivision within a project.
 */
export interface Ward {
  id: string // UUID
  projectId: string // Foreign key -> Project.id
  wardNumber: string
  wardName: string
  localBodyName?: string // Municipal Corporation / Grama Panchayat name
  district?: string // District name (e.g. "Thiruvananthapuram")
  state?: string // State name (e.g. "Kerala")
  keyLandmarks?: string // Familiar local landmarks helping surveyors verify location
  createdAt: string
  updatedAt: string
  syncStatus: SyncStatus
}

/**
 * 3. Survey / Field Visit Entity (Darwin Core Event)
 * Represents a single field outing or sampling session conducted in a specific ward.
 */
export interface Survey {
  id: string // UUID
  projectId: string // Foreign key -> Project.id
  wardId: string // Foreign key -> Ward.id
  leadObserver: string
  teamMembers?: string[]
  surveyMethod?: string // e.g., 'Opportunistic', 'Line Transect', 'Point Count'
  habitatType?: string // e.g., 'Urban Park', 'Wetland', 'Home Garden'
  targetGroup?: string // Focus group e.g. 'All Biodiversity', 'Birds only', 'Flora only'
  startTime: string // ISO timestamp
  endTime?: string // ISO timestamp
  weatherNotes?: string
  createdAt: string
  updatedAt: string
  syncStatus: SyncStatus
}

/**
 * 4. Observation Entity (Darwin Core Occurrence)
 * Represents an individual species sighting or organism record.
 */
export interface Observation {
  id?: string // UUID primary key
  surveyId?: string // Foreign key -> Survey.id (optional for standalone observations)
  wardId?: string // Foreign key -> Ward.id (optional)
  projectId?: string // Foreign key -> Project.id (optional)

  // Species details
  speciesName: string // Common / English vernacular name
  scientificName?: string // Latin binomial (optional)
  localName?: string // Regional language / script (Malayalam etc.)
  speciesGroup?: string // Unified singular naming
  speciesGroups?: string // Temporary compatibility alias during transition
  otherSpeciesGroup?: string
  identificationStatus?: IdentificationStatus
  notes: string

  // Abundance & Ecology
  individualCount?: number // Number of individuals observed (default 1, positive integer)
  lifeStage?: string // Life stage (Adult, Juvenile, Flowering, etc.)
  microHabitat?: string // Specific substrate/location (Tree Canopy, Ground, etc.)
  otherMicroHabitat?: string // Custom micro-habitat when 'Other' selected

  // Traditional Knowledge documentation
  hasTraditionalKnowledge?: YesNo // 'Yes' | 'No' (optional overall)
  traditionalKnowledgeSource?: string // Selected source category (required if Yes)
  otherTraditionalKnowledgeSource?: string // Custom source description (required if Other)

  // Spatial & Geolocation (Darwin Core Location)
  latitude: number | null
  longitude: number | null
  accuracyMeters: number | null // Actual GPS accuracy radius in metres (or null if unavailable)

  // Temporal (Darwin Core Event)
  observationAt: string
  recordedAt: string

  // Media attachments
  photo?: Blob | null
  photos?: Blob[]

  // Expert Verification (Post-MVP / future review)
  verificationStatus?: VerificationStatus // Defaults to 'Unreviewed'
  verifiedBy?: string
  verificationNotes?: string

  // Offline sync & audit metadata
  syncStatus?: SyncStatus
  createdAt?: string
  updatedAt?: string
}

/**
 * ShrishtiDatabase: IndexedDB local database instance.
 * Uses string UUID keys to prevent ID collisions during multi-device offline collection.
 */
export class ShrishtiDatabase extends Dexie {
  projects!: Table<Project, string>
  wards!: Table<Ward, string>
  surveys!: Table<Survey, string>
  observations!: Table<Observation, string>

  constructor() {
    super('ShrishtiDatabase')

    this.version(1).stores({
      projects: 'id, name, status, syncStatus',
      wards: 'id, projectId, wardNumber, syncStatus',
      surveys: 'id, projectId, wardId, leadObserver, syncStatus',
      observations: 'id, surveyId, wardId, projectId, speciesName, speciesGroup, syncStatus',
    })

    // Version 2: Index verificationStatus for future quality review while preserving all existing data
    this.version(2).stores({
      projects: 'id, name, status, syncStatus',
      wards: 'id, projectId, wardNumber, syncStatus',
      surveys: 'id, projectId, wardId, leadObserver, syncStatus',
      observations: 'id, surveyId, wardId, projectId, speciesName, speciesGroup, syncStatus, verificationStatus',
    })
  }
}

export const db = new ShrishtiDatabase()

// Backward-compatible alias for existing imports
export { ShrishtiDatabase as VasudhaDatabase }