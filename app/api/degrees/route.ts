import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        const degrees = await prisma.degree.findMany()
        return NextResponse.json(degrees)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch degrees' }, { status: 500 })
    }
}
