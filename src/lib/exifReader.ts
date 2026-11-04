/**
 * Lightweight EXIF reader for extracting GPS coordinates and capture timestamps
 * from image files using FileReader as ArrayBuffer without external dependencies.
 *
 * Implements:
 * 1. FileReader ArrayBuffer loading
 * 2. Parsing for JPEG APP1 (0xFFE1) Exif, raw TIFF, PNG eXIf, and WebP EXIF
 * 3. Extracting GPSLatitude, GPSLongitude, GPSLatitudeRef, GPSLongitudeRef
 * 4. Converting DMS (degrees/minutes/seconds) to Decimal Degrees
 * 5. Extraction of capture timestamp (DateTimeOriginal / DateTime)
 */

export interface ExifLocationResult {
  hasGps: boolean
  latitude: number | null
  longitude: number | null
  capturedAt: string | null
  altitude?: number | null
  rawDms?: {
    latDms: [number, number, number]
    latRef: string
    lonDms: [number, number, number]
    lonRef: string
  } | null
}

/**
 * Reads a Blob or File using FileReader as an ArrayBuffer (Requirement 1).
 */
export function readFileAsArrayBuffer(file: Blob): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        resolve(reader.result)
      } else {
        reject(new Error('FileReader failed to produce an ArrayBuffer'))
      }
    }
    reader.onerror = () => {
      reject(reader.error || new Error('Error reading image with FileReader'))
    }
    reader.readAsArrayBuffer(file)
  })
}

/**
 * Converts DMS (Degrees, Minutes, Seconds) array to Decimal Degrees (Requirement 3).
 */
export function convertDMSToDD(
  dms: [number, number, number],
  ref: string
): number | null {
  if (!dms || dms.length < 3) return null
  const [degrees, minutes, seconds] = dms
  if (
    typeof degrees !== 'number' ||
    typeof minutes !== 'number' ||
    typeof seconds !== 'number' ||
    Number.isNaN(degrees) ||
    Number.isNaN(minutes) ||
    Number.isNaN(seconds)
  ) {
    return null
  }

  let dd = degrees + minutes / 60 + seconds / 3600
  const normalizedRef = (ref || '').trim().toUpperCase()

  if (normalizedRef === 'S' || normalizedRef === 'W') {
    dd = -dd
  }

  // Validate range: Latitude [-90, 90], Longitude [-180, 180]
  if (Number.isNaN(dd)) return null
  return Number(dd.toFixed(6))
}

/**
 * Parses an ArrayBuffer containing image data to extract GPS tags and capture date.
 */
