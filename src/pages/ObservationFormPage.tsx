import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  ORGANISM_STATUSES,
  LOCATION_VISIBILITIES,
  MICRO_HABITATS,
  LIFE_STAGES,
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
  Clock,
  AlertCircle,
  Compass,
  Info,
  ChevronDown,
  Tag as TagIcon,
  FolderGit2,
  Search,
} from 'lucide-react'
import LocationPickerMap from '@/components/LocationPickerMap'
import TagSelector from '@/components/TagSelector'
import { AppSelect } from '@/components/ui/select'
import {
  SPECIES_GROUPS,
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

      {/* Observation Form Container — Dark Forest-Green Cards */}
      <div className="space-y-5">
        {/* 1. Photographs */}
        <section className="rounded-3xl border border-[#1C4D3C] bg-[#0D2D22] p-5 sm:p-6 shadow-xl shadow-[#061812]/50 text-[#F0F5EF]">
          <div className="flex items-center justify-between border-b border-[#1C4D3C] pb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white">
                Photographs{' '}
                {form.isUnknown && <span className="text-red-500 font-bold text-base">*</span>}
              </h2>
              <button
                type="button"
                onClick={() => form.setShowPhotoTips(true)}
                className="flex h-5 w-5 sm:h-5.5 sm:w-5.5 items-center justify-center rounded-full bg-[#061812] border border-[#1C4D3C] text-[#A6F16A] hover:bg-[#133D2F] hover:border-[#A6F16A]/60 hover:text-white transition-colors cursor-pointer"
                aria-label="Tips for Great Field Photos"
                title="Tips for Great Field Photos"
              >
                <Info className="h-3 w-3" />
              </button>
            </div>
            {form.photos.length > 0 && (
              <span className="rounded-full bg-[#133D2F] border border-[#1C4D3C] px-2.5 py-0.5 text-[11px] font-semibold text-[#A6F16A]">
                {form.photos.length} {form.photos.length === 1 ? 'photo' : 'photos'}
              </span>
            )}
          </div>

          {/* Camera and Gallery Buttons */}
          <div className="mt-4 grid grid-cols-2 gap-3">
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
              form.handleAddPhotos(e.target.files)
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
              form.handleAddPhotos(e.target.files)
              e.target.value = ''
            }}
          />

          {/* Photo Previews */}
          {form.photoPreviews.length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-2.5">
              {form.photoPreviews.map((url, idx) => (
                <div
                  key={idx}
                  className="relative aspect-square overflow-hidden rounded-2xl border border-[#1C4D3C] bg-[#061812]"
                >
                  <img
                    src={url}
                    alt={`Preview ${idx + 1}`}
                    className="h-full w-full object-cover"
                  />
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
              ))}
            </div>
          )}

          {/* Tips for Great Field Photos Modal */}
          <PhotoTipsModal
            isOpen={form.showPhotoTips}
            onClose={() => form.setShowPhotoTips(false)}
          />
        </section>

        {/* 2. Location & Administrative Ward (Interactive Map & GPS) */}
        <section className="rounded-3xl border border-[#1C4D3C] bg-[#0D2D22] p-5 sm:p-6 shadow-xl shadow-[#061812]/50 text-[#F0F5EF]">
          <div className="flex items-center justify-between border-b border-[#1C4D3C] pb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white">
                Location & Ward <span className="text-red-500 font-bold text-base">*</span>
              </h2>
              <button
                type="button"
                onClick={() => form.setShowLocationTips(true)}
                className="flex h-5 w-5 sm:h-5.5 sm:w-5.5 items-center justify-center rounded-full bg-[#061812] border border-[#1C4D3C] text-[#A6F16A] hover:bg-[#133D2F] hover:border-[#A6F16A]/60 hover:text-white transition-colors cursor-pointer"
                aria-label="Tips for Accurate Location"
                title="Tips for Accurate Location"
              >
                <Info className="h-3 w-3" />
              </button>
            </div>
            {geo.location && (
              <div className="flex items-center gap-1.5 flex-wrap">
                {geo.locationSource === 'Manual Pin Adjustment' ? (
                  <span className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold border bg-amber-950/60 text-amber-300 border-amber-800/60">
                    Manual Pin Adjustment
                  </span>
                ) : geo.locationSource === 'GPS' ? (
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${
                      geo.locationAccuracy !== null && geo.locationAccuracy <= 10
                        ? 'bg-[#133D2F] text-[#A6F16A] border-[#1C4D3C]'
                        : 'bg-amber-950/60 text-amber-300 border-amber-800/60'
                    }`}
                  >
                    GPS Fix{' '}
                    {geo.locationAccuracy !== null
                      ? `(±${Math.round(geo.locationAccuracy)}m)`
                      : ''}
                  </span>
                ) : null}
              </div>
            )}
          </div>

          {/* GPS Acquire / Retry Button (Get My Location) */}
          <div className="mt-4 flex gap-2">
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
                  <span>Get My Location</span>
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

          {/* Interactive OpenStreetMap */}
          <LocationPickerMap
            location={geo.location}
            rawGPS={geo.gpsLocation}
            onLocationChange={geo.handleManualLocationChange}
            disabled={form.saved}
          />

          {/* Coordinates and Time Readout */}
          <div className="mt-3 rounded-2xl bg-[#061812] px-4 py-3 border border-[#1C4D3C] text-sm space-y-2 text-[#F0F5EF]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 font-mono text-sm sm:text-base font-medium text-[#A6F16A]">
                <MapPin className="h-4 w-4 text-[#20D6A0] shrink-0" />
                <span>
                  {geo.location
                    ? `${geo.location.latitude.toFixed(5)}, ${geo.location.longitude.toFixed(5)}`
                    : 'Coordinates not selected yet'}
                </span>
                {geo.locationSource && (
                  <span className="ml-1 text-[11px] font-sans font-semibold text-[#B2C8BA] bg-[#133D2F] px-2 py-0.5 rounded-full border border-[#1C4D3C]">
                    {geo.locationSource}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#7B9586]">
                <Clock className="h-3.5 w-3.5 text-[#7B9586]" />
                <span>{form.displayObservationTime}</span>
              </div>
            </div>

            {/* Audit display: Raw GPS coordinates preserved when adjusted */}
            {geo.gpsLocation && (
              <div className="pt-2 border-t border-[#1C4D3C] flex flex-wrap items-center justify-between gap-2 text-xs text-[#B2C8BA]">
                <div className="flex items-center gap-1.5 font-mono">
                  <Compass className="h-3.5 w-3.5 text-[#20D6A0] shrink-0" />
                  <span>
                    Raw GPS: {geo.gpsLocation.latitude.toFixed(5)},{' '}
                    {geo.gpsLocation.longitude.toFixed(5)}
                  </span>
                  {geo.locationAccuracy !== null && (
                    <span className="text-[11px] text-[#7B9586]">
                      (±{Math.round(geo.locationAccuracy)}m sensor accuracy)
                    </span>
                  )}
                </div>
                {geo.locationSource === 'Manual Pin Adjustment' && (
                  <span className="text-[11px] text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-800/60">
                    Original GPS preserved • Final adjusted on map
                  </span>
                )}
              </div>
            )}

            {geo.locationSource === 'Manual Pin Adjustment' && !geo.gpsLocation && (
              <div className="pt-2 border-t border-[#1C4D3C] text-xs text-[#7B9586]">
                <span>📍 Manual pin placement without GPS acquisition. Raw GPS fields are null.</span>
              </div>
            )}
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

            {/* Read-only Ward container supporting all 7 states */}
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

                  {/* Quick retry action if location permission failed outdoors */}
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

          {/* Tips for Accurate Location Modal */}
          <LocationTipsModal
            isOpen={form.showLocationTips}
            onClose={() => form.setShowLocationTips(false)}
          />
        </section>

        {/* 3. Identification Status */}
        <section className="rounded-3xl border border-[#1C4D3C] bg-[#0D2D22] p-5 sm:p-6 shadow-xl shadow-[#061812]/50 text-[#F0F5EF]">
          <h2 className="text-base sm:text-lg font-bold text-white border-b border-[#1C4D3C] pb-3">
            Identification Status <span className="text-red-500 font-bold text-base">*</span>
          </h2>

          <div className="mt-4">
            <label
              htmlFor="identificationStatus"
              className="block text-xs font-semibold tracking-wider uppercase text-[#B2C8BA] mb-2"
            >
              Select Status
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
        </section>

        {/* 4. Species Details */}
        <section className="rounded-3xl border border-[#1C4D3C] bg-[#0D2D22] p-5 sm:p-6 shadow-xl shadow-[#061812]/50 text-[#F0F5EF]">
          <h2 className="text-base sm:text-lg font-bold text-white border-b border-[#1C4D3C] pb-3">
            Species Details
          </h2>

          {/* Common Name */}
          <div className="mt-4">
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
          <div className="mt-4">
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
          <div className="mt-4">
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
          <div className="mt-4">
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
          <div className="mt-4 pt-4 border-t border-[#1C4D3C]">
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
        </section>

        {/* 5. Ecological Details */}
        <section className="rounded-3xl border border-[#1C4D3C] bg-[#0D2D22] p-5 sm:p-6 shadow-xl shadow-[#061812]/50 text-[#F0F5EF]">
          <div className="flex items-center justify-between border-b border-[#1C4D3C] pb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white">
                Ecological Details
              </h2>
              <button
                type="button"
                onClick={() => form.setShowEcologyTips(true)}
                className="flex h-5 w-5 sm:h-5.5 sm:w-5.5 items-center justify-center rounded-full bg-[#061812] border border-[#1C4D3C] text-[#A6F16A] hover:bg-[#133D2F] hover:border-[#A6F16A]/60 hover:text-white transition-colors cursor-pointer"
                aria-label="Tips for Ecological Details"
                title="Tips for Ecological Details"
              >
                <Info className="h-3 w-3" />
              </button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3.5">
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

            <div>
              <label
                htmlFor="lifeStage"
                className="block text-xs font-semibold tracking-wider uppercase text-[#B2C8BA] mb-2"
              >
                Life Stage
              </label>
              <AppSelect
                id="lifeStage"
                value={form.lifeStage}
                disabled={form.saved}
                onChange={(val) => form.setLifeStage(val)}
                placeholder="Select stage..."
                options={LIFE_STAGES.map((stage) => ({ value: stage, label: stage }))}
              />
            </div>
          </div>

          <div className="mt-4">
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

          {/* Organism Status */}
          <div className="mt-4">
            <label
              htmlFor="organismStatus"
              className="block text-xs font-semibold tracking-wider uppercase text-[#B2C8BA]"
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

          {/* Tips for Ecological Details Modal */}
          <EcologyTipsModal
            isOpen={form.showEcologyTips}
            onClose={() => form.setShowEcologyTips(false)}
          />
        </section>

        {/* 6. Traditional Knowledge */}
        <section className="rounded-3xl border border-[#1C4D3C] bg-[#0D2D22] p-5 sm:p-6 shadow-xl shadow-[#061812]/50 text-[#F0F5EF]">
          <div className="flex items-center justify-between border-b border-[#1C4D3C] pb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white">
                Traditional Knowledge
              </h2>
              <button
                type="button"
                onClick={() => form.setShowTkTips(true)}
                className="flex h-5 w-5 sm:h-5.5 sm:w-5.5 items-center justify-center rounded-full bg-[#061812] border border-[#1C4D3C] text-[#A6F16A] hover:bg-[#133D2F] hover:border-[#A6F16A]/60 hover:text-white transition-colors cursor-pointer"
                aria-label="What is Traditional Knowledge?"
                title="What is Traditional Knowledge?"
              >
                <Info className="h-3 w-3" />
              </button>
            </div>
          </div>

          <div className="mt-4">
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

          {/* What is Traditional Knowledge Modal */}
          <TraditionalKnowledgeTipsModal
            isOpen={form.showTkTips}
            onClose={() => form.setShowTkTips(false)}
          />
        </section>

        {/* 7. Notes */}
        <section className="rounded-3xl border border-[#1C4D3C] bg-[#0D2D22] p-5 sm:p-6 shadow-xl shadow-[#061812]/50 text-[#F0F5EF]">
          <h2 className="text-base sm:text-lg font-bold text-white border-b border-[#1C4D3C] pb-3">
            Notes
          </h2>

          <div className="mt-4">
            <label
              htmlFor="notes"
              className="block text-xs font-semibold tracking-wider uppercase text-[#B2C8BA]"
            >
              Field Notes
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
        </section>

        {/* 8. Classification Tags (Collapsible Accordion) */}
        <section className="rounded-3xl border border-[#1C4D3C] bg-[#0D2D22] p-5 sm:p-6 shadow-xl shadow-[#061812]/50 text-[#F0F5EF]">
          <button
            type="button"
            onClick={() => form.setShowTagsSection(!form.showTagsSection)}
            className="w-full flex items-center justify-between text-left focus:outline-none cursor-pointer"
            aria-expanded={form.showTagsSection}
          >
            <div className="flex items-center gap-2.5 flex-wrap">
              <TagIcon className="h-5 w-5 text-[#A6F16A]" />
              <h2 className="text-base sm:text-lg font-bold text-white">
                Classification Tags
              </h2>
              {form.tags.length > 0 && (
                <span className="rounded-full bg-[#133D2F] text-[#A6F16A] border border-[#1C4D3C] px-2.5 py-0.5 text-xs font-semibold">
                  {form.tags.length} selected
                </span>
              )}
            </div>
            <ChevronDown
              className={`h-5 w-5 text-[#A6F16A] transition-transform duration-200 shrink-0 ${
                form.showTagsSection ? 'rotate-180' : ''
              }`}
            />
          </button>

          {form.showTagsSection && (
            <div className="mt-4 pt-3 border-t border-[#1C4D3C]">
              <TagSelector
                selectedTagIds={form.tags}
                onChange={(newTags) => form.setTags(newTags)}
                disabled={form.saved}
              />
            </div>
          )}
        </section>

        {/* 9. Location Visibility */}
        <section className="rounded-3xl border border-[#1C4D3C] bg-[#0D2D22] p-5 sm:p-6 shadow-xl shadow-[#061812]/50 text-[#F0F5EF]">
          <div className="flex items-center justify-between border-b border-[#1C4D3C] pb-3">
            <h2 className="text-base sm:text-lg font-bold text-white">
              Location Visibility
            </h2>
            <button
              type="button"
              onClick={() => form.setShowVisibilityHelp(!form.showVisibilityHelp)}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-[#061812] border border-[#1C4D3C] text-[#A6F16A] hover:bg-[#133D2F] transition-colors cursor-pointer"
              aria-label={
                form.showVisibilityHelp
                  ? 'Hide location visibility help'
                  : 'Show location visibility help'
              }
              aria-expanded={form.showVisibilityHelp}
            >
              <Info className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Collapsible help panel — descriptions for each option live here */}
          {form.showVisibilityHelp && (
            <div className="mt-3 rounded-2xl bg-[#061812] border border-[#1C4D3C] px-4 py-3 text-xs text-[#B2C8BA] leading-relaxed space-y-2">
              <p className="font-semibold text-white">What does each option mean?</p>
              {LOCATION_VISIBILITIES.map((opt) => (
                <div key={opt.value} className="flex gap-2">
                  <span className="font-semibold text-[#A6F16A] shrink-0">{opt.label}:</span>
                  <span>{opt.description}</span>
                </div>
              ))}
              <p className="font-semibold text-white pt-0.5">Current status</p>
              <p className="text-amber-300">
                ⚠ This app is currently offline-only. No backend or public sharing pathway exists
                yet. &quot;Obscured&quot; and &quot;Private&quot; settings are stored and displayed faithfully,
                but coordinate restriction is not yet enforced. Enforcement will require a future
                server-side access system.
              </p>
            </div>
          )}

          <div
            className="mt-4 space-y-2.5"
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
        </section>

        {/* 10. Add to project(s) (Optional Collapsible Section - hidden when inside a project context) */}
        {!form.isProjectContext && (
          <section className="rounded-3xl border border-[#1C4D3C] bg-[#0D2D22] p-5 sm:p-6 shadow-xl shadow-[#061812]/50 text-[#F0F5EF]">
            <div className="flex items-center justify-between">
              <div
                className="flex items-center gap-2 flex-wrap cursor-pointer select-none"
                onClick={() => form.setShowProjectsSection(!form.showProjectsSection)}
              >
                <FolderGit2 className="h-5 w-5 text-[#A6F16A]" />
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
              <button
                type="button"
                onClick={() => form.setShowProjectsSection(!form.showProjectsSection)}
                className="p-1 text-[#A6F16A] hover:text-white transition-colors cursor-pointer"
                aria-label={
                  form.showProjectsSection
                    ? 'Collapse project section'
                    : 'Expand project section'
                }
                aria-expanded={form.showProjectsSection}
              >
                <ChevronDown
                  className={`h-5 w-5 text-[#A6F16A] transition-transform duration-200 shrink-0 ${
                    form.showProjectsSection ? 'rotate-180' : ''
                  }`}
                />
              </button>
            </div>

            {/* Accessible Info Panel for Project Explanation */}
            {form.showProjectTips && (
              <div
                role="region"
                aria-label="Project association information"
                className="mt-3 rounded-2xl bg-[#061812] border border-[#1C4D3C] p-3.5 text-xs text-[#B2C8BA] leading-relaxed flex items-start gap-2.5"
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

            {form.showProjectsSection && (
              <div className="mt-4 pt-3 border-t border-[#1C4D3C] space-y-3.5">
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

        {/* 11. Save Observation Button (Lime-to-Turquoise Gradient) */}
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
