import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { db, type Observation } from '@/db/database'
import {
  Home as HomeIcon,
  FolderKanban,
  ClipboardList,
  User,
  Plus,
  MapPin,
  Clock,
  CheckCircle2,
  CloudUpload,
  Trees,
  Search,
  LogOut,
  RefreshCw,
  Compass,
  Radio,
} from 'lucide-react'

export type TabType = 'home' | 'projects' | 'observations' | 'about'

interface MobileFieldLayoutProps {
  agentId?: string
  onLogout: () => void
  onStartObservation?: () => void
}

interface ProjectItem {
  id: string
  name: string
  siteTag: string
  locationCoordinates: string
  status: 'Active' | 'Completed'
  assignedPlots: string
  priority: 'High' | 'Normal'
}

interface MockObservationEntry {
  id: number
  title: string
  scientificName: string
  timestamp: string
  location: string
  syncStatus: 'Synced' | 'Pending Upload'
  speciesGroup: string
}

const MOCK_PROJECTS: ProjectItem[] = [
  {
    id: 'PRJ-101',
    name: 'Silent Valley Core Transect Survey',
    siteTag: 'Palakkad • Buffer Zone 4',
    locationCoordinates: '11.0824° N, 76.4312° E',
    status: 'Active',
    assignedPlots: '14 of 20 plots mapped',
    priority: 'High',
  },
  {
    id: 'PRJ-102',
    name: 'Vembanad Mangrove Biodiversity Audit',
    siteTag: 'Kottayam Basin • Sector 2B',
    locationCoordinates: '9.6012° N, 76.3840° E',
    status: 'Active',
    assignedPlots: '8 of 12 water transects',
    priority: 'Normal',
  },
  {
    id: 'PRJ-103',
    name: 'Agasthyamalai Flora & Epiphyte Census',
    siteTag: 'Thiruvananthapuram Ridge',
    locationCoordinates: '8.6142° N, 77.2410° E',
    status: 'Completed',
    assignedPlots: '30 of 30 plots surveyed',
    priority: 'Normal',
  },
  {
    id: 'PRJ-104',
    name: 'Wayanad Wildlife Corridor Monitoring',
    siteTag: 'Sulthan Bathery • Block C',
    locationCoordinates: '11.6620° N, 76.2570° E',
    status: 'Active',
    assignedPlots: '5 of 10 telemetry points',
    priority: 'High',
  },
]

const SAMPLE_OBSERVATIONS: MockObservationEntry[] = [
  {
    id: 901,
    title: 'Nilgiri Tahr',
    scientificName: 'Nilgiritragus hylocrius',
    timestamp: 'Today, 10:45 AM',
    location: 'Silent Valley • North Ridge',
    syncStatus: 'Synced',
    speciesGroup: 'Mammals',
  },
  {
    id: 902,
    title: 'Malabar Grey Hornbill',
    scientificName: 'Ocyceros birostris',
    timestamp: 'Today, 08:30 AM',
    location: 'Kunthi River Basin',
    syncStatus: 'Pending Upload',
    speciesGroup: 'Birds',
  },
  {
    id: 903,
    title: 'Lion-tailed Macaque',
    scientificName: 'Macaca silenus',
    timestamp: 'Yesterday, 04:15 PM',
    location: 'Sector 3 Canopy Walk',
    syncStatus: 'Synced',
    speciesGroup: 'Mammals',
  },
  {
    id: 904,
    title: 'Travancore Flying Squirrel',
    scientificName: 'Petinomys fuscocapillus',
    timestamp: 'Yesterday, 02:20 PM',
    location: 'Buffer Zone Transect B',
    syncStatus: 'Synced',
    speciesGroup: 'Mammals',
  },
]

