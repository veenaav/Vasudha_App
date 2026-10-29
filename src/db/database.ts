import Dexie, { type Table } from 'dexie'

export type IdentificationStatus = 'Identified' | 'Unknown' | 'Needs verification'

export type OrganismStatus = 'Wild' | 'Captive' | 'Cultivated' | 'Unknown / Not sure'

export const ORGANISM_STATUSES: OrganismStatus[] = [
  'Wild',
  'Captive',
  'Cultivated',
  'Unknown / Not sure',
]

/**
 * Controls how the exact coordinates of an observation may be shared.
 * NOTE: This preference is stored locally. Enforcement against public viewers
 * requires a future backend and role-based access system.
 */
export type LocationVisibility = 'Open' | 'Obscured' | 'Private'

export const LOCATION_VISIBILITIES: {
  value: LocationVisibility
  label: string
  description: string
}[] = [
  {
    value: 'Open',
    label: 'Open',
    description: 'Exact coordinates may be shared with permitted viewers.',
  },
  {
    value: 'Obscured',
    label: 'Obscured',
    description: 'Public views should show an approximate location only — not exact coordinates.',
  },
  {
    value: 'Private',
    label: 'Private',
    description: 'Exact coordinates must not be shown to public viewers.',
  },
]

export type SyncStatus = 'draft' | 'pending' | 'synced'

export type LocationSource = 'GPS' | 'Manual Pin Adjustment'

export const LOCATION_SOURCES: LocationSource[] = ['GPS', 'Manual Pin Adjustment']

/**
 * Darwin Core basisOfRecord standard terms:
 * Identifies the nature of the evidence represented by each biodiversity record.
 */
export type BasisOfRecord =
  | 'HumanObservation'
  | 'MachineObservation'
  | 'PreservedSpecimen'
  | 'MaterialSample'
  | 'LivingSpecimen'
  | 'FossilSpecimen'
  | 'Literature'
  | 'Unknown'

export const BASIS_OF_RECORD_OPTIONS: {
  value: BasisOfRecord
  label: string
  description: string
}[] = [
  {
    value: 'HumanObservation',
    label: 'Human Observation',
    description: 'Field sighting or visual/auditory detection by a human observer in nature.',
  },
  {
    value: 'MachineObservation',
    label: 'Machine Observation',
    description: 'Detection recorded automatically by sensor, camera trap, or automated sound recorder.',
  },
  {
    value: 'PreservedSpecimen',
    label: 'Preserved Specimen',
    description: 'Physical specimen preserved in a herbarium, museum collection, or archive.',
  },
  {
    value: 'MaterialSample',
    label: 'Material Sample',
    description: 'Biological sample such as tissue, blood, feather, hair, seed, or environmental DNA.',
  },
  {
    value: 'LivingSpecimen',
    label: 'Living Specimen',
    description: 'Live organism maintained in a botanical garden, zoo, nursery, or culture collection.',
  },
  {
    value: 'FossilSpecimen',
    label: 'Fossil Specimen',
    description: 'Preserved remains, imprint, or trace of an organism from a past geological period.',
  },
  {
    value: 'Literature',
    label: 'Literature',
    description: 'Record transcribed from a published scientific paper, book, flora/fauna checklist, or report.',
  },
  {
    value: 'Unknown',
    label: 'Unknown',
    description: 'Nature of evidence is unrecorded or uncertain.',
  },
]

/**
 * Validates geographic coordinate bounds.
 * Latitude must be between -90 and 90, and longitude between -180 and 180.
 */
