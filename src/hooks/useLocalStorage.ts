import { useState, useEffect } from 'react'
import { AppState, initialState, getSeedData } from '@/lib/state'

const STORAGE_KEY = 'getstuffdone-state'

export function useLocalStorage<T extends AppState>(): [T, (state: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(STORAGE_KEY)
      if (item) {
        const parsed = JSON.parse(item) as T
        // Migrate tasks to include order field if missing
        const migratedPomodoro = parsed.pomodoro
          ? {
              ...initialState.pomodoro,
              ...parsed.pomodoro,
              tasks: parsed.pomodoro.tasks?.map((task: any, index: number) => ({
                ...task,
                order: task.order !== undefined ? task.order : index,
              })) || [],
              settings: {
                ...initialState.pomodoro.settings,
                ...parsed.pomodoro?.settings,
              },
            }
          : initialState.pomodoro
        // Ensure all required fields exist
        return {
          ...initialState,
          ...parsed,
          pomodoro: migratedPomodoro,
          projects: {
            ...initialState.projects,
            ...parsed.projects,
            columns: parsed.projects?.columns || initialState.projects.columns,
          },
        } as T
      }
      // First time user - return seed data
      return getSeedData() as T
    } catch (error) {
      console.error('Error loading state from localStorage:', error)
      return getSeedData() as T
    }
  })

  useEffect(() => {
    try {
      const stateToSave = {
        ...state,
        updatedAt: Date.now(),
      }
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave))
    } catch (error) {
      console.error('Error saving state to localStorage:', error)
    }
  }, [state])

  const updateState = (newState: T | ((prev: T) => T)) => {
    setState((prev) => {
      const next = typeof newState === 'function' ? newState(prev) : newState
      return {
        ...next,
        updatedAt: Date.now(),
      }
    })
  }

  return [state, updateState]
}

