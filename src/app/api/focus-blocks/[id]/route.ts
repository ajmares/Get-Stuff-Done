import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { completedAt } = body

    const focusBlock = await prisma.focusBlock.update({
      where: { id },
      data: {
        completedAt: completedAt ? new Date(completedAt) : null
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
    console.error('Failed to update focus block:', error)
    return NextResponse.json({ error: 'Failed to update focus block' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.focusBlock.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete focus block:', error)
    return NextResponse.json({ error: 'Failed to delete focus block' }, { status: 500 })
  }
}