export default function MobileFieldLayout({
  agentId = 'KFRI-FLD-8821',
  onLogout,
  onStartObservation,
}: MobileFieldLayoutProps) {
  const [activeTab, setActiveTab] = useState<TabType>('home')
  const [projectSearch, setProjectSearch] = useState('')
  const [observationFilter, setObservationFilter] = useState<'All' | 'Synced' | 'Pending Upload'>('All')
  const [dbObservations, setDbObservations] = useState<Observation[]>([])
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncToast, setSyncToast] = useState<string | null>(null)

  // Load real observations from local Dexie database if any
  useEffect(() => {
    let isMounted = true
    db.observations
      .toArray()
      .then((records) => {
        if (isMounted) setDbObservations(records)
      })
      .catch(() => {})
    return () => {
      isMounted = false
    }
  }, [activeTab])

  // Combine real database records with sample entries for field presentation
  const mergedObservations = [
    ...dbObservations.map((obs) => ({
      id: obs.id ?? Math.random(),
      title: obs.speciesName || 'Unidentified Flora/Fauna',
      scientificName: obs.scientificName || 'Species to be confirmed',
      timestamp: obs.recordedAt
        ? new Date(obs.recordedAt).toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            day: 'numeric',
            month: 'short',
          })
        : 'Recorded in Field',
      location:
        obs.latitude && obs.longitude
          ? `${obs.latitude.toFixed(4)}° N, ${obs.longitude.toFixed(4)}° E`
          : 'Local Field Coordinates',
      syncStatus: 'Pending Upload' as const,
      speciesGroup: obs.speciesGroups || 'General',
    })),
    ...SAMPLE_OBSERVATIONS,
  ]

  const filteredObservations = mergedObservations.filter((obs) => {
    if (observationFilter === 'All') return true
    return obs.syncStatus === observationFilter
  })

  const filteredProjects = MOCK_PROJECTS.filter(
    (p) =>
      p.name.toLowerCase().includes(projectSearch.toLowerCase()) ||
      p.siteTag.toLowerCase().includes(projectSearch.toLowerCase())
  )

  const handleManualSync = () => {
    setIsSyncing(true)
    setTimeout(() => {
      setIsSyncing(false)
      setSyncToast('Offline queue synced successfully!')
      setTimeout(() => setSyncToast(null), 3000)
    }, 1200)
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col font-sans select-none antialiased">
      {/* Mobile Shell Wrapper: constrained on large screens for true mobile feel */}
      <div className="w-full max-w-md mx-auto min-h-screen bg-white dark:bg-slate-900 border-x border-slate-200 dark:border-slate-800 flex flex-col relative shadow-2xl">
        
        {/* Sticky Mobile App Bar (Sunlight readable, high contrast) */}
        <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold">
              <Trees className="size-4.5" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-1.5 leading-none">
                VASUDHA <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold px-1 rounded bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800">FIELD</span>
              </h1>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                KFRI Bio-Monitoring
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="gap-1 px-2 py-0.5 text-[11px] font-semibold bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800"
            >
              <Radio className="size-3 text-emerald-600 animate-pulse" />
              <span>Online</span>
            </Badge>
          </div>
        </header>

        {/* Sync Toast Alert */}
        {syncToast && (
          <div className="bg-emerald-700 text-white text-xs font-semibold py-2 px-4 text-center transition-all animate-in fade-in slide-in-from-top-2">
            ✓ {syncToast}
          </div>
        )}

        {/* Tab Content Container (padded bottom to prevent navbar overlap) */}
        <main className="flex-1 pb-24 overflow-y-auto px-4 py-4 space-y-4">
          
          {/* ================= TAB 1: HOME (FIELD DASHBOARD) ================= */}
          {activeTab === 'home' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              
              {/* Surveyor Greeting & Field Station Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-md relative overflow-hidden">
                <div className="relative z-10 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wider text-emerald-400 font-semibold flex items-center gap-1">
                      <Compass className="size-3.5" /> Palakkad Field Division
                    </span>
                    <span className="text-[11px] font-mono bg-white/10 px-2 py-0.5 rounded text-slate-200">
                      {agentId}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold">Good day, Officer Arya</h2>
                  <p className="text-xs text-slate-300">
                    Silent Valley Transect • Plot survey ready for logging.
                  </p>
                </div>
                {/* Decorative background element */}
                <div className="absolute -right-4 -bottom-6 size-28 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
              </div>

              {/* Large Thumb-Friendly Quick Action: New Observation (>= 44px, actually 52px) */}
              <Button
                onClick={() => {
                  if (onStartObservation) {
                    onStartObservation()
                  } else {
                    setActiveTab('observations')
                  }
                }}
                className="w-full h-13 min-h-[52px] bg-emerald-700 hover:bg-emerald-800 text-white text-base font-bold rounded-2xl shadow-md flex items-center justify-center gap-2.5 active:scale-[0.98] transition-all"
              >
                <div className="size-7 rounded-full bg-white/20 flex items-center justify-center">
                  <Plus className="size-5" />
                </div>
                <span>New Observation Entry</span>
              </Button>

              {/* Daily Summary Metrics (High Contrast 3-Pillar Grid) */}
              <div className="grid grid-cols-3 gap-2.5">
                <Card className="border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950 p-3 rounded-xl flex flex-col justify-between">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Assigned</span>
                    <FolderKanban className="size-3.5 text-blue-600" />
                  </div>
                  <div className="mt-2">
                    <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">3</span>
                    <p className="text-[10px] text-slate-500 font-medium">Surveys Active</p>
                  </div>
                </Card>

                <Card className="border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950 p-3 rounded-xl flex flex-col justify-between">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Synced</span>
                    <CheckCircle2 className="size-3.5 text-emerald-600" />
                  </div>
                  <div className="mt-2">
                    <span className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400">12</span>
                    <p className="text-[10px] text-slate-500 font-medium">Safe in Cloud</p>
                  </div>
                </Card>

                <Card className="border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950 p-3 rounded-xl flex flex-col justify-between">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Pending</span>
                    <CloudUpload className="size-3.5 text-amber-600" />
                  </div>
                  <div className="mt-2">
                    <span className="text-2xl font-extrabold text-amber-600">
                      {dbObservations.length > 0 ? dbObservations.length + 1 : 2}
                    </span>
                    <p className="text-[10px] text-slate-500 font-medium">Local Cache</p>
                  </div>
                </Card>
              </div>

              {/* Field Operations Checklist / Quick Sync Action */}
              <Card className="border-slate-200 dark:border-slate-800 rounded-xl p-3.5 bg-white dark:bg-slate-950 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <Radio className="size-3.5 text-emerald-600" /> Local Field Sync Status
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isSyncing}
                    onClick={handleManualSync}
                    className="h-8 min-h-[32px] px-2.5 text-xs font-semibold gap-1 text-slate-700 dark:text-slate-300"
                  >
                    <RefreshCw className={`size-3 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
                  </Button>
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span>GPS Precision Lock:</span>
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400">± 3.8m (High Acc.)</span>
                </div>
              </Card>

              {/* Recent Field Activity Sneak Peek */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Recent Field Observations
                  </h3>
                  <button
                    onClick={() => setActiveTab('observations')}
                    className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
                  >
                    View Log
                  </button>
                </div>

                <div className="space-y-2">
                  {SAMPLE_OBSERVATIONS.slice(0, 2).map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setActiveTab('observations')}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 flex items-center justify-between cursor-pointer active:bg-slate-100"
                    >
                      <div className="space-y-0.5">
                        <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          {item.title}
                        </div>
                        <div className="text-xs italic text-slate-500">
                          {item.scientificName}
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-semibold ${
                          item.syncStatus === 'Synced'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300'
                        }`}
                      >
                        {item.syncStatus}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ================= TAB 2: PROJECTS (VERTICAL CARD LIST) ================= */}
          {activeTab === 'projects' && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="space-y-1">
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Assigned Field Sites
                </h2>
                <p className="text-xs text-slate-500">
                  Active monitoring sectors under Palakkad & South Kerala units.
                </p>
              </div>

              {/* Search Bar (Min 44px height for mobile tapping) */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <Input
                  value={projectSearch}
                  onChange={(e) => setProjectSearch(e.target.value)}
                  placeholder="Search site, sector, or block..."
                  className="h-11 min-h-[44px] pl-9 pr-3 rounded-xl border-slate-300 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-950 text-sm"
                />
              </div>

              {/* Vertical Card List of Field Sites */}
              <div className="space-y-3 pt-1">
                {filteredProjects.map((project) => (
                  <Card
                    key={project.id}
                    className="border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden hover:border-slate-300 transition-all bg-white dark:bg-slate-950 shadow-sm"
                  >
                    <CardHeader className="p-4 pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono text-slate-400 font-semibold">
                            {project.id}
                          </span>
                          <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100 leading-snug">
                            {project.name}
                          </CardTitle>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-xs font-semibold shrink-0 ${
                            project.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          {project.status}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="p-4 pt-1 space-y-2 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                        <MapPin className="size-3.5 text-emerald-600 shrink-0" />
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {project.siteTag}
                        </span>
                      </div>

                      <div className="text-[11px] font-mono text-slate-500 pl-5">
                        GPS: {project.locationCoordinates}
                      </div>

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-slate-600 dark:text-slate-400">
                        <span className="font-medium">{project.assignedPlots}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 min-h-[32px] px-2 text-xs text-emerald-700 dark:text-emerald-400 font-semibold gap-1 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                          onClick={() => {
                            if (onStartObservation) onStartObservation()
                            else setActiveTab('observations')
                          }}
                        >
                          <span>Log Plot</span>
                          <Plus className="size-3.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* ================= TAB 3: OBSERVATIONS (COMPACT LOG LIST) ================= */}
          {activeTab === 'observations' && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    Survey Observations
                  </h2>
                  <p className="text-xs text-slate-500">
                    Recorded field specimens & telemetry log.
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    if (onStartObservation) onStartObservation()
                  }}
                  className="h-9 min-h-[36px] bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-lg gap-1 px-3"
                >
                  <Plus className="size-3.5" />
                  <span>Add</span>
                </Button>
              </div>

              {/* Status Filter Tabs / Pills */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold">
                {(['All', 'Synced', 'Pending Upload'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setObservationFilter(filter)}
                    className={`flex-1 py-1.5 min-h-[34px] rounded-lg transition-all text-center ${
                      observationFilter === filter
                        ? 'bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>

              {/* Compact Log List */}
              <div className="space-y-2 pt-1">
                {filteredObservations.length === 0 ? (
                  <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
                    <ClipboardList className="size-8 mx-auto text-slate-400" />
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      No observations in this filter
                    </p>
                    <p className="text-xs text-slate-400">
                      Tap "Add" or "New Observation" to record specimen data.
                    </p>
                  </div>
                ) : (
                  filteredObservations.map((obs) => (
                    <Card
                      key={obs.id}
                      className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-3.5 rounded-xl shadow-xs space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5">
                          <div className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">
                            {obs.title}
                          </div>
                          <div className="text-xs italic text-slate-500 font-serif">
                            {obs.scientificName}
                          </div>
                        </div>

                        {/* Sync Status Pill */}
                        <Badge
                          variant="outline"
                          className={`text-[11px] font-semibold shrink-0 ${
                            obs.syncStatus === 'Synced'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300'
                          }`}
                        >
                          {obs.syncStatus === 'Synced' ? (
                            <CheckCircle2 className="size-3 text-emerald-600" />
                          ) : (
                            <CloudUpload className="size-3 text-amber-600" />
                          )}
                          <span>{obs.syncStatus}</span>
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
                        <div className="flex items-center gap-1">
                          <Clock className="size-3 text-slate-400" />
                          <span>{obs.timestamp}</span>
                        </div>
                        <div className="flex items-center gap-1 font-mono">
                          <MapPin className="size-3 text-emerald-600" />
                          <span className="truncate max-w-[140px]">{obs.location}</span>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ================= TAB 4: ABOUT US (AGENT & APP INFO) ================= */}
          {activeTab === 'about' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              
              {/* Agent Profile Card */}
              <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 rounded-2xl shadow-sm space-y-3">
                <div className="flex items-center gap-3">
                  <div className="size-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-lg shadow-inner">
                    AO
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      Officer Arya O.
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Senior Field Research Associate
                    </p>
                    <div className="mt-1 flex items-center gap-1.5 text-[11px] font-mono text-emerald-700 dark:text-emerald-400 font-semibold">
                      <span>ID: {agentId}</span>
                      <span>•</span>
                      <span>Field Unit KFRI-04</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 text-xs space-y-1.5">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Assigned Research Center:</span>
                    <strong className="text-slate-800 dark:text-slate-200">Nilambur Sub-Centre</strong>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Authorized Flora/Fauna Tags:</span>
                    <strong className="text-slate-800 dark:text-slate-200">All Wildlife Schedules</strong>
                  </div>
                </div>
              </Card>

              {/* Organization & App Info */}
              <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 rounded-2xl shadow-sm space-y-3">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Institution & Platform
                  </h4>
                  <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Kerala Forest Research Institute (KFRI)
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Vasudha Field is an offline-first biological survey tool developed for park rangers, ecologists, and botanists to catalog forest biodiversity in rugged field terrains.
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">App Version</span>
                    <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">v2.4.0 (Field Edition)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Storage Engine</span>
                    <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">IndexedDB (Dexie.js)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Local Observations Cached</span>
                    <span className="font-mono font-semibold text-emerald-700 dark:text-emerald-400">
                      {dbObservations.length} records
                    </span>
                  </div>
                </div>
              </Card>

              {/* Sign Out Action Button (>= 44px) */}
              <div className="pt-2">
                <Button
                  variant="outline"
                  onClick={onLogout}
                  className="w-full h-12 min-h-[48px] text-sm font-semibold border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800 dark:border-rose-900 dark:text-rose-300 dark:hover:bg-rose-950/40 rounded-xl flex items-center justify-center gap-2"
                >
                  <LogOut className="size-4" />
                  <span>Sign Out of Field Station</span>
                </Button>
              </div>

            </div>
          )}

        </main>

        {/* ================= STICKY BOTTOM NAVIGATION BAR ================= */}
        {/* Full-width sticky/anchored bar with at least 44px tap targets */}
        <nav
          aria-label="Mobile Navigation"
          className="fixed bottom-0 left-0 right-0 max-w-md mx-auto w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 z-50 px-2 py-1 flex items-center justify-around shadow-lg"
        >
          {/* TAB 1: Home */}
          <button
            id="tab-home"
            type="button"
            onClick={() => setActiveTab('home')}
            className={`flex-1 min-h-[48px] py-1 px-1 flex flex-col items-center justify-center gap-1 rounded-xl transition-all cursor-pointer ${
              activeTab === 'home'
                ? 'text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50/50 dark:bg-emerald-950/30'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
            }`}
          >
            <HomeIcon className={`size-5 ${activeTab === 'home' ? 'stroke-[2.5px]' : 'stroke-2'}`} />
            <span className="text-[11px] leading-none">Home</span>
          </button>

          {/* TAB 2: Projects */}
          <button
            id="tab-projects"
            type="button"
            onClick={() => setActiveTab('projects')}
            className={`flex-1 min-h-[48px] py-1 px-1 flex flex-col items-center justify-center gap-1 rounded-xl transition-all cursor-pointer ${
              activeTab === 'projects'
                ? 'text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50/50 dark:bg-emerald-950/30'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
            }`}
          >
            <FolderKanban className={`size-5 ${activeTab === 'projects' ? 'stroke-[2.5px]' : 'stroke-2'}`} />
            <span className="text-[11px] leading-none">Projects</span>
          </button>

          {/* TAB 3: Observations */}
          <button
            id="tab-observations"
            type="button"
            onClick={() => setActiveTab('observations')}
            className={`flex-1 min-h-[48px] py-1 px-1 flex flex-col items-center justify-center gap-1 rounded-xl transition-all cursor-pointer ${
              activeTab === 'observations'
                ? 'text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50/50 dark:bg-emerald-950/30'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
            }`}
          >
            <ClipboardList className={`size-5 ${activeTab === 'observations' ? 'stroke-[2.5px]' : 'stroke-2'}`} />
            <span className="text-[11px] leading-none">Observations</span>
          </button>

          {/* TAB 4: About Us */}
          <button
            id="tab-about"
            type="button"
            onClick={() => setActiveTab('about')}
            className={`flex-1 min-h-[48px] py-1 px-1 flex flex-col items-center justify-center gap-1 rounded-xl transition-all cursor-pointer ${
              activeTab === 'about'
                ? 'text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50/50 dark:bg-emerald-950/30'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
            }`}
          >
            <User className={`size-5 ${activeTab === 'about' ? 'stroke-[2.5px]' : 'stroke-2'}`} />
            <span className="text-[11px] leading-none">About Us</span>
          </button>
        </nav>

      </div>
    </div>
  )
}
