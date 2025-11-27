import { NextResponse } from 'next/server'
import { subjectService } from '@/services/subject.service'

export async function GET() {
    try {
        const states = await subjectService.getAllStates()
        return NextResponse.json(states)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch states' }, { status: 500 })
    }
}
