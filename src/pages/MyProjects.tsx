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
    <div className="mx-auto max-w-lg px-4 py-5 sm:px-6 space-y-5 text-slate-800">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <nav className="mb-1 flex items-center gap-1.5 text-xs text-slate-500">
            <Link to="/projects" className="hover:underline flex items-center gap-1 text-[#165B33] font-medium">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>All Projects</span>
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-50 border border-orange-100 text-[#EA580C]">
              <UserCheck className="h-4.5 w-4.5" />
            </div>
            <h1 className="font-heading text-2xl font-semibold tracking-wide text-slate-900">
              My Projects
            </h1>
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            Projects you have joined on this device
          </p>
        </div>

        <Link to="/projects">
          <Button
            variant="outline"
            className="border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl shadow-xs"
          >
            Browse All
          </Button>
        </Link>
      </div>

      {/* Projects List */}
      {isLoading ? (
        <div className="py-12 text-center text-sm text-slate-500">
          <p>Loading your projects...</p>
        </div>
      ) : joinedProjects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-xs">
          <FolderGit2 className="mx-auto h-12 w-12 text-slate-300" />
          <h2 className="mt-3 font-heading text-xl font-bold text-slate-900">
            No joined projects yet
          </h2>
          <p className="mt-1.5 text-xs text-slate-500 max-w-xs mx-auto">
            Browse available biodiversity survey projects and join the ones you are actively collecting data for.
          </p>
          <Link to="/projects" className="inline-block mt-5">
            <Button className="min-h-[44px] bg-gradient-to-r from-[#165B33] to-[#1E7B46] text-white hover:from-[#134D2C] hover:to-[#17663A] rounded-xl px-5 text-sm font-semibold shadow-xs">
              Browse Available Projects
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {joinedProjects.map((proj) => (
            <div
              key={proj.id}
              className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs text-slate-800"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-heading text-lg font-bold text-slate-900 truncate">
                      {proj.name}
                    </h2>
                    <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 border border-orange-200 px-2 py-0.5 text-[10px] font-semibold text-[#EA580C] uppercase">
                      <CheckCircle2 className="h-3 w-3 text-[#EA580C]" />
                      Joined
                    </span>
                  </div>

                  {proj.organization && (
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-600">
                      <Building2 className="h-3.5 w-3.5 shrink-0 text-[#165B33]" />
                      <span className="truncate">{proj.organization}</span>
                    </p>
                  )}

                  {proj.targetRegion && (
                    <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-600">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-[#165B33]" />
                      <span className="truncate">{proj.targetRegion}</span>
                    </p>
                  )}

                  {proj.description && (
                    <p className="mt-2 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {proj.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Action row */}
              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                <span className="text-xs text-slate-500">
                  <strong className="text-slate-900 font-bold">{observationCounts[proj.id] ?? 0}</strong>{' '}
                  {observationCounts[proj.id] === 1 ? 'observation' : 'observations'}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleLeaveProject(proj.id, proj.name)}
                    className="text-xs text-slate-400 hover:text-rose-600 px-2 py-1 rounded transition-colors"
                  >
                    Leave
                  </button>

                  <Button
                    onClick={() => navigate(`/projects/${proj.id}/wards`)}
                    className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#165B33] to-[#1E7B46] text-white hover:from-[#134D2C] hover:to-[#17663A] text-xs font-semibold px-4 shadow-xs active:scale-95 transition-all"
                  >
                    <span>Open Project</span>
                    <ArrowRight className="h-3.5 w-3.5 text-emerald-100" />
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
