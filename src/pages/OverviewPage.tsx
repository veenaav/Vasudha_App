import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FolderGit2,
  MapPin,
  Layers,
  Leaf,
  PlusCircle,
  ArrowRight,
  Database,
  Calendar,
  CheckCircle2,
  Sparkles,
} from 'lucide-react'
import { db, type Observation, type Survey, type Ward, type Project } from '@/db/database'

export default function OverviewPage() {
  const [stats, setStats] = useState({
    projectsCount: 0,
    wardsCount: 0,
    surveysCount: 0,
    observationsCount: 0,
    pendingSyncCount: 0,
  })

  const [recentSurvey, setRecentSurvey] = useState<{
    survey: Survey
    ward?: Ward
    project?: Project
  } | null>(null)

  const [recentObservations, setRecentObservations] = useState<Observation[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const loadDashboardData = async () => {
      try {
        const [
          projectsCount,
          wardsCount,
          surveysCount,
          observationsCount,
          pendingSyncCount,
          allSurveys,
          allObservations,
        ] = await Promise.all([
          db.projects.count(),
          db.wards.count(),
          db.surveys.count(),
          db.observations.count(),
          db.observations.where('syncStatus').equals('pending').count(),
          db.surveys.toArray(),
          db.observations.toArray(),
        ])

        if (!isMounted) return

        setStats({
          projectsCount,
          wardsCount,
          surveysCount,
          observationsCount,
          pendingSyncCount,
        })

        // Get latest 4 observations (sorted by creation date descending)
        const sortedObs = [...allObservations].sort((a, b) => {
          const tA = new Date(b.createdAt || b.recordedAt).getTime()
          const tB = new Date(a.createdAt || a.recordedAt).getTime()
          return tA - tB
        })
        setRecentObservations(sortedObs.slice(0, 4))

        // Get the latest survey session to provide a quick resume card
        if (allSurveys.length > 0) {
          const latestSurvey = allSurveys[allSurveys.length - 1]
          const [ward, project] = await Promise.all([
            db.wards.get(latestSurvey.wardId),
            db.projects.get(latestSurvey.projectId),
          ])
          if (isMounted) {
            setRecentSurvey({
              survey: latestSurvey,
              ward,
              project,
            })
          }
        }
      } catch (err) {
        console.error('Failed to load overview data from IndexedDB:', err)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    loadDashboardData()
    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div className="mx-auto max-w-4xl px-4 py-5 sm:px-6">
      {/* Hero Welcome Banner */}
      <section className="mb-6 overflow-hidden rounded-2xl border border-[#DCE8D9] bg-gradient-to-br from-[#244B38] to-[#1b382a] p-5 text-white shadow-sm sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-semibold text-[#DCE8D9] backdrop-blur-xs">
                <Sparkles className="h-3 w-3" />
                Urban Biodiversity Documentation
              </span>
            </div>
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
              B LIFFE Field Data Platform
            </h1>
            <p className="max-w-xl text-xs text-[#DCE8D9]/90 sm:text-sm">
              Document flora, fauna, and local ecological knowledge with offline GPS precision.
            </p>
          </div>

          {/* Quick Primary Actions */}
          <div className="flex flex-col sm:flex-row gap-2.5 shrink-0 pt-2 sm:pt-0">
            <Link
              to="/observations"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#FAF7F0] px-4 py-2.5 text-xs sm:text-sm font-bold text-[#244B38] shadow-sm transition hover:bg-white active:scale-98 min-h-[44px]"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Log Observation</span>
            </Link>
            <Link
              to="/projects"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white backdrop-blur-xs transition hover:bg-white/20 active:scale-98 min-h-[44px]"
            >
              <FolderGit2 className="h-4 w-4" />
              <span>View Projects</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Real-time Metric Cards */}
      <section className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* Projects Count */}
        <Link
          to="/projects"
          className="group rounded-xl border border-[#DCE8D9] bg-[#FFFFFF] p-3.5 shadow-2xs transition hover:border-[#244B38]/40 hover:shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#687168] uppercase tracking-wider">
              Projects
            </span>
            <div className="rounded-lg bg-[#FAF7F0] p-1.5 text-[#244B38] group-hover:bg-[#DCE8D9] transition-colors">
              <FolderGit2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-[#34382F]">
            {isLoading ? '...' : stats.projectsCount}
          </div>
          <p className="mt-0.5 text-[10px] text-[#687168]">Initiatives documented</p>
        </Link>

        {/* Wards Count */}
        <div className="rounded-xl border border-[#DCE8D9] bg-[#FFFFFF] p-3.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#687168] uppercase tracking-wider">
              Wards
            </span>
            <div className="rounded-lg bg-[#FAF7F0] p-1.5 text-[#244B38]">
              <MapPin className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-[#34382F]">
            {isLoading ? '...' : stats.wardsCount}
          </div>
          <p className="mt-0.5 text-[10px] text-[#687168]">Municipal subdivisions</p>
        </div>

        {/* Surveys Count */}
        <div className="rounded-xl border border-[#DCE8D9] bg-[#FFFFFF] p-3.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#687168] uppercase tracking-wider">
              Surveys
            </span>
            <div className="rounded-lg bg-[#FAF7F0] p-1.5 text-[#244B38]">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-[#34382F]">
            {isLoading ? '...' : stats.surveysCount}
          </div>
          <p className="mt-0.5 text-[10px] text-[#687168]">Field visits logged</p>
        </div>

        {/* Observations Count */}
        <Link
          to="/observations"
          className="group rounded-xl border border-[#DCE8D9] bg-[#FFFFFF] p-3.5 shadow-2xs transition hover:border-[#244B38]/40 hover:shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#687168] uppercase tracking-wider">
              Species
            </span>
            <div className="rounded-lg bg-[#FAF7F0] p-1.5 text-[#244B38] group-hover:bg-[#DCE8D9] transition-colors">
              <Leaf className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-[#244B38]">
            {isLoading ? '...' : stats.observationsCount}
          </div>
          <p className="mt-0.5 text-[10px] text-[#687168]">Recorded observations</p>
        </Link>
      </section>

      {/* Active / Recent Field Survey Session Shortcut */}
      {recentSurvey && (
        <section className="mb-6 rounded-2xl border border-[#DCE8D9] bg-[#FFFFFF] p-4 sm:p-5 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-[#EBF2E9] px-2.5 py-0.5 text-[11px] font-bold text-[#244B38]">
                  Active Field Session
                </span>
                <span className="text-xs text-[#687168]">
                  Ward {recentSurvey.ward?.wardNumber}: {recentSurvey.ward?.wardName}
                </span>
              </div>
              <h2 className="mt-1 text-sm sm:text-base font-bold text-[#34382F]">
                {recentSurvey.project?.name || 'Project Survey'}
              </h2>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-[#687168]">
                <span>
                  Lead: <strong className="text-[#34382F]">{recentSurvey.survey.leadObserver}</strong>
                </span>
                {recentSurvey.survey.habitatType && (
                  <span>• {recentSurvey.survey.habitatType}</span>
                )}
                {recentSurvey.survey.surveyMethod && (
                  <span>({recentSurvey.survey.surveyMethod})</span>
                )}
              </div>
            </div>

            <Link
              to={`/projects/${recentSurvey.survey.projectId}/wards/${recentSurvey.survey.wardId}/surveys/${recentSurvey.survey.id}/observations`}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#244B38] px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#1b382a] transition-colors shrink-0 min-h-[44px]"
            >
              <span>Resume Field Log</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      )}

      {/* Sync Status Banner */}
      <section className="mb-6 flex items-center justify-between rounded-xl border border-[#DCE8D9] bg-[#FAF7F0] p-4 text-xs text-[#34382F]">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#DCE8D9] text-[#244B38] shrink-0">
            <Database className="h-4 w-4" />
          </div>
          <div>
            <p className="font-semibold text-[#244B38]">Offline Database Active (IndexedDB)</p>
            <p className="text-[11px] text-[#687168]">
              {stats.pendingSyncCount === 0
                ? 'All observations are safely saved locally on this device.'
                : `${stats.pendingSyncCount} observation${stats.pendingSyncCount > 1 ? 's' : ''} saved locally, ready for server sync.`}
            </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 font-medium text-[#244B38]">
          <CheckCircle2 className="h-4 w-4 text-[#244B38]" />
          <span>Local Storage Ready</span>
        </div>
      </section>

      {/* Recent Observations Feed */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Leaf className="h-4 w-4 text-[#244B38]" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#34382F]">
              Recent Field Observations
            </h2>
          </div>
          <Link
            to="/observations"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#244B38] hover:underline"
          >
            <span>View all ({stats.observationsCount})</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {recentObservations.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#DCE8D9] bg-[#FFFFFF] p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#EBF2E9] text-[#244B38]">
              <Leaf className="h-6 w-6" />
            </div>
            <h3 className="mt-3 text-sm font-bold text-[#34382F]">No observations recorded yet</h3>
            <p className="mt-1 text-xs text-[#687168] max-w-sm mx-auto">
              Start documenting your first species observation in the field with photos, Malayalam names, and GPS.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Link
                to="/observations"
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#244B38] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#1b382a]"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Start Observation</span>
              </Link>
              <Link
                to="/projects"
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#DCE8D9] bg-white px-4 py-2 text-xs font-semibold text-[#34382F] hover:bg-[#FAF7F0]"
              >
                <span>Browse Projects</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {recentObservations.map((obs) => {
              const photoBlob = obs.photos?.[0] || obs.photo
              const hasPhoto = photoBlob instanceof Blob
              const previewUrl = hasPhoto ? URL.createObjectURL(photoBlob) : null

              return (
                <div
                  key={obs.id}
                  className="flex items-center gap-3 rounded-xl border border-[#DCE8D9] bg-[#FFFFFF] p-3 shadow-2xs transition hover:border-[#244B38]/30 hover:shadow-xs"
                >
                  {/* Photo Thumbnail */}
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-[#DCE8D9] bg-[#FAF7F0] flex items-center justify-center">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt={obs.speciesName || 'Species'}
                        className="h-full w-full object-cover"
                        onLoad={() => {
                          if (previewUrl) URL.revokeObjectURL(previewUrl)
                        }}
                      />
                    ) : (
                      <Leaf className="h-6 w-6 text-[#C2D6BE]" />
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.2 text-[10px] font-bold ${
                          obs.identificationStatus === 'Identified'
                            ? 'bg-[#EBF2E9] text-[#244B38]'
                            : obs.identificationStatus === 'Needs verification'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {obs.identificationStatus}
                      </span>
                      {obs.speciesGroup && (
                        <span className="text-[10px] text-[#687168] truncate">
                          • {obs.speciesGroup}
                        </span>
                      )}
                    </div>

                    <h3 className="mt-0.5 truncate text-xs sm:text-sm font-bold text-[#34382F]">
                      {obs.speciesName || 'Unknown species'}
                    </h3>

                    {obs.localName && (
                      <p className="truncate text-xs font-medium text-[#244B38]">
                        {obs.localName}
                      </p>
                    )}

                    <div className="mt-1 flex items-center gap-2 text-[10px] text-[#687168]">
                      <span className="flex items-center gap-0.5">
                        <Calendar className="h-3 w-3" />
                        {new Date(obs.recordedAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                      {obs.accuracyMeters !== null && (
                        <span>• ±{Math.round(obs.accuracyMeters)}m</span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
