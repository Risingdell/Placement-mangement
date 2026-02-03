import React from 'react';
import { useNavigate } from 'react-router-dom';

function ProfileRightSidebar({ profile, readiness }) {
    const navigate = useNavigate();

    const checklist = [
        { label: 'Academic Details', completed: !!profile?.cgpa },
        { label: 'Resume Uploaded', completed: !!profile?.resume_url },
        { label: 'Skills Added', completed: (readiness?.skills_count || 0) > 0 },
        { label: 'Projects Added', completed: (readiness?.projects_count || 0) > 0 },
    ];

    const upcomingDrive = {
        company: 'Infosys',
        date: 'Feb 12',
        role: 'System Engineer',
        eligibility: 'CGPA ≥ 7.0'
    };

    const applications = [
        { company: 'Infosys', status: 'Under Review', statusColor: 'text-yellow-600 bg-yellow-50' },
        { company: 'TCS', status: 'Selected', statusColor: 'text-green-600 bg-green-50' },
    ];

    return (
        <div className="space-y-6">
            {/* Placement Readiness */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <span>🧠</span> Placement Readiness
                </h3>
                <ul className="space-y-3 mb-4">
                    {checklist.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-3 text-sm">
                            <span className={`flex items-center justify-center w-5 h-5 rounded-full text-xs ${item.completed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                }`}>
                                {item.completed ? '✓' : '✕'}
                            </span>
                            <span className={item.completed ? 'text-gray-700' : 'text-gray-400'}>
                                {item.label}
                            </span>
                        </li>
                    ))}
                </ul>
                <button
                    onClick={() => navigate('/dashboard/profile')}
                    className="w-full py-2 bg-indigo-50 text-indigo-600 text-sm font-medium rounded-lg hover:bg-indigo-100 transition-colors border-none cursor-pointer"
                >
                    Complete Profile
                </button>
            </div>

            {/* Upcoming Drive */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl shadow-md p-5 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl">🏢</div>
                <h3 className="font-semibold mb-1 flex items-center gap-2 relative z-10">
                    <span className="text-xl">⏰</span> Upcoming Drive
                </h3>
                <div className="mt-3 relative z-10">
                    <h4 className="text-lg font-bold">{upcomingDrive.company}</h4>
                    <div className="text-indigo-100 text-sm mb-1">{upcomingDrive.role}</div>
                    <div className="flex justify-between items-end mt-2">
                        <div className="text-xs bg-white/20 px-2 py-1 rounded inline-block">
                            {upcomingDrive.date}
                        </div>
                        <button
                            onClick={() => navigate('/dashboard/drives')}
                            className="text-xs bg-white text-indigo-600 px-3 py-1.5 rounded-lg font-bold hover:bg-gray-100 border-none cursor-pointer"
                        >
                            View
                        </button>
                    </div>
                </div>
            </div>

            {/* Application Snapshot */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <h3 className="font-semibold text-gray-800 mb-4 text-sm">My Applications</h3>
                <div className="space-y-3">
                    {applications.map((app, idx) => (
                        <div key={idx} className="flex justify-between items-center text-sm border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                            <span className="font-medium text-gray-700">{app.company}</span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${app.statusColor}`}>
                                {app.status}
                            </span>
                        </div>
                    ))}
                </div>
                <button
                    onClick={() => navigate('/dashboard/applications')}
                    className="w-full mt-4 text-xs text-gray-500 hover:text-indigo-600 font-medium border-none bg-transparent cursor-pointer"
                >
                    View all applications →
                </button>
            </div>
        </div>
    );
}

export default ProfileRightSidebar;
