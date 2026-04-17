import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useOutletContext } from 'react-router-dom';
import * as companyService from '../../services/companyService';
import { Skeleton } from '../../Components/common/Skeleton';

function CompaniesPage() {
  const { adminTheme, setIsModalOpen } = useOutletContext() || {};
  const isLight = adminTheme !== 'dark';

  const card    = isLight ? 'bg-white border border-gray-200 shadow-sm'  : 'bg-[#1e1e22] border border-[#2f2f34]';
  const txt     = isLight ? 'text-gray-900'   : 'text-[#e8e8ed]';
  const sub     = isLight ? 'text-gray-500'   : 'text-[#8e8e93]';
  const inp     = isLight ? 'bg-white border-gray-300 text-gray-900'     : 'bg-[#2a2a2f] border-[#3f3f46] text-[#e8e8ed]';
  const modalBg = isLight ? 'bg-white'        : 'bg-[#1e1e22]';
  const divider = isLight ? 'border-gray-200' : 'border-[#2f2f34]';
  const theadBg = isLight ? 'bg-gray-50'      : 'bg-[#252528]';
  const rowHov  = isLight ? 'hover:bg-gray-50' : 'hover:bg-[#28282c]';
  const overlay = isLight ? 'bg-gray-900/50'  : 'bg-black/60';

  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const logoInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '', company_type: 'Product', location: '', description: ''
  });

  useEffect(() => { fetchCompanies(); }, []);

  useEffect(() => {
    setIsModalOpen?.(showModal);
  }, [showModal, setIsModalOpen]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const response = await companyService.getAllCompanies();
      setCompanies(response.data || []);
    } catch {
      alert('Failed to load companies');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCompany = () => {
    setModalMode('add');
    setFormData({ name: '', company_type: 'Product', location: '', description: '' });
    setLogoFile(null);
    setLogoPreview('');
    setShowModal(true);
  };

  const handleEditCompany = (company) => {
    setModalMode('edit');
    setSelectedCompany(company);
    setFormData({
      name: company.name,
      company_type: company.company_type || 'Product',
      location: company.location || '',
      description: company.description || ''
    });
    setLogoFile(null);
    setLogoPreview(company.logo_url || '');
    setShowModal(true);
  };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { alert('Only image files allowed'); return; }
    if (file.size > 2 * 1024 * 1024) { alert('Logo must be under 2MB'); return; }
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleDeleteCompany = async (id) => {
    if (!window.confirm('Are you sure you want to delete this company?')) return;
    try {
      await companyService.deleteCompany(id, false);
      setCompanies(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      if (error.message && error.message.includes('placement drive')) {
        const confirmed = window.confirm(
          `⚠️ ${error.message}\n\nDeleting this company will also delete all its placement drives and student applications.\n\nDo you want to proceed?`
        );
        if (!confirmed) return;
        try {
          await companyService.deleteCompany(id, true);
          setCompanies(prev => prev.filter(c => c.id !== id));
        } catch (forceError) {
          alert(forceError.message || 'Failed to delete company');
        }
      } else {
        alert(error.message || 'Failed to delete company');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData();
    fd.append('name', formData.name);
    fd.append('company_type', formData.company_type);
    fd.append('location', formData.location);
    fd.append('description', formData.description);
    fd.append('industry', 'Technology');
    fd.append('is_active', 1);
    if (logoFile) fd.append('logo', logoFile);
    try {
      if (modalMode === 'add') {
        await companyService.createCompany(fd);
        alert('Company added successfully!');
      } else {
        await companyService.updateCompany(selectedCompany.id, fd);
        alert('Company updated successfully!');
      }
      setShowModal(false);
      fetchCompanies();
    } catch {
      alert('Failed to save company');
    } finally {
      setSubmitting(false);
    }
  };

  const STAT_CARDS = [
    { label: 'Total Companies',  value: companies.length,                                    color: txt },
    { label: 'Active Companies', value: companies.filter(c => c.is_active).length,           color: 'text-emerald-600' },
    { label: 'Product Based',    value: companies.filter(c => c.company_type === 'Product').length, color: 'text-blue-600' },
    { label: 'Service Based',    value: companies.filter(c => c.company_type === 'Service').length, color: 'text-amber-600' },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><Skeleton className="h-7 w-52 mb-2" /><Skeleton className="h-4 w-72" /></div>
          <Skeleton className="h-10 w-36" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className={`${card} p-5`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1"><Skeleton className="h-5 w-3/4 mb-2" /><Skeleton className="h-4 w-1/2" /></div>
                <Skeleton className="h-6 w-16 ml-3" />
              </div>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3 mb-4" />
              <div className="flex gap-2"><Skeleton className="h-8 flex-1" /><Skeleton className="h-8 flex-1" /></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-2xl font-bold ${txt}`}>Company Management</h2>
          <p className={`${sub} mt-1`}>Manage companies for placement drives</p>
        </div>
        <button
          onClick={handleAddCompany}
          style={{ background: '#f7b545' }}
          className="flex items-center px-4 py-2.5 text-[#1a1a1e] font-semibold text-sm shadow-sm hover:opacity-90 transition-opacity"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Company
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STAT_CARDS.map(({ label, value, color }) => (
          <div key={label} className={`${card} p-4`}>
            <p className={`text-xs font-semibold ${sub} uppercase tracking-wide mb-1`}>{label}</p>
            <p className={`text-2xl font-bold tabular-nums ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Companies Table */}
      <div className={`${card} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`${theadBg} border-b ${divider}`}>
              <tr>
                {['Company Name', 'Type', 'Location', 'Status', 'Actions'].map((h, i) => (
                  <th key={h} className={`px-6 py-3 text-xs font-semibold ${sub} uppercase tracking-wider ${i === 4 ? 'text-right' : 'text-left'}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className={`divide-y ${divider}`}>
              {companies.map((company) => (
                <tr key={company.id} className={`${rowHov} transition-colors`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {company.logo_url ? (
                        <img src={company.logo_url} alt={company.name} className="w-10 h-10 object-contain border border-gray-200 bg-white mr-3" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center text-[#1a1a1e] font-bold mr-3">
                          {company.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <div className={`text-sm font-semibold ${txt}`}>{company.name}</div>
                        <div className={`text-xs ${sub}`}>{company.industry || 'Technology'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-0.5 text-xs font-semibold ${
                      company.company_type === 'Product' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {company.company_type}
                    </span>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${txt}`}>{company.location || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-0.5 text-xs font-semibold ${
                      company.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {company.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                    <button onClick={() => handleEditCompany(company)} className="text-indigo-500 hover:text-indigo-700 inline-flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </button>
                    <button onClick={() => handleDeleteCompany(company.id)} className="text-red-500 hover:text-red-700 inline-flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {companies.length === 0 && (
                <tr>
                  <td colSpan="5" className={`px-6 py-8 text-center text-sm ${sub}`}>
                    No companies found. Click "Add Company" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Company Modal */}
      {showModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4">
          <div className={`absolute inset-0 ${overlay} backdrop-blur-sm`} onClick={() => setShowModal(false)} />
          <div className={`relative w-full max-w-2xl flex flex-col shadow-2xl ${modalBg} z-10 max-h-[96vh]`}>
            {/* Modal Header */}
            <div className={`flex items-center justify-between px-6 py-5 border-b ${divider} flex-shrink-0`}>
              <h3 className={`text-lg font-bold ${txt}`}>
                {modalMode === 'add' ? 'Add New Company' : 'Edit Company'}
              </h3>
              <button onClick={() => setShowModal(false)} className={`${sub} hover:${txt} p-1`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4 overflow-y-auto flex-1 min-h-0">
              {/* Logo Upload */}
              <div>
                <label className={`block text-sm font-semibold ${txt} mb-2`}>Company Logo</label>
                <div className="flex items-center gap-4">
                  <div
                    onClick={() => logoInputRef.current?.click()}
                    className={`w-20 h-20 border-2 border-dashed ${isLight ? 'border-gray-300 bg-gray-50' : 'border-[#3f3f46] bg-[#2a2a2f]'} flex items-center justify-center cursor-pointer overflow-hidden`}
                  >
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain" />
                    ) : (
                      <svg className={`w-8 h-8 ${sub}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      className={`px-3 py-1.5 text-sm border ${divider} ${txt} hover:opacity-80 transition-opacity`}
                    >
                      {logoPreview ? 'Change Logo' : 'Upload Logo'}
                    </button>
                    <p className={`text-xs ${sub} mt-1`}>PNG, JPG up to 2MB</p>
                  </div>
                  <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-semibold ${txt} mb-1.5`}>Company Name *</label>
                  <input
                    type="text" required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full px-4 py-2.5 border ${inp} text-sm outline-none focus:border-[#f7b545]`}
                    placeholder="e.g., Google"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-semibold ${txt} mb-1.5`}>Company Type *</label>
                  <select
                    required
                    value={formData.company_type}
                    onChange={(e) => setFormData({ ...formData, company_type: e.target.value })}
                    className={`w-full px-4 py-2.5 border ${inp} text-sm outline-none focus:border-[#f7b545]`}
                  >
                    <option value="Product">Product Based</option>
                    <option value="Service">Service Based</option>
                    <option value="Startup">Startup</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={`block text-sm font-semibold ${txt} mb-1.5`}>Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className={`w-full px-4 py-2.5 border ${inp} text-sm outline-none focus:border-[#f7b545]`}
                  placeholder="e.g., Bangalore"
                />
              </div>

              <div>
                <label className={`block text-sm font-semibold ${txt} mb-1.5`}>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className={`w-full px-4 py-2.5 border ${inp} text-sm outline-none focus:border-[#f7b545] resize-none`}
                  placeholder="Brief description about the company and roles offered"
                />
              </div>

              <div className={`border ${isLight ? 'border-blue-200 bg-blue-50' : 'border-blue-900/40 bg-blue-950/30'} px-4 py-3`}>
                <p className={`text-sm ${isLight ? 'text-blue-800' : 'text-blue-300'}`}>
                  <strong>Note:</strong> Eligibility criteria and shortlisted students will be managed when you create a Drive for this company.
                </p>
              </div>
            </form>

            {/* Modal Footer */}
            <div className={`flex justify-end gap-3 px-6 py-5 border-t ${divider} ${isLight ? 'bg-gray-50' : 'bg-[#252528]'} flex-shrink-0`}>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className={`px-5 py-2.5 border ${divider} ${txt} text-sm font-semibold hover:opacity-80 transition-opacity`}
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={submitting}
                style={{ background: '#f7b545' }}
                className="px-6 py-2.5 text-[#1a1a1e] text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {submitting ? 'Saving…' : modalMode === 'add' ? 'Add Company' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

export default CompaniesPage;
