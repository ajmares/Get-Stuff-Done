import { useState } from 'react'
import { ChevronLeft, ChevronRight, ExternalLink, GripVertical, X } from 'lucide-react'
import { ProjectsState, WeeklyState, Project, AccentColor, ProjectChecklistItem, ProjectPriority } from '@/lib/state'
import { getWeekISO, formatWeekRange, navigateWeek } from '@/lib/time'
import Drawer from '@/components/Drawer'
import { motion } from 'framer-motion'

interface WeeklyPageProps {
  projectsState: ProjectsState
  weeklyState: WeeklyState
  onWeeklyUpdate: (weekly: WeeklyState) => void
  onProjectsUpdate: (projects: ProjectsState) => void
  accentColor: AccentColor
}

const accentClasses = {
  indigo: {
    text: 'text-indigo-400',
    bg: 'bg-indigo-500/20',
    border: 'border-indigo-500/40',
  },
  blue: {
    text: 'text-blue-400',
    bg: 'bg-blue-500/20',
    border: 'border-blue-500/40',
  },
  purple: {
    text: 'text-purple-400',
    bg: 'bg-purple-500/20',
    border: 'border-purple-500/40',
  },
  fuchsia: {
    text: 'text-fuchsia-400',
    bg: 'bg-fuchsia-500/20',
    border: 'border-fuchsia-500/40',
  },
}

