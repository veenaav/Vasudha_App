import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { db, type Project, type Observation } from '@/db/database'
import {
  ArrowLeft,
  MapPin,
  Leaf,
  Calendar,
  Building2,
  CheckCircle2,
  Plus,
  Compass,
  Info,
  Trash2,
} from 'lucide-react'
import { getJoinedProjectIds, toggleJoinedProject } from './MyProjects'

function WardsPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()

  const [project, setProject] = useState<Project | null>(null)
  const [projectObservations, setProjectObservations] = useState<Observation[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Mock role state for testing frontend permissions
  const [userRole, setUserRole] = useState<'admin' | 'project_expert' | 'field_worker'>(() => {
    const saved = localStorage.getItem('shrishti_mock_user_role')
    if (saved === 'admin' || saved === 'project_expert' || saved === 'field_worker') {
      return saved
    }
    return 'field_worker'
  })

  // Administrative project-level permission (Admin / Expert can delete the project)
  const canManageProject = userRole === 'admin' || userRole === 'project_expert'
  const [isJoined, setIsJoined] = useState(false)

  const loadData = async () => {
    if (!projectId) return
    setIsLoading(true)
    try {
      setIsJoined(getJoinedProjectIds().includes(projectId))

      const proj = await db.projects.get(projectId)
      if (proj) {
        setProject(proj)
      }

      // Load observations associated with this project
      const obsList = await db.observations.where('projectId').equals(projectId).toArray()
      const sortedObs = [...obsList].sort((a, b) => {
        const tA = new Date(b.createdAt || b.recordedAt || 0).getTime() || 0
        const tB = new Date(a.createdAt || a.recordedAt || 0).getTime() || 0
        return tA - tB
      })
      setProjectObservations(sortedObs)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [projectId])

  const handleToggleJoin = () => {
    if (!projectId) return
    const updated = toggleJoinedProject(projectId)
    setIsJoined(updated.includes(projectId))
  }

  const handleDeleteProject = async () => {
    if (!project) return
    const confirmed = window.confirm(
      'Are you sure you want to delete this entire project and its associated local records? This action cannot be undone.'
    )
    if (!confirmed) return

    try {
      await db.projects.delete(project.id)
      const currentJoined = getJoinedProjectIds()
      if (currentJoined.includes(project.id)) {
        toggleJoinedProject(project.id)
      }
      navigate('/projects')
    } catch (err) {
      alert(`Failed to delete project: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12 text-center">
        <p className="text-base text-[#C5D1BD]">Loading project details...</p>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12 text-center">
        <p className="text-base text-[#C5D1BD]">Project not found.</p>
        <Link to="/projects" className="mt-3 inline-block text-base text-[#F5F0E4] font-medium hover:underline">
          ← Back to Projects
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-5 sm:px-6">
      {/* Temporary Developer Testing: Role Switcher */}
      <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-2 text-xs text-[#F5F0E4] backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <span className="text-[11px] font-medium text-amber-200/90 tracking-wide">
            🛠️ Dev Mode • Mock Role:
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {(
              [
                { id: 'admin', label: 'Admin' },
                { id: 'project_expert', label: 'Project Expert' },
                { id: 'field_worker', label: 'Field Worker' },
              ] as const
            ).map((role) => (
              <button
                key={role.id}
                type="button"
                onClick={() => {
                  setUserRole(role.id)
                  localStorage.setItem('shrishti_mock_user_role', role.id)
                }}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all ${
                  userRole === role.id
                    ? 'bg-[#263D2B] text-[#F5F0E4] border border-[#C5D1BD]/50 shadow-xs'
                    : 'bg-white/5 text-[#C5D1BD] border border-white/10 hover:bg-white/10'
                }`}
              >
                {role.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Breadcrumb Navigation */}
      <nav className="mb-4 flex items-center gap-1.5 text-sm text-[#C5D1BD] flex-wrap">
        <Link to="/projects" className="inline-flex items-center gap-1 text-[#F5F0E4] font-medium hover:underline">
          <ArrowLeft className="h-4 w-4" />
          <span>Projects</span>
        </Link>
        <span>/</span>
        <span className="text-[#C5D1BD]/80 truncate max-w-[200px]">
          {project.name}
        </span>
        <span>/</span>
        <span className="font-semibold text-[#F5F0E4]">Overview</span>
      </nav>

      {/* Project Context Header */}
      <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md p-5 shadow-xl mb-6">
        {/* Top Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="rounded-md bg-[#263D2B]/90 border border-[#C5D1BD]/40 px-2.5 py-0.5 text-xs font-semibold text-[#C5D1BD]">
            Project Hub
          </span>
          {isJoined && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#263D2B] border border-[#C5D1BD]/40 px-2.5 py-0.5 text-[10px] font-semibold text-[#C5D1BD] uppercase">
              <CheckCircle2 className="h-3 w-3 text-[#C5D1BD]" />
              Joined
            </span>
          )}
        </div>

        {/* Project Title & Metadata (Full Width) */}
        <div className="mt-2.5 w-full">
          <h1 className="font-heading text-xl sm:text-2xl font-normal text-[#F5F0E4] leading-snug">
            {project.name}
          </h1>

          {project.organization && (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs sm:text-sm text-[#C5D1BD]">
              <Building2 className="h-4 w-4 text-[#C5D1BD] shrink-0" />
              <span>{project.organization}</span>
            </p>
          )}

          {project.targetRegion && (
            <p className="mt-1 flex items-center gap-1.5 text-xs sm:text-sm text-[#C5D1BD]">
              <MapPin className="h-4 w-4 text-[#C5D1BD] shrink-0" />
              <span>{project.targetRegion}</span>
            </p>
          )}

          {project.description && (
            <div className="mt-3.5 rounded-xl bg-black/25 border border-white/10 p-3.5 text-xs sm:text-sm text-[#C5D1BD]/90 leading-relaxed">
              <p className="font-semibold text-[11px] text-[#F5F0E4] uppercase tracking-wider mb-1">
                Project Scope & Guidelines:
              </p>
              <p className="whitespace-pre-line">{project.description}</p>
            </div>
          )}
        </div>

        {/* Action Buttons Row */}
        <div className="mt-4 pt-3.5 border-t border-white/15 flex items-center justify-between gap-2.5 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Primary Action: Direct New Observation for this project */}
            <Button
              onClick={() => navigate(`/new-observation?projectId=${projectId}`)}
              className="inline-flex min-h-[40px] items-center gap-1.5 bg-[#C5D1BD] text-[#263D2B] hover:bg-[#d8e2d1] font-semibold text-xs sm:text-sm shadow-sm rounded-xl active:scale-95 transition-all"
            >
              <Plus className="h-4 w-4 text-[#263D2B]" />
              <span>Record Observation</span>
            </Button>

            {/* Join / Leave Project toggle */}
            <button
              type="button"
              onClick={handleToggleJoin}
              className={`inline-flex min-h-[40px] items-center gap-1.5 rounded-xl px-4 py-2 text-xs sm:text-sm font-medium transition-all active:scale-95 shadow-sm ${
                isJoined
                  ? 'bg-[#263D2B] text-[#F5F0E4] border border-[#C5D1BD]/50 hover:bg-[#344F3A]'
                  : 'bg-white/10 text-[#F5F0E4] border border-white/20 hover:bg-white/20'
              }`}
            >
              {isJoined ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-[#C5D1BD]" />
                  <span>Joined</span>
                </>
              ) : (
                <span>+ Join Project</span>
              )}
            </button>
          </div>

          {/* Delete Project button (Admin & Project Expert only) */}
          {canManageProject && (
            <button
              type="button"
              onClick={handleDeleteProject}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl bg-red-950/40 text-red-200 border border-red-500/40 hover:bg-red-900/50 hover:border-red-400 px-3.5 py-2 text-xs sm:text-sm font-medium transition-all active:scale-95 ml-auto sm:ml-0"
              title="Delete Project"
            >
              <Trash2 className="h-4 w-4 text-red-300" />
              <span>Delete Project</span>
            </button>
          )}
        </div>
      </div>

      {/* Ward Boundary Information: Automatic GPS Matching */}
      <div className="mb-6 rounded-3xl border border-[#DCD5C5] bg-[#FAF7F0] p-5 sm:p-6 shadow-xl text-[#263D2B]">
        <div className="flex items-center justify-between border-b border-[#DCD5C5] pb-3">
          <div className="flex items-center gap-2">
            <Compass className="h-5 w-5 text-[#263D2B]" />
            <h2 className="font-heading text-base sm:text-lg font-normal tracking-wider uppercase text-[#263D2B]">
              Automatic GPS Ward Identification
            </h2>
          </div>
          <span className="rounded-full bg-[#263D2B] px-2.5 py-0.5 text-[10px] font-semibold text-[#F5F0E4] uppercase tracking-wider">
            No Manual Wards
          </span>
        </div>

        <div className="mt-3.5 rounded-2xl bg-[#EDE7DA] p-4 border border-[#DCD5C5] text-xs sm:text-sm text-[#414B32] space-y-2">
          <div className="flex items-start gap-2.5">
            <Info className="h-4 w-4 text-[#263D2B] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-[#263D2B]">
                Thiruvananthapuram Municipal Corporation (100 Official Wards)
              </p>
              <p className="text-xs leading-relaxed text-[#414B32]">
                Wards are not created by users or projects. Instead, when field workers record
                observations outdoors, the app automatically identifies the official ward directly from
                the device&apos;s GPS coordinates against municipal boundary polygon data.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Project Observations Section */}
      <div className="border-t border-white/15 pt-6">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <Leaf className="h-4.5 w-4.5 text-[#C5D1BD]" />
            <h2 className="font-heading text-lg sm:text-xl font-normal text-[#F5F0E4]">
              Project Observations
            </h2>
          </div>
          <span className="text-xs text-[#C5D1BD]">
            {projectObservations.length} {projectObservations.length === 1 ? 'record' : 'records'}
          </span>
        </div>

        {projectObservations.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/20 bg-white/5 p-6 text-center text-xs text-[#C5D1BD]">
            <p>No observations recorded in this project yet.</p>
            <p className="mt-1 text-[11px] text-[#C5D1BD]/80">
              Tap &quot;Record Observation&quot; above to log species directly in the field.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {projectObservations.map((obs) => {
              const photoBlob = obs.photos?.[0] || obs.photo
              const hasPhoto = photoBlob instanceof Blob
              const previewUrl = hasPhoto ? URL.createObjectURL(photoBlob) : null

              return (
                <div
                  key={obs.id}
                  className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md p-3.5 flex items-center gap-3 text-[#F5F0E4] shadow-md"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/20 bg-black/30 shadow-inner">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt={obs.speciesName || 'Species'}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Leaf className="h-5 w-5 text-[#C5D1BD]/60" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-[#263D2B] px-2 py-0.5 text-[10px] font-semibold text-[#C5D1BD] border border-[#C5D1BD]/30 uppercase">
                        {obs.identificationStatus || 'Record'}
                      </span>
                      {obs.speciesGroup && (
                        <span className="text-xs text-[#C5D1BD]/80 truncate">
                          • {obs.speciesGroup}
                        </span>
                      )}
                    </div>
                    <h3 className="font-heading text-base font-normal truncate mt-0.5">
                      {obs.speciesName}
                    </h3>
                    {obs.localName && (
                      <p className="text-xs text-[#C5D1BD] truncate">{obs.localName}</p>
                    )}
                  </div>
                  <div className="text-right text-xs text-[#C5D1BD]/80 shrink-0">
                    <span className="flex items-center gap-1 font-medium">
                      <Calendar className="h-3 w-3 text-[#C5D1BD]" />
                      {new Date(obs.recordedAt || obs.createdAt || 0).toLocaleDateString('en-IN', {
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
      </div>
    </div>
  )
}

export default WardsPage
