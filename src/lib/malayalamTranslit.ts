/**
 * Malayalam Phonetic Transliteration Engine
 * Client-side, offline-first implementation of Mozhi / Manglish phonetic scheme.
 * Supports online enrichment with graceful zero-latency offline fallback.
 */

// 1. Curated high-accuracy dictionary for common Kerala biodiversity & Malayalam terms
export const BIODIVERSITY_DICTIONARY: Record<string, string[]> = {
  // Common target words
  malayalam: ['മലയാളം', 'മലയാലം'],
  manglish: ['മംഗ്ലീഷ്'],
  keralam: ['കേരളം'],

  // Birds (പക്ഷികൾ)
  mayil: ['മയിൽ', 'മെയിൽ'],
  nattumayil: ['നാട്ടുമയിൽ'],
  kaaka: ['കാക്ക', 'കാക'],
  kaka: ['കാക്ക', 'കക്ക'],
  kakkachi: ['കാക്കാച്ചി'],
  neerkaaka: ['നീർകാക്ക'],
  kili: ['കിളി'],
  parava: ['പറവ'],
  kooval: ['കൂവൽ'],
  kuyil: ['കുയിൽ'],
  thatha: ['തത്ത'],
  pravu: ['പ്രാവ്'],
  chembothu: ['ചെമ്പോത്ത്'],
  marakkothi: ['മരക്കൊത്തി'],
  marakkothan: ['മരക്കൊത്തി'],
  meenkothi: ['മീൻകൊത്തി'],
  kokku: ['കൊക്ക്'],
  kazhukan: ['കഴുകൻ'],
  parunthu: ['പരുന്ത്'],
  aanthai: ['ആന്ത'],
  aanthey: ['ആന്ത'],

  // Plants, Trees & Flowers (സസ്യങ്ങൾ, മരങ്ങൾ, പൂക്കൾ)
  thulasi: ['തുളസി', 'തുളസീ'],
  krishnathulasi: ['കൃഷ്ണതുളസി'],
  kannikonna: ['കണിക്കൊന്ന', 'കണികൊന്ന'],
  konna: ['കൊന്ന'],
  chemparathi: ['ചെമ്പരത്തി'],
  chembarathi: ['ചെമ്പരത്തി', 'ചെമ്പരുത്തി'],
  arali: ['അരളി'],
  thamara: ['താമര'],
  mulla: ['മുല്ല'],
  pitchi: ['പിച്ചി'],
  thechi: ['തെച്ചി'],
  mavu: ['മാവ്'],
  manga: ['മാങ്ങ'],
  plavu: ['പ്ലാവ്'],
  chakka: ['ചക്ക'],
  thengu: ['തെങ്ങ്'],
  thenga: ['തേങ്ങ'],
  kamuku: ['കമുക്'],
  kamukku: ['കമുക്'],
  pacha: ['പച്ച'],
  nellu: ['നെല്ല്'],
  ari: ['അരി'],
  koovalam: ['കൂവളം'],
  amrithu: ['അമൃത്'],
  amruthu: ['അമൃത്'],
  thottavadi: ['തൊട്ടാവാടി'],
  kizhangu: ['കിഴങ്ങ്'],
  vellari: ['വെള്ളരി'],
  mathan: ['മത്തൻ'],
  kumbalam: ['കുമ്പളം'],
  padavalam: ['പടവലം'],
  chembu: ['ചേമ്പ്'],
  kaithachakka: ['കൈതച്ചക്ക'],
  karingali: ['കരിങ്ങാലി'],
  chandanam: ['ചന്ദനം'],
  rakthachandanam: ['രക്തചന്ദനം'],
  veppu: ['വേപ്പ്'],
  aryaveppu: ['ആര്യവേപ്പ്'],
  elanji: ['ഇലഞ്ഞി'],
  kanjiram: ['കാഞ്ഞിരം'],
  maram: ['മരം'],
  chedi: ['ചെടി'],
  poovu: ['പൂവ്'],
  poo: ['പൂവ്', 'പൂ'],
  ila: ['ഇല'],
  kaai: ['കായ്'],
  vriksham: ['വൃക്ഷം'],
  kaadu: ['കാട്'],
  vayal: ['വയൽ'],
  kulam: ['കുളം'],
  puzha: ['പുഴ'],

  // Animals & Mammals (മൃഗങ്ങൾ)
  aana: ['ആന'],
  puli: ['പുലി'],
  kaduva: ['കടുവ'],
  simham: ['സിംഹം'],
  karadi: ['കരടി'],
  maan: ['മാൻ'],
  kurangu: ['കുരങ്ങ്'],
  mullanpanni: ['മുള്ളൻപന്നി'],
  panni: ['പന്നി'],
  patti: ['പട്ടി'],
  naya: ['നായ'],
  poocha: ['പൂച്ച'],
  pashu: ['പശു'],
  pasu: ['പശു'],
  eruma: ['എരുമ'],
  aadu: ['ആട്'],
  kuthira: ['കുതിര'],
  keeri: ['കീരി'],
  annaan: ['അണ്ണാൻ'],
  eli: ['എലി'],
  peruchazhi: ['പെരുച്ചാഴി'],

  // Reptiles, Amphibians, Fish, Insects (മറ്റു ജീവികൾ)
  thavala: ['തവള'],
  thaval: ['തവള'],
  makri: ['മാക്രി'],
  paambu: ['പാമ്പ്'],
  pambu: ['പാമ്പ്'],
  moorkhan: ['മൂർഖൻ'],
  anali: ['അണലി'],
  chera: ['ചേര'],
  odiyan: ['ഓന്ത്'],
  onth: ['ഓന്ത്'],
  onthu: ['ഓന്ത്'],
  palli: ['പല്ലി'],
  aama: ['ആമ'],
  meen: ['മീൻ'],
  karimeen: ['കരിമീൻ'],
  ayala: ['അയല'],
  mathi: ['മത്തി'],
  chemmeen: ['ചെമ്മീൻ'],
  konju: ['കൊഞ്ച്'],
  njandu: ['ഞണ്ട്'],
  paatta: ['പാറ്റ'],
  kothuku: ['കൊതുക്'],
  eecha: ['ഈച്ച'],
  thumbi: ['തുമ്പി'],
  urumbu: ['ഉറുമ്പ്'],
  theneecha: ['തേനീച്ച'],
  kadannal: ['കടന്നൽ'],
  chithrashalabham: ['ചിത്രശലഭം'],
  puzhu: ['പുഴു'],
}

