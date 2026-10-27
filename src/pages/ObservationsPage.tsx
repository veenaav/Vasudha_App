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
    <div className="mx-auto max-w-lg px-4 py-5 sm:px-6 space-y-5">
      {/* Editorial Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#165B33]">
            Biodiversity Archive
          </span>
          <h1 className="font-heading text-2xl sm:text-[28px] font-semibold tracking-wide text-slate-900">
            My Records
          </h1>
          <p className="text-xs text-slate-500">
            {observations.length} {observations.length === 1 ? 'record' : 'records'} stored locally on device
          </p>
        </div>

        <div className="flex items-center gap-2">
          {observations.length > 0 && (
            <button
              type="button"
              onClick={() => downloadDarwinCoreExport(filteredObservations)}
              className="flex h-11 px-3 items-center gap-1.5 rounded-2xl bg-white border border-slate-200 text-slate-700 shadow-xs hover:bg-slate-50 text-xs font-medium transition-all active:scale-95"
              title="Export observations in Darwin Core (DwC) standard JSON format"
              aria-label="Export Darwin Core JSON"
            >
              <Download className="h-4 w-4 text-[#165B33]" />
              <span className="hidden sm:inline">DwC Export</span>
            </button>
          )}

          <Link
            to="/new-observation"
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-r from-[#165B33] to-[#1E7B46] text-white border border-emerald-600/30 shadow-sm hover:from-[#134D2C] hover:to-[#17663A] transition-all active:scale-95"
            title="Record New Observation"
            aria-label="Record New Observation"
          >
            <PlusCircle className="h-5 w-5 text-white" />
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
                className={`rounded-full px-3.5 py-1.5 font-medium tracking-wider uppercase transition-all whitespace-nowrap active:scale-95 ${
                  selectedFilter === filter
                    ? 'bg-[#165B33] text-white shadow-xs border border-transparent'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {filter === 'All' ? `All (${observations.length})` : filter}
              </button>
            ))}
          </div>

          {/* Tag filter pills (if any observations have tags) */}
          {availableTags.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar text-xs border-t border-slate-100">
              <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 shrink-0 mr-1">
                <TagIcon className="h-3 w-3 text-[#165B33]" />
                Tags:
              </span>

              {selectedTag && (
                <button
                  type="button"
                  onClick={() => setSelectedTag(null)}
                  className="inline-flex items-center gap-1 rounded-full bg-rose-50 border border-rose-200 px-2.5 py-1 text-[11px] font-medium text-rose-700 whitespace-nowrap active:scale-95"
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
                      ? 'bg-emerald-700 text-white border border-emerald-700 shadow-2xs'
                      : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  <span>#{tag.name}</span>
                  <span className={`text-[10px] ${selectedTag === tag.id ? 'text-emerald-200' : 'text-slate-400'}`}>
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
        <div className="py-12 text-center text-sm text-slate-500">
          <p>Loading observations...</p>
        </div>
      ) : filteredObservations.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-xs">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 border border-emerald-100 text-[#165B33]">
            <Leaf className="h-7 w-7" />
          </div>
          <h2 className="mt-4 font-heading text-xl font-semibold text-slate-900">
            {observations.length === 0 ? 'No observations recorded yet' : `No "${selectedFilter}" observations`}
          </h2>
          <p className="mt-1.5 text-xs text-slate-500 max-w-xs mx-auto">
            {observations.length === 0
              ? 'Capture species, Malayalam local names, GPS coordinates, and photographs in the field.'
              : 'Try selecting a different filter above.'}
          </p>
          {observations.length === 0 && (
            <Link
              to="/new-observation"
              className="mt-6 inline-flex min-h-[48px] items-center gap-2 rounded-full bg-gradient-to-r from-[#165B33] to-[#1E7B46] px-6 py-3 text-sm font-semibold tracking-wider uppercase text-white shadow-md hover:from-[#134D2C] hover:to-[#17663A] transition-all active:scale-95"
            >
              <PlusCircle className="h-4 w-4 text-white" />
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
