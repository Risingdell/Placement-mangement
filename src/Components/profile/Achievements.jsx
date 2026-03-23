import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useStudent } from '../../context/StudentContext';
import { resolveFileUrl } from '../../services/api';

const Icon = ({ name, size = 18, color, style: extra = {} }) => (
  <span
    className="material-symbols-outlined"
    style={{ fontSize: size, lineHeight: 1, verticalAlign: 'middle', color, userSelect: 'none', ...extra }}
  >
    {name}
  </span>
);

const TECHNICAL_TYPES = [
  'Certification',
  'Hackathon',
  'Technical Competition',
  'Research Paper',
  'Patent',
  'Technical Award',
  'Open Source',
];

const NON_TECHNICAL_TYPES = [
  'Sports',
  'Cultural/Arts',
  'Community Service',
  'Leadership',
  'Scholarship',
  'Social Impact',
  'Other',
];

const TYPE_COLORS = {
  Certification:         { bg: '#EEF2FF', text: '#4338CA', border: '#C7D2FE' },
  Hackathon:             { bg: '#F0FDF4', text: '#15803D', border: '#BBF7D0' },
  'Technical Competition': { bg: '#FFF7ED', text: '#C2410C', border: '#FED7AA' },
  'Research Paper':      { bg: '#F0F9FF', text: '#0369A1', border: '#BAE6FD' },
  Patent:                { bg: '#FDF4FF', text: '#7E22CE', border: '#E9D5FF' },
  'Technical Award':     { bg: '#FFFBEB', text: '#B45309', border: '#FDE68A' },
  'Open Source':         { bg: '#F0FDF4', text: '#166534', border: '#86EFAC' },
  Sports:                { bg: '#FFF1F2', text: '#BE123C', border: '#FECDD3' },
  'Cultural/Arts':       { bg: '#FFF7ED', text: '#9A3412', border: '#FDBA74' },
  'Community Service':   { bg: '#F0FDFA', text: '#0F766E', border: '#99F6E4' },
  Leadership:            { bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE' },
  Scholarship:           { bg: '#FEFCE8', text: '#A16207', border: '#FEF08A' },
  'Social Impact':       { bg: '#F5F3FF', text: '#6D28D9', border: '#DDD6FE' },
  Other:                 { bg: '#F9FAFB', text: '#374151', border: '#D1D5DB' },
};

const EMPTY_FORM = {
  category: 'Technical',
  type: '',
  title: '',
  issuer: '',
  date: '',
  description: '',
};

const styles = {
  container: { padding: '24px 0' },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: { fontSize: 17, fontWeight: 700, color: '#111827', margin: 0 },
  addBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    background: '#111827',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    padding: '8px 16px',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  },
  filterRow: {
    display: 'flex',
    gap: 8,
    marginBottom: 20,
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  filterBtn: (active) => ({
    padding: '6px 14px',
    borderRadius: 20,
    border: active ? '2px solid #111827' : '1.5px solid #E5E7EB',
    background: active ? '#111827' : '#fff',
    color: active ? '#fff' : '#374151',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all .15s',
  }),
  countBadge: (active) => ({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: active ? 'rgba(255,255,255,0.25)' : '#F3F4F6',
    color: active ? '#fff' : '#6B7280',
    borderRadius: 10,
    fontSize: 11,
    fontWeight: 700,
    minWidth: 20,
    padding: '0 5px',
    marginLeft: 4,
  }),
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: 16,
  },
  card: {
    background: '#fff',
    border: '1.5px solid #E5E7EB',
    borderRadius: 12,
    padding: '18px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    transition: 'box-shadow .15s',
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  typeBadge: (type) => {
    const c = TYPE_COLORS[type] || TYPE_COLORS['Other'];
    return {
      display: 'inline-block',
      background: c.bg,
      color: c.text,
      border: `1px solid ${c.border}`,
      borderRadius: 6,
      fontSize: 11,
      fontWeight: 700,
      padding: '2px 9px',
      letterSpacing: '.02em',
    };
  },
  cardActions: { display: 'flex', gap: 4 },
  iconBtn: (color = '#6B7280') => ({
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color,
    padding: 4,
    borderRadius: 6,
    display: 'flex',
    alignItems: 'center',
    lineHeight: 1,
  }),
  cardTitle: { fontSize: 15, fontWeight: 700, color: '#111827', margin: 0 },
  cardIssuer: { fontSize: 13, color: '#6B7280', display: 'flex', alignItems: 'center', gap: 5 },
  cardDate: { fontSize: 12, color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: 5 },
  cardDesc: { fontSize: 13, color: '#374151', lineHeight: 1.6, margin: 0 },
  certRow: { display: 'flex', gap: 8, alignItems: 'center', marginTop: 4 },
  certLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 12,
    color: '#2563EB',
    textDecoration: 'none',
    fontWeight: 600,
  },
  uploadCertBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 12,
    color: '#059669',
    background: '#ECFDF5',
    border: '1px solid #6EE7B7',
    borderRadius: 6,
    padding: '3px 10px',
    cursor: 'pointer',
    fontWeight: 600,
  },
  uploadingBadge: {
    fontSize: 12,
    color: '#6B7280',
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  emptyState: {
    textAlign: 'center',
    padding: '56px 24px',
    color: '#9CA3AF',
  },
  emptyTitle: { fontSize: 16, fontWeight: 600, color: '#6B7280', margin: '12px 0 6px' },
  emptySub: { fontSize: 13, margin: 0 },
  // Modal
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.45)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    padding: '40px 16px',
    overflowY: 'auto',
  },
  modal: {
    background: '#fff',
    borderRadius: 16,
    width: '100%',
    maxWidth: 520,
    margin: 'auto',
    display: 'flex',
    flexDirection: 'column',
    maxHeight: 'calc(100vh - 80px)',
    overflow: 'hidden',
    boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px 16px',
    borderBottom: '1px solid #F3F4F6',
    flexShrink: 0,
  },
  modalTitle: { fontSize: 17, fontWeight: 700, color: '#111827', margin: 0 },
  modalBody: { flex: 1, overflowY: 'auto', padding: '20px 24px' },
  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 10,
    padding: '14px 24px',
    borderTop: '1px solid #F3F4F6',
    flexShrink: 0,
    background: '#fff',
  },
  label: { display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 },
  input: {
    width: '100%',
    padding: '9px 12px',
    border: '1.5px solid #E5E7EB',
    borderRadius: 8,
    fontSize: 13,
    outline: 'none',
    boxSizing: 'border-box',
    color: '#111827',
  },
  textarea: {
    width: '100%',
    padding: '9px 12px',
    border: '1.5px solid #E5E7EB',
    borderRadius: 8,
    fontSize: 13,
    outline: 'none',
    boxSizing: 'border-box',
    color: '#111827',
    resize: 'vertical',
    minHeight: 80,
    fontFamily: 'inherit',
  },
  select: {
    width: '100%',
    padding: '9px 12px',
    border: '1.5px solid #E5E7EB',
    borderRadius: 8,
    fontSize: 13,
    outline: 'none',
    boxSizing: 'border-box',
    color: '#111827',
    background: '#fff',
  },
  fieldGroup: { marginBottom: 14 },
  categoryToggle: { display: 'flex', gap: 0, marginBottom: 4 },
  catBtn: (active) => ({
    flex: 1,
    padding: '8px 0',
    border: '1.5px solid #E5E7EB',
    background: active ? '#111827' : '#fff',
    color: active ? '#fff' : '#374151',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all .15s',
  }),
  catBtnLeft: { borderRadius: '8px 0 0 8px' },
  catBtnRight: { borderRadius: '0 8px 8px 0', borderLeft: 'none' },
  cancelBtn: {
    padding: '9px 20px',
    border: '1.5px solid #E5E7EB',
    borderRadius: 8,
    background: '#fff',
    color: '#374151',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  },
  saveBtn: {
    padding: '9px 20px',
    border: 'none',
    borderRadius: 8,
    background: '#111827',
    color: '#fff',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  },
};

