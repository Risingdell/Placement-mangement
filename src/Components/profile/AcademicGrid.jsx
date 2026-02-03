import React from 'react';

function AcademicGrid({ academic }) {
    const items = [
        { label: 'CGPA', value: academic?.cgpa || 'N/A', icon: '🎓', color: 'text-indigo-600' },
        { label: 'SGPA', value: academic?.sgpa || 'N/A', icon: '📊', color: 'text-blue-600' },
        { label: 'Current Sem', value: academic?.current_semester || 'N/A', icon: '📘', color: 'text-purple-600' },
        { label: 'Active Backlogs', value: academic?.active_backlogs || 0, icon: '❌', color: 'text-red-600' },
    ];

    const education = [
        { label: '10th Percentage', value: academic?.tenth_percentage ? `${academic.tenth_percentage}%` : 'N/A' },
        { label: '12th Percentage', value: academic?.twelfth_percentage ? `${academic.twelfth_percentage}%` : 'N/A' },
        { label: 'Diploma', value: academic?.diploma_percentage ? `${academic.diploma_percentage}%` : 'N/A' },
    ];

    return (
        <div className="space-y-6">
            {/* Primary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {items.map((item, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center hover:bg-gray-50 transition-colors">
                        <span className={`text-2xl mb-2 ${item.color}`}>{item.icon}</span>
                        <span className="text-xl font-bold text-gray-800">{item.value}</span>
                        <span className="text-xs text-gray-500 uppercase tracking-wide">{item.label}</span>
                    </div>
                ))}
            </div>

            {/* Education Details */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-gray-700">Education History</h3>
                    <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer border-none bg-transparent">Edit</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {education.map((item, idx) => (
                        <div key={idx} className="bg-gray-50 p-3 rounded-lg flex flex-col">
                            <span className="text-xs text-gray-500 mb-1">{item.label}</span>
                            <span className="font-semibold text-gray-800">{item.value}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default AcademicGrid;
