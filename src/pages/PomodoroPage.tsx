import { useState, useEffect, useRef } from 'react'
import { Play, Pause, Square, SkipForward, Settings, GripVertical } from 'lucide-react'
import { PomodoroState, PomodoroTask, PomodoroMode } from '@/lib/state'
import { formatTime } from '@/lib/time'
import { useInterval } from '@/hooks/useInterval'
import Drawer from '@/components/Drawer'
import { motion } from 'framer-motion'

interface PomodoroPageProps {
  state: PomodoroState
  onUpdate: (state: PomodoroState) => void
}

const modeLabels: Record<PomodoroMode, string> = {
  work: 'Work',
  shortBreak: 'Short Break',
  longBreak: 'Long Break',
}

export default function PomodoroPage({ state, onUpdate }: PomodoroPageProps) {
  const [showSettings, setShowSettings] = useState(false)
  const previousRemaining = useRef(state.remaining)
  const audioContextRef = useRef<AudioContext | null>(null)

  // Update tab title with countdown
  useEffect(() => {
    if (state.isRunning && state.remaining > 0) {
      const timeString = formatTime(state.remaining)
      const modeLabel = modeLabels[state.mode]
      document.title = `${timeString} - ${modeLabel} | Get Stuff Done`
    } else {
      document.title = 'Get Stuff Done'
    }

    // Cleanup on unmount
    return () => {
      document.title = 'Get Stuff Done'
    }
  }, [state.remaining, state.isRunning, state.mode])

  // Play sound when timer completes
  useEffect(() => {
    if (previousRemaining.current > 0 && state.remaining === 0 && state.isRunning) {
      playCompletionSound()
    }
    previousRemaining.current = state.remaining
  }, [state.remaining, state.isRunning])

  const playCompletionSound = () => {
    try {
      // Create audio context if it doesn't exist
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      }

      const audioContext = audioContextRef.current
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      // Create a pleasant beep sound
      oscillator.frequency.value = 800 // Higher pitch
      oscillator.type = 'sine'

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.5)

      // Play a second beep after a short delay
      setTimeout(() => {
        const oscillator2 = audioContext.createOscillator()
        const gainNode2 = audioContext.createGain()

        oscillator2.connect(gainNode2)
        gainNode2.connect(audioContext.destination)

        oscillator2.frequency.value = 600
        oscillator2.type = 'sine'

        gainNode2.gain.setValueAtTime(0.3, audioContext.currentTime)
        gainNode2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

        oscillator2.start(audioContext.currentTime)
        oscillator2.stop(audioContext.currentTime + 0.5)
      }, 200)
    } catch (error) {
      console.error('Error playing completion sound:', error)
    }
  }

  useInterval(
    () => {
      if (state.remaining > 0) {
        onUpdate({ ...state, remaining: state.remaining - 1 })
      } else {
        handleComplete()
      }
    },
    state.isRunning ? 1000 : null,
  )

  const handleComplete = () => {
    const newCompletedIntervals = state.completedIntervals + 1
    let nextMode: PomodoroMode = 'work'
    let nextDuration = state.settings.workDuration * 60

    if (state.mode === 'work') {
      const shouldLongBreak = newCompletedIntervals % state.settings.intervalsBeforeLong === 0
      nextMode = shouldLongBreak ? 'longBreak' : 'shortBreak'
      nextDuration = shouldLongBreak
        ? state.settings.longBreakDuration * 60
        : state.settings.shortBreakDuration * 60
    } else {
      nextMode = 'work'
      nextDuration = state.settings.workDuration * 60
    }

    const newState: PomodoroState = {
      ...state,
      mode: nextMode,
      remaining: nextDuration,
      isRunning: state.settings.autoStartNext,
      completedIntervals: newCompletedIntervals,
    }

    onUpdate(newState)
  }

  const handlePlayPause = () => {
    onUpdate({ ...state, isRunning: !state.isRunning })
  }

  const handleStop = () => {
    const duration =
      state.mode === 'work'
        ? state.settings.workDuration * 60
        : state.mode === 'shortBreak'
          ? state.settings.shortBreakDuration * 60
          : state.settings.longBreakDuration * 60
    onUpdate({ ...state, isRunning: false, remaining: duration })
  }

  const handleSkip = () => {
    handleComplete()
  }

  const handleTaskSelect = (taskId: string | null) => {
    onUpdate({ ...state, currentTaskId: taskId })
  }

  const handleTaskUpdate = (task: PomodoroTask) => {
    let updatedTasks = state.tasks.map((t) => (t.id === task.id ? task : t))
    
    // Check if completion status changed
    const previousTask = state.tasks.find((t) => t.id === task.id)
    const completionChanged = previousTask && previousTask.completed !== task.completed
    
    if (completionChanged) {
      // Separate completed and incomplete tasks
      const incompleteTasks = updatedTasks.filter((t) => !t.completed)
      const completedTasks = updatedTasks.filter((t) => t.completed)
      
      // Reorder: incomplete first, then completed
      const reorderedTasks = [
        ...incompleteTasks.map((t, index) => ({ ...t, order: index })),
        ...completedTasks.map((t, index) => ({ ...t, order: incompleteTasks.length + index })),
      ]
      
      updatedTasks = reorderedTasks
    }
    
    onUpdate({ ...state, tasks: updatedTasks })
  }

  const handleTaskDelete = (taskId: string) => {
    const tasks = state.tasks.filter((t) => t.id !== taskId)
    const currentTaskId = state.currentTaskId === taskId ? null : state.currentTaskId
    onUpdate({ ...state, tasks, currentTaskId })
  }

  const handleTaskAdd = (title: string) => {
    // Shift all existing tasks down by 1, add new task at top (order 0)
    const shiftedTasks = state.tasks.map((t) => ({ ...t, order: t.order + 1 }))
    const newTask: PomodoroTask = {
      id: Date.now().toString(),
      title,
      notes: '',
      completed: false,
      order: 0, // New tasks go to the top
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    onUpdate({ ...state, tasks: [newTask, ...shiftedTasks] })
  }

  const handleTaskReorder = (tasks: PomodoroTask[]) => {
    onUpdate({ ...state, tasks })
  }

  return (
    <div className="space-y-8">
      {/* Timer */}
      <div className="flex flex-col items-center justify-center space-y-6">
        <div className="text-sm font-medium text-neutral-400">{modeLabels[state.mode]}</div>
        <div className="text-7xl font-mono font-bold">
          {formatTime(state.remaining)}
        </div>
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePlayPause}
            className="rounded-2xl bg-indigo-600 px-6 py-3 text-white shadow-lg shadow-black/30 transition-all hover:shadow-xl"
          >
            {state.isRunning ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleStop}
            className="rounded-2xl border border-neutral-700 bg-neutral-800 px-6 py-3 transition-all hover:bg-neutral-700 hover:shadow-lg hover:shadow-black/30"
          >
            <Square className="h-5 w-5" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSkip}
            className="rounded-2xl border border-neutral-700 bg-neutral-800 px-6 py-3 transition-all hover:bg-neutral-700 hover:shadow-lg hover:shadow-black/30"
          >
            <SkipForward className="h-5 w-5" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowSettings(true)}
            className="rounded-2xl border border-neutral-700 bg-neutral-800 px-6 py-3 transition-all hover:bg-neutral-700 hover:shadow-lg hover:shadow-black/30"
          >
            <Settings className="h-5 w-5" />
          </motion.button>
        </div>
        <div className="text-sm text-neutral-500">
          Completed: {state.completedIntervals} {state.completedIntervals === 1 ? 'interval' : 'intervals'}
        </div>
      </div>

      {/* Task List */}
      <TaskList
        tasks={state.tasks}
        currentTaskId={state.currentTaskId}
        onTaskSelect={handleTaskSelect}
        onTaskUpdate={handleTaskUpdate}
        onTaskDelete={handleTaskDelete}
        onTaskAdd={handleTaskAdd}
        onTaskReorder={handleTaskReorder}
      />

      {showSettings && (
        <Drawer
          title="Pomodoro Settings"
          onClose={() => setShowSettings(false)}
          accentColor="indigo"
        >
          <SettingsPanel
            settings={state.settings}
            onUpdate={(settings) => onUpdate({ ...state, settings })}
          />
        </Drawer>
      )}
    </div>
  )
}

