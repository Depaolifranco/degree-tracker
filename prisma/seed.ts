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

    // Get states for prerequisites
    const regularizadaState = await prisma.subjectState.findUnique({ where: { name: 'Regularizada' } })
    const aprobadaState = await prisma.subjectState.findUnique({ where: { name: 'Aprobada' } })
    if (!regularizadaState || !aprobadaState) throw new Error('States not found')

    // 2. Create Bioquímica Degree
    const degree = await prisma.degree.create({
        data: {
            name: 'Bioquímica',
        },
    })
    console.log(`Created Degree: ${degree.name}`)

    // 3. Create Subjects by Quarter
    // Quarter 1
    const quimicaCBC = await prisma.subject.create({
        data: { name: 'Química(CBC)', quarter: 1, degreeId: degree.id },
    })
    const sociedadEstadoCBC = await prisma.subject.create({
        data: { name: 'Sociedad y Estado(CBC)', quarter: 1, degreeId: degree.id },
    })
    const pensamientoCientificoCBC = await prisma.subject.create({
        data: { name: 'Pensamiento Científico(CBC)', quarter: 1, degreeId: degree.id },
    })

    // Quarter 2
    const matematicaCBC = await prisma.subject.create({
        data: { name: 'Matemática(CBC)', quarter: 2, degreeId: degree.id },
    })
    const biofisicaCBC = await prisma.subject.create({
        data: { name: 'Biofísica(CBC)', quarter: 2, degreeId: degree.id },
    })
    const biologiaCelularCBC = await prisma.subject.create({
        data: { name: 'Biología Celular(CBC)', quarter: 2, degreeId: degree.id },
    })

    // Quarter 3
    const quimicaGeneral = await prisma.subject.create({
        data: { name: 'Química General e Inorgánica', quarter: 3, degreeId: degree.id },
    })
    const matematica = await prisma.subject.create({
        data: { name: 'Matemática', quarter: 3, degreeId: degree.id },
    })
    const anatomia = await prisma.subject.create({
        data: { name: 'Anatomía e Histología', quarter: 3, degreeId: degree.id },
    })

    // Quarter 4
    const fisica = await prisma.subject.create({
        data: { name: 'Física', quarter: 4, degreeId: degree.id },
    })
    const biologiaCelular = await prisma.subject.create({
        data: { name: 'Biología Celular y Molecular', quarter: 4, degreeId: degree.id },
    })
    const quimicaOrganica1 = await prisma.subject.create({
        data: {
            name: 'Química Orgánica I',
            quarter: 4,
            degreeId: degree.id,
            prerequisites: {
                create: [
                    { prerequisiteSubjectId: quimicaGeneral.id, requiredStateId: aprobadaState.id }
                ]
            }
        },
    })

    // Quarter 5
    const quimicaOrganica2 = await prisma.subject.create({
        data: {
            name: 'Química Orgánica II',
            quarter: 5,
            degreeId: degree.id,
            prerequisites: {
                create: [
                    { prerequisiteSubjectId: quimicaOrganica1.id, requiredStateId: regularizadaState.id },
                    { prerequisiteSubjectId: quimicaOrganica1.id, requiredStateId: aprobadaState.id }
                ]
            }
        },
    })
    const fisiologia = await prisma.subject.create({
        data: {
            name: 'Fisiología',
            quarter: 5,
            degreeId: degree.id,
            prerequisites: {
                create: [
                    { prerequisiteSubjectId: biologiaCelular.id, requiredStateId: regularizadaState.id },
                    { prerequisiteSubjectId: biologiaCelular.id, requiredStateId: aprobadaState.id }
                ]
            }
        },
    })
    const quimicaAnalitica = await prisma.subject.create({
        data: {
            name: 'Química Analítica',
            quarter: 5,
            degreeId: degree.id,
            prerequisites: {
                create: [
                    { prerequisiteSubjectId: quimicaGeneral.id, requiredStateId: regularizadaState.id },
                    { prerequisiteSubjectId: quimicaGeneral.id, requiredStateId: aprobadaState.id }
                ]
            }
        },
    })

    // Quarter 6
    const fisicoquimica = await prisma.subject.create({
        data: {
            name: 'Fisicoquímica',
            quarter: 6,
            degreeId: degree.id,
            prerequisites: {
                create: [
                    { prerequisiteSubjectId: quimicaOrganica2.id, requiredStateId: regularizadaState.id },
                    { prerequisiteSubjectId: quimicaOrganica2.id, requiredStateId: aprobadaState.id }
                ]
            }
        },
    })
    const quimicaAnaliticaInstrumental = await prisma.subject.create({
        data: {
            name: 'Química Analítica Instrumental',
            quarter: 6,
            degreeId: degree.id,
            prerequisites: {
                create: [
                    { prerequisiteSubjectId: quimicaAnalitica.id, requiredStateId: regularizadaState.id },
                    { prerequisiteSubjectId: quimicaAnalitica.id, requiredStateId: aprobadaState.id }
                ]
            }
        },
    })
    const quimicaBiologica = await prisma.subject.create({
        data: {
            name: 'Química Biológica',
            quarter: 6,
            degreeId: degree.id,
            prerequisites: {
                create: [
                    { prerequisiteSubjectId: fisiologia.id, requiredStateId: regularizadaState.id },
                    { prerequisiteSubjectId: quimicaOrganica2.id, requiredStateId: regularizadaState.id }
                ]
            }
        },
    })

    // Quarter 7
    const fisiopatologia = await prisma.subject.create({
        data: {
            name: 'Fisiopatología',
            quarter: 7,
            degreeId: degree.id,
            prerequisites: {
                create: [
                    { prerequisiteSubjectId: fisiologia.id, requiredStateId: aprobadaState.id }
                ]
            }
        },
    })
    const microbiologia = await prisma.subject.create({
        data: {
            name: 'Microbiología',
            quarter: 7,
            degreeId: degree.id,
            prerequisites: {
                create: [
                    { prerequisiteSubjectId: quimicaBiologica.id, requiredStateId: regularizadaState.id }
                ]
            }
        },
    })
    const quimicaBiologicaSuperior = await prisma.subject.create({
        data: {
            name: 'Química Biológica Superior',
            quarter: 7,
            degreeId: degree.id,
            prerequisites: {
                create: [
                    { prerequisiteSubjectId: quimicaBiologica.id, requiredStateId: regularizadaState.id },
                    { prerequisiteSubjectId: quimicaBiologica.id, requiredStateId: aprobadaState.id }
                ]
            }
        },
    })
    const geneticaMolecular = await prisma.subject.create({
        data: {
            name: 'Genética Molecular',
            quarter: 7,
            degreeId: degree.id,
            prerequisites: {
                create: [
                    { prerequisiteSubjectId: quimicaBiologica.id, requiredStateId: regularizadaState.id }
                ]
            }
        },
    })

    // Quarter 8
    const inmunologia = await prisma.subject.create({
        data: {
            name: 'Inmunología',
            quarter: 8,
            degreeId: degree.id,
            prerequisites: {
                create: [
                    { prerequisiteSubjectId: fisiopatologia.id, requiredStateId: regularizadaState.id },
                    { prerequisiteSubjectId: microbiologia.id, requiredStateId: regularizadaState.id }
                ]
            }
        },
    })
    const farmacologia = await prisma.subject.create({
        data: {
            name: 'Farmacología',
            quarter: 8,
            degreeId: degree.id,
            prerequisites: {
                create: [
                    { prerequisiteSubjectId: fisiopatologia.id, requiredStateId: regularizadaState.id },
                    { prerequisiteSubjectId: quimicaBiologicaSuperior.id, requiredStateId: regularizadaState.id }
                ]
            }
        },
    })
    const biotecnologia = await prisma.subject.create({
        data: {
            name: 'Biotecnología',
            quarter: 8,
            degreeId: degree.id,
            prerequisites: {
                create: [
                    { prerequisiteSubjectId: microbiologia.id, requiredStateId: regularizadaState.id },
                    { prerequisiteSubjectId: microbiologia.id, requiredStateId: aprobadaState.id }
                ]
            }
        },
    })
    const virologia = await prisma.subject.create({
        data: {
            name: 'Virología',
            quarter: 8,
            degreeId: degree.id,
            prerequisites: {
                create: [
                    { prerequisiteSubjectId: microbiologia.id, requiredStateId: regularizadaState.id },
                    { prerequisiteSubjectId: microbiologia.id, requiredStateId: aprobadaState.id }
                ]
            }
        },
    })

    // Quarter 9
    const microbiologiaClinica = await prisma.subject.create({
        data: {
            name: 'Microbiología Clínica',
            quarter: 9,
            degreeId: degree.id,
            prerequisites: {
                create: [
                    { prerequisiteSubjectId: inmunologia.id, requiredStateId: regularizadaState.id },
                    { prerequisiteSubjectId: inmunologia.id, requiredStateId: aprobadaState.id }
                ]
            }
        },
    })
    const bioquimicaClinica = await prisma.subject.create({
        data: {
            name: 'Bioquímica Clínica',
            quarter: 9,
            degreeId: degree.id,
            prerequisites: {
                create: [
                    { prerequisiteSubjectId: fisiopatologia.id, requiredStateId: regularizadaState.id },
                    { prerequisiteSubjectId: fisiopatologia.id, requiredStateId: aprobadaState.id }
                ]
            }
        },
    })

    // Quarter 10
    const toxicologia = await prisma.subject.create({
        data: {
            name: 'Toxicología y Química Legal',
            quarter: 10,
            degreeId: degree.id,
            prerequisites: {
                create: [
                    { prerequisiteSubjectId: farmacologia.id, requiredStateId: regularizadaState.id },
                    { prerequisiteSubjectId: quimicaAnaliticaInstrumental.id, requiredStateId: aprobadaState.id }
                ]
            }
        },
    })
    const bromatologia = await prisma.subject.create({
        data: {
            name: 'Bromatología',
            quarter: 10,
            degreeId: degree.id,
            prerequisites: {
                create: [
                    { prerequisiteSubjectId: microbiologia.id, requiredStateId: aprobadaState.id }
                ]
            }
        },
    })
    const bioquimicaMetabolopatias = await prisma.subject.create({
        data: {
            name: 'Bioquímica de Metabolopatías',
            quarter: 10,
            degreeId: degree.id,
            prerequisites: {
                create: [
                    { prerequisiteSubjectId: quimicaBiologicaSuperior.id, requiredStateId: regularizadaState.id },
                    { prerequisiteSubjectId: quimicaBiologicaSuperior.id, requiredStateId: aprobadaState.id }
                ]
            }
        },
    })
    const geneticaForense = await prisma.subject.create({
        data: {
            name: 'Genética Forense',
            quarter: 10,
            degreeId: degree.id,
            prerequisites: {
                create: [
                    { prerequisiteSubjectId: geneticaMolecular.id, requiredStateId: regularizadaState.id }
                ]
            }
        },
    })
    const bioquimicaClinica2 = await prisma.subject.create({
        data: {
            name: 'Bioquímica Clínica II',
            quarter: 10,
            degreeId: degree.id,
            prerequisites: {
                create: [
                    { prerequisiteSubjectId: bioquimicaClinica.id, requiredStateId: regularizadaState.id },
                    { prerequisiteSubjectId: bioquimicaClinica.id, requiredStateId: aprobadaState.id }
                ]
            }
        },
    })

    // Quarter 11
    const practicaProfesional = await prisma.subject.create({
        data: {
            name: 'Práctica Profesional Bioquímica Externa',
            quarter: 11,
            degreeId: degree.id,
        },
    })

    console.log('Created 36 Bioquímica subjects across quarters 3-11')
    console.log('Created subjects with prerequisites')
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
