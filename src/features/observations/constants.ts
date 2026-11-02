export const SPECIES_GROUPS = [
  'Mammals',
  'Birds',
  'Reptiles',
  'Amphibians',
  'Fish',
  'Insects',
  'Arachnids',
  'Crustaceans',
  'Molluscs',
  'Plants',
  'Fungi',
  'Algae',
  'Arthropods',
  'Other',
  'Unknown',
] as const

export type SpeciesGroup = (typeof SPECIES_GROUPS)[number]

// Ecological details / population status constants

export const HABITAT_TYPES = [
  'Aquatic',
  'Forest',
  'Grassland',
  'Agricultural',
  'Rocky patch',
  'Urban',
] as const

export type HabitatType = (typeof HABITAT_TYPES)[number]

export const ECOLOGICAL_LIFE_STAGES = [
  'Egg',
  'Juvenile',
  'Adult',
] as const

export type EcologicalLifeStage = (typeof ECOLOGICAL_LIFE_STAGES)[number]

export const REPRODUCTIVE_ATTRIBUTES = [
  'Flower',
  'Flower bud',
  'Breeding plumage',
  'Presence of eggs',
  'Nest present',
  'Breeding activity',
] as const

export type ReproductiveAttribute = (typeof REPRODUCTIVE_ATTRIBUTES)[number]

export const SEX_OPTIONS = [
  'Cannot be determined',
  'Female',
  'Male',
] as const

export type SexOption = (typeof SEX_OPTIONS)[number]

export const EVIDENCE_OF_PRESENCE = [
  'Bone',
  'Construction',
  'Egg',
  'Molt',
  'Organism',
  'Scat',
  'Track',
] as const

export type EvidenceOfPresence = (typeof EVIDENCE_OF_PRESENCE)[number]

export const SEASONS = [
  'Premonsoon',
  'Monsoon',
  'Post monsoon',
] as const

export type Season = (typeof SEASONS)[number]
