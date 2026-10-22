import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PlusCircle, ArrowRight, Leaf, Calendar, FolderGit2, BookOpen } from 'lucide-react'
import { db, type Observation } from '@/db/database'

export default function HomePage() {
  const [recentObservations, setRecentObservations] = useState<Observation[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const loadData = async () => {
      try {
        const allObservations = await db.observations.toArray()

        if (!isMounted) return

        // Sort by recordedAt / createdAt descending and take the latest 3
        const sorted = [...allObservations].sort((a, b) => {
          const tA = new Date(b.createdAt || b.recordedAt || 0).getTime() || 0
          const tB = new Date(a.createdAt || a.recordedAt || 0).getTime() || 0
          return tA - tB
        })
        setRecentObservations(sorted.slice(0, 3))
      } catch (err) {
        console.error('Error loading data for home page:', err)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    loadData()
    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div className="mx-auto max-w-lg px-4 py-4 sm:px-6 space-y-4">
      {/* 1. Shrishti Name & Simple Header */}
      <section className="text-center pt-2">
        <h1 className="font-heading text-2xl sm:text-[28px] font-normal tracking-wide text-[#F5F0E4]">
          Shrishti
        </h1>
        <p className="mt-1 text-xs text-[#C5D1BD]">
          Biodiversity Field Platform
        </p>
      </section>

      {/* 2. Single Prominent "New Observation" Button */}
      <section>
        <Link
          to="/new-observation"
          className="flex min-h-[50px] w-full items-center justify-center gap-2.5 rounded-2xl bg-[#263D2B] px-6 py-3.5 text-base sm:text-lg font-medium text-[#F5F0E4] border border-[#C5D1BD]/40 shadow-lg transition-all hover:bg-[#344F3A] hover:border-[#C5D1BD]/60 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#C5D1BD]/50"
        >
          <PlusCircle className="h-5 w-5 text-[#C5D1BD]" />
          <span>New Observation</span>
        </Link>
      </section>

      {/* Navigation Buttons: Projects & My Records */}
      <div className="grid grid-cols-1 gap-2.5">
        {/* Projects Button */}
        <Link
          to="/projects"
          className="flex items-center justify-between rounded-2xl
               border border-white/20 bg-white/10
               p-4 text-[#F5F0E4] shadow-xl
               backdrop-blur-md transition-colors
               hover:bg-white/15 active:scale-[0.99]"
        >
          <span className="flex items-center gap-3">
            <FolderGit2 className="h-5 w-5 text-[#C5D1BD]" />
            <span className="font-medium text-base">Projects</span>
          </span>

          <ArrowRight className="h-5 w-5 text-[#C5D1BD]" />
        </Link>

        {/* My Records Button */}
        <Link
          to="/observations"
          className="flex items-center justify-between rounded-2xl
               border border-white/20 bg-white/10
               p-4 text-[#F5F0E4] shadow-xl
               backdrop-blur-md transition-colors
               hover:bg-white/15 active:scale-[0.99]"
        >
          <span className="flex items-center gap-3">
            <BookOpen className="h-5 w-5 text-[#C5D1BD]" />
            <span className="font-medium text-base">My Records</span>
          </span>

          <ArrowRight className="h-5 w-5 text-[#C5D1BD]" />
        </Link>
      </div>

      {/* 4. Concise Recent Observations Panel with Single "View all" Link */}
      <section className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 sm:p-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/15 pb-3">
          <h2 className="font-heading text-lg font-normal tracking-wide text-[#F5F0E4]">
            Recent Observations
          </h2>
          <Link
            to="/observations"
            className="inline-flex items-center gap-1 text-xs font-medium tracking-wider uppercase text-[#C5D1BD] hover:text-[#F5F0E4] transition-colors"
          >
            <span>View all</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {isLoading ? (
          <div className="py-6 text-center text-xs text-[#C5D1BD]">
            <p>Loading observations...</p>
          </div>
        ) : recentObservations.length === 0 ? (
          <div className="py-6 text-center text-xs text-[#C5D1BD]">
            <p>No observations recorded yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {recentObservations.map((obs) => {
              const photoBlob = obs.photos?.[0] || obs.photo
              const hasPhoto = photoBlob instanceof Blob
              const previewUrl = hasPhoto ? URL.createObjectURL(photoBlob) : null

              return (
                <div key={obs.id} className="flex items-center gap-3.5 py-3 first:pt-3 last:pb-0 group">
                  {/* Thumbnail */}
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/20 bg-black/30 shadow-inner">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt={obs.speciesName || 'Species'}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onLoad={() => {
                          if (previewUrl) URL.revokeObjectURL(previewUrl)
                        }}
                      />
                    ) : (
                      <Leaf className="h-5 w-5 text-[#C5D1BD]/60" />
                    )}
                  </div>

                  {/* Details */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[10px] tracking-wider uppercase font-semibold border ${obs.identificationStatus === 'Identified'
                          ? 'bg-[#263D2B]/90 text-[#C5D1BD] border-[#C5D1BD]/40'
                          : obs.identificationStatus === 'Needs verification'
                            ? 'bg-[#B87555]/25 text-[#E8A585] border-[#B87555]/40'
                            : 'bg-white/10 text-[#C5D1BD] border-white/20'
                          }`}
                      >
                        {obs.identificationStatus || 'Record'}
                      </span>
                      {obs.speciesGroup && (
                        <span className="truncate text-xs text-[#C5D1BD]/80">
                          • {obs.speciesGroup}
                        </span>
                      )}
                    </div>

                    <h3 className="truncate font-heading text-base font-normal text-[#F5F0E4] mt-0.5">
                      {obs.speciesName || 'Unknown species'}
                    </h3>

                    {obs.localName && (
                      <p className="truncate text-xs font-normal text-[#C5D1BD]">
                        {obs.localName}
                      </p>
                    )}
                  </div>

                  {/* Date */}
                  <div className="shrink-0 text-right text-xs text-[#C5D1BD]/75">
                    <span className="flex items-center gap-1 font-medium">
                      <Calendar className="h-3 w-3 text-[#C5D1BD]" />
                      {new Date(obs.recordedAt || obs.createdAt || Date.now()).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