export function parseExifFromArrayBuffer(buffer: ArrayBuffer): ExifLocationResult {
  const defaultResult: ExifLocationResult = {
    hasGps: false,
    latitude: null,
    longitude: null,
    capturedAt: null,
    altitude: null,
    rawDms: null,
  }

  try {
    const view = new DataView(buffer)
    if (view.byteLength < 14) return defaultResult

    let tiffOffset = -1

    // 1. Check JPEG (SOI 0xFFD8)
    if (view.getUint16(0, false) === 0xffd8) {
      let offset = 2
      // Walk through JPEG segments looking for APP1 with 'Exif\0\0'
      while (offset < view.byteLength - 4) {
        const marker = view.getUint16(offset, false)
        offset += 2

        // Stop scanning at Start of Scan (SOS) or End of Image (EOI)
        if (marker === 0xffda || marker === 0xffd9) {
          break
        }

        if (offset + 2 > view.byteLength) break
        const segmentLength = view.getUint16(offset, false)

        if (marker === 0xffe1) {
          // Check for 'Exif\0\0' (0x45786966 0x0000)
          if (
            offset + 8 <= view.byteLength &&
            view.getUint32(offset + 2, false) === 0x45786966 &&
            view.getUint16(offset + 6, false) === 0x0000
          ) {
            tiffOffset = offset + 8
            break
          }
        }

        if (segmentLength < 2) break
        offset += segmentLength
      }
    }
    // 2. Check Raw TIFF directly ('II*\0' or 'MM\0*')
    else if (
      (view.getUint16(0, false) === 0x4949 && view.getUint16(2, true) === 0x002a) ||
      (view.getUint16(0, false) === 0x4d4d && view.getUint16(2, false) === 0x002a)
    ) {
      tiffOffset = 0
    }
    // 3. Check PNG (\x89PNG\r\n\x1a\n)
    else if (
      view.getUint32(0, false) === 0x89504e47 &&
      view.getUint32(4, false) === 0x0d0a1a0a
    ) {
      let offset = 8
      while (offset + 8 < view.byteLength) {
        const chunkLen = view.getUint32(offset, false)
        const chunkType = view.getUint32(offset + 4, false)
        offset += 8
        // 'eXIf' chunk in PNG
        if (chunkType === 0x65584966) {
          tiffOffset = offset
          break
        }
        offset += chunkLen + 4 // skip data + 4-byte CRC
      }
    }
    // 4. Check WebP (RIFF....WEBP)
    else if (
      view.getUint32(0, false) === 0x52494646 &&
      view.getUint32(8, false) === 0x57454250
    ) {
      let offset = 12
      while (offset + 8 < view.byteLength) {
        const chunkType = view.getUint32(offset, false)
        const chunkLen = view.getUint32(offset + 4, true)
        offset += 8
        // 'EXIF' chunk in WebP
        if (chunkType === 0x45584946) {
          // If starts with 'Exif\0\0', skip header
          if (
            offset + 6 <= view.byteLength &&
            view.getUint32(offset, false) === 0x45786966 &&
            view.getUint16(offset + 4, false) === 0x0000
          ) {
            tiffOffset = offset + 6
          } else {
            tiffOffset = offset
          }
          break
        }
        offset += chunkLen + (chunkLen % 2) // padded to even
      }
    }

    if (tiffOffset === -1 || tiffOffset + 8 > view.byteLength) {
      return defaultResult
    }

    // Parse TIFF structure
    // Byte order: 0x4949 ('II' Little Endian) or 0x4D4D ('MM' Big Endian)
    const byteOrder = view.getUint16(tiffOffset, false)
    const littleEndian = byteOrder === 0x4949
    if (byteOrder !== 0x4949 && byteOrder !== 0x4d4d) {
      return defaultResult
    }

    // Verify TIFF magic number 42 (0x002A)
    if (view.getUint16(tiffOffset + 2, littleEndian) !== 0x002a) {
      return defaultResult
    }

    // First IFD offset from start of TIFF header
    const firstIFDOffset = view.getUint32(tiffOffset + 4, littleEndian)
    if (tiffOffset + firstIFDOffset + 2 > view.byteLength) {
      return defaultResult
    }

    let gpsIFDOffset = -1
    let exifSubIFDOffset = -1
    let dateTimeStr: string | null = null

    // Parse IFD 0
    const ifd0Start = tiffOffset + firstIFDOffset
    const ifd0Entries = view.getUint16(ifd0Start, littleEndian)

    for (let i = 0; i < ifd0Entries; i++) {
      const entryOffset = ifd0Start + 2 + i * 12
      if (entryOffset + 12 > view.byteLength) break

      const tag = view.getUint16(entryOffset, littleEndian)

      // Tag 0x8825: GPS IFD pointer
      if (tag === 0x8825) {
        gpsIFDOffset = tiffOffset + view.getUint32(entryOffset + 8, littleEndian)
      }
      // Tag 0x8769: Exif SubIFD pointer (for DateTimeOriginal)
      else if (tag === 0x8769) {
        exifSubIFDOffset = tiffOffset + view.getUint32(entryOffset + 8, littleEndian)
      }
      // Tag 0x0132: DateTime
      else if (tag === 0x0132 && !dateTimeStr) {
        const valOffset = tiffOffset + view.getUint32(entryOffset + 8, littleEndian)
        dateTimeStr = readAsciiString(view, valOffset, 20)
      }
    }

    // Check Exif SubIFD for DateTimeOriginal (Tag 0x9003)
    if (exifSubIFDOffset > 0 && exifSubIFDOffset + 2 <= view.byteLength) {
      const subEntries = view.getUint16(exifSubIFDOffset, littleEndian)
      for (let i = 0; i < subEntries; i++) {
        const entryOffset = exifSubIFDOffset + 2 + i * 12
        if (entryOffset + 12 > view.byteLength) break
        const tag = view.getUint16(entryOffset, littleEndian)
        if (tag === 0x9003 || (tag === 0x9004 && !dateTimeStr)) {
          const valOffset = tiffOffset + view.getUint32(entryOffset + 8, littleEndian)
          const origDate = readAsciiString(view, valOffset, 20)
          if (origDate) {
            dateTimeStr = origDate
            if (tag === 0x9003) break
          }
        }
      }
    }

    // Parse GPS IFD if found (Requirement 2: GPSLatitude, GPSLongitude, GPSLatitudeRef, GPSLongitudeRef)
    let latitude: number | null = null
    let longitude: number | null = null
    let altitude: number | null = null
    let rawDmsResult: ExifLocationResult['rawDms'] = null

    if (gpsIFDOffset > 0 && gpsIFDOffset + 2 <= view.byteLength) {
      const gpsEntries = view.getUint16(gpsIFDOffset, littleEndian)
      let latRef = 'N'
      let lonRef = 'E'
      let latDmsArray: [number, number, number] | null = null
      let lonDmsArray: [number, number, number] | null = null
      let altRef = 0

      for (let i = 0; i < gpsEntries; i++) {
        const entryOffset = gpsIFDOffset + 2 + i * 12
        if (entryOffset + 12 > view.byteLength) break

        const tag = view.getUint16(entryOffset, littleEndian)
        const count = view.getUint32(entryOffset + 4, littleEndian)

        if (tag === 0x0001) {
          // GPSLatitudeRef ('N' or 'S')
          const char = readTagAsciiOrInline(view, tiffOffset, entryOffset, count, littleEndian)
          if (char) latRef = char.toUpperCase()
        } else if (tag === 0x0002) {
          // GPSLatitude (3 RATIONALs)
          const valOffset = tiffOffset + view.getUint32(entryOffset + 8, littleEndian)
          const rationals = readRationals(view, valOffset, 3, littleEndian)
          if (rationals && rationals.length === 3) {
            latDmsArray = [rationals[0], rationals[1], rationals[2]]
          }
        } else if (tag === 0x0003) {
          // GPSLongitudeRef ('E' or 'W')
          const char = readTagAsciiOrInline(view, tiffOffset, entryOffset, count, littleEndian)
          if (char) lonRef = char.toUpperCase()
        } else if (tag === 0x0004) {
          // GPSLongitude (3 RATIONALs)
          const valOffset = tiffOffset + view.getUint32(entryOffset + 8, littleEndian)
          const rationals = readRationals(view, valOffset, 3, littleEndian)
          if (rationals && rationals.length === 3) {
            lonDmsArray = [rationals[0], rationals[1], rationals[2]]
          }
        } else if (tag === 0x0005) {
          // GPSAltitudeRef (0 = Sea level, 1 = Below sea level)
          altRef = view.getUint8(entryOffset + 8)
        } else if (tag === 0x0006) {
          // GPSAltitude (1 RATIONAL)
          const valOffset = tiffOffset + view.getUint32(entryOffset + 8, littleEndian)
          const altRat = readRationals(view, valOffset, 1, littleEndian)
          if (altRat && altRat.length === 1) {
            altitude = altRef === 1 ? -altRat[0] : altRat[0]
          }
        }
      }

      // Convert DMS arrays to Decimal Degrees (Requirement 3)
      if (latDmsArray && lonDmsArray) {
        const parsedLat = convertDMSToDD(latDmsArray, latRef)
        const parsedLon = convertDMSToDD(lonDmsArray, lonRef)

        if (
          parsedLat !== null &&
          parsedLon !== null &&
          parsedLat >= -90 &&
          parsedLat <= 90 &&
          parsedLon >= -180 &&
          parsedLon <= 180 &&
          // Reject Null Island (0,0) if not intentional
          !(parsedLat === 0 && parsedLon === 0)
        ) {
          latitude = parsedLat
          longitude = parsedLon
          rawDmsResult = {
            latDms: latDmsArray,
            latRef,
            lonDms: lonDmsArray,
            lonRef,
          }
        }
      }
    }

    // Format ISO capture date if found ("YYYY:MM:DD HH:MM:SS" -> ISO)
    let parsedIsoDate: string | null = null
    if (dateTimeStr) {
      const match = dateTimeStr.match(/^(\d{4})[:-](\d{2})[:-](\d{2})\s+(\d{2}):(\d{2}):(\d{2})/)
      if (match) {
        const [, y, m, d, hh, mm, ss] = match
        const dateObj = new Date(Date.UTC(+y, +m - 1, +d, +hh, +mm, +ss))
        if (!Number.isNaN(dateObj.getTime())) {
          parsedIsoDate = dateObj.toISOString()
        }
      }
    }

    return {
      hasGps: latitude !== null && longitude !== null,
      latitude,
      longitude,
      capturedAt: parsedIsoDate,
      altitude,
      rawDms: rawDmsResult,
    }
  } catch (err) {
    console.warn('[exifReader] Failed to parse EXIF metadata:', err)
    return defaultResult
  }
}

