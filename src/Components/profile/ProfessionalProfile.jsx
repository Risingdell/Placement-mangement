import { useMemo, useState } from 'react';
import { useStudent } from '../../context/StudentContext';
import { resolveFileUrl, resolveCloudinaryUrl } from '../../services/api';

function ProfessionalProfile() {
  const { profile, uploadResume, deleteResume } = useStudent();
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const resolvedUrl = useMemo(() => resolveFileUrl(profile?.resume_url), [profile?.resume_url]);
  const resumeUrl = useMemo(() => {
    // For Cloudinary URLs, add transformation to force inline preview instead of download
    if (resolvedUrl && resolvedUrl.includes('cloudinary.com')) {
      return resolveCloudinaryUrl(resolvedUrl);
    }
    return resolvedUrl;
  }, [resolvedUrl]);
  const hasResume = Boolean(resumeUrl);
  const isPdfResume = resumeUrl.toLowerCase().endsWith('.pdf');

  const handleResumeChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setMessage({ type: 'error', text: 'Only PDF files are allowed.' });
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setMessage({ type: 'error', text: 'File size must be less than 5MB.' });
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

      <div className="bg-white rounded-lg border border-gray-200 p-6">
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
              className="px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition cursor-pointer"
            >
              {hasResume ? (isUploading ? 'Uploading...' : 'Upload Another') : (isUploading ? 'Uploading...' : 'Upload Resume')}
            </label>
            <button
              onClick={handleDeleteResume}
              disabled={!hasResume || isDeleting || isUploading}
              className="px-3 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>

        {hasResume ? (
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            {isPdfResume ? (
              <iframe
                title="Resume Preview"
                src={resumeUrl}
                className="w-full h-[520px] bg-white"
              />
            ) : (
              <div className="p-6 bg-gray-50 text-sm text-gray-700">
                This file type cannot be previewed inline. Open it using this link:
                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="ml-2 text-blue-600 underline"
                >
                  Open Resume
                </a>
              </div>
            )}
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-10 text-center text-gray-600">
            No resume uploaded yet. Upload a PDF to preview it here.
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfessionalProfile;
