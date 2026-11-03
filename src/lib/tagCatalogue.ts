/**
 * Managed Tag Catalogue for Biodiversity Observations
 * Controlled taxonomy of approved tags categorized by:
 * - Habitat
 * - Ecological role
 * - Activity or behaviour
 * - Conservation
 * - Observation context
 *
 * Ordinary users select from this approved catalogue to prevent duplicate/uncontrolled tags.
 */

export type TagCategory =
  | 'Species group'
  | 'Habitat'
  | 'Ecological role'
  | 'Activity or behaviour'
  | 'Conservation'
  | 'Observation context'
  | 'General'

export interface Tag {
  id: string // Stable unique identifier (e.g. 'eco_pollinator')
  label: string // Display label (e.g. 'Pollinator')
  category: TagCategory
  description?: string
}

export const TAG_CATEGORIES: TagCategory[] = [
  'Species group',
  'Habitat',
  'Ecological role',
  'Activity or behaviour',
  'Conservation',
  'Observation context',
]

export const MANAGED_TAGS: Tag[] = [
  // 0. Species Groups & Common Taxa
  {
    id: 'grp_birds',
    label: 'Birds',
    category: 'Species group',
    description: 'Avian fauna: songbirds, raptors, waterbirds, waders, and seabirds.',
  },
  {
    id: 'grp_mammals',
    label: 'Mammals',
    category: 'Species group',
    description: 'Mammalian wildlife including bats, rodents, primates, ungulates, and carnivores.',
  },
  {
    id: 'grp_amphibians',
    label: 'Amphibians',
    category: 'Species group',
    description: 'Frogs, toads, caecilians, and salamanders.',
  },
  {
    id: 'grp_reptiles',
    label: 'Reptiles',
    category: 'Species group',
    description: 'Snakes, lizards, skinks, geckos, turtles, tortoises, and crocodilians.',
  },
  {
    id: 'grp_flora',
    label: 'Flora',
    category: 'Species group',
    description: 'Flowering plants, trees, shrubs, herbs, ferns, and grasses.',
  },
  {
    id: 'grp_insects',
    label: 'Insects',
    category: 'Species group',
    description: 'Butterflies, moths, beetles, dragonflies, bees, ants, and other hexapods.',
  },
  {
    id: 'grp_arachnids',
    label: 'Arachnids',
    category: 'Species group',
    description: 'Spiders, scorpions, harvestmen, ticks, and mites.',
  },
  {
    id: 'grp_fungi',
    label: 'Fungi',
    category: 'Species group',
    description: 'Mushrooms, brackets, polypores, lichens, and molds.',
  },
  {
    id: 'grp_fish',
    label: 'Fish',
    category: 'Species group',
    description: 'Freshwater, estuarine, or marine ichthyofauna.',
  },

  // 1. Habitat
  {
    id: 'hab_urban_park',
    label: 'Urban Park / Garden',
    category: 'Habitat',
    description: 'City parks, roadside trees, home gardens, or institutional campuses.',
  },
  {
    id: 'hab_sacred_grove',
    label: 'Sacred Grove (Kavu)',
    category: 'Habitat',
    description: 'Traditional conserved biodiversity relict or sacred grove.',
  },
  {
    id: 'hab_wetland',
    label: 'Wetland / Marsh',
    category: 'Habitat',
    description: 'Freshwater marsh, pond, lake edge, or waterlogged depression.',
  },
  {
    id: 'hab_mangrove',
    label: 'Mangrove / Estuary',
    category: 'Habitat',
    description: 'Brackish water, mangrove swamp, tidal creek, or backwater.',
  },
  {
    id: 'hab_paddy_field',
    label: 'Paddy Field',
    category: 'Habitat',
    description: 'Cultivated or fallow rice field ecosystem.',
  },
  {
    id: 'hab_forest_fragment',
    label: 'Forest Fragment',
    category: 'Habitat',
    description: 'Remnant patch of natural evergreen, semi-evergreen, or deciduous forest.',
  },
  {
    id: 'hab_riverbank',
    label: 'Riverbank / Riparian',
    category: 'Habitat',
    description: 'Riverbanks, streams, canals, or riparian corridors.',
  },
  {
    id: 'hab_coastal',
    label: 'Coastal / Beach',
    category: 'Habitat',
    description: 'Coastal dunes, sandy beach, rocky shoreline, or intertidal zone.',
  },

  // 2. Ecological role
  {
    id: 'eco_pollinator',
    label: 'Pollinator',
    category: 'Ecological role',
    description: 'Organism visiting flowers and aiding in pollen transfer (bees, butterflies, sunbirds, bats).',
  },
  {
    id: 'eco_seed_disperser',
    label: 'Seed Disperser',
    category: 'Ecological role',
    description: 'Organism that consumes fruits and disperses seeds across habitats (frugivorous birds, civets).',
  },
  {
    id: 'eco_apex_predator',
    label: 'Apex Predator / Raptor',
    category: 'Ecological role',
    description: 'Top carnivore or raptor regulating prey populations (eagles, owls, snakes, large carnivores).',
  },
  {
    id: 'eco_scavenger',
    label: 'Scavenger / Decomposer',
    category: 'Ecological role',
    description: 'Organism feeding on carrion or decaying organic matter (crows, beetles, fungi).',
  },
  {
    id: 'eco_epiphyte',
    label: 'Epiphyte / Parasite',
    category: 'Ecological role',
    description: 'Plant growing on another host tree without soil roots (orchids, ferns, loranthus).',
  },
  {
    id: 'eco_bioindicator',
    label: 'Bioindicator',
    category: 'Ecological role',
    description: 'Sensitive species indicating environmental quality or ecosystem health (lichens, dragonflies, frogs).',
  },
  {
    id: 'eco_keystone',
    label: 'Keystone Species',
    category: 'Ecological role',
    description: 'Species having a disproportionately large effect on its natural environment relative to abundance.',
  },

  // 3. Activity or behaviour
  {
    id: 'act_nesting',
    label: 'Nesting / Breeding',
    category: 'Activity or behaviour',
    description: 'Active nesting, brooding, egg-laying, or parental care observed.',
  },
  {
    id: 'act_foraging',
    label: 'Foraging / Feeding',
    category: 'Activity or behaviour',
    description: 'Actively searching for, hunting, grazing, or consuming food.',
  },
  {
    id: 'act_roosting',
    label: 'Roosting / Resting',
    category: 'Activity or behaviour',
    description: 'Communal or solitary resting, sleeping, or perching.',
  },
  {
    id: 'act_mating_call',
    label: 'Calling / Territorial Display',
    category: 'Activity or behaviour',
    description: 'Mating call, territorial song, alarm vocalization, or visual display.',
  },
  {
    id: 'act_in_flight',
    label: 'In Flight / Moving',
    category: 'Activity or behaviour',
    description: 'Sighted flying overhead, swimming, or actively travelling.',
  },
  {
    id: 'act_basking',
    label: 'Basking / Sunning',
    category: 'Activity or behaviour',
    description: 'Sunning behavior for thermoregulation (lizards, turtles, butterflies).',
  },

  // 4. Conservation
  {
    id: 'con_endemic_western_ghats',
    label: 'Endemic to Western Ghats',
    category: 'Conservation',
    description: 'Geographically restricted exclusively to the Western Ghats biodiversity hotspot.',
  },
  {
    id: 'con_iucn_threatened',
    label: 'IUCN Threatened (VU/EN/CR)',
    category: 'Conservation',
    description: 'Classified as Vulnerable, Endangered, or Critically Endangered on the IUCN Red List.',
  },
  {
    id: 'con_schedule_1',
    label: 'Schedule I (Wild Life Act)',
    category: 'Conservation',
    description: 'Highest statutory legal protection under the Indian Wild Life (Protection) Act.',
  },
  {
    id: 'con_invasive',
    label: 'Invasive Alien Species',
    category: 'Conservation',
    description: 'Non-native species causing ecological displacement (e.g. Lantana, African Snail, Water Hyacinth).',
  },
  {
    id: 'con_medicinal',
    label: 'Medicinal / Ethnobotanical Value',
    category: 'Conservation',
    description: 'Species with documented Ayurvedic, Siddha, or folk medicinal significance.',
  },
  {
    id: 'con_rare_sighting',
    label: 'Rare Sighting',
    category: 'Conservation',
    description: 'Unusual, out-of-season, or geographically unexpected record for this locality.',
  },

  // 5. Observation context
  {
    id: 'ctx_night_survey',
    label: 'Night Survey / Nocturnal',
    category: 'Observation context',
    description: 'Recorded during after-dark nocturnal surveys (moths, bats, frogs, owls).',
  },
  {
    id: 'ctx_monsoon',
    label: 'Monsoon Flush / Season',
    category: 'Observation context',
    description: 'Recorded during peak monsoon rains or monsoon seasonal emergence.',
  },
  {
    id: 'ctx_citizen_science',
    label: 'Citizen Science Drive',
    category: 'Observation context',
    description: 'Recorded as part of a public bio-blitz, bird race, or community survey.',
  },
  {
    id: 'ctx_student_project',
    label: 'Student / Academic Project',
    category: 'Observation context',
    description: 'Logged during school, college, or university biodiversity documentation fieldwork.',
  },
  {
    id: 'ctx_post_flood',
    label: 'Post-Disturbance Recovery',
    category: 'Observation context',
    description: 'Documenting habitat recolonization after flooding, cyclone, or clearing.',
  },
]

