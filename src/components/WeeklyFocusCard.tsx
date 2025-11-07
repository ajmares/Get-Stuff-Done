'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, X, Target, Lightbulb } from 'lucide-react'

interface WeeklyFocusCardProps {
  weeklyFocus: {
    id: string
    themes: string[]
    targets: string[]
    committedMustDosPerDay: number
  }
  onUpdate: (data: {
    themes: string[]
    targets: string[]
    committedMustDosPerDay: number
  }) => void
}

export function WeeklyFocusCard({ weeklyFocus, onUpdate }: WeeklyFocusCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [newTheme, setNewTheme] = useState('')
  const [newTarget, setNewTarget] = useState('')
  const [themes, setThemes] = useState(weeklyFocus.themes || [])
  const [targets, setTargets] = useState(weeklyFocus.targets || [])
  const [mustDosPerDay, setMustDosPerDay] = useState(weeklyFocus.committedMustDosPerDay || 3)

  const handleSave = () => {
    onUpdate({
      themes,
      targets,
      committedMustDosPerDay: mustDosPerDay
    })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setThemes(weeklyFocus.themes || [])
    setTargets(weeklyFocus.targets || [])
    setMustDosPerDay(weeklyFocus.committedMustDosPerDay || 3)
    setIsEditing(false)
  }

  const addTheme = () => {
    if (newTheme.trim() && themes.length < 3) {
      setThemes([...themes, newTheme.trim()])
      setNewTheme('')
    }
  }

  const removeTheme = (index: number) => {
    setThemes(themes.filter((_, i) => i !== index))
  }

  const addTarget = () => {
    if (newTarget.trim()) {
      setTargets([...targets, newTarget.trim()])
      setNewTarget('')
    }
  }

  const removeTarget = (index: number) => {
    setTargets(targets.filter((_, i) => i !== index))
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Weekly Focus</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'Cancel' : 'Edit'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Themes */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="h-4 w-4 text-yellow-600" />
            <h3 className="font-medium">Themes (max 3)</h3>
          </div>
          {isEditing ? (
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={newTheme}
                  onChange={(e) => setNewTheme(e.target.value)}
                  placeholder="Add a weekly theme..."
                  className="flex-1"
                  onKeyPress={(e) => e.key === 'Enter' && addTheme()}
                />
                <Button
                  onClick={addTheme}
                  disabled={!newTheme.trim() || themes.length >= 3}
                  size="sm"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-1">
                {themes.map((theme, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Badge variant="outline" className="flex-1 justify-start">
                      {theme}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTheme(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              {themes.length === 0 ? (
                <p className="text-gray-500 italic">No themes set</p>
              ) : (
                themes.map((theme, index) => (
                  <Badge key={index} variant="outline" className="mr-2">
                    {theme}
                  </Badge>
                ))
              )}
            </div>
          )}
        </div>

        {/* Targets */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-4 w-4 text-blue-600" />
            <h3 className="font-medium">Targets</h3>
          </div>
          {isEditing ? (
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={newTarget}
                  onChange={(e) => setNewTarget(e.target.value)}
                  placeholder="Add a target..."
                  className="flex-1"
                  onKeyPress={(e) => e.key === 'Enter' && addTarget()}
                />
                <Button
                  onClick={addTarget}
                  disabled={!newTarget.trim()}
                  size="sm"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-1">
                {targets.map((target, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="flex-1 text-sm">{target}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTarget(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              {targets.length === 0 ? (
                <p className="text-gray-500 italic">No targets set</p>
              ) : (
                targets.map((target, index) => (
                  <div key={index} className="text-sm text-gray-700">
                    • {target}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Must-Dos per Day */}
        <div>
          <h3 className="font-medium mb-2">Must-Dos per Day</h3>
          {isEditing ? (
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="1"
                max="10"
                value={mustDosPerDay}
                onChange={(e) => setMustDosPerDay(parseInt(e.target.value) || 3)}
                className="w-20"
              />
              <span className="text-sm text-gray-600">tasks per day</span>
            </div>
          ) : (
            <div className="text-sm text-gray-700">
              {mustDosPerDay} tasks per day
            </div>
          )}
        </div>

        {isEditing && (
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

