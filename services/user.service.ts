import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export interface CreateUserData {
    name: string
    email: string
    password: string
    degreeId: number
}

export interface UserWithoutPassword {
    id: number
    email: string
    name: string | null
    degreeId: number | null
}

export const userService = {
    async findByEmail(email: string) {
        return prisma.user.findUnique({
            where: { email },
        })
    },

    async findById(id: number) {
        return prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                degreeId: true,
            },
        })
    },

    async create(data: CreateUserData): Promise<UserWithoutPassword> {
        const hashedPassword = await bcrypt.hash(data.password, 10)

        const user = await prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                password: hashedPassword,
                degreeId: data.degreeId,
            },
        })

        const { password: _, ...userWithoutPassword } = user
        return userWithoutPassword
    },

    async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
        return bcrypt.compare(plainPassword, hashedPassword)
    },

    removePassword<T extends { password?: string }>(user: T): Omit<T, 'password'> {
        const { password: _, ...userWithoutPassword } = user
        return userWithoutPassword
    },
}
