import { SignJWT, jwtVerify } from 'jose'

const secret = new TextEncoder().encode(
    process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'
)

export async function signToken(payload: { userId: number; email: string }) {
    const token = await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(secret)

    return token
}

export async function verifyToken(token: string) {
    try {
        const { payload } = await jwtVerify(token, secret)
        return payload as { userId: number; email: string }
    } catch (error) {
        return null
    }
}
