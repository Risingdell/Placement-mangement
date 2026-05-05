import { useState, useEffect } from 'react';
import { useStudent } from '../../context/StudentContext';
import {
  validateCGPA,
  validatePercentage,
  validateBacklogs,
  validateSemester,
} from '../../utils/validators';

/* Material Symbols helper — requires Google font in index.html */
const Icon = ({ name, size = 18, color, style: extra = {} }) => (
  <span
    className="material-symbols-outlined"
    style={{ fontSize: size, lineHeight: 1, verticalAlign: 'middle', color, userSelect: 'none', ...extra }}
  >
    {name}
  </span>
);

const getCgpaColor = (val) => {
  const n = parseFloat(val);
  if (!n) return '#6B7280';
  if (n >= 8) return '#10B981';
  if (n >= 6) return '#F59E0B';
  return '#EF4444';
};

const buildAcademicFormData = (profile) => ({
  cgpa: profile?.cgpa || '',
  sgpa: profile?.sgpa || '',
  current_semester: profile?.current_semester || '',
  tenth_percentage: profile?.tenth_percentage || '',
  twelfth_percentage: profile?.twelfth_percentage || '',
  diploma_percentage: profile?.diploma_percentage || '',
  total_backlogs: profile?.total_backlogs || 0,
  active_backlogs: profile?.active_backlogs || 0,
});

function AcademicInputField({
  name,
  label,
  placeholder,
  step,
  min,
  max,
  optional,
  isEditing,
  formData,
  errors,
  handleChange,
  handleBlur,
}) {
  return (
    <div style={s.field}>
      <label style={s.label}>
        {label}
        {optional && <span style={s.optional}> (optional)</span>}
      </label>
      {isEditing ? (
        <div>
          <input
            type="number"
            name={name}
            value={formData[name]}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={placeholder}
            step={step}
            min={min}
            max={max}
            style={errors[name] ? s.inputErr : s.input}
          />
          {errors[name]
            ? <span style={s.errorText}>{errors[name]}</span>
            : <span style={s.helpText}>{placeholder}</span>
          }
        </div>
      ) : (
        <div style={s.viewValue}>
          {formData[name] !== '' && formData[name] != null
            ? (name.includes('percentage') ? `${formData[name]}%` : formData[name])
            : optional
              ? <span style={s.naText}>N/A</span>
              : <span style={s.notSetText}>Not set</span>
          }
        </div>
      )}
    </div>
  );
}

