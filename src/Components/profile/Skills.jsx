import { useState, useEffect } from 'react';
import { useStudent } from '../../context/StudentContext';

function Skills() {
  const { profile, fetchProfile, addSkill, deleteSkill } = useStudent();
  const [skills, setSkills] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSkill, setNewSkill] = useState({
    skill_name: '',
    category: 'Programming',
    proficiency: 'Intermediate',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (profile?.skills) {
      setSkills(profile.skills);
    }
  }, [profile]);

  const categories = ['Programming', 'Framework', 'Tool', 'Soft Skill', 'Other'];
  const proficiencyLevels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

  const handleAddSkill = async (e) => {
    e.preventDefault();

    if (!newSkill.skill_name.trim()) {
      alert('Please enter a skill name');
      return;
    }

    setSubmitting(true);
    try {
      await addSkill(newSkill);
      await fetchProfile();
      setShowAddModal(false);
      setNewSkill({
        skill_name: '',
        category: 'Programming',
        proficiency: 'Intermediate',
      });
      alert('Skill added successfully!');
    } catch (error) {
      console.error('Failed to add skill:', error);
      alert('Failed to add skill. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSkill = async (skillId) => {
    if (!window.confirm('Are you sure you want to delete this skill?')) {
      return;
    }

    try {
      await deleteSkill(skillId);
      await fetchProfile();
      alert('Skill deleted successfully!');
    } catch (error) {
      console.error('Failed to delete skill:', error);
      alert('Failed to delete skill. Please try again.');
    }
  };

  const groupedSkills = skills.reduce((acc, skill) => {
    const category = skill.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(skill);
    return acc;
  }, {});

  const getProficiencyColor = (proficiency) => {
    switch (proficiency) {
      case 'Expert': return '#4CAF50';
      case 'Advanced': return '#2196F3';
      case 'Intermediate': return '#FF9800';
      case 'Beginner': return '#9E9E9E';
      default: return '#9E9E9E';
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h3 style={styles.title}>Skills</h3>
          <p style={styles.subtitle}>Manage your technical and soft skills</p>
        </div>
        <button onClick={() => setShowAddModal(true)} style={styles.addButton}>
          + Add Skill
        </button>
      </div>

      {skills.length === 0 ? (
        <div style={styles.emptyState}>
          <p>No skills added yet.</p>
          <button onClick={() => setShowAddModal(true)} style={styles.addButtonSecondary}>
            Add Your First Skill
          </button>
        </div>
      ) : (
        <div style={styles.skillsContainer}>
          {Object.entries(groupedSkills).map(([category, categorySkills]) => (
            <div key={category} style={styles.categorySection}>
              <h4 style={styles.categoryTitle}>{category}</h4>
              <div style={styles.skillsGrid}>
                {categorySkills.map(skill => (
                  <div key={skill.id} style={styles.skillCard}>
                    <div style={styles.skillHeader}>
                      <span style={styles.skillName}>{skill.skill_name}</span>
                      <button
                        onClick={() => handleDeleteSkill(skill.id)}
                        style={styles.deleteButton}
                        title="Delete skill"
                      >
                        ×
                      </button>
                    </div>
                    <div style={{
                      ...styles.proficiencyBadge,
                      backgroundColor: getProficiencyColor(skill.proficiency),
                    }}>
                      {skill.proficiency}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Skill Modal */}
      {showAddModal && (
        <div style={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Add New Skill</h3>
              <button
                onClick={() => setShowAddModal(false)}
                style={styles.closeButton}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddSkill}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Skill Name *</label>
                <input
                  type="text"
                  value={newSkill.skill_name}
                  onChange={(e) => setNewSkill({ ...newSkill, skill_name: e.target.value })}
                  placeholder="e.g., React.js"
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Category</label>
                <select
                  value={newSkill.category}
                  onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
                  style={styles.select}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Proficiency Level</label>
                <select
                  value={newSkill.proficiency}
                  onChange={(e) => setNewSkill({ ...newSkill, proficiency: e.target.value })}
                  style={styles.select}
                >
                  {proficiencyLevels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>

              <div style={styles.modalActions}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
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
                  {submitting ? 'Adding...' : 'Add Skill'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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
    alignItems: 'flex-start',
    marginBottom: '30px',
    paddingBottom: '15px',
    borderBottom: '2px solid #e0e0e0',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#333',
    margin: '0 0 5px 0',
  },
  subtitle: {
    fontSize: '0.9rem',
    color: '#666',
    margin: 0,
  },
  addButton: {
    padding: '10px 20px',
    backgroundColor: '#2196F3',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontWeight: '500',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#999',
  },
  addButtonSecondary: {
    marginTop: '20px',
    padding: '12px 24px',
    backgroundColor: '#2196F3',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
  },
  skillsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '30px',
  },
  categorySection: {
    marginBottom: '10px',
  },
  categoryTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#555',
    marginBottom: '15px',
    paddingBottom: '8px',
    borderBottom: '1px solid #e0e0e0',
  },
  skillsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '15px',
  },
  skillCard: {
    backgroundColor: '#f9f9f9',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '15px',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  skillHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '10px',
  },
  skillName: {
    fontSize: '1rem',
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  deleteButton: {
    background: 'none',
    border: 'none',
    fontSize: '1.5rem',
    color: '#999',
    cursor: 'pointer',
    padding: '0',
    width: '24px',
    height: '24px',
    lineHeight: '24px',
    transition: 'color 0.2s',
  },
  proficiencyBadge: {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '0.8rem',
    color: '#fff',
    fontWeight: '500',
  },
  modalOverlay: {
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
    padding: '0',
    maxWidth: '500px',
    width: '90%',
    maxHeight: '90vh',
    overflow: 'auto',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    borderBottom: '1px solid #e0e0e0',
  },
  modalTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#333',
    margin: 0,
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '2rem',
    color: '#999',
    cursor: 'pointer',
    padding: '0',
    width: '30px',
    height: '30px',
    lineHeight: '30px',
  },
  formGroup: {
    padding: '0 20px',
    marginTop: '20px',
  },
  label: {
    display: 'block',
    fontSize: '0.9rem',
    fontWeight: '500',
    color: '#555',
    marginBottom: '8px',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    fontSize: '1rem',
    border: '1px solid #e0e0e0',
    borderRadius: '4px',
    outline: 'none',
    boxSizing: 'border-box',
  },
  select: {
    width: '100%',
    padding: '10px 12px',
    fontSize: '1rem',
    border: '1px solid #e0e0e0',
    borderRadius: '4px',
    outline: 'none',
    backgroundColor: '#fff',
    boxSizing: 'border-box',
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    padding: '20px',
    borderTop: '1px solid #e0e0e0',
    marginTop: '20px',
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

export default Skills;
