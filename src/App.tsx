import { useState } from 'react'
import { useLocalStorage } from './hooks/useLocalStorage'
import { AppState } from './lib/state'
import Header from './components/Header'
import PomodoroPage from './pages/PomodoroPage'
import ProjectsPage from './pages/ProjectsPage'
import WeeklyPage from './pages/WeeklyPage'

type Tab = 'pomodoro' | 'projects' | 'weekly'

function App() {
  const [state, setState] = useLocalStorage<AppState>()
  const [activeTab, setActiveTab] = useState<Tab>('pomodoro')

  return (
    <div className="min-h-screen bg-neutral-950">
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        accentColor={state.accentColor}
        onAccentChange={(color) => setState((prev) => ({ ...prev, accentColor: color }))}
      />
      <main className="mx-auto max-w-4xl px-4 py-8">
        {activeTab === 'pomodoro' && (
          <PomodoroPage
            state={state.pomodoro}
            onUpdate={(pomodoro) => setState((prev) => ({ ...prev, pomodoro }))}
            accentColor={state.accentColor}
          />
        )}
        {activeTab === 'projects' && (
          <ProjectsPage
            state={state.projects}
            onUpdate={(projects) => setState((prev) => ({ ...prev, projects }))}
            accentColor={state.accentColor}
          />
        )}
        {activeTab === 'weekly' && (
          <WeeklyPage
            projectsState={state.projects}
            weeklyState={state.weekly}
            onWeeklyUpdate={(weekly) => setState((prev) => ({ ...prev, weekly }))}
            accentColor={state.accentColor}
          />
        )}
      </main>
    </div>
  )
}

export default App

