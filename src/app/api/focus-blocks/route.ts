import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const focusBlocks = await prisma.focusBlock.findMany({
      include: {
        task: {
          select: {
            title: true,
            project: {
              select: {
                name: true
              }
            }
          }
        },
        project: {
          select: {
            name: true
          }
        }
      },
      orderBy: [
        { date: 'asc' },
        { start: 'asc' }
      ]
    })

    return NextResponse.json(focusBlocks)
  } catch (error) {
    console.error('Failed to fetch focus blocks:', error)
    return NextResponse.json({ error: 'Failed to fetch focus blocks' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, taskId, projectId, date, start, end, location, notes } = body

    const focusBlock = await prisma.focusBlock.create({
      data: {
        title,
        taskId,
        projectId,
        date: new Date(date),
        start,
        end,
        location,
        notes
      },
      include: {
        task: {
          select: {
            title: true,
            project: {
              select: {
                name: true
              }
            }
          }
        },
        project: {
          select: {
            name: true
          }
        }
      }
    })

    return NextResponse.json(focusBlock)
  } catch (error) {
    console.error('Failed to create focus block:', error)
    return NextResponse.json({ error: 'Failed to create focus block' }, { status: 500 })
  }
}