export function isValidCoordinate(
  latitude: number | null | undefined,
  longitude: number | null | undefined
): boolean {
  if (latitude === null || latitude === undefined || longitude === null || longitude === undefined) {
    return false
  }
  if (
    typeof latitude !== 'number' ||
    typeof longitude !== 'number' ||
    Number.isNaN(latitude) ||
    Number.isNaN(longitude)
  ) {
    return false
  }
  return latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180
}

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
  wardId?: string // Foreign key -> Ward.id (optional, preferred identifier from GIS boundary)
  wardName?: string // Administrative ward name for display (e.g. "Ward 14 – Palayam")
  projectId?: string // Foreign key -> Project.id (optional legacy / primary association)
  projectIds?: string[] // Optional multi-project association IDs

  // Species details
  speciesName: string // Common / English vernacular name
  scientificName?: string // Latin binomial (optional)
  localName?: string // Regional language / script (Malayalam etc.)
  speciesGroup?: string // Unified singular naming
  speciesGroups?: string // Temporary compatibility alias during transition
  otherSpeciesGroup?: string
  identificationStatus?: IdentificationStatus
  organismStatus?: OrganismStatus // Whether the organism is wild, captive, or cultivated
  locationVisibility?: LocationVisibility // Observer's preferred sharing level for coordinates
  basis_of_record: BasisOfRecord // Required Darwin Core evidence type (default: HumanObservation)
  tags?: string[] // Optional managed tags for classification, analysis, and filtering
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
  gps_latitude?: number | null // Raw browser geolocation latitude (or null if manual-only)
  gps_longitude?: number | null // Raw browser geolocation longitude (or null if manual-only)
  latitude: number | null // Final observation latitude
  longitude: number | null // Final observation longitude
  location_source?: LocationSource | null // 'GPS' | 'Manual Pin Adjustment'
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

    // Version 3: Index organismStatus (Wild/Captive/Cultivated) — existing rows without this field are unaffected
    this.version(3).stores({
      projects: 'id, name, status, syncStatus',
      wards: 'id, projectId, wardNumber, syncStatus',
      surveys: 'id, projectId, wardId, leadObserver, syncStatus',
      observations: 'id, surveyId, wardId, projectId, speciesName, speciesGroup, syncStatus, verificationStatus, organismStatus',
    })

    // Version 4: Index locationVisibility (Open/Obscured/Private) — existing rows without this field are unaffected
    this.version(4).stores({
      projects: 'id, name, status, syncStatus',
      wards: 'id, projectId, wardNumber, syncStatus',
      surveys: 'id, projectId, wardId, leadObserver, syncStatus',
      observations: 'id, surveyId, wardId, projectId, speciesName, speciesGroup, syncStatus, verificationStatus, organismStatus, locationVisibility',
    })

    // Version 5: Index location_source for auditability & safe backward-compatible migration
    this.version(5)
      .stores({
        projects: 'id, name, status, syncStatus',
        wards: 'id, projectId, wardNumber, syncStatus',
        surveys: 'id, projectId, wardId, leadObserver, syncStatus',
        observations:
          'id, surveyId, wardId, projectId, speciesName, speciesGroup, syncStatus, verificationStatus, organismStatus, locationVisibility, location_source',
      })
      .upgrade((tx) => {
        return tx
          .table('observations')
          .toCollection()
          .modify((obs: Observation) => {
            // Safely populate location_source and raw GPS for existing records
            if (obs.latitude !== null && obs.latitude !== undefined && obs.location_source === undefined) {
              obs.location_source = obs.accuracyMeters !== null ? 'GPS' : 'Manual Pin Adjustment'
              if (obs.location_source === 'GPS') {
                obs.gps_latitude = obs.latitude
                obs.gps_longitude = obs.longitude
              } else {
                obs.gps_latitude = null
                obs.gps_longitude = null
              }
            }
          })
      })

    // Version 6: Index basis_of_record and multi-entry *tags; safe backward-compatible migration
    this.version(6)
      .stores({
        projects: 'id, name, status, syncStatus',
        wards: 'id, projectId, wardNumber, syncStatus',
        surveys: 'id, projectId, wardId, leadObserver, syncStatus',
        observations:
          'id, surveyId, wardId, projectId, speciesName, speciesGroup, syncStatus, verificationStatus, organismStatus, locationVisibility, location_source, basis_of_record, *tags',
      })
      .upgrade((tx) => {
        return tx
          .table('observations')
          .toCollection()
          .modify((obs: Observation) => {
            // Safe backward-compatible default for legacy records:
            // Existing field observations default to HumanObservation
            if (!obs.basis_of_record) {
              obs.basis_of_record = 'HumanObservation'
            }
            if (!obs.tags) {
              obs.tags = []
            }
          })
      })

    // Version 7: Index multi-entry *projectIds for multiple project associations
    this.version(7)
      .stores({
        projects: 'id, name, status, syncStatus',
        wards: 'id, projectId, wardNumber, syncStatus',
        surveys: 'id, projectId, wardId, leadObserver, syncStatus',
        observations:
          'id, surveyId, wardId, projectId, *projectIds, speciesName, speciesGroup, syncStatus, verificationStatus, organismStatus, locationVisibility, location_source, basis_of_record, *tags',
      })
      .upgrade((tx) => {
        return tx
          .table('observations')
          .toCollection()
          .modify((obs: Observation) => {
            // Safe backward-compatible population of projectIds array from legacy projectId
            if (!obs.projectIds) {
              obs.projectIds = obs.projectId ? [obs.projectId] : []
            }
          })
      })
  }
}

export const db = new ShrishtiDatabase()

// Backward-compatible alias for existing imports
export { ShrishtiDatabase as VasudhaDatabase }