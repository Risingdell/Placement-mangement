import { useState, useEffect } from 'react';
import { useStudent } from '../../context/StudentContext';
import {
  validateCGPA,
  validatePercentage,
  validateBacklogs,
  validateSemester,
} from '../../utils/validators';

function AcademicInfo() {
  const { profile, fetchProfile, updateAcademics, loading: contextLoading } = useStudent();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    cgpa: '',
    sgpa: '',
    current_semester: '',
    tenth_percentage: '',
    twelfth_percentage: '',
    diploma_percentage: '',
    total_backlogs: '',
    active_backlogs: '',
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        cgpa: profile.cgpa || '',
        sgpa: profile.sgpa || '',
        current_semester: profile.current_semester || '',
        tenth_percentage: profile.tenth_percentage || '',
        twelfth_percentage: profile.twelfth_percentage || '',
        diploma_percentage: profile.diploma_percentage || '',
        total_backlogs: profile.total_backlogs || 0,
        active_backlogs: profile.active_backlogs || 0,
      });
    }
  }, [profile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    let validation;

    switch (name) {
      case 'cgpa':
      case 'sgpa':
        validation = validateCGPA(value);
        break;
      case 'tenth_percentage':
      case 'twelfth_percentage':
      case 'diploma_percentage':
        validation = validatePercentage(value);
        break;
      case 'total_backlogs':
      case 'active_backlogs':
        validation = validateBacklogs(value);
        break;
      case 'current_semester':
        validation = validateSemester(value);
        break;
      default:
        return;
    }

    if (validation && !validation.valid) {
      setErrors(prev => ({ ...prev, [name]: validation.message }));
    } else {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields
    const newErrors = {};

    const cgpaValidation = validateCGPA(formData.cgpa);
    if (!cgpaValidation.valid) newErrors.cgpa = cgpaValidation.message;

    const sgpaValidation = validateCGPA(formData.sgpa);
    if (!sgpaValidation.valid) newErrors.sgpa = sgpaValidation.message;

    const semesterValidation = validateSemester(formData.current_semester);
    if (!semesterValidation.valid) newErrors.current_semester = semesterValidation.message;

    const tenthValidation = validatePercentage(formData.tenth_percentage);
    if (!tenthValidation.valid) newErrors.tenth_percentage = tenthValidation.message;

    const twelfthValidation = validatePercentage(formData.twelfth_percentage);
    if (!twelfthValidation.valid) newErrors.twelfth_percentage = twelfthValidation.message;

    const diplomaValidation = validatePercentage(formData.diploma_percentage);
    if (!diplomaValidation.valid) newErrors.diploma_percentage = diplomaValidation.message;

    const totalBacklogsValidation = validateBacklogs(formData.total_backlogs);
    if (!totalBacklogsValidation.valid) newErrors.total_backlogs = totalBacklogsValidation.message;

    const activeBacklogsValidation = validateBacklogs(formData.active_backlogs);
    if (!activeBacklogsValidation.valid) newErrors.active_backlogs = activeBacklogsValidation.message;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      alert('Please fix the validation errors before submitting.');
      return;
    }

    setSaving(true);
    try {
      await updateAcademics(formData);
      await fetchProfile();
      setIsEditing(false);
      setErrors({});
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
        diploma_percentage: profile.diploma_percentage || '',
        total_backlogs: profile.total_backlogs || 0,
        active_backlogs: profile.active_backlogs || 0,
      });
    }
    setErrors({});
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
              <>
                <input
                  type="number"
                  name="cgpa"
                  value={formData.cgpa}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  step="0.01"
                  min="0"
                  max="10"
                  style={errors.cgpa ? styles.inputError : styles.input}
                  placeholder="e.g., 8.50"
                />
                {errors.cgpa && <div style={styles.errorText}>{errors.cgpa}</div>}
              </>
            ) : (
              <div style={styles.value}>{formData.cgpa || 'Not set'}</div>
            )}
          </div>

          {/* SGPA */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Current SGPA</label>
            {isEditing ? (
              <>
                <input
                  type="number"
                  name="sgpa"
                  value={formData.sgpa}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  step="0.01"
                  min="0"
                  max="10"
                  style={errors.sgpa ? styles.inputError : styles.input}
                  placeholder="e.g., 8.75"
                />
                {errors.sgpa && <div style={styles.errorText}>{errors.sgpa}</div>}
              </>
            ) : (
              <div style={styles.value}>{formData.sgpa || 'Not set'}</div>
            )}
          </div>

          {/* Current Semester */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Current Semester</label>
            {isEditing ? (
              <>
                <input
                  type="number"
                  name="current_semester"
                  value={formData.current_semester}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  min="1"
                  max="8"
                  style={errors.current_semester ? styles.inputError : styles.input}
                  placeholder="e.g., 6"
                />
                {errors.current_semester && <div style={styles.errorText}>{errors.current_semester}</div>}
              </>
            ) : (
              <div style={styles.value}>{formData.current_semester || 'Not set'}</div>
            )}
          </div>

          {/* 10th Percentage */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>10th Percentage</label>
            {isEditing ? (
              <>
                <input
                  type="number"
                  name="tenth_percentage"
                  value={formData.tenth_percentage}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  step="0.01"
                  min="0"
                  max="100"
                  style={errors.tenth_percentage ? styles.inputError : styles.input}
                  placeholder="e.g., 85.50"
                />
                {errors.tenth_percentage && <div style={styles.errorText}>{errors.tenth_percentage}</div>}
              </>
            ) : (
              <div style={styles.value}>{formData.tenth_percentage ? `${formData.tenth_percentage}%` : 'Not set'}</div>
            )}
          </div>

          {/* 12th Percentage */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>12th Percentage</label>
            {isEditing ? (
              <>
                <input
                  type="number"
                  name="twelfth_percentage"
                  value={formData.twelfth_percentage}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  step="0.01"
                  min="0"
                  max="100"
                  style={errors.twelfth_percentage ? styles.inputError : styles.input}
                  placeholder="e.g., 82.00"
                />
                {errors.twelfth_percentage && <div style={styles.errorText}>{errors.twelfth_percentage}</div>}
              </>
            ) : (
              <div style={styles.value}>{formData.twelfth_percentage ? `${formData.twelfth_percentage}%` : 'Not set'}</div>
            )}
          </div>

          {/* Diploma Percentage */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Diploma Percentage (if applicable)</label>
            {isEditing ? (
              <>
                <input
                  type="number"
                  name="diploma_percentage"
                  value={formData.diploma_percentage}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  step="0.01"
                  min="0"
                  max="100"
                  style={errors.diploma_percentage ? styles.inputError : styles.input}
                  placeholder="e.g., 75.50"
                />
                {errors.diploma_percentage && <div style={styles.errorText}>{errors.diploma_percentage}</div>}
              </>
            ) : (
              <div style={styles.value}>{formData.diploma_percentage ? `${formData.diploma_percentage}%` : 'N/A'}</div>
            )}
          </div>

          {/* Total Backlogs */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Total Backlogs</label>
            {isEditing ? (
              <>
                <input
                  type="number"
                  name="total_backlogs"
                  value={formData.total_backlogs}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  min="0"
                  style={errors.total_backlogs ? styles.inputError : styles.input}
                  placeholder="e.g., 0"
                />
                {errors.total_backlogs && <div style={styles.errorText}>{errors.total_backlogs}</div>}
              </>
            ) : (
              <div style={styles.value}>{formData.total_backlogs}</div>
            )}
          </div>

          {/* Active Backlogs */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Active Backlogs</label>
            {isEditing ? (
              <>
                <input
                  type="number"
                  name="active_backlogs"
                  value={formData.active_backlogs}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  min="0"
                  style={errors.active_backlogs ? styles.inputError : styles.input}
                  placeholder="e.g., 0"
                />
                {errors.active_backlogs && <div style={styles.errorText}>{errors.active_backlogs}</div>}
              </>
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
  inputError: {
    padding: '10px 12px',
    fontSize: '1rem',
    border: '1px solid #f44336',
    borderRadius: '4px',
    outline: 'none',
    transition: 'border-color 0.3s',
    backgroundColor: '#ffebee',
  },
  errorText: {
    fontSize: '0.8rem',
    color: '#f44336',
    marginTop: '4px',
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
