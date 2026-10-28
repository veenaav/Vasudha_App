/**
 * Darwin Core (DwC) standard export utility.
 *
 * Mappings:
 * - Basis of Record -> dwc:basisOfRecord (Darwin Core vocabulary: HumanObservation, MachineObservation, PreservedSpecimen, MaterialSample, LivingSpecimen, FossilSpecimen, Literature, Unknown)
 * - Species / Common / Scientific names -> dwc:scientificName, dwc:vernacularName
 * - Coordinates -> dwc:decimalLatitude, dwc:decimalLongitude, dwc:coordinateUncertaintyInMeters
 * - Dates -> dwc:eventDate
 * - Ecology -> dwc:individualCount, dwc:lifeStage, dwc:habitat
 *
 * Custom Classification Tags & Extended Metadata:
 * Tags are project-specific classification tokens. They are NOT standard Darwin Core terms.
 * To avoid misrepresenting custom tags as Darwin Core standard terms, they are serialized
 * under `dwc:dynamicProperties` as valid JSON:
 *   dwc:dynamicProperties: JSON.stringify({
 *     tags: ["canopy-dwelling", "pollinator"],
 *     organismStatus: "Wild",
 *     locationVisibility: "Open",
 *     locationSource: "GPS"
 *   })
 */

import type { Observation } from '@/db/database'
import { getTagById } from './tagCatalogue'
import { generateId } from './utils'

export interface DarwinCoreRecord {
  'dwc:occurrenceID': string
  'dwc:basisOfRecord': string
  'dwc:scientificName'?: string
  'dwc:vernacularName'?: string
  'dwc:decimalLatitude': number | null
  'dwc:decimalLongitude': number | null
  'dwc:coordinateUncertaintyInMeters': number | null
  'dwc:eventDate': string
  'dwc:individualCount'?: number
  'dwc:lifeStage'?: string
  'dwc:habitat'?: string
  'dwc:fieldNotes'?: string
  'dwc:identificationVerificationStatus'?: string
  /**
   * Custom tags and non-standard project fields are encapsulated in dynamicProperties
   * so they are not misrepresented as standard Darwin Core vocabulary.
   */
  'dwc:dynamicProperties': string
}

export function toDarwinCoreRecord(obs: Observation): DarwinCoreRecord {
  const enrichedTags = (obs.tags || []).map((tagId) => {
    const info = getTagById(tagId)
    return {
      id: tagId,
      label: info?.label || tagId,
      category: info?.category || 'General',
    }
  })

  const dynamicProps = {
    tags: enrichedTags,
    organismStatus: obs.organismStatus,
    locationVisibility: obs.locationVisibility,
    locationSource: obs.location_source,
    hasTraditionalKnowledge: obs.hasTraditionalKnowledge,
    traditionalKnowledgeSource: obs.traditionalKnowledgeSource,
    administrativeWard: obs.wardName || obs.wardId,
    surveyId: obs.surveyId,
    projectId: obs.projectId,
  }

  return {
    'dwc:occurrenceID': obs.id || generateId(),
    'dwc:basisOfRecord': obs.basis_of_record || 'HumanObservation',
    'dwc:scientificName': obs.scientificName?.trim() || undefined,
    'dwc:vernacularName': obs.localName?.trim() || obs.speciesName?.trim() || undefined,
    'dwc:decimalLatitude': obs.latitude,
    'dwc:decimalLongitude': obs.longitude,
    'dwc:coordinateUncertaintyInMeters': obs.accuracyMeters,
    'dwc:eventDate': obs.observationAt || obs.recordedAt || obs.createdAt || new Date().toISOString(),
    'dwc:individualCount': obs.individualCount,
    'dwc:lifeStage': obs.lifeStage,
    'dwc:habitat': obs.microHabitat,
    'dwc:fieldNotes': obs.notes?.trim() || undefined,
    'dwc:identificationVerificationStatus': obs.verificationStatus,
    'dwc:dynamicProperties': JSON.stringify(dynamicProps),
  }
}

export function exportObservationsAsDarwinCoreJSON(observations: Observation[]): string {
  const records = observations.map(toDarwinCoreRecord)
  return JSON.stringify(
    {
      standard: 'Darwin Core Archive (DwC-A) Occurrence Standard',
      exportTimestamp: new Date().toISOString(),
      recordCount: records.length,
      occurrences: records,
    },
    null,
    2
  )
}

export function downloadDarwinCoreExport(observations: Observation[]): void {
  const jsonString = exportObservationsAsDarwinCoreJSON(observations)
  const blob = new Blob([jsonString], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const dateStr = new Date().toISOString().slice(0, 10)
  a.href = url
  a.download = `vasudha-dwc-observations-${dateStr}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
