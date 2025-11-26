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
    // Year 1
    const algebra = await prisma.subject.create({
        data: {
            name: 'Álgebra y Geometría Analítica',
            degreeId: degree.id,
        },
    })

    const analisis1 = await prisma.subject.create({
        data: {
            name: 'Análisis Matemático I',
            degreeId: degree.id,
        },
    })

    // Year 2 (Requires Year 1 subjects)
    // Análisis II requires Análisis I (Regularizada to take, Aprobada to pass? Usually just Regularized to take)
    // Let's say to take Análisis II you need Análisis I Regularized.

    const regularizadaState = await prisma.subjectState.findUnique({ where: { name: 'Regularizada' } })
    const aprobadaState = await prisma.subjectState.findUnique({ where: { name: 'Aprobada' } })

    if (!regularizadaState || !aprobadaState) throw new Error('States not found')

    const analisis2 = await prisma.subject.create({
        data: {
            name: 'Análisis Matemático II',
            degreeId: degree.id,
            prerequisites: {
                create: [
                    {
                        prerequisiteSubjectId: analisis1.id,
                        requiredStateId: regularizadaState.id, // Need Analisis 1 Regularized
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
