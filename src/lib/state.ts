export type AccentColor = 'indigo' | 'blue' | 'purple' | 'fuchsia'

export type PomodoroMode = 'work' | 'shortBreak' | 'longBreak'

export interface PomodoroSettings {
  workDuration: number // minutes
  shortBreakDuration: number // minutes
  longBreakDuration: number // minutes
  intervalsBeforeLong: number
  autoStartNext: boolean
}

export interface PomodoroTask {
  id: string
  title: string
  notes: string
  completed: boolean
  order: number
  createdAt: number
  updatedAt: number
}

export interface PomodoroState {
  mode: PomodoroMode
  remaining: number // seconds
  isRunning: boolean
  completedIntervals: number
  currentTaskId: string | null
  settings: PomodoroSettings
  tasks: PomodoroTask[]
  updatedAt: number
}

export type ProjectPriority = 'Low' | 'Med' | 'High'

export interface ProjectChecklistItem {
  id: string
  text: string
  checked: boolean
}

export interface Project {
  id: string
  title: string
  description: string
  checklist: ProjectChecklistItem[]
  tags: string[]
  priority: ProjectPriority
  columnId: string
  order: number
  createdAt: number
  updatedAt: number
}

export interface Column {
  id: string
  title: string
  order: number
  projectIds: string[]
}

export interface ProjectsState {
  columns: Column[]
  projects: Project[]
  updatedAt: number
}

export interface WeeklyState {
  [weekIso: string]: {
    big3ProjectIds: string[]
    updatedAt: number
  }
}

export interface AppState {
  accentColor: AccentColor
  pomodoro: PomodoroState
  projects: ProjectsState
  weekly: WeeklyState
  updatedAt: number
}

const defaultPomodoroSettings: PomodoroSettings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  intervalsBeforeLong: 4,
  autoStartNext: false,
}

const defaultPomodoroState: PomodoroState = {
  mode: 'work',
  remaining: 25 * 60,
  isRunning: false,
  completedIntervals: 0,
  currentTaskId: null,
  settings: defaultPomodoroSettings,
  tasks: [],
  updatedAt: Date.now(),
}

const defaultColumns: Column[] = [
  { id: 'backlog', title: 'Backlog', order: 0, projectIds: [] },
  { id: 'in-progress', title: 'In Progress', order: 1, projectIds: [] },
  { id: 'blocked', title: 'Blocked', order: 2, projectIds: [] },
  { id: 'done', title: 'Done', order: 3, projectIds: [] },
]

const defaultProjectsState: ProjectsState = {
  columns: defaultColumns,
  projects: [],
  updatedAt: Date.now(),
}

export const initialState: AppState = {
  accentColor: 'indigo',
  pomodoro: defaultPomodoroState,
  projects: defaultProjectsState,
  weekly: {},
  updatedAt: Date.now(),
}

// Seed data for first-time users
export function getSeedData(): AppState {
  const sampleProject: Project = {
    id: 'sample-1',
    title: 'Sample Project',
    description: 'This is a sample project to demonstrate the app. Try editing it!',
    checklist: [
      { id: 'c1', text: 'Task 1', checked: false },
      { id: 'c2', text: 'Task 2', checked: false },
      { id: 'c3', text: 'Task 3', checked: true },
    ],
    tags: ['sample'],
    priority: 'Med',
    columnId: 'backlog',
    order: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }

  return {
    ...initialState,
    projects: {
      columns: defaultColumns,
      projects: [sampleProject],
      updatedAt: Date.now(),
    },
  }
}

