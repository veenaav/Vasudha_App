/**
 * Reverse Geocoding Service for B-Liffe
 *
 * Automatically resolves coordinates into human-readable English local addresses
 * (suburb/village/town/city + district, e.g. "Pulloor, Thrissur") via OpenStreetMap Nominatim API,
 * requesting English language results with graceful fallback to formatted coordinates if offline or unavailable.
 */

export interface ReverseGeocodeResult {
  locationName: string // e.g. "Pulloor, Thrissur" or "Palayam, Thiruvananthapuram"
  localArea?: string // e.g. "Pulloor"
  district?: string // e.g. "Thrissur"
  city?: string // e.g. "Thrissur"
  state?: string // e.g. "Kerala"
  displayName?: string // full formatted address string
  rawAddress?: Record<string, string>
}

// Malayalam to English district fallback lookup table to ensure consistent English display
const DISTRICT_EN_MAP: Record<string, string> = {
  'തിരുവനന്തപുരം': 'Thiruvananthapuram',
  'കൊല്ലം': 'Kollam',
  'പത്തനംതിട്ട': 'Pathanamthitta',
  'ആലപ്പുഴ': 'Alappuzha',
  'കോട്ടയം': 'Kottayam',
  'ഇടുക്കി': 'Idukki',
  'എറണാകുളം': 'Ernakulam',
  'തൃശ്ശൂർ': 'Thrissur',
  'തൃശൂർ': 'Thrissur',
  'പാലക്കാട്': 'Palakkad',
  'മലപ്പുറം': 'Malappuram',
  'കോഴിക്കോട്': 'Kozhikode',
  'വയനാട്': 'Wayanad',
  'കണ്ണൂർ': 'Kannur',
  'കാസർഗോഡ്': 'Kasaragod',
  'കാസർകോട്': 'Kasaragod',
}

/**
 * Extracts and formats human-readable location name in English from Nominatim response.
 * Prioritizes local address components (suburb, village, town, city) along with the district,
 * ensuring clean English formatting (e.g., "Pulloor, Thrissur").
 */
export function parseNominatimAddress(data: any): ReverseGeocodeResult {
  const address = (data && typeof data === 'object' ? data.address : null) || {}
  const namedetails = (data && typeof data === 'object' ? data.namedetails : null) || {}

  const getField = (keys: string[]): string => {
    for (const key of keys) {
      if (address[key] && typeof address[key] === 'string' && address[key].trim()) {
        const val = address[key].trim()
        return DISTRICT_EN_MAP[val] || val
      }
    }
    return ''
  }

  // Extract local address component with English preference
  let local = getField([
    'suburb:en',
    'suburb',
    'village:en',
    'village',
    'town:en',
    'town',
    'neighbourhood:en',
    'neighbourhood',
    'residential:en',
    'residential',
    'hamlet:en',
    'hamlet',
    'locality:en',
    'locality',
    'subdistrict:en',
    'subdistrict',
    'city_district:en',
    'city_district',
    'city:en',
    'city',
  ])

  // Extract district / county component with English preference
  let district = getField([
    'state_district:en',
    'state_district',
    'district:en',
    'district',
    'county:en',
    'county',
  ])

  // Strip redundant "District" suffix to match standard clean formatting (e.g. "Thrissur")
  if (district) {
    district = district.replace(/\s+District$/i, '').trim()
  }

  // Extract city or municipality
  const city = getField(['city:en', 'city', 'town:en', 'town', 'municipality:en', 'municipality'])
  const state = getField(['state:en', 'state'])

  // Check namedetails for English name if local contains non-Latin scripts or is missing
  if ((!local || /[\u0D00-\u0D7F]/.test(local)) && namedetails) {
    const englishName = namedetails['name:en'] || namedetails['int_name']
    if (englishName && typeof englishName === 'string' && englishName.trim()) {
      local = englishName.trim()
    }
  }

  // Combine local address component with district
  const parts: string[] = []
  if (local) {
    parts.push(local)
  }

  if (district) {
    const alreadyIncluded = parts.some(
      (p) => p.toLowerCase() === district.toLowerCase()
    )
    if (!alreadyIncluded) {
      parts.push(district)
    }
  } else if (!parts.length && city) {
    parts.push(city)
  }

  let locationName = parts.join(', ')

  // If local and district were not found, fallback to English namedetails, name, or display_name
  if (!locationName && namedetails) {
    const enName = namedetails['name:en'] || namedetails['int_name']
    if (enName) locationName = String(enName).trim()
  }

  if (!locationName && data?.name) {
    locationName = String(data.name).trim()
  }

  if (!locationName && data?.display_name) {
    const segments = String(data.display_name)
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    locationName = segments.slice(0, 2).join(', ')
  }

  return {
    locationName: locationName || 'Unknown location',
    localArea: local || undefined,
    district: district || undefined,
    city: city || undefined,
    state: state || undefined,
    displayName: data?.display_name || undefined,
    rawAddress: address,
  }
}

/**
 * Client-Side Reverse Geocoding via OpenStreetMap Nominatim.
 *
 * Requests English results using 'accept-language=en' parameter and 'Accept-Language': 'en' header.
 * Includes descriptive 'User-Agent': 'B-Liffe-App'.
 * Returns ReverseGeocodeResult in clean English format or null on error / offline.
 */
export async function reverseGeocodeCoordinates(
  latitude: number,
  longitude: number
): Promise<ReverseGeocodeResult | null> {
  if (
    typeof latitude !== 'number' ||
    typeof longitude !== 'number' ||
    Number.isNaN(latitude) ||
    Number.isNaN(longitude)
  ) {
    return null
  }

  const lat = Number(latitude.toFixed(6))
  const lon = Number(longitude.toFixed(6))
  // Explicitly request English language results with accept-language=en, addressdetails=1, and namedetails=1
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&accept-language=en&addressdetails=1&namedetails=1`

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Accept-Language': 'en',
        'User-Agent': 'B-Liffe-App',
      },
      signal: AbortSignal.timeout(6000),
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    if (!data) return null

    return parseNominatimAddress(data)
  } catch {
    // Offline, network error, or timeout -> graceful fallback
    return null
  }
}
