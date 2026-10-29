import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  Plus,
  ArrowRight,
  FolderPlus,
  MapPin,
  Building2,
  FolderGit2,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Trash2,
  X,
} from 'lucide-react'
import { useProjects } from '@/features/projects'

function ProjectsPage() {
  const navigate = useNavigate()
  const {
    projects,
    joinedIds,
    activeTab,
    setActiveTab,
    expandedProjectId,
    setExpandedProjectId,
    observationCounts,
    showAddForm,
    setShowAddForm,
    name,
    setName,
    organization,
    setOrganization,
    targetRegion,
    setTargetRegion,
    description,
    setDescription,
    isSubmitting,
    handleCreateProject,
    handleCreateSampleProject,
    handleDeleteProject,
    hasProjects,
    displayedProjects,
  } = useProjects()

  return (
    <div className="mx-auto w-full max-w-lg h-full max-h-full flex flex-col overflow-hidden px-4 pt-3 pb-2 sm:px-6 text-[#F0F5EF]">
      {/* Header section (fixed at top of page view) */}
      <div className="shrink-0 flex items-center justify-between border-b border-[#1C4D3C] pb-3 pt-1">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0D2D22] border border-[#1C4D3C] text-[#A6F16A] shadow-md shrink-0">
            <FolderGit2 className="h-5 w-5" />
          </div>
          <h1 className="text-2xl sm:text-[28px] font-extrabold tracking-tight text-white leading-tight">
            Projects
          </h1>
        </div>

        {/* Top-right + New Project / Cancel button */}
        {(hasProjects || showAddForm) && (
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className={`inline-flex min-h-[40px] items-center gap-2 font-bold text-sm shadow-md rounded-2xl transition-all active:scale-95 shrink-0 ${
              showAddForm
                ? 'border border-[#1C4D3C] bg-[#0D2D22] text-[#B2C8BA] hover:text-white hover:bg-[#133D2F]'
                : 'bg-gradient-to-r from-[#A6F16A] to-[#20D6A0] text-[#061812] hover:opacity-95 shadow-[#20D6A0]/20'
            }`}
          >
            {showAddForm ? (
              <>
                <X className="h-4 w-4" />
                <span>Cancel</span>
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 text-[#061812]" />
                <span>New Project</span>
              </>
            )}
          </Button>
        )}
      </div>

      {showAddForm ? (
        /* Exclusively show the Create New Project form / view (fixed to screen, internal scrolling) */
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden py-3">
          <form
            onSubmit={handleCreateProject}
            className="flex-1 min-h-0 flex flex-col rounded-3xl border border-[#1C4D3C] bg-[#0D2D22] p-4 sm:p-5 shadow-xl shadow-[#061812]/50 text-[#F0F5EF] overflow-hidden"
          >
            {/* Form Header */}
            <div className="shrink-0 flex items-center justify-between border-b border-[#1C4D3C] pb-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[#A6F16A]" />
                <h2 className="text-base sm:text-lg font-bold tracking-wide text-white uppercase">
                  Create New Project
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="rounded-lg p-1.5 text-[#B2C8BA] hover:bg-[#133D2F] hover:text-white transition-colors cursor-pointer"
                title="Close form"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Scrollable form content */}
            <div className="flex-1 min-h-0 overflow-y-auto py-3 space-y-3.5 pr-1 overscroll-contain">
              <div>
                <label
                  htmlFor="projectName"
                  className="block text-xs font-semibold tracking-wider uppercase text-[#B2C8BA]"
                >
                  Project Name <span className="text-[#A6F16A]">*</span>
                </label>
                <input
                  id="projectName"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Palayam Ward Biodiversity Survey"
                  className="mt-1.5 w-full min-h-[46px] rounded-xl border border-[#1C4D3C] bg-[#061812] px-4 py-2.5 text-base text-[#F0F5EF] placeholder-[#7B9586] outline-none focus:border-[#A6F16A] focus:ring-1 focus:ring-[#A6F16A]"
                />
              </div>

              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="org"
                    className="block text-xs font-semibold tracking-wider uppercase text-[#B2C8BA]"
                  >
                    Organization / Institution (optional)
                  </label>
                  <input
                    id="org"
                    type="text"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="e.g. KSBB, College Botany Dept"
                    className="mt-1.5 w-full min-h-[46px] rounded-xl border border-[#1C4D3C] bg-[#061812] px-4 py-2.5 text-base text-[#F0F5EF] placeholder-[#7B9586] outline-none focus:border-[#A6F16A] focus:ring-1 focus:ring-[#A6F16A]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="region"
                    className="block text-xs font-semibold tracking-wider uppercase text-[#B2C8BA]"
                  >
                    Target Region / District (optional)
                  </label>
                  <input
                    id="region"
                    type="text"
                    value={targetRegion}
                    onChange={(e) => setTargetRegion(e.target.value)}
                    placeholder="e.g. Thiruvananthapuram District"
                    className="mt-1.5 w-full min-h-[46px] rounded-xl border border-[#1C4D3C] bg-[#061812] px-4 py-2.5 text-base text-[#F0F5EF] placeholder-[#7B9586] outline-none focus:border-[#A6F16A] focus:ring-1 focus:ring-[#A6F16A]"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="projDesc"
                  className="block text-xs font-semibold tracking-wider uppercase text-[#B2C8BA]"
                >
                  Description (optional)
                </label>
                <textarea
                  id="projDesc"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of the biodiversity assessment scope..."
                  className="mt-1.5 w-full rounded-xl border border-[#1C4D3C] bg-[#061812] px-4 py-2.5 text-base text-[#F0F5EF] placeholder-[#7B9586] outline-none focus:border-[#A6F16A] focus:ring-1 focus:ring-[#A6F16A]"
                />
              </div>
            </div>

            {/* Pinned Form Action Buttons */}
            <div className="shrink-0 pt-3 border-t border-[#1C4D3C] flex flex-wrap gap-2.5">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="min-h-[46px] min-w-36 bg-gradient-to-r from-[#A6F16A] to-[#20D6A0] text-[#061812] hover:opacity-95 font-bold text-sm tracking-wider uppercase shadow-md rounded-xl active:scale-95 transition-all"
              >
                {isSubmitting ? 'Creating...' : 'Save Project'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddForm(false)}
                className="min-h-[46px] border-[#1C4D3C] bg-[#061812] text-[#B2C8BA] hover:bg-[#133D2F] hover:text-white text-sm font-semibold tracking-wider uppercase rounded-xl transition-all"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      ) : (
        /* Main projects view: tabs + project cards / empty state */
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          {/* Tabs: All Projects vs My Projects (only visible when projects exist) */}
          {hasProjects && (
            <div className="shrink-0 mt-3 flex items-center gap-2 border-b border-[#1C4D3C] pb-3">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold tracking-wider uppercase transition-all cursor-pointer ${
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
                className={`rounded-full px-4 py-1.5 text-xs font-semibold tracking-wider uppercase transition-all cursor-pointer ${
                  activeTab === 'my'
                    ? 'bg-[#A6F16A] text-[#061812] shadow-sm font-bold'
                    : 'bg-[#0D2D22] text-[#B2C8BA] border border-[#1C4D3C] hover:border-[#A6F16A]/40'
                }`}
              >
                My Projects ({projects.filter((p) => joinedIds.includes(p.id)).length})
              </button>
            </div>
          )}

          {/* Projects List or Empty State (Independently scrolling) */}
          <div className="flex-1 min-h-0 overflow-y-auto py-3 space-y-4 pr-1 overscroll-contain">
            {!hasProjects ? (
              <div className="rounded-3xl border border-dashed border-[#1C4D3C] p-8 text-center bg-[#0D2D22] shadow-xl shadow-[#061812]/50 my-auto">
                <FolderPlus className="mx-auto h-12 w-12 text-[#A6F16A]/70" />
                <h3 className="mt-2 text-xl font-bold text-white">No projects yet</h3>
                <p className="mt-1 text-sm text-[#B2C8BA] max-w-sm mx-auto">
                  Create a project to organize biodiversity field data.
                </p>
                <div className="mt-5 flex flex-col sm:flex-row gap-2.5 justify-center">
                  <Button
                    onClick={() => setShowAddForm(true)}
                    className="bg-gradient-to-r from-[#A6F16A] to-[#20D6A0] text-[#061812] hover:opacity-95 text-sm font-bold min-h-[46px] rounded-xl active:scale-95 shadow-md"
                  >
                    <Plus className="h-4 w-4 mr-1 text-[#061812]" />
                    Create Project
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
            ) : displayedProjects.length > 0 ? (
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
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize border ${
                              proj.status === 'completed'
                                ? 'bg-emerald-950/60 border-emerald-800/60 text-emerald-300'
                                : proj.status === 'archived'
                                ? 'bg-zinc-800/60 border-zinc-700 text-zinc-300'
                                : 'bg-[#133D2F] border-[#1C4D3C] text-[#A6F16A]'
                            }`}
                          >
                            {proj.status || 'Active'}
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
                                className="mt-1 inline-flex items-center gap-0.5 text-[11px] text-[#A6F16A] hover:underline cursor-pointer"
                              >
                                <span>{isExpanded ? 'Show less' : 'Details'}</span>
                                {isExpanded ? (
                                  <ChevronUp className="h-3 w-3" />
                                ) : (
                                  <ChevronDown className="h-3 w-3" />
                                )}
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Delete project button */}
                      <button
                        type="button"
                        title="Delete project"
                        aria-label={`Delete project ${proj.name}`}
                        onClick={(e) => handleDeleteProject(e, proj.id)}
                        className="p-2 -mr-1 -mt-1 rounded-xl text-[#7B9586] hover:text-rose-400 hover:bg-rose-950/40 transition-colors shrink-0 cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Card Footer */}
                    <div className="mt-4 flex items-center justify-between border-t border-[#1C4D3C] pt-3">
                      <span className="text-xs text-[#7B9586]">
                        <strong className="text-white font-bold">
                          {observationCounts[proj.id] ?? 0}
                        </strong>{' '}
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
            ) : (
              <div className="rounded-3xl border border-dashed border-[#1C4D3C] p-8 text-center bg-[#0D2D22] shadow-xl shadow-[#061812]/50 my-auto">
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
            )}
            {/* Safe bottom spacer so last card is completely visible when scrolled to bottom */}
            <div className="h-4 shrink-0" />
          </div>
        </div>
      )}
    </div>
  )
}

export default ProjectsPage
