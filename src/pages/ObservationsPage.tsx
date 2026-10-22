import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { PlusCircle, Leaf } from 'lucide-react'
import { db, type Observation } from '@/db/database'
import ObservationCard from '@/components/ObservationCard'

export default function ObservationsPage() {
  const [observations, setObservations] = useState<Observation[]>([])
  const [selectedFilter, setSelectedFilter] = useState<'All' | 'Identified' | 'Needs verification' | 'Unknown'>('All')
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

  // Filter observations based on selected pill
  const filteredObservations = useMemo(() => {
    if (selectedFilter === 'All') return observations
    return observations.filter((obs) => obs.identificationStatus === selectedFilter)
  }, [observations, selectedFilter])

  return (
    <div className="mx-auto max-w-lg px-4 py-5 sm:px-6 space-y-5">
      {/* Editorial Header (MOYA style) */}
      <div className="flex items-center justify-between border-b border-white/15 pb-4">
        <div>
          <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#C5D1BD]">
            Biodiversity Archive
          </span>
          <h1 className="font-heading text-2xl sm:text-[28px] font-normal tracking-wide text-[#F5F0E4]">
            Saved Observations
          </h1>
          <p className="text-xs text-[#C5D1BD]">
            {observations.length} {observations.length === 1 ? 'record' : 'records'} stored locally on device
          </p>
        </div>

        <Link
          to="/new-observation"
          className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#263D2B] text-[#F5F0E4] border border-[#C5D1BD]/40 shadow-sm hover:bg-[#324D38] transition-all active:scale-95"
          title="Record New Observation"
          aria-label="Record New Observation"
        >
          <PlusCircle className="h-5 w-5 text-[#C5D1BD]" />
        </Link>
      </div>

      {/* Filter Pills (MOYA Screen 3 style: ALL, BEST SELLER, STARTER KIT) */}
      {observations.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
          {(['All', 'Identified', 'Needs verification', 'Unknown'] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setSelectedFilter(filter)}
              className={`rounded-full px-3.5 py-1.5 font-medium tracking-wider uppercase transition-all whitespace-nowrap active:scale-95 ${
                selectedFilter === filter
                  ? 'bg-[#263D2B] text-[#F5F0E4] border border-[#C5D1BD]/50 shadow-sm'
                  : 'bg-white/5 text-[#C5D1BD] border border-white/15 hover:bg-white/10'
              }`}
            >
              {filter === 'All' ? `All (${observations.length})` : filter}
            </button>
          ))}
        </div>
      )}

      {/* Observations List */}
      {isLoading ? (
        <div className="py-12 text-center text-sm text-[#C5D1BD]">
          <p>Loading observations...</p>
        </div>
      ) : filteredObservations.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-white/25 bg-white/10 backdrop-blur-md p-8 text-center shadow-xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#263D2B] border border-[#C5D1BD]/30 text-[#C5D1BD]">
            <Leaf className="h-7 w-7" />
          </div>
          <h2 className="mt-4 font-heading text-xl font-normal text-[#F5F0E4]">
            {observations.length === 0 ? 'No observations recorded yet' : `No "${selectedFilter}" observations`}
          </h2>
          <p className="mt-1.5 text-xs text-[#C5D1BD] max-w-xs mx-auto">
            {observations.length === 0
              ? 'Capture species, Malayalam local names, GPS coordinates, and photographs in the field.'
              : 'Try selecting a different filter above.'}
          </p>
          {observations.length === 0 && (
            <Link
              to="/new-observation"
              className="mt-6 inline-flex min-h-[48px] items-center gap-2 rounded-full bg-[#263D2B] px-6 py-3 text-sm font-medium tracking-wider uppercase text-[#F5F0E4] border border-[#C5D1BD]/40 shadow-sm hover:bg-[#324D38] transition-all active:scale-95"
            >
              <PlusCircle className="h-4 w-4 text-[#C5D1BD]" />
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
