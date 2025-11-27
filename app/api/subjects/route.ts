import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('userId')

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
        }

        const user = await prisma.user.findUnique({
            where: { id: parseInt(userId) },
            include: { degree: true },
        })

        if (!user || !user.degreeId) {
            return NextResponse.json({ error: 'User or degree not found' }, { status: 404 })
        }

        const subjects = await prisma.subject.findMany({
            where: { degreeId: user.degreeId },
            include: {
                userProgress: {
                    where: { userId: parseInt(userId) },
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
