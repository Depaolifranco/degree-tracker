import { NextResponse } from 'next/server'
import { z } from 'zod'
import { signToken } from '@/lib/jwt'
import { userService } from '@/services/user.service'

const TOKEN_EXPIRATION_TIME_IN_SECONDS = 60 * 60 * 24 * 7 // 7 days

const loginSchema = z.object({
    email: z.email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
})

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const result = loginSchema.safeParse(body)

        if (!result.success) {
            return NextResponse.json(
                { error: 'Validation failed', details: result.error.flatten() },
                { status: 400 }
            )
        }

        const { email, password } = result.data

        const user = await userService.findByEmail(email)

        if (!user) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            )
        }

        const isValidPassword = await userService.verifyPassword(password, user.password)

        if (!isValidPassword) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            )
        }

        const userWithoutPassword = userService.removePassword(user)
        const token = await signToken({ userId: user.id, email: user.email })

        const response = NextResponse.json(
            { message: 'Login successful', user: userWithoutPassword },
            { status: 200 }
        )

        response.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: TOKEN_EXPIRATION_TIME_IN_SECONDS,
        })

        return response
    } catch (error) {
        console.error('Login error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
