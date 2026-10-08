import Dexie, { type Table } from 'dexie'

export interface Observation {
  id?: number
  speciesName: string
  notes: string
  observationDate: string
  observationAt: string
  recordedAt: string
  latitude: number | null
  longitude: number | null
  photo: Blob | null
}

export class VasudhaDatabase extends Dexie {
  observations!: Table<Observation, number>

  constructor() {
    super('VasudhaDatabase')

    this.version(1).stores({
      observations: '++id, speciesName, observationDate',
    })
  }
}

export const db = new VasudhaDatabase()