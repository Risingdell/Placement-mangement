import { useState } from 'react';
import { useStudent } from '../../context/StudentContext';

function ProfessionalProfile() {
  const { profile, uploadResume, fetchProfile } = useStudent();
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleResumeChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (file.type !== 'application/pdf') {
      setMessage({
        type: 'error',
        text: 'Only PDF files are allowed'
      });
      return;
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setMessage({
        type: 'error',
        text: 'File size must be less than 5MB'
      });
      return;
    }

    try {
      setIsUploading(true);
      setMessage({ type: '', text: '' });

      const success = await uploadResume(file);

      if (success) {
        setMessage({
          type: 'success',
          text: 'Resume uploaded successfully!'
        });
        // Profile is refreshed automatically by context
      } else {
        setMessage({
          type: 'error',
          text: 'Failed to upload resume'
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Error uploading resume. Please try again.'
      });
    } finally {
      setIsUploading(false);
      // Reset file input
      if (e.target) e.target.value = '';
    }
  };

  const handleDownloadResume = () => {
    if (profile?.resume_url) {
      const link = document.createElement('a');
      link.href = profile.resume_url;
      link.download = `resume_${profile.usn || 'student'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Professional Profile</h3>
        <p className="text-sm text-gray-600 mt-1">Manage your resume and professional documents</p>
      </div>

      {/* Message Alert */}
      {message.text && (
        <div
          className={`p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          }`}
        >
          <p
            className={`text-sm font-medium ${
              message.type === 'success' ? 'text-green-800' : 'text-red-800'
            }`}
          >
            {message.text}
          </p>
        </div>
      )}

      {/* Resume Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 mb-2">Resume</h4>
            <p className="text-sm text-gray-600 mb-4">
              Upload your PDF resume for companies to review during placements
            </p>

            {/* Current Resume */}
            {profile?.resume_url ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <svg
                      className="w-8 h-8 text-blue-600 mr-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M8 16.5a1 1 0 11-2 0 1 1 0 012 0zM15 7H4v5h11V7z" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-blue-900">
                        Resume uploaded
                      </p>
                      <p className="text-xs text-blue-600">
                        {profile.resume_url.split('/').pop()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleDownloadResume}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition"
                  >
                    Download
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-yellow-800">
                  ⚠️ No resume uploaded yet. Companies may reject applications without a resume.
                </p>
              </div>
            )}

            {/* File Upload */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition">
              <input
                type="file"
                accept=".pdf"
                onChange={handleResumeChange}
                disabled={isUploading}
                className="hidden"
                id="resume-input"
              />
              <label
                htmlFor="resume-input"
                className="cursor-pointer flex flex-col items-center"
              >
                <svg
                  className="w-10 h-10 text-gray-400 mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="text-gray-700 font-medium mb-1">
                  {isUploading ? 'Uploading...' : 'Click to upload or drag and drop'}
                </p>
                <p className="text-xs text-gray-500">PDF files only • Max 5MB</p>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Requirements Info */}
      <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
        <h5 className="font-semibold text-blue-900 mb-2">Resume Tips:</h5>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Keep your resume updated with latest skills and projects</li>
          <li>• Use a clear, professional format (PDF)</li>
          <li>• Include relevant projects, internships, and achievements</li>
          <li>• Companies review resumes during shortlisting process</li>
        </ul>
      </div>
    </div>
  );
}

export default ProfessionalProfile;
