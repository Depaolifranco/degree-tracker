import { NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'
import { subjectService } from '@/services/subject.service'

export async function GET() {
    try {
        const auth = await authenticateRequest()

        if ('error' in auth) {
            return auth.error
        }

        const subjects = await subjectService.getSubjectsWithProgressByUserId(auth.userId)
        if (!subjects) {
            return NextResponse.json({ error: 'User or degree not found' }, { status: 404 })
        }

        return NextResponse.json(subjects)
    } catch (error) {
        console.error('Error fetching subjects:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