// 2. Mozhi phonetics lookup tables
const INDEPENDENT_VOWELS: Record<string, string> = {
  aa: 'ആ',
  a: 'അ',
  ii: 'ഈ',
  ee: 'ഈ',
  i: 'ഇ',
  uu: 'ഊ',
  oo: 'ഊ',
  u: 'ഉ',
  ea: 'ഏ',
  e: 'എ',
  ai: 'ഐ',
  oa: 'ഓ',
  o: 'ഒ',
  au: 'ഔ',
  ou: 'ഔ',
}

const VOWEL_SIGNS: Record<string, string> = {
  aa: 'ാ',
  a: '', // Inherent vowel
  ii: 'ീ',
  ee: 'ീ',
  i: 'ി',
  uu: 'ൂ',
  oo: 'ൂ',
  u: 'ു',
  ea: 'േ',
  e: 'െ',
  ai: 'ൈ',
  oa: 'ോ',
  o: 'ൊ',
  au: 'ൗ',
  ou: 'ൗ',
}

const CONSONANTS: Record<string, string> = {
  nch: 'ഞ്ച്',
  nj: 'ഞ്ഞ്',
  ng: 'ങ്ങ്',
  thh: 'ഥ്',
  th: 'ത്',
  dh: 'ധ്',
  kh: 'ഖ്',
  gh: 'ഘ്',
  ch: 'ച്ച്',
  jh: 'ഝ്',
  tt: 'ട്ട്',
  ph: 'ഫ്',
  bh: 'ഭ്',
  sh: 'ശ്',
  zh: 'ഴ്',
  kk: 'ക്ക്',
  pp: 'പ്പ്',
  mm: 'മ്മ്',
  nn: 'ന്ന്',
  ll: 'ല്ല്',
  yy: 'യ്യ്',
  vv: 'വ്വ്',
  k: 'ക്',
  g: 'ഗ്',
  c: 'ക്',
  j: 'ജ്',
  t: 'റ്റ്',
  d: 'ദ്',
  n: 'ന്',
  p: 'പ്',
  b: 'ബ്',
  m: 'മ്',
  y: 'യ്',
  r: 'ര്',
  l: 'ല്',
  v: 'വ്',
  w: 'വ്',
  s: 'സ്',
  h: 'ഹ്',
  L: 'ള്',
  N: 'ണ്',
  R: 'റ്',
}

const CHILLU: Record<string, string> = {
  n: 'ൻ',
  r: 'ർ',
  l: 'ൽ',
  L: 'ൾ',
  N: 'ൺ',
}

/**
 * Deterministic Mozhi transliteration for any arbitary string
 */
