import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { db, type Survey, type Ward, type Project } from '@/db/database'
import { Plus, ArrowRight, Trash2, ArrowLeft, Calendar, User, Layers, Leaf } from 'lucide-react'

const SURVEY_METHODS = [
  'Opportunistic Encounter',
  'Line Transect',
  'Point Count',
  'Fixed Area Plot',
  'Camera Trap',
  'Other',
] as const

const HABITAT_TYPES = [
  'Urban Park / Garden',
  'Home Garden',
  'Wetland / Pond / Stream',
  'Canal / Drain',
  'Roadside Avenue',
  'Sacred Grove (Kavu)',
  'Agricultural Land',
  'Forest Patch',
  'Coastal / Beach',
  'Other',
] as const

const TARGET_GROUPS = [
  'All Biodiversity',
  'Birds only',
  'Flora / Trees only',
  'Insects / Butterflies only',
  'Herpetofauna (Reptiles/Amphibians)',
  'Mammals only',
  'Other',
] as const

function SurveysPage() {
  const { projectId, wardId } = useParams<{ projectId: string; wardId: string }>()
  const navigate = useNavigate()

  const [project, setProject] = useState<Project | null>(null)
  const [ward, setWard] = useState<Ward | null>(null)
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [observationCounts, setObservationCounts] = useState<Record<string, number>>({})
  const [showAddForm, setShowAddForm] = useState(false)

  // Form state
  const [leadObserver, setLeadObserver] = useState('')
  const [surveyMethod, setSurveyMethod] = useState<string>('Opportunistic Encounter')
  const [habitatType, setHabitatType] = useState<string>('Urban Park / Garden')
  const [targetGroup, setTargetGroup] = useState<string>('All Biodiversity')
  const [weatherNotes, setWeatherNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadData = async () => {
    if (!projectId || !wardId) return
    const [p, w] = await Promise.all([
      db.projects.get(projectId),
      db.wards.get(wardId),
    ])
    if (p) setProject(p)
    if (w) setWard(w)

    const list = await db.surveys.where('wardId').equals(wardId).toArray()
    setSurveys(list.reverse())

    // Load observation count per survey visit
    const counts: Record<string, number> = {}
    for (const s of list) {
      const count = await db.observations.where('surveyId').equals(s.id).count()
      counts[s.id] = count
    }
    setObservationCounts(counts)
  }

  useEffect(() => {
    loadData()
  }, [projectId, wardId])

  const handleCreateSurvey = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!projectId || !wardId) return
    if (!leadObserver.trim()) {
      alert('Please enter the name of the lead observer/researcher.')
      return
    }

    setIsSubmitting(true)
    try {
      const newId = crypto.randomUUID()
      const now = new Date().toISOString()
      const newSurvey: Survey = {
        id: newId,
        projectId,
        wardId,
        leadObserver: leadObserver.trim(),
        surveyMethod,
        habitatType,
        targetGroup,
        startTime: now,
        weatherNotes: weatherNotes.trim() || undefined,
        createdAt: now,
        updatedAt: now,
        syncStatus: 'pending',
      }

      await db.surveys.add(newSurvey)
      setLeadObserver('')
      setWeatherNotes('')
      setShowAddForm(false)
      await loadData()

      // Automatically navigate to the observation recording screen for this new survey session!
      navigate(`/projects/${projectId}/wards/${wardId}/surveys/${newId}/observations`)
    } catch (err) {
      alert(`Failed to start field visit: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteSurvey = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this field visit record?')) {
      await db.surveys.delete(id)
      await loadData()
    }
  }

  const formatDateTime = (isoString?: string) => {
    if (!isoString) return ''
    const d = new Date(isoString)
    return Number.isNaN(d.getTime())
      ? ''
      : d.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-5 sm:px-6">
      {/* Breadcrumb Navigation */}
      <nav className="mb-4 flex items-center gap-1.5 text-sm text-[#C5D1BD] flex-wrap">
        <Link to="/projects" className="text-[#F5F0E4] font-medium hover:underline">
          Projects
        </Link>
        <span>/</span>
        <Link
          to={`/projects/${projectId}/wards`}
          className="inline-flex items-center gap-1 text-[#F5F0E4] font-medium hover:underline truncate max-w-[200px]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>{ward ? `Ward ${ward.wardNumber}` : 'Wards'}</span>
        </Link>
        <span>/</span>
        <span className="font-semibold text-[#F5F0E4]">Field Visits</span>
      </nav>

      {/* Ward Context Header */}
      <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md p-5 shadow-xl mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="rounded-md bg-[#263D2B] border border-[#C5D1BD]/30 px-2.5 py-0.5 text-xs font-semibold text-[#F5F0E4]">
                Ward {ward?.wardNumber}
              </span>
              <h1 className="font-heading text-xl sm:text-2xl font-normal text-[#F5F0E4]">{ward?.wardName}</h1>
            </div>
            {project && (
              <p className="mt-1 text-xs text-[#C5D1BD]">
                Project: <span className="text-[#F5F0E4] font-medium">{project.name}</span>
              </p>
            )}
          </div>

          <Button
            onClick={() => setShowAddForm((prev) => !prev)}
            className="inline-flex min-h-[44px] items-center gap-2 self-start sm:self-auto bg-[#263D2B] text-[#F5F0E4] border border-[#C5D1BD]/40 hover:bg-[#324D38] font-medium text-base shadow-sm rounded-xl active:scale-95 transition-all"
          >
            <Plus className="h-4 w-4 text-[#C5D1BD]" />
            <span>{showAddForm ? 'Cancel' : 'Start Field Visit'}</span>
          </Button>
        </div>
      </div>

      {/* Start Survey Visit Form (Collapsible) - MOYA Warm Cream Style */}
      {showAddForm && (
        <form onSubmit={handleCreateSurvey} className="mb-6 rounded-3xl border border-[#DCD5C5] bg-[#FAF7F0] p-5 sm:p-6 shadow-xl text-[#263D2B]">
          <h2 className="font-heading text-base sm:text-lg font-normal tracking-wider uppercase text-[#263D2B] border-b border-[#DCD5C5] pb-1">
            Start New Survey / Field Visit
          </h2>
          <p className="mt-1 text-xs text-[#414B32]">
            Set parameters for this field session. All observations logged will link to this visit.
          </p>

          <div className="mt-4">
            <label htmlFor="leadObserver" className="block text-xs font-semibold tracking-wider uppercase text-[#414B32]">
              Lead Observer / Surveyor Name <span className="text-[#B87555]">*</span>
            </label>
            <input
              id="leadObserver"
              type="text"
              required
              value={leadObserver}
              onChange={(e) => setLeadObserver(e.target.value)}
              placeholder="e.g. Dr. Anitha / Team Palayam"
              className="mt-2 w-full min-h-[48px] rounded-xl border border-[#C5D1BD] bg-white px-4 py-3 text-base text-[#263D2B] placeholder-[#414B32]/40 outline-none focus:border-[#263D2B] focus:ring-1 focus:ring-[#263D2B]"
            />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="surveyMethod" className="block text-xs font-semibold tracking-wider uppercase text-[#414B32]">
                Survey Method
              </label>
              <select
                id="surveyMethod"
                value={surveyMethod}
                onChange={(e) => setSurveyMethod(e.target.value)}
                className="mt-2 w-full min-h-[48px] rounded-xl border border-[#C5D1BD] bg-white px-4 py-3 text-base text-[#263D2B] outline-none focus:border-[#263D2B] focus:ring-1 focus:ring-[#263D2B]"
              >
                {SURVEY_METHODS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="habitatType" className="block text-xs font-semibold tracking-wider uppercase text-[#414B32]">
                Broad Habitat Type
              </label>
              <select
                id="habitatType"
                value={habitatType}
                onChange={(e) => setHabitatType(e.target.value)}
                className="mt-2 w-full min-h-[48px] rounded-xl border border-[#C5D1BD] bg-white px-4 py-3 text-base text-[#263D2B] outline-none focus:border-[#263D2B] focus:ring-1 focus:ring-[#263D2B]"
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
            <label htmlFor="targetGroup" className="block text-xs font-semibold tracking-wider uppercase text-[#414B32]">
              Survey Focus / Target Group
            </label>
            <select
              id="targetGroup"
              value={targetGroup}
              onChange={(e) => setTargetGroup(e.target.value)}
              className="mt-2 w-full min-h-[48px] rounded-xl border border-[#C5D1BD] bg-white px-4 py-3 text-base text-[#263D2B] outline-none focus:border-[#263D2B] focus:ring-1 focus:ring-[#263D2B]"
            >
              {TARGET_GROUPS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-4">
            <label htmlFor="weather" className="block text-xs font-semibold tracking-wider uppercase text-[#414B32]">
              Weather & Site Notes (optional)
            </label>
            <input
              id="weather"
              type="text"
              value={weatherNotes}
              onChange={(e) => setWeatherNotes(e.target.value)}
              placeholder="e.g. Sunny morning, 28°C, post-monsoon flowering season"
              className="mt-2 w-full min-h-[48px] rounded-xl border border-[#C5D1BD] bg-white px-4 py-3 text-base text-[#263D2B] placeholder-[#414B32]/40 outline-none focus:border-[#263D2B] focus:ring-1 focus:ring-[#263D2B]"
            />
          </div>

          <div className="mt-5 flex gap-2.5">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="min-h-[48px] min-w-40 bg-[#263D2B] text-[#F5F0E4] hover:bg-[#1E3022] font-medium text-sm tracking-wider uppercase shadow-sm rounded-full sm:rounded-xl active:scale-95 transition-all"
            >
              {isSubmitting ? 'Starting...' : 'Start Session & Log'}
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

      {/* Surveys List */}
      <div className="space-y-4">
        {surveys.length > 0 ? (
          surveys.map((survey) => (
            <div
              key={survey.id}
              className="group rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md p-5 shadow-xl transition-all hover:border-white/30 text-[#F5F0E4]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="flex items-center gap-1.5 font-heading text-lg font-normal text-[#F5F0E4]">
                      <User className="h-4 w-4 text-[#C5D1BD]" />
                      {survey.leadObserver}
                    </span>
                    <span className="rounded-full bg-[#263D2B] border border-[#C5D1BD]/40 px-2.5 py-0.5 text-xs font-semibold text-[#C5D1BD]">
                      {survey.surveyMethod}
                    </span>
                  </div>

                  <p className="mt-1.5 flex items-center gap-1.5 text-xs text-[#C5D1BD]">
                    <Calendar className="h-3.5 w-3.5 text-[#C5D1BD]" />
                    <span>Started: {formatDateTime(survey.startTime)}</span>
                  </p>

                  <div className="mt-2.5 flex items-center gap-2 text-xs text-[#F5F0E4] flex-wrap">
                    {survey.habitatType && (
                      <span className="bg-white/10 border border-white/15 rounded-lg px-2.5 py-0.5 font-normal">
                        Habitat: {survey.habitatType}
                      </span>
                    )}
                    {survey.targetGroup && (
                      <span className="bg-white/10 border border-white/15 rounded-lg px-2.5 py-0.5 font-normal">
                        Focus: {survey.targetGroup}
                      </span>
                    )}
                  </div>

                  {survey.weatherNotes && (
                    <p className="mt-2 text-xs text-[#C5D1BD]/90 italic">
                      &ldquo;{survey.weatherNotes}&rdquo;
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteSurvey(survey.id)}
                  className="rounded-lg p-2 text-[#B87555] hover:bg-[#B87555]/20 hover:text-[#E8A585] transition-colors"
                  title="Delete field visit"
                  aria-label="Delete field visit"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* Action row */}
              <div className="mt-4 flex items-center justify-between border-t border-white/15 pt-3">
                <span className="text-xs text-[#C5D1BD]">
                  <strong className="text-[#F5F0E4] font-semibold">{observationCounts[survey.id] ?? 0}</strong>{' '}
                  {observationCounts[survey.id] === 1 ? 'observation' : 'observations'} logged
                </span>

                <Button
                  onClick={() =>
                    navigate(`/projects/${projectId}/wards/${wardId}/surveys/${survey.id}/observations`)
                  }
                  className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl bg-[#263D2B] text-[#F5F0E4] border border-[#C5D1BD]/40 hover:bg-[#324D38] text-sm font-medium px-4 shadow-sm transition-all active:scale-95"
                >
                  <Leaf className="h-4 w-4 text-[#C5D1BD]" />
                  <span>Log Species</span>
                  <ArrowRight className="h-4 w-4 ml-0.5 text-[#C5D1BD]" />
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-white/25 p-8 text-center bg-white/10 backdrop-blur-md shadow-xl">
            <Layers className="mx-auto h-12 w-12 text-[#C5D1BD]" />
            <h3 className="mt-3 font-heading text-xl font-normal text-[#F5F0E4]">No field visits recorded yet</h3>
            <p className="mt-1 text-sm text-[#C5D1BD] max-w-sm mx-auto">
              Start a field visit in Ward {ward?.wardNumber || ''} to log species observations.
            </p>
            <Button
              onClick={() => setShowAddForm(true)}
              className="mt-5 bg-[#263D2B] text-[#F5F0E4] border border-[#C5D1BD]/40 hover:bg-[#324D38] text-base font-medium min-h-[48px] px-6 rounded-xl active:scale-95 shadow-sm"
            >
              + Start Field Visit
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default SurveysPage
