/**
 * Lightweight EXIF reader for extracting GPS coordinates and capture timestamps
 * from JPEG and TIFF image blobs/files without external dependencies.
 *
 * Fully offline-compatible and safe: gracefully returns null on non-JPEG,
 * missing EXIF, or parsing errors.
 */

export interface ExifLocationResult {
  hasGps: boolean
  latitude: number | null
  longitude: number | null
  capturedAt: string | null
}

/**
 * Extracts GPS coordinates (latitude, longitude) and original capture timestamp
 * from a photograph Blob or File.
 */
export async function extractExifLocation(file: Blob): Promise<ExifLocationResult> {
  const defaultResult: ExifLocationResult = {
    hasGps: false,
    latitude: null,
    longitude: null,
    capturedAt: null,
  }

  try {
    // Read the first 128KB of the file (APP1 EXIF is located near the start)
    const slice = file.slice(0, 131072)
    const arrayBuffer = await slice.arrayBuffer()
    const view = new DataView(arrayBuffer)

    // Check JPEG SOI marker (0xFF, 0xD8)
    if (view.byteLength < 4 || view.getUint16(0, false) !== 0xffd8) {
      return defaultResult
    }

    let offset = 2
    let exifOffset = -1

    // Scan through JPEG markers to find APP1 (0xFF, 0xE1)
    while (offset < view.byteLength - 4) {
      const marker = view.getUint16(offset, false)
      offset += 2

      if (marker === 0xffe1) {
        // APP1 marker found
        const length = view.getUint16(offset, false)
        // Check for 'Exif\0\0' header (0x45786966 0x0000)
        if (
          offset + 8 <= view.byteLength &&
          view.getUint32(offset + 2, false) === 0x45786966 &&
          view.getUint16(offset + 6, false) === 0x0000
        ) {
          exifOffset = offset + 8
          break
        }
        offset += length
      } else if ((marker & 0xff00) === 0xff00) {
        // Other JPEG segment, skip payload
        if (marker === 0xffda || marker === 0xffd9) {
          // SOS or EOI - end of headers
          break
        }
        const length = view.getUint16(offset, false)
        offset += length
      } else {
        break
      }
    }

    if (exifOffset === -1 || exifOffset + 8 > view.byteLength) {
      return defaultResult
    }

    // TIFF Header inside EXIF APP1
    // Byte order: 0x4949 ('II' Little Endian) or 0x4D4D ('MM' Big Endian)
    const byteOrder = view.getUint16(exifOffset, false)
    const littleEndian = byteOrder === 0x4949
    if (byteOrder !== 0x4949 && byteOrder !== 0x4d4d) {
      return defaultResult
    }

    // Fixed 42 (0x002A) check
    if (view.getUint16(exifOffset + 2, littleEndian) !== 0x002a) {
      return defaultResult
    }

    // Offset of 0th IFD from start of TIFF header
    const firstIFDOffset = view.getUint32(exifOffset + 4, littleEndian)
    if (exifOffset + firstIFDOffset + 2 > view.byteLength) {
      return defaultResult
    }

    let gpsIFDOffset = -1
    let exifSubIFDOffset = -1
    let dateTimeStr: string | null = null

    // Parse IFD 0
    const ifd0Start = exifOffset + firstIFDOffset
    const ifd0Entries = view.getUint16(ifd0Start, littleEndian)

    for (let i = 0; i < ifd0Entries; i++) {
      const entryOffset = ifd0Start + 2 + i * 12
      if (entryOffset + 12 > view.byteLength) break

      const tag = view.getUint16(entryOffset, littleEndian)

      // Tag 0x8825: GPS IFD pointer
      if (tag === 0x8825) {
        gpsIFDOffset = exifOffset + view.getUint32(entryOffset + 8, littleEndian)
      }
      // Tag 0x8769: Exif SubIFD pointer (for DateTimeOriginal)
      else if (tag === 0x8769) {
        exifSubIFDOffset = exifOffset + view.getUint32(entryOffset + 8, littleEndian)
      }
      // Tag 0x0132: DateTime
      else if (tag === 0x0132 && !dateTimeStr) {
        const valOffset = exifOffset + view.getUint32(entryOffset + 8, littleEndian)
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
        if (tag === 0x9003) {
          const valOffset = exifOffset + view.getUint32(entryOffset + 8, littleEndian)
          const origDate = readAsciiString(view, valOffset, 20)
          if (origDate) dateTimeStr = origDate
          break
        }
      }
    }

    // Parse GPS IFD if found
    let latitude: number | null = null
    let longitude: number | null = null

    if (gpsIFDOffset > 0 && gpsIFDOffset + 2 <= view.byteLength) {
      const gpsEntries = view.getUint16(gpsIFDOffset, littleEndian)
      let latRef = 'N'
      let lonRef = 'E'
      let latDeg: number[] | null = null
      let lonDeg: number[] | null = null

      for (let i = 0; i < gpsEntries; i++) {
        const entryOffset = gpsIFDOffset + 2 + i * 12
        if (entryOffset + 12 > view.byteLength) break

        const tag = view.getUint16(entryOffset, littleEndian)

        if (tag === 0x0001) {
          // GPSLatitudeRef ('N' or 'S')
          latRef = String.fromCharCode(view.getUint8(entryOffset + 8)).toUpperCase()
        } else if (tag === 0x0002) {
          // GPSLatitude (3 RATIONALs)
          const valOffset = exifOffset + view.getUint32(entryOffset + 8, littleEndian)
          latDeg = readRationals(view, valOffset, 3, littleEndian)
        } else if (tag === 0x0003) {
          // GPSLongitudeRef ('E' or 'W')
          lonRef = String.fromCharCode(view.getUint8(entryOffset + 8)).toUpperCase()
        } else if (tag === 0x0004) {
          // GPSLongitude (3 RATIONALs)
          const valOffset = exifOffset + view.getUint32(entryOffset + 8, littleEndian)
          lonDeg = readRationals(view, valOffset, 3, littleEndian)
        }
      }

      if (latDeg && latDeg.length >= 3 && lonDeg && lonDeg.length >= 3) {
        let decLat = latDeg[0] + latDeg[1] / 60 + latDeg[2] / 3600
        let decLon = lonDeg[0] + lonDeg[1] / 60 + lonDeg[2] / 3600

        if (latRef === 'S') decLat = -decLat
        if (lonRef === 'W') decLon = -decLon

        // Sanity check coordinates
        if (
          !Number.isNaN(decLat) &&
          !Number.isNaN(decLon) &&
          decLat >= -90 &&
          decLat <= 90 &&
          decLon >= -180 &&
          decLon <= 180
        ) {
          latitude = Number(decLat.toFixed(6))
          longitude = Number(decLon.toFixed(6))
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
    }
  } catch (err) {
    console.warn('[exifReader] Failed to parse EXIF metadata:', err)
    return defaultResult
  }
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
