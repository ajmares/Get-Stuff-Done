import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const tasks = await prisma.task.findMany({
      include: {
        project: {
          select: {
            name: true
          }
        }
      },
      orderBy: [
        { priority: 'asc' },
        { dueDate: 'asc' },
        { createdAt: 'asc' }
      ]
    })

    return NextResponse.json(tasks)
  } catch (error) {
    console.error('Failed to fetch tasks:', error)
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, projectId, priority = 'P2', effort = 'M', dueDate, labels } = body

    // Handle project creation if projectName is provided
    let finalProjectId = projectId
    if (body.projectName && !projectId) {
      // Check if project exists, create if not
      const existingProject = await prisma.project.findFirst({
        where: { name: body.projectName }
      })
      
      if (existingProject) {
        finalProjectId = existingProject.id
      } else {
        const newProject = await prisma.project.create({
          data: { name: body.projectName }
        })
        finalProjectId = newProject.id
      }
    }

    const task = await prisma.task.create({
      data: {
        title,
        projectId: finalProjectId,
        priority,
        effort,
        dueDate: dueDate ? new Date(dueDate) : null,
        labels: labels ? JSON.stringify(labels) : '[]'
      },
      include: {
        project: {
          select: {
            name: true
          }
        }
      }
    })

    return NextResponse.json(task)
  } catch (error) {
    console.error('Failed to create task:', error)
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 })
  }
}
