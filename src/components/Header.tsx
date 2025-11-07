import { AccentColor } from '@/lib/state'
import { Settings } from 'lucide-react'
import { useState } from 'react'
import Drawer from './Drawer'

type Tab = 'pomodoro' | 'projects' | 'weekly'

interface HeaderProps {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
  accentColor: AccentColor
  onAccentChange: (color: AccentColor) => void
}

const accentColors: AccentColor[] = ['indigo', 'blue', 'purple', 'fuchsia']

const accentClasses = {
  indigo: {
    text: 'text-indigo-400',
    bg: 'bg-indigo-500/20',
    ring: 'ring-indigo-500/40',
    border: 'border-indigo-500/40',
  },
  blue: {
    text: 'text-blue-400',
    bg: 'bg-blue-500/20',
    ring: 'ring-blue-500/40',
    border: 'border-blue-500/40',
  },
  purple: {
    text: 'text-purple-400',
    bg: 'bg-purple-500/20',
    ring: 'ring-purple-500/40',
    border: 'border-purple-500/40',
  },
  fuchsia: {
    text: 'text-fuchsia-400',
    bg: 'bg-fuchsia-500/20',
    ring: 'ring-fuchsia-500/40',
    border: 'border-fuchsia-500/40',
  },
}

export default function Header({ activeTab, onTabChange, accentColor, onAccentChange }: HeaderProps) {
  const [showSettings, setShowSettings] = useState(false)
  const accent = accentClasses[accentColor]

  return (
    <>
      <header className="border-b border-neutral-800 bg-neutral-900/50 backdrop-blur-sm">
        <div className="relative mx-auto max-w-4xl px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Get Stuff Done</h1>
            <nav className="flex items-center gap-2">
              <button
                onClick={() => onTabChange('pomodoro')}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  activeTab === 'pomodoro'
                    ? `${accent.bg} ${accent.text}`
                    : 'text-neutral-400 hover:text-neutral-100'
                }`}
              >
                Pomodoro
              </button>
              <button
                onClick={() => onTabChange('projects')}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  activeTab === 'projects'
                    ? `${accent.bg} ${accent.text}`
                    : 'text-neutral-400 hover:text-neutral-100'
                }`}
              >
                Projects
              </button>
              <button
                onClick={() => onTabChange('weekly')}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  activeTab === 'weekly'
                    ? `${accent.bg} ${accent.text}`
                    : 'text-neutral-400 hover:text-neutral-100'
                }`}
              >
                Weekly
              </button>
              <div className="ml-4 flex items-center gap-2">
                <div className="flex gap-1 rounded-lg border border-neutral-800 p-1">
                  {accentColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => onAccentChange(color)}
                      className={`h-6 w-6 rounded transition-all hover:scale-110 ${
                        accentColor === color
                          ? `${accentClasses[color].bg} ${accentClasses[color].border} border-2 scale-110`
                          : 'opacity-50 hover:opacity-100'
                      }`}
                      style={{
                        backgroundColor:
                          color === 'indigo'
                            ? '#6366f1'
                            : color === 'blue'
                              ? '#3b82f6'
                              : color === 'purple'
                                ? '#a855f7'
                                : '#d946ef',
                      }}
                      title={color}
                    />
                  ))}
                </div>
                <button
                  onClick={() => setShowSettings(true)}
                  className={`rounded-lg p-2 transition-all hover:${accent.bg} ${accent.text} hover:scale-105`}
                >
                  <Settings className="h-5 w-5" />
                </button>
              </div>
            </nav>
          </div>
        </div>
      </header>
      {showSettings && (
        <Drawer
          title="Settings"
          onClose={() => setShowSettings(false)}
          accentColor={accentColor}
        >
          <SettingsContent />
        </Drawer>
      )}
    </>
  )
}

function SettingsContent() {
  const handleExport = () => {
    const data = localStorage.getItem('getstuffdone-state')
    if (data) {
      const blob = new Blob([data], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `getstuffdone-backup-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'application/json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (event) => {
          try {
            const data = event.target?.result as string
            const parsed = JSON.parse(data)
            localStorage.setItem('getstuffdone-state', JSON.stringify(parsed))
            window.location.reload()
          } catch (error) {
            alert('Failed to import. Please check the file format.')
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  const handleClear = () => {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      localStorage.removeItem('getstuffdone-state')
      window.location.reload()
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="mb-2 text-sm font-semibold text-neutral-300">Data Management</h3>
        <div className="space-y-2">
          <button
            onClick={handleExport}
            className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2 text-sm transition-all hover:bg-neutral-700"
          >
            Export Data (JSON)
          </button>
          <button
            onClick={handleImport}
            className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2 text-sm transition-all hover:bg-neutral-700"
          >
            Import Data (JSON)
          </button>
          <button
            onClick={handleClear}
            className="w-full rounded-lg border border-red-700 bg-red-900/20 px-4 py-2 text-sm text-red-400 transition-all hover:bg-red-900/30"
          >
            Clear All Data
          </button>
        </div>
      </div>
    </div>
  )
}

