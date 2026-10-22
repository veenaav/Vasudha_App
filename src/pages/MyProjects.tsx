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
  const [wardCounts, setWardCounts] = useState<Record<string, number>>({})
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
        counts[p.id] = await db.wards.where('projectId').equals(p.id).count()
      }
      setWardCounts(counts)
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
    <div className="mx-auto max-w-lg px-4 py-5 sm:px-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/15 pb-4">
        <div>
          <nav className="mb-1 flex items-center gap-1.5 text-xs text-[#C5D1BD]">
            <Link to="/projects" className="hover:underline flex items-center gap-1 text-[#F5F0E4]">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>All Projects</span>
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-[#C5D1BD]" />
            <h1 className="font-heading text-2xl font-normal tracking-wide text-[#F5F0E4]">
              My Projects
            </h1>
          </div>
          <p className="mt-0.5 text-xs text-[#C5D1BD]">
            Projects you have joined on this device
          </p>
        </div>

        <Link to="/projects">
          <Button
            variant="outline"
            className="border-white/20 bg-white/10 text-[#F5F0E4] hover:bg-white/20 text-xs font-medium rounded-xl"
          >
            Browse All
          </Button>
        </Link>
      </div>

      {/* Projects List */}
      {isLoading ? (
        <div className="py-12 text-center text-sm text-[#C5D1BD]">
          <p>Loading your projects...</p>
        </div>
      ) : joinedProjects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/25 bg-white/10 backdrop-blur-md p-8 text-center shadow-xl">
          <FolderGit2 className="mx-auto h-12 w-12 text-[#C5D1BD]/70" />
          <h2 className="mt-3 font-heading text-xl font-normal text-[#F5F0E4]">
            No joined projects yet
          </h2>
          <p className="mt-1.5 text-xs text-[#C5D1BD] max-w-xs mx-auto">
            Browse available biodiversity survey projects and join the ones you are actively collecting data for.
          </p>
          <Link to="/projects" className="inline-block mt-5">
            <Button className="min-h-[44px] bg-[#263D2B] text-[#F5F0E4] border border-[#C5D1BD]/40 hover:bg-[#344F3A] rounded-xl px-5 text-sm">
              Browse Available Projects
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {joinedProjects.map((proj) => (
            <div
              key={proj.id}
              className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md p-5 shadow-xl text-[#F5F0E4]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-heading text-lg font-normal text-[#F5F0E4] truncate">
                      {proj.name}
                    </h2>
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#263D2B] border border-[#C5D1BD]/40 px-2 py-0.5 text-[10px] font-semibold text-[#C5D1BD] uppercase">
                      <CheckCircle2 className="h-3 w-3 text-[#C5D1BD]" />
                      Joined
                    </span>
                  </div>

                  {proj.organization && (
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-[#C5D1BD]">
                      <Building2 className="h-3.5 w-3.5 shrink-0 text-[#C5D1BD]" />
                      <span className="truncate">{proj.organization}</span>
                    </p>
                  )}

                  {proj.targetRegion && (
                    <p className="mt-0.5 flex items-center gap-1.5 text-xs text-[#C5D1BD]">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-[#C5D1BD]" />
                      <span className="truncate">{proj.targetRegion}</span>
                    </p>
                  )}

                  {proj.description && (
                    <p className="mt-2 text-xs text-[#C5D1BD]/85 line-clamp-2 leading-relaxed">
                      {proj.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Action row */}
              <div className="mt-4 flex items-center justify-between border-t border-white/15 pt-3">
                <span className="text-xs text-[#C5D1BD]">
                  <strong className="text-[#F5F0E4]">{wardCounts[proj.id] ?? 0}</strong>{' '}
                  {wardCounts[proj.id] === 1 ? 'ward' : 'wards'}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleLeaveProject(proj.id, proj.name)}
                    className="text-xs text-[#C5D1BD]/75 hover:text-[#E8A585] px-2 py-1 rounded transition-colors"
                  >
                    Leave
                  </button>

                  <Button
                    onClick={() => navigate(`/projects/${proj.id}/wards`)}
                    className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl bg-[#263D2B] text-[#F5F0E4] border border-[#C5D1BD]/40 hover:bg-[#324D38] text-xs font-medium px-4 shadow-sm active:scale-95 transition-all"
                  >
                    <span>Open Project</span>
                    <ArrowRight className="h-3.5 w-3.5 text-[#C5D1BD]" />
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
