import { useEffect, useState } from 'react'

interface Observation {
  id?: number
  speciesName: string
  notes: string
  observationDate: string
  observationAt: string
  recordedAt: string
  latitude: number | null
  longitude: number | null
  photo: Blob | null
}

interface ObservationCardProps {
  observation: Observation
}

function ObservationCard({ observation }: ObservationCardProps) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!(observation.photo instanceof Blob)) {
      setPhotoUrl(null)
      return
    }

    const url = URL.createObjectURL(observation.photo)
    setPhotoUrl(url)

    return () => {
      URL.revokeObjectURL(url)
    }
  }, [observation.photo])

  return (
    <div className="rounded-lg border p-4">
      <p>
        <strong>Species:</strong> {observation.speciesName}
      </p>

      <p>
        <strong>Notes:</strong> {observation.notes}
      </p>

      <p>
        <strong>Date:</strong> {observation.observationDate}
      </p>

      <p>
        <strong>Observed:</strong> {observation.observationAt}
      </p>

      <p>
        <strong>Recorded:</strong> {observation.recordedAt}
      </p>

      <p>
        <strong>Latitude:</strong> {observation.latitude}
      </p>

      <p>
        <strong>Longitude:</strong> {observation.longitude}
      </p>

      {photoUrl && (
        <img
          src={photoUrl}
          alt="Observation"
          className="mt-4 w-full rounded-lg"
        />
      )}
    </div>
  )
}

export default ObservationCard