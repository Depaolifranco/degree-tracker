import { prisma } from '@/lib/prisma'

export const subjectService = {
    async getSubjectsWithProgressByUserId(userId: number) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { degree: true },
        })

        if (!user || !user.degreeId) {
            return null
        }

        const subjects = await prisma.subject.findMany({
            where: { degreeId: user.degreeId },
            include: {
                userProgress: {
                    where: { userId },
                    include: { state: true },
                },
            },
            orderBy: { quarter: 'asc' },
        })

        const pendingState = await prisma.subjectState.findUnique({
            where: { name: 'Pendiente' },
        })

        return subjects.map((subject) => ({
            id: subject.id,
            name: subject.name,
            quarter: subject.quarter,
            status: subject.userProgress[0]?.state || pendingState,
        }))
    },

    async updateUserSubjectStatus(userId: number, subjectId: number, stateId: number) {
        const existingProgress = await prisma.userSubjectProgress.findUnique({
            where: {
                userId_subjectId: {
                    userId,
                    subjectId,
                },
            },
        })

        if (existingProgress) {
            return prisma.userSubjectProgress.update({
                where: { id: existingProgress.id },
                data: { stateId },
                include: { state: true },
            })
        } else {
            return prisma.userSubjectProgress.create({
                data: {
                    userId,
                    subjectId,
                    stateId,
                },
                include: { state: true },
            })
        }
    },

    async getAllStates() {
        return prisma.subjectState.findMany()
    },
}
