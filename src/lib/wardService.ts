/**
 * Ward Identification Service for B-Liffe
 *
 * Provides GPS-based ward identification matching against official
 * Thiruvananthapuram Municipal Corporation ward reference dataset.
 *
 * Connects to backend /api/wards/identify with offline fallback.
 */

export type WardIdentificationStatus =
  | 'location_not_obtained'
  | 'requesting_location'
  | 'location_obtained'
  | 'identifying_ward'
  | 'ward_identified'
  | 'ward_unidentified'
  | 'location_unavailable'

export interface IdentifiedWard {
  wardId: string // e.g. "TVM-WARD-014" or UUID
  wardNumber: string // e.g. "14"
  wardName: string // e.g. "Palayam"
  localBodyName?: string // e.g. "Thiruvananthapuram Municipal Corporation"
}

export interface WardIdentificationResult {
  status: WardIdentificationStatus
  ward?: IdentifiedWard
  message: string
}

interface WardBoundary {
  wardId: string
  wardNumber: string
  wardName: string
  localBodyName: string
  centerLat: number
  centerLon: number
  radiusKm: number
}

export const TVM_WARDS: WardBoundary[] = [
  {
    wardId: 'TVM-WARD-001',
    wardNumber: '1',
    wardName: 'Kazhakoottam',
    localBodyName: 'Thiruvananthapuram Municipal Corporation',
    centerLat: 8.5686,
    centerLon: 76.8713,
    radiusKm: 2.5,
  },
  {
    wardId: 'TVM-WARD-014',
    wardNumber: '14',
    wardName: 'Palayam',
    localBodyName: 'Thiruvananthapuram Municipal Corporation',
    centerLat: 8.4982,
    centerLon: 76.9534,
    radiusKm: 1.5,
  },
  {
    wardId: 'TVM-WARD-026',
    wardNumber: '26',
    wardName: 'Pattom',
    localBodyName: 'Thiruvananthapuram Municipal Corporation',
    centerLat: 8.5241,
    centerLon: 76.9452,
    radiusKm: 1.8,
  },
  {
    wardId: 'TVM-WARD-033',
    wardNumber: '33',
    wardName: 'Kowdiar',
    localBodyName: 'Thiruvananthapuram Municipal Corporation',
    centerLat: 8.5284,
    centerLon: 76.9611,
    radiusKm: 1.6,
  },
  {
    wardId: 'TVM-WARD-041',
    wardNumber: '41',
    wardName: 'Sasthamangalam',
    localBodyName: 'Thiruvananthapuram Municipal Corporation',
    centerLat: 8.5132,
    centerLon: 76.9741,
    radiusKm: 1.7,
  },
  {
    wardId: 'TVM-WARD-079',
    wardNumber: '79',
    wardName: 'Fort',
    localBodyName: 'Thiruvananthapuram Municipal Corporation',
    centerLat: 8.4821,
    centerLon: 76.9463,
    radiusKm: 1.4,
  },
  {
    wardId: 'TVM-WARD-082',
    wardNumber: '82',
    wardName: 'Chalai',
    localBodyName: 'Thiruvananthapuram Municipal Corporation',
    centerLat: 8.4812,
    centerLon: 76.9546,
    radiusKm: 1.3,
  },
  {
    wardId: 'TVM-WARD-093',
    wardNumber: '93',
    wardName: 'Thiruvallam',
    localBodyName: 'Thiruvananthapuram Municipal Corporation',
    centerLat: 8.4552,
    centerLon: 76.9624,
    radiusKm: 2.2,
  },
  {
    wardId: 'TVM-WARD-100',
    wardNumber: '100',
    wardName: 'Vizhinjam',
    localBodyName: 'Thiruvananthapuram Municipal Corporation',
    centerLat: 8.3812,
    centerLon: 77.0125,
    radiusKm: 2.8,
  },
]

function haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function calculateLocalWard(latitude: number, longitude: number): WardIdentificationResult {
  const isWithinDistrict =
    latitude >= 8.2 && latitude <= 8.9 && longitude >= 76.6 && longitude <= 77.3

  if (!isWithinDistrict) {
    return {
      status: 'ward_unidentified',
      message: 'Coordinates fall outside the Thiruvananthapuram Municipal Corporation boundary.',
    }
  }

  let closestWard: WardBoundary | null = null
  let minDistance = Number.POSITIVE_INFINITY

  for (const ward of TVM_WARDS) {
    const dist = haversineDistanceKm(latitude, longitude, ward.centerLat, ward.centerLon)
    if (dist < minDistance) {
      minDistance = dist
      closestWard = ward
    }
  }

  if (closestWard && minDistance <= closestWard.radiusKm * 1.5) {
    return {
      status: 'ward_identified',
      ward: {
        wardId: closestWard.wardId,
        wardNumber: closestWard.wardNumber,
        wardName: closestWard.wardName,
        localBodyName: closestWard.localBodyName,
      },
      message: `Identified as Ward ${closestWard.wardNumber} – ${closestWard.wardName} (${closestWard.localBodyName}).`,
    }
  }

  return {
    status: 'ward_unidentified',
    message: 'Coordinates are in Thiruvananthapuram, but GIS sub-polygon boundary matching is pending.',
  }
}

/**
 * Service function to identify ward from GPS coordinates.
 * Queries backend endpoint /api/wards/identify with offline algorithmic fallback.
 */
export async function identifyWardFromCoordinates(
  latitude: number,
  longitude: number
): Promise<WardIdentificationResult> {
  if (
    typeof latitude !== 'number' ||
    typeof longitude !== 'number' ||
    Number.isNaN(latitude) ||
    Number.isNaN(longitude)
  ) {
    return {
      status: 'ward_unidentified',
      message: 'Invalid GPS coordinates provided.',
    }
  }

  try {
    const res = await fetch('/api/wards/identify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ latitude, longitude }),
      signal: AbortSignal.timeout(4000),
    })

    if (res.ok) {
      const data = (await res.json()) as WardIdentificationResult
      if (data && data.status) {
        return data
      }
    }
  } catch {
    // Offline or network timeout — fallback to embedded calculations
  }

  return calculateLocalWard(latitude, longitude)
}