function AcademicInfo() {
  const { profile, fetchProfile, updateAcademics, loading: contextLoading } = useStudent();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(() => buildAcademicFormData(null));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile && !isEditing) {
      setFormData(buildAcademicFormData(profile));
    }
  }, [profile, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const validators = {
      cgpa: validateCGPA, sgpa: validateCGPA,
      tenth_percentage: validatePercentage, twelfth_percentage: validatePercentage, diploma_percentage: validatePercentage,
      total_backlogs: validateBacklogs, active_backlogs: validateBacklogs,
      current_semester: validateSemester,
    };
    const validator = validators[name];
    if (!validator) return;
    const result = validator(value);
    if (!result.valid) {
      setErrors(prev => ({ ...prev, [name]: result.message }));
    } else {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validatorMap = [
      ['cgpa', validateCGPA], ['sgpa', validateCGPA],
      ['current_semester', validateSemester],
      ['tenth_percentage', validatePercentage], ['twelfth_percentage', validatePercentage],
      ['diploma_percentage', validatePercentage],
      ['total_backlogs', validateBacklogs], ['active_backlogs', validateBacklogs],
    ];
    const newErrors = {};
    for (const [field, fn] of validatorMap) {
      const r = fn(formData[field]);
      if (!r.valid) newErrors[field] = r.message;
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...formData,
        // Keep compatibility with schemas/controllers that still use `backlogs`.
        backlogs: formData.active_backlogs
      };
      await updateAcademics(payload);
      await fetchProfile();
      setIsEditing(false);
      setErrors({});
    } catch (err) {
      console.error('Failed to update academics:', err);
      alert('Failed to update. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(buildAcademicFormData(profile));
    setErrors({});
    setIsEditing(false);
  };

  if (contextLoading) {
    return (
      <div style={s.loadingWrap}>
        <p style={s.loadingText}>Loading academic details…</p>
      </div>
    );
  }

  /* ── Reusable input field ── */
  const InputField = ({ name, label, placeholder, step, min, max, optional }) => (
    <div style={s.field}>
      <label style={s.label}>
        {label}
        {optional && <span style={s.optional}> (optional)</span>}
      </label>
      {isEditing ? (
        <div>
          <input
            type="number"
            name={name}
            value={formData[name]}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={placeholder}
            step={step}
            min={min}
            max={max}
            style={errors[name] ? s.inputErr : s.input}
          />
          {errors[name]
            ? <span style={s.errorText}>{errors[name]}</span>
            : <span style={s.helpText}>{placeholder}</span>
          }
        </div>
      ) : (
        <div style={s.viewValue}>
          {formData[name] !== '' && formData[name] != null
            ? (name.includes('percentage') ? `${formData[name]}%` : formData[name])
            : optional
              ? <span style={s.naText}>N/A</span>
              : <span style={s.notSetText}>Not set</span>
          }
        </div>
      )}
    </div>
  );

  return (
    <div style={s.wrap}>
      {/* ── Page Header ── */}
      <div style={s.pageHeader}>
        <div>
          <h3 style={s.pageTitle}>Academic Details</h3>
          <p style={s.pageSubtitle}>
            Accurate academic data is required for placement drive eligibility
          </p>
        </div>
        {!isEditing ? (
          <button onClick={() => setIsEditing(true)} style={s.editBtn}>
            <Icon name="edit" size={16} style={{ marginRight: 5 }} /> Edit Details
          </button>
        ) : (
          <div style={s.btnRow}>
            <button type="button" onClick={handleCancel} style={s.cancelBtn} disabled={saving}>
              Cancel
            </button>
            <button type="submit" form="academic-form" style={s.saveBtn} disabled={saving}>
              {saving ? 'Saving…' : '✓ Save Changes'}
            </button>
          </div>
        )}
      </div>

      <form id="academic-form" onSubmit={handleSubmit}>

        {/* ── Section 1 · University Performance ── */}
        <div style={s.card}>
          <div style={s.cardHead}>
            <Icon name="school" size={18} color="#4F46E5" />
            <span style={s.cardTitle}>University Performance</span>
          </div>
          <div style={s.grid3}>
            {/* CGPA */}
            <div style={s.field}>
              <label style={s.label}>CGPA</label>
              {isEditing ? (
                <div>
                  <input type="number" name="cgpa" value={formData.cgpa} onChange={handleChange} onBlur={handleBlur}
                    placeholder="e.g. 8.50" step="0.01" min="0" max="10"
                    style={errors.cgpa ? s.inputErr : s.input} />
                  {errors.cgpa
                    ? <span style={s.errorText}>{errors.cgpa}</span>
                    : <span style={s.helpText}>Scale 0 – 10</span>}
                </div>
              ) : (
                <div style={{ ...s.bigVal, color: getCgpaColor(formData.cgpa) }}>
                  {formData.cgpa || <span style={s.notSetText}>Not set</span>}
                </div>
              )}
            </div>

            {/* SGPA */}
            <div style={s.field}>
              <label style={s.label}>Current SGPA</label>
              {isEditing ? (
                <div>
                  <input type="number" name="sgpa" value={formData.sgpa} onChange={handleChange} onBlur={handleBlur}
                    placeholder="e.g. 8.75" step="0.01" min="0" max="10"
                    style={errors.sgpa ? s.inputErr : s.input} />
                  {errors.sgpa
                    ? <span style={s.errorText}>{errors.sgpa}</span>
                    : <span style={s.helpText}>Scale 0 – 10</span>}
                </div>
              ) : (
                <div style={s.bigVal}>
                  {formData.sgpa || <span style={s.notSetText}>Not set</span>}
                </div>
              )}
            </div>

            {/* Semester */}
            <div style={s.field}>
              <label style={s.label}>Current Semester</label>
              {isEditing ? (
                <div>
                  <input type="number" name="current_semester" value={formData.current_semester} onChange={handleChange} onBlur={handleBlur}
                    placeholder="e.g. 6" min="1" max="8"
                    style={errors.current_semester ? s.inputErr : s.input} />
                  {errors.current_semester
                    ? <span style={s.errorText}>{errors.current_semester}</span>
                    : <span style={s.helpText}>1 – 8</span>}
                </div>
              ) : (
                <div style={s.bigVal}>
                  {formData.current_semester
                    ? `Sem ${formData.current_semester}`
                    : <span style={s.notSetText}>Not set</span>}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Section 2 · Education History ── */}
        <div style={s.card}>
          <div style={s.cardHead}>
            <Icon name="history_edu" size={18} color="#0369A1" />
            <span style={s.cardTitle}>Education History</span>
          </div>
          <div style={s.grid3}>
            <AcademicInputField
              name="tenth_percentage"
              label="10th Percentage"
              placeholder="e.g. 85.50"
              step="0.01"
              min="0"
              max="100"
              isEditing={isEditing}
              formData={formData}
              errors={errors}
              handleChange={handleChange}
              handleBlur={handleBlur}
            />
            <AcademicInputField
              name="twelfth_percentage"
              label="12th Percentage"
              placeholder="e.g. 82.00"
              step="0.01"
              min="0"
              max="100"
              isEditing={isEditing}
              formData={formData}
              errors={errors}
              handleChange={handleChange}
              handleBlur={handleBlur}
            />
            <AcademicInputField
              name="diploma_percentage"
              label="Diploma Percentage"
              placeholder="e.g. 75.50"
              step="0.01"
              min="0"
              max="100"
              optional
              isEditing={isEditing}
              formData={formData}
              errors={errors}
              handleChange={handleChange}
              handleBlur={handleBlur}
            />
          </div>
        </div>

        {/* ── Section 3 · Backlogs ── */}
        <div style={s.card}>
          <div style={s.cardHead}>
            <Icon name="assignment_late" size={18} color="#B45309" />
            <span style={s.cardTitle}>Backlogs</span>
            {!isEditing && formData.active_backlogs > 0 && (
              <span style={s.eligibilityBadge}>⚠ Affects Eligibility</span>
            )}
          </div>
          <div style={s.grid2}>
            {/* Total Backlogs */}
            <div style={s.field}>
              <label style={s.label}>Total Backlogs</label>
              {isEditing ? (
                <div>
                  <input type="number" name="total_backlogs" value={formData.total_backlogs} onChange={handleChange} onBlur={handleBlur}
                    placeholder="0" min="0" style={errors.total_backlogs ? s.inputErr : s.input} />
                  {errors.total_backlogs && <span style={s.errorText}>{errors.total_backlogs}</span>}
                </div>
              ) : (
                <div style={{ ...s.bigVal, color: Number(formData.total_backlogs) > 0 ? '#EF4444' : '#10B981' }}>
                  {formData.total_backlogs}
                </div>
              )}
            </div>

            {/* Active Backlogs */}
            <div style={s.field}>
              <label style={s.label}>Active Backlogs</label>
              {isEditing ? (
                <div>
                  <input type="number" name="active_backlogs" value={formData.active_backlogs} onChange={handleChange} onBlur={handleBlur}
                    placeholder="0" min="0" style={errors.active_backlogs ? s.inputErr : s.input} />
                  {errors.active_backlogs && <span style={s.errorText}>{errors.active_backlogs}</span>}
                </div>
              ) : (
                <div style={{ ...s.bigVal, color: Number(formData.active_backlogs) > 0 ? '#EF4444' : '#10B981' }}>
                  {formData.active_backlogs}
                  {Number(formData.active_backlogs) === 0 && (
                    <span style={s.clearTag}>✓ Clear</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Section 4 · Programme Info (read-only) ── */}
        <div style={s.roCard}>
          <div style={s.cardHead}>
            <Icon name="domain" size={18} color="#6B7280" />
            <span style={s.cardTitle}>Programme Info</span>
            <span style={s.roTag}>Read only</span>
          </div>
          <div style={s.grid2}>
            <div style={s.field}>
              <label style={s.label}>Branch / Department</label>
              <div style={s.viewValue}>{profile?.branch || <span style={s.notSetText}>Not set</span>}</div>
            </div>
            <div style={s.field}>
              <label style={s.label}>Batch Year</label>
              <div style={s.viewValue}>{profile?.batch_year || <span style={s.notSetText}>Not set</span>}</div>
            </div>
          </div>
        </div>

        {/* ── Edit info banner ── */}
        {isEditing && (
          <div style={s.infoBanner}>
            <Icon name="info" size={18} color="#1E40AF" style={{ flexShrink: 0, marginTop: 1 }} />
            <span>
              Your <strong>CGPA</strong> and <strong>active backlogs</strong> are used to determine
              your eligibility for placement drives. Make sure the values are accurate.
            </span>
          </div>
        )}
      </form>
    </div>
  );
}

/* ── Styles ── */
const s = {
  wrap: { width: '100%', fontFamily: 'inherit' },

  loadingWrap: { textAlign: 'center', padding: '60px 20px' },
  loadingText: { color: '#9CA3AF', fontSize: '0.95rem' },

  /* Header */
  pageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: '12px',
    marginBottom: '24px',
    paddingBottom: '16px',
    borderBottom: '2px solid #E5E7EB',
  },
  pageTitle: { fontSize: '1.35rem', fontWeight: '700', color: '#111827', margin: '0 0 3px 0' },
  pageSubtitle: { fontSize: '0.82rem', color: '#6B7280', margin: 0 },

  editBtn: {
    padding: '10px 20px',
    backgroundColor: '#111827',
    color: '#fff',
    border: '1px solid #111827',
    cursor: 'pointer',
    fontSize: '0.88rem',
    fontWeight: '600',
    whiteSpace: 'nowrap',
    transition: 'all 0.2s ease',
  },
  btnRow: { display: 'flex', gap: '10px' },
  cancelBtn: {
    padding: '10px 20px',
    backgroundColor: '#fff',
    color: '#111827',
    border: '1px solid #D1D5DB',
    cursor: 'pointer',
    fontSize: '0.88rem',
    fontWeight: '500',
    transition: 'all 0.2s ease',
  },
  saveBtn: {
    padding: '10px 20px',
    backgroundColor: '#111827',
    color: '#fff',
    border: '1px solid #111827',
    cursor: 'pointer',
    fontSize: '0.88rem',
    fontWeight: '600',
    transition: 'all 0.2s ease',
  },

  /* Cards */
  card: {
    backgroundColor: '#fff',
    border: '1px solid #E5E7EB',
    padding: '20px 22px',
    marginBottom: '14px',
    transition: 'all 0.2s ease',
  },
  roCard: {
    backgroundColor: '#F9FAFB',
    border: '1px dashed #D1D5DB',
    padding: '20px 22px',
    marginBottom: '14px',
    transition: 'all 0.2s ease',
  },
  cardHead: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '18px',
  },
  cardIcon: { fontSize: '1rem' },
  cardTitle: { fontSize: '0.88rem', fontWeight: '600', color: '#374151', letterSpacing: '0.2px' },
  eligibilityBadge: {
    marginLeft: 'auto',
    fontSize: '0.72rem',
    color: '#B45309',
    backgroundColor: '#FEF3C7',
    border: '1px solid #FCD34D',
    padding: '2px 10px',
    fontWeight: '600',
  },
  roTag: {
    marginLeft: '6px',
    fontSize: '0.7rem',
    color: '#9CA3AF',
    backgroundColor: '#F3F4F6',
    padding: '2px 9px',
    fontWeight: '500',
  },

  /* Grids */
  grid3: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: '20px',
  },
  grid2: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '20px',
  },

  /* Fields */
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: {
    fontSize: '0.72rem',
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: '0.7px',
  },
  optional: { fontWeight: '400', textTransform: 'none', color: '#9CA3AF' },
  bigVal: { fontSize: '1.55rem', fontWeight: '700', color: '#111827', paddingTop: '2px' },
  viewValue: { fontSize: '1rem', fontWeight: '500', color: '#111827', paddingTop: '4px' },
  notSetText: { fontSize: '0.88rem', color: '#9CA3AF', fontWeight: '400', fontStyle: 'italic' },
  naText: { fontSize: '0.88rem', color: '#9CA3AF', fontWeight: '400' },
  clearTag: {
    fontSize: '0.72rem',
    color: '#10B981',
    backgroundColor: '#D1FAE5',
    padding: '2px 8px',
    marginLeft: '8px',
    fontWeight: '600',
    verticalAlign: 'middle',
  },

  /* Inputs */
  input: {
    width: '100%',
    padding: '9px 12px',
    fontSize: '0.95rem',
    border: '1.5px solid #D1D5DB',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    color: '#111827',
    backgroundColor: '#F9FAFB',
  },
  inputErr: {
    width: '100%',
    padding: '9px 12px',
    fontSize: '0.95rem',
    border: '1.5px solid #EF4444',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    backgroundColor: '#FFF5F5',
  },
  helpText: { fontSize: '0.72rem', color: '#9CA3AF', marginTop: '2px' },
  errorText: { fontSize: '0.75rem', color: '#EF4444', fontWeight: '500', marginTop: '2px' },

  /* Info banner */
  infoBanner: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    padding: '13px 16px',
    backgroundColor: '#EFF6FF',
    border: '1px solid #BFDBFE',
    fontSize: '0.83rem',
    color: '#1E40AF',
    lineHeight: '1.55',
    marginTop: '4px',
  },
};

export default AcademicInfo;
