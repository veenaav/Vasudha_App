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
  | 'Habitat'
  | 'Ecological role'
  | 'Activity or behaviour'
  | 'Conservation'
  | 'Observation context'

export interface Tag {
  id: string // Stable unique identifier (e.g. 'eco_pollinator')
  label: string // Display label (e.g. 'Pollinator')
  category: TagCategory
  description?: string
}

export const TAG_CATEGORIES: TagCategory[] = [
  'Habitat',
  'Ecological role',
  'Activity or behaviour',
  'Conservation',
  'Observation context',
]

export const MANAGED_TAGS: Tag[] = [
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
 * Look up a tag by its stable ID.
 */
export function getTagById(id: string): Tag | undefined {
  return MANAGED_TAGS.find((t) => t.id === id)
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
    Habitat: [],
    'Ecological role': [],
    'Activity or behaviour': [],
    Conservation: [],
    'Observation context': [],
  }

  for (const tag of MANAGED_TAGS) {
    result[tag.category].push(tag)
  }

  return result
}