function TaskList({
  tasks,
  currentTaskId,
  onTaskSelect,
  onTaskUpdate,
  onTaskDelete,
  onTaskAdd,
  onTaskReorder,
}: {
  tasks: PomodoroTask[]
  currentTaskId: string | null
  onTaskSelect: (id: string | null) => void
  onTaskUpdate: (task: PomodoroTask) => void
  onTaskDelete: (id: string) => void
  onTaskAdd: (title: string) => void
  onTaskReorder: (tasks: PomodoroTask[]) => void
}) {
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingNotes, setEditingNotes] = useState<string>('')
  const [draggedTask, setDraggedTask] = useState<PomodoroTask | null>(null)

  const sortedTasks = [...tasks].sort((a, b) => a.order - b.order)

  const handleAdd = () => {
    if (newTaskTitle.trim()) {
      onTaskAdd(newTaskTitle.trim())
      setNewTaskTitle('')
    }
  }

  const handleEditNotes = (task: PomodoroTask) => {
    setEditingId(task.id)
    setEditingNotes(task.notes)
  }

  const handleSaveNotes = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId)
    if (task) {
      onTaskUpdate({ ...task, notes: editingNotes })
    }
    setEditingId(null)
  }

  const handleDragStart = (e: React.DragEvent, task: PomodoroTask) => {
    setDraggedTask(task)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, targetTask: PomodoroTask) => {
    e.preventDefault()
    if (!draggedTask || draggedTask.id === targetTask.id) {
      setDraggedTask(null)
      return
    }

    const updatedTasks = [...sortedTasks]
    const draggedIndex = updatedTasks.findIndex((t) => t.id === draggedTask.id)
    const targetIndex = updatedTasks.findIndex((t) => t.id === targetTask.id)

    updatedTasks.splice(draggedIndex, 1)
    updatedTasks.splice(targetIndex, 0, draggedTask)

    // Update order values
    const reorderedTasks = updatedTasks.map((task, index) => ({
      ...task,
      order: index,
    }))

    onTaskReorder(reorderedTasks)
    setDraggedTask(null)
  }

  const handleTaskClick = (task: PomodoroTask) => {
    onTaskSelect(currentTaskId === task.id ? null : task.id)
  }

  return (
    <div className="space-y-4">
      <h2 className="text-center text-2xl font-semibold">Focus Tasks</h2>
      <div className="flex gap-2">
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="Add a task..."
          className="flex-1 rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none"
        />
        <button
          onClick={handleAdd}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-indigo-700"
        >
          Add
        </button>
      </div>
      <div className="space-y-2">
        {sortedTasks.map((task) => {
          const isSelected = currentTaskId === task.id
          return (
            <motion.div
              key={task.id}
              draggable
              onDragStart={(e: any) => handleDragStart(e as React.DragEvent, task)}
              onDragOver={(e: any) => handleDragOver(e as React.DragEvent)}
              onDrop={(e: any) => handleDrop(e as React.DragEvent, task)}
              whileHover={{ scale: 1.01 }}
              onClick={() => handleTaskClick(task)}
              className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition-all ${
                isSelected
                  ? 'border-blue-500/40 bg-blue-500/20 shadow-lg shadow-black/30'
                  : 'border-neutral-700 bg-neutral-800 hover:shadow-lg hover:shadow-black/30'
              }`}
            >
              <GripVertical className={`h-5 w-5 flex-shrink-0 ${isSelected ? 'text-blue-400' : 'text-neutral-500'}`} />
              <div className="flex-1" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={(e) => {
                      e.stopPropagation()
                      onTaskUpdate({ ...task, completed: e.target.checked })
                    }}
                    className="h-4 w-4 rounded"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span className={task.completed ? 'text-neutral-500 line-through' : ''}>{task.title}</span>
                </div>
                {editingId === task.id ? (
                  <div className="mt-2 space-y-2" onClick={(e) => e.stopPropagation()}>
                    <textarea
                      value={editingNotes}
                      onChange={(e) => setEditingNotes(e.target.value)}
                      placeholder="Add notes..."
                      className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                      rows={3}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSaveNotes(task.id)
                        }}
                        className="rounded-lg bg-indigo-600 px-3 py-1 text-xs text-white hover:bg-indigo-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setEditingId(null)
                        }}
                        className="rounded-lg border border-neutral-700 px-3 py-1 text-xs hover:bg-neutral-700"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  task.notes && (
                    <p className="mt-1 text-xs text-neutral-400">{task.notes}</p>
                  )
                )}
              </div>
              <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                {!editingId && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEditNotes(task)
                    }}
                    className="rounded-lg px-2 py-1 text-xs text-neutral-400 hover:text-neutral-100"
                  >
                    {task.notes ? 'Edit notes' : 'Add notes'}
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onTaskDelete(task.id)
                  }}
                  className="rounded-lg px-2 py-1 text-xs text-red-400 hover:text-red-300"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          )
        })}
        {tasks.length === 0 && (
          <div className="py-8 text-center text-sm text-neutral-500">No tasks yet. Add one above!</div>
        )}
      </div>
    </div>
  )
}

function SettingsPanel({
  settings,
  onUpdate,
}: {
  settings: PomodoroState['settings']
  onUpdate: (settings: PomodoroState['settings']) => void
}) {
  return (
    <div className="space-y-6">
      <div>
        <label className="mb-2 block text-sm font-medium">Work Duration (minutes)</label>
        <input
          type="number"
          min="1"
          max="60"
          value={settings.workDuration}
          onChange={(e) => onUpdate({ ...settings, workDuration: parseInt(e.target.value) || 25 })}
          className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2 focus:border-indigo-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium">Short Break (minutes)</label>
        <input
          type="number"
          min="1"
          max="30"
          value={settings.shortBreakDuration}
          onChange={(e) => onUpdate({ ...settings, shortBreakDuration: parseInt(e.target.value) || 5 })}
          className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2 focus:border-indigo-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium">Long Break (minutes)</label>
        <input
          type="number"
          min="1"
          max="60"
          value={settings.longBreakDuration}
          onChange={(e) => onUpdate({ ...settings, longBreakDuration: parseInt(e.target.value) || 15 })}
          className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2 focus:border-indigo-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium">Intervals Before Long Break</label>
        <input
          type="number"
          min="2"
          max="10"
          value={settings.intervalsBeforeLong}
          onChange={(e) => onUpdate({ ...settings, intervalsBeforeLong: parseInt(e.target.value) || 4 })}
          className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2 focus:border-indigo-500 focus:outline-none"
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="autoStart"
          checked={settings.autoStartNext}
          onChange={(e) => onUpdate({ ...settings, autoStartNext: e.target.checked })}
          className="h-4 w-4 rounded"
        />
        <label htmlFor="autoStart" className="text-sm">
          Auto-start next interval
        </label>
      </div>
    </div>
  )
}

