'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Clock, MapPin, FileText } from 'lucide-react'

interface FocusBlock {
  id: string
  title: string
  date: string
  start: string
  end: string
  location?: string
  notes?: string
  completedAt?: string
  task?: {
    title: string
    project?: {
      name: string
    }
  } | null
  project?: {
    name: string
  } | null
}

interface FocusBlockCardProps {
  focusBlock: FocusBlock
  onToggleComplete: (id: string, completed: boolean) => void
  onDelete: (id: string) => void
}

export function FocusBlockCard({ focusBlock, onToggleComplete, onDelete }: FocusBlockCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  
  const isCompleted = !!focusBlock.completedAt
  const duration = calculateDuration(focusBlock.start, focusBlock.end)
  
  const handleToggleComplete = () => {
    onToggleComplete(focusBlock.id, !isCompleted)
  }
  
  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await onDelete(focusBlock.id)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Card className={`transition-all duration-200 ${isCompleted ? 'opacity-60' : 'hover:shadow-md'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className={`text-lg ${isCompleted ? 'line-through text-gray-500' : ''}`}>
              {focusBlock.title}
            </CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                {focusBlock.start} - {focusBlock.end} ({duration})
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              checked={isCompleted}
              onCheckedChange={handleToggleComplete}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-red-600 hover:text-red-700"
            >
              {isDeleting ? '...' : '×'}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-2">
          {focusBlock.task && (
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                Task: {focusBlock.task.title}
                {focusBlock.task.project && (
                  <span className="text-gray-500"> #{focusBlock.task.project.name}</span>
                )}
              </span>
            </div>
          )}
          
          {focusBlock.project && !focusBlock.task && (
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                Project: {focusBlock.project.name}
              </span>
            </div>
          )}
          
          {focusBlock.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">{focusBlock.location}</span>
            </div>
          )}
          
          {focusBlock.notes && (
            <p className="text-sm text-gray-600 italic">{focusBlock.notes}</p>
          )}
          
          {isCompleted && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Completed
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function calculateDuration(start: string, end: string): string {
  const startTime = new Date(`2000-01-01T${start}:00`)
  const endTime = new Date(`2000-01-01T${end}:00`)
  const diffMs = endTime.getTime() - startTime.getTime()
  const diffHours = diffMs / (1000 * 60 * 60)
  
  if (diffHours < 1) {
    const minutes = Math.round(diffHours * 60)
    return `${minutes}m`
  } else if (diffHours === Math.floor(diffHours)) {
    return `${Math.floor(diffHours)}h`
  } else {
    const hours = Math.floor(diffHours)
    const minutes = Math.round((diffHours - hours) * 60)
    return `${hours}h ${minutes}m`
  }
}

