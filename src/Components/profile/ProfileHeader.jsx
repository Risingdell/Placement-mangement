import React from 'react';

function ProfileHeader({ profile, completion = 0 }) {
    // Safe defaults
    const name = profile?.full_name || 'Student Name';
    const usn = profile?.usn || 'USN Not Added';
    const branch = profile?.branch || 'Branch Not Added';
    const batch = profile?.batch || '2021-2025';
    const avatarUrl = profile?.photo_url;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6 relative overflow-hidden">
            {/* Decorative Background Accent */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

            <div className="flex flex-col md:flex-row items-center gap-6">
                {/* Avatar */}
                <div className="relative">
                    <div className="w-24 h-24 rounded-full border-4 border-white shadow-md overflow-hidden bg-gray-100 flex items-center justify-center">
                        {avatarUrl ? (
                            <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-4xl">👤</span>
                        )}
                    </div>
                    <button className="absolute bottom-0 right-0 bg-white p-1.5 rounded-full shadow-md hover:bg-gray-50 transition-colors border border-gray-100 cursor-pointer">
                        📷
                    </button>
                </div>

                {/* Info */}
                <div className="flex-1 text-center md:text-left">
                    <h1 className="text-2xl font-bold text-gray-800 mb-1">{name}</h1>
                    <p className="text-gray-500 text-sm mb-3 flex flex-wrap justify-center md:justify-start gap-3 items-center">
                        <span className="bg-gray-100 px-2 py-1 rounded text-gray-600 font-medium">{usn}</span>
                        <span className="hidden md:inline text-gray-300">|</span>
                        <span>{branch}</span>
                        <span className="hidden md:inline text-gray-300">|</span>
                        <span>{batch}</span>
                    </p>

                    <div className="flex flex-col gap-1 w-full max-w-md">
                        <div className="flex justify-between text-xs font-semibold text-gray-500 mb-0.5">
                            <span>Profile Completion</span>
                            <span className={completion === 100 ? 'text-green-500' : 'text-blue-500'}>{completion}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-1000 ease-out ${completion === 100 ? 'bg-green-500' : 'bg-gradient-to-r from-blue-500 to-indigo-600'
                                    }`}
                                style={{ width: `${completion}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* Action Button (Optional) */}
                <div className="hidden md:block">
                    <button className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 font-medium transition-colors cursor-pointer border-none">
                        Edit Profile
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ProfileHeader;
