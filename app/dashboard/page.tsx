'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface SubjectState {
    id: number
    name: string
}

interface Prerequisite {
    id: number
    name: string
    requiredState: string
}

interface Subject {
    id: number
    name: string
    quarter: number
    status: SubjectState
    prerequisites: Prerequisite[]
}

export default function DashboardPage() {
    const router = useRouter()
    const [subjects, setSubjects] = useState<Subject[]>([])
    const [states, setStates] = useState<SubjectState[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        Promise.all([
            fetch('/api/auth/me').then(res => res.json()),
            fetch('/api/subjects').then(res => res.json()),
            fetch('/api/states').then(res => res.json()),
        ])
            .then(([userData, subjectsData, statesData]) => {
                if (userData.error) {
                    router.push('/login')
                    return
                }
                setSubjects(subjectsData)
                setStates(statesData)
                setLoading(false)
            })
            .catch((error) => {
                console.error('Error loading data:', error)
                router.push('/login')
            })
    }, [router])

    const handleStatusChange = async (subjectId: number, stateId: number) => {
        try {
            const res = await fetch(`/api/subjects/${subjectId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ stateId }),
            })

            if (!res.ok) throw new Error('Failed to update status')

            setSubjects(subjects.map(subject =>
                subject.id === subjectId
                    ? { ...subject, status: states.find(s => s.id === stateId)! }
                    : subject
            ))
        } catch (error) {
            console.error('Error updating status:', error)
        }
    }

    const isSubjectEnabled = (subject: Subject, allSubjects: Subject[]) => {
        if (subject.prerequisites.length === 0) return true;

        return subject.prerequisites.every(prereq => {
            const prereqSubject = allSubjects.find(s => s.id === prereq.id);
            if (!prereqSubject) return false;

            if (prereq.requiredState === 'Regularizada') {
                return prereqSubject.status.name === 'Regularizada' || prereqSubject.status.name === 'Aprobada';
            }
            if (prereq.requiredState === 'Aprobada') {
                return prereqSubject.status.name === 'Aprobada';
            }
            return false;
        });
    }

    const getSubjectStyle = (subject: Subject, isEnabled: boolean) => {
        if (!isEnabled) return 'bg-gray-900/50 opacity-60 border-red-900/30';

        switch (subject.status.name) {
            case 'Pendiente': return 'bg-gray-800 hover:bg-gray-750 border-gray-700';
            case 'Cursando': return 'bg-gradient-to-br from-blue-900/20 to-blue-900/10 border-blue-500/50 shadow-blue-900/20';
            case 'Regularizada': return 'bg-gradient-to-br from-indigo-900/20 to-indigo-900/10 border-indigo-500/50 shadow-indigo-900/20';
            case 'Aprobada': return 'bg-gradient-to-br from-green-900/20 to-green-900/10 border-green-500/50 shadow-green-900/20';
            default: return 'bg-gray-800 hover:bg-gray-750 border-gray-700';
        }
    }

    const groupedSubjects = subjects.reduce((acc, subject) => {
        if (!acc[subject.quarter]) {
            acc[subject.quarter] = []
        }
        acc[subject.quarter].push(subject)
        return acc
    }, {} as Record<number, Subject[]>)

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-white text-xl">Cargando...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-12">
                    <h1 className="text-4xl font-extrabold text-white">Seguidor de carrera</h1>
                    <p className="mt-2 text-gray-400">Seguí tu progreso</p>
                </div>

                {Object.keys(groupedSubjects).sort((a, b) => parseInt(a) - parseInt(b)).map((quarter) => (
                    <div key={quarter} className="mb-12">
                        <h2 className="text-2xl font-bold text-white mb-6 border-b border-gray-700 pb-2">
                            Cuatrimestre {quarter}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {groupedSubjects[parseInt(quarter)].map((subject) => {
                                const isEnabled = isSubjectEnabled(subject, subjects);
                                const rowStyle = getSubjectStyle(subject, isEnabled);
                                const hasPrerequisites = subject.prerequisites.length > 0;

                                return (
                                    <div
                                        key={subject.id}
                                        className={`${rowStyle} rounded-xl shadow-lg p-6 transition-all duration-300 relative group border border-gray-700/50 flex flex-col justify-between h-full`}
                                    >
                                        <div className="mb-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="text-lg font-bold text-white leading-tight">
                                                    {subject.name}
                                                </h3>
                                                {subject.status.name === 'Aprobada' && (
                                                    <div className="bg-green-500/20 p-1.5 rounded-full">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>

                                            {hasPrerequisites && (
                                                <div className="relative inline-block">
                                                    <div className="flex items-center gap-1.5 text-xs text-gray-400 cursor-help hover:text-gray-200 transition-colors">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        <span className="font-medium">Ver correlativas</span>
                                                    </div>

                                                    {/* Tooltip */}
                                                    <div className="absolute left-0 bottom-full mb-2 w-64 p-3 bg-gray-900/95 backdrop-blur-sm border border-gray-600 rounded-lg shadow-2xl z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 pointer-events-none">
                                                        <h4 className="text-xs font-bold text-gray-400 uppercase mb-2 border-b border-gray-700 pb-1">Requisitos</h4>
                                                        <ul className="space-y-1.5">
                                                            {subject.prerequisites.map(prereq => {
                                                                const prereqSubject = subjects.find(s => s.id === prereq.id);
                                                                const isMet = prereqSubject && (
                                                                    (prereq.requiredState === 'Regularizada' && (prereqSubject.status.name === 'Regularizada' || prereqSubject.status.name === 'Aprobada')) ||
                                                                    (prereq.requiredState === 'Aprobada' && prereqSubject.status.name === 'Aprobada')
                                                                );

                                                                return (
                                                                    <li key={prereq.id} className="flex items-center justify-between text-xs">
                                                                        <span className="text-gray-300">{prereq.name}</span>
                                                                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${isMet ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                                                                            {prereq.requiredState.substring(0, 3).toUpperCase()}
                                                                        </span>
                                                                    </li>
                                                                );
                                                            })}
                                                        </ul>
                                                        {/* Arrow */}
                                                        <div className="absolute bottom-0 left-4 transform translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900 border-r border-b border-gray-600"></div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-2">
                                            <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Estado</label>
                                            <select
                                                value={subject.status.id}
                                                onChange={(e) => handleStatusChange(subject.id, parseInt(e.target.value))}
                                                disabled={!isEnabled}
                                                className={`block w-full px-3 py-2 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all ${!isEnabled
                                                        ? 'bg-gray-800/50 border border-gray-700 text-gray-500 cursor-not-allowed'
                                                        : 'bg-gray-700/50 border border-gray-600 text-white hover:bg-gray-700 focus:ring-indigo-500'
                                                    }`}
                                            >
                                                {states.map((state) => (
                                                    <option key={state.id} value={state.id} className="bg-gray-800">
                                                        {state.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
