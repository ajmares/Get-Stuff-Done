import { Priority, Effort } from '@prisma/client'

export interface ParsedTask {
  title: string
  projectName?: string
  priority?: Priority
  effort?: Effort
  dueDate?: Date
  labels?: string[]
}

export function parseQuickAdd(text: string): ParsedTask {
  let title = text.trim()
  let projectName: string | undefined
  let priority: Priority | undefined
  let effort: Effort | undefined
  let dueDate: Date | undefined
  let labels: string[] = []

  // Parse project (#project)
  const projectMatch = title.match(/#(\w+)/)
  if (projectMatch) {
    projectName = projectMatch[1]
    title = title.replace(/#\w+/, '').trim()
  }

  // Parse priority (!P0, !P1, !P2, !P3)
  const priorityMatch = title.match(/!P([0-3])/)
  if (priorityMatch) {
    priority = `P${priorityMatch[1]}` as Priority
    title = title.replace(/!P[0-3]/, '').trim()
  }

  // Parse effort (^XS, ^S, ^M, ^L, ^XL)
  const effortMatch = title.match(/\^(XS|S|M|L|XL)/)
  if (effortMatch) {
    effort = effortMatch[1] as Effort
    title = title.replace(/\^(XS|S|M|L|XL)/, '').trim()
  }

  // Parse due date (@today, @tomorrow, @EOW, @2024-10-15, @2024-10-15 09:00-11:00)
  const dateMatch = title.match(/@(today|tomorrow|EOW|\d{4}-\d{2}-\d{2}(?:\s+\d{2}:\d{2}-\d{2}:\d{2})?)/)
  if (dateMatch) {
    const dateStr = dateMatch[1]
    const now = new Date()
    
    if (dateStr === 'today') {
      dueDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59)
    } else if (dateStr === 'tomorrow') {
      const tomorrow = new Date(now)
      tomorrow.setDate(tomorrow.getDate() + 1)
      dueDate = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 23, 59)
    } else if (dateStr === 'EOW') {
      // End of week (Friday)
      const daysUntilFriday = (5 - now.getDay()) % 7
      const friday = new Date(now)
      friday.setDate(friday.getDate() + daysUntilFriday)
      dueDate = new Date(friday.getFullYear(), friday.getMonth(), friday.getDate(), 23, 59)
    } else if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      // Date only
      dueDate = new Date(dateStr + 'T23:59:00')
    } else if (dateStr.match(/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}-\d{2}:\d{2}$/)) {
      // Date with time range
      const [datePart, timeRange] = dateStr.split(' ')
      const [startTime] = timeRange.split('-')
      dueDate = new Date(datePart + 'T' + startTime + ':00')
    }
    
    title = title.replace(/@(today|tomorrow|EOW|\d{4}-\d{2}-\d{2}(?:\s+\d{2}:\d{2}-\d{2}:\d{2})?)/, '').trim()
  }

  // Parse labels (sales, ops, labs, finance, content, personal, admin)
  const labelKeywords = ['sales', 'ops', 'labs', 'finance', 'content', 'personal', 'admin']
  for (const label of labelKeywords) {
    if (title.toLowerCase().includes(label)) {
      labels.push(label)
      title = title.replace(new RegExp(label, 'gi'), '').trim()
    }
  }

  // Clean up extra spaces
  title = title.replace(/\s+/g, ' ').trim()

  return {
    title,
    projectName,
    priority,
    effort,
    dueDate,
    labels: labels.length > 0 ? labels : undefined
  }
}

// Helper function to format parsed task for display
export function formatParsedTask(parsed: ParsedTask): string {
  let result = parsed.title
  
  if (parsed.projectName) {
    result += ` #${parsed.projectName}`
  }
  
  if (parsed.priority) {
    result += ` !${parsed.priority}`
  }
  
  if (parsed.effort) {
    result += ` ^${parsed.effort}`
  }
  
  if (parsed.dueDate) {
    const dateStr = parsed.dueDate.toISOString().split('T')[0]
    result += ` @${dateStr}`
  }
  
  if (parsed.labels && parsed.labels.length > 0) {
    result += ` ${parsed.labels.join(' ')}`
  }
  
  return result
}

