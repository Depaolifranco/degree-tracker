import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        const states = await prisma.subjectState.findMany()
        return NextResponse.json(states)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch states' }, { status: 500 })
    }
}
