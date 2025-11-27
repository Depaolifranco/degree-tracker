import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/jwt'

export async function GET() {
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

        const user = await prisma.user.findUnique({
            where: { id: payload.userId },
            include: { degree: true },
        })
        if (!user || !user.degreeId) {
            return NextResponse.json({ error: 'User or degree not found' }, { status: 404 })
        }

        const subjects = await prisma.subject.findMany({
            where: { degreeId: user.degreeId },
            include: {
                userProgress: {
                    where: { userId: payload.userId },
                    include: { state: true },
                },
            },
            orderBy: { quarter: 'asc' },
        })

        const pendingState = await prisma.subjectState.findUnique({
            where: { name: 'Pendiente' },
        })

        const subjectsWithStatus = subjects.map((subject) => ({
            id: subject.id,
            name: subject.name,
            quarter: subject.quarter,
            status: subject.userProgress[0]?.state || pendingState,
        }))

        return NextResponse.json(subjectsWithStatus)
    } catch (error) {
        console.error('Error fetching subjects:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

