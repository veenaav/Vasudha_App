import { useParams, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
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
  Edit3,
  X,
  UserCheck,
} from 'lucide-react'
import { useProjectDetails, type MockUserRole } from '@/features/projects/hooks/useProjectDetails'

function WardsPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const {
    project,
    projectObservations,
    isLoading,
    userRole,
    handleRoleChange,
    canManageProject,
    isJoined,
    handleToggleJoin,
    isAuthorizedContributor,
    handleRecordObservationClick,
    showEditModal,
    setShowEditModal,
    editName,
    setEditName,
    editOrganization,
    setEditOrganization,
    editTargetRegion,
    setEditTargetRegion,
    editDescription,
    setEditDescription,
    editStatus,
    setEditStatus,
    isSavingEdit,
    handleSaveProjectEdit,
    handleDeleteProject,
  } = useProjectDetails(projectId)

  if (isLoading) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12 text-center text-[#7B9586]">
        <p className="text-base">Loading project details...</p>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12 text-center text-[#B2C8BA]">
        <p className="text-base">Project not found.</p>
        <Link to="/projects" className="mt-3 inline-block text-base text-[#A6F16A] font-semibold hover:underline">
          ← Back to Projects
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-5 sm:px-6 text-[#F0F5EF] space-y-5">
      {/* Developer Testing: Role Switcher */}
      <div className="rounded-2xl border border-[#1C4D3C] bg-[#0D2D22] px-3.5 py-2.5 text-xs text-[#B2C8BA] shadow-md shadow-[#061812]/50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <span className="text-[11px] font-bold text-[#A6F16A] tracking-wide">
            🛠️ Mock Role:
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
                onClick={() => handleRoleChange(role.id as MockUserRole)}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all cursor-pointer ${
                  userRole === role.id
                    ? 'bg-[#A6F16A] text-[#061812] font-bold shadow-xs'
                    : 'bg-[#061812] text-[#B2C8BA] border border-[#1C4D3C] hover:border-[#A6F16A]/40'
                }`}
              >
                {role.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-1.5 text-xs text-[#7B9586] flex-wrap">
        <Link to="/projects" className="inline-flex items-center gap-1 text-[#A6F16A] font-semibold hover:underline">
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Projects</span>
        </Link>
        <span>/</span>
        <span className="text-[#B2C8BA] truncate max-w-[200px]">
          {project.name}
        </span>
        <span>/</span>
        <span className="font-semibold text-white">Overview</span>
      </nav>

      {/* Project Context Header */}
      <div className="rounded-3xl border border-[#1C4D3C] bg-[#0D2D22] p-5 sm:p-6 shadow-xl shadow-[#061812]/50 text-[#F0F5EF] space-y-4">
        {/* Top Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="rounded-full bg-[#133D2F] border border-[#1C4D3C] px-3 py-0.5 text-xs font-semibold text-[#A6F16A]">
            Project Hub
          </span>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize border ${
              project.status === 'completed'
                ? 'bg-emerald-950/60 border-emerald-800/60 text-emerald-300'
                : project.status === 'archived'
                ? 'bg-zinc-800/60 border-zinc-700 text-zinc-300'
                : 'bg-[#133D2F] border-[#1C4D3C] text-[#A6F16A]'
            }`}
          >
            {project.status || 'Active'}
          </span>
          {isJoined ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-950/60 border border-amber-800/60 px-2.5 py-0.5 text-[10px] font-semibold text-amber-300 uppercase">
              <CheckCircle2 className="h-3 w-3 text-amber-300" />
              Joined
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#061812] border border-[#1C4D3C] px-2.5 py-0.5 text-[10px] font-semibold text-[#7B9586] uppercase">
              Not Joined
            </span>
          )}
        </div>

        {/* Project Title & Metadata */}
        <div className="space-y-1.5">
          <h1 className="text-xl sm:text-2xl font-extrabold text-white leading-snug">
            {project.name}
          </h1>

          {project.organization && (
            <p className="flex items-center gap-1.5 text-xs sm:text-sm text-[#B2C8BA]">
              <Building2 className="h-4 w-4 text-[#20D6A0] shrink-0" />
              <span>{project.organization}</span>
            </p>
          )}

          {project.targetRegion && (
            <p className="flex items-center gap-1.5 text-xs sm:text-sm text-[#B2C8BA]">
              <MapPin className="h-4 w-4 text-[#A6F16A] shrink-0" />
              <span>{project.targetRegion}</span>
            </p>
          )}

          {project.description && (
            <div className="mt-3 rounded-2xl bg-[#061812] border border-[#1C4D3C] p-3.5 text-xs sm:text-sm text-[#B2C8BA] leading-relaxed">
              <p className="font-bold text-[11px] text-[#A6F16A] uppercase tracking-wider mb-1">
                Project Scope & Guidelines:
              </p>
              <p className="whitespace-pre-line">{project.description}</p>
            </div>
          )}
        </div>

        {/* Project Summary Metrics */}
        <div className="grid grid-cols-3 gap-2.5 pt-3 border-t border-[#1C4D3C] text-center">
          <div className="rounded-2xl bg-[#061812] border border-[#1C4D3C] p-2.5">
            <span className="block text-[10px] uppercase tracking-wider text-[#7B9586] font-semibold">Status</span>
            <span className="text-xs sm:text-sm font-bold text-white capitalize">{project.status || 'Active'}</span>
          </div>
          <div className="rounded-2xl bg-[#061812] border border-[#1C4D3C] p-2.5">
            <span className="block text-[10px] uppercase tracking-wider text-[#7B9586] font-semibold">Members</span>
            <span className="text-xs sm:text-sm font-bold text-[#A6F16A]">
              {isJoined ? '1 (You)' : '0'}
            </span>
          </div>
          <div className="rounded-2xl bg-[#061812] border border-[#1C4D3C] p-2.5">
            <span className="block text-[10px] uppercase tracking-wider text-[#7B9586] font-semibold">Observations</span>
            <span className="text-xs sm:text-sm font-bold text-[#20D6A0]">
              {projectObservations.length}
            </span>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="pt-3 border-t border-[#1C4D3C] flex items-center justify-between gap-2.5 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Primary Action: Direct New Observation */}
            <Button
              onClick={handleRecordObservationClick}
              className={`inline-flex min-h-[42px] items-center gap-1.5 font-bold text-xs sm:text-sm rounded-xl active:scale-95 transition-all shadow-md ${
                isAuthorizedContributor
                  ? 'bg-gradient-to-r from-[#A6F16A] to-[#20D6A0] text-[#061812] hover:opacity-95 shadow-[#20D6A0]/20'
                  : 'bg-[#133D2F] border border-[#1C4D3C] hover:border-[#A6F16A]/50 text-[#A6F16A]'
              }`}
              title={isAuthorizedContributor ? 'Record observation' : 'Join project to record observation'}
            >
              <Plus className="h-4 w-4" />
              <span>{isAuthorizedContributor ? 'Record Observation' : 'Join to Record'}</span>
            </Button>

            {/* Join / Leave Project toggle */}
            <button
              type="button"
              onClick={handleToggleJoin}
              className={`inline-flex min-h-[42px] items-center gap-1.5 rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition-all active:scale-95 border cursor-pointer ${
                isJoined
                  ? 'bg-amber-950/60 text-amber-300 border-amber-800/60'
                  : 'bg-[#061812] text-[#B2C8BA] border-[#1C4D3C] hover:border-[#A6F16A]/40'
              }`}
            >
              {isJoined ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-amber-300" />
                  <span>Joined</span>
                </>
              ) : (
                <>
                  <UserCheck className="h-4 w-4 text-[#A6F16A]" />
                  <span>+ Join Project</span>
                </>
              )}
            </button>
          </div>

          {/* Administrative actions (Admin & Project Expert only) */}
          {canManageProject && (
            <div className="flex items-center gap-1.5 ml-auto sm:ml-0">
              <button
                type="button"
                onClick={() => setShowEditModal(true)}
                className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl bg-[#061812] border border-[#1C4D3C] hover:border-[#A6F16A]/50 text-[#B2C8BA] hover:text-white px-3.5 py-2 text-xs sm:text-sm font-semibold transition-all active:scale-95 cursor-pointer"
                title="Edit Project"
              >
                <Edit3 className="h-4 w-4 text-[#A6F16A]" />
                <span>Edit</span>
              </button>

              <button
                type="button"
                onClick={handleDeleteProject}
                className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl bg-rose-950/60 text-rose-300 border border-rose-800/60 hover:bg-rose-900/80 px-3.5 py-2 text-xs sm:text-sm font-semibold transition-all active:scale-95 cursor-pointer"
                title="Delete Project"
              >
                <Trash2 className="h-4 w-4 text-rose-400" />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Edit Project Modal */}
      {showEditModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-project-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150"
          onClick={() => setShowEditModal(false)}
        >
          <div
            className="relative w-full max-w-lg rounded-3xl border border-[#1C4D3C] bg-[#0D2D22] p-5 sm:p-6 shadow-2xl shadow-black/80 text-[#F0F5EF]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#1C4D3C] pb-3.5">
              <div className="flex items-center gap-2">
                <Edit3 className="h-5 w-5 text-[#A6F16A]" />
                <h3 id="edit-project-title" className="text-base sm:text-lg font-bold text-white">
                  Edit Project Details
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-[#B2C8BA] hover:text-white hover:bg-[#133D2F] transition-colors cursor-pointer"
                aria-label="Close edit modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProjectEdit} className="mt-4 space-y-3.5 text-xs sm:text-sm">
              <div>
                <label htmlFor="editProjName" className="block text-xs font-semibold tracking-wider uppercase text-[#B2C8BA]">
                  Project Name <span className="text-red-500 font-bold">*</span>
                </label>
                <input
                  id="editProjName"
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="mt-1.5 w-full min-h-[44px] rounded-xl border border-[#1C4D3C] bg-[#061812] px-3.5 py-2.5 text-base text-[#F0F5EF] outline-none focus:border-[#A6F16A] focus:ring-1 focus:ring-[#A6F16A]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="editOrg" className="block text-xs font-semibold tracking-wider uppercase text-[#B2C8BA]">
                    Organization
                  </label>
                  <input
                    id="editOrg"
                    type="text"
                    value={editOrganization}
                    onChange={(e) => setEditOrganization(e.target.value)}
                    className="mt-1.5 w-full min-h-[44px] rounded-xl border border-[#1C4D3C] bg-[#061812] px-3.5 py-2.5 text-sm text-[#F0F5EF] outline-none focus:border-[#A6F16A] focus:ring-1 focus:ring-[#A6F16A]"
                  />
                </div>

                <div>
                  <label htmlFor="editRegion" className="block text-xs font-semibold tracking-wider uppercase text-[#B2C8BA]">
                    Target Region
                  </label>
                  <input
                    id="editRegion"
                    type="text"
                    value={editTargetRegion}
                    onChange={(e) => setEditTargetRegion(e.target.value)}
                    className="mt-1.5 w-full min-h-[44px] rounded-xl border border-[#1C4D3C] bg-[#061812] px-3.5 py-2.5 text-sm text-[#F0F5EF] outline-none focus:border-[#A6F16A] focus:ring-1 focus:ring-[#A6F16A]"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="editStatusSelect" className="block text-xs font-semibold tracking-wider uppercase text-[#B2C8BA]">
                  Project Status
                </label>
                <select
                  id="editStatusSelect"
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as 'active' | 'completed' | 'archived')}
                  className="mt-1.5 w-full min-h-[44px] rounded-xl border border-[#1C4D3C] bg-[#061812] px-3.5 py-2.5 text-sm text-[#F0F5EF] outline-none focus:border-[#A6F16A] focus:ring-1 focus:ring-[#A6F16A]"
                >
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div>
                <label htmlFor="editDesc" className="block text-xs font-semibold tracking-wider uppercase text-[#B2C8BA]">
                  Description & Scope
                </label>
                <textarea
                  id="editDesc"
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-[#1C4D3C] bg-[#061812] px-3.5 py-2.5 text-sm text-[#F0F5EF] outline-none focus:border-[#A6F16A] focus:ring-1 focus:ring-[#A6F16A]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowEditModal(false)}
                  className="border-[#1C4D3C] bg-[#061812] text-[#B2C8BA] hover:bg-[#133D2F] hover:text-white text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSavingEdit}
                  className="bg-gradient-to-r from-[#A6F16A] to-[#20D6A0] text-[#061812] hover:opacity-95 text-xs font-bold rounded-xl shadow-md cursor-pointer"
                >
                  {isSavingEdit ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ward Boundary Information */}
      <div className="rounded-3xl border border-[#1C4D3C] bg-[#0D2D22] p-5 sm:p-6 shadow-xl shadow-[#061812]/50 text-[#F0F5EF]">
        <div className="flex items-center justify-between border-b border-[#1C4D3C] pb-3">
          <div className="flex items-center gap-2">
            <Compass className="h-5 w-5 text-[#A6F16A]" />
            <h2 className="text-base sm:text-lg font-bold tracking-wide uppercase text-white">
              Automatic GPS Ward Identification
            </h2>
          </div>
          <span className="rounded-full bg-[#133D2F] border border-[#1C4D3C] px-2.5 py-0.5 text-[10px] font-semibold text-[#A6F16A] uppercase tracking-wider">
            100 Corporation Wards
          </span>
        </div>

        <div className="mt-3.5 rounded-2xl bg-[#061812] p-4 border border-[#1C4D3C] text-xs sm:text-sm text-[#B2C8BA] space-y-2">
          <div className="flex items-start gap-2.5">
            <Info className="h-4 w-4 text-[#20D6A0] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-white">
                Thiruvananthapuram Municipal Corporation Boundary Matching
              </p>
              <p className="text-xs leading-relaxed text-[#7B9586]">
                Wards are not manually created. When field workers record observations outdoors, the app
                automatically matches the device GPS coordinates against official municipal boundary polygon data.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Project Observations Section */}
      <div className="border-t border-[#1C4D3C] pt-6 space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Leaf className="h-4.5 w-4.5 text-[#A6F16A]" />
            <h2 className="text-lg sm:text-xl font-bold text-white">
              Project Observations
            </h2>
          </div>
          <span className="text-xs text-[#7B9586]">
            {projectObservations.length} {projectObservations.length === 1 ? 'record' : 'records'}
          </span>
        </div>

        {projectObservations.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#1C4D3C] bg-[#0D2D22] p-6 text-center text-xs text-[#7B9586] shadow-sm">
            <p>No observations recorded in this project yet.</p>
            <p className="mt-1 text-[11px] text-[#7B9586]">
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
                  className="rounded-2xl border border-[#1C4D3C] bg-[#0D2D22] p-3.5 flex items-center gap-3 text-[#F0F5EF] shadow-md hover:border-[#A6F16A]/40 transition-colors"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#1C4D3C] bg-[#061812]">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt={obs.speciesName || 'Species'}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Leaf className="h-5 w-5 text-[#1C4D3C]" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-[#133D2F] px-2 py-0.5 text-[10px] font-semibold text-[#A6F16A] border border-[#1C4D3C] uppercase">
                        {obs.identificationStatus || 'Record'}
                      </span>
                      {obs.speciesGroup && (
                        <span className="text-xs text-[#7B9586] truncate">
                          • {obs.speciesGroup}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-white truncate mt-0.5">
                      {obs.speciesName}
                    </h3>
                    {obs.localName && (
                      <p className="text-xs text-[#B2C8BA] truncate">{obs.localName}</p>
                    )}
                  </div>
                  <div className="text-right text-xs text-[#7B9586] shrink-0">
                    <span className="flex items-center gap-1 font-medium text-[#B2C8BA]">
                      <Calendar className="h-3 w-3 text-[#20D6A0]" />
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
