import { useState, useMemo } from 'react'
import {
  MANAGED_TAGS,
  TAG_CATEGORIES,
  type Tag,
  type TagCategory,
  getTagById,
} from '@/lib/tagCatalogue'
import { Search, Tag as TagIcon, X, Check, Filter } from 'lucide-react'

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
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<TagCategory | 'All'>('All')

  // Selected tags objects
  const selectedTags = useMemo(() => {
    return selectedTagIds
      .map((id) => getTagById(id))
      .filter((t): t is Tag => t !== undefined)
  }, [selectedTagIds])

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
      {/* 1. Selected Tags as Removable Chips */}
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

          <div className="flex flex-wrap gap-1.5 p-2 rounded-2xl bg-[#061812] border border-[#1C4D3C] min-h-[46px] items-center">
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

      {/* 2. Tag Search & Category Filter Header */}
      <div className="space-y-2">
        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7B9586]" />
          <input
            type="text"
            value={searchQuery}
            disabled={disabled}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search approved tags (e.g. Pollinator, Western Ghats, Sacred Grove)..."
            className="w-full min-h-[42px] rounded-xl border border-[#1C4D3C] bg-[#061812] pl-9 pr-8 py-2 text-xs sm:text-sm text-[#F0F5EF] placeholder-[#7B9586] outline-none focus:border-[#A6F16A] focus:ring-1 focus:ring-[#A6F16A] disabled:cursor-not-allowed disabled:opacity-50"
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

        {/* Category Filter Pills (Horizontal scrollable on mobile) */}
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
            All Categories
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

      {/* 3. Approved Catalogue List */}
      <div className="max-h-52 overflow-y-auto rounded-2xl border border-[#1C4D3C] bg-[#061812] p-2 space-y-1.5">
        {filteredTags.length === 0 ? (
          <div className="py-6 text-center text-xs text-[#7B9586]">
            <TagIcon className="h-6 w-6 mx-auto mb-1 opacity-40 text-[#A6F16A]" />
            <p>No matching approved tags found.</p>
            <p className="text-[10px] mt-0.5 text-[#7B9586]">Only curated catalogue tags can be applied.</p>
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
                className={`w-full flex items-start justify-between gap-2 p-2 rounded-xl text-left transition-all border ${
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
                    <p className="text-[11px] text-[#B2C8BA] mt-0.5 leading-snug line-clamp-1">
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

      <p className="text-[10px] text-[#7B9586] leading-relaxed">
        🏷️ Tags are optional classification metadata from the curated catalogue. They do not replace
        structured fields like species identification or location.
      </p>
    </div>
  )
}
