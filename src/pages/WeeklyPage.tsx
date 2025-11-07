import { useState } from 'react'
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react'
import { ProjectsState, WeeklyState, Project, AccentColor } from '@/lib/state'
import { getWeekISO, formatWeekRange, navigateWeek } from '@/lib/time'
import Drawer from '@/components/Drawer'
import { motion } from 'framer-motion'

interface WeeklyPageProps {
  projectsState: ProjectsState
  weeklyState: WeeklyState
  onWeeklyUpdate: (weekly: WeeklyState) => void
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
    (p) => !weekData.big3ProjectIds.includes(p.id),
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

              {progress && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-400">Progress</span>
                    <span className="font-medium">
                      {progress.checked}/{progress.total}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-neutral-800">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress.percentage}%` }}
                      transition={{ duration: 0.5 }}
                      className={`h-full ${
                        progress.percentage === 100 ? 'bg-green-500' : accent.text.replace('text-', 'bg-')
                      }`}
                    />
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
          projectsState={projectsState}
          onClose={() => setSelectedProject(null)}
          accentColor={accentColor}
        />
      )}
    </div>
  )
}

function ProjectDrawer({
  project,
  projectsState,
  onClose,
  accentColor,
}: {
  project: Project
  projectsState: ProjectsState
  onClose: () => void
  accentColor: AccentColor
}) {
  const column = projectsState.columns.find((c) => c.id === project.columnId)?.title || 'Unknown'
  const progress = project.checklist.length > 0
    ? {
        checked: project.checklist.filter((item) => item.checked).length,
        total: project.checklist.length,
      }
    : null

  return (
    <Drawer title="Project Details" onClose={onClose} accentColor={accentColor}>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold">{project.title}</h2>
          <p className="mt-1 text-sm text-neutral-400">Column: {column}</p>
        </div>

        {project.description && (
          <div>
            <h3 className="mb-2 text-sm font-medium">Description</h3>
            <p className="text-sm text-neutral-300 whitespace-pre-wrap">{project.description}</p>
          </div>
        )}

        {project.checklist.length > 0 && (
          <div>
            <h3 className="mb-2 text-sm font-medium">
              Checklist {progress && `(${progress.checked}/${progress.total})`}
            </h3>
            <div className="space-y-2">
              {project.checklist.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center gap-2 rounded-lg border border-neutral-700 bg-neutral-800 p-2 ${
                    item.checked ? 'opacity-60' : ''
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={item.checked}
                    readOnly
                    className="h-4 w-4 rounded"
                  />
                  <span className={item.checked ? 'line-through text-neutral-400' : ''}>
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {project.tags.length > 0 && (
          <div>
            <h3 className="mb-2 text-sm font-medium">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-lg border border-neutral-700 bg-neutral-800 px-2 py-1 text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        <div>
          <h3 className="mb-2 text-sm font-medium">Priority</h3>
          <span
            className={`rounded-lg px-3 py-1 text-xs font-medium ${
              project.priority === 'High'
                ? 'bg-red-600/20 text-red-400'
                : project.priority === 'Med'
                  ? 'bg-yellow-600/20 text-yellow-400'
                  : 'bg-neutral-600/20 text-neutral-400'
            }`}
          >
            {project.priority}
          </span>
        </div>
      </div>
    </Drawer>
  )
}

