import { NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'
import { userService } from '@/services/user.service'

export async function GET() {
    try {
        const auth = await authenticateRequest()

        if ('error' in auth) {
            return auth.error
        }

        const user = await userService.findById(auth.userId)

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        return NextResponse.json({ user })
    } catch (error) {
        console.error('Auth error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
