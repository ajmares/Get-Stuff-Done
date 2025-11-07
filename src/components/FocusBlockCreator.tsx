'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'

interface Task {
  id: string
  title: string
  project?: {
    name: string
  } | null
}

interface Project {
  id: string
  name: string
}

interface FocusBlockCreatorProps {
  tasks: Task[]
  projects: Project[]
  onClose: () => void
  onSave: (data: {
    title: string
    taskId?: string
    projectId?: string
    date: string
    start: string
    end: string
    location?: string
    notes?: string
  }) => void
}

export function FocusBlockCreator({ tasks, projects, onClose, onSave }: FocusBlockCreatorProps) {
  const [title, setTitle] = useState('')
  const [selectedTaskId, setSelectedTaskId] = useState<string>('')
  const [selectedProjectId, setSelectedProjectId] = useState<string>('')
  const [date, setDate] = useState<Date>(new Date())
  const [start, setStart] = useState('09:00')
  const [end, setEnd] = useState('11:00')
  const [location, setLocation] = useState('')
  const [notes, setNotes] = useState('')

  const handleSave = () => {
    if (!title.trim()) return

    onSave({
      title,
      taskId: selectedTaskId || undefined,
      projectId: selectedProjectId || undefined,
      date: date.toISOString().split('T')[0],
      start,
      end,
      location: location || undefined,
      notes: notes || undefined
    })
  }

  const handleTaskSelect = (taskId: string) => {
    setSelectedTaskId(taskId)
    setSelectedProjectId('') // Clear project selection
    const task = tasks.find(t => t.id === taskId)
    if (task) {
      setTitle(task.title)
    }
  }

  const handleProjectSelect = (projectId: string) => {
    setSelectedProjectId(projectId)
    setSelectedTaskId('') // Clear task selection
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Create Focus Block</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Focus block title"
            className="mt-1"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Link to Task (optional)</Label>
            <Select value={selectedTaskId} onValueChange={handleTaskSelect}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select a task" />
              </SelectTrigger>
              <SelectContent>
                {tasks.map((task) => (
                  <SelectItem key={task.id} value={task.id}>
                    {task.title}
                    {task.project && ` (#${task.project.name})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Link to Project (optional)</Label>
            <Select value={selectedProjectId} onValueChange={handleProjectSelect}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label>Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full mt-1 justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(date, 'PPP')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(newDate) => newDate && setDate(newDate)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="start">Start Time</Label>
            <Input
              id="start"
              type="time"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="end">End Time</Label>
            <Input
              id="end"
              type="time"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="location">Location (optional)</Label>
          <Input
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Office, Home, Coffee shop..."
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="notes">Notes (optional)</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any notes or preparation needed..."
            className="mt-1"
            rows={3}
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!title.trim()}>
            Create Focus Block
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

