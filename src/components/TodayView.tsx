'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { parseQuickAdd } from '@/lib/quickAddParser'
import { Task, Priority, Effort } from '@prisma/client'
import { FocusBlockCard } from './FocusBlockCard'
import { FocusBlockCreator } from './FocusBlockCreator'
import { KeyboardShortcutsHelp } from './KeyboardShortcutsHelp'
import { WinMeter } from './WinMeter'
import { RICEInsights } from './RICEInsights'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { getNextBestActions } from '@/lib/riceScoring'

interface TaskWithProject extends Task {
  project?: {
    name: string
  } | null
}

interface TodayViewProps {
  onNavigateToWeek: () => void
  onNavigateToProjects: () => void
  onNavigateToReview: () => void
}

export function TodayView({ onNavigateToWeek, onNavigateToProjects, onNavigateToReview }: TodayViewProps) {
  const [tasks, setTasks] = useState<TaskWithProject[]>([])
  const [focusBlocks, setFocusBlocks] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [quickAddText, setQuickAddText] = useState('')
  const [loading, setLoading] = useState(true)
  const [showFocusBlockCreator, setShowFocusBlockCreator] = useState(false)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)

  // Load data on component mount
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [tasksRes, focusBlocksRes, projectsRes] = await Promise.all([
        fetch('/api/tasks'),
        fetch('/api/focus-blocks'),
        fetch('/api/projects')
      ])
      
      const [tasksData, focusBlocksData, projectsData] = await Promise.all([
        tasksRes.json(),
        focusBlocksRes.json(),
        projectsRes.json()
      ])
      
      setTasks(tasksData)
      setFocusBlocks(focusBlocksData)
      setProjects(projectsData)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!quickAddText.trim()) return

    try {
      // Parse the quick add text
      const parsed = parseQuickAdd(quickAddText)
      
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: parsed.title,
          projectName: parsed.projectName,
          priority: parsed.priority,
          effort: parsed.effort,
          dueDate: parsed.dueDate?.toISOString(),
          labels: parsed.labels
        })
      })
      
      if (response.ok) {
        setQuickAddText('')
        loadData()
      }
    } catch (error) {
      console.error('Failed to create task:', error)
    }
  }

  const toggleMustDo = async (taskId: string, currentValue: boolean) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isMustDo: !currentValue })
      })
      
      if (response.ok) {
        loadData()
      }
    } catch (error) {
      console.error('Failed to toggle must-do:', error)
    }
  }

  const toggleTaskComplete = async (taskId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'DONE' ? 'INBOX' : 'DONE'
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      
      if (response.ok) {
        loadData()
      }
    } catch (error) {
      console.error('Failed to toggle task:', error)
    }
  }

  const handleFocusBlockSave = async (data: any) => {
    try {
      const response = await fetch('/api/focus-blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      
      if (response.ok) {
        setShowFocusBlockCreator(false)
        loadData()
      }
    } catch (error) {
      console.error('Failed to create focus block:', error)
    }
  }

  const handleFocusBlockToggle = async (id: string, completed: boolean) => {
    try {
      const response = await fetch(`/api/focus-blocks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          completedAt: completed ? new Date().toISOString() : null 
        })
      })
      
      if (response.ok) {
        loadData()
      }
    } catch (error) {
      console.error('Failed to toggle focus block:', error)
    }
  }

  const handleFocusBlockDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/focus-blocks/${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        loadData()
      }
    } catch (error) {
      console.error('Failed to delete focus block:', error)
    }
  }

  // Keyboard shortcuts
  const handleQuickAddFocus = () => {
    const input = document.querySelector('input[placeholder*="Task title"]') as HTMLInputElement
    if (input) {
      input.focus()
      input.select()
    }
  }

  const handleToggleMustDoShortcut = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId)
    if (task) {
      toggleMustDo(taskId, task.isMustDo)
    }
  }

  const handleScheduleShortcut = (taskId: string) => {
    // For now, just log - we'll implement scheduling later
    console.log('Schedule task:', taskId)
  }

  const handleFocusBlockShortcut = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId)
    if (task) {
      setShowFocusBlockCreator(true)
    }
  }

  useKeyboardShortcuts({
    onQuickAdd: handleQuickAddFocus,
    onToggleMustDo: handleToggleMustDoShortcut,
    onSchedule: handleScheduleShortcut,
    onFocusBlock: handleFocusBlockShortcut,
    selectedTaskId: selectedTaskId || undefined,
    onNavigateToWeek,
    onNavigateToProjects
  })

  const mustDoTasks = tasks.filter(task => task.isMustDo && task.status !== 'DONE')
  const nextBestActions = getNextBestActions(tasks.filter(task => !task.isMustDo && task.status !== 'DONE'))

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'P0': return 'bg-red-100 text-red-800'
      case 'P1': return 'bg-orange-100 text-orange-800'
      case 'P2': return 'bg-yellow-100 text-yellow-800'
      case 'P3': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getEffortLabel = (effort: Effort) => {
    switch (effort) {
      case 'XS': return '15m'
      case 'S': return '30m'
      case 'M': return '1h'
      case 'L': return '2h'
      case 'XL': return '4h+'
      default: return '1h'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-32 bg-gray-200 rounded mb-6"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Today</h1>
            <p className="text-gray-600">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <Button onClick={onNavigateToWeek} variant="outline">
                Week Planning →
              </Button>
              <Button onClick={onNavigateToProjects} variant="outline">
                Projects →
              </Button>
              <Button onClick={onNavigateToReview} variant="outline">
                Weekly Review →
              </Button>
            </div>
          </div>
        </div>

        {/* Win Meter */}
        <WinMeter
          mustDoCompleted={mustDoTasks.filter(t => t.status === 'DONE').length}
          focusBlocksCompleted={focusBlocks.filter(fb => fb.completedAt).length}
          totalMustDos={3}
          totalFocusBlocks={2}
        />

        {/* Quick Add */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Add</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleQuickAdd} className="flex gap-2">
              <Input
                placeholder="Task title #project @due ^effort !P1"
                value={quickAddText}
                onChange={(e) => setQuickAddText(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" disabled={!quickAddText.trim()}>
                Add
              </Button>
            </form>
            <p className="text-sm text-gray-500 mt-2">
              Press Enter to add. Use # for project, @ for due date, ^ for effort, ! for priority.
            </p>
          </CardContent>
        </Card>

        {/* Daily Must-Dos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Daily Must-Dos ({mustDoTasks.length}/3)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {mustDoTasks.length === 0 ? (
              <p className="text-gray-500 italic">No must-do tasks yet. Press M on any task to make it a must-do.</p>
            ) : (
              <div className="space-y-3">
                {mustDoTasks.map((task) => (
                  <div 
                    key={task.id} 
                    className={`flex items-center gap-3 p-3 bg-white rounded-lg border cursor-pointer transition-colors ${
                      selectedTaskId === task.id ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedTaskId(selectedTaskId === task.id ? null : task.id)}
                  >
                    <Checkbox
                      checked={task.status === 'DONE'}
                      onCheckedChange={() => toggleTaskComplete(task.id, task.status)}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={task.status === 'DONE' ? 'line-through text-gray-500' : ''}>
                          {task.title}
                        </span>
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                        <Badge variant="outline">
                          {getEffortLabel(task.effort)}
                        </Badge>
                      </div>
                      {task.project && (
                        <p className="text-sm text-gray-600">#{task.project.name}</p>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleMustDo(task.id, task.isMustDo)}
                    >
                      Remove from Must-Dos
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Focus Blocks */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                Focus Blocks ({focusBlocks.filter(fb => !fb.completedAt).length}/2)
              </CardTitle>
              <Button 
                onClick={() => setShowFocusBlockCreator(true)}
                size="sm"
              >
                + Add Focus Block
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {focusBlocks.length === 0 ? (
              <p className="text-gray-500 italic">No focus blocks planned. Add some deep work time!</p>
            ) : (
              <div className="space-y-3">
                {focusBlocks.map((focusBlock) => (
                  <FocusBlockCard
                    key={focusBlock.id}
                    focusBlock={focusBlock}
                    onToggleComplete={handleFocusBlockToggle}
                    onDelete={handleFocusBlockDelete}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Next Best Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Next Best Actions</CardTitle>
          </CardHeader>
          <CardContent>
            {nextBestActions.length === 0 ? (
              <p className="text-gray-500 italic">No tasks available. Add some tasks to get started!</p>
            ) : (
              <div className="space-y-3">
                {nextBestActions.slice(0, 10).map((task) => (
                  <div 
                    key={task.id} 
                    className={`flex items-center gap-3 p-3 bg-white rounded-lg border cursor-pointer transition-colors ${
                      selectedTaskId === task.id ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedTaskId(selectedTaskId === task.id ? null : task.id)}
                  >
                    <Checkbox
                      checked={task.status === 'DONE'}
                      onCheckedChange={() => toggleTaskComplete(task.id, task.status)}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={task.status === 'DONE' ? 'line-through text-gray-500' : ''}>
                          {task.title}
                        </span>
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                        <Badge variant="outline">
                          {getEffortLabel(task.effort)}
                        </Badge>
                      </div>
                      {task.project && (
                        <p className="text-sm text-gray-600">#{task.project.name}</p>
                      )}
                      {task.dueDate && (
                        <p className="text-sm text-gray-600">
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleMustDo(task.id, task.isMustDo)}
                    >
                      {task.isMustDo ? 'Remove from Must-Dos' : 'Make Must-Do'}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Focus Block Creator Modal */}
        {showFocusBlockCreator && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <FocusBlockCreator
                tasks={tasks}
                projects={projects}
                onClose={() => setShowFocusBlockCreator(false)}
                onSave={handleFocusBlockSave}
              />
            </div>
          </div>
        )}

        {/* RICE Insights */}
        <RICEInsights
          tasks={tasks}
          onTaskAction={(taskId, action) => {
            if (action === 'mustDo') {
              const task = tasks.find(t => t.id === taskId)
              if (task) toggleMustDo(taskId, task.isMustDo)
            } else if (action === 'focus') {
              setShowFocusBlockCreator(true)
            } else if (action === 'schedule') {
              console.log('Schedule task:', taskId)
            }
          }}
        />

        {/* Keyboard Shortcuts Help */}
        <KeyboardShortcutsHelp />
      </div>
    </div>
  )
}
