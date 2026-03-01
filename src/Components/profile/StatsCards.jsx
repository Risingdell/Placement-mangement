import React from 'react';

function StatsCards({ stats }) {
    // Defaults
    const drives = stats?.drives || 0;
    const applications = stats?.applications || 0;
    const backlogs = stats?.backlogs || 0;
    const eligible = stats?.eligible || false;

    const cards = [
        {
            label: 'Active Drives',
            value: drives,
            icon: '🎯',
            color: 'bg-blue-50 text-blue-600',
            border: 'border-blue-100'
        },
        {
            label: 'Applications',
            value: applications,
            icon: '📄',
            color: 'bg-purple-50 text-purple-600',
            border: 'border-purple-100'
        },
        {
            label: 'Backlogs',
            value: backlogs,
            icon: '⚠️', // Changed from X for better visibility
            color: backlogs > 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600',
            border: backlogs > 0 ? 'border-red-100' : 'border-green-100'
        },
        {
            label: 'Eligibility',
            value: eligible ? 'Eligible' : 'Not Eligible',
            icon: eligible ? '✅' : '🚫',
            color: eligible ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600',
            border: eligible ? 'border-emerald-100' : 'border-orange-100',
            isText: true
        }
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {cards.map((card, index) => (
                <div
                    key={index}
                    className={`bg-white rounded-xl p-4 border ${card.border} shadow-sm hover:shadow-md transition-shadow flex flex-col items-center justify-center text-center`}
                >
                    <div className={`w-10 h-10 rounded-full ${card.color} flex items-center justify-center text-xl mb-2`}>
                        {card.icon}
                    </div>
                    <div className={`font-bold text-gray-800 ${card.isText ? 'text-lg' : 'text-2xl'}`}>
                        {card.value}
                    </div>
                    <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mt-1">
                        {card.label}
                    </div>
                </div>
            ))}
        </div>
    );
}

export default StatsCards;
