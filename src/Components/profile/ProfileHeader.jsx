import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useStudent } from '../../context/StudentContext';

const resolveMediaUrl = (url) => {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const apiOrigin = apiBase.replace(/\/api\/?$/, '');
  return `${apiOrigin}${url.startsWith('/') ? '' : '/'}${url}`;
};

function ProfileHeader({ profile, completion = 0 }) {
  const { uploadPhoto, updateBasicInfo, fetchProfile } = useStudent();

  const name = profile?.full_name || 'Student Name';
  const usn = profile?.usn || 'USN Not Added';
  const branch = profile?.branch || 'Branch Not Added';
  const batch = profile?.batch || '';
  const avatarUrl = resolveMediaUrl(profile?.photo_url);
  const phone = profile?.phone || '';

  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ full_name: name, phone });
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const fileInputRef = useRef(null);

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!allowed.includes(file.type)) {
      alert('Please select a JPG, PNG, or WebP image.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Photo must be smaller than 5 MB.');
      return;
    }

    setUploadingPhoto(true);
    try {
      await uploadPhoto(file);
      await fetchProfile();
    } catch (err) {
      console.error('Photo upload failed:', err);
      alert('Failed to upload photo. Please try again.');
    } finally {
      setUploadingPhoto(false);
      e.target.value = '';
    }
  };

  const openEditModal = () => {
    setEditForm({ full_name: profile?.full_name || '', phone: profile?.phone || '' });
    setShowEditModal(true);
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    if (!editForm.full_name.trim()) {
      alert('Name cannot be empty.');
      return;
    }
    setSaving(true);
    try {
      await updateBasicInfo(editForm);
      await fetchProfile();
      setShowEditModal(false);
    } catch (err) {
      console.error('Failed to update profile:', err);
      alert('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="bg-[#1f1f1f] rounded-xl border border-[#2f2f2f] p-6 mb-6 relative overflow-hidden text-[#f5f5f5]">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-[#ffa116] via-[#ffd37a] to-[#ffa116]"></div>

        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-xl border border-[#3b3b3b] overflow-hidden bg-[#2a2a2a] flex items-center justify-center">
              {uploadingPhoto ? (
                <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Uploading...</span>
              ) : avatarUrl ? (
                <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-[10px] text-[#a3a3a3]">NO PHOTO</span>
              )}
            </div>
            <button
              onClick={handlePhotoClick}
              disabled={uploadingPhoto}
              title="Change profile photo"
              className="absolute -bottom-1 -right-1 bg-[#262626] p-1.5 rounded-lg hover:bg-[#333] transition-colors border border-[#404040] cursor-pointer"
            >
              CAM
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/jpg,image/webp"
              onChange={handlePhotoChange}
              style={{ display: 'none' }}
            />
          </div>

          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl font-semibold text-[#f5f5f5] mb-1">{name}</h1>
            <p className="text-[#a3a3a3] text-sm mb-3 flex flex-wrap justify-center md:justify-start gap-3 items-center">
              <span className="bg-[#2a2a2a] px-2 py-1 rounded text-[#d1d5db] font-medium border border-[#3a3a3a]">
                {usn}
              </span>
              <span className="hidden md:inline text-[#4b5563]">|</span>
              <span>{branch}</span>
              {batch && (
                <>
                  <span className="hidden md:inline text-[#4b5563]">|</span>
                  <span>{batch}</span>
                </>
              )}
              {phone && (
                <>
                  <span className="hidden md:inline text-[#4b5563]">|</span>
                  <span>{phone}</span>
                </>
              )}
            </p>

            <div className="flex flex-col gap-1 w-full max-w-md">
              <div className="flex justify-between text-xs font-semibold text-[#9ca3af] mb-0.5">
                <span>Profile Completion</span>
                <span className={completion === 100 ? 'text-emerald-400' : 'text-[#ffa116]'}>
                  {completion}% {completion >= 100 ? '(Complete)' : '(In Progress)'}
                </span>
              </div>
              <div className="w-full bg-[#2a2a2a] rounded-full h-2.5 overflow-hidden border border-[#3a3a3a]">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ease-out ${completion === 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-[#ffa116] to-[#ffcc80]'}`}
                  style={{ width: `${completion}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="hidden md:block">
            <button
              onClick={openEditModal}
              className="px-4 py-2 bg-[#ffa116] text-[#1a1a1a] rounded-lg hover:bg-[#ffb84d] font-medium transition-colors cursor-pointer border-none"
            >
              Edit Profile
            </button>
          </div>
          <div className="md:hidden">
            <button
              onClick={openEditModal}
              className="px-4 py-2 bg-[#ffa116] text-[#1a1a1a] rounded-lg hover:bg-[#ffb84d] font-medium transition-colors cursor-pointer border-none"
            >
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      {showEditModal &&
        createPortal(
          <div style={modalStyles.overlay} onClick={() => setShowEditModal(false)}>
            <div style={modalStyles.modal} onClick={(e) => e.stopPropagation()}>
              <div style={modalStyles.header}>
                <h3 style={modalStyles.title}>Edit Profile</h3>
                <button onClick={() => setShowEditModal(false)} style={modalStyles.close}>
                  x
                </button>
              </div>

              <form onSubmit={handleEditSave}>
                <div style={modalStyles.body}>
                  <div style={modalStyles.group}>
                    <label style={modalStyles.label}>Full Name *</label>
                    <input
                      type="text"
                      value={editForm.full_name}
                      onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                      placeholder="Your full name"
                      style={modalStyles.input}
                      required
                    />
                  </div>
                  <div style={modalStyles.group}>
                    <label style={modalStyles.label}>Phone Number</label>
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      placeholder="e.g., 9876543210"
                      style={modalStyles.input}
                    />
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#999', margin: 0 }}>
                    USN and branch are set during registration and cannot be changed here.
                  </p>
                </div>

                <div style={modalStyles.actions}>
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    style={modalStyles.cancel}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button type="submit" style={modalStyles.save} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

const modalStyles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    maxWidth: '440px',
    width: '90%',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    borderBottom: '1px solid #e0e0e0',
  },
  title: { fontSize: '1.2rem', fontWeight: '600', color: '#333', margin: 0 },
  close: {
    background: 'none',
    border: 'none',
    fontSize: '1.5rem',
    color: '#999',
    cursor: 'pointer',
    padding: 0,
    lineHeight: 1,
  },
  body: { padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' },
  group: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '0.9rem', fontWeight: '500', color: '#555' },
  input: {
    padding: '10px 12px',
    fontSize: '1rem',
    border: '1px solid #e0e0e0',
    borderRadius: '4px',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    padding: '20px',
    borderTop: '1px solid #e0e0e0',
  },
  cancel: {
    padding: '10px 20px',
    backgroundColor: '#f5f5f5',
    color: '#666',
    border: '1px solid #e0e0e0',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.95rem',
  },
  save: {
    padding: '10px 20px',
    backgroundColor: '#4CAF50',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.95rem',
  },
};

export default ProfileHeader;
