import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { db, type Project, type Observation } from '@/db/database'
import { getJoinedProjectIds, toggleJoinedProject } from '@/lib/projectStorage'

export type MockUserRole = 'admin' | 'project_expert' | 'field_worker'

export function useProjectDetails(projectId?: string) {
  const navigate = useNavigate()
  const [project, setProject] = useState<Project | null>(null)
  const [projectObservations, setProjectObservations] = useState<Observation[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Mock role state for testing frontend permissions
  const [userRole, setUserRole] = useState<MockUserRole>(() => {
    const saved = localStorage.getItem('shrishti_mock_user_role')
    if (saved === 'admin' || saved === 'project_expert' || saved === 'field_worker') {
      return saved
    }
    return 'field_worker'
  })

  const canManageProject = userRole === 'admin' || userRole === 'project_expert'
  const [isJoined, setIsJoined] = useState(false)

  // Project editing modal state
  const [showEditModal, setShowEditModal] = useState(false)
  const [editName, setEditName] = useState('')
  const [editOrganization, setEditOrganization] = useState('')
  const [editTargetRegion, setEditTargetRegion] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editStatus, setEditStatus] = useState<'active' | 'completed' | 'archived'>('active')
  const [isSavingEdit, setIsSavingEdit] = useState(false)

  const isAuthorizedContributor = isJoined || canManageProject

  const loadData = useCallback(async () => {
    if (!projectId) return
    setIsLoading(true)
    try {
      setIsJoined(getJoinedProjectIds().includes(projectId))

      const proj = await db.projects.get(projectId)
      if (proj) {
        setProject(proj)
        setEditName(proj.name)
        setEditOrganization(proj.organization || '')
        setEditTargetRegion(proj.targetRegion || '')
        setEditDescription(proj.description || '')
        setEditStatus(proj.status || 'active')
      }

      // Load all observations belonging to this project (supporting scalar & array projectIds)
      const allObs = await db.observations.toArray()
      const obsList = allObs.filter(
        (obs) =>
          obs.projectId === projectId ||
          (obs.projectIds && obs.projectIds.includes(projectId))
      )
      const sortedObs = [...obsList].sort((a, b) => {
        const tA = new Date(b.createdAt || b.recordedAt || 0).getTime() || 0
        const tB = new Date(a.createdAt || a.recordedAt || 0).getTime() || 0
        return tA - tB
      })
      setProjectObservations(sortedObs)
    } finally {
      setIsLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleToggleJoin = () => {
    if (!projectId) return
    const updated = toggleJoinedProject(projectId)
    setIsJoined(updated.includes(projectId))
  }

  const handleRoleChange = (role: MockUserRole) => {
    setUserRole(role)
    localStorage.setItem('shrishti_mock_user_role', role)
  }

  const handleRecordObservationClick = () => {
    if (!projectId) return
    if (!isAuthorizedContributor) {
      const confirmJoin = window.confirm(
        'You need to be a project member to record observations for this project. Would you like to join now and proceed?'
      )
      if (confirmJoin) {
        toggleJoinedProject(projectId)
        setIsJoined(true)
        navigate(`/new-observation?projectId=${projectId}`)
      }
      return
    }
    navigate(`/new-observation?projectId=${projectId}`)
  }

  const handleSaveProjectEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!project || !editName.trim()) {
      alert('Please provide a valid project name.')
      return
    }

    setIsSavingEdit(true)
    try {
      const now = new Date().toISOString()
      await db.projects.update(project.id, {
        name: editName.trim(),
        organization: editOrganization.trim() || undefined,
        targetRegion: editTargetRegion.trim() || undefined,
        description: editDescription.trim() || undefined,
        status: editStatus,
        updatedAt: now,
        syncStatus: 'pending',
      })
      setShowEditModal(false)
      await loadData()
    } catch (err) {
      alert(`Failed to update project: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setIsSavingEdit(false)
    }
  }

  const handleDeleteProject = async () => {
    if (!project) return
    const confirmed = window.confirm(
      'Are you sure you want to delete this entire project and its associated local records? This action cannot be undone.'
    )
    if (!confirmed) return

    try {
      await db.projects.delete(project.id)
      const currentJoined = getJoinedProjectIds()
      if (currentJoined.includes(project.id)) {
        toggleJoinedProject(project.id)
      }
      navigate('/projects')
    } catch (err) {
      alert(`Failed to delete project: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  return {
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
  }
}

