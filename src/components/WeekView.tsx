'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { WeeklyFocusCard } from './WeeklyFocusCard'
import { FocusBlockCard } from './FocusBlockCard'
import { FocusBlockCreator } from './FocusBlockCreator'
import { Calendar, Clock, Target } from 'lucide-react'

interface WeekViewProps {
  onNavigateToToday: () => void
}

export function WeekView({ onNavigateToToday }: WeekViewProps) {
  const [weeklyFocus, setWeeklyFocus] = useState<any>(null)
  const [focusBlocks, setFocusBlocks] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showFocusBlockCreator, setShowFocusBlockCreator] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [weeklyFocusRes, focusBlocksRes, projectsRes, tasksRes] = await Promise.all([
        fetch('/api/weekly-focus'),
        fetch('/api/focus-blocks'),
        fetch('/api/projects'),
        fetch('/api/tasks')
      ])
      
      const [weeklyFocusData, focusBlocksData, projectsData, tasksData] = await Promise.all([
        weeklyFocusRes.json(),
        focusBlocksRes.json(),
        projectsRes.json(),
        tasksRes.json()
      ])
      
      setWeeklyFocus(weeklyFocusData)
      setFocusBlocks(focusBlocksData)
      setProjects(projectsData)
      setTasks(tasksData)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleWeeklyFocusUpdate = async (data: any) => {
    try {
      const response = await fetch('/api/weekly-focus', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      
      if (response.ok) {
        loadData()
      }
    } catch (error) {
      console.error('Failed to update weekly focus:', error)
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

  // Get current week's days
  const getWeekDays = () => {
    const today = new Date()
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()))
    const days = []
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek)
      day.setDate(day.getDate() + i)
      days.push(day)
    }
    
    return days
  }

  const weekDays = getWeekDays()
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  // Group focus blocks by date
  const focusBlocksByDate = focusBlocks.reduce((acc, block) => {
    const date = new Date(block.date).toDateString()
    if (!acc[date]) acc[date] = []
    acc[date].push(block)
    return acc
  }, {} as Record<string, any[]>)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Week Planning</h1>
            <p className="text-gray-600">
              {weekDays[0].toLocaleDateString()} - {weekDays[6].toLocaleDateString()}
            </p>
          </div>
          <Button onClick={onNavigateToToday} variant="outline">
            ← Back to Today
          </Button>
        </div>

        {/* Weekly Focus */}
        {weeklyFocus && (
          <WeeklyFocusCard
            weeklyFocus={{
              ...weeklyFocus,
              themes: JSON.parse(weeklyFocus.themes || '[]'),
              targets: JSON.parse(weeklyFocus.targets || '[]')
            }}
            onUpdate={handleWeeklyFocusUpdate}
          />
        )}

        {/* Week Grid */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Focus Block Planning</CardTitle>
              <Button 
                onClick={() => setShowFocusBlockCreator(true)}
                size="sm"
              >
                + Add Focus Block
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-4">
              {weekDays.map((day, index) => {
                const dayBlocks = focusBlocksByDate[day.toDateString()] || []
                const isToday = day.toDateString() === new Date().toDateString()
                
                return (
                  <div key={index} className="space-y-2">
                    <div className={`text-center p-2 rounded-lg ${isToday ? 'bg-blue-100 text-blue-900' : 'bg-gray-100'}`}>
                      <div className="font-medium">{dayNames[index]}</div>
                      <div className="text-sm">{day.getDate()}</div>
                    </div>
                    
                    <div className="space-y-2 min-h-[200px]">
                      {dayBlocks.map((block) => (
                        <FocusBlockCard
                          key={block.id}
                          focusBlock={block}
                          onToggleComplete={handleFocusBlockToggle}
                          onDelete={handleFocusBlockDelete}
                        />
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
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
      </div>
    </div>
  )
}