/**
 * Look up a tag by its stable ID, label, or preserved user tag.
 */
export function getTagById(id: string): Tag | undefined {
  if (!id) return undefined
  // 1. Direct match on id
  const byId = MANAGED_TAGS.find((t) => t.id === id)
  if (byId) return byId

  // 2. Normalized match (strip leading '#', check label or id case-insensitively)
  const clean = id.trim().replace(/^#/, '')
  const cleanLower = clean.toLowerCase()

  // Match common alias for Flora <-> Plants
  if (cleanLower === 'plants' || cleanLower === 'plant') {
    return MANAGED_TAGS.find((t) => t.id === 'grp_flora')
  }

  const byLabel = MANAGED_TAGS.find(
    (t) => t.label.toLowerCase() === cleanLower || t.id.toLowerCase() === cleanLower
  )
  if (byLabel) return byLabel

  // 3. Fallback for custom user tags (preserve user tags without ever wiping or losing them)
  return {
    id,
    label: clean,
    category: 'General',
  }
}

/**
 * Filter tags by text query across labels and descriptions.
 */
export function searchTags(query: string): Tag[] {
  if (!query.trim()) return MANAGED_TAGS
  const q = query.toLowerCase().trim()
  return MANAGED_TAGS.filter(
    (t) =>
      t.label.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q) ||
      (t.description && t.description.toLowerCase().includes(q))
  )
}

/**
 * Group tags by category.
 */
export function getTagsByCategory(): Record<TagCategory, Tag[]> {
  const result: Record<TagCategory, Tag[]> = {
    'Species group': [],
    Habitat: [],
    'Ecological role': [],
    'Activity or behaviour': [],
    Conservation: [],
    'Observation context': [],
    General: [],
  }

  for (const tag of MANAGED_TAGS) {
    if (result[tag.category]) {
      result[tag.category].push(tag)
    }
  }

  return result
}
