import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Get current week's focus
    const now = new Date()
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()))
    const weekStartISO = `2024-W${Math.ceil((startOfWeek.getTime() - new Date(startOfWeek.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000))}`
    
    let weeklyFocus = await prisma.weeklyFocus.findUnique({
      where: { weekStartISO }
    })

    // Create if doesn't exist
    if (!weeklyFocus) {
      weeklyFocus = await prisma.weeklyFocus.create({
        data: {
          weekStartISO,
          themes: [],
          targets: [],
          committedMustDosPerDay: 3
        }
      })
    }

    return NextResponse.json(weeklyFocus)
  } catch (error) {
    console.error('Failed to fetch weekly focus:', error)
    return NextResponse.json({ error: 'Failed to fetch weekly focus' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { themes, targets, committedMustDosPerDay } = body

    const now = new Date()
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()))
    const weekStartISO = `2024-W${Math.ceil((startOfWeek.getTime() - new Date(startOfWeek.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000))}`

    const weeklyFocus = await prisma.weeklyFocus.upsert({
      where: { weekStartISO },
      update: {
        themes: themes ? JSON.stringify(themes) : undefined,
        targets: targets ? JSON.stringify(targets) : undefined,
        committedMustDosPerDay
      },
      create: {
        weekStartISO,
        themes: themes ? JSON.stringify(themes) : '[]',
        targets: targets ? JSON.stringify(targets) : '[]',
        committedMustDosPerDay: committedMustDosPerDay || 3
      }
    })

    return NextResponse.json(weeklyFocus)
  } catch (error) {
    console.error('Failed to update weekly focus:', error)
    return NextResponse.json({ error: 'Failed to update weekly focus' }, { status: 500 })
  }
}

