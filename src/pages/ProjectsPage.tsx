import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { db, type Project } from '@/db/database'
import { Plus, ArrowRight, Trash2, FolderPlus, MapPin, Building2, FolderGit2 } from 'lucide-react'

function ProjectsPage() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState<Project[]>([])
  const [wardCounts, setWardCounts] = useState<Record<string, number>>({})
  const [showAddForm, setShowAddForm] = useState(false)

  // New project form state
  const [name, setName] = useState('')
  const [organization, setOrganization] = useState('')
  const [targetRegion, setTargetRegion] = useState('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load projects from IndexedDB
  const loadProjects = async () => {
    const list = await db.projects.toArray()
    setProjects(list.reverse())

    // Load ward counts per project
    const counts: Record<string, number> = {}
    for (const p of list) {
      const count = await db.wards.where('projectId').equals(p.id).count()
      counts[p.id] = count
    }
    setWardCounts(counts)
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
      description: 'Comprehensive ward-level documentation of urban flora, fauna, and local biodiversity.',
      status: 'active',
      createdAt: now,
      updatedAt: now,
      syncStatus: 'pending',
    }

    await db.projects.add(sampleProj)

    // Pre-create a sample ward
    const sampleWardId = crypto.randomUUID()
    await db.wards.add({
      id: sampleWardId,
      projectId: newId,
      wardNumber: '14',
      wardName: 'Palayam',
      localBodyName: 'Thiruvananthapuram Municipal Corporation',
      district: 'Thiruvananthapuram',
      state: 'Kerala',
      keyLandmarks: 'Secretariat, Palayam Market, University Library area',
      createdAt: now,
      updatedAt: now,
      syncStatus: 'pending',
    })

    await loadProjects()
  }

  // Delete project
  const handleDeleteProject = async (id: string, projName: string) => {
    if (window.confirm(`Are you sure you want to delete "${projName}"? Associated wards and survey references will remain until cleaned.`)) {
      await db.projects.delete(id)
      await loadProjects()
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-5 sm:px-6">
      {/* Header section */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-white/15 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#263D2B] border border-[#C5D1BD]/30 text-[#C5D1BD]">
              <FolderGit2 className="h-4.5 w-4.5" />
            </div>
            <h1 className="font-heading text-2xl sm:text-[28px] font-normal tracking-wide text-[#F5F0E4]">
              Projects & Initiatives
            </h1>
          </div>
          <p className="mt-1 text-sm text-[#C5D1BD]">
            Manage biodiversity registers and municipal wards.
          </p>
        </div>

        <Button
          onClick={() => setShowAddForm((prev) => !prev)}
          className="inline-flex min-h-[44px] items-center gap-2 self-start sm:self-auto bg-[#263D2B] text-[#F5F0E4] border border-[#C5D1BD]/40 hover:bg-[#324D38] font-medium text-base shadow-sm rounded-xl transition-all active:scale-95"
        >
          <Plus className="h-4 w-4 text-[#C5D1BD]" />
          <span>{showAddForm ? 'Cancel' : 'New Project'}</span>
        </Button>
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
        {projects.length > 0 ? (
          projects.map((proj) => (
            <div
              key={proj.id}
              className="group rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md p-5 shadow-xl transition-all hover:border-white/30 text-[#F5F0E4]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-heading text-xl font-normal text-[#F5F0E4] truncate">{proj.name}</h2>
                    <span className="rounded-full bg-[#263D2B]/90 border border-[#C5D1BD]/40 px-2.5 py-0.5 text-xs font-semibold text-[#C5D1BD]">
                      Active
                    </span>
                  </div>

                  {proj.organization && (
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-[#C5D1BD]">
                      <Building2 className="h-4 w-4 text-[#C5D1BD] shrink-0" />
                      <span className="truncate">{proj.organization}</span>
                    </p>
                  )}

                  {proj.targetRegion && (
                    <p className="mt-0.5 flex items-center gap-1.5 text-sm text-[#C5D1BD]">
                      <MapPin className="h-4 w-4 text-[#C5D1BD] shrink-0" />
                      <span className="truncate">{proj.targetRegion}</span>
                    </p>
                  )}

                  {proj.description && (
                    <p className="mt-2 text-sm text-[#C5D1BD]/90 line-clamp-2 leading-relaxed">{proj.description}</p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteProject(proj.id, proj.name)}
                  className="rounded-lg p-2 text-[#B87555] hover:bg-[#B87555]/20 hover:text-[#E8A585] transition-colors"
                  title="Delete project"
                  aria-label="Delete project"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* Action row */}
              <div className="mt-4 flex items-center justify-between border-t border-white/15 pt-3">
                <span className="text-sm text-[#C5D1BD]">
                  <strong className="text-[#F5F0E4]">{wardCounts[proj.id] ?? 0}</strong> {wardCounts[proj.id] === 1 ? 'ward' : 'wards'} registered
                </span>

                <Button
                  onClick={() => navigate(`/projects/${proj.id}/wards`)}
                  className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl bg-[#263D2B] text-[#F5F0E4] border border-[#C5D1BD]/40 hover:bg-[#324D38] text-sm font-medium px-4 shadow-sm transition-all active:scale-95"
                >
                  <span>Explore Wards</span>
                  <ArrowRight className="h-4 w-4 text-[#C5D1BD]" />
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-white/25 p-8 text-center bg-white/10 backdrop-blur-md shadow-xl">
            <FolderPlus className="mx-auto h-12 w-12 text-[#C5D1BD]" />
            <h3 className="mt-2 font-heading text-xl font-normal text-[#F5F0E4]">No projects yet</h3>
            <p className="mt-1 text-sm text-[#C5D1BD] max-w-sm mx-auto">
              Create a project to organize municipal wards, survey visits, and biodiversity occurrences.
            </p>
            <div className="mt-5 flex flex-col sm:flex-row gap-2.5 justify-center">
              <Button
                onClick={() => setShowAddForm(true)}
                className="bg-[#263D2B] text-[#F5F0E4] border border-[#C5D1BD]/40 hover:bg-[#324D38] text-base font-medium min-h-[48px] rounded-xl active:scale-95 shadow-sm"
              >
                + Create Project
              </Button>
              <Button
                variant="outline"
                onClick={handleCreateSampleProject}
                className="border-white/20 bg-white/10 text-[#F5F0E4] hover:bg-white/20 text-base font-medium min-h-[48px] rounded-xl active:scale-95"
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
