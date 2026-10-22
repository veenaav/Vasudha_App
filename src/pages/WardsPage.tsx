import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { db, type Ward, type Project, type Observation } from '@/db/database'
import { Plus, ArrowRight, Trash2, ArrowLeft, MapPin, Landmark, Layers, Leaf, Calendar, Building2, CheckCircle2 } from 'lucide-react'
import { getJoinedProjectIds, toggleJoinedProject } from './MyProjects'

function WardsPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()

  const [project, setProject] = useState<Project | null>(null)
  const [wards, setWards] = useState<Ward[]>([])
  const [projectObservations, setProjectObservations] = useState<Observation[]>([])
  const [surveyCounts, setSurveyCounts] = useState<Record<string, number>>({})
  const [showAddForm, setShowAddForm] = useState(false)

  // Temporary mock role state for testing frontend permissions
  const [userRole, setUserRole] = useState<'admin' | 'project_expert' | 'field_worker'>(() => {
    const saved = localStorage.getItem('shrishti_mock_user_role')
    if (saved === 'admin' || saved === 'project_expert' || saved === 'field_worker') {
      return saved
    }
    return 'field_worker'
  })
  const canManageWards = userRole === 'admin' || userRole === 'project_expert'
  const [isJoined, setIsJoined] = useState(false)

  // Form state
  const [wardNumber, setWardNumber] = useState('')
  const [wardName, setWardName] = useState('')
  const [localBodyName, setLocalBodyName] = useState('')
  const [district, setDistrict] = useState('')
  const [state, setState] = useState('Kerala')
  const [keyLandmarks, setKeyLandmarks] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadData = async () => {
    if (!projectId) return
    setIsJoined(getJoinedProjectIds().includes(projectId))

    const proj = await db.projects.get(projectId)
    if (proj) {
      setProject(proj)
      if (proj.targetRegion && !district) {
        setDistrict(proj.targetRegion)
      }
    }

    const list = await db.wards.where('projectId').equals(projectId).toArray()
    setWards(list)

    // Load survey visit counts per ward
    const counts: Record<string, number> = {}
    for (const w of list) {
      const count = await db.surveys.where('wardId').equals(w.id).count()
      counts[w.id] = count
    }
    setSurveyCounts(counts)

    // Load observations associated with this project
    const obsList = await db.observations.where('projectId').equals(projectId).toArray()
    const sortedObs = [...obsList].sort((a, b) => {
      const tA = new Date(b.createdAt || b.recordedAt || 0).getTime() || 0
      const tB = new Date(a.createdAt || a.recordedAt || 0).getTime() || 0
      return tA - tB
    })
    setProjectObservations(sortedObs)
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
    const confirmed = window.confirm("Are you sure you want to delete this entire project and all its data?")
    if (!confirmed) return

    try {
      await db.projects.delete(project.id)
      await db.wards.where('projectId').equals(project.id).delete()
      const currentJoined = getJoinedProjectIds()
      if (currentJoined.includes(project.id)) {
        toggleJoinedProject(project.id)
      }
      navigate('/projects')
    } catch (err) {
      alert(`Failed to delete project: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  const handleCreateWard = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!projectId) return
    if (!wardNumber.trim() || !wardName.trim()) {
      alert('Please enter both ward number and ward name.')
      return
    }

    setIsSubmitting(true)
    try {
      const newId = crypto.randomUUID()
      const now = new Date().toISOString()
      const newWard: Ward = {
        id: newId,
        projectId,
        wardNumber: wardNumber.trim(),
        wardName: wardName.trim(),
        localBodyName: localBodyName.trim() || undefined,
        district: district.trim() || undefined,
        state: state.trim() || undefined,
        keyLandmarks: keyLandmarks.trim() || undefined,
        createdAt: now,
        updatedAt: now,
        syncStatus: 'pending',
      }

      await db.wards.add(newWard)
      setWardNumber('')
      setWardName('')
      setKeyLandmarks('')
      setShowAddForm(false)
      await loadData()
    } catch (err) {
      alert(`Failed to add ward: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteWard = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      await db.wards.delete(id)
      await loadData()
    }
  }

  if (!project && !wards.length) {
    return (
      <div className="mx-auto max-w-lg px-4 py-8 text-center">
        <p className="text-base text-[#C5D1BD]">Loading project details...</p>
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
                className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all ${userRole === role.id
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
          {project?.name || 'Project'}
        </span>
        <span>/</span>
        <span className="font-semibold text-[#F5F0E4]">Wards</span>
      </nav>

      {/* Project Context Header */}
      <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md p-5 shadow-xl mb-6">
        {/* Top Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="rounded-md bg-[#263D2B]/90 border border-[#C5D1BD]/40 px-2.5 py-0.5 text-xs font-semibold text-[#C5D1BD]">
            Municipal Division
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
            {project?.name}
          </h1>

          {project?.organization && (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs sm:text-sm text-[#C5D1BD]">
              <Building2 className="h-4 w-4 text-[#C5D1BD] shrink-0" />
              <span>{project.organization}</span>
            </p>
          )}

          {project?.targetRegion && (
            <p className="mt-1 flex items-center gap-1.5 text-xs sm:text-sm text-[#C5D1BD]">
              <MapPin className="h-4 w-4 text-[#C5D1BD] shrink-0" />
              <span>{project.targetRegion}</span>
            </p>
          )}

          {project?.description && (
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
            {/* Join Project button (accessible to all roles) */}
            <button
              type="button"
              onClick={handleToggleJoin}
              className={`inline-flex min-h-[40px] items-center gap-1.5 rounded-xl px-4 py-2 text-xs sm:text-sm font-medium transition-all active:scale-95 shadow-sm ${isJoined
                  ? 'bg-[#263D2B] text-[#F5F0E4] border border-[#C5D1BD]/50 hover:bg-[#344F3A]'
                  : 'bg-[#C5D1BD] text-[#263D2B] hover:bg-[#d8e2d1] font-semibold'
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

            {/* Add Ward button (admin & project_expert only) */}
            {canManageWards && (
              <Button
                onClick={() => setShowAddForm((prev) => !prev)}
                className="inline-flex min-h-[40px] items-center gap-1.5 bg-[#263D2B] text-[#F5F0E4] border border-[#C5D1BD]/40 hover:bg-[#324D38] font-medium text-xs sm:text-sm shadow-sm rounded-xl active:scale-95 transition-all"
              >
                <Plus className="h-4 w-4 text-[#C5D1BD]" />
                <span>{showAddForm ? 'Cancel' : 'Add Ward'}</span>
              </Button>
            )}
          </div>

          {/* Delete Project button (admin & project_expert only) */}
          {canManageWards && (
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

      {/* Add Ward Form (Collapsible) - MOYA Warm Cream Style */}
      {canManageWards && showAddForm && (
        <form onSubmit={handleCreateWard} className="mb-6 rounded-3xl border border-[#DCD5C5] bg-[#FAF7F0] p-5 sm:p-6 shadow-xl text-[#263D2B]">
          <h2 className="font-heading text-base sm:text-lg font-normal tracking-wider uppercase text-[#263D2B] border-b border-[#DCD5C5] pb-2">
            Add Municipal Ward / Local Site
          </h2>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="wardNumber" className="block text-xs font-semibold tracking-wider uppercase text-[#414B32]">
                Ward Number <span className="text-[#B87555]">*</span>
              </label>
              <input
                id="wardNumber"
                type="text"
                required
                value={wardNumber}
                onChange={(e) => setWardNumber(e.target.value)}
                placeholder="e.g. 14"
                className="mt-2 w-full min-h-[48px] rounded-xl border border-[#C5D1BD] bg-white px-4 py-3 text-base text-[#263D2B] placeholder-[#414B32]/40 outline-none focus:border-[#263D2B] focus:ring-1 focus:ring-[#263D2B]"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="wardName" className="block text-xs font-semibold tracking-wider uppercase text-[#414B32]">
                Ward Name <span className="text-[#B87555]">*</span>
              </label>
              <input
                id="wardName"
                type="text"
                required
                value={wardName}
                onChange={(e) => setWardName(e.target.value)}
                placeholder="e.g. Palayam"
                className="mt-2 w-full min-h-[48px] rounded-xl border border-[#C5D1BD] bg-white px-4 py-3 text-base text-[#263D2B] placeholder-[#414B32]/40 outline-none focus:border-[#263D2B] focus:ring-1 focus:ring-[#263D2B]"
              />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="localBody" className="block text-xs font-semibold tracking-wider uppercase text-[#414B32]">
                Local Body (optional)
              </label>
              <input
                id="localBody"
                type="text"
                value={localBodyName}
                onChange={(e) => setLocalBodyName(e.target.value)}
                placeholder="e.g. Corporation"
                className="mt-2 w-full min-h-[48px] rounded-xl border border-[#C5D1BD] bg-white px-4 py-3 text-base text-[#263D2B] placeholder-[#414B32]/40 outline-none focus:border-[#263D2B] focus:ring-1 focus:ring-[#263D2B]"
              />
            </div>

            <div>
              <label htmlFor="district" className="block text-xs font-semibold tracking-wider uppercase text-[#414B32]">
                District (optional)
              </label>
              <input
                id="district"
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="e.g. Thiruvananthapuram"
                className="mt-2 w-full min-h-[48px] rounded-xl border border-[#C5D1BD] bg-white px-4 py-3 text-base text-[#263D2B] placeholder-[#414B32]/40 outline-none focus:border-[#263D2B] focus:ring-1 focus:ring-[#263D2B]"
              />
            </div>

            <div>
              <label htmlFor="state" className="block text-xs font-semibold tracking-wider uppercase text-[#414B32]">
                State (optional)
              </label>
              <input
                id="state"
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="e.g. Kerala"
                className="mt-2 w-full min-h-[48px] rounded-xl border border-[#C5D1BD] bg-white px-4 py-3 text-base text-[#263D2B] placeholder-[#414B32]/40 outline-none focus:border-[#263D2B] focus:ring-1 focus:ring-[#263D2B]"
              />
            </div>
          </div>

          <div className="mt-4">
            <label htmlFor="landmarks" className="block text-xs font-semibold tracking-wider uppercase text-[#414B32]">
              Key Landmarks in Ward (optional)
            </label>
            <input
              id="landmarks"
              type="text"
              value={keyLandmarks}
              onChange={(e) => setKeyLandmarks(e.target.value)}
              placeholder="e.g. Museum Compound, Central Stadium, Statue Junction"
              className="mt-2 w-full min-h-[48px] rounded-xl border border-[#C5D1BD] bg-white px-4 py-3 text-base text-[#263D2B] placeholder-[#414B32]/40 outline-none focus:border-[#263D2B] focus:ring-1 focus:ring-[#263D2B]"
            />
          </div>

          <div className="mt-5 flex gap-2.5">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="min-h-[48px] min-w-32 bg-[#263D2B] text-[#F5F0E4] hover:bg-[#1E3022] font-medium text-sm tracking-wider uppercase shadow-sm rounded-full sm:rounded-xl active:scale-95 transition-all"
            >
              {isSubmitting ? 'Saving...' : 'Save Ward'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAddForm(false)}
              className="min-h-[48px] border-[#C5D1BD] bg-white text-[#263D2B] hover:bg-[#EDE7DA] text-sm font-medium tracking-wider uppercase rounded-full sm:rounded-xl transition-all"
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      {/* Wards List */}
      <div className="space-y-4">
        {wards.length > 0 ? (
          wards.map((ward) => (
            <div
              key={ward.id}
              className="group rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md p-5 shadow-xl transition-all hover:border-white/30 text-[#F5F0E4]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-[#263D2B] border border-[#C5D1BD]/30 px-2.5 py-0.5 text-xs font-semibold text-[#F5F0E4] shrink-0">
                      Ward {ward.wardNumber}
                    </span>
                    <h2 className="font-heading text-lg font-normal text-[#F5F0E4] truncate">{ward.wardName}</h2>
                  </div>

                  {ward.localBodyName && (
                    <p className="mt-1.5 flex items-center gap-1.5 text-xs text-[#C5D1BD]">
                      <Landmark className="h-3.5 w-3.5 text-[#C5D1BD] shrink-0" />
                      <span className="truncate">{ward.localBodyName}</span>
                    </p>
                  )}

                  {ward.keyLandmarks && (
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-[#C5D1BD]/80">
                      <MapPin className="h-3.5 w-3.5 text-[#C5D1BD] shrink-0" />
                      <span className="truncate">{ward.keyLandmarks}</span>
                    </p>
                  )}
                </div>

                {canManageWards && (
                  <button
                    type="button"
                    onClick={() => handleDeleteWard(ward.id, `Ward ${ward.wardNumber} - ${ward.wardName}`)}
                    className="rounded-lg p-2 text-[#B87555] hover:bg-[#B87555]/20 hover:text-[#E8A585] transition-colors"
                    title="Delete ward"
                    aria-label="Delete ward"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Action row */}
              <div className="mt-4 flex items-center justify-between border-t border-white/15 pt-3">
                <span className="text-xs text-[#C5D1BD]">
                  <strong className="text-[#F5F0E4] font-semibold">{surveyCounts[ward.id] ?? 0}</strong> {surveyCounts[ward.id] === 1 ? 'visit' : 'visits'} recorded
                </span>

                <Button
                  onClick={() => navigate(`/projects/${projectId}/wards/${ward.id}/surveys`)}
                  className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl bg-[#263D2B] text-[#F5F0E4] border border-[#C5D1BD]/40 hover:bg-[#324D38] text-sm font-medium px-4 shadow-sm transition-all active:scale-95"
                >
                  <Layers className="h-4 w-4 text-[#C5D1BD]" />
                  <span>Field Visits</span>
                  <ArrowRight className="h-4 w-4 ml-0.5 text-[#C5D1BD]" />
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-white/25 p-8 text-center bg-white/10 backdrop-blur-md shadow-xl">
            <MapPin className="mx-auto h-12 w-12 text-[#C5D1BD]" />
            <h3 className="mt-2 font-heading text-xl font-normal text-[#F5F0E4]">No wards added yet</h3>
            <p className="mt-1 text-sm text-[#C5D1BD] max-w-sm mx-auto">
              Add a municipal ward or local site to begin conducting biodiversity field visits.
            </p>
            {canManageWards && (
              <Button
                onClick={() => setShowAddForm(true)}
                className="mt-5 bg-[#263D2B] text-[#F5F0E4] border border-[#C5D1BD]/40 hover:bg-[#324D38] text-base font-medium min-h-[48px] rounded-xl px-5 active:scale-95 shadow-sm"
              >
                + Add First Ward
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Project Observations Section */}
      <div className="mt-8 border-t border-white/15 pt-6">
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
              Open a ward above, start a field visit, and log species to see them here.
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
      </div>
    </div>
  )
}

export default WardsPage