export default function Achievements() {
  const { profile, addAchievement, deleteAchievement, uploadAchievementCertificate } = useStudent();

  const [filter, setFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [uploadingId, setUploadingId] = useState(null);

  // One hidden file input per achievement card is cumbersome; use a single shared ref
  const certInputRef = useRef(null);
  const certTargetId = useRef(null);
  const formBodyRef = useRef(null);

  const achievements = profile?.achievements || [];

  useEffect(() => {
    if (showModal && formBodyRef.current) {
      setTimeout(() => {
        if (formBodyRef.current) {
          formBodyRef.current.scrollTop = 0;
        }
      }, 0);
    }
  }, [showModal]);

  const technical = achievements.filter(
    (a) => TECHNICAL_TYPES.includes(a.type)
  );
  const nonTechnical = achievements.filter(
    (a) => NON_TECHNICAL_TYPES.includes(a.type)
  );

  const displayed =
    filter === 'All'
      ? achievements
      : filter === 'Technical'
      ? technical
      : nonTechnical;

  const openModal = () => {
    setForm(EMPTY_FORM);
    setError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setError('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleCategorySwitch = (cat) => {
    setForm((f) => ({ ...f, category: cat, type: '' }));
  };

  const handleSave = async () => {
    if (!form.title.trim()) { setError('Title is required.'); return; }
    if (!form.type) { setError('Please select a type.'); return; }
    setSaving(true);
    setError('');
    try {
      await addAchievement({
        title: form.title.trim(),
        type: form.type,
        issuer: form.issuer.trim(),
        date: form.date || null,
        description: form.description.trim(),
      });
      closeModal();
    } catch (err) {
      setError(err.message || 'Failed to save achievement.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this achievement?')) return;
    try {
      await deleteAchievement(id);
    } catch {
      // silent
    }
  };

  const triggerCertUpload = (id) => {
    certTargetId.current = id;
    certInputRef.current?.click();
  };

  const handleCertFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !certTargetId.current) return;
    e.target.value = '';
    const id = certTargetId.current;
    setUploadingId(id);
    try {
      await uploadAchievementCertificate(id, file);
    } catch {
      alert('Certificate upload failed. Please try again.');
    } finally {
      setUploadingId(null);
      certTargetId.current = null;
    }
  };

  const typeOptions =
    form.category === 'Technical' ? TECHNICAL_TYPES : NON_TECHNICAL_TYPES;

  return (
    <div style={styles.container}>
      {/* Hidden cert file input */}
      <input
        type="file"
        ref={certInputRef}
        style={{ display: 'none' }}
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={handleCertFileChange}
      />

      {/* Header */}
      <div style={styles.header}>
        <h3 style={styles.title}>Achievements</h3>
        <button style={styles.addBtn} onClick={openModal}>
          <Icon name="add" size={16} color="#fff" />
          Add Achievement
        </button>
      </div>

      {/* Filter tabs */}
      <div style={styles.filterRow}>
        {['All', 'Technical', 'Non-Technical'].map((f) => {
          const active = filter === f;
          const count =
            f === 'All'
              ? achievements.length
              : f === 'Technical'
              ? technical.length
              : nonTechnical.length;
          return (
            <button key={f} style={styles.filterBtn(active)} onClick={() => setFilter(f)}>
              {f}
              <span style={styles.countBadge(active)}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Cards or empty state */}
      {displayed.length === 0 ? (
        <div style={styles.emptyState}>
          <Icon name="emoji_events" size={48} color="#D1D5DB" />
          <p style={styles.emptyTitle}>No achievements yet</p>
          <p style={styles.emptySub}>
            {filter === 'All'
              ? 'Add your first achievement to showcase your accomplishments.'
              : `No ${filter.toLowerCase()} achievements added yet.`}
          </p>
        </div>
      ) : (
        <div style={styles.grid}>
          {displayed.map((ach) => (
            <div key={ach.id} style={styles.card}>
              <div style={styles.cardTop}>
                <span style={styles.typeBadge(ach.type)}>{ach.type}</span>
                <div style={styles.cardActions}>
                  <button
                    style={styles.iconBtn('#EF4444')}
                    title="Delete"
                    onClick={() => handleDelete(ach.id)}
                  >
                    <Icon name="delete" size={17} color="#EF4444" />
                  </button>
                </div>
              </div>

              <p style={styles.cardTitle}>{ach.title}</p>

              {ach.issuer && (
                <div style={styles.cardIssuer}>
                  <Icon name="business" size={14} color="#9CA3AF" />
                  {ach.issuer}
                </div>
              )}

              {ach.date && (
                <div style={styles.cardDate}>
                  <Icon name="calendar_today" size={13} color="#9CA3AF" />
                  {new Date(ach.date).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </div>
              )}

              {ach.description && (
                <p style={styles.cardDesc}>{ach.description}</p>
              )}

              {/* Certificate section */}
              <div style={styles.certRow}>
                {uploadingId === ach.id ? (
                  <span style={styles.uploadingBadge}>
                    <Icon name="progress_activity" size={14} color="#6B7280" />
                    Uploading…
                  </span>
                ) : ach.certificate_url ? (
                  <>
                    <a
                      href={resolveFileUrl(ach.certificate_url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={styles.certLink}
                    >
                      <Icon name="workspace_premium" size={14} color="#2563EB" />
                      View Certificate
                    </a>
                    <button
                      style={styles.uploadCertBtn}
                      onClick={() => triggerCertUpload(ach.id)}
                    >
                      <Icon name="upload" size={13} color="#059669" />
                      Replace
                    </button>
                  </>
                ) : (
                  <button
                    style={styles.uploadCertBtn}
                    onClick={() => triggerCertUpload(ach.id)}
                  >
                    <Icon name="upload_file" size={13} color="#059669" />
                    Upload Certificate
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Achievement Modal — portalled to document.body to escape stacking context */}
      {showModal && createPortal(
        <div style={styles.overlay} onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div style={styles.modal}>
            {/* Modal Header */}
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Add Achievement</h3>
              <button style={styles.iconBtn()} onClick={closeModal}>
                <Icon name="close" size={20} color="#6B7280" />
              </button>
            </div>

            {/* Modal Body */}
            <div ref={formBodyRef} style={styles.modalBody}>
              {error && (
                <div style={{
                  background: '#FEF2F2', border: '1px solid #FECACA',
                  borderRadius: 8, padding: '10px 14px',
                  color: '#DC2626', fontSize: 13, marginBottom: 16,
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <Icon name="error" size={15} color="#DC2626" />
                  {error}
                </div>
              )}

              {/* Category toggle */}
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Category *</label>
                <div style={styles.categoryToggle}>
                  <button
                    style={{ ...styles.catBtn(form.category === 'Technical'), ...styles.catBtnLeft }}
                    onClick={() => handleCategorySwitch('Technical')}
                    type="button"
                  >
                    <Icon name="code" size={14} style={{ marginRight: 5 }} color={form.category === 'Technical' ? '#fff' : '#374151'} />
                    Technical
                  </button>
                  <button
                    style={{ ...styles.catBtn(form.category === 'Non-Technical'), ...styles.catBtnRight }}
                    onClick={() => handleCategorySwitch('Non-Technical')}
                    type="button"
                  >
                    <Icon name="diversity_3" size={14} style={{ marginRight: 5 }} color={form.category === 'Non-Technical' ? '#fff' : '#374151'} />
                    Non-Technical
                  </button>
                </div>
              </div>

              {/* Type */}
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Type *</label>
                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  style={styles.select}
                >
                  <option value="">— Select type —</option>
                  {typeOptions.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Title *</label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. AWS Cloud Practitioner, 1st Place at Hackathon"
                  style={styles.input}
                />
              </div>

              {/* Issuer */}
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Issued By / Organisation</label>
                <input
                  name="issuer"
                  value={form.issuer}
                  onChange={handleChange}
                  placeholder="e.g. Amazon, HackerEarth, College"
                  style={styles.input}
                />
              </div>

              {/* Date */}
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Date</label>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>

              {/* Description */}
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Brief description of the achievement…"
                  style={styles.textarea}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div style={styles.modalFooter}>
              <button style={styles.cancelBtn} onClick={closeModal} disabled={saving}>
                Cancel
              </button>
              <button style={styles.saveBtn} onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : 'Add Achievement'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
