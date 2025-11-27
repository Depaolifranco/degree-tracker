import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Start seeding ...')

    // 1. Create Subject States
    const states = ['Pendiente', 'Cursando', 'Regularizada', 'Aprobada']

    for (const stateName of states) {
        await prisma.subjectState.upsert({
            where: { name: stateName },
            update: {},
            create: { name: stateName },
        })
    }
    console.log('Created Subject States')

    // 2. Create a Degree
    const degree = await prisma.degree.create({
        data: {
            name: 'Ingeniería en Sistemas',
        },
    })
    console.log(`Created Degree: ${degree.name}`)

    // 3. Create Subjects
    // Quarter 1
    const algebra = await prisma.subject.create({
        data: {
            name: 'Álgebra y Geometría Analítica',
            quarter: 1,
            degreeId: degree.id,
        },
    })

    const analisis1 = await prisma.subject.create({
        data: {
            name: 'Análisis Matemático I',
            quarter: 1,
            degreeId: degree.id,
        },
    })

    // Quarter 2 (Requires Quarter 1 subjects)
    const regularizadaState = await prisma.subjectState.findUnique({ where: { name: 'Regularizada' } })
    const aprobadaState = await prisma.subjectState.findUnique({ where: { name: 'Aprobada' } })

    if (!regularizadaState || !aprobadaState) throw new Error('States not found')

    const analisis2 = await prisma.subject.create({
        data: {
            name: 'Análisis Matemático II',
            quarter: 2,
            degreeId: degree.id,
            prerequisites: {
                create: [
                    {
                        prerequisiteSubjectId: analisis1.id,
                        requiredStateId: regularizadaState.id,
                    }
                ]
            }
        },
    })

    console.log('Created Subjects with Correlativities')
    console.log('Seeding finished.')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
