import { useParams, Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Plus, ArrowRight, Trash2, ArrowLeft, Calendar, User, Layers, Leaf } from 'lucide-react'
import {
  useSurveys,
  formatSurveyDateTime,
  SURVEY_METHODS,
  HABITAT_TYPES,
  TARGET_GROUPS,
} from '@/features/projects'

export default function SurveysPage() {
  const { projectId, wardId } = useParams<{ projectId: string; wardId: string }>()
  const navigate = useNavigate()

  const {
    project,
    ward,
    surveys,
    observationCounts,
    showAddForm,
    setShowAddForm,
    leadObserver,
    setLeadObserver,
    surveyMethod,
    setSurveyMethod,
    habitatType,
    setHabitatType,
    targetGroup,
    setTargetGroup,
    weatherNotes,
    setWeatherNotes,
    isSubmitting,
    createSurvey,
    deleteSurvey,
  } = useSurveys(projectId, wardId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newId = await createSurvey()
    if (newId && projectId && wardId) {
      navigate(`/projects/${projectId}/wards/${wardId}/surveys/${newId}/observations`)
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-5 sm:px-6 text-[#F0F5EF] space-y-5">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-1.5 text-xs text-[#7B9586] flex-wrap">
        <Link to="/projects" className="text-[#A6F16A] font-semibold hover:underline">
          Projects
        </Link>
        <span>/</span>
        <Link
          to={`/projects/${projectId}/wards`}
          className="inline-flex items-center gap-1 text-[#A6F16A] font-semibold hover:underline truncate max-w-[200px]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>{ward ? `Ward ${ward.wardNumber}` : 'Wards'}</span>
        </Link>
        <span>/</span>
        <span className="font-semibold text-white">Field Visits</span>
      </nav>

      {/* Ward Context Header */}
      <div className="rounded-3xl border border-[#1C4D3C] bg-[#0D2D22] p-5 sm:p-6 shadow-xl shadow-[#061812]/50 text-[#F0F5EF]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="rounded-full bg-[#133D2F] border border-[#1C4D3C] px-3 py-0.5 text-xs font-semibold text-[#A6F16A]">
                Ward {ward?.wardNumber}
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white">{ward?.wardName}</h1>
            </div>
            {project && (
              <p className="mt-1 text-xs text-[#B2C8BA]">
                Project: <span className="text-white font-medium">{project.name}</span>
              </p>
            )}
          </div>

          <Button
            onClick={() => setShowAddForm((prev) => !prev)}
            className="inline-flex min-h-[44px] items-center gap-2 self-start sm:self-auto bg-gradient-to-r from-[#A6F16A] to-[#20D6A0] text-[#061812] hover:opacity-95 font-bold text-sm shadow-md shadow-[#20D6A0]/20 rounded-2xl active:scale-95 transition-all"
          >
            <Plus className="h-4 w-4 text-[#061812]" />
            <span>{showAddForm ? 'Cancel' : 'Start Field Visit'}</span>
          </Button>
        </div>
      </div>

      {/* Start Survey Visit Form (Collapsible) */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="mb-6 rounded-3xl border border-[#1C4D3C] bg-[#0D2D22] p-5 sm:p-6 shadow-xl shadow-[#061812]/50 text-[#F0F5EF]">
          <h2 className="text-base sm:text-lg font-bold tracking-wide text-white uppercase border-b border-[#1C4D3C] pb-2">
            Start New Survey / Field Visit
          </h2>
          <p className="mt-1.5 text-xs text-[#B2C8BA]">
            Set parameters for this field session. All observations logged will link to this visit.
          </p>

          <div className="mt-4">
            <label htmlFor="leadObserver" className="block text-xs font-semibold tracking-wider uppercase text-[#B2C8BA]">
              Lead Observer / Surveyor Name <span className="text-[#A6F16A]">*</span>
            </label>
            <input
              id="leadObserver"
              type="text"
              required
              value={leadObserver}
              onChange={(e) => setLeadObserver(e.target.value)}
              placeholder="e.g. Dr. Anitha / Team Palayam"
              className="mt-2 w-full min-h-[48px] rounded-xl border border-[#1C4D3C] bg-[#061812] px-4 py-3 text-base text-[#F0F5EF] placeholder-[#7B9586] outline-none focus:border-[#A6F16A] focus:ring-1 focus:ring-[#A6F16A]"
            />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="surveyMethod" className="block text-xs font-semibold tracking-wider uppercase text-[#B2C8BA]">
                Survey Method
              </label>
              <select
                id="surveyMethod"
                value={surveyMethod}
                onChange={(e) => setSurveyMethod(e.target.value)}
                className="mt-2 w-full min-h-[48px] rounded-xl border border-[#1C4D3C] bg-[#061812] px-4 py-3 text-base text-[#F0F5EF] outline-none focus:border-[#A6F16A] focus:ring-1 focus:ring-[#A6F16A]"
              >
                {SURVEY_METHODS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="habitatType" className="block text-xs font-semibold tracking-wider uppercase text-[#B2C8BA]">
                Broad Habitat Type
              </label>
              <select
                id="habitatType"
                value={habitatType}
                onChange={(e) => setHabitatType(e.target.value)}
                className="mt-2 w-full min-h-[48px] rounded-xl border border-[#1C4D3C] bg-[#061812] px-4 py-3 text-base text-[#F0F5EF] outline-none focus:border-[#A6F16A] focus:ring-1 focus:ring-[#A6F16A]"
              >
                {HABITAT_TYPES.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label htmlFor="targetGroup" className="block text-xs font-semibold tracking-wider uppercase text-[#B2C8BA]">
              Survey Focus / Target Group
            </label>
            <select
              id="targetGroup"
              value={targetGroup}
              onChange={(e) => setTargetGroup(e.target.value)}
              className="mt-2 w-full min-h-[48px] rounded-xl border border-[#1C4D3C] bg-[#061812] px-4 py-3 text-base text-[#F0F5EF] outline-none focus:border-[#A6F16A] focus:ring-1 focus:ring-[#A6F16A]"
            >
              {TARGET_GROUPS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-4">
            <label htmlFor="weather" className="block text-xs font-semibold tracking-wider uppercase text-[#B2C8BA]">
              Weather & Site Notes (optional)
            </label>
            <input
              id="weather"
              type="text"
              value={weatherNotes}
              onChange={(e) => setWeatherNotes(e.target.value)}
              placeholder="e.g. Sunny morning, 28°C, post-monsoon flowering season"
              className="mt-2 w-full min-h-[48px] rounded-xl border border-[#1C4D3C] bg-[#061812] px-4 py-3 text-base text-[#F0F5EF] placeholder-[#7B9586] outline-none focus:border-[#A6F16A] focus:ring-1 focus:ring-[#A6F16A]"
            />
          </div>

          <div className="mt-5 flex gap-2.5">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="min-h-[48px] min-w-40 bg-gradient-to-r from-[#A6F16A] to-[#20D6A0] text-[#061812] hover:opacity-95 font-bold text-sm tracking-wider uppercase shadow-md rounded-xl active:scale-95 transition-all"
            >
              {isSubmitting ? 'Starting...' : 'Start Session & Log'}
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

      {/* Surveys List */}
      <div className="space-y-4">
        {surveys.length > 0 ? (
          surveys.map((survey) => (
            <div
              key={survey.id}
              className="group rounded-3xl border border-[#1C4D3C] bg-[#0D2D22] p-5 shadow-lg shadow-[#061812]/50 transition-all hover:border-[#A6F16A]/50 text-[#F0F5EF]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="flex items-center gap-1.5 text-lg font-bold text-white">
                      <User className="h-4 w-4 text-[#A6F16A]" />
                      {survey.leadObserver}
                    </span>
                    <span className="rounded-full bg-[#133D2F] border border-[#1C4D3C] px-2.5 py-0.5 text-xs font-semibold text-[#A6F16A]">
                      {survey.surveyMethod}
                    </span>
                  </div>

                  <p className="mt-1.5 flex items-center gap-1.5 text-xs text-[#B2C8BA]">
                    <Calendar className="h-3.5 w-3.5 text-[#20D6A0]" />
                    <span>Started: {formatSurveyDateTime(survey.startTime)}</span>
                  </p>

                  <div className="mt-2.5 flex items-center gap-2 text-xs text-[#F0F5EF] flex-wrap">
                    {survey.habitatType && (
                      <span className="bg-[#061812] border border-[#1C4D3C] rounded-lg px-2.5 py-0.5 font-medium text-[#B2C8BA]">
                        Habitat: {survey.habitatType}
                      </span>
                    )}
                    {survey.targetGroup && (
                      <span className="bg-[#061812] border border-[#1C4D3C] rounded-lg px-2.5 py-0.5 font-medium text-[#B2C8BA]">
                        Focus: {survey.targetGroup}
                      </span>
                    )}
                  </div>

                  {survey.weatherNotes && (
                    <p className="mt-2 text-xs text-[#7B9586] italic">
                      &ldquo;{survey.weatherNotes}&rdquo;
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => deleteSurvey(survey.id)}
                  className="rounded-lg p-2 text-[#7B9586] hover:bg-rose-950/60 hover:text-rose-400 transition-colors"
                  title="Delete field visit"
                  aria-label="Delete field visit"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* Action row */}
              <div className="mt-4 flex items-center justify-between border-t border-[#1C4D3C] pt-3">
                <span className="text-xs text-[#7B9586]">
                  <strong className="text-white font-bold">{observationCounts[survey.id] ?? 0}</strong>{' '}
                  {observationCounts[survey.id] === 1 ? 'observation' : 'observations'} logged
                </span>

                <Button
                  onClick={() =>
                    navigate(`/projects/${projectId}/wards/${wardId}/surveys/${survey.id}/observations`)
                  }
                  className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#A6F16A] to-[#20D6A0] text-[#061812] hover:opacity-95 text-xs font-bold px-4 shadow-sm transition-all active:scale-95"
                >
                  <Leaf className="h-4 w-4 text-[#061812]" />
                  <span>Log Species</span>
                  <ArrowRight className="h-4 w-4 ml-0.5 text-[#061812]" />
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-3xl border border-dashed border-[#1C4D3C] p-8 text-center bg-[#0D2D22] shadow-xl shadow-[#061812]/50">
            <Layers className="mx-auto h-12 w-12 text-[#A6F16A]/60" />
            <h3 className="mt-3 text-xl font-bold text-white">No field visits recorded yet</h3>
            <p className="mt-1 text-sm text-[#B2C8BA] max-w-sm mx-auto">
              Start a field visit in Ward {ward?.wardNumber || ''} to log species observations.
            </p>
            <Button
              onClick={() => setShowAddForm(true)}
              className="mt-5 bg-gradient-to-r from-[#A6F16A] to-[#20D6A0] text-[#061812] hover:opacity-95 text-sm font-bold min-h-[46px] px-6 rounded-2xl active:scale-95 shadow-md"
            >
              + Start Field Visit
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
