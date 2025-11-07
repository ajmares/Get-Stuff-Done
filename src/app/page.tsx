'use client'

import { useState } from 'react'
import { TodayView } from '@/components/TodayView'
import { WeekView } from '@/components/WeekView'
import { ProjectsView } from '@/components/ProjectsView'
import { WeeklyReview } from '@/components/WeeklyReview'

export default function Home() {
  const [currentView, setCurrentView] = useState<'today' | 'week' | 'projects' | 'review'>('today')

  return (
    <>
      {currentView === 'today' && (
        <TodayView 
          onNavigateToWeek={() => setCurrentView('week')}
          onNavigateToProjects={() => setCurrentView('projects')}
          onNavigateToReview={() => setCurrentView('review')}
        />
      )}
      {currentView === 'week' && (
        <WeekView onNavigateToToday={() => setCurrentView('today')} />
      )}
      {currentView === 'projects' && (
        <ProjectsView onNavigateToToday={() => setCurrentView('today')} />
      )}
      {currentView === 'review' && (
        <WeeklyReview onNavigateToToday={() => setCurrentView('today')} />
      )}
    </>
  )
}
