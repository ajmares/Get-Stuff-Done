import { useState } from 'react'
import { Plus, X, GripVertical } from 'lucide-react'
import { ProjectsState, Project, Column, ProjectChecklistItem, ProjectPriority, AccentColor } from '@/lib/state'
import Drawer from '@/components/Drawer'
import ConfirmDialog from '@/components/ConfirmDialog'
import { motion } from 'framer-motion'

interface ProjectsPageProps {
  state: ProjectsState
  onUpdate: (state: ProjectsState) => void
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

export default function ProjectsPage({ state, onUpdate, accentColor }: ProjectsPageProps) {
  const [draggedProject, setDraggedProject] = useState<Project | null>(null)
  const [draggedOverColumn, setDraggedOverColumn] = useState<string | null>(null)
  const [draggedOverProject, setDraggedOverProject] = useState<Project | null>(null)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [showDeleteColumn, setShowDeleteColumn] = useState<Column | null>(null)
  const [showDeleteProject, setShowDeleteProject] = useState<Project | null>(null)
  const accent = accentClasses[accentColor]

  const sortedColumns = [...state.columns].sort((a, b) => a.order - b.order)

  const handleDragStart = (e: React.DragEvent, project: Project) => {
    setDraggedProject(project)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDraggedOverColumn(columnId)
  }

  const handleDragLeave = () => {
    setDraggedOverColumn(null)
  }

  const handleDrop = (e: React.DragEvent, targetColumnId: string, targetProject?: Project) => {
    e.preventDefault()
    if (!draggedProject) return

    const targetColumn = state.columns.find((c) => c.id === targetColumnId)
    if (!targetColumn) return

    // If dropping on another project in the same column, reorder within column
    if (targetProject && draggedProject.columnId === targetColumnId && draggedProject.id !== targetProject.id) {
      const columnProjects = state.projects
        .filter((p) => p.columnId === targetColumnId)
        .sort((a, b) => a.order - b.order)

      const draggedIndex = columnProjects.findIndex((p) => p.id === draggedProject.id)
      const targetIndex = columnProjects.findIndex((p) => p.id === targetProject.id)

      const reorderedProjects = [...columnProjects]
      const [removed] = reorderedProjects.splice(draggedIndex, 1)
      reorderedProjects.splice(targetIndex, 0, removed)

      // Update order values
      const updatedProjects = state.projects.map((p) => {
        const reorderedProject = reorderedProjects.find((rp) => rp.id === p.id)
        if (reorderedProject) {
          return { ...p, order: reorderedProjects.indexOf(reorderedProject) }
        }
        return p
      })

      // Update column projectIds order
      const updatedColumn = {
        ...targetColumn,
        projectIds: reorderedProjects.map((p) => p.id),
      }

      onUpdate({
        ...state,
        columns: state.columns.map((c) => (c.id === targetColumnId ? updatedColumn : c)),
        projects: updatedProjects,
      })
    } else {
      // Moving to different column (existing functionality)
      const updatedColumns = state.columns.map((col) => {
        if (col.id === draggedProject.columnId) {
          return { ...col, projectIds: col.projectIds.filter((id) => id !== draggedProject.id) }
        }
        if (col.id === targetColumnId) {
          return { ...col, projectIds: [...col.projectIds, draggedProject.id] }
        }
        return col
      })

      // Update project
      const updatedProjects = state.projects.map((p) =>
        p.id === draggedProject.id
          ? { ...p, columnId: targetColumnId, order: targetColumn.projectIds.length }
          : p,
      )

      onUpdate({
        ...state,
        columns: updatedColumns,
        projects: updatedProjects,
      })
    }

    setDraggedProject(null)
    setDraggedOverColumn(null)
    setDraggedOverProject(null)
  }

  const handleAddColumn = () => {
    const newColumn: Column = {
      id: `column-${Date.now()}`,
      title: 'New Column',
      order: state.columns.length,
      projectIds: [],
    }
    onUpdate({
      ...state,
      columns: [...state.columns, newColumn],
    })
  }

  const handleUpdateColumn = (columnId: string, updates: Partial<Column>) => {
    onUpdate({
      ...state,
      columns: state.columns.map((c) => (c.id === columnId ? { ...c, ...updates } : c)),
    })
  }

  const handleDeleteColumn = (column: Column) => {
    if (column.projectIds.length > 0) {
      setShowDeleteColumn(column)
      return
    }
    const updatedColumns = state.columns.filter((c) => c.id !== column.id)
    onUpdate({ ...state, columns: updatedColumns })
  }

  const handleAddProject = (columnId: string) => {
    const newProject: Project = {
      id: `project-${Date.now()}`,
      title: 'New Project',
      description: '',
      checklist: [],
      tags: [],
      priority: 'Med',
      columnId,
      order: state.columns.find((c) => c.id === columnId)?.projectIds.length || 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    const column = state.columns.find((c) => c.id === columnId)
    if (column) {
      onUpdate({
        ...state,
        projects: [...state.projects, newProject],
        columns: state.columns.map((c) =>
          c.id === columnId ? { ...c, projectIds: [...c.projectIds, newProject.id] } : c,
        ),
      })
      setSelectedProject(newProject)
    }
  }

  const handleUpdateProject = (project: Project) => {
    onUpdate({
      ...state,
      projects: state.projects.map((p) => (p.id === project.id ? project : p)),
    })
  }

  const handleDeleteProject = (project: Project) => {
    const updatedProjects = state.projects.filter((p) => p.id !== project.id)
    const updatedColumns = state.columns.map((col) => ({
      ...col,
      projectIds: col.projectIds.filter((id) => id !== project.id),
    }))
    onUpdate({
      ...state,
      projects: updatedProjects,
      columns: updatedColumns,
    })
    if (selectedProject?.id === project.id) {
      setSelectedProject(null)
    }
  }

  const getProjectProgress = (project: Project) => {
    if (project.checklist.length === 0) return null
    const checked = project.checklist.filter((item) => item.checked).length
    return `${checked}/${project.checklist.length}`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Projects</h1>
        <button
          onClick={handleAddColumn}
          className="flex items-center gap-2 rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2 text-sm transition-all hover:bg-neutral-700 hover:shadow-lg hover:shadow-black/30"
        >
          <Plus className="h-4 w-4" />
          Add Column
        </button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {sortedColumns.map((column) => {
          const columnProjects = state.projects
            .filter((p) => p.columnId === column.id)
            .sort((a, b) => a.order - b.order)

          // Column-specific colors
          const getColumnColor = (columnId: string) => {
            const id = columnId.toLowerCase()
            if (id.includes('backlog')) return 'bg-blue-950/30 border-blue-800/30'
            if (id.includes('progress') || id.includes('in-progress')) return 'bg-yellow-950/30 border-yellow-800/30'
            if (id.includes('done') || id.includes('complete')) return 'bg-green-950/30 border-green-800/30'
            if (id.includes('blocked')) return 'bg-red-950/30 border-red-800/30'
            return 'bg-neutral-900 border-neutral-800'
          }

          const columnColor = getColumnColor(column.id)

          return (
            <div
              key={column.id}
              className={`flex min-w-[300px] flex-col rounded-2xl border p-4 transition-all ${columnColor} ${
                draggedOverColumn === column.id
                  ? `${accent.border} ${accent.bg} border-2`
                  : ''
              }`}
              onDragOver={(e) => handleDragOver(e, column.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              <ColumnHeader
                column={column}
                onUpdate={(updates) => handleUpdateColumn(column.id, updates)}
                onDelete={() => handleDeleteColumn(column)}
              />
              <div className="mt-4 space-y-2">
                {columnProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    progress={getProjectProgress(project)}
                    onDragStart={(e) => handleDragStart(e, project)}
                    onDragOver={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setDraggedOverProject(project)
                    }}
                    onDragLeave={() => {
                      setDraggedOverProject(null)
                    }}
                    onDrop={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleDrop(e, column.id, project)
                    }}
                    onClick={() => setSelectedProject(project)}
                    accentColor={accentColor}
                    isDraggedOver={draggedOverProject?.id === project.id && draggedProject?.id !== project.id}
                  />
                ))}
                <button
                  onClick={() => handleAddProject(column.id)}
                  className="w-full rounded-lg border border-dashed border-neutral-700 bg-neutral-800/50 px-4 py-3 text-sm text-neutral-400 transition-all hover:border-neutral-600 hover:bg-neutral-800 hover:text-neutral-300"
                >
                  <Plus className="mx-auto h-4 w-4" />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {selectedProject && (
        <ProjectDrawer
          project={selectedProject}
          onUpdate={handleUpdateProject}
          onDelete={() => setShowDeleteProject(selectedProject)}
          onClose={() => setSelectedProject(null)}
          accentColor={accentColor}
        />
      )}

      {showDeleteColumn && (
        <ConfirmDialog
          title="Delete Column"
          message={`Are you sure you want to delete "${showDeleteColumn.title}"? It contains ${showDeleteColumn.projectIds.length} project(s).`}
          confirmLabel="Delete"
          onConfirm={() => {
            handleDeleteColumn(showDeleteColumn)
            setShowDeleteColumn(null)
          }}
          onCancel={() => setShowDeleteColumn(null)}
          variant="danger"
        />
      )}

      {showDeleteProject && (
        <ConfirmDialog
          title="Delete Project"
          message={`Are you sure you want to delete "${showDeleteProject.title}"?`}
          confirmLabel="Delete"
          onConfirm={() => {
            handleDeleteProject(showDeleteProject)
            setShowDeleteProject(null)
            setSelectedProject(null)
          }}
          onCancel={() => setShowDeleteProject(null)}
          variant="danger"
        />
      )}
    </div>
  )
}

function ColumnHeader({
  column,
  onUpdate,
  onDelete,
}: {
  column: Column
  onUpdate: (updates: Partial<Column>) => void
  onDelete: () => void
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(column.title)

  const handleSave = () => {
    if (title.trim()) {
      onUpdate({ title: title.trim() })
      setIsEditing(false)
    }
  }

  return (
    <div className="flex items-center justify-between">
      {isEditing ? (
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          className="flex-1 rounded-lg border border-neutral-700 bg-neutral-800 px-2 py-1 text-sm focus:border-indigo-500 focus:outline-none"
          autoFocus
        />
      ) : (
        <h2
          className="flex-1 cursor-pointer text-lg font-semibold"
          onClick={() => setIsEditing(true)}
        >
          {column.title}
        </h2>
      )}
      <button
        onClick={onDelete}
        className="rounded-lg p-1 text-neutral-400 transition-all hover:bg-neutral-800 hover:text-red-400"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

function ProjectCard({
  project,
  progress,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onClick,
  accentColor,
  isDraggedOver,
}: {
  project: Project
  progress: string | null
  onDragStart: (e: React.DragEvent) => void
  onDragOver: (e: React.DragEvent) => void
  onDragLeave: () => void
  onDrop: (e: React.DragEvent) => void
  onClick: () => void
  accentColor: AccentColor
  isDraggedOver?: boolean
}) {
  const accent = accentClasses[accentColor]
  const priorityColors = {
    Low: 'bg-blue-500',
    Med: 'bg-orange-500',
    High: 'bg-red-500',
  }

  return (
    <motion.div
      draggable
      onDragStart={onDragStart as any}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={onClick}
      whileHover={{ scale: 1.02, y: -2 }}
      className={`cursor-pointer rounded-2xl border p-4 transition-all hover:shadow-lg hover:shadow-black/30 ${
        isDraggedOver
          ? 'border-blue-500/50 bg-blue-900/20'
          : 'border-neutral-700/50 bg-neutral-800'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <h3 className="font-medium">{project.title}</h3>
          {progress && (
            <div className="mt-1 text-xs text-neutral-400">
              Checklist: {progress}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {project.tags.length > 0 && (
            <div className="flex gap-1">
              {project.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className={`rounded px-1.5 py-0.5 text-xs ${accent.bg} ${accent.text}`}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          <div
            className={`h-2 w-2 rounded-full ${priorityColors[project.priority]}`}
            title={project.priority}
          />
        </div>
      </div>
    </motion.div>
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