/**
 * Main entry point: Extracts GPS and metadata from a File or Blob.
 * Uses FileReader.readAsArrayBuffer under the hood (Requirement 1).
 */
export async function extractExifLocation(file: Blob): Promise<ExifLocationResult> {
  try {
    const arrayBuffer = await readFileAsArrayBuffer(file)
    return parseExifFromArrayBuffer(arrayBuffer)
  } catch (err) {
    console.warn('[exifReader] Failed reading file with FileReader:', err)
    return {
      hasGps: false,
      latitude: null,
      longitude: null,
      capturedAt: null,
      altitude: null,
      rawDms: null,
    }
  }
}

function readTagAsciiOrInline(
  view: DataView,
  tiffOffset: number,
  entryOffset: number,
  count: number,
  littleEndian: boolean
): string | null {
  if (count <= 4) {
    // Value is stored directly inside the 4-byte value field
    const code = view.getUint8(entryOffset + 8)
    return code !== 0 ? String.fromCharCode(code) : null
  }
  // Offset to value
  const valOffset = tiffOffset + view.getUint32(entryOffset + 8, littleEndian)
  return readAsciiString(view, valOffset, count)
}

function readAsciiString(view: DataView, offset: number, maxLen: number): string | null {
  if (offset < 0 || offset >= view.byteLength) return null
  let result = ''
  const end = Math.min(view.byteLength, offset + maxLen)
  for (let i = offset; i < end; i++) {
    const code = view.getUint8(i)
    if (code === 0) break
    result += String.fromCharCode(code)
  }
  return result.trim() || null
}

function readRationals(
  view: DataView,
  offset: number,
  count: number,
  littleEndian: boolean
): number[] | null {
  if (offset < 0 || offset + count * 8 > view.byteLength) return null
  const values: number[] = []
  for (let i = 0; i < count; i++) {
    const num = view.getUint32(offset + i * 8, littleEndian)
    const den = view.getUint32(offset + i * 8 + 4, littleEndian)
    if (den === 0) {
      values.push(0)
    } else {
      values.push(num / den)
    }
  }
  return values
}
