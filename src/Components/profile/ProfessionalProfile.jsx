import { useState } from 'react';
import { useStudent } from '../../context/StudentContext';
import { getResumeUrl } from '../../services/profileService';

function ProfessionalProfile() {
  const { profile, uploadResume, deleteResume } = useStudent();
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Use authenticated stream endpoint — backend generates a signed Cloudinary URL
  const hasResume = Boolean(profile?.resume_url);

  const handleResumeChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setMessage({ type: 'error', text: 'Only PDF files are allowed.' });
      return;
    }

    const maxSize = 1 * 1024 * 1024; // 1MB limit
    if (file.size > maxSize) {
      setMessage({ type: 'error', text: 'File size must be less than 1MB.' });
      return;
    }

    try {
      setIsUploading(true);
      setMessage({ type: '', text: '' });

      const success = await uploadResume(file);
      setMessage({
        type: success ? 'success' : 'error',
        text: success ? 'Resume uploaded successfully.' : 'Failed to upload resume.',
      });
    } catch (error) {
      console.error('Resume upload error:', error);
      setMessage({ type: 'error', text: 'Error uploading resume. Please try again.' });
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleDeleteResume = async () => {
    if (!hasResume) return;
    if (!window.confirm('Delete your current resume?')) return;

    try {
      setIsDeleting(true);
      setMessage({ type: '', text: '' });
      const success = await deleteResume();
      setMessage({
        type: success ? 'success' : 'error',
        text: success ? 'Resume deleted successfully.' : 'Failed to delete resume.',
      });
    } catch (error) {
      console.error('Resume delete error:', error);
      setMessage({ type: 'error', text: 'Error deleting resume. Please try again.' });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Professional Profile</h3>
        <p className="text-sm text-gray-600 mt-1">Manage your resume with preview, replace, and delete actions</p>
      </div>

      {message.text && (
        <div
          className={`p-4 ${
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

      <div className="bg-white border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div>
            <h4 className="font-semibold text-gray-900">Resume Content</h4>
            <p className="text-sm text-gray-600">
              Your uploaded resume is shown below. You can replace or delete it anytime.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="file"
              accept=".pdf"
              onChange={handleResumeChange}
              disabled={isUploading || isDeleting}
              className="hidden"
              id="resume-input"
            />
            <label
              htmlFor="resume-input"
              className="px-3 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 transition cursor-pointer"
            >
              {hasResume ? (isUploading ? 'Uploading...' : 'Upload Another') : (isUploading ? 'Uploading...' : 'Upload Resume')}
            </label>
            <button
              onClick={handleDeleteResume}
              disabled={!hasResume || isDeleting || isUploading}
              className="px-3 py-2 text-sm bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>

        {hasResume ? (
          <div className="border border-gray-200 p-6 bg-gray-50 flex flex-col items-center gap-4">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-3 bg-red-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
                  <path d="M14 2v6h6"/>
                  <path d="M9 13h6M9 17h3" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <p className="font-medium text-gray-800">Resume.pdf</p>
              <p className="text-sm text-gray-500 mt-1">Your resume is uploaded and ready</p>
            </div>
            <div className="flex gap-3">
              <a
                href={getResumeUrl(false)}
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2 bg-blue-600 text-white hover:bg-blue-700 transition font-medium text-sm"
              >
                View Resume
              </a>
              <a
                href={getResumeUrl(true)}
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2 bg-green-600 text-white hover:bg-green-700 transition font-medium text-sm"
              >
                Download
              </a>
            </div>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 p-10 text-center text-gray-600">
            No resume uploaded yet. Upload a PDF to preview it here.
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfessionalProfile;
