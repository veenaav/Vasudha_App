import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  ORGANISM_STATUSES,
  LOCATION_VISIBILITIES,
  MICRO_HABITATS,
  TRADITIONAL_KNOWLEDGE_SOURCES,
  type YesNo,
  type IdentificationStatus,
  type OrganismStatus,
  type BasisOfRecord,
  BASIS_OF_RECORD_OPTIONS,
} from '@/db/database'
import {
  ArrowLeft,
  MapPin,
  Camera,
  Image as ImageIcon,
  CheckCircle2,
  RotateCcw,
  Loader2,
  X,
  AlertCircle,
  Compass,
  Info,
  ChevronDown,
  ChevronUp,
  Tag as TagIcon,
  FolderGit2,
  Search,
  Sparkles,
  Layers,
  FileText,
  Eye,
  BookOpen,
} from 'lucide-react'
import LocationPickerMap from '@/components/LocationPickerMap'
import TagSelector from '@/components/TagSelector'
import { AppSelect, AppMultiSelect } from '@/components/ui/select'
import {
  SPECIES_GROUPS,
  HABITAT_TYPES,
  ECOLOGICAL_LIFE_STAGES,
  REPRODUCTIVE_ATTRIBUTES,
  SEX_OPTIONS,
  EVIDENCE_OF_PRESENCE,
  SEASONS,
  useObservationForm,
  PhotoTipsModal,
  LocationTipsModal,
  EcologyTipsModal,
  TraditionalKnowledgeTipsModal,
} from '@/features/observations'

export { SPECIES_GROUPS }

