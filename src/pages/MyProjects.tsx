import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { db, type Project } from '@/db/database'
import { ArrowLeft, ArrowRight, Building2, MapPin, FolderGit2, CheckCircle2, UserCheck } from 'lucide-react'

const STORAGE_KEY = 'shrishti_joined_project_ids'

export const getJoinedProjectIds = (): string[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export const toggleJoinedProject = (projectId: string): string[] => {
  try {
    const current = getJoinedProjectIds()
    let updated: string[]
    if (current.includes(projectId)) {
      updated = current.filter((id) => id !== projectId)
    } else {
      updated = [...current, projectId]
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    return updated
  } catch {
    return []
  }
}

export default function MyProjects() {
  const navigate = useNavigate()
  const [joinedProjects, setJoinedProjects] = useState<Project[]>([])
  const [observationCounts, setObservationCounts] = useState<Record<string, number>>({})
  const [isLoading, setIsLoading] = useState(true)

  const loadData = async () => {
    setIsLoading(true)
    try {
      const joinedIds = getJoinedProjectIds()
      const allProjects = await db.projects.toArray()
      const filtered = allProjects.filter((p) => joinedIds.includes(p.id))
      setJoinedProjects(filtered)

      const counts: Record<string, number> = {}
      for (const p of filtered) {
        counts[p.id] = await db.observations.where('projectId').equals(p.id).count()
      }
      setObservationCounts(counts)
    } catch (err) {
      console.error('Failed to load joined projects:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleLeaveProject = (projectId: string, projectName: string) => {
    if (window.confirm(`Leave project "${projectName}"? You can re-join anytime.`)) {
      toggleJoinedProject(projectId)
      loadData()
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-5 sm:px-6 space-y-5 text-[#F0F5EF]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1C4D3C] pb-4">
        <div>
          <nav className="mb-1 flex items-center gap-1.5 text-xs text-[#7B9586]">
            <Link to="/projects" className="hover:underline flex items-center gap-1 text-[#A6F16A] font-semibold">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>All Projects</span>
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#0D2D22] border border-[#1C4D3C] text-[#A6F16A]">
              <UserCheck className="h-4.5 w-4.5" />
            </div>
            <h1 className="text-2xl sm:text-[28px] font-extrabold tracking-tight text-white">
              My Projects
            </h1>
          </div>
          <p className="mt-0.5 text-xs text-[#B2C8BA]">
            Projects you have joined on this device
          </p>
        </div>

        <Link to="/projects">
          <Button
            variant="outline"
            className="border-[#1C4D3C] bg-[#0D2D22] text-[#A6F16A] hover:bg-[#133D2F] text-xs font-semibold rounded-xl shadow-xs"
          >
            Browse All
          </Button>
        </Link>
      </div>

      {/* Projects List */}
      {isLoading ? (
        <div className="py-12 text-center text-sm text-[#7B9586]">
          <p>Loading your projects...</p>
        </div>
      ) : joinedProjects.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[#1C4D3C] bg-[#0D2D22] p-8 text-center shadow-xl shadow-[#061812]/50">
          <FolderGit2 className="mx-auto h-12 w-12 text-[#7B9586]" />
          <h2 className="mt-3 text-xl font-bold text-white">
            No joined projects yet
          </h2>
          <p className="mt-1.5 text-xs text-[#B2C8BA] max-w-xs mx-auto">
            Browse available biodiversity survey projects and join the ones you are actively collecting data for.
          </p>
          <Link to="/projects" className="inline-block mt-5">
            <Button className="min-h-[46px] bg-gradient-to-r from-[#A6F16A] to-[#20D6A0] text-[#061812] hover:opacity-95 rounded-2xl px-6 text-sm font-bold shadow-md shadow-[#20D6A0]/20">
              Browse Available Projects
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {joinedProjects.map((proj) => (
            <div
              key={proj.id}
              className="rounded-3xl border border-[#1C4D3C] bg-[#0D2D22] p-5 shadow-lg shadow-[#061812]/50 text-[#F0F5EF]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg font-bold text-white truncate">
                      {proj.name}
                    </h2>
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 text-[10px] font-semibold text-amber-300 uppercase">
                      <CheckCircle2 className="h-3 w-3 text-amber-300" />
                      Joined
                    </span>
                  </div>

                  {proj.organization && (
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-[#B2C8BA]">
                      <Building2 className="h-3.5 w-3.5 shrink-0 text-[#20D6A0]" />
                      <span className="truncate">{proj.organization}</span>
                    </p>
                  )}

                  {proj.targetRegion && (
                    <p className="mt-0.5 flex items-center gap-1.5 text-xs text-[#B2C8BA]">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-[#A6F16A]" />
                      <span className="truncate">{proj.targetRegion}</span>
                    </p>
                  )}

                  {proj.description && (
                    <p className="mt-2 text-xs text-[#7B9586] line-clamp-2 leading-relaxed">
                      {proj.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Action row */}
              <div className="mt-4 flex items-center justify-between border-t border-[#1C4D3C] pt-3">
                <span className="text-xs text-[#7B9586]">
                  <strong className="text-white font-bold">{observationCounts[proj.id] ?? 0}</strong>{' '}
                  {observationCounts[proj.id] === 1 ? 'observation' : 'observations'}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleLeaveProject(proj.id, proj.name)}
                    className="text-xs text-[#7B9586] hover:text-rose-400 px-2 py-1 rounded transition-colors"
                  >
                    Leave
                  </button>

                  <Button
                    onClick={() => navigate(`/projects/${proj.id}/wards`)}
                    className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#A6F16A] to-[#20D6A0] text-[#061812] hover:opacity-95 text-xs font-bold px-4 shadow-sm active:scale-95 transition-all"
                  >
                    <span>Open Project</span>
                    <ArrowRight className="h-3.5 w-3.5 text-[#061812]" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
