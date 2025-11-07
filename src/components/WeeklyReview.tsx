'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  Target, 
  Calendar,
  BarChart3,
  Lightbulb,
  ArrowRight
} from 'lucide-react'

interface WeeklyReviewProps {
  onNavigateToToday: () => void
}

interface ReviewData {
  weekStart: string
  weekEnd: string
  totalTasks: number
  completedTasks: number
  greenDays: number
  totalDays: number
  focusBlocksCompleted: number
  totalFocusBlocks: number
  mustDosCompleted: number
  totalMustDos: number
  weeklyFocusThemes: string[]
  weeklyFocusTargets: string[]
  highRICECompleted: number
  quickWinsCompleted: number
  overdueTasks: number
  insights: string[]
  nextWeekThemes: string[]
  nextWeekTargets: string[]
}

export function WeeklyReview({ onNavigateToToday }: WeeklyReviewProps) {
  const [reviewData, setReviewData] = useState<ReviewData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    generateReview()
  }, [])

  const generateReview = async () => {
    try {
      // This would typically fetch data from your APIs
      // For now, we'll generate mock data
      const mockData: ReviewData = {
        weekStart: '2024-10-07',
        weekEnd: '2024-10-13',
        totalTasks: 24,
        completedTasks: 18,
        greenDays: 3,
        totalDays: 5,
        focusBlocksCompleted: 6,
        totalFocusBlocks: 10,
        mustDosCompleted: 12,
        totalMustDos: 15,
        weeklyFocusThemes: ['Beechnut proposal', 'Ops automation', 'Team building'],
        weeklyFocusTargets: ['Finish pricing one-pager', 'Complete PRD draft', 'Schedule team lunch'],
        highRICECompleted: 4,
        quickWinsCompleted: 8,
        overdueTasks: 2,
        insights: [
          'You had 3 Green Days this week - excellent focus!',
          'Completed 4 high-RICE tasks, showing good prioritization',
          '8 quick wins completed - great momentum building',
          '2 tasks slipped - consider adjusting estimates'
        ],
        nextWeekThemes: ['Q4 planning', 'Client presentations', 'Process improvements'],
        nextWeekTargets: ['Finalize Q4 roadmap', 'Prepare 3 client decks', 'Document new workflows']
      }
      
      setReviewData(mockData)
    } catch (error) {
      console.error('Failed to generate review:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600'
    if (percentage >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getPerformanceLabel = (percentage: number) => {
    if (percentage >= 80) return 'Excellent'
    if (percentage >= 60) return 'Good'
    return 'Needs Improvement'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!reviewData) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="text-center py-12">
              <XCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to generate review</h3>
              <p className="text-gray-600">There was an error generating your weekly review.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const taskCompletionRate = (reviewData.completedTasks / reviewData.totalTasks) * 100
  const greenDayRate = (reviewData.greenDays / reviewData.totalDays) * 100
  const focusBlockRate = (reviewData.focusBlocksCompleted / reviewData.totalFocusBlocks) * 100
  const mustDoRate = (reviewData.mustDosCompleted / reviewData.totalMustDos) * 100

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Weekly Review</h1>
            <p className="text-gray-600">
              {reviewData.weekStart} - {reviewData.weekEnd}
            </p>
          </div>
          <Button onClick={onNavigateToToday} variant="outline">
            ← Back to Today
          </Button>
        </div>

        {/* Performance Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Performance Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className={`text-3xl font-bold ${getPerformanceColor(taskCompletionRate)}`}>
                  {Math.round(taskCompletionRate)}%
                </div>
                <div className="text-sm text-gray-600">Task Completion</div>
                <div className="text-xs text-gray-500">
                  {reviewData.completedTasks}/{reviewData.totalTasks} tasks
                </div>
                <Progress value={taskCompletionRate} className="mt-2" />
              </div>

              <div className="text-center">
                <div className={`text-3xl font-bold ${getPerformanceColor(greenDayRate)}`}>
                  {Math.round(greenDayRate)}%
                </div>
                <div className="text-sm text-gray-600">Green Days</div>
                <div className="text-xs text-gray-500">
                  {reviewData.greenDays}/{reviewData.totalDays} days
                </div>
                <Progress value={greenDayRate} className="mt-2" />
              </div>

              <div className="text-center">
                <div className={`text-3xl font-bold ${getPerformanceColor(focusBlockRate)}`}>
                  {Math.round(focusBlockRate)}%
                </div>
                <div className="text-sm text-gray-600">Focus Blocks</div>
                <div className="text-xs text-gray-500">
                  {reviewData.focusBlocksCompleted}/{reviewData.totalFocusBlocks} blocks
                </div>
                <Progress value={focusBlockRate} className="mt-2" />
              </div>

              <div className="text-center">
                <div className={`text-3xl font-bold ${getPerformanceColor(mustDoRate)}`}>
                  {Math.round(mustDoRate)}%
                </div>
                <div className="text-sm text-gray-600">Must-Dos</div>
                <div className="text-xs text-gray-500">
                  {reviewData.mustDosCompleted}/{reviewData.totalMustDos} tasks
                </div>
                <Progress value={mustDoRate} className="mt-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Wins & Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Wins & Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{reviewData.highRICECompleted}</div>
                <div className="text-sm text-gray-600">High RICE Tasks</div>
                <div className="text-xs text-gray-500">High impact work completed</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{reviewData.quickWinsCompleted}</div>
                <div className="text-sm text-gray-600">Quick Wins</div>
                <div className="text-xs text-gray-500">Momentum building tasks</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{reviewData.greenDays}</div>
                <div className="text-sm text-gray-600">Green Days</div>
                <div className="text-xs text-gray-500">Perfect execution days</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Focus Review */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Weekly Focus Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Themes</h4>
                <div className="flex flex-wrap gap-2">
                  {reviewData.weeklyFocusThemes.map((theme, index) => (
                    <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700">
                      {theme}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Targets</h4>
                <ul className="space-y-1">
                  {reviewData.weeklyFocusTargets.map((target, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      {target}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Insights & Learnings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-600" />
              Insights & Learnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reviewData.insights.map((insight, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                  <Lightbulb className="h-4 w-4 text-yellow-600 mt-0.5" />
                  <span className="text-sm text-gray-700">{insight}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Areas for Improvement */}
        {reviewData.overdueTasks > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-600" />
                Areas for Improvement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-gray-700">
                    {reviewData.overdueTasks} tasks slipped this week - consider adjusting estimates or reducing scope
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Next Week Planning */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Next Week Planning
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Suggested Themes</h4>
                <div className="flex flex-wrap gap-2">
                  {reviewData.nextWeekThemes.map((theme, index) => (
                    <Badge key={index} variant="outline" className="bg-green-50 text-green-700">
                      {theme}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Suggested Targets</h4>
                <ul className="space-y-1">
                  {reviewData.nextWeekTargets.map((target, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                      {target}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Items */}
        <Card>
          <CardHeader>
            <CardTitle>Action Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <ArrowRight className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-gray-700">
                  Set up next week's themes and targets in Week Planning
                </span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <ArrowRight className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-gray-700">
                  Review and adjust task estimates based on this week's performance
                </span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <ArrowRight className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-gray-700">
                  Schedule focus blocks for high-priority work next week
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


