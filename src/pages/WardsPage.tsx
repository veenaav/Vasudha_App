import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { db, type Ward, type Project } from '@/db/database'
import { Plus, ArrowRight, Trash2, ArrowLeft, MapPin, Landmark, Layers } from 'lucide-react'

function WardsPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()

  const [project, setProject] = useState<Project | null>(null)
  const [wards, setWards] = useState<Ward[]>([])
  const [surveyCounts, setSurveyCounts] = useState<Record<string, number>>({})
  const [showAddForm, setShowAddForm] = useState(false)

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
  }

  useEffect(() => {
    loadData()
  }, [projectId])

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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-[#263D2B]/90 border border-[#C5D1BD]/40 px-2.5 py-0.5 text-xs font-semibold text-[#C5D1BD]">
                Municipal Division
              </span>
            </div>
            <h1 className="mt-1 font-heading text-xl sm:text-2xl font-normal text-[#F5F0E4]">{project?.name}</h1>
            {project?.organization && (
              <p className="mt-0.5 text-xs text-[#C5D1BD]">{project.organization}</p>
            )}
          </div>
          <Button
            onClick={() => setShowAddForm((prev) => !prev)}
            className="inline-flex min-h-[44px] items-center gap-2 self-start sm:self-auto bg-[#263D2B] text-[#F5F0E4] border border-[#C5D1BD]/40 hover:bg-[#324D38] font-medium text-base shadow-sm rounded-xl active:scale-95 transition-all"
          >
            <Plus className="h-4 w-4 text-[#C5D1BD]" />
            <span>{showAddForm ? 'Cancel' : 'Add Ward'}</span>
          </Button>
        </div>
      </div>

      {/* Add Ward Form (Collapsible) - MOYA Warm Cream Style */}
      {showAddForm && (
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

                <button
                  type="button"
                  onClick={() => handleDeleteWard(ward.id, `Ward ${ward.wardNumber} - ${ward.wardName}`)}
                  className="rounded-lg p-2 text-[#B87555] hover:bg-[#B87555]/20 hover:text-[#E8A585] transition-colors"
                  title="Delete ward"
                  aria-label="Delete ward"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
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
            <Button
              onClick={() => setShowAddForm(true)}
              className="mt-5 bg-[#263D2B] text-[#F5F0E4] border border-[#C5D1BD]/40 hover:bg-[#324D38] text-base font-medium min-h-[48px] rounded-xl px-5 active:scale-95 shadow-sm"
            >
              + Add First Ward
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default WardsPage
