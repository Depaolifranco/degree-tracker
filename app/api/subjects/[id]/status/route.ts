import { NextResponse } from 'next/server'
import { z } from 'zod'
import { authenticateRequest } from '@/lib/auth'
import { subjectService } from '@/services/subject.service'

const updateStatusSchema = z.object({
    stateId: z.number().int(),
})

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const auth = await authenticateRequest()
        if ('error' in auth) {
            return auth.error
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
        const progress = await subjectService.updateUserSubjectStatus(
            auth.userId,
            subjectId,
            stateId
        )

        return NextResponse.json({ message: 'Status updated', progress })
    } catch (error) {
        console.error('Error updating status:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
