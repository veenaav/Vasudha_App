import { useState, useRef, useEffect, useCallback } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
  hint?: string
}

export interface AppSelectProps {
  id?: string
  value?: string
  onChange: (value: string) => void
  options: (SelectOption | string)[]
  placeholder?: string
  disabled?: boolean
  className?: string
  required?: boolean
  'aria-label'?: string
}

export function AppSelect({
  id,
  value = '',
  onChange,
  options,
  placeholder = 'Select an option...',
  disabled = false,
  className,
  'aria-label': ariaLabel,
}: AppSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState<number>(-1)

  // Normalize options to SelectOption[]
  const normalizedOptions: SelectOption[] = options.map((opt) =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  )

  const selectedOption = normalizedOptions.find((opt) => opt.value === value)

  // Close when clicking outside
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [isOpen])

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (disabled) return

      if (e.key === 'Escape') {
        setIsOpen(false)
        return
      }

      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        if (!isOpen) {
          setIsOpen(true)
        } else if (activeIndex >= 0 && activeIndex < normalizedOptions.length) {
          const opt = normalizedOptions[activeIndex]
          if (!opt.disabled) {
            onChange(opt.value)
            setIsOpen(false)
          }
        }
        return
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        if (!isOpen) {
          setIsOpen(true)
          setActiveIndex(0)
        } else {
          setActiveIndex((prev) =>
            prev < normalizedOptions.length - 1 ? prev + 1 : 0
          )
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        if (!isOpen) {
          setIsOpen(true)
          setActiveIndex(normalizedOptions.length - 1)
        } else {
          setActiveIndex((prev) =>
            prev > 0 ? prev - 1 : normalizedOptions.length - 1
          )
        }
      }
    },
    [disabled, isOpen, activeIndex, normalizedOptions, onChange]
  )

  const handleSelect = (optValue: string, isOptDisabled?: boolean) => {
    if (disabled || isOptDisabled) return
    onChange(optValue)
    setIsOpen(false)
  }

  return (
    <div
      ref={containerRef}
      className={cn('relative w-full', className)}
      onKeyDown={handleKeyDown}
    >
      {/* Trigger Button with Enlarged Arrow & Proper Padding */}
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel || placeholder}
        className={cn(
          'relative w-full min-h-[50px] rounded-2xl border px-4.5 py-3 pr-12 text-left font-medium text-base transition-all duration-200 outline-none flex items-center justify-between cursor-pointer shadow-xs active:scale-[0.995]',
          isOpen
            ? 'border-[#A6F16A] ring-1 ring-[#A6F16A] bg-[#0A241C]'
            : 'border-[#1C4D3C] bg-[#061812] hover:border-[#1C4D3C]/80 hover:bg-[#082017]',
          disabled && 'cursor-not-allowed opacity-50 bg-[#061812]'
        )}
      >
        <span
          className={cn(
            'truncate block text-sm sm:text-base',
            !selectedOption ? 'text-[#7B9586]' : 'text-[#F0F5EF]'
          )}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>

        {/* Enlarged Chevron Icon with Themed Lime Color & Smooth Rotation */}
        <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center h-6 w-6 rounded-full bg-[#133D2F]/60 border border-[#1C4D3C]/60 text-[#A6F16A] transition-colors">
          <ChevronDown
            className={cn(
              'h-4.5 w-4.5 text-[#A6F16A] transition-transform duration-200 stroke-[2.5]',
              isOpen && 'rotate-180'
            )}
          />
        </span>
      </button>

      {/* Dropdown Options Popup (Menu) with Inset Scrollbar & Light Color */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 rounded-2xl border border-[#1C4D3C] bg-[#0D2D22] p-2 shadow-2xl shadow-black/90 backdrop-blur-md animate-in fade-in-0 zoom-in-95 duration-150 overflow-hidden">
          <ul
            role="listbox"
            tabIndex={-1}
            className="max-h-60 overflow-y-auto dropdown-scrollbar space-y-1 pr-1.5"
          >
            {normalizedOptions.map((opt, index) => {
              const isSelected = opt.value === value
              const isHighlighted = activeIndex === index

              return (
                <li
                  key={opt.value || `opt-${index}`}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(opt.value, opt.disabled)}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={cn(
                    'w-full min-h-[44px] px-3.5 py-2.5 rounded-xl text-sm sm:text-base font-medium text-left flex items-center justify-between transition-colors cursor-pointer select-none',
                    isSelected
                      ? 'bg-[#133D2F] text-[#A6F16A] font-bold shadow-2xs border border-[#1C4D3C]'
                      : isHighlighted
                      ? 'bg-[#133D2F]/70 text-[#A6F16A]'
                      : 'text-[#F0F5EF] hover:bg-[#133D2F]/60 hover:text-[#A6F16A]',
                    opt.disabled &&
                      'cursor-not-allowed opacity-40 hover:bg-transparent hover:text-[#7B9586]'
                  )}
                >
                  <div className="flex flex-col">
                    <span>{opt.label}</span>
                    {opt.hint && (
                      <span className="text-[11px] text-[#7B9586] font-normal">
                        {opt.hint}
                      </span>
                    )}
                  </div>

                  {isSelected && (
                    <Check className="h-4.5 w-4.5 text-[#A6F16A] shrink-0 ml-2 stroke-[2.5]" />
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
export default AppSelect