export default function WeeklyPage({
  projectsState,
  weeklyState,
  onWeeklyUpdate,
  onProjectsUpdate,
  accentColor,
}: WeeklyPageProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const currentWeekISO = getWeekISO(currentDate)
  const weekData = weeklyState[currentWeekISO] || { big3ProjectIds: [], updatedAt: Date.now() }
  const accent = accentClasses[accentColor]

  const handleProjectToggle = (projectId: string) => {
    const currentIds = weekData.big3ProjectIds
    const isSelected = currentIds.includes(projectId)

    let newIds: string[]
    if (isSelected) {
      newIds = currentIds.filter((id) => id !== projectId)
    } else {
      if (currentIds.length >= 3) {
        alert('You can only select up to 3 projects for the Big 3.')
        return
      }
      newIds = [...currentIds, projectId]
    }

    onWeeklyUpdate({
      ...weeklyState,
      [currentWeekISO]: {
        big3ProjectIds: newIds,
        updatedAt: Date.now(),
      },
    })
  }

  const handlePrevWeek = () => {
    setCurrentDate(navigateWeek(currentDate, 'prev'))
  }

  const handleNextWeek = () => {
    setCurrentDate(navigateWeek(currentDate, 'next'))
  }

  const big3Projects = weekData.big3ProjectIds
    .map((id) => projectsState.projects.find((p) => p.id === id))
    .filter((p): p is Project => p !== undefined)

  const availableProjects = projectsState.projects.filter(
    (p) => {
      // Exclude projects already in Big 3
      if (weekData.big3ProjectIds.includes(p.id)) return false
      // Exclude projects in "Done" column
      const column = projectsState.columns.find((c) => c.id === p.columnId)
      if (column) {
        const columnName = column.title.toLowerCase()
        if (columnName.includes('done') || columnName.includes('complete')) return false
      }
      return true
    },
  )

  const getProjectProgress = (project: Project) => {
    if (project.checklist.length === 0) return null
    const checked = project.checklist.filter((item) => item.checked).length
    const total = project.checklist.length
    return { checked, total, percentage: (checked / total) * 100 }
  }

  const getProjectColumn = (project: Project) => {
    return projectsState.columns.find((c) => c.id === project.columnId)?.title || 'Unknown'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Weekly Big 3</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={handlePrevWeek}
            className="rounded-lg border border-neutral-700 bg-neutral-800 p-2 transition-all hover:bg-neutral-700 hover:shadow-lg hover:shadow-black/30"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="text-sm font-medium">{formatWeekRange(currentDate)}</div>
          <button
            onClick={handleNextWeek}
            className="rounded-lg border border-neutral-700 bg-neutral-800 p-2 transition-all hover:bg-neutral-700 hover:shadow-lg hover:shadow-black/30"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {big3Projects.map((project, index) => {
          const progress = getProjectProgress(project)
          const column = getProjectColumn(project)
          const isCompleted = project.columnId === 'done' || (progress && progress.percentage === 100)

          return (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`rounded-2xl border bg-neutral-900 p-6 transition-all hover:shadow-lg hover:shadow-black/30 ${
                isCompleted ? `${accent.border} ${accent.bg} border-2` : 'border-neutral-800'
              }`}
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{project.title}</h3>
                  <p className="mt-1 text-xs text-neutral-400">{column}</p>
                </div>
                <button
                  onClick={() => setSelectedProject(project)}
                  className="rounded-lg p-1 text-neutral-400 transition-all hover:bg-neutral-800 hover:text-neutral-100"
                >
                  <ExternalLink className="h-4 w-4" />
                </button>
              </div>

              {progress ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-400">Progress</span>
                    <span className="font-medium">
                      {progress.checked}/{progress.total}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-neutral-800">
                    <motion.div
                      key={`${project.id}-${progress.checked}-${progress.total}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${progress.percentage}%` }}
                      transition={{ duration: 0.3 }}
                      className={`h-full ${
                        progress.percentage === 100
                          ? 'bg-green-500'
                          : progress.percentage >= 50
                            ? 'bg-blue-500'
                            : progress.percentage > 0
                              ? 'bg-yellow-500'
                              : 'bg-neutral-700'
                      }`}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-400">Progress</span>
                    <span className="font-medium text-neutral-500">No tasks</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-neutral-800">
                    <div className="h-full w-0 bg-neutral-700" />
                  </div>
                </div>
              )}

              {project.description && (
                <p className="mt-4 line-clamp-2 text-sm text-neutral-400">{project.description}</p>
              )}

              <button
                onClick={() => handleProjectToggle(project.id)}
                className="mt-4 w-full rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2 text-sm transition-all hover:bg-neutral-700"
              >
                Remove from Big 3
              </button>
            </motion.div>
          )
        })}

        {big3Projects.length < 3 && (
          <div className="rounded-2xl border border-dashed border-neutral-700 bg-neutral-900/50 p-6">
            <h3 className="mb-4 text-lg font-semibold text-neutral-400">Select Projects</h3>
            <div className="space-y-2">
              {availableProjects.length === 0 ? (
                <p className="text-sm text-neutral-500">No available projects</p>
              ) : (
                availableProjects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => handleProjectToggle(project.id)}
                    className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2 text-left text-sm transition-all hover:bg-neutral-700"
                  >
                    {project.title}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {big3Projects.length === 0 && (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-12 text-center">
          <p className="text-neutral-400">No projects selected for this week.</p>
          <p className="mt-2 text-sm text-neutral-500">
            Select up to 3 projects from your board to focus on this week.
          </p>
        </div>
      )}

      {selectedProject && (
        <ProjectDrawer
          project={selectedProject}
          onUpdate={(updatedProject) => {
            // Update the project in the projects state
            const updatedProjects = projectsState.projects.map((p) =>
              p.id === updatedProject.id ? updatedProject : p,
            )
            onProjectsUpdate({
              ...projectsState,
              projects: updatedProjects,
            })
            // Update local selected project to reflect changes
            setSelectedProject(updatedProject)
          }}
          onDelete={() => {
            // Remove from projects and weekly if deleted
            const updatedProjects = projectsState.projects.filter((p) => p.id !== selectedProject.id)
            const updatedWeekly = {
              ...weeklyState,
              [currentWeekISO]: {
                big3ProjectIds: weekData.big3ProjectIds.filter((id) => id !== selectedProject.id),
                updatedAt: Date.now(),
              },
            }
            onProjectsUpdate({
              ...projectsState,
              projects: updatedProjects,
            })
            onWeeklyUpdate(updatedWeekly)
            setSelectedProject(null)
          }}
          onClose={() => setSelectedProject(null)}
          accentColor={accentColor}
        />
      )}
    </div>
  )
}

function ProjectDrawer({
  project,
  onUpdate,
  onDelete,
  onClose,
  accentColor,
}: {
  project: Project
  onUpdate: (project: Project) => void
  onDelete: () => void
  onClose: () => void
  accentColor: AccentColor
}) {
  const [title, setTitle] = useState(project.title)
  const [description, setDescription] = useState(project.description)
  const [checklist, setChecklist] = useState(project.checklist)
  const [tags, setTags] = useState(project.tags.join(', '))
  const [priority, setPriority] = useState<ProjectPriority>(project.priority)
  const [newChecklistItem, setNewChecklistItem] = useState('')
  const [draggedItem, setDraggedItem] = useState<string | null>(null)

  const handleSave = () => {
    onUpdate({
      ...project,
      title,
      description,
      checklist,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      priority,
      updatedAt: Date.now(),
    })
  }

  const handleAddChecklistItem = () => {
    if (newChecklistItem.trim()) {
      const newItem: ProjectChecklistItem = {
        id: `item-${Date.now()}`,
        text: newChecklistItem.trim(),
        checked: false,
      }
      const updatedChecklist = [...checklist, newItem]
      setChecklist(updatedChecklist)
      setNewChecklistItem('')
      // Save immediately
      onUpdate({
        ...project,
        checklist: updatedChecklist,
        updatedAt: Date.now(),
      })
    }
  }

  const handleDeleteChecklistItem = (id: string) => {
    const updatedChecklist = checklist.filter((item) => item.id !== id)
    setChecklist(updatedChecklist)
    // Save immediately
    onUpdate({
      ...project,
      checklist: updatedChecklist,
      updatedAt: Date.now(),
    })
  }

  const handleToggleChecklistItem = (id: string) => {
    const updatedChecklist = checklist.map((item) =>
      item.id === id ? { ...item, checked: !item.checked } : item,
    )
    setChecklist(updatedChecklist)
    // Save immediately
    onUpdate({
      ...project,
      checklist: updatedChecklist,
      updatedAt: Date.now(),
    })
  }

  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    setDraggedItem(itemId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    if (!draggedItem || draggedItem === targetId) return

    const draggedIndex = checklist.findIndex((item) => item.id === draggedItem)
    const targetIndex = checklist.findIndex((item) => item.id === targetId)

    const newChecklist = [...checklist]
    const [removed] = newChecklist.splice(draggedIndex, 1)
    newChecklist.splice(targetIndex, 0, removed)

    setChecklist(newChecklist)
    setDraggedItem(null)
    // Save immediately after reordering
    onUpdate({
      ...project,
      checklist: newChecklist,
      updatedAt: Date.now(),
    })
  }

  // Save on drawer close
  const handleClose = () => {
    handleSave()
    onClose()
  }

  return (
    <Drawer title="Project Details" onClose={handleClose} accentColor={accentColor}>
      <div className="space-y-6">
        <div>
          <label className="mb-2 block text-sm font-medium">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleSave}
            className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={handleSave}
            rows={6}
            className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2 focus:border-indigo-500 focus:outline-none"
            placeholder="Add project description..."
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Checklist</label>
          <div className="space-y-2">
            {checklist.map((item) => (
              <div
                key={item.id}
                draggable
                onDragStart={(e) => handleDragStart(e, item.id)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, item.id)}
                className="flex items-center gap-2 rounded-lg border border-neutral-700 bg-neutral-800 p-2"
              >
                <GripVertical className="h-4 w-4 cursor-move text-neutral-500" />
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={() => handleToggleChecklistItem(item.id)}
                  className="h-4 w-4 rounded"
                />
                <span className={item.checked ? 'flex-1 text-neutral-400 line-through' : 'flex-1'}>
                  {item.text}
                </span>
                <button
                  onClick={() => handleDeleteChecklistItem(item.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            <div className="flex gap-2">
              <input
                type="text"
                value={newChecklistItem}
                onChange={(e) => setNewChecklistItem(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddChecklistItem()}
                placeholder="Add checklist item..."
                className="flex-1 rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
              <button
                onClick={handleAddChecklistItem}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Tags (comma-separated)</label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            onBlur={handleSave}
            className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2 focus:border-indigo-500 focus:outline-none"
            placeholder="tag1, tag2, tag3"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Priority</label>
          <select
            value={priority}
            onChange={(e) => {
              const newPriority = e.target.value as ProjectPriority
              setPriority(newPriority)
              // Save immediately
              onUpdate({
                ...project,
                priority: newPriority,
                updatedAt: Date.now(),
              })
            }}
            className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2 focus:border-indigo-500 focus:outline-none"
          >
            <option value="Low">Low</option>
            <option value="Med">Med</option>
            <option value="High">High</option>
          </select>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            onClick={onDelete}
            className="flex-1 rounded-lg border border-red-700 bg-red-900/20 px-4 py-2 text-sm text-red-400 transition-all hover:bg-red-900/30"
          >
            Delete Project
          </button>
        </div>
      </div>
    </Drawer>
  )
}

