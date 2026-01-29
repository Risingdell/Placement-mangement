import { useState, useEffect } from 'react';
import { useStudent } from '../../context/StudentContext';

function AcademicInfo() {
  const { profile, fetchProfile, updateAcademics, loading: contextLoading } = useStudent();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    cgpa: '',
    sgpa: '',
    current_semester: '',
    tenth_percentage: '',
    twelfth_percentage: '',
    total_backlogs: '',
    active_backlogs: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        cgpa: profile.cgpa || '',
        sgpa: profile.sgpa || '',
        current_semester: profile.current_semester || '',
        tenth_percentage: profile.tenth_percentage || '',
        twelfth_percentage: profile.twelfth_percentage || '',
        total_backlogs: profile.total_backlogs || 0,
        active_backlogs: profile.active_backlogs || 0,
      });
    }
  }, [profile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (formData.cgpa && (formData.cgpa < 0 || formData.cgpa > 10)) {
      alert('CGPA must be between 0 and 10');
      return;
    }

    if (formData.sgpa && (formData.sgpa < 0 || formData.sgpa > 10)) {
      alert('SGPA must be between 0 and 10');
      return;
    }

    setSaving(true);
    try {
      await updateAcademics(formData);
      await fetchProfile();
      setIsEditing(false);
      alert('Academic information updated successfully!');
    } catch (error) {
      console.error('Failed to update academics:', error);
      alert('Failed to update academic information. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        cgpa: profile.cgpa || '',
        sgpa: profile.sgpa || '',
        current_semester: profile.current_semester || '',
        tenth_percentage: profile.tenth_percentage || '',
        twelfth_percentage: profile.twelfth_percentage || '',
        total_backlogs: profile.total_backlogs || 0,
        active_backlogs: profile.active_backlogs || 0,
      });
    }
    setIsEditing(false);
  };

  if (contextLoading) {
    return <div style={styles.loading}>Loading academic information...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Academic Details</h3>
        {!isEditing ? (
          <button onClick={() => setIsEditing(true)} style={styles.editButton}>
            Edit
          </button>
        ) : (
          <div style={styles.buttonGroup}>
            <button onClick={handleCancel} style={styles.cancelButton} disabled={saving}>
              Cancel
            </button>
            <button onClick={handleSubmit} style={styles.saveButton} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div style={styles.grid}>
          {/* CGPA */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>CGPA</label>
            {isEditing ? (
              <input
                type="number"
                name="cgpa"
                value={formData.cgpa}
                onChange={handleChange}
                step="0.01"
                min="0"
                max="10"
                style={styles.input}
                placeholder="e.g., 8.50"
              />
            ) : (
              <div style={styles.value}>{formData.cgpa || 'Not set'}</div>
            )}
          </div>

          {/* SGPA */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Current SGPA</label>
            {isEditing ? (
              <input
                type="number"
                name="sgpa"
                value={formData.sgpa}
                onChange={handleChange}
                step="0.01"
                min="0"
                max="10"
                style={styles.input}
                placeholder="e.g., 8.75"
              />
            ) : (
              <div style={styles.value}>{formData.sgpa || 'Not set'}</div>
            )}
          </div>

          {/* Current Semester */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Current Semester</label>
            {isEditing ? (
              <input
                type="number"
                name="current_semester"
                value={formData.current_semester}
                onChange={handleChange}
                min="1"
                max="8"
                style={styles.input}
                placeholder="e.g., 6"
              />
            ) : (
              <div style={styles.value}>{formData.current_semester || 'Not set'}</div>
            )}
          </div>

          {/* 10th Percentage */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>10th Percentage</label>
            {isEditing ? (
              <input
                type="number"
                name="tenth_percentage"
                value={formData.tenth_percentage}
                onChange={handleChange}
                step="0.01"
                min="0"
                max="100"
                style={styles.input}
                placeholder="e.g., 85.50"
              />
            ) : (
              <div style={styles.value}>{formData.tenth_percentage ? `${formData.tenth_percentage}%` : 'Not set'}</div>
            )}
          </div>

          {/* 12th Percentage */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>12th Percentage</label>
            {isEditing ? (
              <input
                type="number"
                name="twelfth_percentage"
                value={formData.twelfth_percentage}
                onChange={handleChange}
                step="0.01"
                min="0"
                max="100"
                style={styles.input}
                placeholder="e.g., 82.00"
              />
            ) : (
              <div style={styles.value}>{formData.twelfth_percentage ? `${formData.twelfth_percentage}%` : 'Not set'}</div>
            )}
          </div>

          {/* Total Backlogs */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Total Backlogs</label>
            {isEditing ? (
              <input
                type="number"
                name="total_backlogs"
                value={formData.total_backlogs}
                onChange={handleChange}
                min="0"
                style={styles.input}
                placeholder="e.g., 0"
              />
            ) : (
              <div style={styles.value}>{formData.total_backlogs}</div>
            )}
          </div>

          {/* Active Backlogs */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Active Backlogs</label>
            {isEditing ? (
              <input
                type="number"
                name="active_backlogs"
                value={formData.active_backlogs}
                onChange={handleChange}
                min="0"
                style={styles.input}
                placeholder="e.g., 0"
              />
            ) : (
              <div style={styles.value}>{formData.active_backlogs}</div>
            )}
          </div>

          {/* Branch (Read-only) */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Branch</label>
            <div style={styles.value}>{profile?.branch || 'Not set'}</div>
          </div>

          {/* Batch Year (Read-only) */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Batch Year</label>
            <div style={styles.value}>{profile?.batch_year || 'Not set'}</div>
          </div>
        </div>

        {isEditing && (
          <div style={styles.infoBox}>
            <strong>Note:</strong> Your CGPA and backlogs affect your eligibility for placement drives.
            Keep this information up to date for accurate eligibility checking.
          </div>
        )}
      </form>
    </div>
  );
}

const styles = {
  container: {
    width: '100%',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    paddingBottom: '15px',
    borderBottom: '2px solid #e0e0e0',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#333',
    margin: 0,
  },
  editButton: {
    padding: '10px 20px',
    backgroundColor: '#2196F3',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontWeight: '500',
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px',
  },
  cancelButton: {
    padding: '10px 20px',
    backgroundColor: '#f5f5f5',
    color: '#666',
    border: '1px solid #e0e0e0',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontWeight: '500',
  },
  saveButton: {
    padding: '10px 20px',
    backgroundColor: '#4CAF50',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontWeight: '500',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '24px',
    marginBottom: '24px',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#555',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  value: {
    fontSize: '1.1rem',
    color: '#333',
    padding: '10px 0',
  },
  input: {
    padding: '10px 12px',
    fontSize: '1rem',
    border: '1px solid #e0e0e0',
    borderRadius: '4px',
    outline: 'none',
    transition: 'border-color 0.3s',
  },
  infoBox: {
    padding: '15px',
    backgroundColor: '#e3f2fd',
    borderLeft: '4px solid #2196F3',
    borderRadius: '4px',
    fontSize: '0.9rem',
    color: '#1565C0',
    marginTop: '20px',
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    color: '#666',
    fontSize: '1rem',
  },
};

export default AcademicInfo;
