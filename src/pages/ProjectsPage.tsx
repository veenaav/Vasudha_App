import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { db, type Project } from '@/db/database'
import { Plus, ArrowRight, FolderPlus, MapPin, Building2, FolderGit2, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react'
import { getJoinedProjectIds } from './MyProjects'

function ProjectsPage() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState<Project[]>([])
  const [joinedIds, setJoinedIds] = useState<string[]>(getJoinedProjectIds())
  const [activeTab, setActiveTab] = useState<'all' | 'my'>('all')
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null)
  const [observationCounts, setObservationCounts] = useState<Record<string, number>>({})
  const [showAddForm, setShowAddForm] = useState(false)

  // New project form state
  const [name, setName] = useState('')
  const [organization, setOrganization] = useState('')
  const [targetRegion, setTargetRegion] = useState('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load projects from IndexedDB
  const loadProjects = async () => {
    setJoinedIds(getJoinedProjectIds())
    const list = await db.projects.toArray()
    setProjects(list.reverse())

    // Load observation counts per project
    const obsCounts: Record<string, number> = {}
    for (const p of list) {
      obsCounts[p.id] = await db.observations.where('projectId').equals(p.id).count()
    }
    setObservationCounts(obsCounts)
  }

  useEffect(() => {
    loadProjects()
  }, [])

  // Create a new project
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      alert('Please enter a project name.')
      return
    }

    setIsSubmitting(true)
    try {
      const newId = crypto.randomUUID()
      const now = new Date().toISOString()
      const newProj: Project = {
        id: newId,
        name: name.trim(),
        organization: organization.trim() || undefined,
        targetRegion: targetRegion.trim() || undefined,
        description: description.trim() || undefined,
        status: 'active',
        createdAt: now,
        updatedAt: now,
        syncStatus: 'pending',
      }

      await db.projects.add(newProj)
      setName('')
      setOrganization('')
      setTargetRegion('')
      setDescription('')
      setShowAddForm(false)
      await loadProjects()
    } catch (err) {
      alert(`Failed to create project: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Create quick sample project (helpful for first-time use)
  const handleCreateSampleProject = async () => {
    const newId = crypto.randomUUID()
    const now = new Date().toISOString()
    const sampleProj: Project = {
      id: newId,
      name: 'Thiruvananthapuram City Biodiversity Register',
      organization: 'Kerala State Biodiversity Board',
      targetRegion: 'Thiruvananthapuram Municipal Corporation',
      description: 'Comprehensive municipal ward-level documentation of urban flora, fauna, and local biodiversity.',
      status: 'active',
      createdAt: now,
      updatedAt: now,
      syncStatus: 'pending',
    }

    await db.projects.add(sampleProj)
    await loadProjects()
  }

  const displayedProjects =
    activeTab === 'my'
      ? projects.filter((p) => joinedIds.includes(p.id))
      : projects

  return (
    <div className="mx-auto max-w-lg px-4 py-5 sm:px-6">
      {/* Header section */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-100 text-[#165B33]">
              <FolderGit2 className="h-5 w-5" />
            </div>
            <h1 className="font-heading text-2xl sm:text-[28px] font-semibold tracking-wide text-slate-900">
              Projects
            </h1>
          </div>
        </div>

        <Button
          onClick={() => setShowAddForm((prev) => !prev)}
          className="inline-flex min-h-[44px] items-center gap-2 self-start sm:self-auto bg-gradient-to-r from-[#165B33] to-[#1E7B46] text-white border border-emerald-600/30 hover:from-[#134D2C] hover:to-[#17663A] font-medium text-sm shadow-xs rounded-xl transition-all active:scale-95"
        >
          <Plus className="h-4 w-4 text-white" />
          <span>{showAddForm ? 'Cancel' : 'New Project'}</span>
        </Button>
      </div>

      {/* Tabs: All Projects vs My Projects */}
      <div className="mt-4 flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`rounded-full px-4 py-1.5 text-xs font-semibold tracking-wider uppercase transition-all ${
            activeTab === 'all'
              ? 'bg-[#165B33] text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          All Projects ({projects.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('my')}
          className={`rounded-full px-4 py-1.5 text-xs font-semibold tracking-wider uppercase transition-all ${
            activeTab === 'my'
              ? 'bg-[#165B33] text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          My Projects ({projects.filter((p) => joinedIds.includes(p.id)).length})
        </button>
      </div>

      {/* Add Project Form (Collapsible) - MOYA Warm Cream Style */}
      {showAddForm && (
        <form onSubmit={handleCreateProject} className="mt-5 rounded-3xl border border-[#DCD5C5] bg-[#FAF7F0] p-5 sm:p-6 shadow-xl text-[#263D2B]">
          <h2 className="font-heading text-base sm:text-lg font-normal tracking-wider uppercase text-[#263D2B] border-b border-[#DCD5C5] pb-2">
            Create New Project
          </h2>

          <div className="mt-4">
            <label htmlFor="projectName" className="block text-xs font-semibold tracking-wider uppercase text-[#414B32]">
              Project Name <span className="text-[#B87555]">*</span>
            </label>
            <input
              id="projectName"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Palayam Ward Biodiversity Survey"
              className="mt-2 w-full min-h-[48px] rounded-xl border border-[#C5D1BD] bg-white px-4 py-3 text-base text-[#263D2B] placeholder-[#414B32]/40 outline-none focus:border-[#263D2B] focus:ring-1 focus:ring-[#263D2B]"
            />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="org" className="block text-xs font-semibold tracking-wider uppercase text-[#414B32]">
                Organization / Institution (optional)
              </label>
              <input
                id="org"
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="e.g. KSBB, College Botany Dept"
                className="mt-2 w-full min-h-[48px] rounded-xl border border-[#C5D1BD] bg-white px-4 py-3 text-base text-[#263D2B] placeholder-[#414B32]/40 outline-none focus:border-[#263D2B] focus:ring-1 focus:ring-[#263D2B]"
              />
            </div>

            <div>
              <label htmlFor="region" className="block text-xs font-semibold tracking-wider uppercase text-[#414B32]">
                Target Region / District (optional)
              </label>
              <input
                id="region"
                type="text"
                value={targetRegion}
                onChange={(e) => setTargetRegion(e.target.value)}
                placeholder="e.g. Thiruvananthapuram District"
                className="mt-2 w-full min-h-[48px] rounded-xl border border-[#C5D1BD] bg-white px-4 py-3 text-base text-[#263D2B] placeholder-[#414B32]/40 outline-none focus:border-[#263D2B] focus:ring-1 focus:ring-[#263D2B]"
              />
            </div>
          </div>

          <div className="mt-4">
            <label htmlFor="projDesc" className="block text-xs font-semibold tracking-wider uppercase text-[#414B32]">
              Description (optional)
            </label>
            <textarea
              id="projDesc"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the biodiversity assessment scope..."
              className="mt-2 w-full rounded-xl border border-[#C5D1BD] bg-white px-4 py-3 text-base text-[#263D2B] placeholder-[#414B32]/40 outline-none focus:border-[#263D2B] focus:ring-1 focus:ring-[#263D2B]"
            />
          </div>

          <div className="mt-5 flex gap-2.5">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="min-h-[48px] min-w-32 bg-[#263D2B] text-[#F5F0E4] hover:bg-[#1E3022] font-medium text-sm tracking-wider uppercase shadow-sm rounded-full sm:rounded-xl active:scale-95 transition-all"
            >
              {isSubmitting ? 'Creating...' : 'Save Project'}
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

      {/* Projects List */}
      <div className="mt-6 space-y-4">
        {displayedProjects.length > 0 ? (
          displayedProjects.map((proj) => {
            const isJoined = joinedIds.includes(proj.id)
            const isExpanded = expandedProjectId === proj.id

            return (
              <div
                key={proj.id}
                role="button"
                tabIndex={0}
                onClick={() => navigate(`/projects/${proj.id}/wards`)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    navigate(`/projects/${proj.id}/wards`)
                  }
                }}
                className="group cursor-pointer rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all hover:border-emerald-300 hover:shadow-md text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#165B33]/50"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-heading text-xl font-bold text-slate-900 group-hover:text-[#165B33] transition-colors truncate">{proj.name}</h2>
                      <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-semibold text-[#165B33]">
                        Active
                      </span>
                      {isJoined && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 border border-orange-200 px-2 py-0.5 text-[10px] font-semibold text-[#EA580C] uppercase">
                          <CheckCircle2 className="h-3 w-3 text-[#EA580C]" />
                          Joined
                        </span>
                      )}
                    </div>

                    {proj.organization && (
                      <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-600">
                        <Building2 className="h-4 w-4 text-[#165B33] shrink-0" />
                        <span className="truncate">{proj.organization}</span>
                      </p>
                    )}

                    {proj.targetRegion && (
                      <p className="mt-0.5 flex items-center gap-1.5 text-sm text-slate-600">
                        <MapPin className="h-4 w-4 text-[#165B33] shrink-0" />
                        <span className="truncate">{proj.targetRegion}</span>
                      </p>
                    )}

                    {proj.description && (
                      <div className="mt-2 text-xs text-slate-600">
                        <p className={isExpanded ? 'leading-relaxed' : 'line-clamp-2 leading-relaxed'}>
                          {proj.description}
                        </p>
                        {proj.description.length > 80 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setExpandedProjectId(isExpanded ? null : proj.id)
                            }}
                            onKeyDown={(e) => {
                              e.stopPropagation()
                            }}
                            className="mt-1 inline-flex items-center gap-0.5 text-[11px] text-[#165B33] hover:underline"
                          >
                            <span>{isExpanded ? 'Show less' : 'Details'}</span>
                            {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer */}
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                  <span className="text-xs text-slate-500">
                    <strong className="text-slate-900 font-bold">{observationCounts[proj.id] ?? 0}</strong>{' '}
                    {observationCounts[proj.id] === 1 ? 'observation' : 'observations'}
                  </span>

                  <span className="inline-flex items-center gap-1 text-xs text-slate-500 group-hover:text-[#165B33] transition-colors">
                    <span>View project</span>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-[#165B33] group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </div>
            )
          })
        ) : activeTab === 'my' ? (
          <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center bg-white shadow-xs">
            <FolderGit2 className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-2 font-heading text-xl font-bold text-slate-900">No joined projects</h3>
            <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
              You haven&apos;t joined any projects yet. Open any project to view details and join.
            </p>
            <Button
              onClick={() => setActiveTab('all')}
              className="mt-4 bg-gradient-to-r from-[#165B33] to-[#1E7B46] text-white hover:from-[#134D2C] hover:to-[#17663A] text-xs font-semibold rounded-xl active:scale-95 shadow-xs"
            >
              Browse All Projects
            </Button>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center bg-white shadow-xs">
            <FolderPlus className="mx-auto h-12 w-12 text-[#165B33]/60" />
            <h3 className="mt-2 font-heading text-xl font-bold text-slate-900">No projects yet</h3>
            <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">
              Create a project to organize biodiversity field data and occurrences across Thiruvananthapuram Corporation.
            </p>
            <div className="mt-5 flex flex-col sm:flex-row gap-2.5 justify-center">
              <Button
                onClick={() => setShowAddForm(true)}
                className="bg-gradient-to-r from-[#165B33] to-[#1E7B46] text-white hover:from-[#134D2C] hover:to-[#17663A] text-sm font-semibold min-h-[46px] rounded-xl active:scale-95 shadow-xs"
              >
                + Create Project
              </Button>
              <Button
                variant="outline"
                onClick={handleCreateSampleProject}
                className="border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-sm font-semibold min-h-[46px] rounded-xl active:scale-95 shadow-xs"
              >
                + Load Sample PBR Project
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProjectsPage
