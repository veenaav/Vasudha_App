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
    <div className="mx-auto max-w-lg px-4 py-5 sm:px-6 text-[#F0F5EF]">
      {/* Header section */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#1C4D3C] pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0D2D22] border border-[#1C4D3C] text-[#A6F16A] shadow-md">
              <FolderGit2 className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#A6F16A] block">
                Field Framework
              </span>
              <h1 className="text-2xl sm:text-[28px] font-extrabold tracking-tight text-white">
                Projects
              </h1>
            </div>
          </div>
        </div>

        <Button
          onClick={() => setShowAddForm((prev) => !prev)}
          className="inline-flex min-h-[44px] items-center gap-2 self-start sm:self-auto bg-gradient-to-r from-[#A6F16A] to-[#20D6A0] text-[#061812] hover:opacity-95 font-bold text-sm shadow-md shadow-[#20D6A0]/20 rounded-2xl transition-all active:scale-95"
        >
          <Plus className="h-4 w-4 text-[#061812]" />
          <span>{showAddForm ? 'Cancel' : 'New Project'}</span>
        </Button>
      </div>

      {/* Tabs: All Projects vs My Projects */}
      <div className="mt-4 flex items-center gap-2 border-b border-[#1C4D3C] pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`rounded-full px-4 py-1.5 text-xs font-semibold tracking-wider uppercase transition-all ${
            activeTab === 'all'
              ? 'bg-[#A6F16A] text-[#061812] shadow-sm font-bold'
              : 'bg-[#0D2D22] text-[#B2C8BA] border border-[#1C4D3C] hover:border-[#A6F16A]/40'
          }`}
        >
          All Projects ({projects.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('my')}
          className={`rounded-full px-4 py-1.5 text-xs font-semibold tracking-wider uppercase transition-all ${
            activeTab === 'my'
              ? 'bg-[#A6F16A] text-[#061812] shadow-sm font-bold'
              : 'bg-[#0D2D22] text-[#B2C8BA] border border-[#1C4D3C] hover:border-[#A6F16A]/40'
          }`}
        >
          My Projects ({projects.filter((p) => joinedIds.includes(p.id)).length})
        </button>
      </div>

      {/* Add Project Form (Collapsible) */}
      {showAddForm && (
        <form onSubmit={handleCreateProject} className="mt-5 rounded-3xl border border-[#1C4D3C] bg-[#0D2D22] p-5 sm:p-6 shadow-xl shadow-[#061812]/50 text-[#F0F5EF]">
          <h2 className="text-base sm:text-lg font-bold tracking-wide text-white uppercase border-b border-[#1C4D3C] pb-2">
            Create New Project
          </h2>

          <div className="mt-4">
            <label htmlFor="projectName" className="block text-xs font-semibold tracking-wider uppercase text-[#B2C8BA]">
              Project Name <span className="text-[#A6F16A]">*</span>
            </label>
            <input
              id="projectName"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Palayam Ward Biodiversity Survey"
              className="mt-2 w-full min-h-[48px] rounded-xl border border-[#1C4D3C] bg-[#061812] px-4 py-3 text-base text-[#F0F5EF] placeholder-[#7B9586] outline-none focus:border-[#A6F16A] focus:ring-1 focus:ring-[#A6F16A]"
            />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="org" className="block text-xs font-semibold tracking-wider uppercase text-[#B2C8BA]">
                Organization / Institution (optional)
              </label>
              <input
                id="org"
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="e.g. KSBB, College Botany Dept"
                className="mt-2 w-full min-h-[48px] rounded-xl border border-[#1C4D3C] bg-[#061812] px-4 py-3 text-base text-[#F0F5EF] placeholder-[#7B9586] outline-none focus:border-[#A6F16A] focus:ring-1 focus:ring-[#A6F16A]"
              />
            </div>

            <div>
              <label htmlFor="region" className="block text-xs font-semibold tracking-wider uppercase text-[#B2C8BA]">
                Target Region / District (optional)
              </label>
              <input
                id="region"
                type="text"
                value={targetRegion}
                onChange={(e) => setTargetRegion(e.target.value)}
                placeholder="e.g. Thiruvananthapuram District"
                className="mt-2 w-full min-h-[48px] rounded-xl border border-[#1C4D3C] bg-[#061812] px-4 py-3 text-base text-[#F0F5EF] placeholder-[#7B9586] outline-none focus:border-[#A6F16A] focus:ring-1 focus:ring-[#A6F16A]"
              />
            </div>
          </div>

          <div className="mt-4">
            <label htmlFor="projDesc" className="block text-xs font-semibold tracking-wider uppercase text-[#B2C8BA]">
              Description (optional)
            </label>
            <textarea
              id="projDesc"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the biodiversity assessment scope..."
              className="mt-2 w-full rounded-xl border border-[#1C4D3C] bg-[#061812] px-4 py-3 text-base text-[#F0F5EF] placeholder-[#7B9586] outline-none focus:border-[#A6F16A] focus:ring-1 focus:ring-[#A6F16A]"
            />
          </div>

          <div className="mt-5 flex gap-2.5">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="min-h-[48px] min-w-32 bg-gradient-to-r from-[#A6F16A] to-[#20D6A0] text-[#061812] hover:opacity-95 font-bold text-sm tracking-wider uppercase shadow-md rounded-xl active:scale-95 transition-all"
            >
              {isSubmitting ? 'Creating...' : 'Save Project'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAddForm(false)}
              className="min-h-[48px] border-[#1C4D3C] bg-[#061812] text-[#B2C8BA] hover:bg-[#133D2F] hover:text-white text-sm font-semibold tracking-wider uppercase rounded-xl transition-all"
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
                className="group cursor-pointer rounded-3xl border border-[#1C4D3C] bg-[#0D2D22] p-5 shadow-lg shadow-[#061812]/50 transition-all hover:border-[#A6F16A]/50 hover:shadow-2xl text-[#F0F5EF] focus:outline-none"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-xl font-bold text-white group-hover:text-[#A6F16A] transition-colors truncate">
                        {proj.name}
                      </h2>
                      <span className="rounded-full bg-[#133D2F] border border-[#1C4D3C] px-2.5 py-0.5 text-xs font-semibold text-[#A6F16A]">
                        Active
                      </span>
                      {isJoined && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 text-[10px] font-semibold text-amber-300 uppercase">
                          <CheckCircle2 className="h-3 w-3 text-amber-300" />
                          Joined
                        </span>
                      )}
                    </div>

                    {proj.organization && (
                      <p className="mt-1.5 flex items-center gap-1.5 text-sm text-[#B2C8BA]">
                        <Building2 className="h-4 w-4 text-[#20D6A0] shrink-0" />
                        <span className="truncate">{proj.organization}</span>
                      </p>
                    )}

                    {proj.targetRegion && (
                      <p className="mt-0.5 flex items-center gap-1.5 text-sm text-[#B2C8BA]">
                        <MapPin className="h-4 w-4 text-[#A6F16A] shrink-0" />
                        <span className="truncate">{proj.targetRegion}</span>
                      </p>
                    )}

                    {proj.description && (
                      <div className="mt-2 text-xs text-[#7B9586]">
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
                            className="mt-1 inline-flex items-center gap-0.5 text-[11px] text-[#A6F16A] hover:underline"
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
                <div className="mt-4 flex items-center justify-between border-t border-[#1C4D3C] pt-3">
                  <span className="text-xs text-[#7B9586]">
                    <strong className="text-white font-bold">{observationCounts[proj.id] ?? 0}</strong>{' '}
                    {observationCounts[proj.id] === 1 ? 'observation' : 'observations'}
                  </span>

                  <span className="inline-flex items-center gap-1 text-xs text-[#A6F16A] group-hover:translate-x-0.5 transition-transform font-semibold">
                    <span>View wards</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            )
          })
        ) : activeTab === 'my' ? (
          <div className="rounded-3xl border border-dashed border-[#1C4D3C] p-8 text-center bg-[#0D2D22] shadow-xl shadow-[#061812]/50">
            <FolderGit2 className="mx-auto h-12 w-12 text-[#7B9586]" />
            <h3 className="mt-2 text-xl font-bold text-white">No joined projects</h3>
            <p className="mt-1 text-xs text-[#B2C8BA] max-w-sm mx-auto">
              You haven&apos;t joined any projects yet. Open any project to view details and join.
            </p>
            <Button
              onClick={() => setActiveTab('all')}
              className="mt-4 bg-gradient-to-r from-[#A6F16A] to-[#20D6A0] text-[#061812] hover:opacity-95 text-xs font-bold rounded-xl active:scale-95 shadow-md"
            >
              Browse All Projects
            </Button>
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-[#1C4D3C] p-8 text-center bg-[#0D2D22] shadow-xl shadow-[#061812]/50">
            <FolderPlus className="mx-auto h-12 w-12 text-[#A6F16A]/70" />
            <h3 className="mt-2 text-xl font-bold text-white">No projects yet</h3>
            <p className="mt-1 text-sm text-[#B2C8BA] max-w-sm mx-auto">
              Create a project to organize biodiversity field data and occurrences across Thiruvananthapuram Corporation.
            </p>
            <div className="mt-5 flex flex-col sm:flex-row gap-2.5 justify-center">
              <Button
                onClick={() => setShowAddForm(true)}
                className="bg-gradient-to-r from-[#A6F16A] to-[#20D6A0] text-[#061812] hover:opacity-95 text-sm font-bold min-h-[46px] rounded-xl active:scale-95 shadow-md"
              >
                + Create Project
              </Button>
              <Button
                variant="outline"
                onClick={handleCreateSampleProject}
                className="border-[#1C4D3C] bg-[#061812] text-[#A6F16A] hover:bg-[#133D2F] text-sm font-semibold min-h-[46px] rounded-xl active:scale-95 shadow-sm"
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
