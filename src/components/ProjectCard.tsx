'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { FolderOpen, Target, AlertTriangle, CheckCircle } from 'lucide-react'

interface Project {
  id: string
  name: string
  status: string
  priority: string
  goal?: string
  notes?: string
  createdAt: string
  updatedAt: string
  tasks?: {
    id: string
    title: string
    status: string
    priority: string
    dueDate?: string
    isMustDo: boolean
  }[]
}

interface ProjectCardProps {
  project: Project
  onEdit: (project: Project) => void
  onDelete: (id: string) => void
}

export function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  const tasks = project.tasks || []
  const completedTasks = tasks.filter(task => task.status === 'DONE').length
  const totalTasks = tasks.length
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
  
  const overdueTasks = tasks.filter(task => 
    task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE'
  ).length
  
  const mustDoTasks = tasks.filter(task => task.isMustDo && task.status !== 'DONE').length
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'archived': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'P0': return 'bg-red-100 text-red-800'
      case 'P1': return 'bg-orange-100 text-orange-800'
      case 'P2': return 'bg-yellow-100 text-yellow-800'
      case 'P3': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <FolderOpen className="h-4 w-4 text-gray-500" />
              <CardTitle className="text-lg">{project.name}</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(project.status)}>
                {project.status}
              </Badge>
              <Badge className={getPriorityColor(project.priority)}>
                {project.priority}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? '−' : '+'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(project)}
            >
              Edit
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {/* Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-gray-600">Progress</span>
            <span className="text-sm font-medium">{completedTasks}/{totalTasks}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        
        {/* Key Metrics */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="text-center p-2 bg-gray-50 rounded">
            <div className="text-lg font-bold text-gray-900">{totalTasks}</div>
            <div className="text-xs text-gray-600">Total Tasks</div>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded">
            <div className="text-lg font-bold text-orange-600">{overdueTasks}</div>
            <div className="text-xs text-gray-600">Overdue</div>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded">
            <div className="text-lg font-bold text-blue-600">{mustDoTasks}</div>
            <div className="text-xs text-gray-600">Must-Dos</div>
          </div>
        </div>
        
        {/* Risk Flags */}
        {overdueTasks > 0 && (
          <div className="flex items-center gap-2 mb-3 p-2 bg-red-50 rounded text-red-700">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm">{overdueTasks} overdue task{overdueTasks > 1 ? 's' : ''}</span>
          </div>
        )}
        
        {/* Expanded Content */}
        {isExpanded && (
          <div className="space-y-3 pt-3 border-t">
            {project.goal && (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Target className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">Goal</span>
                </div>
                <p className="text-sm text-gray-600">{project.goal}</p>
              </div>
            )}
            
            {project.notes && (
              <div>
                <span className="text-sm font-medium">Notes</span>
                <p className="text-sm text-gray-600 mt-1">{project.notes}</p>
              </div>
            )}
            
            {tasks.length > 0 && (
              <div>
                <span className="text-sm font-medium">Recent Tasks</span>
                <div className="space-y-1 mt-2">
                  {tasks.slice(0, 3).map((task) => (
                    <div key={task.id} className="flex items-center gap-2 text-sm">
                      <CheckCircle 
                        className={`h-4 w-4 ${task.status === 'DONE' ? 'text-green-600' : 'text-gray-400'}`} 
                      />
                      <span className={task.status === 'DONE' ? 'line-through text-gray-500' : ''}>
                        {task.title}
                      </span>
                      {task.isMustDo && (
                        <Badge variant="outline" className="text-xs">Must-Do</Badge>
                      )}
                    </div>
                  ))}
                  {tasks.length > 3 && (
                    <div className="text-xs text-gray-500">
                      +{tasks.length - 3} more tasks
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

