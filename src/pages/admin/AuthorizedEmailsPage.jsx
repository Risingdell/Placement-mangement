import { useEffect, useMemo, useState } from 'react';
import * as authorizedEmailService from '../../services/authorizedEmailService';

const PAGE_SIZE = 10;

function AuthorizedEmailsPage() {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: PAGE_SIZE,
    offset: 0,
    totalPages: 1
  });

  const [showEntryModal, setShowEntryModal] = useState(false);
  const [entryMode, setEntryMode] = useState('add');
  const [editingEmailId, setEditingEmailId] = useState(null);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [deleteSnackbar, setDeleteSnackbar] = useState(null);

  const [csvFile, setCsvFile] = useState(null);
  const [csvPreview, setCsvPreview] = useState([]);
  const [csvErrors, setCsvErrors] = useState([]);
  const [statistics, setStatistics] = useState({
    total: 0,
    active_count: 0,
    used_count: 0,
    available_count: 0
  });
  const [banner, setBanner] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    student_name: '',
    usn: '',
    branch: '',
    batch_year: '',
    notes: ''
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchEmails();
  }, [searchTerm, statusFilter, sortBy, sortOrder, currentPage]);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const flashMessage = (type, message) => {
    setBanner({ type, message });
    setTimeout(() => setBanner(null), 3500);
  };

  const fetchEmails = async () => {
    try {
      setLoading(true);
      const response = await authorizedEmailService.getAllAuthorizedEmails({
        search: searchTerm,
        status: statusFilter,
        sortBy,
        order: sortOrder,
        limit: PAGE_SIZE,
        offset: (currentPage - 1) * PAGE_SIZE
      });
      setEmails(response.data || []);
      setPagination(
        response.pagination || {
          total: 0,
          limit: PAGE_SIZE,
          offset: 0,
          totalPages: 1
        }
      );
    } catch (error) {
      flashMessage('error', error.message || 'Failed to fetch authorized emails.');
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
      flashMessage('error', error.message || 'Failed to fetch statistics.');
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
    setEditingEmailId(null);
    setEntryMode('add');
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.email || !formData.email.trim()) {
      errors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const openAddModal = () => {
    resetForm();
    setEntryMode('add');
    setShowEntryModal(true);
  };

  const openEditModal = (email) => {
    setFormData({
      email: email.email || '',
      student_name: email.student_name || '',
      usn: email.usn || '',
      branch: email.branch || '',
      batch_year: email.batch_year || '',
      notes: email.notes || ''
    });
    setEntryMode('edit');
    setEditingEmailId(email.id);
    setFormErrors({});
    setShowEntryModal(true);
  };

  const handleSubmitEntry = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (entryMode === 'edit' && editingEmailId) {
        await authorizedEmailService.updateAuthorizedEmail(editingEmailId, formData);
        flashMessage('success', 'Authorization entry updated successfully.');
      } else {
        await authorizedEmailService.createAuthorizedEmail(formData);
        flashMessage('success', 'Email added to authorization list.');
      }
      setShowEntryModal(false);
      resetForm();
      fetchEmails();
      fetchStatistics();
    } catch (error) {
      flashMessage('error', error.message || 'Failed to save entry.');
    }
  };

  const askDisableOrEnable = (email) => {
    setConfirmAction({
      type: 'toggle',
      id: email.id,
      title: `${email.is_active ? 'Disable' : 'Enable'} Access`,
      message: `Are you sure you want to ${email.is_active ? 'disable' : 'enable'} access for ${email.email}?`
    });
    setShowConfirmModal(true);
  };

  const askDelete = (email) => {
    setDeleteSnackbar({
      id: email.id,
      email: email.email
    });
  };

  const handleConfirmAction = async () => {
    if (!confirmAction) return;
    try {
      if (confirmAction.type === 'toggle') {
        await authorizedEmailService.toggleEmailStatus(confirmAction.id);
        flashMessage('success', 'Access status updated successfully.');
      }
      setShowConfirmModal(false);
      setConfirmAction(null);
      fetchEmails();
      fetchStatistics();
    } catch (error) {
      flashMessage('error', error.message || 'Action failed.');
      setShowConfirmModal(false);
      setConfirmAction(null);
    }
  };

  const handleConfirmDeleteFromSnackbar = async () => {
    if (!deleteSnackbar) return;

    try {
      await authorizedEmailService.deleteAuthorizedEmail(deleteSnackbar.id);
      flashMessage('success', 'Authorization entry deleted successfully.');
      fetchEmails();
      fetchStatistics();
    } catch (error) {
      flashMessage('error', error.message || 'Failed to delete authorization entry.');
    } finally {
      setDeleteSnackbar(null);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setCsvFile(file);
    setCsvPreview([]);
    setCsvErrors([]);

    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.csv')) {
      setCsvErrors(['Only CSV is supported. Export your Excel sheet as CSV and upload.']);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = authorizedEmailService.parseCSV(event.target.result);
        if (parsed.length === 0) {
          setCsvErrors(['No valid email rows found in file.']);
          return;
        }
        setCsvPreview(parsed.slice(0, 8));
      } catch (error) {
        setCsvErrors([`CSV parse failed: ${error.message}`]);
      }
    };
    reader.readAsText(file);
  };

  const handleBulkUpload = async () => {
    if (!csvFile || csvErrors.length > 0) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed = authorizedEmailService.parseCSV(event.target.result);
        if (parsed.length === 0) {
          flashMessage('error', 'No valid rows found in selected file.');
          return;
        }
        const response = await authorizedEmailService.bulkCreateAuthorizedEmails(parsed);
        setShowBulkModal(false);
        setCsvFile(null);
        setCsvPreview([]);
        setCsvErrors([]);
        fetchEmails();
        fetchStatistics();
        flashMessage(
          'success',
          `Bulk upload complete: ${response.data.created} created, ${response.data.duplicates} skipped.`
        );
      } catch (error) {
        flashMessage('error', error.message || 'Bulk upload failed.');
      }
    };
    reader.readAsText(csvFile);
  };

  const exportCurrentResults = () => {
    const headers = ['Email', 'Student Name', 'USN', 'Branch', 'Batch', 'Status', 'Created'];
    const rows = emails.map((email) => [
      email.email || '',
      email.student_name || '',
      email.usn || '',
      email.branch || '',
      email.batch_year || '',
      email.is_used ? 'Used' : email.is_active ? 'Active' : 'Disabled',
      email.created_at ? new Date(email.created_at).toLocaleDateString() : ''
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `authorized_emails_page_${currentPage}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder((prev) => (prev === 'ASC' ? 'DESC' : 'ASC'));
    } else {
      setSortBy(column);
      setSortOrder('ASC');
    }
    setCurrentPage(1);
  };

  const getSortMarker = (column) => {
    if (sortBy !== column) return <span className="text-xs text-gray-500 ml-1">+-</span>;
    return (
      <span className="text-xs text-black ml-1">{sortOrder === 'ASC' ? '?' : '?'}</span>
    );
  };

  const statusBadge = (email) => {
    if (!email.is_active) {
      return 'bg-gray-100 text-gray-700 border border-gray-300';
    }
    if (email.is_used) {
      return 'bg-blue-100 text-blue-700 border border-blue-300';
    }
    return 'bg-green-100 text-green-700 border border-green-300';
  };

  const statusLabel = (email) => {
    if (!email.is_active) return 'Disabled';
    if (email.is_used) return 'Used';
    return 'Active';
  };

  const totalPages = Math.max(pagination.totalPages || 1, 1);
  const startEntry = pagination.total === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const endEntry = Math.min(currentPage * PAGE_SIZE, pagination.total || 0);

  const pageNumbers = useMemo(() => {
    const pages = [];
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, currentPage + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }, [currentPage, totalPages]);

  const metricCards = [
    {
      title: 'Total Whitelisted',
      value: statistics.total || 0,
      sub: 'All authorized emails',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-700'
    },
    {
      title: 'Active Access',
      value: statistics.active_count || 0,
      sub: 'Available for registration',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-700'
    },
    {
      title: 'Registered',
      value: statistics.used_count || 0,
      sub: 'Already used',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-700'
    },
    {
      title: 'Pending',
      value: statistics.available_count || 0,
      sub: 'Awaiting registration',
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-700'
    }
  ];

  return (
    <div className="space-y-6 text-black">
      {banner && (
        <div
          className={`rounded-none border px-4 py-3 text-sm ${
            banner.type === 'error'
              ? 'bg-red-50 border-red-300 text-red-700'
              : 'bg-green-50 border-green-300 text-green-700'
          }`}
        >
          {banner.message}
        </div>
      )}

      <section className="bg-gray-50 border border-black rounded-none p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="h-11 w-11 rounded-none border border-black bg-white flex items-center justify-center">
              <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2l7 4v6c0 5-3.5 9-7 10-3.5-1-7-5-7-10V6l7-4z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-black">Registration Access Control</h1>
              <p className="text-sm text-gray-700 mt-1">
                Manage who can register by adding emails manually or importing from CSV.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={openAddModal}
              className="h-11 px-4 rounded-none bg-black text-white border border-black hover:bg-gray-800 text-sm font-semibold"
            >
              + Add Email
            </button>
            <button
              onClick={() => setShowBulkModal(true)}
              className="h-11 px-4 rounded-none bg-white text-black border border-black hover:bg-gray-100 text-sm font-semibold"
            >
              Upload CSV
            </button>
            <button
              onClick={exportCurrentResults}
              className="h-11 px-4 rounded-none bg-transparent text-black border border-black hover:bg-gray-100 text-sm font-semibold"
            >
              Export CSV
            </button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {metricCards.map((card) => (
          <div
            key={card.title}
            className="bg-white border border-black rounded-none p-5 shadow-sm min-h-[148px] hover:shadow-md transition-shadow"
          >
            <div className={`h-10 w-10 rounded-none border border-black ${card.iconBg} flex items-center justify-center`}>
              <svg className={`w-5 h-5 ${card.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12h18M12 3v18" />
              </svg>
            </div>
            <p className="text-[32px] leading-none font-bold text-black mt-4">{card.value}</p>
            <p className="text-sm font-semibold text-black mt-2">{card.title}</p>
            <p className="text-xs text-gray-600 mt-1">{card.sub}</p>
          </div>
        ))}
      </section>

      <section className="bg-white border border-black rounded-none p-5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="relative flex-1">
            <svg className="w-4 h-4 text-gray-600 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.3-4.3M10.8 18a7.2 7.2 0 100-14.4 7.2 7.2 0 000 14.4z" />
            </svg>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by email, student name, or USN"
              className="w-full h-11 pl-10 pr-4 rounded-none border border-black bg-white text-black text-sm"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="h-11 px-4 rounded-none border border-black bg-white text-black text-sm min-w-[160px]"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="used">Used</option>
            <option value="unused">Unused</option>
            <option value="inactive">Inactive</option>
          </select>

          <div className="hidden lg:flex items-center h-11 px-2 text-gray-500">|</div>

          <div className="flex gap-2">
            <button onClick={openAddModal} className="h-11 px-4 rounded-none bg-black text-white border border-black hover:bg-gray-800 text-sm font-semibold">
              + Add Email
            </button>
            <button onClick={() => setShowBulkModal(true)} className="h-11 px-4 rounded-none bg-white text-black border border-black hover:bg-gray-100 text-sm font-semibold">
              Bulk Upload
            </button>
          </div>
        </div>

        <div className="hidden md:block overflow-x-auto border border-black rounded-none">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-black sticky top-0 z-10">
              <tr>
                <SortableHeader label="Email" column="email" onSort={handleSort} marker={getSortMarker('email')} />
                <SortableHeader label="Student" column="student_name" onSort={handleSort} marker={getSortMarker('student_name')} />
                <SortableHeader label="USN" column="usn" onSort={handleSort} marker={getSortMarker('usn')} />
                <SortableHeader label="Branch" column="branch" onSort={handleSort} marker={getSortMarker('branch')} />
                <SortableHeader label="Batch" column="batch_year" onSort={handleSort} marker={getSortMarker('batch_year')} />
                <SortableHeader label="Status" column="is_active" onSort={handleSort} marker={getSortMarker('is_active')} />
                <SortableHeader label="Created" column="created_at" onSort={handleSort} marker={getSortMarker('created_at')} />
                <th className="px-4 py-3 text-right font-semibold text-black">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-4 py-10 text-center text-gray-600">Loading authorized emails...</td>
                </tr>
              ) : emails.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-10 text-center text-gray-600">No records found.</td>
                </tr>
              ) : (
                emails.map((email, index) => (
                  <tr key={email.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100`}>
                    <td className="px-4 py-3 text-black font-medium min-h-[48px]">{email.email}</td>
                    <td className="px-4 py-3 text-black">{email.student_name || '-'}</td>
                    <td className="px-4 py-3 text-black">{email.usn || '-'}</td>
                    <td className="px-4 py-3 text-black">{email.branch || '-'}</td>
                    <td className="px-4 py-3 text-black">{email.batch_year || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2.5 py-1 rounded-none text-xs font-semibold ${statusBadge(email)}`}>
                        {statusLabel(email)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-black">
                      {email.created_at ? new Date(email.created_at).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openEditModal(email)} className="h-8 px-3 rounded-none border border-black bg-white hover:bg-gray-100 text-xs font-semibold">
                          Edit
                        </button>
                        <button
                          onClick={() => askDisableOrEnable(email)}
                          className="h-8 px-3 rounded-none border border-black bg-white hover:bg-gray-100 text-xs font-semibold"
                        >
                          {email.is_active ? 'Disable' : 'Enable'}
                        </button>
                        <button onClick={() => askDelete(email)} className="h-8 px-3 rounded-none border border-red-500 text-red-700 bg-red-50 hover:bg-red-100 text-xs font-semibold">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="md:hidden space-y-3">
          {loading ? (
            <div className="p-6 text-center border border-black rounded-none text-gray-600">Loading authorized emails...</div>
          ) : emails.length === 0 ? (
            <div className="p-6 text-center border border-black rounded-none text-gray-600">No records found.</div>
          ) : (
            emails.map((email) => (
              <div key={email.id} className="border border-black rounded-none p-4 bg-white space-y-2">
                <p className="text-sm"><span className="font-semibold">Email:</span> {email.email}</p>
                <p className="text-sm"><span className="font-semibold">Student:</span> {email.student_name || '-'}</p>
                <p className="text-sm"><span className="font-semibold">USN:</span> {email.usn || '-'}</p>
                <p className="text-sm"><span className="font-semibold">Branch:</span> {email.branch || '-'}</p>
                <p className="text-sm"><span className="font-semibold">Batch:</span> {email.batch_year || '-'}</p>
                <p className="text-sm">
                  <span className="font-semibold">Status:</span>{' '}
                  <span className={`inline-flex px-2 py-0.5 rounded-none text-xs font-semibold ${statusBadge(email)}`}>
                    {statusLabel(email)}
                  </span>
                </p>
                <div className="flex gap-2 pt-1">
                  <button onClick={() => openEditModal(email)} className="h-9 px-3 rounded-none border border-black bg-white hover:bg-gray-100 text-xs font-semibold">
                    Edit
                  </button>
                  <button onClick={() => askDisableOrEnable(email)} className="h-9 px-3 rounded-none border border-black bg-white hover:bg-gray-100 text-xs font-semibold">
                    {email.is_active ? 'Disable' : 'Enable'}
                  </button>
                  <button onClick={() => askDelete(email)} className="h-9 px-3 rounded-none border border-red-500 text-red-700 bg-red-50 hover:bg-red-100 text-xs font-semibold">
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-t border-black pt-4">
          <p className="text-sm text-gray-700">
            Showing {startEntry}-{endEntry} of {pagination.total || 0} entries
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="h-9 px-3 rounded-none border border-black bg-white hover:bg-gray-100 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {pageNumbers.map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`h-9 min-w-[36px] px-2 rounded-none border text-sm ${
                  currentPage === page
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-black border-black hover:bg-gray-100'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="h-9 px-3 rounded-none border border-black bg-white hover:bg-gray-100 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </section>

      {showEntryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowEntryModal(false)} />
          <div className="relative w-full max-w-xl bg-white border border-black rounded-none shadow-xl p-6">
            <h2 className="text-xl font-bold text-black">
              {entryMode === 'edit' ? 'Edit Authorization Entry' : 'Add Authorization Entry'}
            </h2>
            <p className="text-sm text-gray-700 mt-1">Only whitelisted emails can register on the platform.</p>

            <form onSubmit={handleSubmitEntry} className="mt-5 space-y-3">
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="student@college.edu"
                className="w-full h-11 px-4 rounded-none border border-black bg-white text-black text-sm"
              />
              {formErrors.email && <p className="text-xs text-red-700">{formErrors.email}</p>}
              <input
                type="text"
                value={formData.student_name}
                onChange={(e) => setFormData({ ...formData, student_name: e.target.value })}
                placeholder="Student Name"
                className="w-full h-11 px-4 rounded-none border border-black bg-white text-black text-sm"
              />
              <input
                type="text"
                value={formData.usn}
                onChange={(e) => setFormData({ ...formData, usn: e.target.value })}
                placeholder="USN"
                className="w-full h-11 px-4 rounded-none border border-black bg-white text-black text-sm"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={formData.branch}
                  onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                  placeholder="Branch"
                  className="w-full h-11 px-4 rounded-none border border-black bg-white text-black text-sm"
                />
                <input
                  type="number"
                  value={formData.batch_year}
                  onChange={(e) => setFormData({ ...formData, batch_year: e.target.value })}
                  placeholder="Batch Year"
                  className="w-full h-11 px-4 rounded-none border border-black bg-white text-black text-sm"
                />
              </div>
              <textarea
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Notes (optional)"
                className="w-full px-4 py-2 rounded-none border border-black bg-white text-black text-sm"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEntryModal(false)}
                  className="h-10 px-4 rounded-none border border-black bg-white hover:bg-gray-100 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-10 px-4 rounded-none border border-black bg-black text-white hover:bg-gray-800 text-sm font-semibold"
                >
                  {entryMode === 'edit' ? 'Save Changes' : 'Add Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowBulkModal(false)} />
          <div className="relative w-full max-w-2xl bg-white border border-black rounded-none shadow-xl p-6">
            <h2 className="text-xl font-bold text-black">Bulk Upload Whitelist</h2>
            <p className="text-sm text-gray-700 mt-1">Upload a CSV file with student emails. Required column: <code className="bg-gray-100 px-1 rounded text-xs font-mono">email</code></p>

            {/* Column format guide */}
            <div className="mt-3 rounded-none border border-gray-200 bg-gray-50 p-3 text-xs text-gray-700 space-y-1">
              <p className="font-semibold text-black">Required column order in your CSV / Excel:</p>
              <div className="font-mono bg-white border border-gray-200 rounded px-3 py-2 text-gray-800 overflow-x-auto whitespace-nowrap">
                email &nbsp;|&nbsp; student_name &nbsp;|&nbsp; usn &nbsp;|&nbsp; branch &nbsp;|&nbsp; batch_year
              </div>
              <p className="text-gray-500">Columns are case-insensitive. Only <span className="font-semibold text-black">email</span> is required — others are optional but recommended.</p>
              <a
                href="/templates/authorized_emails_template.csv"
                download="authorized_emails_template.csv"
                className="inline-flex items-center gap-1 mt-1 text-black font-semibold underline underline-offset-2 hover:text-gray-600"
              >
                ↓ Download pre-filled template (25 students)
              </a>
            </div>

            <div className="mt-4 space-y-3">
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileSelect}
                className="w-full h-11 px-3 py-2 rounded-none border border-black bg-white text-black text-sm"
              />

              {csvErrors.length > 0 && (
                <div className="rounded-none border border-red-400 bg-red-50 p-3 text-sm text-red-700">
                  {csvErrors.map((error, idx) => (
                    <p key={idx}>{error}</p>
                  ))}
                </div>
              )}

              {csvPreview.length > 0 && (
                <div className="rounded-none border border-black overflow-hidden">
                  <div className="px-3 py-2 border-b border-black bg-gray-50 text-xs font-semibold text-black">
                    Preview ({csvPreview.length} rows shown)
                  </div>
                  <table className="w-full text-sm">
                    <thead className="bg-white border-b border-black text-black">
                      <tr>
                        <th className="px-3 py-2 text-left">Email</th>
                        <th className="px-3 py-2 text-left">Student Name</th>
                        <th className="px-3 py-2 text-left">USN</th>
                        <th className="px-3 py-2 text-left">Branch</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {csvPreview.map((row, idx) => (
                        <tr key={idx}>
                          <td className="px-3 py-2">{row.email || '-'}</td>
                          <td className="px-3 py-2">{row.student_name || '-'}</td>
                          <td className="px-3 py-2">{row.usn || '-'}</td>
                          <td className="px-3 py-2">{row.branch || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-5">
              <button
                type="button"
                onClick={() => setShowBulkModal(false)}
                className="h-10 px-4 rounded-none border border-black bg-white hover:bg-gray-100 text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBulkUpload}
                disabled={!csvFile || csvErrors.length > 0}
                className="h-10 px-4 rounded-none border border-black bg-black text-white hover:bg-gray-800 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}

      {showConfirmModal && confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowConfirmModal(false)} />
          <div className="relative w-full max-w-md bg-white border border-black rounded-none shadow-xl p-6">
            <h3 className="text-lg font-bold text-black">{confirmAction.title}</h3>
            <p className="text-sm text-gray-700 mt-2">{confirmAction.message}</p>
            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="h-10 px-4 rounded-none border border-black bg-white hover:bg-gray-100 text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                className="h-10 px-4 rounded-none border border-black bg-black text-white hover:bg-gray-800 text-sm font-semibold"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteSnackbar && (
        <div className="fixed bottom-4 right-4 z-50 w-full max-w-md">
          <div className="bg-white border border-black rounded-none shadow-lg p-4">
            <p className="text-sm font-semibold text-black">Delete Authorization Entry</p>
            <p className="text-xs text-gray-700 mt-1 break-all">
              Delete <span className="font-semibold">{deleteSnackbar.email}</span> from whitelist?
            </p>
            <div className="flex justify-end gap-2 mt-3">
              <button
                onClick={() => setDeleteSnackbar(null)}
                className="h-9 px-3 rounded-none border border-black bg-white hover:bg-gray-100 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteFromSnackbar}
                className="h-9 px-3 rounded-none border border-red-500 text-red-700 bg-red-50 hover:bg-red-100 text-xs font-semibold"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SortableHeader({ label, column, onSort, marker }) {
  return (
    <th className="px-4 py-3 text-left font-semibold text-black">
      <button onClick={() => onSort(column)} className="inline-flex items-center bg-transparent border-none p-0 cursor-pointer text-black font-semibold">
        {label}
        {marker}
      </button>
    </th>
  );
}

export default AuthorizedEmailsPage;
