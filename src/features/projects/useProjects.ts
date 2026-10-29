import { useEffect, useState } from 'react'
import { db, type Project } from '@/db/database'
import {
  getJoinedProjectIds,
  toggleJoinedProject,
  countProjectObservations,
} from '@/lib/projectStorage'
import { generateId } from '@/lib/utils'

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [joinedIds, setJoinedIds] = useState<string[]>(getJoinedProjectIds())
  const [activeTab, setActiveTab] = useState<'all' | 'my'>('all')
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null)
  const [observationCounts, setObservationCounts] = useState<Record<string, number>>({})
  const [showAddForm, setShowAddForm] = useState(false)

  // New project form state
  const [name, setName] = useState('')
  const [organization, setOrganization] = useState('')
  const [targetRegion, setTargetRegion] = useState('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load projects and counts from IndexedDB
  const loadProjects = async () => {
    setJoinedIds(getJoinedProjectIds())
    const list = await db.projects.toArray()
    setProjects(list.reverse())

    const allObservations = await db.observations.toArray()
    const obsCounts: Record<string, number> = {}
    for (const p of list) {
      obsCounts[p.id] = countProjectObservations(p.id, allObservations)
    }
    setObservationCounts(obsCounts)
  }

  useEffect(() => {
    loadProjects()
  }, [])

  // Create a new project
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      alert('Please enter a project name.')
      return
    }

    setIsSubmitting(true)
    try {
      const newId = generateId()
      const now = new Date().toISOString()
      const newProj: Project = {
        id: newId,
        name: name.trim(),
        organization: organization.trim() || undefined,
        targetRegion: targetRegion.trim() || undefined,
        description: description.trim() || undefined,
        status: 'active',
        createdAt: now,
        updatedAt: now,
        syncStatus: 'pending',
      }

      await db.projects.add(newProj)
      setName('')
      setOrganization('')
      setTargetRegion('')
      setDescription('')
      setShowAddForm(false)
      await loadProjects()
    } catch (err) {
      alert(`Failed to create project: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Create quick sample project (helpful for first-time use)
  const handleCreateSampleProject = async () => {
    const newId = generateId()
    const now = new Date().toISOString()
    const sampleProj: Project = {
      id: newId,
      name: 'Thiruvananthapuram City Biodiversity Register',
      organization: 'Kerala State Biodiversity Board',
      targetRegion: 'Thiruvananthapuram Municipal Corporation',
      description:
        'Comprehensive municipal ward-level documentation of urban flora, fauna, and local biodiversity.',
      status: 'active',
      createdAt: now,
      updatedAt: now,
      syncStatus: 'pending',
    }

    await db.projects.add(sampleProj)
    await loadProjects()
  }

  // Delete project and update state
  const handleDeleteProject = async (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation()
    const confirmed = window.confirm(
      'Are you sure you want to delete this project? Associated local project records will be removed.'
    )
    if (!confirmed) return

    try {
      await db.projects.delete(projectId)
      const currentJoined = getJoinedProjectIds()
      if (currentJoined.includes(projectId)) {
        toggleJoinedProject(projectId)
      }
      await loadProjects()
    } catch (err) {
      alert(`Failed to delete project: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  const hasProjects = projects.length > 0

  const displayedProjects =
    activeTab === 'my'
      ? projects.filter((p) => joinedIds.includes(p.id))
      : projects

  return {
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
  }
}

