import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { PlusCircle, Leaf, Download, Tag as TagIcon, X } from 'lucide-react'
import { db, type Observation } from '@/db/database'
import ObservationCard from '@/components/ObservationCard'
import { getTagById } from '@/lib/tagCatalogue'
import { downloadDarwinCoreExport } from '@/lib/darwinCoreExport'

export default function ObservationsPage() {
  const [observations, setObservations] = useState<Observation[]>([])
  const [selectedFilter, setSelectedFilter] = useState<'All' | 'Identified' | 'Needs verification' | 'Unknown'>('All')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadObservations = async () => {
    try {
      const items = await db.observations.toArray()
      // Sort by creation / recording date descending
      const sorted = [...items].sort((a, b) => {
        const tA = new Date(b.createdAt || b.recordedAt).getTime()
        const tB = new Date(a.createdAt || a.recordedAt).getTime()
        return tA - tB
      })
      setObservations(sorted)
    } catch (err) {
      console.error('Failed to load observations:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadObservations()
  }, [])

  const handleDeleteObservation = async (id: string) => {
    try {
      await db.observations.delete(id)
      setObservations((current) => current.filter((obs) => obs.id !== id))
    } catch (error) {
      alert(`Failed to delete observation: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Derive unique tags used across all observations
  const availableTags = useMemo(() => {
    const counts: Record<string, number> = {}
    observations.forEach((obs) => {
      obs.tags?.forEach((t) => {
        counts[t] = (counts[t] || 0) + 1
      })
    })
    return Object.entries(counts).map(([id, count]) => {
      const tag = getTagById(id)
      return {
        id,
        name: tag?.label || id,
        category: tag?.category || 'General',
        count,
      }
    })
  }, [observations])

  // Filter observations based on selected status pill and tag
  const filteredObservations = useMemo(() => {
    return observations.filter((obs) => {
      if (selectedFilter !== 'All' && obs.identificationStatus !== selectedFilter) {
        return false
      }
      if (selectedTag && (!obs.tags || !obs.tags.includes(selectedTag))) {
        return false
      }
      return true
    })
  }, [observations, selectedFilter, selectedTag])

  return (
    <div className="mx-auto max-w-lg px-4 py-5 sm:px-6 space-y-5 text-[#F0F5EF]">
      {/* Editorial Header */}
      <div className="flex items-center justify-between border-b border-[#1C4D3C] pb-4">
        <div>
          <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#A6F16A]">
            Biodiversity Archive
          </span>
          <h1 className="text-2xl sm:text-[28px] font-extrabold tracking-tight text-white">
            My Records
          </h1>
          <p className="text-xs text-[#B2C8BA]">
            {observations.length} {observations.length === 1 ? 'record' : 'records'} stored locally on device
          </p>
        </div>

        <div className="flex items-center gap-2">
          {observations.length > 0 && (
            <button
              type="button"
              onClick={() => downloadDarwinCoreExport(filteredObservations)}
              className="flex h-11 px-3.5 items-center gap-1.5 rounded-2xl bg-[#0D2D22] border border-[#1C4D3C] text-[#A6F16A] shadow-sm hover:bg-[#133D2F] text-xs font-semibold transition-all active:scale-95"
              title="Export observations in Darwin Core (DwC) standard JSON format"
              aria-label="Export Darwin Core JSON"
            >
              <Download className="h-4 w-4 text-[#20D6A0]" />
              <span className="hidden sm:inline">DwC Export</span>
            </button>
          )}

          <Link
            to="/new-observation"
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-r from-[#A6F16A] to-[#20D6A0] text-[#061812] shadow-lg shadow-[#20D6A0]/20 hover:opacity-95 transition-all active:scale-95"
            title="Record New Observation"
            aria-label="Record New Observation"
          >
            <PlusCircle className="h-5 w-5 text-[#061812]" />
          </Link>
        </div>
      </div>

      {/* Filter Pills */}
      {observations.length > 0 && (
        <div className="space-y-2">
          {/* Status filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
            {(['All', 'Identified', 'Needs verification', 'Unknown'] as const).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setSelectedFilter(filter)}
                className={`rounded-full px-3.5 py-1.5 font-semibold tracking-wider uppercase transition-all whitespace-nowrap active:scale-95 ${
                  selectedFilter === filter
                    ? 'bg-[#A6F16A] text-[#061812] shadow-md shadow-[#A6F16A]/20'
                    : 'bg-[#0D2D22] text-[#B2C8BA] border border-[#1C4D3C] hover:border-[#A6F16A]/40'
                }`}
              >
                {filter === 'All' ? `All (${observations.length})` : filter}
              </button>
            ))}
          </div>

          {/* Tag filter pills (if any observations have tags) */}
          {availableTags.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar text-xs border-t border-[#1C4D3C]/60">
              <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-[#7B9586] shrink-0 mr-1">
                <TagIcon className="h-3 w-3 text-[#A6F16A]" />
                Tags:
              </span>

              {selectedTag && (
                <button
                  type="button"
                  onClick={() => setSelectedTag(null)}
                  className="inline-flex items-center gap-1 rounded-full bg-rose-950/60 border border-rose-800/60 px-2.5 py-1 text-[11px] font-medium text-rose-300 whitespace-nowrap active:scale-95"
                >
                  <X className="h-3 w-3" />
                  <span>Clear Tag</span>
                </button>
              )}

              {availableTags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => setSelectedTag(selectedTag === tag.id ? null : tag.id)}
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition-all whitespace-nowrap active:scale-95 ${
                    selectedTag === tag.id
                      ? 'bg-[#A6F16A] text-[#061812] font-bold shadow-sm'
                      : 'bg-[#0D2D22] text-[#B2C8BA] border border-[#1C4D3C] hover:border-[#A6F16A]/40'
                  }`}
                >
                  <span>#{tag.name}</span>
                  <span className={`text-[10px] ${selectedTag === tag.id ? 'text-[#061812]' : 'text-[#7B9586]'}`}>
                    ({tag.count})
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Observations List */}
      {isLoading ? (
        <div className="py-12 text-center text-sm text-[#7B9586]">
          <p>Loading observations...</p>
        </div>
      ) : filteredObservations.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[#1C4D3C] bg-[#0D2D22] p-8 text-center shadow-xl shadow-[#061812]/50">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#133D2F] border border-[#1C4D3C] text-[#A6F16A]">
            <Leaf className="h-7 w-7" />
          </div>
          <h2 className="mt-4 text-xl font-bold text-white">
            {observations.length === 0 ? 'No observations recorded yet' : `No "${selectedFilter}" observations`}
          </h2>
          <p className="mt-1.5 text-xs text-[#B2C8BA] max-w-xs mx-auto">
            {observations.length === 0
              ? 'Capture species, Malayalam local names, GPS coordinates, and photographs in the field.'
              : 'Try selecting a different filter above.'}
          </p>
          {observations.length === 0 && (
            <Link
              to="/new-observation"
              className="mt-6 inline-flex min-h-[48px] items-center gap-2 rounded-full bg-gradient-to-r from-[#A6F16A] to-[#20D6A0] text-[#061812] px-6 py-3 text-sm font-extrabold tracking-wider uppercase shadow-lg shadow-[#20D6A0]/20 hover:opacity-95 transition-all active:scale-95"
            >
              <PlusCircle className="h-4 w-4 text-[#061812]" />
              <span>Record First Observation</span>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredObservations.map((obs) => (
            <ObservationCard
              key={obs.id}
              observation={obs}
              onDelete={handleDeleteObservation}
            />
          ))}
        </div>
      )}
    </div>
  )
}
