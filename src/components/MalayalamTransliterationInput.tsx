import { useState, useRef, useEffect, useCallback } from 'react'
import { getMalayalamCandidates } from '@/lib/malayalamTranslit'
import { Languages, Check, X } from 'lucide-react'

export interface MalayalamTransliterationInputProps {
  id: string
  value: string
  onChange: (val: string) => void
  label: string
  placeholder?: string
  disabled?: boolean
  required?: boolean
  isTextarea?: boolean
  rows?: number
  helperText?: string
  className?: string
}

export default function MalayalamTransliterationInput({
  id,
  value,
  onChange,
  label,
  placeholder,
  disabled = false,
  required = false,
  isTextarea = false,
  rows = 3,
  helperText,
  className = '',
}: MalayalamTransliterationInputProps) {
  // Input mode: English ('en') is default as required
  const [mode, setMode] = useState<'en' | 'ml'>('en')

  // Candidate suggestions state
  const [candidates, setCandidates] = useState<string[]>([])
  const [activeCandidateIdx, setActiveCandidateIdx] = useState(0)
  const [activeWordInfo, setActiveWordInfo] = useState<{
    word: string
    start: number
    end: number
  } | null>(null)
  const [showSuggestions, setShowSuggestions] = useState(false)

  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null)
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Find the word currently being typed at or before cursor
  const extractWordAtCursor = useCallback(
    (text: string, cursorPos: number) => {
      if (cursorPos === 0) return null

      // Look back from cursorPos for whitespace or punctuation
      let start = cursorPos - 1
      while (start >= 0 && /[a-zA-Z]/.test(text[start])) {
        start--
      }
      start++

      // Look forward to find word boundary
      let end = cursorPos
      while (end < text.length && /[a-zA-Z]/.test(text[end])) {
        end++
      }

      const word = text.slice(start, end)
      if (word && /[a-zA-Z]/.test(word)) {
        return { word, start, end }
      }
      return null
    },
    []
  )

  // Query candidate suggestions when typing in Malayalam mode
  const updateCandidatesForCursor = useCallback(
    (text: string, cursorPos: number) => {
      if (mode !== 'ml' || disabled) {
        setCandidates([])
        setShowSuggestions(false)
        setActiveWordInfo(null)
        return
      }

      const wordInfo = extractWordAtCursor(text, cursorPos)
      if (!wordInfo || wordInfo.word.length === 0) {
        setCandidates([])
        setShowSuggestions(false)
        setActiveWordInfo(null)
        return
      }

      setActiveWordInfo(wordInfo)

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }

      debounceTimerRef.current = setTimeout(async () => {
        const results = await getMalayalamCandidates(wordInfo.word)
        if (results.length > 0) {
          setCandidates(results)
          setActiveCandidateIdx(0)
          setShowSuggestions(true)
        } else {
          setCandidates([])
          setShowSuggestions(false)
        }
      }, 120)
    },
    [mode, disabled, extractWordAtCursor]
  )

  // Replace active English word with chosen Malayalam candidate
  const commitCandidate = useCallback(
    (chosenMalayalamWord: string, appendSpace = true) => {
      if (!activeWordInfo) return

      const before = value.slice(0, activeWordInfo.start)
      const after = value.slice(activeWordInfo.end)
      const insertion = chosenMalayalamWord + (appendSpace ? ' ' : '')
      const newValue = before + insertion + after

      onChange(newValue)
      setShowSuggestions(false)
      setCandidates([])
      setActiveWordInfo(null)

      // Reposition cursor after inserted text
      setTimeout(() => {
        if (inputRef.current) {
          const newCursorPos = before.length + insertion.length
          inputRef.current.setSelectionRange(newCursorPos, newCursorPos)
          inputRef.current.focus()
        }
      }, 10)
    },
    [activeWordInfo, value, onChange]
  )

  // Handle key events for keyboard candidate selection
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!showSuggestions || candidates.length === 0) return

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveCandidateIdx((prev) => (prev + 1) % candidates.length)
      return
    }

    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveCandidateIdx((prev) => (prev - 1 + candidates.length) % candidates.length)
      return
    }

    if (e.key === 'Enter') {
      e.preventDefault()
      commitCandidate(candidates[activeCandidateIdx], false)
      return
    }

    if (e.key === ' ') {
      // Space commits the primary/selected candidate
      e.preventDefault()
      commitCandidate(candidates[activeCandidateIdx], true)
      return
    }

    if (e.key === 'Escape') {
      e.preventDefault()
      setShowSuggestions(false)
      return
    }

    // Number keys 1-9 to pick candidate
    if (/^[1-9]$/.test(e.key)) {
      const num = parseInt(e.key, 10) - 1
      if (num < candidates.length) {
        e.preventDefault()
        commitCandidate(candidates[num], true)
      }
    }
  }

  // Handle standard input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newVal = e.target.value
    const cursorPos = e.target.selectionStart ?? newVal.length
    onChange(newVal)

    if (mode === 'ml') {
      updateCandidatesForCursor(newVal, cursorPos)
    }
  }

  // Dismiss suggestions when clicking outside
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
    }
  }, [])

  return (
    <div className={`relative ${className}`}>
      {/* Header with Label and Input Mode Toggle */}
      <div className="flex items-center justify-between flex-wrap gap-2 mb-1.5">
        <label
          htmlFor={id}
          className="block text-xs font-semibold tracking-wider uppercase text-[#414B32]"
        >
          {label} {required && <span className="text-[#B87555]">*</span>}
        </label>

        {/* English / Malayalam Input Mode Toggle */}
        <div className="flex items-center gap-1 rounded-full bg-white/90 p-1 border border-[#C5D1BD] shadow-xs text-xs">
          <Languages className="h-3.5 w-3.5 text-[#263D2B] ml-1.5 mr-0.5" />
          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              setMode('en')
              setShowSuggestions(false)
            }}
            className={`rounded-full px-2.5 py-0.5 font-medium transition-all text-[11px] ${
              mode === 'en'
                ? 'bg-[#263D2B] text-[#F5F0E4] shadow-xs'
                : 'text-[#414B32] hover:bg-slate-100'
            }`}
            title="Type in English"
            aria-pressed={mode === 'en'}
          >
            English
          </button>

          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              setMode('ml')
              if (inputRef.current) {
                inputRef.current.focus()
              }
            }}
            className={`rounded-full px-2.5 py-0.5 font-medium transition-all text-[11px] ${
              mode === 'ml'
                ? 'bg-[#165B33] text-white shadow-xs font-semibold'
                : 'text-[#414B32] hover:bg-slate-100'
            }`}
            title="Phonetic typing in Malayalam (e.g. typing malayalam gives മലയാളം)"
            aria-pressed={mode === 'ml'}
          >
            മലയാളം
          </button>
        </div>
      </div>

      {/* Input / Textarea Element */}
      <div className="relative">
        {isTextarea ? (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            id={id}
            value={value}
            disabled={disabled}
            rows={rows}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={
              placeholder ||
              (mode === 'ml'
                ? "മലയാളത്തിൽ എഴുതുക (e.g. type 'thulasi' for തുളസി)..."
                : 'Enter text...')
            }
            className="w-full rounded-xl border border-[#C5D1BD] bg-white px-4 py-3 text-base text-[#263D2B] placeholder-[#414B32]/40 outline-none focus:border-[#263D2B] focus:ring-1 focus:ring-[#263D2B] disabled:cursor-not-allowed disabled:bg-gray-100"
          />
        ) : (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            id={id}
            type="text"
            value={value}
            disabled={disabled}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={
              placeholder ||
              (mode === 'ml'
                ? "മലയാളത്തിൽ എഴുതുക (e.g. type 'malayalam' for മലയാളം)..."
                : 'Enter name...')
            }
            className="w-full min-h-[48px] rounded-xl border border-[#C5D1BD] bg-white px-4 py-3 text-base text-[#263D2B] placeholder-[#414B32]/40 outline-none focus:border-[#263D2B] focus:ring-1 focus:ring-[#263D2B] disabled:cursor-not-allowed disabled:bg-gray-100"
          />
        )}
      </div>

      {/* Candidate Selection Bar / Dropdown (when typing phonetically in Malayalam mode) */}
      {mode === 'ml' && showSuggestions && candidates.length > 0 && (
        <div
          className="mt-2 rounded-2xl border border-emerald-300 bg-white p-2 shadow-lg z-20 transition-all animate-in fade-in slide-in-from-top-1"
          role="listbox"
          aria-label="Malayalam transliteration candidates"
        >
          <div className="flex items-center justify-between pb-1.5 px-2 border-b border-slate-100 text-[11px] text-slate-500">
            <span className="font-medium text-emerald-800 flex items-center gap-1">
              <span>Select Malayalam candidate (or press Space for #1):</span>
            </span>
            <button
              type="button"
              onClick={() => setShowSuggestions(false)}
              className="p-0.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              title="Close candidate bar"
              aria-label="Close suggestions"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pt-2 pb-1 px-1 no-scrollbar">
            {candidates.map((cand, idx) => (
              <button
                key={`${cand}-${idx}`}
                type="button"
                onClick={() => commitCandidate(cand, true)}
                className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 whitespace-nowrap active:scale-95 touch-manipulation cursor-pointer ${
                  activeCandidateIdx === idx
                    ? 'bg-[#165B33] text-white shadow-sm ring-2 ring-emerald-600/30 font-semibold'
                    : 'bg-emerald-50 text-slate-800 border border-emerald-200 hover:bg-emerald-100'
                }`}
                role="option"
                aria-selected={activeCandidateIdx === idx}
              >
                <span className="text-[10px] opacity-75 font-mono">{idx + 1}.</span>
                <span>{cand}</span>
                {activeCandidateIdx === idx && <Check className="h-3 w-3 text-emerald-100 ml-0.5" />}
              </button>
            ))}

            {/* Option to keep raw English text if desired */}
            {activeWordInfo && (
              <button
                type="button"
                onClick={() => commitCandidate(activeWordInfo.word, true)}
                className="min-h-[38px] px-2.5 py-1.5 rounded-xl text-xs font-mono text-slate-500 bg-slate-50 hover:bg-slate-100 border border-slate-200 whitespace-nowrap"
                title="Keep English letters as typed"
              >
                Keep: {activeWordInfo.word}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Mode active hint / helper text */}
      <div className="mt-1 flex items-center justify-between text-[11px] text-[#414B32]/75">
        <span>
          {helperText ||
            (mode === 'ml'
              ? "💡 Malayalam mode active: Type phonetically (e.g., 'malayalam' → മലയാളം, 'thulasi' → തുളസി). Space commits."
              : 'English mode active. Existing Malayalam text is preserved when switching.')}
        </span>
      </div>
    </div>
  )
}
