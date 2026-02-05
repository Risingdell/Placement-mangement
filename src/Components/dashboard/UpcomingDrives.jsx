import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import driveService from '../../services/driveService';

function UpcomingDrives() {
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUpcomingDrives = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await driveService.getUpcomingDrives();
        if (response.success) {
          setDrives(response.data || []);
        } else {
          setError(response.message || 'Failed to load upcoming drives');
        }
      } catch (err) {
        console.error('Failed to fetch upcoming drives:', err);
        setError(err.message || 'Failed to load upcoming drives');
      } finally {
        setLoading(false);
      }
    };

    loadUpcomingDrives();
  }, []);

  const formatDeadline = (deadline) => {
    const date = new Date(deadline);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'Expired';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays <= 7) return `${diffDays} days left`;
    return date.toLocaleDateString();
  };

  const isDeadlineSoon = (deadline) => {
    const date = new Date(deadline);
    const now = new Date();
    const diffDays = Math.ceil((date - now) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 3;
  };

  if (loading) {
    return (
      <div className="neo-card !h-full !bg-white p-6">
        <h3 className="neo-widget-header">UPCOMING DRIVES</h3>
        <div className="neo-subtitle animate-pulse text-center p-8">LOADING UPCOMING DRIVES...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="neo-card !h-full !bg-white p-6 border-red-500">
        <h3 className="neo-widget-header">UPCOMING DRIVES</h3>
        <div className="neo-error">{error}</div>
      </div>
    );
  }

  if (drives.length === 0) {
    return (
      <div className="neo-card !h-full !bg-white p-6 text-center">
        <h3 className="neo-widget-header">UPCOMING DRIVES</h3>
        <div className="py-12">
          <span className="text-5xl block mb-4">🏢</span>
          <p className="neo-title !text-lg">NO UPCOMING DRIVES</p>
          <p className="neo-subtitle">CHECK BACK LATER FOR OPPORTUNITIES</p>
        </div>
      </div>
    );
  }

  return (
    <div className="neo-card !h-full !bg-white p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="neo-widget-header !mb-0 border-none !pb-0">UPCOMING DRIVES</h3>
        <button
          onClick={() => navigate('/drives')}
          className="neo-subtitle font-bold hover:underline cursor-pointer"
        >
          VIEW ALL →
        </button>
      </div>

      <div className="flex-1 overflow-y-auto mb-6">
        {drives.map((drive) => (
          <div
            key={drive.id}
            className="neo-list-item cursor-pointer"
            onClick={() => navigate('/drives')}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="neo-title !text-lg !mb-0">{drive.company_name.toUpperCase()}</h4>
                <p className="neo-subtitle !text-[12px]">{drive.job_role.toUpperCase()}</p>
              </div>
              <div
                className={`px-3 py-1 border-2 border-[#323232] rounded text-[10px] font-bold shadow-[2px_2px_0px_#323232] ${drive.eligible ? 'bg-green-100' : 'bg-red-100'}`}
              >
                {drive.eligible ? 'ELIGIBLE' : 'INELIGIBLE'}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="neo-subtitle !text-[11px] opacity-70">PACKAGE</span>
                <span className="neo-subtitle !text-[12px] font-bold">{drive.package || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="neo-subtitle !text-[11px] opacity-70">DEADLINE</span>
                <span
                  className={`neo-subtitle !text-[12px] font-bold ${isDeadlineSoon(drive.application_deadline) ? 'text-red-600 animate-pulse' : ''}`}
                >
                  {formatDeadline(drive.application_deadline).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => navigate('/drives')}
        className="neo-button"
      >
        VIEW ALL DRIVES
      </button>
    </div>
  );
}

export default UpcomingDrives;
