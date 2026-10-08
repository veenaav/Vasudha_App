import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { db } from '@/db/database'
import ObservationCard from '@/components/ObservationCard'

function Home() {
  const [started, setStarted] = useState(false)
  const [speciesName, setSpeciesName] = useState('')
  const [location, setLocation] = useState<{
  latitude: number
  longitude: number
  } | null>(null)
  
const [photo, setPhoto] = useState<Blob | null>(null)
const [photoUrl, setPhotoUrl] = useState<string | null>(null)
const [photoCapturedAt, setPhotoCapturedAt] = useState<string | null>(null)
  useEffect(() => {
  if (!photo) {
    setPhotoUrl(null)
    return
  }

  const url = URL.createObjectURL(photo)
  setPhotoUrl(url)

  return () => {
    URL.revokeObjectURL(url)
  }
}, [photo])
  const [saved, setSaved] = useState(false)
  const [observations, setObservations] = useState<{
  id?: number
  speciesName: string
  notes: string
  observationDate: string
  observationAt: string
  recordedAt: string
  latitude: number | null
  longitude: number | null
  photo: Blob | null
}[]>([])

  const [notes, setNotes] = useState('')
  const [observationDate, setObservationDate] = useState('')

  useEffect(() => {
  const loadObservations = async () => {
    const savedObservations = await db.observations.toArray()

    setObservations(savedObservations)
  }

  loadObservations()
}, [])
  
  const getLocation = () => {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      setLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      })
    },
    (error) => {
      alert(`Unable to get location: ${error.message}`)
    }
  )
}
  

    return (
    <main className="mx-auto max-w-md p-6">
      <section className="text-center">
        <h2 className="text-2xl font-bold">
          Welcome to Vasudha
        </h2>

        <p className="mt-2 text-gray-600">
          Biodiversity Field Data Collection
        </p>

        <Button
           className="mt-6 w-full"
           onClick={() => {
           setStarted(true)
           setSpeciesName('')
           setNotes('')
           setObservationDate('')
           setLocation(null)
           setPhoto(null)
           setPhotoCapturedAt(null)
           setSaved(false)
           }}
        >
            Start Observation
            </Button>
      </section>

      {started && (
        <section className="mt-8 rounded-xl border p-5">
          <h3 className="text-lg font-semibold">
            New Observation
          </h3>

          <div className="mt-5">
            <label
              htmlFor="speciesName"
              className="text-sm font-medium"
            >
              Species / Common Name
            </label>

            <input
              id="speciesName"
              type="text"
              value={speciesName}
              onChange={(event) => setSpeciesName(event.target.value)}
              placeholder="Example: Indian Peafowl"
              className="mt-2 w-full rounded-lg border px-3 py-2 outline-none focus:ring-2"
            />
          </div>

          <div className="mt-5">
             <label
                htmlFor="notes"
                className="text-sm font-medium" >
              Notes
             </label>

            <textarea
              id="notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Add any details about the observation..."
              rows={4}
              className="mt-2 w-full rounded-lg border px-3 py-2 outline-none focus:ring-2"
            />
            </div>

            <div className="mt-5">
              <label
                htmlFor="observationDate"
                className="text-sm font-medium"
              >
              Observation Date
              </label>

              <input
                 id="observationDate"
                 type="date"
                 value={observationDate}
                 onChange={(event) => setObservationDate(event.target.value)}
                 className="mt-2 w-full rounded-lg border px-3 py-2 outline-none focus:ring-2"/>
            </div>

            <div className="mt-5">
                <label className="text-sm font-medium">
                Location
                </label>

                <Button
                type="button"
                className="mt-2 w-full"
                onClick={getLocation} >
                Get My Location
                </Button>

         {location && (
         <div className="mt-3 rounded-lg bg-gray-100 p-3 text-sm">
         <p>Latitude: {location.latitude}</p>
         <p>Longitude: {location.longitude}</p>
         </div>
         )}
    </div>
    <div className="mt-5">
  <label className="text-sm font-medium">
    Photo
  </label>

  <label
    htmlFor="photo"
    className="mt-2 flex w-full cursor-pointer items-center justify-center rounded-lg border border-dashed p-4 text-sm font-medium hover:bg-gray-50"
  >
    📷 Take / Upload Photo
  </label>

  <input
    id="photo"
    type="file"
    accept="image/*"
    capture="environment"
    className="hidden"
    onChange={(event) => {
  const file = event.target.files?.[0]

  if (file) {
  setPhoto(file)
  setPhotoCapturedAt(new Date().toISOString())
  }
}}
  />

  {photoUrl && (
  <img
    src={photoUrl}
    alt="Observation"
    className="mt-4 w-full rounded-lg"
  />
)}
</div>

   <Button
  type="button"
  className="mt-6 w-full"
  onClick={async () => {
    const recordedAt = new Date().toISOString()
    const observationAt = photoCapturedAt ?? recordedAt
    const id = await db.observations.add({
      speciesName,
      notes,
      observationDate,
      observationAt,
      recordedAt,
      latitude: location?.latitude ?? null,
      longitude: location?.longitude ?? null,
      photo,
    })

    setObservations((current) => [
      ...current,
      {
        id,
        speciesName,
        notes,
        observationDate,
        observationAt,
        recordedAt,
        latitude: location?.latitude ?? null,
        longitude: location?.longitude ?? null,
        photo,
        },
       ])

        setSaved(true)
       }}
       >
       Save Observation
       </Button>

    {saved && (
       <p className="mt-4 text-center text-sm font-medium">
       Observation saved successfully!
       </p>
    )}

    </section>
      )}

      <section className="mt-8 rounded-xl border p-5">
             <h3 className="text-lg font-semibold">
                My Observations
             </h3>

             {observations.length > 0 ? (
  <div className="mt-4 space-y-6">
    {observations.map((observation) => (
  <ObservationCard
    key={observation.id}
    observation={observation}
  />
))}
  </div>
) : (
  <p className="mt-2 text-sm text-gray-600">
    No observations recorded yet.
  </p>
)}
</section>
    </main>
  )
}

export default Home