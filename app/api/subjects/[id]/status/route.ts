import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/jwt'
import { z } from 'zod'

const updateStatusSchema = z.object({
    stateId: z.number().int(),
})

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('token')?.value
        if (!token) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
        }

        const payload = await verifyToken(token)
        if (!payload) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
        }

        const { id } = await params
        const subjectId = parseInt(id)
        const body = await request.json()
        const result = updateStatusSchema.safeParse(body)

        if (!result.success) {
            return NextResponse.json(
                { error: 'Validation failed', details: result.error.flatten() },
                { status: 400 }
            )
        }

        const { stateId } = result.data
        const userId = payload.userId
        const existingProgress = await prisma.userSubjectProgress.findUnique({
            where: {
                userId_subjectId: {
                    userId,
                    subjectId,
                },
            },
        })

        let progress
        if (existingProgress) {
            progress = await prisma.userSubjectProgress.update({
                where: { id: existingProgress.id },
                data: { stateId },
                include: { state: true },
            })
        } else {
            progress = await prisma.userSubjectProgress.create({
                data: {
                    userId,
                    subjectId,
                    stateId,
                },
                include: { state: true },
            })
        }

        return NextResponse.json({ message: 'Status updated', progress })
    } catch (error) {
        console.error('Error updating status:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

