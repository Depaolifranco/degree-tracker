'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface SubjectState {
    id: number
    name: string
}

interface Subject {
    id: number
    name: string
    quarter: number
    status: SubjectState
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
                <div className="text-white text-xl">Loading...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-extrabold text-white">Degree Tracker</h1>
                    <p className="mt-2 text-gray-400">Track your academic progress</p>
                </div>

                {Object.keys(groupedSubjects).sort((a, b) => parseInt(a) - parseInt(b)).map((quarter) => (
                    <div key={quarter} className="mb-8">
                        <h2 className="text-2xl font-bold text-white mb-4">
                            Quarter {quarter}
                        </h2>
                        <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden border border-gray-700">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-700">
                                    <thead className="bg-gray-700">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                                Subject
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                                Status
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-gray-800 divide-y divide-gray-700">
                                        {groupedSubjects[parseInt(quarter)].map((subject) => (
                                            <tr key={subject.id} className="hover:bg-gray-750 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                                                    {subject.name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                    <select
                                                        value={subject.status.id}
                                                        onChange={(e) => handleStatusChange(subject.id, parseInt(e.target.value))}
                                                        className="block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                    >
                                                        {states.map((state) => (
                                                            <option key={state.id} value={state.id}>
                                                                {state.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