export function algorithmicTransliterate(
  input: string,
  options: { useRetroflexL?: boolean; useDentalT?: boolean } = {}
): string {
  if (!input) return ''
  const text = input.trim()
  let result = ''
  let i = 0

  const consonantKeys = Object.keys(CONSONANTS).sort((a, b) => b.length - a.length)
  const vowelKeys = Object.keys(VOWEL_SIGNS).sort((a, b) => b.length - a.length)
  const indVowelKeys = Object.keys(INDEPENDENT_VOWELS).sort((a, b) => b.length - a.length)

  while (i < text.length) {
    if (!/[a-zA-Z]/.test(text[i])) {
      result += text[i]
      i++
      continue
    }

    // Word-final 'am' -> ം
    if (
      text.substring(i, i + 2).toLowerCase() === 'am' &&
      (i + 2 >= text.length || !/[a-zA-Z]/.test(text[i + 2]))
    ) {
      result += 'ം'
      i += 2
      continue
    }

    // Match consonants
    let matchedConsonant: string | null = null
    let matchedConsonantLen = 0

    for (const key of consonantKeys) {
      if (text.substring(i, i + key.length).toLowerCase() === key.toLowerCase()) {
        matchedConsonant = CONSONANTS[key]
        if (key.toLowerCase() === 'l' && options.useRetroflexL) {
          matchedConsonant = 'ള്'
        }
        if (key.toLowerCase() === 't' && options.useDentalT) {
          matchedConsonant = 'ത്'
        }
        matchedConsonantLen = key.length
        break
      }
    }

    if (matchedConsonant) {
      const nextIdx = i + matchedConsonantLen
      let matchedVowelSign: string | null = null
      let matchedVowelLen = 0

      for (const vKey of vowelKeys) {
        if (text.substring(nextIdx, nextIdx + vKey.length).toLowerCase() === vKey.toLowerCase()) {
          matchedVowelSign = VOWEL_SIGNS[vKey]
          matchedVowelLen = vKey.length
          break
        }
      }

      if (matchedVowelSign !== null) {
        const base = matchedConsonant.endsWith('്')
          ? matchedConsonant.slice(0, -1)
          : matchedConsonant
        result += base + matchedVowelSign
        i = nextIdx + matchedVowelLen
      } else {
        const char = text.substring(i, i + matchedConsonantLen).toLowerCase()
        if (nextIdx >= text.length || !/[a-zA-Z]/.test(text[nextIdx])) {
          if (CHILLU[char]) {
            result += CHILLU[char]
          } else {
            result += matchedConsonant
          }
        } else {
          result += matchedConsonant
        }
        i = nextIdx
      }
    } else {
      // Independent vowel
      let matchedVowel: string | null = null
      let matchedVowelLen = 0
      for (const vKey of indVowelKeys) {
        if (text.substring(i, i + vKey.length).toLowerCase() === vKey.toLowerCase()) {
          matchedVowel = INDEPENDENT_VOWELS[vKey]
          matchedVowelLen = vKey.length
          break
        }
      }

      if (matchedVowel) {
        result += matchedVowel
        i += matchedVowelLen
      } else {
        result += text[i]
        i++
      }
    }
  }

  return result
}

/**
 * Generate candidate suggestions for a given English phonetic word (e.g. 'malayalam' -> ['മലയാളം', 'മലയാലം', ...])
 */
export async function getMalayalamCandidates(word: string): Promise<string[]> {
  if (!word || typeof word !== 'string') return []
  const clean = word.trim()
  if (!clean || !/[a-zA-Z]/.test(clean)) return []

  const lower = clean.toLowerCase()
  const candidates: string[] = []

  // 1. Direct dictionary match (instant, highest accuracy for biodiversity terms)
  if (BIODIVERSITY_DICTIONARY[lower]) {
    for (const c of BIODIVERSITY_DICTIONARY[lower]) {
      if (!candidates.includes(c)) candidates.push(c)
    }
  }

  // 2. Algorithmic Mozhi variants
  const var1 = algorithmicTransliterate(clean)
  if (var1 && !candidates.includes(var1)) candidates.push(var1)

  const var2 = algorithmicTransliterate(clean, { useRetroflexL: true })
  if (var2 && !candidates.includes(var2)) candidates.push(var2)

  const var3 = algorithmicTransliterate(clean, { useDentalT: true })
  if (var3 && !candidates.includes(var3)) candidates.push(var3)

  // 3. Online enrichment (Google Input Tools API) with fast 800ms abort timeout
  // If offline or blocked, this fails gracefully and does not stall UI
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 800)
    const res = await fetch(
      `https://inputtools.google.com/request?text=${encodeURIComponent(
        clean
      )}&itc=ml-t-i0-und&num=4&cp=0&cs=1&ie=utf-8&oe=utf-8&app=demopage`,
      { signal: controller.signal }
    )
    clearTimeout(timer)
    if (res.ok) {
      const data = await res.json()
      if (data && data[0] === 'SUCCESS' && Array.isArray(data[1]?.[0]?.[1])) {
        const onlineList = data[1][0][1] as string[]
        // Prepend or merge online candidates
        for (let idx = onlineList.length - 1; idx >= 0; idx--) {
          const item = onlineList[idx]
          if (!candidates.includes(item)) {
            candidates.unshift(item)
          }
        }
      }
    }
  } catch {
    // Expected when offline or sandboxed — offline engine provides candidates seamlessly
  }

  return candidates.slice(0, 5)
}
