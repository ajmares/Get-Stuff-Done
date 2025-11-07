'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TaskWithRICE, getRICEInsights, formatRICEScore, getRICEAdvice } from '@/lib/riceScoring'
import { TrendingUp, TrendingDown, Zap, AlertTriangle, Lightbulb } from 'lucide-react'

interface RICEInsightsProps {
  tasks: TaskWithRICE[]
  onTaskAction: (taskId: string, action: 'mustDo' | 'focus' | 'schedule') => void
}

export function RICEInsights({ tasks, onTaskAction }: RICEInsightsProps) {
  const insights = getRICEInsights(tasks)

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'P0': return 'bg-red-100 text-red-800'
      case 'P1': return 'bg-orange-100 text-orange-800'
      case 'P2': return 'bg-yellow-100 text-yellow-800'
      case 'P3': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getEffortLabel = (effort: string) => {
    switch (effort) {
      case 'XS': return '15m'
      case 'S': return '30m'
      case 'M': return '1h'
      case 'L': return '2h'
      case 'XL': return '4h+'
      default: return '1h'
    }
  }

  return (
    <div className="space-y-6">
      {/* High RICE Tasks */}
      {insights.highRICE.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              High RICE Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.highRICE.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{task.title}</span>
                      <Badge className={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                      <Badge variant="outline">
                        {getEffortLabel(task.effort)}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      RICE: {formatRICEScore(task.riceScore || 0)} • {getRICEAdvice(task)}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onTaskAction(task.id, 'mustDo')}
                    >
                      M
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onTaskAction(task.id, 'focus')}
                    >
                      F
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Wins */}
      {insights.quickWins.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-600" />
              Quick Wins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.quickWins.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{task.title}</span>
                      <Badge className={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                      <Badge variant="outline">
                        {getEffortLabel(task.effort)}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      RICE: {formatRICEScore(task.riceScore || 0)} • Quick to complete!
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onTaskAction(task.id, 'mustDo')}
                    >
                      M
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onTaskAction(task.id, 'focus')}
                    >
                      F
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overdue Tasks */}
      {insights.overdue.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Overdue Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.overdue.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{task.title}</span>
                      <Badge className={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                      <Badge variant="outline">
                        {getEffortLabel(task.effort)}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onTaskAction(task.id, 'mustDo')}
                    >
                      M
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onTaskAction(task.id, 'schedule')}
                    >
                      S
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Low RICE Tasks */}
      {insights.lowRICE.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-gray-600" />
              Low RICE Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.lowRICE.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{task.title}</span>
                      <Badge className={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                      <Badge variant="outline">
                        {getEffortLabel(task.effort)}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      RICE: {formatRICEScore(task.riceScore || 0)} • {getRICEAdvice(task)}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onTaskAction(task.id, 'schedule')}
                    >
                      S
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* RICE Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-blue-600" />
            RICE Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-600">
            <p><strong>Reach:</strong> How many people will this affect? (1-5)</p>
            <p><strong>Impact:</strong> How much will it impact each person? (1-5)</p>
            <p><strong>Confidence:</strong> How confident are you in your estimates? (1-5)</p>
            <p><strong>Effort:</strong> How much work will it take? (XS to XL)</p>
            <p className="pt-2 text-blue-600">
              💡 <strong>Pro tip:</strong> Focus on high RICE tasks first, but don't ignore quick wins!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


