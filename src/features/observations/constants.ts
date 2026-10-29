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

