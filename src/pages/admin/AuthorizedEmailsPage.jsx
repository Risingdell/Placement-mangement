import { useState, useEffect } from 'react';
import * as authorizedEmailService from '../../services/authorizedEmailService';
import '../../styles/components/neo-brutalism.css';

function AuthorizedEmailsPage() {
  // State management
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [csvPreview, setCsvPreview] = useState([]);
  const [csvErrors, setCsvErrors] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState('');
  const [batchYearFilter, setBatchYearFilter] = useState('');

  const [statistics, setStatistics] = useState({
    total: 0,
    active_count: 0,
    used_count: 0,
    available_count: 0
  });

  const [formData, setFormData] = useState({
    email: '',
    student_name: '',
    usn: '',
    branch: '',
    batch_year: '',
    notes: ''
  });

  const [formErrors, setFormErrors] = useState({});

  // Constants
  const branchOptions = ['CSE', 'ISE', 'ECE', 'MECH', 'CIVIL', 'EEE', 'AI&ML', 'DS'];
  const batchYearOptions = ['2021', '2022', '2023', '2024', '2025', '2026', '2027'];

  // Fetch data on mount and when filters change
  useEffect(() => {
    fetchEmails();
    fetchStatistics();
  }, [searchTerm, statusFilter, branchFilter, batchYearFilter]);

  const fetchEmails = async () => {
    try {
      setLoading(true);
      const response = await authorizedEmailService.getAllAuthorizedEmails({
        search: searchTerm,
        status: statusFilter,
        batch_year: batchYearFilter,
        branch: branchFilter,
        limit: 50
      });

      setEmails(response.data);
      if (response.statistics) {
        setStatistics(response.statistics);
      }
    } catch (error) {
      alert('Error fetching emails: ' + error.message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await authorizedEmailService.getStatistics();
      if (response.data?.overall) {
        setStatistics(response.data.overall);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.email || formData.email.trim() === '') {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      if (modalMode === 'add') {
        await authorizedEmailService.createAuthorizedEmail(formData);
        alert('Email authorized successfully!');
      } else {
        await authorizedEmailService.updateAuthorizedEmail(selectedEmail.id, formData);
        alert('Email updated successfully!');
      }

      setShowModal(false);
      resetForm();
      fetchEmails();
    } catch (error) {
      alert('Error: ' + error.message);
      console.error(error);
    }
  };

  const handleAddEmail = () => {
    resetForm();
    setModalMode('add');
    setShowModal(true);
  };

  const handleEditEmail = (email) => {
    setSelectedEmail(email);
    setFormData({
      email: email.email,
      student_name: email.student_name || '',
      usn: email.usn || '',
      branch: email.branch || '',
      batch_year: email.batch_year || '',
      notes: email.notes || ''
    });
    setModalMode('edit');
    setShowModal(true);
  };

  const handleDeleteEmail = async (id, email) => {
    if (window.confirm(`Are you sure you want to delete ${email}?`)) {
      try {
        await authorizedEmailService.deleteAuthorizedEmail(id);
        alert('Email deleted successfully!');
        fetchEmails();
      } catch (error) {
        alert('Error deleting email: ' + error.message);
        console.error(error);
      }
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await authorizedEmailService.toggleEmailStatus(id);
      fetchEmails();
    } catch (error) {
      alert('Error toggling status: ' + error.message);
      console.error(error);
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      student_name: '',
      usn: '',
      branch: '',
      batch_year: '',
      notes: ''
    });
    setFormErrors({});
    setSelectedEmail(null);
  };

  // CSV Upload handlers
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCsvFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target.result;
          const parsed = authorizedEmailService.parseCSV(content);

          if (parsed.length === 0) {
            setCsvErrors(['No valid emails found in CSV']);
            setCsvPreview([]);
          } else {
            const preview = parsed.slice(0, 5);
            setCsvPreview(preview);
            setCsvErrors([]);
          }
        } catch (error) {
          setCsvErrors(['Error parsing CSV: ' + error.message]);
          setCsvPreview([]);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleBulkUpload = async () => {
    if (!csvFile) {
      alert('Please select a CSV file');
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const content = event.target.result;
        const parsed = authorizedEmailService.parseCSV(content);

        if (parsed.length === 0) {
          alert('No valid emails found in CSV');
          return;
        }

        const response = await authorizedEmailService.bulkCreateAuthorizedEmails(parsed);
        alert(`Upload complete: ${response.data.created} created, ${response.data.duplicates} duplicates skipped`);

        if (response.data.errors.length > 0) {
          console.log('Errors:', response.data.errors);
        }

        setShowBulkModal(false);
        setCsvFile(null);
        setCsvPreview([]);
        setCsvErrors([]);
        fetchEmails();
      };
      reader.readAsText(csvFile);
    } catch (error) {
      alert('Error uploading: ' + error.message);
      console.error(error);
    }
  };

  const handleExportCSV = () => {
    if (emails.length === 0) {
      alert('No emails to export');
      return;
    }

    // Prepare CSV content
    const headers = ['Email', 'Student Name', 'USN', 'Branch', 'Batch Year', 'Status', 'Used By', 'Added By', 'Created Date'];
    const rows = emails.map(email => [
      email.email,
      email.student_name || '',
      email.usn || '',
      email.branch || '',
      email.batch_year || '',
      email.is_used ? 'Used' : (email.is_active ? 'Active' : 'Inactive'),
      email.used_by_name || '',
      email.added_by_name || '',
      new Date(email.created_at).toLocaleDateString()
    ]);

    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `authorized-emails-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const getStatusBadge = (email) => {
    if (email.is_used) {
      return <span className="neo-badge neo-badge-success">Used</span>;
    } else if (email.is_active) {
      return <span className="neo-badge neo-badge-info">Active</span>;
    } else {
      return <span className="neo-badge neo-badge-warning">Inactive</span>;
    }
  };

  return (
    <div className="neo-page">
      <div className="neo-container">
        {/* Header */}
        <div className="neo-header">
          <h1 className="neo-title">📧 Authorized Emails</h1>
          <p className="neo-subtitle">Manage student email whitelist for registration</p>
        </div>

        {/* Statistics Cards */}
        <div className="neo-grid-4">
          <div className="neo-card">
            <div className="neo-card-value">{statistics.total || 0}</div>
            <div className="neo-card-label">Total Authorized</div>
          </div>
          <div className="neo-card">
            <div className="neo-card-value">{statistics.active_count || 0}</div>
            <div className="neo-card-label">Active</div>
          </div>
          <div className="neo-card">
            <div className="neo-card-value">{statistics.used_count || 0}</div>
            <div className="neo-card-label">Used</div>
          </div>
          <div className="neo-card">
            <div className="neo-card-value">{statistics.available_count || 0}</div>
            <div className="neo-card-label">Available</div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="neo-filter-bar">
          <input
            type="text"
            placeholder="Search email, name, or USN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="neo-input"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="neo-input"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="used">Used</option>
            <option value="unused">Unused</option>
            <option value="inactive">Inactive</option>
          </select>
          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="neo-input"
          >
            <option value="">All Branches</option>
            {branchOptions.map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
          <select
            value={batchYearFilter}
            onChange={(e) => setBatchYearFilter(e.target.value)}
            className="neo-input"
          >
            <option value="">All Batches</option>
            {batchYearOptions.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        {/* Action Buttons */}
        <div className="neo-button-group">
          <button onClick={handleAddEmail} className="neo-button neo-button-primary">
            ➕ Add Email
          </button>
          <button onClick={() => setShowBulkModal(true)} className="neo-button neo-button-secondary">
            📤 Bulk Upload CSV
          </button>
          <button onClick={handleExportCSV} className="neo-button neo-button-secondary">
            ⬇️ Export CSV
          </button>
        </div>

        {/* Data Table */}
        {loading ? (
          <div className="neo-loading">Loading...</div>
        ) : emails.length === 0 ? (
          <div className="neo-empty">No authorized emails found</div>
        ) : (
          <div className="neo-table-wrapper">
            <table className="neo-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Student Name</th>
                  <th>USN</th>
                  <th>Branch</th>
                  <th>Batch</th>
                  <th>Status</th>
                  <th>Used By</th>
                  <th>Added By</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {emails.map(email => (
                  <tr key={email.id}>
                    <td className="neo-email">{email.email}</td>
                    <td>{email.student_name || '-'}</td>
                    <td>{email.usn || '-'}</td>
                    <td>{email.branch || '-'}</td>
                    <td>{email.batch_year || '-'}</td>
                    <td>{getStatusBadge(email)}</td>
                    <td>{email.used_by_name || '-'}</td>
                    <td>{email.added_by_name || '-'}</td>
                    <td className="neo-date">
                      {new Date(email.created_at).toLocaleDateString()}
                    </td>
                    <td className="neo-actions">
                      <button
                        onClick={() => handleToggleStatus(email.id)}
                        className="neo-button-small neo-button-info"
                        title={email.is_active ? 'Deactivate' : 'Activate'}
                      >
                        {email.is_active ? '⏸️' : '▶️'}
                      </button>
                      <button
                        onClick={() => handleEditEmail(email)}
                        className="neo-button-small neo-button-warning"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteEmail(email.id, email.email)}
                        className="neo-button-small neo-button-danger"
                        disabled={email.is_used}
                        title={email.is_used ? 'Cannot delete used email' : 'Delete'}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="neo-modal-overlay" onClick={() => setShowModal(false)}>
            <div className="neo-modal" onClick={e => e.stopPropagation()}>
              <div className="neo-modal-header">
                <h2>{modalMode === 'add' ? 'Add Authorized Email' : 'Edit Email'}</h2>
                <button onClick={() => setShowModal(false)} className="neo-modal-close">×</button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="neo-form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={modalMode === 'edit'}
                    className={`neo-input ${formErrors.email ? 'neo-error' : ''}`}
                    placeholder="student@college.edu"
                  />
                  {formErrors.email && <div className="neo-error-text">{formErrors.email}</div>}
                </div>

                <div className="neo-form-group">
                  <label>Student Name</label>
                  <input
                    type="text"
                    name="student_name"
                    value={formData.student_name}
                    onChange={handleInputChange}
                    className="neo-input"
                    placeholder="Optional"
                  />
                </div>

                <div className="neo-form-group">
                  <label>USN</label>
                  <input
                    type="text"
                    name="usn"
                    value={formData.usn}
                    onChange={handleInputChange}
                    className="neo-input"
                    placeholder="Optional"
                  />
                </div>

                <div className="neo-form-row">
                  <div className="neo-form-group">
                    <label>Branch</label>
                    <select
                      name="branch"
                      value={formData.branch}
                      onChange={handleInputChange}
                      className="neo-input"
                    >
                      <option value="">Select Branch</option>
                      {branchOptions.map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>

                  <div className="neo-form-group">
                    <label>Batch Year</label>
                    <select
                      name="batch_year"
                      value={formData.batch_year}
                      onChange={handleInputChange}
                      className="neo-input"
                    >
                      <option value="">Select Batch</option>
                      {batchYearOptions.map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="neo-form-group">
                  <label>Notes</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    className="neo-input neo-textarea"
                    placeholder="Optional admin notes"
                    rows="3"
                  />
                </div>

                <div className="neo-modal-actions">
                  <button type="button" onClick={() => setShowModal(false)} className="neo-button neo-button-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="neo-button neo-button-primary">
                    {modalMode === 'add' ? 'Add Email' : 'Update Email'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Bulk Upload Modal */}
        {showBulkModal && (
          <div className="neo-modal-overlay" onClick={() => setShowBulkModal(false)}>
            <div className="neo-modal" onClick={e => e.stopPropagation()}>
              <div className="neo-modal-header">
                <h2>Bulk Upload CSV</h2>
                <button onClick={() => setShowBulkModal(false)} className="neo-modal-close">×</button>
              </div>

              <div className="neo-modal-content">
                <p className="neo-text-muted">CSV Format: email, student_name, usn, branch, batch_year, notes</p>

                <div className="neo-form-group">
                  <label>Select CSV File</label>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    className="neo-input"
                  />
                </div>

                {csvErrors.length > 0 && (
                  <div className="neo-error">
                    {csvErrors.map((error, i) => (
                      <div key={i}>{error}</div>
                    ))}
                  </div>
                )}

                {csvPreview.length > 0 && (
                  <div>
                    <p className="neo-text-muted">Preview (showing {csvPreview.length} of {csvPreview.length} emails):</p>
                    <div className="neo-table-wrapper">
                      <table className="neo-table neo-table-small">
                        <thead>
                          <tr>
                            <th>Email</th>
                            <th>Name</th>
                            <th>USN</th>
                            <th>Branch</th>
                          </tr>
                        </thead>
                        <tbody>
                          {csvPreview.map((email, i) => (
                            <tr key={i}>
                              <td>{email.email}</td>
                              <td>{email.student_name || '-'}</td>
                              <td>{email.usn || '-'}</td>
                              <td>{email.branch || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div className="neo-modal-actions">
                  <button onClick={() => setShowBulkModal(false)} className="neo-button neo-button-secondary">
                    Cancel
                  </button>
                  <button
                    onClick={handleBulkUpload}
                    disabled={!csvFile || csvErrors.length > 0}
                    className="neo-button neo-button-primary"
                  >
                    Upload
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AuthorizedEmailsPage;