export default function ObservationFormPage() {
  const form = useObservationForm()
  const { geo } = form

  // Independent collapsible card states
  // Requirement 4: Initially keep Media / Photo and Location accessible, and Ecological details collapsed
  const [openPhotos, setOpenPhotos] = useState(true)
  const [openLocation, setOpenLocation] = useState(true)
  const [openSpecies, setOpenSpecies] = useState(true)
  const [openEcology, setOpenEcology] = useState(false)
  const [openTk, setOpenTk] = useState(false)
  const [openNotes, setOpenNotes] = useState(false)
  const [openTags, setOpenTags] = useState(false)
  const [openVisibility, setOpenVisibility] = useState(false)
  const [openProjects, setOpenProjects] = useState(false)

  if (form.isLoadingExisting) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center text-slate-500">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#165B33]" />
        <p className="mt-3 text-sm">Loading observation record...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-5 sm:px-6">
      {/* Header Context */}
      {form.surveyId ? (
        <div className="mb-6">
          <nav className="mb-2.5 flex items-center gap-1.5 text-xs tracking-wider uppercase text-[#7B9586]">
            <Link
              to={`/projects/${form.projectId}/wards/${form.wardId}/surveys`}
              className="inline-flex items-center gap-1 text-[#A6F16A] font-medium hover:underline"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Field Visits</span>
            </Link>
            <span>/</span>
            <span className="font-semibold text-[#F0F5EF]">Log Observation</span>
          </nav>

          <div className="rounded-3xl border border-[#1C4D3C] bg-[#0D2D22] p-4 sm:p-5 shadow-xl shadow-[#061812]/50 text-[#F0F5EF]">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-[#133D2F] border border-[#1C4D3C] px-3 py-0.5 text-xs font-semibold tracking-wider uppercase text-[#A6F16A]">
                Ward {form.activeWard?.wardNumber}
              </span>
              <span className="text-xs text-[#B2C8BA] font-medium">
                {form.activeSurvey?.leadObserver
                  ? `Lead: ${form.activeSurvey.leadObserver}`
                  : 'Survey Session'}
              </span>
            </div>
            <p className="mt-1.5 text-lg font-bold text-white tracking-tight">
              {form.activeWard?.wardName || 'Ward'}
              {form.activeProject?.name ? ` • ${form.activeProject.name}` : ''}
            </p>
          </div>
        </div>
      ) : (
        <div className="mb-6 flex items-center justify-between border-b border-[#1C4D3C] pb-4">
          <div>
            <h1 className="text-2xl sm:text-[28px] font-extrabold tracking-tight text-white">
              {form.isEditMode ? 'Edit Observation' : 'New Observation'}
            </h1>
            {form.isProjectContext && (
              <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-[#A6F16A]">
                <FolderGit2 className="h-3.5 w-3.5 shrink-0" />
                <span>
                  Adding to project:{' '}
                  <span className="text-white">
                    {form.activeProject?.name || 'Project'}
                  </span>
                </span>
              </p>
            )}
          </div>
          {form.isEditMode && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Discard unsaved changes and return to records?')) {
                  form.navigate('/observations')
                }
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#1C4D3C] bg-[#0D2D22] px-3.5 py-1.5 text-xs font-medium tracking-wider uppercase text-[#B2C8BA] hover:text-white hover:border-[#A6F16A]/50 transition-colors shadow-xs cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
              <span>Cancel</span>
            </button>
          )}
        </div>
      )}

      {/* Observation Form Container — Vertically Stacked Collapsible Cards */}
      <div className="space-y-4">
        {/* 1. Photographs (Media / Photo) Collapsible Card */}
        <section className="rounded-3xl border border-[#1C4D3C] bg-[#0D2D22] p-5 sm:p-6 shadow-xl shadow-[#061812]/50 text-[#F0F5EF] transition-all">
          <div
            role="button"
            tabIndex={0}
            onClick={() => setOpenPhotos((prev) => !prev)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                setOpenPhotos((prev) => !prev)
              }
            }}
            className="flex items-center justify-between cursor-pointer select-none"
            aria-expanded={openPhotos}
            aria-label="Toggle Photographs section"
          >
            <div className="flex items-center gap-2 flex-wrap">
              <Camera className="h-5 w-5 text-[#A6F16A] shrink-0" />
              <h2 className="text-base sm:text-lg font-bold text-white">
                Photographs{' '}
                {form.isUnknown && <span className="text-red-500 font-bold text-base">*</span>}
              </h2>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  form.setShowPhotoTips(true)
                }}
                className="flex h-5 w-5 sm:h-5.5 sm:w-5.5 items-center justify-center rounded-full bg-[#061812] border border-[#1C4D3C] text-[#A6F16A] hover:bg-[#133D2F] hover:border-[#A6F16A]/60 hover:text-white transition-colors cursor-pointer shrink-0"
                aria-label="Tips for Great Field Photos"
                title="Tips for Great Field Photos"
              >
                <Info className="h-3 w-3" />
              </button>
              {form.photos.length > 0 && (
                <span className="rounded-full bg-[#133D2F] border border-[#1C4D3C] px-2.5 py-0.5 text-[11px] font-semibold text-[#A6F16A]">
                  {form.photos.length} {form.photos.length === 1 ? 'photo' : 'photos'}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {openPhotos ? (
                <ChevronUp className="h-5 w-5 text-[#A6F16A] transition-transform duration-200" />
              ) : (
                <ChevronDown className="h-5 w-5 text-[#A6F16A] transition-transform duration-200" />
              )}
            </div>
          </div>

          {openPhotos && (
            <div className="mt-4 pt-3.5 border-t border-[#1C4D3C]/70">
              {/* Camera and Gallery Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <label
                  htmlFor={form.saved ? undefined : 'camera-photo-input'}
                  className={`flex min-h-[48px] items-center justify-center gap-2 rounded-2xl border border-dashed border-[#1C4D3C] p-3 text-center text-sm font-medium transition ${
                    form.saved
                      ? 'cursor-not-allowed bg-[#061812]/50 text-[#7B9586]'
                      : 'cursor-pointer bg-[#061812] text-[#A6F16A] hover:bg-[#133D2F] hover:border-[#A6F16A]/50 active:scale-98 shadow-sm'
                  }`}
                >
                  <Camera className="h-4.5 w-4.5 shrink-0 text-[#A6F16A]" />
                  <span>Take Photo</span>
                </label>

                <label
                  htmlFor={form.saved ? undefined : 'gallery-photo-input'}
                  className={`flex min-h-[48px] items-center justify-center gap-2 rounded-2xl border border-dashed border-[#1C4D3C] p-3 text-center text-sm font-medium transition ${
                    form.saved
                      ? 'cursor-not-allowed bg-[#061812]/50 text-[#7B9586]'
                      : 'cursor-pointer bg-[#061812] text-[#20D6A0] hover:bg-[#133D2F] hover:border-[#20D6A0]/50 active:scale-98 shadow-sm'
                  }`}
                >
                  <ImageIcon className="h-4.5 w-4.5 shrink-0 text-[#20D6A0]" />
                  <span>Choose Gallery</span>
                </label>
              </div>

              <input
                id="camera-photo-input"
                type="file"
                accept="image/*"
                capture="environment"
                disabled={form.saved}
                className="hidden"
                onChange={(e) => {
                  form.handleAddPhotos(e.target.files, true)
                  e.target.value = ''
                }}
              />

              <input
                id="gallery-photo-input"
                type="file"
                accept="image/*"
                multiple
                disabled={form.saved}
                className="hidden"
                onChange={(e) => {
                  form.handleAddPhotos(e.target.files, false)
                  e.target.value = ''
                }}
              />

              {/* Automatic Location Status Indicator for Photos */}
              <div className="mt-3.5">
                {geo.isGettingLocation || form.isProcessingPhotos ? (
                  <div className="flex items-center gap-2 rounded-2xl bg-[#061812] border border-[#1C4D3C] p-3 text-xs text-[#A6F16A]">
                    <Loader2 className="h-4 w-4 animate-spin text-[#A6F16A] shrink-0" />
                    <span>Acquiring GPS coordinates for photo...</span>
                  </div>
                ) : geo.location ? (
                  <div className="flex items-center justify-between gap-2 rounded-2xl bg-[#133D2F]/50 border border-[#1C4D3C] p-3 text-xs text-[#F0F5EF]">
                    <div className="flex items-center gap-2 min-w-0">
                      <CheckCircle2 className="h-4 w-4 text-[#A6F16A] shrink-0" />
                      <div className="truncate">
                        <span className="font-semibold text-[#A6F16A]">
                          {geo.locationSource === 'EXIF'
                            ? 'Location captured (Photo EXIF)'
                            : 'Location captured (Device GPS)'}
                        </span>
                        {geo.locationAccuracy !== null && (
                          <span className="text-[11px] text-[#B2C8BA] ml-1.5">
                            ±{Math.round(geo.locationAccuracy)}m
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="font-mono text-[11px] text-[#20D6A0] shrink-0">
                      {geo.location.latitude.toFixed(5)}, {geo.location.longitude.toFixed(5)}
                    </span>
                  </div>
                ) : geo.locationError ? (
                  <div className="flex items-center justify-between gap-2 rounded-2xl bg-amber-950/40 border border-amber-800/60 p-3 text-xs text-amber-200">
                    <div className="flex items-center gap-2 min-w-0">
                      <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
                      <span className="truncate">
                        Location unavailable: {geo.locationError}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => geo.getLocation()}
                      className="text-xs text-[#A6F16A] underline font-semibold shrink-0 cursor-pointer"
                    >
                      Retry
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 rounded-2xl bg-[#061812] border border-[#1C4D3C] p-3 text-xs text-[#7B9586]">
                    <Compass className="h-4 w-4 text-[#7B9586] shrink-0" />
                    <span>GPS will be captured automatically upon snapping or uploading photos.</span>
                  </div>
                )}
              </div>

              {/* Photo Previews with Location Badge per Photo */}
              {form.photoPreviews.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-2.5">
                  {form.photoPreviews.map((url, idx) => {
                    const meta = form.photoMetadata[idx]
                    const hasCoord = meta?.latitude !== null && meta?.latitude !== undefined
                    return (
                      <div
                        key={idx}
                        className="relative aspect-square overflow-hidden rounded-2xl border border-[#1C4D3C] bg-[#061812] group"
                      >
                        <img
                          src={url}
                          alt={`Preview ${idx + 1}`}
                          className="h-full w-full object-cover"
                        />

                        {/* Per-photo GPS status pill */}
                        <div className="absolute bottom-1 left-1 right-1 pointer-events-none">
                          <span
                            className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-semibold border backdrop-blur-sm truncate max-w-full ${
                              hasCoord
                                ? meta?.locationSource === 'EXIF'
                                  ? 'bg-[#061812]/90 border-cyan-700/60 text-cyan-300'
                                  : 'bg-[#061812]/90 border-[#1C4D3C] text-[#A6F16A]'
                                : 'bg-[#061812]/90 border-amber-800/60 text-amber-300'
                            }`}
                          >
                            <MapPin className="h-2.5 w-2.5 shrink-0" />
                            <span className="truncate">
                              {hasCoord
                                ? meta?.locationSource === 'EXIF'
                                  ? 'EXIF'
                                  : 'GPS'
                                : 'No GPS'}
                            </span>
                          </span>
                        </div>

                        {!form.saved && (
                          <button
                            type="button"
                            onClick={() => form.handleRemovePhoto(idx)}
                            className="absolute top-1.5 right-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-red-600/90 text-white shadow-md hover:bg-red-700 active:scale-95 cursor-pointer"
                            aria-label="Remove photo"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Tips for Great Field Photos Modal */}
          <PhotoTipsModal
            isOpen={form.showPhotoTips}
            onClose={() => form.setShowPhotoTips(false)}
          />
        </section>

        {/* 2. Location & Administrative Ward Collapsible Card */}
        <section className="rounded-3xl border border-[#1C4D3C] bg-[#0D2D22] p-5 sm:p-6 shadow-xl shadow-[#061812]/50 text-[#F0F5EF] transition-all">
          <div
            role="button"
            tabIndex={0}
            onClick={() => setOpenLocation((prev) => !prev)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                setOpenLocation((prev) => !prev)
              }
            }}
            className="flex items-center justify-between cursor-pointer select-none"
            aria-expanded={openLocation}
            aria-label="Toggle Location & Ward section"
          >
            <div className="flex items-center gap-2 flex-wrap">
              <MapPin className="h-5 w-5 text-[#A6F16A] shrink-0" />
              <h2 className="text-base sm:text-lg font-bold text-white">
                Location & Ward <span className="text-red-500 font-bold text-base">*</span>
              </h2>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  form.setShowLocationTips(true)
                }}
                className="flex h-5 w-5 sm:h-5.5 sm:w-5.5 items-center justify-center rounded-full bg-[#061812] border border-[#1C4D3C] text-[#A6F16A] hover:bg-[#133D2F] hover:border-[#A6F16A]/60 hover:text-white transition-colors cursor-pointer shrink-0"
                aria-label="Tips for Accurate Location"
                title="Tips for Accurate Location"
              >
                <Info className="h-3 w-3" />
              </button>

              {geo.location && (
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${
                    geo.locationSource === 'Manual Pin Adjustment'
                      ? 'bg-amber-950/60 text-amber-300 border-amber-800/60'
                      : geo.locationSource === 'EXIF'
                      ? 'bg-cyan-950/60 text-cyan-300 border-cyan-800/60'
                      : 'bg-[#133D2F] text-[#A6F16A] border-[#1C4D3C]'
                  }`}
                >
                  {geo.locationSource === 'Manual Pin Adjustment'
                    ? 'Manual Pin'
                    : geo.locationSource === 'EXIF'
                    ? 'Photo EXIF'
                    : `GPS Fix ${geo.locationAccuracy !== null ? `(±${Math.round(geo.locationAccuracy)}m)` : ''}`}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {openLocation ? (
                <ChevronUp className="h-5 w-5 text-[#A6F16A] transition-transform duration-200" />
              ) : (
                <ChevronDown className="h-5 w-5 text-[#A6F16A] transition-transform duration-200" />
              )}
            </div>
          </div>

          {openLocation && (
            <div className="mt-4 pt-3.5 border-t border-[#1C4D3C]/70">
              {/* Interactive OpenStreetMap with Centered Marker and Application-Themed Details Popup */}
              <LocationPickerMap
                location={geo.location}
                rawGPS={geo.gpsLocation}
                locationSource={geo.locationSource}
                locationAccuracy={geo.locationAccuracy}
                observationTime={form.displayObservationTime}
                onLocationChange={geo.handleManualLocationChange}
                disabled={form.saved}
              />

              {/* GPS Acquire / Retry Button (Get My Location) */}
              <div className="mt-3 flex gap-2">
                <Button
                  type="button"
                  className="min-h-[50px] flex-1 bg-gradient-to-r from-[#A6F16A] to-[#20D6A0] text-[#061812] hover:opacity-95 font-bold text-base shadow-lg shadow-[#20D6A0]/20 rounded-2xl transition-all active:scale-98 tracking-wide cursor-pointer"
                  disabled={form.saved || geo.isGettingLocation}
                  onClick={geo.getLocation}
                >
                  {geo.isGettingLocation ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin text-[#061812]" />
                      <span>Acquiring Coordinates...</span>
                    </>
                  ) : geo.location ? (
                    <>
                      <MapPin className="h-5 w-5 mr-2 text-[#061812]" />
                      <span>Update GPS Location</span>
                    </>
                  ) : geo.locationError ? (
                    <>
                      <RotateCcw className="h-5 w-5 mr-2 text-[#061812]" />
                      <span>Retry Get My Location</span>
                    </>
                  ) : (
                    <>
                      <MapPin className="h-5 w-5 mr-2 text-[#061812]" />
                      <span>Get My Location</span>
                    </>
                  )}
                </Button>
              </div>

              {/* Dedicated Read-Only Administrative Ward Information Field */}
              <div className="mt-4 pt-4 border-t border-[#1C4D3C]">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold tracking-wider uppercase text-[#B2C8BA]">
                    Administrative Ward
                  </label>
                  <span className="rounded-full bg-[#133D2F] border border-[#1C4D3C] px-2 py-0.5 text-[10px] font-semibold text-[#A6F16A] uppercase tracking-wider">
                    Automatic GPS • Read-Only
                  </span>
                </div>

                <div
                  className={`rounded-2xl border p-4 transition-all ${
                    geo.wardStatus === 'ward_identified'
                      ? 'border-[#A6F16A]/50 bg-[#133D2F] text-white'
                      : geo.wardStatus === 'identifying_ward' ||
                        geo.wardStatus === 'requesting_location'
                      ? 'border-[#1C4D3C] bg-[#061812] text-[#F0F5EF]'
                      : geo.wardStatus === 'location_unavailable'
                      ? 'border-red-800/80 bg-red-950/40 text-red-200'
                      : 'border-[#1C4D3C] bg-[#061812] text-[#B2C8BA]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 shrink-0">
                      {geo.wardStatus === 'ward_identified' ? (
                        <CheckCircle2 className="h-5 w-5 text-[#A6F16A]" />
                      ) : geo.wardStatus === 'identifying_ward' ||
                        geo.wardStatus === 'requesting_location' ? (
                        <Loader2 className="h-5 w-5 animate-spin text-[#A6F16A]" />
                      ) : geo.wardStatus === 'location_unavailable' ? (
                        <AlertCircle className="h-5 w-5 text-red-400" />
                      ) : (
                        <Compass className="h-5 w-5 text-[#7B9586]" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-base font-bold text-white">
                          {geo.wardStatus === 'ward_identified' && geo.autoWardName
                            ? `Ward ${
                                geo.autoWardNumber ? geo.autoWardNumber + ' – ' : ''
                              }${geo.autoWardName}`
                            : geo.wardStatus === 'location_not_obtained'
                            ? 'Ward will be identified automatically after GPS acquisition'
                            : geo.wardStatus === 'requesting_location'
                            ? 'Requesting location...'
                            : geo.wardStatus === 'identifying_ward'
                            ? 'Identifying ward from boundary dataset...'
                            : geo.wardStatus === 'location_unavailable'
                            ? 'Location unavailable'
                            : 'Ward could not be identified'}
                        </span>

                        {geo.autoWardId && (
                          <span className="rounded bg-[#061812] border border-[#1C4D3C] px-1.5 py-0.5 font-mono text-[10px] text-[#A6F16A]">
                            ID: {geo.autoWardId}
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-xs leading-relaxed text-[#B2C8BA]">
                        {geo.wardStatusMessage}
                      </p>

                      {geo.wardStatus === 'location_unavailable' && (
                        <button
                          type="button"
                          onClick={geo.getLocation}
                          disabled={geo.isGettingLocation}
                          className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-red-300 hover:underline cursor-pointer"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          <span>Retry acquiring GPS</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tips for Accurate Location Modal */}
          <LocationTipsModal
            isOpen={form.showLocationTips}
            onClose={() => form.setShowLocationTips(false)}
          />
        </section>

        {/* 3. Species & Identification Details Collapsible Card */}
        <section className="rounded-3xl border border-[#1C4D3C] bg-[#0D2D22] p-5 sm:p-6 shadow-xl shadow-[#061812]/50 text-[#F0F5EF] transition-all">
          <div
            role="button"
            tabIndex={0}
            onClick={() => setOpenSpecies((prev) => !prev)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                setOpenSpecies((prev) => !prev)
              }
            }}
            className="flex items-center justify-between cursor-pointer select-none"
            aria-expanded={openSpecies}
            aria-label="Toggle Species & Identification section"
          >
            <div className="flex items-center gap-2 flex-wrap">
              <Sparkles className="h-5 w-5 text-[#A6F16A] shrink-0" />
              <h2 className="text-base sm:text-lg font-bold text-white">
                Species Details <span className="text-red-500 font-bold text-base">*</span>
              </h2>
              {form.identificationStatus && (
                <span className="rounded-full bg-[#133D2F] border border-[#1C4D3C] px-2.5 py-0.5 text-[11px] font-semibold text-[#A6F16A]">
                  {form.identificationStatus}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {openSpecies ? (
                <ChevronUp className="h-5 w-5 text-[#A6F16A] transition-transform duration-200" />
              ) : (
                <ChevronDown className="h-5 w-5 text-[#A6F16A] transition-transform duration-200" />
              )}
            </div>
          </div>

          {openSpecies && (
            <div className="mt-4 pt-3.5 border-t border-[#1C4D3C]/70 space-y-4">
              {/* Identification Status */}
              <div>
                <label
                  htmlFor="identificationStatus"
                  className="block text-xs font-semibold tracking-wider uppercase text-[#B2C8BA] mb-2"
                >
                  Identification Status <span className="text-red-500 font-bold">*</span>
                </label>
                <AppSelect
                  id="identificationStatus"
                  value={form.identificationStatus}
                  disabled={form.saved}
                  onChange={(val) =>
                    form.handleStatusChange(val as IdentificationStatus | '')
                  }
                  placeholder="Select status..."
                  options={[
                    { value: 'Identified', label: 'Identified', hint: 'Species is clearly recognized and confirmed' },
                    { value: 'Unknown', label: 'Unknown', hint: 'Requires photo to aid identification' },
                    { value: 'Needs verification', label: 'Needs verification', hint: 'Needs expert or peer confirmation' },
                  ]}
                />
              </div>

              {/* Common Name */}
              <div>
                <label
                  htmlFor="speciesName"
                  className="block text-xs font-semibold tracking-wider uppercase text-[#B2C8BA]"
                >
                  Common Name {!form.isUnknown && <span className="text-red-500 font-bold">*</span>}
                </label>
                <input
                  id="speciesName"
                  type="text"
                  value={form.speciesName}
                  disabled={form.saved || form.isUnknown}
                  onChange={(e) => form.setSpeciesName(e.target.value)}
                  placeholder={
                    form.isUnknown
                      ? 'Locked for Unknown species'
                      : 'e.g. Indian Peafowl, Cinnamon Tree'
                  }
                  className="mt-2 w-full min-h-[48px] rounded-xl border border-[#1C4D3C] bg-[#061812] px-4 py-3 text-base text-[#F0F5EF] placeholder-[#7B9586] outline-none focus:border-[#A6F16A] focus:ring-1 focus:ring-[#A6F16A] disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              {/* Local Name */}
              <div>
                <label
                  htmlFor="localName"
                  className="block text-xs font-semibold tracking-wider uppercase text-[#B2C8BA]"
                >
                  Local Name
                </label>
                <input
                  id="localName"
                  type="text"
                  value={form.localName}
                  disabled={form.saved || form.isUnknown}
                  onChange={(e) => form.setLocalName(e.target.value)}
                  placeholder={
                    form.isUnknown ? 'Locked for Unknown species' : 'e.g., Naattu Mayil, Thulasi'
                  }
                  className="mt-2 w-full min-h-[48px] rounded-xl border border-[#1C4D3C] bg-[#061812] px-4 py-3 text-base text-[#F0F5EF] placeholder-[#7B9586] outline-none focus:border-[#A6F16A] focus:ring-1 focus:ring-[#A6F16A] disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              {/* Scientific Name */}
              <div>
                <label
                  htmlFor="scientificName"
                  className="block text-xs font-semibold tracking-wider uppercase text-[#B2C8BA]"
                >
                  Scientific Name
                </label>
                <input
                  id="scientificName"
                  type="text"
                  value={form.scientificName}
                  disabled={form.saved || form.isUnknown}
                  onChange={(e) => form.setScientificName(e.target.value)}
                  placeholder="e.g. Pavo cristatus"
                  className="mt-2 w-full min-h-[48px] rounded-xl border border-[#1C4D3C] bg-[#061812] px-4 py-3 text-base italic text-[#F0F5EF] placeholder-[#7B9586] outline-none focus:border-[#A6F16A] focus:ring-1 focus:ring-[#A6F16A] disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              {/* Species Group */}
              <div>
                <label
                  htmlFor="speciesGroup"
                  className="block text-xs font-semibold tracking-wider uppercase text-[#B2C8BA] mb-2"
                >
                  Species Group
                </label>
                <AppSelect
                  id="speciesGroup"
                  value={form.speciesGroup}
                  disabled={form.saved}
                  onChange={(val) => {
                    form.setSpeciesGroup(val)
                    if (val !== 'Other') form.setOtherSpeciesGroup('')
                  }}
                  placeholder="Select Species Group..."
                  options={SPECIES_GROUPS.map((group) => ({ value: group, label: group }))}
                />

                {form.speciesGroup === 'Other' && (
                  <div className="mt-3">
                    <input
                      id="otherSpeciesGroup"
                      type="text"
                      value={form.otherSpeciesGroup}
                      disabled={form.saved}
                      onChange={(event) => form.setOtherSpeciesGroup(event.target.value)}
                      placeholder="Specify other group..."
                      className="w-full min-h-[48px] rounded-xl border border-[#1C4D3C] bg-[#061812] px-4 py-3 text-base text-[#F0F5EF] placeholder-[#7B9586] outline-none focus:border-[#A6F16A] focus:ring-1 focus:ring-[#A6F16A]"
                    />
                  </div>
                )}
              </div>

              {/* Basis of Record */}
              <div className="pt-2 border-t border-[#1C4D3C]">
                <label
                  htmlFor="basisOfRecord"
                  className="block text-xs font-semibold tracking-wider uppercase text-[#B2C8BA] mb-2"
                >
                  Basis of Record <span className="text-red-500 font-bold">*</span>
                </label>
                <AppSelect
                  id="basisOfRecord"
                  value={form.basisOfRecord}
                  disabled={form.saved}
                  onChange={(val) => form.setBasisOfRecord(val as BasisOfRecord)}
                  placeholder="Select Basis of Record..."
                  options={BASIS_OF_RECORD_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label }))}
                />
              </div>
            </div>
          )}
        </section>

        {/* 4. Ecological details / population status Collapsible Card */}
        {/* Requirement 2 & 4: Renamed heading and initially collapsed to reduce clutter */}
        <section className="rounded-3xl border border-[#1C4D3C] bg-[#0D2D22] p-5 sm:p-6 shadow-xl shadow-[#061812]/50 text-[#F0F5EF] transition-all">
          <div
            role="button"
            tabIndex={0}
            onClick={() => setOpenEcology((prev) => !prev)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                setOpenEcology((prev) => !prev)
              }
            }}
            className="flex items-center justify-between cursor-pointer select-none"
            aria-expanded={openEcology}
            aria-label="Toggle Ecological details / population status section"
          >
            <div className="flex items-center gap-2 flex-wrap">
              <Layers className="h-5 w-5 text-[#A6F16A] shrink-0" />
              <h2 className="text-base sm:text-lg font-bold text-white">
                Ecological details / population status
              </h2>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  form.setShowEcologyTips(true)
                }}
                className="flex h-5 w-5 sm:h-5.5 sm:w-5.5 items-center justify-center rounded-full bg-[#061812] border border-[#1C4D3C] text-[#A6F16A] hover:bg-[#133D2F] hover:border-[#A6F16A]/60 hover:text-white transition-colors cursor-pointer shrink-0"
                aria-label="Tips for Ecological Details"
                title="Tips for Ecological Details"
              >
                <Info className="h-3 w-3" />
              </button>

              {/* Subtle badge indicating entered fields when collapsed */}
              {(form.habitatType || form.lifeStage || form.season) && (
                <span className="rounded-full bg-[#133D2F] border border-[#1C4D3C] px-2 py-0.5 text-[10px] font-semibold text-[#A6F16A]">
                  {[form.habitatType, form.lifeStage, form.season].filter(Boolean).join(' • ')}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {openEcology ? (
                <ChevronUp className="h-5 w-5 text-[#A6F16A] transition-transform duration-200" />
              ) : (
                <ChevronDown className="h-5 w-5 text-[#A6F16A] transition-transform duration-200" />
              )}
            </div>
          </div>

          {openEcology && (
            <div className="mt-4 pt-3.5 border-t border-[#1C4D3C]/70 space-y-4">
              {/* Habitat Type (Single-select dropdown) */}
              <div>
                <label
                  htmlFor="habitatType"
                  className="block text-xs font-semibold tracking-wider uppercase text-[#B2C8BA] mb-2"
                >
                  Habitat type
                </label>
                <AppSelect
                  id="habitatType"
                  value={form.habitatType}
                  disabled={form.saved}
                  onChange={(val) => form.setHabitatType(val)}
                  placeholder="Select Habitat type..."
                  options={HABITAT_TYPES.map((type) => ({ value: type, label: type }))}
                />
              </div>

              {/* Life stage & Count grid */}
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label
                    htmlFor="lifeStage"
                    className="block text-xs font-semibold tracking-wider uppercase text-[#B2C8BA] mb-2"
                  >
                    Life stage
                  </label>
                  <AppSelect
                    id="lifeStage"
                    value={form.lifeStage}
                    disabled={form.saved}
                    onChange={(val) => form.setLifeStage(val)}
                    placeholder="Select stage..."
                    options={ECOLOGICAL_LIFE_STAGES.map((stage) => ({ value: stage, label: stage }))}
                  />
                </div>

                <div>
                  <label
                    htmlFor="individualCount"
                    className="block text-xs font-semibold tracking-wider uppercase text-[#B2C8BA]"
                  >
                    Count <span className="text-red-500 font-bold">*</span>
                  </label>
                  <input
                    id="individualCount"
                    type="number"
                    min={1}
                    step={1}
                    value={form.individualCount}
                    disabled={form.saved}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10)
                      form.setIndividualCount(Number.isNaN(val) ? 1 : val)
                    }}
                    className="mt-2 w-full min-h-[48px] rounded-xl border border-[#1C4D3C] bg-[#061812] px-4 py-3 text-base font-semibold text-[#F0F5EF] outline-none focus:border-[#A6F16A] focus:ring-1 focus:ring-[#A6F16A]"
                  />
                </div>
              </div>

              {/* Reproductive Attributes (Multi-select) */}
              <div>
                <label
                  htmlFor="reproductiveAttributes"
                  className="block text-xs font-semibold tracking-wider uppercase text-[#B2C8BA] mb-2"
                >
                  Reproductive Attributes (Multi-select)
                </label>
                <AppMultiSelect
                  id="reproductiveAttributes"
                  values={form.reproductiveAttributes}
                  disabled={form.saved}
                  onChange={(vals) => form.setReproductiveAttributes(vals)}
                  placeholder="Select reproductive attributes..."
                  options={REPRODUCTIVE_ATTRIBUTES.map((attr) => ({ value: attr, label: attr }))}
                />
              </div>

              {/* Sex & Season grid */}
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label
                    htmlFor="sex"
                    className="block text-xs font-semibold tracking-wider uppercase text-[#B2C8BA] mb-2"
                  >
                    Sex
                  </label>
                  <AppSelect
                    id="sex"
                    value={form.sex}
                    disabled={form.saved}
                    onChange={(val) => form.setSex(val)}
                    placeholder="Select sex..."
                    options={SEX_OPTIONS.map((opt) => ({ value: opt, label: opt }))}
                  />
                </div>

                <div>
                  <label
                    htmlFor="season"
                    className="block text-xs font-semibold tracking-wider uppercase text-[#B2C8BA] mb-2"
                  >
                    Season
                  </label>
                  <AppSelect
                    id="season"
                    value={form.season}
                    disabled={form.saved}
                    onChange={(val) => form.setSeason(val)}
                    placeholder="Select season..."
                    options={SEASONS.map((s) => ({ value: s, label: s }))}
                  />
                </div>
              </div>

              {/* Evidence of Presence (Multi-select) */}
              <div>
                <label
                  htmlFor="evidenceOfPresence"
                  className="block text-xs font-semibold tracking-wider uppercase text-[#B2C8BA] mb-2"
                >
                  Evidence of Presence (Multi-select)
                </label>
                <AppMultiSelect
                  id="evidenceOfPresence"
                  values={form.evidenceOfPresence}
                  disabled={form.saved}
                  onChange={(vals) => form.setEvidenceOfPresence(vals)}
                  placeholder="Select evidence of presence..."
                  options={EVIDENCE_OF_PRESENCE.map((ev) => ({ value: ev, label: ev }))}
                />
              </div>

              {/* Micro-habitat / Substrate (Existing field preserved) */}
              <div>
                <label
                  htmlFor="microHabitat"
                  className="block text-xs font-semibold tracking-wider uppercase text-[#B2C8BA] mb-2"
                >
                  Micro-habitat / Substrate
                </label>
                <AppSelect
                  id="microHabitat"
                  value={form.microHabitat}
                  disabled={form.saved}
                  onChange={(val) => form.handleMicroHabitatChange(val)}
                  placeholder="Select substrate..."
                  options={MICRO_HABITATS.map((habitat) => ({ value: habitat, label: habitat }))}
                />

                {form.microHabitat === 'Other' && (
                  <div className="mt-3">
                    <input
                      id="otherMicroHabitat"
                      type="text"
                      value={form.otherMicroHabitat}
                      disabled={form.saved}
                      onChange={(e) => form.setOtherMicroHabitat(e.target.value)}
                      placeholder="Specify other micro-habitat..."
                      className="w-full min-h-[48px] rounded-xl border border-[#1C4D3C] bg-[#061812] px-4 py-3 text-base text-[#F0F5EF] placeholder-[#7B9586] outline-none focus:border-[#A6F16A] focus:ring-1 focus:ring-[#A6F16A]"
                    />
                  </div>
                )}
              </div>

              {/* Organism Status (Existing field preserved) */}
              <div>
                <label
                  htmlFor="organismStatus"
                  className="block text-xs font-semibold tracking-wider uppercase text-[#B2C8BA] mb-2"
                >
                  Organism Status
                </label>
                <AppSelect
                  id="organismStatus"
                  value={form.organismStatus}
                  disabled={form.saved}
                  onChange={(val) => form.setOrganismStatus(val as OrganismStatus | '')}
                  placeholder="Select organism status..."
                  options={ORGANISM_STATUSES.map((status) => ({ value: status, label: status }))}
                />
              </div>
            </div>
          )}

          {/* Tips for Ecological Details Modal */}
          <EcologyTipsModal
            isOpen={form.showEcologyTips}
            onClose={() => form.setShowEcologyTips(false)}
          />
        </section>

        {/* 5. Traditional Knowledge Collapsible Card */}
        <section className="rounded-3xl border border-[#1C4D3C] bg-[#0D2D22] p-5 sm:p-6 shadow-xl shadow-[#061812]/50 text-[#F0F5EF] transition-all">
          <div
            role="button"
            tabIndex={0}
            onClick={() => setOpenTk((prev) => !prev)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                setOpenTk((prev) => !prev)
              }
            }}
            className="flex items-center justify-between cursor-pointer select-none"
            aria-expanded={openTk}
            aria-label="Toggle Traditional Knowledge section"
          >
            <div className="flex items-center gap-2 flex-wrap">
              <BookOpen className="h-5 w-5 text-[#A6F16A] shrink-0" />
              <h2 className="text-base sm:text-lg font-bold text-white">
                Traditional Knowledge
              </h2>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  form.setShowTkTips(true)
                }}
                className="flex h-5 w-5 sm:h-5.5 sm:w-5.5 items-center justify-center rounded-full bg-[#061812] border border-[#1C4D3C] text-[#A6F16A] hover:bg-[#133D2F] hover:border-[#A6F16A]/60 hover:text-white transition-colors cursor-pointer shrink-0"
                aria-label="What is Traditional Knowledge?"
                title="What is Traditional Knowledge?"
              >
                <Info className="h-3 w-3" />
              </button>

              {form.hasTraditionalKnowledge && (
                <span className="rounded-full bg-[#133D2F] border border-[#1C4D3C] px-2.5 py-0.5 text-[11px] font-semibold text-[#A6F16A]">
                  Associated: {form.hasTraditionalKnowledge}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {openTk ? (
                <ChevronUp className="h-5 w-5 text-[#A6F16A] transition-transform duration-200" />
              ) : (
                <ChevronDown className="h-5 w-5 text-[#A6F16A] transition-transform duration-200" />
              )}
            </div>
          </div>

          {openTk && (
            <div className="mt-4 pt-3.5 border-t border-[#1C4D3C]/70">
              <label
                htmlFor="hasTraditionalKnowledge"
                className="block text-xs font-semibold tracking-wider uppercase text-[#B2C8BA] mb-2"
              >
                Is traditional knowledge associated?
              </label>
              <AppSelect
                id="hasTraditionalKnowledge"
                value={form.hasTraditionalKnowledge}
                disabled={form.saved}
                onChange={(val) =>
                  form.handleTraditionalKnowledgeChange(val as YesNo | '')
                }
                placeholder="Select Yes or No..."
                options={[
                  { value: 'Yes', label: 'Yes' },
                  { value: 'No', label: 'No' },
                ]}
              />

              {form.hasTraditionalKnowledge === 'Yes' && (
                <div className="mt-3 space-y-3 rounded-2xl bg-[#061812] border border-[#1C4D3C] p-4 text-base">
                  <div>
                    <label
                      htmlFor="traditionalKnowledgeSource"
                      className="block text-xs font-semibold tracking-wider uppercase text-[#B2C8BA] mb-2"
                    >
                      Source of Knowledge <span className="text-red-500 font-bold">*</span>
                    </label>
                    <AppSelect
                      id="traditionalKnowledgeSource"
                      value={form.traditionalKnowledgeSource}
                      disabled={form.saved}
                      onChange={(val) => form.handleTraditionalKnowledgeSourceChange(val)}
                      placeholder="Select source..."
                      options={TRADITIONAL_KNOWLEDGE_SOURCES.map((source) => ({ value: source, label: source }))}
                    />
                  </div>

                  {form.traditionalKnowledgeSource === 'Other' && (
                    <div>
                      <input
                        id="otherTraditionalKnowledgeSource"
                        type="text"
                        value={form.otherTraditionalKnowledgeSource}
                        disabled={form.saved}
                        onChange={(e) =>
                          form.setOtherTraditionalKnowledgeSource(e.target.value)
                        }
                        placeholder="Specify other source..."
                        className="w-full min-h-[48px] rounded-xl border border-[#1C4D3C] bg-[#0D2D22] px-3.5 py-2.5 text-base text-[#F0F5EF] placeholder-[#7B9586]"
                      />
                    </div>
                  )}

                  <p className="text-xs text-[#7B9586] leading-relaxed pt-1">
                    Community consent: Do not record private phone numbers or personal identifying details.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* What is Traditional Knowledge Modal */}
          <TraditionalKnowledgeTipsModal
            isOpen={form.showTkTips}
            onClose={() => form.setShowTkTips(false)}
          />
        </section>

        {/* 6. Notes Collapsible Card */}
        <section className="rounded-3xl border border-[#1C4D3C] bg-[#0D2D22] p-5 sm:p-6 shadow-xl shadow-[#061812]/50 text-[#F0F5EF] transition-all">
          <div
            role="button"
            tabIndex={0}
            onClick={() => setOpenNotes((prev) => !prev)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                setOpenNotes((prev) => !prev)
              }
            }}
            className="flex items-center justify-between cursor-pointer select-none"
            aria-expanded={openNotes}
            aria-label="Toggle Field Notes section"
          >
            <div className="flex items-center gap-2 flex-wrap">
              <FileText className="h-5 w-5 text-[#A6F16A] shrink-0" />
              <h2 className="text-base sm:text-lg font-bold text-white">
                Field Notes
              </h2>
              {form.notes.trim() && (
                <span className="rounded-full bg-[#133D2F] border border-[#1C4D3C] px-2.5 py-0.5 text-[11px] font-semibold text-[#A6F16A]">
                  Notes added
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {openNotes ? (
                <ChevronUp className="h-5 w-5 text-[#A6F16A] transition-transform duration-200" />
              ) : (
                <ChevronDown className="h-5 w-5 text-[#A6F16A] transition-transform duration-200" />
              )}
            </div>
          </div>

          {openNotes && (
            <div className="mt-4 pt-3.5 border-t border-[#1C4D3C]/70">
              <label
                htmlFor="notes"
                className="block text-xs font-semibold tracking-wider uppercase text-[#B2C8BA]"
              >
                Observer Notes
              </label>
              <textarea
                id="notes"
                rows={3}
                value={form.notes}
                disabled={form.saved}
                onChange={(e) => form.setNotes(e.target.value)}
                placeholder="Habit, weather, host plant, landmarks..."
                className="mt-2 w-full rounded-xl border border-[#1C4D3C] bg-[#061812] px-4 py-3 text-base text-[#F0F5EF] placeholder-[#7B9586] outline-none focus:border-[#A6F16A] focus:ring-1 focus:ring-[#A6F16A] disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          )}
        </section>

        {/* 7. Classification Tags Collapsible Card */}
        <section className="rounded-3xl border border-[#1C4D3C] bg-[#0D2D22] p-5 sm:p-6 shadow-xl shadow-[#061812]/50 text-[#F0F5EF] transition-all">
          <div
            role="button"
            tabIndex={0}
            onClick={() => setOpenTags((prev) => !prev)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                setOpenTags((prev) => !prev)
              }
            }}
            className="flex items-center justify-between cursor-pointer select-none"
            aria-expanded={openTags}
            aria-label="Toggle Classification Tags section"
          >
            <div className="flex items-center gap-2.5 flex-wrap">
              <TagIcon className="h-5 w-5 text-[#A6F16A] shrink-0" />
              <h2 className="text-base sm:text-lg font-bold text-white">
                Classification Tags
              </h2>
              {form.tags.length > 0 && (
                <span className="rounded-full bg-[#133D2F] text-[#A6F16A] border border-[#1C4D3C] px-2.5 py-0.5 text-xs font-semibold">
                  {form.tags.length} selected
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {openTags ? (
                <ChevronUp className="h-5 w-5 text-[#A6F16A] transition-transform duration-200" />
              ) : (
                <ChevronDown className="h-5 w-5 text-[#A6F16A] transition-transform duration-200" />
              )}
            </div>
          </div>

          {openTags && (
            <div className="mt-4 pt-3.5 border-t border-[#1C4D3C]/70">
              <TagSelector
                selectedTagIds={form.tags}
                onChange={(newTags) => form.setTags(newTags)}
                disabled={form.saved}
              />
            </div>
          )}
        </section>

        {/* 8. Location Visibility Collapsible Card */}
        <section className="rounded-3xl border border-[#1C4D3C] bg-[#0D2D22] p-5 sm:p-6 shadow-xl shadow-[#061812]/50 text-[#F0F5EF] transition-all">
          <div
            role="button"
            tabIndex={0}
            onClick={() => setOpenVisibility((prev) => !prev)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                setOpenVisibility((prev) => !prev)
              }
            }}
            className="flex items-center justify-between cursor-pointer select-none"
            aria-expanded={openVisibility}
            aria-label="Toggle Location Visibility section"
          >
            <div className="flex items-center gap-2 flex-wrap">
              <Eye className="h-5 w-5 text-[#A6F16A] shrink-0" />
              <h2 className="text-base sm:text-lg font-bold text-white">
                Location Visibility
              </h2>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  form.setShowVisibilityHelp(!form.showVisibilityHelp)
                }}
                className="flex h-5 w-5 sm:h-5.5 sm:w-5.5 items-center justify-center rounded-full bg-[#061812] border border-[#1C4D3C] text-[#A6F16A] hover:bg-[#133D2F] transition-colors cursor-pointer shrink-0"
                aria-label="Toggle visibility help"
                title="Toggle visibility help"
              >
                <Info className="h-3 w-3" />
              </button>

              {form.locationVisibility && (
                <span className="rounded-full bg-[#133D2F] text-[#A6F16A] border border-[#1C4D3C] px-2.5 py-0.5 text-xs font-semibold">
                  {form.locationVisibility}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {openVisibility ? (
                <ChevronUp className="h-5 w-5 text-[#A6F16A] transition-transform duration-200" />
              ) : (
                <ChevronDown className="h-5 w-5 text-[#A6F16A] transition-transform duration-200" />
              )}
            </div>
          </div>

          {openVisibility && (
            <div className="mt-4 pt-3.5 border-t border-[#1C4D3C]/70">
              {form.showVisibilityHelp && (
                <div className="mb-3.5 rounded-2xl bg-[#061812] border border-[#1C4D3C] px-4 py-3 text-xs text-[#B2C8BA] leading-relaxed space-y-2">
                  <p className="font-semibold text-white">What does each option mean?</p>
                  {LOCATION_VISIBILITIES.map((opt) => (
                    <div key={opt.value} className="flex gap-2">
                      <span className="font-semibold text-[#A6F16A] shrink-0">{opt.label}:</span>
                      <span>{opt.description}</span>
                    </div>
                  ))}
                </div>
              )}

              <div
                className="space-y-2.5"
                role="radiogroup"
                aria-label="Location Visibility Options"
              >
                {LOCATION_VISIBILITIES.map((opt) => {
                  const isSelected = form.locationVisibility === opt.value
                  return (
                    <div
                      key={opt.value}
                      role="radio"
                      aria-checked={isSelected}
                      tabIndex={form.saved ? -1 : 0}
                      onClick={() => {
                        if (form.saved) return
                        form.setLocationVisibility(isSelected ? '' : opt.value)
                      }}
                      onKeyDown={(e) => {
                        if (form.saved) return
                        if (e.key === ' ' || e.key === 'Enter') {
                          e.preventDefault()
                          form.setLocationVisibility(isSelected ? '' : opt.value)
                        }
                      }}
                      className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition-all select-none ${
                        form.saved ? 'cursor-not-allowed opacity-50' : ''
                      } ${
                        isSelected
                          ? 'border-[#A6F16A] bg-[#133D2F] shadow-md shadow-[#061812]/50'
                          : 'border-[#1C4D3C] bg-[#061812] hover:border-[#A6F16A]/40 hover:bg-[#0D2D22]'
                      }`}
                    >
                      <span
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-all ${
                          isSelected
                            ? 'border-[#A6F16A] bg-[#A6F16A]'
                            : 'border-[#1C4D3C] bg-[#061812]'
                        }`}
                      >
                        {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-[#061812]" />}
                      </span>
                      <span
                        className={`text-sm font-semibold ${
                          isSelected ? 'text-white' : 'text-[#B2C8BA]'
                        }`}
                      >
                        {opt.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </section>

        {/* 9. Add to project(s) Collapsible Card (hidden when inside a project context) */}
        {!form.isProjectContext && (
          <section className="rounded-3xl border border-[#1C4D3C] bg-[#0D2D22] p-5 sm:p-6 shadow-xl shadow-[#061812]/50 text-[#F0F5EF] transition-all">
            <div
              role="button"
              tabIndex={0}
              onClick={() => setOpenProjects((prev) => !prev)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  setOpenProjects((prev) => !prev)
                }
              }}
              className="flex items-center justify-between cursor-pointer select-none"
              aria-expanded={openProjects}
              aria-label="Toggle Projects section"
            >
              <div className="flex items-center gap-2 flex-wrap">
                <FolderGit2 className="h-5 w-5 text-[#A6F16A] shrink-0" />
                <h2 className="text-base sm:text-lg font-bold text-white">
                  Add to project(s)
                </h2>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    form.setShowProjectTips(!form.showProjectTips)
                  }}
                  className="flex h-5 w-5 items-center justify-center rounded-full bg-[#061812] border border-[#1C4D3C] text-[#A6F16A] hover:bg-[#133D2F] hover:border-[#A6F16A]/60 hover:text-white transition-colors cursor-pointer shrink-0"
                  aria-label={
                    form.showProjectTips
                      ? 'Hide project information'
                      : 'About adding to projects'
                  }
                  aria-expanded={form.showProjectTips}
                  title="About adding to projects"
                >
                  <Info className="h-3 w-3" />
                </button>
                {form.selectedProjectIds.length > 0 && (
                  <span className="rounded-full bg-[#133D2F] text-[#A6F16A] border border-[#1C4D3C] px-2.5 py-0.5 text-xs font-semibold">
                    {form.selectedProjectIds.length} selected
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {openProjects ? (
                  <ChevronUp className="h-5 w-5 text-[#A6F16A] transition-transform duration-200" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-[#A6F16A] transition-transform duration-200" />
                )}
              </div>
            </div>

            {openProjects && (
              <div className="mt-4 pt-3.5 border-t border-[#1C4D3C]/70 space-y-3.5">
                {form.showProjectTips && (
                  <div
                    role="region"
                    aria-label="Project association information"
                    className="rounded-2xl bg-[#061812] border border-[#1C4D3C] p-3.5 text-xs text-[#B2C8BA] leading-relaxed flex items-start gap-2.5"
                  >
                    <Info className="h-4 w-4 text-[#A6F16A] shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold text-white">About Project Association</p>
                      <p className="mt-0.5 text-[#B2C8BA]">
                        Associate this observation with one or more community biodiversity projects.
                        Adding to projects is optional.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => form.setShowProjectTips(false)}
                      className="text-[#7B9586] hover:text-white p-0.5 transition-colors cursor-pointer"
                      aria-label="Close information"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}

                {/* Selected Projects as Chips */}
                {form.selectedProjectIds.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-semibold tracking-wider uppercase text-[#7B9586]">
                      Selected Projects ({form.selectedProjectIds.length})
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {form.selectedProjectIds.map((pId) => {
                        const proj = form.allProjects.find((p) => p.id === pId)
                        return (
                          <span
                            key={pId}
                            className="inline-flex items-center gap-1.5 rounded-full bg-[#133D2F] border border-[#A6F16A]/50 px-3 py-1 text-xs font-medium text-[#F0F5EF] shadow-xs"
                          >
                            <span className="truncate max-w-[200px]">
                              {proj ? proj.name : pId}
                            </span>
                            {!form.saved && (
                              <button
                                type="button"
                                onClick={() => form.handleRemoveProject(pId)}
                                className="rounded-full p-0.5 hover:bg-[#061812] text-[#A6F16A] hover:text-rose-400 transition-colors cursor-pointer"
                                aria-label={`Remove project ${proj ? proj.name : pId}`}
                              >
                                <X className="h-3 w-3" />
                              </button>
                            )}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Search projects input */}
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7B9586]" />
                  <input
                    type="text"
                    value={form.projectSearchQuery}
                    disabled={form.saved}
                    onChange={(e) => form.setProjectSearchQuery(e.target.value)}
                    placeholder="Search projects by name, organization, or region..."
                    className="w-full min-h-[44px] rounded-xl border border-[#1C4D3C] bg-[#061812] pl-10 pr-9 py-2.5 text-sm text-[#F0F5EF] placeholder-[#7B9586] outline-none focus:border-[#A6F16A] focus:ring-1 focus:ring-[#A6F16A]"
                  />
                  {form.projectSearchQuery && (
                    <button
                      type="button"
                      onClick={() => form.setProjectSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7B9586] hover:text-white cursor-pointer"
                      aria-label="Clear project search"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Available Projects List */}
                <div className="max-h-56 overflow-y-auto space-y-2 pr-1 rounded-xl">
                  {form.allProjects.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-[#1C4D3C] p-4 text-center text-xs text-[#7B9586]">
                      <p>No projects available yet.</p>
                    </div>
                  ) : form.filteredProjects.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-[#1C4D3C] p-4 text-center text-xs text-[#7B9586]">
                      <p>No projects match &quot;{form.projectSearchQuery}&quot;.</p>
                    </div>
                  ) : (
                    form.filteredProjects.map((proj) => {
                      const isSelected = form.selectedProjectIds.includes(proj.id)
                      return (
                        <div
                          key={proj.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => form.handleToggleProject(proj.id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault()
                              form.handleToggleProject(proj.id)
                            }
                          }}
                          className={`flex items-center justify-between gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#133D2F]/70 border-[#A6F16A] text-white shadow-xs'
                              : 'bg-[#061812] border-[#1C4D3C] text-[#B2C8BA] hover:border-[#A6F16A]/40'
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm truncate text-white">
                                {proj.name}
                              </span>
                              <span className="text-[10px] capitalize px-2 py-0.5 rounded-full bg-[#0D2D22] border border-[#1C4D3C] text-[#7B9586]">
                                {proj.status || 'Active'}
                              </span>
                            </div>
                            {(proj.organization || proj.targetRegion) && (
                              <p className="text-xs text-[#7B9586] truncate mt-0.5">
                                {[proj.organization, proj.targetRegion].filter(Boolean).join(' • ')}
                              </p>
                            )}
                          </div>
                          <span
                            className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                              isSelected
                                ? 'bg-[#A6F16A] text-[#061812] font-bold'
                                : 'bg-[#0D2D22] text-[#B2C8BA] border border-[#1C4D3C]'
                            }`}
                          >
                            {isSelected ? 'Selected ✓' : '+ Select'}
                          </span>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            )}
          </section>
        )}

        {/* 10. Save Observation Button (Lime-to-Turquoise Gradient) */}
        <section className="pt-2">
          <Button
            type="button"
            className="min-h-[54px] w-full bg-gradient-to-r from-[#A6F16A] to-[#20D6A0] hover:opacity-95 text-[#061812] font-extrabold text-base sm:text-lg tracking-wider uppercase shadow-xl shadow-[#20D6A0]/25 rounded-2xl active:scale-[0.98] transition-all cursor-pointer"
            disabled={form.saved || form.isSaving}
            onClick={form.handleSaveObservation}
          >
            {form.isSaving ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin text-[#061812]" />
                <span>{form.isEditMode ? 'Updating Record...' : 'Saving Record...'}</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-5 w-5 mr-2 text-[#061812]" />
                <span>{form.isEditMode ? 'Save Changes' : 'Save Observation'}</span>
              </>
            )}
          </Button>

          {/* Saved Confirmation Banner */}
          {form.saved && (
            <div className="mt-4 rounded-3xl border border-[#1C4D3C] bg-[#0D2D22] p-5 text-center shadow-xl shadow-[#061812] text-[#F0F5EF]">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#133D2F] border border-[#1C4D3C] text-[#A6F16A] mb-2 shadow-xs">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <p className="text-base font-bold text-white">
                {form.isEditMode
                  ? 'Observation updated successfully!'
                  : 'Observation saved to local database!'}
              </p>
              <p className="text-xs text-[#B2C8BA] mt-0.5">
                Stored offline in IndexedDB on this device.
              </p>
              <div className="mt-4 flex flex-col sm:flex-row gap-2.5">
                {form.isEditMode ? (
                  <Button
                    type="button"
                    className="flex-1 min-h-[46px] bg-gradient-to-r from-[#A6F16A] to-[#20D6A0] text-[#061812] hover:opacity-95 text-sm font-bold tracking-wider uppercase rounded-xl transition-all shadow-xs cursor-pointer"
                    onClick={() => form.navigate('/observations')}
                  >
                    <span>Back to Records</span>
                  </Button>
                ) : (
                  <>
                    {form.isProjectContext && (
                      <Button
                        type="button"
                        className="flex-1 min-h-[46px] border border-[#1C4D3C] bg-[#061812] text-[#A6F16A] hover:bg-[#133D2F] text-sm font-bold tracking-wider uppercase rounded-xl transition-all cursor-pointer"
                        onClick={() => form.navigate(`/projects/${form.initialProjectId}`)}
                      >
                        <ArrowLeft className="h-4 w-4 mr-1.5" />
                        <span>Return to Project</span>
                      </Button>
                    )}
                    <Button
                      type="button"
                      className="flex-1 min-h-[46px] bg-gradient-to-r from-[#A6F16A] to-[#20D6A0] text-[#061812] hover:opacity-95 text-sm font-bold tracking-wider uppercase rounded-xl transition-all shadow-xs cursor-pointer"
                      onClick={form.resetForm}
                    >
                      <RotateCcw className="h-4 w-4 mr-1.5 text-[#061812]" />
                      <span>+ Record Next Observation</span>
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
