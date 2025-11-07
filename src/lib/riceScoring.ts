import { Task, Priority, Effort } from '@prisma/client'

export interface RICEParams {
  reach: number // 1-5 scale
  impact: number // 1-5 scale  
  confidence: number // 1-5 scale
  effort: Effort
}

export interface TaskWithRICE extends Task {
  riceScore?: number
  riceParams?: RICEParams
}

// Effort multipliers (higher effort = lower score)
const EFFORT_MULTIPLIERS = {
  XS: 1,   // 15m
  S: 2,    // 30m  
  M: 4,    // 1h
  L: 8,    // 2h
  XL: 16   // 4h+
}

// Priority multipliers (higher priority = higher score)
const PRIORITY_MULTIPLIERS = {
  P0: 4,
  P1: 3,
  P2: 2,
  P3: 1
}

export function calculateRICEScore(params: RICEParams): number {
  const { reach, impact, confidence, effort } = params
  
  // RICE formula: (Reach × Impact × Confidence) / Effort
  const numerator = reach * impact * confidence
  const effortMultiplier = EFFORT_MULTIPLIERS[effort] || 4
  
  return numerator / effortMultiplier
}

export function calculateTaskRICE(task: Task): number {
  // Use existing RICE params if available
  if (task.riceScore !== null && task.riceScore !== undefined) {
    return task.riceScore
  }

  // Calculate from basic task properties
  const reach = 3 // Default reach (can be customized per task)
  const impact = task.impact || 3
  const confidence = 4 // Default confidence (can be customized per task)
  
  const params: RICEParams = {
    reach,
    impact,
    confidence,
    effort: task.effort
  }
  
  return calculateRICEScore(params)
}

export function getNextBestActions(tasks: TaskWithRICE[]): TaskWithRICE[] {
  return tasks
    .filter(task => task.status !== 'DONE')
    .map(task => ({
      ...task,
      riceScore: calculateTaskRICE(task)
    }))
    .sort((a, b) => {
      // Primary sort: Priority (P0 first)
      const priorityOrder = { P0: 0, P1: 1, P2: 2, P3: 3 }
      const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] ?? 4
      const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] ?? 4
      
      if (aPriority !== bPriority) {
        return aPriority - bPriority
      }
      
      // Secondary sort: Due date (overdue first, then soonest)
      const now = new Date()
      const aDueDate = a.dueDate ? new Date(a.dueDate) : null
      const bDueDate = b.dueDate ? new Date(b.dueDate) : null
      
      if (aDueDate && bDueDate) {
        const aOverdue = aDueDate < now
        const bOverdue = bDueDate < now
        
        if (aOverdue && !bOverdue) return -1
        if (!aOverdue && bOverdue) return 1
        if (aOverdue && bOverdue) {
          return aDueDate.getTime() - bDueDate.getTime()
        }
        return aDueDate.getTime() - bDueDate.getTime()
      }
      
      if (aDueDate && !bDueDate) return -1
      if (!aDueDate && bDueDate) return 1
      
      // Tertiary sort: RICE score (higher first)
      const aScore = a.riceScore || 0
      const bScore = b.riceScore || 0
      
      if (Math.abs(aScore - bScore) > 0.1) {
        return bScore - aScore
      }
      
      // Quaternary sort: Effort (smaller first for quick wins)
      const effortOrder = { XS: 0, S: 1, M: 2, L: 3, XL: 4 }
      const aEffort = effortOrder[a.effort as keyof typeof effortOrder] ?? 2
      const bEffort = effortOrder[b.effort as keyof typeof effortOrder] ?? 2
      
      if (aEffort !== bEffort) {
        return aEffort - bEffort
      }
      
      // Final sort: Last touched (older first)
      return new Date(a.lastTouchedAt).getTime() - new Date(b.lastTouchedAt).getTime()
    })
}

export function getRICEInsights(tasks: TaskWithRICE[]): {
  highRICE: TaskWithRICE[]
  lowRICE: TaskWithRICE[]
  quickWins: TaskWithRICE[]
  overdue: TaskWithRICE[]
} {
  const activeTasks = tasks.filter(task => task.status !== 'DONE')
  const now = new Date()
  
  const tasksWithRICE = activeTasks.map(task => ({
    ...task,
    riceScore: calculateTaskRICE(task)
  }))
  
  const sortedByRICE = [...tasksWithRICE].sort((a, b) => (b.riceScore || 0) - (a.riceScore || 0))
  
  return {
    highRICE: sortedByRICE.slice(0, 5), // Top 5 RICE scores
    lowRICE: sortedByRICE.slice(-5), // Bottom 5 RICE scores
    quickWins: tasksWithRICE
      .filter(task => task.effort === 'XS' || task.effort === 'S')
      .sort((a, b) => (b.riceScore || 0) - (a.riceScore || 0))
      .slice(0, 5),
    overdue: tasksWithRICE.filter(task => 
      task.dueDate && new Date(task.dueDate) < now
    )
  }
}

export function formatRICEScore(score: number): string {
  if (score >= 10) return '🔥 Very High'
  if (score >= 5) return '⚡ High'
  if (score >= 2) return '📈 Medium'
  if (score >= 1) return '📉 Low'
  return '🐌 Very Low'
}

export function getRICEAdvice(task: TaskWithRICE): string {
  const score = task.riceScore || calculateTaskRICE(task)
  
  if (score >= 10) {
    return '🚀 High impact! Consider making this a Must-Do.'
  }
  if (score >= 5) {
    return '⚡ Good candidate for Focus Block.'
  }
  if (score >= 2) {
    return '📈 Worth doing when you have time.'
  }
  if (score >= 1) {
    return '📉 Low priority. Consider delegating or deferring.'
  }
  return '🐌 Very low value. Consider archiving.'
}


