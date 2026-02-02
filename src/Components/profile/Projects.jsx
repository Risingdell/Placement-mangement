import { useState, useEffect } from 'react';
import { useStudent } from '../../context/StudentContext';
import {
  validateProjectTitle,
  validateProjectDates,
  validateURL,
  validateRequiredText,
} from '../../utils/validators';

function Projects() {
  const { profile, fetchProfile, addProject, updateProject, deleteProject } = useStudent();
  const [projects, setProjects] = useState([]);
  const [filter, setFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const initialProjectState = {
    title: '',
    description: '',
    tech_stack: '',
    start_date: '',
    end_date: '',
    project_url: '',
    demo_url: '',
    status: 'Ongoing',
  };

  const [newProject, setNewProject] = useState(initialProjectState);

  useEffect(() => {
    if (profile?.projects) {
      setProjects(profile.projects);
    }
  }, [profile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (showEditModal) {
      setEditingProject(prev => ({ ...prev, [name]: value }));
    } else {
      setNewProject(prev => ({ ...prev, [name]: value }));
    }

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const currentData = showEditModal ? editingProject : newProject;
    let validation;

    switch (name) {
      case 'title':
        validation = validateProjectTitle(value);
        break;
      case 'description':
        validation = validateRequiredText(value, 'Description', 10, 500);
        break;
      case 'tech_stack':
        validation = validateRequiredText(value, 'Technologies', 2, 200);
        break;
      case 'project_url':
      case 'demo_url':
        validation = validateURL(value);
        break;
      case 'end_date':
        if (currentData.status === 'Completed') {
          validation = validateProjectDates(currentData.start_date, value);
        }
        break;
      default:
        return;
    }

    if (validation && !validation.valid) {
      setErrors(prev => ({ ...prev, [name]: validation.message }));
    }
  };

  const validateProjectForm = (projectData) => {
    const newErrors = {};

    const titleValidation = validateProjectTitle(projectData.title);
    if (!titleValidation.valid) newErrors.title = titleValidation.message;

    const descValidation = validateRequiredText(projectData.description, 'Description', 10, 500);
    if (!descValidation.valid) newErrors.description = descValidation.message;

    const techValidation = validateRequiredText(projectData.tech_stack, 'Technologies', 2, 200);
    if (!techValidation.valid) newErrors.tech_stack = techValidation.message;

    if (!projectData.start_date) {
      newErrors.start_date = 'Start date is required';
    }

    if (projectData.status === 'Completed') {
      if (!projectData.end_date) {
        newErrors.end_date = 'End date is required for completed projects';
      } else {
        const dateValidation = validateProjectDates(projectData.start_date, projectData.end_date);
        if (!dateValidation.valid) newErrors.end_date = dateValidation.message;
      }
    }

    if (projectData.project_url) {
      const urlValidation = validateURL(projectData.project_url);
      if (!urlValidation.valid) newErrors.project_url = urlValidation.message;
    }

    if (projectData.demo_url) {
      const demoUrlValidation = validateURL(projectData.demo_url);
      if (!demoUrlValidation.valid) newErrors.demo_url = demoUrlValidation.message;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddProject = async (e) => {
    e.preventDefault();

    if (!validateProjectForm(newProject)) {
      alert('Please fix the validation errors before submitting.');
      return;
    }

    setSubmitting(true);
    try {
      await addProject(newProject);
      await fetchProfile();
      setShowAddModal(false);
      setNewProject(initialProjectState);
      setErrors({});
      alert('Project added successfully!');
    } catch (error) {
      console.error('Failed to add project:', error);
      alert('Failed to add project. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditProject = (project) => {
    setEditingProject({ ...project });
    setShowEditModal(true);
    setErrors({});
  };

  const handleUpdateProject = async (e) => {
    e.preventDefault();

    if (!validateProjectForm(editingProject)) {
      alert('Please fix the validation errors before submitting.');
      return;
    }

    setSubmitting(true);
    try {
      await updateProject(editingProject.id, editingProject);
      await fetchProfile();
      setShowEditModal(false);
      setEditingProject(null);
      setErrors({});
      alert('Project updated successfully!');
    } catch (error) {
      console.error('Failed to update project:', error);
      alert('Failed to update project. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project?')) {
      return;
    }

    try {
      await deleteProject(projectId);
      await fetchProfile();
      alert('Project deleted successfully!');
    } catch (error) {
      console.error('Failed to delete project:', error);
      alert('Failed to delete project. Please try again.');
    }
  };

  const filteredProjects = filter === 'All'
    ? projects
    : projects.filter(p => p.status === filter);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h3 style={styles.title}>Projects</h3>
          <p style={styles.subtitle}>Showcase your academic and personal projects</p>
        </div>
        <button onClick={() => setShowAddModal(true)} style={styles.addButton}>
          + Add Project
        </button>
      </div>

      {/* Filter Tabs */}
      <div style={styles.tabContainer}>
        <button
          onClick={() => setFilter('All')}
          style={filter === 'All' ? styles.tabActive : styles.tab}
        >
          All ({projects.length})
        </button>
        <button
          onClick={() => setFilter('Ongoing')}
          style={filter === 'Ongoing' ? styles.tabActive : styles.tab}
        >
          Ongoing ({projects.filter(p => p.status === 'Ongoing').length})
        </button>
        <button
          onClick={() => setFilter('Completed')}
          style={filter === 'Completed' ? styles.tabActive : styles.tab}
        >
          Completed ({projects.filter(p => p.status === 'Completed').length})
        </button>
      </div>

      {/* Projects List */}
      {filteredProjects.length === 0 ? (
        <div style={styles.emptyState}>
          <span style={styles.emptyIcon}>📁</span>
          <p style={styles.emptyText}>No projects added yet</p>
          <button onClick={() => setShowAddModal(true)} style={styles.addButtonSecondary}>
            Add Your First Project
          </button>
        </div>
      ) : (
        <div style={styles.projectsGrid}>
          {filteredProjects.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={handleEditProject}
              onDelete={handleDeleteProject}
            />
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <ProjectModal
          project={showEditModal ? editingProject : newProject}
          isEdit={showEditModal}
          onClose={() => {
            setShowAddModal(false);
            setShowEditModal(false);
            setEditingProject(null);
            setNewProject(initialProjectState);
            setErrors({});
          }}
          onSubmit={showEditModal ? handleUpdateProject : handleAddProject}
          onChange={handleChange}
          onBlur={handleBlur}
          errors={errors}
          submitting={submitting}
        />
      )}
    </div>
  );
}

// Project Card Component
const ProjectCard = ({ project, onEdit, onDelete }) => (
  <div style={styles.projectCard}>
    <div style={styles.projectHeader}>
      <h4 style={styles.projectTitle}>{project.title}</h4>
      <div style={styles.projectActions}>
        <button onClick={() => onEdit(project)} style={styles.editIconButton} title="Edit project">
          ✎
        </button>
        <button onClick={() => onDelete(project.id)} style={styles.deleteIconButton} title="Delete project">
          ×
        </button>
      </div>
    </div>

    <div style={{
      ...styles.statusBadge,
      backgroundColor: project.status === 'Ongoing' ? '#2196F3' : '#4CAF50',
    }}>
      {project.status}
    </div>

    <p style={styles.projectDescription}>{project.description}</p>

    <div style={styles.techStack}>
      <strong>Technologies:</strong> {project.tech_stack}
    </div>

    <div style={styles.projectDates}>
      <span>{new Date(project.start_date).toLocaleDateString()}</span>
      {project.end_date && (
        <span> - {new Date(project.end_date).toLocaleDateString()}</span>
      )}
    </div>

    <div style={styles.projectLinks}>
      {project.project_url && (
        <a href={project.project_url} target="_blank" rel="noopener noreferrer" style={styles.link}>
          🔗 Repository
        </a>
      )}
      {project.demo_url && (
        <a href={project.demo_url} target="_blank" rel="noopener noreferrer" style={styles.link}>
          🚀 Live Demo
        </a>
      )}
    </div>
  </div>
);

// Project Modal Component
const ProjectModal = ({ project, isEdit, onClose, onSubmit, onChange, onBlur, errors, submitting }) => (
  <div style={styles.modalOverlay} onClick={onClose}>
    <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
      <div style={styles.modalHeader}>
        <h3 style={styles.modalTitle}>{isEdit ? 'Edit Project' : 'Add New Project'}</h3>
        <button onClick={onClose} style={styles.closeButton}>×</button>
      </div>

      <form onSubmit={onSubmit} style={styles.modalBody}>
        {/* Title */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Project Title *</label>
          <input
            type="text"
            name="title"
            value={project.title}
            onChange={onChange}
            onBlur={onBlur}
            style={errors.title ? styles.inputError : styles.input}
            placeholder="e.g., E-Commerce Web Application"
            required
          />
          {errors.title && <div style={styles.errorText}>{errors.title}</div>}
        </div>

        {/* Description */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Description *</label>
          <textarea
            name="description"
            value={project.description}
            onChange={onChange}
            onBlur={onBlur}
            rows="4"
            style={errors.description ? styles.textareaError : styles.textarea}
            placeholder="Describe your project, its purpose, and key features..."
            required
          />
          {errors.description && <div style={styles.errorText}>{errors.description}</div>}
        </div>

        {/* Tech Stack */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Technologies Used *</label>
          <input
            type="text"
            name="tech_stack"
            value={project.tech_stack}
            onChange={onChange}
            onBlur={onBlur}
            style={errors.tech_stack ? styles.inputError : styles.input}
            placeholder="e.g., React, Node.js, MongoDB, Express"
            required
          />
          {errors.tech_stack && <div style={styles.errorText}>{errors.tech_stack}</div>}
        </div>

        {/* Status */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Status</label>
          <select name="status" value={project.status} onChange={onChange} style={styles.select}>
            <option value="Ongoing">Ongoing</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        {/* Dates */}
        <div style={styles.formRow}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Start Date *</label>
            <input
              type="date"
              name="start_date"
              value={project.start_date}
              onChange={onChange}
              onBlur={onBlur}
              style={errors.start_date ? styles.inputError : styles.input}
              required
            />
            {errors.start_date && <div style={styles.errorText}>{errors.start_date}</div>}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>
              End Date {project.status === 'Completed' && '*'}
            </label>
            <input
              type="date"
              name="end_date"
              value={project.end_date}
              onChange={onChange}
              onBlur={onBlur}
              style={errors.end_date ? styles.inputError : styles.input}
              required={project.status === 'Completed'}
            />
            {errors.end_date && <div style={styles.errorText}>{errors.end_date}</div>}
          </div>
        </div>

        {/* URLs */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Project URL (GitHub/Repository)</label>
          <input
            type="url"
            name="project_url"
            value={project.project_url}
            onChange={onChange}
            onBlur={onBlur}
            style={errors.project_url ? styles.inputError : styles.input}
            placeholder="https://github.com/username/project"
          />
          {errors.project_url && <div style={styles.errorText}>{errors.project_url}</div>}
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Demo URL (Live Site)</label>
          <input
            type="url"
            name="demo_url"
            value={project.demo_url}
            onChange={onChange}
            onBlur={onBlur}
            style={errors.demo_url ? styles.inputError : styles.input}
            placeholder="https://demo.example.com"
          />
          {errors.demo_url && <div style={styles.errorText}>{errors.demo_url}</div>}
        </div>

        {/* Actions */}
        <div style={styles.modalActions}>
          <button
            type="button"
            onClick={onClose}
            style={styles.cancelButton}
            disabled={submitting}
          >
            Cancel
          </button>
          <button type="submit" style={styles.submitButton} disabled={submitting}>
            {submitting ? (isEdit ? 'Updating...' : 'Adding...') : (isEdit ? 'Update Project' : 'Add Project')}
          </button>
        </div>
      </form>
    </div>
  </div>
);

const styles = {
  container: {
    width: '100%',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '24px',
    paddingBottom: '15px',
    borderBottom: '2px solid #e0e0e0',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#333',
    margin: '0 0 4px 0',
  },
  subtitle: {
    fontSize: '0.9rem',
    color: '#666',
    margin: 0,
  },
  addButton: {
    padding: '10px 20px',
    backgroundColor: '#4CAF50',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontWeight: '500',
    transition: 'background-color 0.3s',
  },
  tabContainer: {
    display: 'flex',
    gap: '8px',
    marginBottom: '24px',
  },
  tab: {
    padding: '10px 20px',
    backgroundColor: '#f5f5f5',
    color: '#666',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '500',
    transition: 'all 0.3s',
  },
  tabActive: {
    padding: '10px 20px',
    backgroundColor: '#2196F3',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '600',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
  },
  emptyIcon: {
    fontSize: '4rem',
    display: 'block',
    marginBottom: '16px',
  },
  emptyText: {
    fontSize: '1.1rem',
    color: '#666',
    marginBottom: '24px',
  },
  addButtonSecondary: {
    padding: '12px 24px',
    backgroundColor: '#2196F3',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '500',
  },
  projectsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '24px',
  },
  projectCard: {
    backgroundColor: '#fff',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '20px',
    transition: 'all 0.3s ease',
  },
  projectHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px',
  },
  projectTitle: {
    margin: 0,
    fontSize: '1.2rem',
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  projectActions: {
    display: 'flex',
    gap: '8px',
  },
  editIconButton: {
    padding: '6px 10px',
    backgroundColor: '#2196F3',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
  },
  deleteIconButton: {
    padding: '6px 10px',
    backgroundColor: '#f44336',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1.2rem',
  },
  statusBadge: {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '0.8rem',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '12px',
  },
  projectDescription: {
    fontSize: '0.95rem',
    color: '#555',
    lineHeight: '1.6',
    marginBottom: '12px',
  },
  techStack: {
    fontSize: '0.9rem',
    color: '#666',
    marginBottom: '12px',
    padding: '8px',
    backgroundColor: '#f5f5f5',
    borderRadius: '4px',
  },
  projectDates: {
    fontSize: '0.85rem',
    color: '#999',
    marginBottom: '12px',
  },
  projectLinks: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
  },
  link: {
    color: '#2196F3',
    textDecoration: 'none',
    fontSize: '0.9rem',
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
    maxWidth: '600px',
    width: '90%',
    maxHeight: '90vh',
    overflow: 'auto',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px',
    borderBottom: '1px solid #e0e0e0',
  },
  modalTitle: {
    margin: 0,
    fontSize: '1.3rem',
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '2rem',
    color: '#999',
    cursor: 'pointer',
    padding: 0,
    width: '32px',
    height: '32px',
  },
  modalBody: {
    padding: '24px',
  },
  formGroup: {
    marginBottom: '20px',
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  label: {
    display: 'block',
    fontSize: '0.9rem',
    fontWeight: '500',
    color: '#555',
    marginBottom: '6px',
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
  inputError: {
    width: '100%',
    padding: '10px 12px',
    fontSize: '1rem',
    border: '1px solid #f44336',
    borderRadius: '4px',
    outline: 'none',
    backgroundColor: '#ffebee',
    boxSizing: 'border-box',
  },
  textarea: {
    width: '100%',
    padding: '10px 12px',
    fontSize: '1rem',
    border: '1px solid #e0e0e0',
    borderRadius: '4px',
    outline: 'none',
    fontFamily: 'inherit',
    resize: 'vertical',
    boxSizing: 'border-box',
  },
  textareaError: {
    width: '100%',
    padding: '10px 12px',
    fontSize: '1rem',
    border: '1px solid #f44336',
    borderRadius: '4px',
    outline: 'none',
    fontFamily: 'inherit',
    resize: 'vertical',
    backgroundColor: '#ffebee',
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
  errorText: {
    fontSize: '0.8rem',
    color: '#f44336',
    marginTop: '4px',
  },
  modalActions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    marginTop: '24px',
    paddingTop: '20px',
    borderTop: '1px solid #e0e0e0',
  },
  cancelButton: {
    padding: '10px 20px',
    backgroundColor: '#f5f5f5',
    color: '#666',
    border: '1px solid #e0e0e0',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontWeight: '500',
  },
  submitButton: {
    padding: '10px 20px',
    backgroundColor: '#4CAF50',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontWeight: '500',
  },
};

export default Projects;
