import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useStudent } from '../../context/StudentContext';

const emptyForm = {
  company_name: '',
  role: '',
  duration_months: '',
  start_date: '',
  end_date: '',
  description: '',
};

function Internships() {
  const { profile, fetchProfile, addInternship, updateInternship, deleteInternship } = useStudent();
  const [internships, setInternships] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const formBodyRef = useRef(null);

  useEffect(() => {
    if (profile?.internships) {
      setInternships(profile.internships);
    }
  }, [profile]);

  useEffect(() => {
    if (showModal && formBodyRef.current) {
      setTimeout(() => {
        if (formBodyRef.current) {
          formBodyRef.current.scrollTop = 0;
        }
      }, 0);
    }
  }, [showModal]);

  const openAddModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (internship) => {
    setEditingId(internship.id);
    setForm({
      company_name: internship.company_name || '',
      role: internship.role || '',
      duration_months: internship.duration_months || '',
      start_date: internship.start_date ? internship.start_date.split('T')[0] : '',
      end_date: internship.end_date ? internship.end_date.split('T')[0] : '',
      description: internship.description || '',
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.company_name.trim() || !form.role.trim()) {
      alert('Company name and role are required.');
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        await updateInternship(editingId, form);
        alert('Internship updated successfully!');
      } else {
        await addInternship(form);
        alert('Internship added successfully!');
      }
      await fetchProfile();
      closeModal();
    } catch (error) {
      console.error('Failed to save internship:', error);
      alert('Failed to save internship. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this internship?')) return;
    try {
      await deleteInternship(id);
      await fetchProfile();
      alert('Internship deleted successfully!');
    } catch (error) {
      console.error('Failed to delete internship:', error);
      alert('Failed to delete internship. Please try again.');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Present';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h3 style={styles.title}>Internships</h3>
          <p style={styles.subtitle}>Add your internship and work experience</p>
        </div>
        <button onClick={openAddModal} style={styles.addButton}>
          + Add Internship
        </button>
      </div>

      {internships.length === 0 ? (
        <div style={styles.emptyState}>
          <span className="material-symbols-outlined" style={{ fontSize: 48, color: '#D1D5DB', marginBottom: 10, display: 'block' }}>work</span>
          <p style={{ color: '#999', marginBottom: '20px' }}>No internships added yet.</p>
          <button onClick={openAddModal} style={styles.addButtonSecondary}>
            Add Your First Internship
          </button>
        </div>
      ) : (
        <div style={styles.list}>
          {internships.map((item) => (
            <div key={item.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <div>
                  <h4 style={styles.roleTitle}>{item.role}</h4>
                  <p style={styles.company}>{item.company_name}</p>
                  <p style={styles.duration}>
                    {formatDate(item.start_date)} – {formatDate(item.end_date)}
                    {item.duration_months ? ` · ${item.duration_months} month${item.duration_months > 1 ? 's' : ''}` : ''}
                  </p>
                </div>
                <div style={styles.cardActions}>
                  <button
                    onClick={() => openEditModal(item)}
                    style={styles.editButton}
                    title="Edit"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    style={styles.deleteButton}
                    title="Delete"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span>
                  </button>
                </div>
              </div>
              {item.description && (
                <p style={styles.description}>{item.description}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal — portalled to document.body to escape stacking context */}
      {showModal && createPortal(
        <div style={styles.modalOverlay} onClick={closeModal}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>
                {editingId ? 'Edit Internship' : 'Add Internship'}
              </h3>
              <button onClick={closeModal} style={styles.closeButton}><span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span></button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', minHeight: 0 }}>
              <div ref={formBodyRef} style={styles.formBody}>
                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Company Name *</label>
                    <input
                      type="text"
                      name="company_name"
                      value={form.company_name}
                      onChange={handleChange}
                      placeholder="e.g., Google"
                      style={styles.input}
                      required
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Role / Position *</label>
                    <input
                      type="text"
                      name="role"
                      value={form.role}
                      onChange={handleChange}
                      placeholder="e.g., Software Engineer Intern"
                      style={styles.input}
                      required
                    />
                  </div>
                </div>

                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Start Date</label>
                    <input
                      type="date"
                      name="start_date"
                      value={form.start_date}
                      onChange={handleChange}
                      style={styles.input}
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>End Date</label>
                    <input
                      type="date"
                      name="end_date"
                      value={form.end_date}
                      onChange={handleChange}
                      style={styles.input}
                    />
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Duration (months)</label>
                  <input
                    type="number"
                    name="duration_months"
                    value={form.duration_months}
                    onChange={handleChange}
                    placeholder="e.g., 3"
                    min="1"
                    max="24"
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Description</label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Briefly describe your role and responsibilities..."
                    rows={4}
                    style={{ ...styles.input, resize: 'vertical' }}
                  />
                </div>
              </div>

              <div style={styles.modalActions}>
                <button
                  type="button"
                  onClick={closeModal}
                  style={styles.cancelButton}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={styles.submitButton}
                  disabled={submitting}
                >
                  {submitting ? 'Saving...' : editingId ? 'Update' : 'Add Internship'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

const styles = {
  container: { width: '100%' },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '30px',
    paddingBottom: '15px',
    borderBottom: '2px solid #e0e0e0',
  },
  title: { fontSize: '1.5rem', fontWeight: 'bold', color: '#333', margin: '0 0 5px 0' },
  subtitle: { fontSize: '0.9rem', color: '#666', margin: 0 },
  addButton: {
    padding: '10px 20px',
    backgroundColor: '#2196F3',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontWeight: '500',
    whiteSpace: 'nowrap',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#999',
  },
  addButtonSecondary: {
    padding: '12px 24px',
    backgroundColor: '#2196F3',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
  },
  list: { display: 'flex', flexDirection: 'column', gap: '16px' },
  card: {
    backgroundColor: '#f9f9f9',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '20px',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  roleTitle: { fontSize: '1.1rem', fontWeight: '600', color: '#333', margin: '0 0 4px 0' },
  company: { fontSize: '0.95rem', color: '#2196F3', fontWeight: '500', margin: '0 0 4px 0' },
  duration: { fontSize: '0.85rem', color: '#888', margin: 0 },
  cardActions: { display: 'flex', gap: '8px' },
  editButton: {
    background: 'none',
    border: 'none',
    fontSize: '1rem',
    cursor: 'pointer',
    padding: '4px',
  },
  deleteButton: {
    background: 'none',
    border: 'none',
    fontSize: '1rem',
    cursor: 'pointer',
    padding: '4px',
  },
  description: {
    marginTop: '12px',
    fontSize: '0.9rem',
    color: '#555',
    lineHeight: '1.5',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '40px 16px',
    boxSizing: 'border-box',
    overflowY: 'auto',
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    maxWidth: '600px',
    width: '100%',
    maxHeight: 'calc(100vh - 80px)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    borderBottom: '1px solid #e0e0e0',
    flexShrink: 0,
  },
  modalTitle: { fontSize: '1.25rem', fontWeight: '600', color: '#333', margin: 0 },
  closeButton: {
    background: 'none',
    border: 'none',
    color: '#999',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '4px',
  },
  formBody: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    overflowY: 'auto',
    flex: 1,
  },
  formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '0.9rem', fontWeight: '500', color: '#555' },
  input: {
    padding: '10px 12px',
    fontSize: '1rem',
    border: '1px solid #e0e0e0',
    borderRadius: '4px',
    outline: 'none',
    boxSizing: 'border-box',
    width: '100%',
    fontFamily: 'inherit',
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    padding: '16px 20px',
    borderTop: '1px solid #e0e0e0',
    flexShrink: 0,
    backgroundColor: '#fff',
  },
  cancelButton: {
    padding: '10px 20px',
    backgroundColor: '#f5f5f5',
    color: '#666',
    border: '1px solid #e0e0e0',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.95rem',
  },
  submitButton: {
    padding: '10px 20px',
    backgroundColor: '#4CAF50',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.95rem',
  },
};

export default Internships;
