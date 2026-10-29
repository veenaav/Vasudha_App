import { useState, useMemo } from 'react'
import {
  MANAGED_TAGS,
  TAG_CATEGORIES,
  type Tag,
  type TagCategory,
  getTagById,
} from '@/lib/tagCatalogue'
import { Search, Tag as TagIcon, X, Check, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Color styles per category for clear visual differentiation in dark mode
const CATEGORY_STYLES: Record<TagCategory, { badge: string; chip: string; dot: string }> = {
  Habitat: {
    badge: 'bg-[#133D2F] text-[#A6F16A] border-[#1C4D3C]',
    chip: 'bg-[#0D2D22] text-[#A6F16A] border-[#1C4D3C]',
    dot: 'bg-[#A6F16A]',
  },
  'Ecological role': {
    badge: 'bg-[#0A2E35] text-[#20D6A0] border-[#145350]',
    chip: 'bg-[#0A2E35] text-[#20D6A0] border-[#145350]',
    dot: 'bg-[#20D6A0]',
  },
  'Activity or behaviour': {
    badge: 'bg-amber-950/60 text-amber-300 border-amber-800/60',
    chip: 'bg-amber-950/60 text-amber-200 border-amber-800/60',
    dot: 'bg-amber-400',
  },
  Conservation: {
    badge: 'bg-rose-950/60 text-rose-300 border-rose-800/60',
    chip: 'bg-rose-950/60 text-rose-200 border-rose-800/60',
    dot: 'bg-rose-400',
  },
  'Observation context': {
    badge: 'bg-purple-950/60 text-purple-300 border-purple-800/60',
    chip: 'bg-purple-950/60 text-purple-200 border-purple-800/60',
    dot: 'bg-purple-400',
  },
}

// Curated essential tags for rapid, compact 1-tap tagging without overwhelming the form
const ESSENTIAL_TAG_IDS = [
  'eco_pollinator', // Pollinator
  'con_medicinal', // Medicinal / Ethnobotanical
  'con_endemic_western_ghats', // Endemic to Western Ghats
  'con_iucn_threatened', // IUCN Threatened
  'con_invasive', // Invasive Alien Species
  'hab_urban_park', // Urban Park / Garden
  'hab_wetland', // Wetland / Marsh
  'hab_sacred_grove', // Sacred Grove (Kavu)
  'act_nesting', // Nesting / Breeding
  'ctx_night_survey', // Night Survey / Nocturnal
]

interface TagSelectorProps {
  selectedTagIds: string[]
  onChange: (tagIds: string[]) => void
  disabled?: boolean
}

export default function TagSelector({
  selectedTagIds,
  onChange,
  disabled = false,
}: TagSelectorProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<TagCategory | 'All'>('All')

  // Selected tags objects
  const selectedTags = useMemo(() => {
    return selectedTagIds
      .map((id) => getTagById(id))
      .filter((t): t is Tag => t !== undefined)
  }, [selectedTagIds])

  // Essential tags objects for the compact horizontal scroll
  const essentialTags = useMemo(() => {
    return ESSENTIAL_TAG_IDS.map((id) => getTagById(id)).filter((t): t is Tag => t !== undefined)
  }, [])

  // Filtered catalogue tags based on search query and category filter
  const filteredTags = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    return MANAGED_TAGS.filter((tag) => {
      const matchesCategory =
        activeCategoryFilter === 'All' || tag.category === activeCategoryFilter
      const matchesSearch =
        !q ||
        tag.label.toLowerCase().includes(q) ||
        tag.category.toLowerCase().includes(q) ||
        (tag.description && tag.description.toLowerCase().includes(q))
      return matchesCategory && matchesSearch
    })
  }, [searchQuery, activeCategoryFilter])

  // Toggle selection of a tag
  const handleToggleTag = (tagId: string) => {
    if (disabled) return
    if (selectedTagIds.includes(tagId)) {
      onChange(selectedTagIds.filter((id) => id !== tagId))
    } else {
      onChange([...selectedTagIds, tagId])
    }
  }

  // Remove tag chip
  const handleRemoveTag = (tagId: string) => {
    if (disabled) return
    onChange(selectedTagIds.filter((id) => id !== tagId))
  }

  return (
    <div className="space-y-3">
      {/* 1. Selected Tags as Removable Chips (compact) */}
      {selectedTags.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold tracking-wider uppercase text-[#B2C8BA]">
              Selected Tags ({selectedTags.length})
            </span>
            {!disabled && (
              <button
                type="button"
                onClick={() => onChange([])}
                className="text-[11px] text-[#A6F16A] hover:underline"
              >
                Clear all tags
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5 p-2 rounded-2xl bg-[#061812] border border-[#1C4D3C] min-h-[44px] items-center">
            {selectedTags.map((tag) => {
              const style = CATEGORY_STYLES[tag.category]
              return (
                <span
                  key={tag.id}
                  className={`inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1 text-xs font-medium transition-all shadow-2xs ${style.chip}`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                  <span>{tag.label}</span>
                  {!disabled && (
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag.id)}
                      className="ml-0.5 rounded-full p-0.5 hover:bg-white/20 transition-colors"
                      title={`Remove tag ${tag.label}`}
                      aria-label={`Remove tag ${tag.label}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </span>
              )
            })}
          </div>
        </div>
      )}

      {/* 2. Compact Essential Tags (Horizontal Scroll) */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-semibold tracking-wider uppercase text-[#B2C8BA]">
            Essential Tags
          </span>
          <span className="text-[11px] text-[#7B9586]">Swipe to browse</span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5 no-scrollbar -mx-0.5 px-0.5">
          {essentialTags.map((tag) => {
            const isSelected = selectedTagIds.includes(tag.id)
            return (
              <button
                key={tag.id}
                type="button"
                disabled={disabled}
                onClick={() => handleToggleTag(tag.id)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold tracking-wide whitespace-nowrap transition-all border shrink-0 ${
                  isSelected
                    ? 'bg-[#A6F16A] text-[#061812] border-[#A6F16A] shadow-xs font-bold'
                    : 'bg-[#061812] text-[#B2C8BA] border-[#1C4D3C] hover:border-[#A6F16A]/50 hover:text-white'
                }`}
              >
                {isSelected ? (
                  <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                ) : (
                  <TagIcon className="h-3 w-3 text-[#7B9586]" />
                )}
                <span>{tag.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* 3. Popup Picker Trigger Button */}
      <div>
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsPickerOpen(true)}
          className="w-full flex items-center justify-center gap-2 min-h-[42px] rounded-xl border border-dashed border-[#1C4D3C] bg-[#061812] p-2.5 text-xs font-semibold text-[#A6F16A] hover:bg-[#133D2F] hover:border-[#A6F16A]/50 transition-all active:scale-[0.99] cursor-pointer"
        >
          <Search className="h-3.5 w-3.5" />
          <span>Browse All Tags & Categories ({MANAGED_TAGS.length})</span>
        </button>
      </div>

      {/* 4. Simplified Popup Picker Modal */}
      {isPickerOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="tag-picker-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150"
          onClick={() => setIsPickerOpen(false)}
        >
          <div
            className="relative w-full max-w-lg rounded-3xl border border-[#1C4D3C] bg-[#0D2D22] p-5 sm:p-6 shadow-2xl shadow-black/80 text-[#F0F5EF] flex flex-col max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#1C4D3C] pb-3 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#061812] border border-[#1C4D3C] text-[#A6F16A]">
                  <TagIcon className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 id="tag-picker-title" className="text-base sm:text-lg font-bold text-white">
                    Classification Tags Catalogue
                  </h3>
                  <p className="text-[11px] text-[#7B9586]">
                    {selectedTagIds.length} of {MANAGED_TAGS.length} tags selected
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPickerOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-[#B2C8BA] hover:text-white hover:bg-[#133D2F] transition-colors"
                aria-label="Close tag picker"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Search Input & Category Filters */}
            <div className="pt-3.5 pb-2.5 space-y-2.5 shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7B9586]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tags by name, category, or keyword..."
                  className="w-full min-h-[42px] rounded-xl border border-[#1C4D3C] bg-[#061812] pl-9 pr-8 py-2 text-xs sm:text-sm text-[#F0F5EF] placeholder-[#7B9586] outline-none focus:border-[#A6F16A] focus:ring-1 focus:ring-[#A6F16A]"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#7B9586] hover:text-[#F0F5EF] p-1"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[11px]">
                <span className="text-[#7B9586] flex items-center gap-1 shrink-0 mr-0.5">
                  <Filter className="h-3 w-3" />
                </span>
                <button
                  type="button"
                  onClick={() => setActiveCategoryFilter('All')}
                  className={`rounded-full px-2.5 py-1 font-medium transition-all shrink-0 ${
                    activeCategoryFilter === 'All'
                      ? 'bg-[#A6F16A] text-[#061812] shadow-2xs font-bold'
                      : 'bg-[#0D2D22] text-[#B2C8BA] border border-[#1C4D3C] hover:border-[#A6F16A]/40'
                  }`}
                >
                  All ({MANAGED_TAGS.length})
                </button>
                {TAG_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategoryFilter(cat)}
                    className={`rounded-full px-2.5 py-1 font-medium transition-all shrink-0 ${
                      activeCategoryFilter === cat
                        ? 'bg-[#A6F16A] text-[#061812] shadow-2xs font-bold'
                        : 'bg-[#0D2D22] text-[#B2C8BA] border border-[#1C4D3C] hover:border-[#A6F16A]/40'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable Filtered Catalogue List */}
            <div className="flex-1 overflow-y-auto rounded-2xl border border-[#1C4D3C] bg-[#061812] p-2 space-y-1.5 min-h-48">
              {filteredTags.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#7B9586]">
                  <TagIcon className="h-6 w-6 mx-auto mb-1 opacity-40 text-[#A6F16A]" />
                  <p>No matching approved tags found.</p>
                  <p className="text-[10px] mt-0.5 text-[#7B9586]">
                    Try another keyword or select All Categories.
                  </p>
                </div>
              ) : (
                filteredTags.map((tag) => {
                  const isSelected = selectedTagIds.includes(tag.id)
                  const style = CATEGORY_STYLES[tag.category]

                  return (
                    <button
                      key={tag.id}
                      type="button"
                      disabled={disabled}
                      onClick={() => handleToggleTag(tag.id)}
                      className={`w-full flex items-start justify-between gap-2 p-2.5 rounded-xl text-left transition-all border cursor-pointer ${
                        isSelected
                          ? 'bg-[#133D2F] border-[#A6F16A] text-white shadow-2xs'
                          : 'bg-[#0D2D22] border-[#1C4D3C] hover:border-[#A6F16A]/40 text-[#F0F5EF]'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-semibold">{tag.label}</span>
                          <span
                            className={`inline-block text-[9px] px-1.5 py-0.2 rounded-md border font-medium uppercase tracking-wider ${style.badge}`}
                          >
                            {tag.category}
                          </span>
                        </div>
                        {tag.description && (
                          <p className="text-[11px] text-[#B2C8BA] mt-0.5 leading-snug">
                            {tag.description}
                          </p>
                        )}
                      </div>

                      <div
                        className={`h-5 w-5 rounded-md flex items-center justify-center shrink-0 border transition-all mt-0.5 ${
                          isSelected
                            ? 'bg-[#A6F16A] text-[#061812] border-[#A6F16A]'
                            : 'border-[#1C4D3C] bg-[#061812]'
                        }`}
                      >
                        {isSelected && <Check className="h-3.5 w-3.5 stroke-[2.5]" />}
                      </div>
                    </button>
                  )
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="mt-4 pt-2 border-t border-[#1C4D3C] flex items-center justify-between gap-3 shrink-0">
              <span className="text-xs text-[#7B9586]">
                <strong className="text-white font-semibold">{selectedTagIds.length}</strong> tags selected
              </span>
              <Button
                type="button"
                onClick={() => setIsPickerOpen(false)}
                className="bg-gradient-to-r from-[#A6F16A] to-[#20D6A0] text-[#061812] hover:opacity-95 font-bold text-xs sm:text-sm px-6 rounded-xl active:scale-95 shadow-md"
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
