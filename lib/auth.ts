import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt'

export async function authenticateRequest() {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value

    if (!token) {
        return { error: NextResponse.json({ error: 'Not authenticated' }, { status: 401 }) }
    }

    const payload = await verifyToken(token)

    if (!payload) {
        return { error: NextResponse.json({ error: 'Invalid token' }, { status: 401 }) }
    }

    return { userId: payload.userId, email: payload.email }
}
