import { NextResponse } from 'next/server'
import { z } from 'zod'
import { signToken } from '@/lib/jwt'
import { userService } from '@/services/user.service'

const TOKEN_EXPIRATION_TIME_IN_SECONDS = 60 * 60 * 24 * 7 // 7 days

const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
    degreeId: z.number().int('Degree is required'),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
})

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const result = registerSchema.safeParse(body)

        if (!result.success) {
            return NextResponse.json(
                { error: 'Validation failed', details: result.error.flatten() },
                { status: 400 }
            )
        }

        const { name, email, password, degreeId } = result.data

        const existingUser = await userService.findByEmail(email)

        if (existingUser) {
            return NextResponse.json(
                { error: 'User with this email already exists' },
                { status: 409 }
            )
        }

        const user = await userService.create({ name, email, password, degreeId })
        const token = await signToken({ userId: user.id, email: user.email })

        const response = NextResponse.json(
            { message: 'User registered successfully', user },
            { status: 201 }
        )

        response.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: TOKEN_EXPIRATION_TIME_IN_SECONDS,
        })

        return response
    } catch (error) {
        console.error('Registration error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
