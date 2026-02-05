import { useState, useEffect, useCallback } from 'react';
import * as companyService from '../../services/companyService';

function CompaniesPage() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showShortlistModal, setShowShortlistModal] = useState(false);
  const [shortlistedStudents, setShortlistedStudents] = useState([]);
  const [loadingShortlist, setLoadingShortlist] = useState(false);
  const [eligibleStudents, setEligibleStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [notifying, setNotifying] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    company_type: 'Product',
    location: '',
    description: '',
    minCgpa: '',
    allowedBranches: [],
    maxBacklogs: '',
    allowedBatchYears: []
  });

  const branchOptions = ['CSE', 'ISE', 'ECE', 'MECH', 'CIVIL', 'EEE', 'AI&ML', 'DS'];
  const batchYearOptions = ['2024', '2025', '2026', '2027'];

  // Fetch companies on mount
  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const response = await companyService.getAllCompanies();
      setCompanies(response.data || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
      alert('Failed to load companies');
    } finally {
      setLoading(false);
    }
  };

  // Fetch eligible students when criteria changes
  const fetchEligibleStudents = useCallback(async () => {
    // Only fetch if at least one criterion is set
    if (!formData.minCgpa && formData.allowedBranches.length === 0 &&
      !formData.maxBacklogs && formData.allowedBatchYears.length === 0) {
      setEligibleStudents([]);
      return;
    }

    try {
      setLoadingStudents(true);
      const criteria = {
        minCgpa: formData.minCgpa,
        branches: formData.allowedBranches,
        maxBacklogs: formData.maxBacklogs,
        batchYears: formData.allowedBatchYears
      };
      const response = await companyService.getEligibleStudents(criteria);
      setEligibleStudents(response.data || []);
    } catch (error) {
      console.error('Error fetching eligible students:', error);
    } finally {
      setLoadingStudents(false);
    }
  }, [formData.minCgpa, formData.allowedBranches, formData.maxBacklogs, formData.allowedBatchYears]);

  // Debounce eligible students fetch
  useEffect(() => {
    const timer = setTimeout(() => {
      if (showModal) {
        fetchEligibleStudents();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [fetchEligibleStudents, showModal]);

  const handleAddCompany = () => {
    setModalMode('add');
    setFormData({
      name: '',
      company_type: 'Product',
      location: '',
      description: '',
      minCgpa: '',
      allowedBranches: [],
      maxBacklogs: '',
      allowedBatchYears: []
    });
    setEligibleStudents([]);
    setShowModal(true);
  };

  const handleEditCompany = (company) => {
    setModalMode('edit');
    setSelectedCompany(company);
    setFormData({
      name: company.name,
      company_type: company.company_type || 'Product',
      location: company.location || '',
      description: company.description || '',
      minCgpa: company.min_cgpa || '',
      allowedBranches: company.allowed_branches ? company.allowed_branches.split(',') : [],
      maxBacklogs: company.max_backlogs || '',
      allowedBatchYears: company.allowed_batch_years ? company.allowed_batch_years.split(',') : []
    });
    setShowModal(true);
  };

  const handleDeleteCompany = async (id) => {
    if (!window.confirm('Are you sure you want to delete this company?')) return;

    try {
      await companyService.deleteCompany(id);
      fetchCompanies(); // Refresh list
    } catch (error) {
      console.error('Error deleting company:', error);
      alert('Failed to delete company');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const companyData = {
      name: formData.name,
      company_type: formData.company_type,
      location: formData.location,
      description: formData.description,
      industry: 'Technology',
      is_active: 1
    };

    try {
      if (modalMode === 'add') {
        const response = await companyService.createCompany(companyData);
        const companyId = response.data.id;

        // Automatically shortlist eligible students
        if (eligibleStudents.length > 0) {
          try {
            // Shortlist each eligible student
            for (const student of eligibleStudents) {
              await companyService.createShortlist(companyId, {
                student_id: student.id,
                status: 'Shortlisted',
                remarks: 'Automatically shortlisted based on eligibility criteria'
              });
            }
            alert(`Company created successfully! ${eligibleStudents.length} students were automatically shortlisted.`);
          } catch (shortlistError) {
            console.error('Error shortlisting students:', shortlistError);
            alert(`Company created, but there was an error shortlisting students: ${shortlistError.message}`);
          }
        } else {
          alert('Company created successfully!');
        }
      } else {
        await companyService.updateCompany(selectedCompany.id, companyData);
        alert('Company updated successfully!');
      }
      setShowModal(false);
      fetchCompanies(); // Refresh list
    } catch (error) {
      console.error('Error saving company:', error);
      alert('Failed to save company');
    }
  };

  const handleManageShortlist = async (company) => {
    setSelectedCompany(company);
    setShowShortlistModal(true);

    // Fetch shortlisted students for this company
    try {
      setLoadingShortlist(true);
      const response = await companyService.getCompanyShortlists(company.id);
      setShortlistedStudents(response.data || []);
    } catch (error) {
      console.error('Error fetching shortlists:', error);
      setShortlistedStudents([]);
    } finally {
      setLoadingShortlist(false);
    }
  };

  const toggleBranch = (branch) => {
    setFormData(prev => ({
      ...prev,
      allowedBranches: prev.allowedBranches.includes(branch)
        ? prev.allowedBranches.filter(b => b !== branch)
        : [...prev.allowedBranches, branch]
    }));
  };

  const toggleBatchYear = (year) => {
    setFormData(prev => ({
      ...prev,
      allowedBatchYears: prev.allowedBatchYears.includes(year)
        ? prev.allowedBatchYears.filter(y => y !== year)
        : [...prev.allowedBatchYears, year]
    }));
  };

  const handleSearch = async (term) => {
    setSearchTerm(term);
    if (term.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      setIsSearching(true);
      const response = await companyService.searchStudents(term);
      // Filter out students already in the shortlist
      const existingIds = shortlistedStudents.map(s => s.student_id);
      const filtered = (response.data || []).filter(s => !existingIds.includes(s.id));
      setSearchResults(filtered);
    } catch (error) {
      console.error('Error searching students:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddManualShortlist = async (student) => {
    try {
      await companyService.createShortlist(selectedCompany.id, {
        student_id: student.id,
        status: 'Shortlisted',
        remarks: 'Manually shortlisted'
      });

      // Refresh shortlist
      const response = await companyService.getCompanyShortlists(selectedCompany.id);
      setShortlistedStudents(response.data || []);

      // Clear search
      setSearchTerm('');
      setSearchResults([]);
      setShowSearch(false);

      // Update company count locally if possible or just refresh all companies
      fetchCompanies();

      alert(`${student.name} added to shortlist successfully!`);
    } catch (error) {
      console.error('Error adding to shortlist:', error);
      alert('Failed to add student to shortlist');
    }
  };

  const handleSendNotifications = async () => {
    if (!selectedCompany || shortlistedStudents.length === 0) return;

    try {
      setNotifying(true);
      const response = await companyService.notifyShortlistedStudents(selectedCompany.id);
      alert(response.message || 'Notifications sent successfully!');

      // Refresh shortlist to show 'Notified' status
      const shortlistRes = await companyService.getCompanyShortlists(selectedCompany.id);
      setShortlistedStudents(shortlistRes.data || []);
    } catch (error) {
      console.error('Error sending notifications:', error);
      alert('Failed to send notifications. Please check the network connection.');
    } finally {
      setNotifying(false);
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading companies...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="neo-title !text-3xl mb-1 uppercase tracking-tight">MANAGE COMPANIES</h2>
          <p className="neo-subtitle !text-[11px] font-bold opacity-60 uppercase">System Partner Directory</p>
        </div>
        <button
          onClick={handleAddCompany}
          className="neo-button !px-6 !py-3 !bg-indigo-600 !text-white flex items-center shadow-[4px_4px_0px_#323232]"
        >
          <span className="text-xl mr-2">+</span>
          <span className="font-bold uppercase tracking-wider">Add Company</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="neo-card !bg-white !p-4 !gap-1 border-purple-500 shadow-[4px_4px_0px_#a855f7]">
          <p className="neo-subtitle !text-[10px] font-bold opacity-60 uppercase">Total Partners</p>
          <div className="flex items-center justify-between">
            <h3 className="neo-title !text-2xl !mb-0">{companies.length}</h3>
            <span className="text-2xl">🏢</span>
          </div>
        </div>

        <div className="neo-card !bg-white !p-4 !gap-1 border-green-500 shadow-[4px_4px_0px_#22c55e]">
          <p className="neo-subtitle !text-[10px] font-bold opacity-60 uppercase">Active Now</p>
          <div className="flex items-center justify-between">
            <h3 className="neo-title !text-2xl !mb-0">{companies.filter(c => c.is_active).length}</h3>
            <span className="text-2xl">✅</span>
          </div>
        </div>

        <div className="neo-card !bg-white !p-4 !gap-1 border-blue-500 shadow-[4px_4px_0px_#3b82f6]">
          <p className="neo-subtitle !text-[10px] font-bold opacity-60 uppercase">Product Based</p>
          <div className="flex items-center justify-between">
            <h3 className="neo-title !text-2xl !mb-0">{companies.filter(c => c.company_type === 'Product').length}</h3>
            <span className="text-2xl">💎</span>
          </div>
        </div>

        <div className="neo-card !bg-white !p-4 !gap-1 border-orange-500 shadow-[4px_4px_0px_#f97316]">
          <p className="neo-subtitle !text-[10px] font-bold opacity-60 uppercase">Service Based</p>
          <div className="flex items-center justify-between">
            <h3 className="neo-title !text-2xl !mb-0">{companies.filter(c => c.company_type === 'Service').length}</h3>
            <span className="text-2xl">🛠️</span>
          </div>
        </div>
      </div>

      {/* Companies Table */}
      <div className="neo-card !bg-white !p-0 overflow-hidden mb-10 shadow-[8px_8px_0px_#d3d3d3]">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#f8f8f8] border-b-2 border-[#323232]">
                <th className="px-6 py-4 text-left neo-subtitle !text-[11px] font-bold uppercase tracking-wider text-[#323232]">
                  Company Entity
                </th>
                <th className="px-6 py-4 text-left neo-subtitle !text-[11px] font-bold uppercase tracking-wider text-[#323232]">
                  Classification
                </th>
                <th className="px-6 py-4 text-left neo-subtitle !text-[11px] font-bold uppercase tracking-wider text-[#323232]">
                  HQ Location
                </th>
                <th className="px-6 py-4 text-left neo-subtitle !text-[11px] font-bold uppercase tracking-wider text-[#323232]">
                  System Status
                </th>
                <th className="px-6 py-4 text-left neo-subtitle !text-[11px] font-bold uppercase tracking-wider text-[#323232]">
                  Shortlisted
                </th>
                <th className="px-6 py-4 text-right neo-subtitle !text-[11px] font-bold uppercase tracking-wider text-[#323232]">
                  Operations
                </th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-[#323232] divide-dashed">
              {companies.map((company) => (
                <tr key={company.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-indigo-500 border-2 border-[#323232] rounded flex items-center justify-center text-white font-bold mr-3 shadow-[2px_2px_0px_#323232]">
                        {company.name.charAt(0)}
                      </div>
                      <div>
                        <div className="neo-subtitle !text-[13px] font-bold text-[#323232]">{company.name.toUpperCase()}</div>
                        <div className="neo-subtitle !text-[10px] font-bold opacity-50 uppercase">{company.industry || 'Technology'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <span className={`px-3 py-1 border-2 border-[#323232] rounded text-[10px] font-bold shadow-[2px_2px_0px_#323232] ${company.company_type === 'Product'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-orange-100 text-orange-800'
                      }`}>
                      {company.company_type.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap neo-subtitle !text-[12px] font-bold text-[#323232]">
                    {company.location?.toUpperCase() || 'N/A'}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <span className={`px-3 py-1 border-2 border-[#323232] rounded text-[10px] font-bold shadow-[2px_2px_0px_#323232] ${company.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                      }`}>
                      {company.is_active ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <button
                      onClick={() => handleManageShortlist(company)}
                      className="neo-subtitle !text-[12px] font-bold text-indigo-600 hover:text-indigo-800 underline underline-offset-4 decoration-2"
                    >
                      {company.total_shortlisted || 0} RECRUITS
                    </button>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-right space-x-3">
                    <button
                      onClick={() => handleEditCompany(company)}
                      className="neo-button !py-1 !px-3 !bg-indigo-50 !text-indigo-800 !text-[11px] !min-h-0 !border-[#4f46e5]"
                    >
                      EDIT
                    </button>
                    <button
                      onClick={() => handleDeleteCompany(company.id)}
                      className="neo-button !py-1 !px-3 !bg-red-50 !text-red-700 !text-[11px] !min-h-0 !border-red-600"
                    >
                      DELETE
                    </button>
                  </td>
                </tr>
              ))}
              {companies.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center neo-subtitle !text-[13px] font-bold opacity-50 uppercase tracking-widest italic">
                    — DATABASE EMPTY —
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Company Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="neo-card !bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto !p-8 shadow-[12px_12px_0px_#323232]">
            <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-[#323232] border-dashed">
              <h3 className="neo-title !text-2xl !mb-0 uppercase tracking-tight">
                {modalMode === 'add' ? 'INITIALIZE NEW PARTNER' : 'UPDATE PARTNER INTEL'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="neo-button !p-2 !w-10 !h-10 !flex items-center justify-center !min-h-0 !translate-y-0"
              >
                <span className="text-2xl font-bold">×</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="neo-subtitle !text-[11px] font-bold uppercase mb-2 block text-[#323232]">
                    COMPANY IDENTITY *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="neo-input uppercase"
                    placeholder="E.G., GOOGLE"
                  />
                </div>

                <div>
                  <label className="neo-subtitle !text-[11px] font-bold uppercase mb-2 block text-[#323232]">
                    CLASSIFICATION *
                  </label>
                  <select
                    required
                    value={formData.company_type}
                    onChange={(e) => setFormData({ ...formData, company_type: e.target.value })}
                    className="neo-input uppercase"
                  >
                    <option value="Product">PRODUCT BASED</option>
                    <option value="Service">SERVICE BASED</option>
                    <option value="Startup">STARTUP</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="neo-subtitle !text-[11px] font-bold uppercase mb-2 block text-[#323232]">
                  HQ OPERATIONS CENTER
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="neo-input uppercase"
                  placeholder="E.G., BANGALORE"
                />
              </div>

              <div>
                <label className="neo-subtitle !text-[11px] font-bold uppercase mb-2 block text-[#323232]">
                  MISSION INTEL
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="neo-input uppercase resize-none"
                  placeholder="BRIEF DESCRIPTION ABOUT THE ROLE AND COMPANY"
                />
              </div>

              {/* Eligibility Requirements Section */}
              <div className="pt-6 mt-6 border-t-2 border-[#323232] border-dashed">
                <h4 className="neo-title !text-lg mb-6 uppercase tracking-widest text-indigo-600">RECRUITMENT PROTOCOLS</h4>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="neo-subtitle !text-[10px] font-bold uppercase mb-2 block text-[#323232]">
                      MINIMUM CGPA THRESHOLD
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="10"
                      value={formData.minCgpa}
                      onChange={(e) => setFormData({ ...formData, minCgpa: e.target.value })}
                      className="neo-input"
                      placeholder="E.G., 7.00"
                    />
                  </div>

                  <div>
                    <label className="neo-subtitle !text-[10px] font-bold uppercase mb-2 block text-[#323232]">
                      MAX BACKLOG ALLOWANCE
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.maxBacklogs}
                      onChange={(e) => setFormData({ ...formData, maxBacklogs: e.target.value })}
                      className="neo-input"
                      placeholder="E.G., 0"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <label className="neo-subtitle !text-[10px] font-bold uppercase mb-2 block text-[#323232]">
                    AUTHORIZED DIVISIONS
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {branchOptions.map(branch => (
                      <button
                        key={branch}
                        type="button"
                        onClick={() => toggleBranch(branch)}
                        className={`px-4 py-1.5 border-2 border-[#323232] rounded text-[10px] font-bold transition-all shadow-[2px_2px_0px_#323232] ${formData.allowedBranches.includes(branch)
                          ? 'bg-indigo-600 text-white shadow-none translate-x-[1px] translate-y-[1px]'
                          : 'bg-white text-[#323232] hover:bg-gray-50'
                          }`}
                      >
                        {branch}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-6">
                  <label className="neo-subtitle !text-[10px] font-bold uppercase mb-2 block text-[#323232]">
                    TARGET BATCH CYCLES
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {batchYearOptions.map(year => (
                      <button
                        key={year}
                        type="button"
                        onClick={() => toggleBatchYear(year)}
                        className={`px-4 py-1.5 border-2 border-[#323232] rounded text-[10px] font-bold transition-all shadow-[2px_2px_0px_#323232] ${formData.allowedBatchYears.includes(year)
                          ? 'bg-purple-600 text-white shadow-none translate-x-[1px] translate-y-[1px]'
                          : 'bg-white text-[#323232] hover:bg-gray-50'
                          }`}
                      >
                        {year}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Eligible Students Display */}
                <div className="mt-8 pt-6 border-t-2 border-[#323232] border-dashed">
                  <div className="flex items-center justify-between mb-4">
                    <h5 className="neo-subtitle !text-[12px] font-bold uppercase tracking-wider">AVAILABLE RECRUITS</h5>
                    <span className="neo-subtitle !text-[10px] font-bold bg-gray-100 px-3 py-1 border-2 border-[#323232] rounded shadow-[2px_2px_0px_#323232]">
                      {loadingStudents ? 'SYNCHRONIZING...' : `${eligibleStudents.length} MATCHES`}
                    </span>
                  </div>

                  {!formData.minCgpa && formData.allowedBranches.length === 0 &&
                    !formData.maxBacklogs && formData.allowedBatchYears.length === 0 ? (
                    <div className="bg-[#f8f8f8] border-2 border-[#323232] border-dashed rounded-lg p-6 text-center">
                      <p className="neo-subtitle !text-[11px] font-bold opacity-50 uppercase">
                        SET PROTOCOLS TO SCAN DATABASE
                      </p>
                    </div>
                  ) : loadingStudents ? (
                    <div className="bg-[#f8f8f8] border-2 border-[#323232] border-dashed rounded-lg p-6 text-center">
                      <p className="neo-subtitle !text-[11px] font-bold opacity-50 uppercase animate-pulse">
                        SCANNING RECRUITMENT DATABASE...
                      </p>
                    </div>
                  ) : eligibleStudents.length === 0 ? (
                    <div className="bg-[#f8f8f8] border-2 border-[#323232] border-dashed rounded-lg p-6 text-center">
                      <p className="neo-subtitle !text-[11px] font-bold text-red-600 uppercase">
                        NO RECRUITS MATCH CURRENT CRITERIA
                      </p>
                    </div>
                  ) : (
                    <div className="bg-[#f8f8f8] border-2 border-[#323232] rounded-lg p-4 max-h-64 overflow-y-auto space-y-3">
                      {eligibleStudents.map(student => (
                        <div key={student.id} className="neo-list-item !py-3 !px-4 !bg-white">
                          <div className="flex items-center justify-between w-full">
                            <div>
                              <p className="neo-subtitle !text-[13px] font-bold text-[#323232] uppercase">{student.name}</p>
                              <p className="neo-subtitle !text-[10px] font-bold opacity-60 uppercase">{student.usn} • {student.branch}</p>
                            </div>
                            <div className="text-right">
                              <p className="neo-subtitle !text-[13px] font-extrabold text-indigo-700 leading-none">{student.cgpa} CGPA</p>
                              <p className="neo-subtitle !text-[9px] font-bold opacity-50 uppercase mt-1">
                                BACKLOGS: {student.active_backlogs}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="neo-button !bg-gray-100 !text-[#323232] !px-8 !py-3 uppercase font-bold tracking-widest"
                >
                  Abord
                </button>
                <button
                  type="submit"
                  className="neo-button !bg-indigo-600 !text-white !px-8 !py-3 uppercase font-bold tracking-widest shadow-[4px_4px_0px_#323232]"
                >
                  {modalMode === 'add' ? 'INITIALIZE' : 'DEPLOY UPDATES'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student Shortlist Modal */}
      {showShortlistModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="neo-card !bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto !p-8 shadow-[12px_12px_0px_#323232]">
            <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-[#323232] border-dashed">
              <div>
                <h3 className="neo-title !text-2xl !mb-0 uppercase tracking-tight">
                  PARTNER SHORTLIST: {selectedCompany?.name.toUpperCase()}
                </h3>
                <p className="neo-subtitle !text-[11px] font-bold opacity-60 uppercase mt-1">
                  {loadingShortlist ? 'SYNCHRONIZING...' : `${shortlistedStudents.length} RECRUITS ASSIGNED`}
                </p>
              </div>
              <button
                onClick={() => setShowShortlistModal(false)}
                className="neo-button !p-2 !w-10 !h-10 !flex items-center justify-center !min-h-0 !translate-y-0"
              >
                <span className="text-2xl font-bold">×</span>
              </button>
            </div>

            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={() => {
                    setShowSearch(!showSearch);
                    setSearchTerm('');
                    setSearchResults([]);
                  }}
                  className={`neo-button !px-6 !py-2 !text-[11px] !min-h-0 uppercase font-extrabold tracking-wider ${showSearch
                    ? '!bg-red-50 !text-red-700'
                    : '!bg-green-50 !text-green-700'
                    }`}
                >
                  <span className="text-lg mr-2 font-bold">{showSearch ? '×' : '+'}</span>
                  {showSearch ? 'CANCEL MANUAL INPUT' : 'MANUAL RECRUIT ASSIGNMENT'}
                </button>
              </div>

              {showSearch && (
                <div className="bg-[#f8f8f8] p-6 border-2 border-[#323232] border-dashed rounded-lg mb-6">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                      placeholder="SEARCH RECRUIT BY NAME OR USN..."
                      className="neo-input !pl-12 uppercase"
                      autoFocus
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl opacity-40">🔍</span>
                  </div>

                  {isSearching ? (
                    <div className="text-center py-6 neo-subtitle !text-[11px] font-bold opacity-50 uppercase animate-pulse">SEARCHING STUDENT FILES...</div>
                  ) : searchTerm.length >= 2 ? (
                    <div className="mt-4 bg-white border-2 border-[#323232] rounded overflow-hidden max-h-48 overflow-y-auto divide-y-2 divide-[#323232] divide-dashed shadow-[4px_4px_0px_rgba(0,0,0,0.1)]">
                      {searchResults.length > 0 ? (
                        searchResults.map(student => (
                          <div key={student.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                            <div>
                              <p className="neo-subtitle !text-[13px] font-bold uppercase text-[#323232]">{student.name}</p>
                              <p className="neo-subtitle !text-[10px] font-bold opacity-50 uppercase">{student.usn} • {student.branch}</p>
                            </div>
                            <button
                              onClick={() => handleAddManualShortlist(student)}
                              className="neo-button !py-1 !px-4 !bg-indigo-600 !text-white !text-[10px] !min-h-0"
                            >
                              ASSIGN TO LIST
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="p-6 text-center neo-subtitle !text-[11px] font-bold text-red-600 uppercase tracking-widest opacity-50 italic">NO RECRUITS FOUND</div>
                      )}
                    </div>
                  ) : searchTerm.length > 0 ? (
                    <div className="mt-3 text-[9px] text-center neo-subtitle font-bold opacity-40 uppercase tracking-widest">INPUT MINIMUM 2 CHARACTERS FOR INTEL SCAN</div>
                  ) : null}
                </div>
              )}
            </div>

            {loadingShortlist ? (
              <div className="bg-[#f8f8f8] border-2 border-[#323232] border-dashed rounded-lg p-10 text-center">
                <p className="neo-subtitle !text-[12px] font-bold opacity-50 uppercase animate-pulse">SYNCHRONIZING SHORTLIST INTEL...</p>
              </div>
            ) : shortlistedStudents.length === 0 ? (
              <div className="bg-[#f8f8f8] border-2 border-[#323232] border-dashed rounded-lg p-10 text-center">
                <div className="text-5xl opacity-20 mb-4">📭</div>
                <p className="neo-subtitle !text-[13px] font-bold uppercase tracking-widest text-[#323232]">SHORTLIST IS CURRENTLY NULL</p>
                <p className="neo-subtitle !text-[10px] font-bold opacity-40 uppercase mt-2 italic">SCAN DATABASE OR MANUAL INPUT REQUIRED</p>
              </div>
            ) : (
              <div className="neo-card !p-0 !bg-white border-2 border-[#323232] overflow-hidden shadow-[6px_6px_0px_#d3d3d3]">
                <div className="max-h-96 overflow-y-auto">
                  <table className="w-full">
                    <thead className="bg-[#f0f0f0] border-b-2 border-[#323232] sticky top-0 z-10">
                      <tr>
                        <th className="px-6 py-4 text-left neo-subtitle !text-[10px] font-bold uppercase text-[#323232]">RECRUIT</th>
                        <th className="px-6 py-4 text-left neo-subtitle !text-[10px] font-bold uppercase text-[#323232]">IDENTIFIER</th>
                        <th className="px-6 py-4 text-left neo-subtitle !text-[10px] font-bold uppercase text-[#323232]">RANK</th>
                        <th className="px-6 py-4 text-left neo-subtitle !text-[10px] font-bold uppercase text-[#323232]">STATUS</th>
                        <th className="px-6 py-4 text-right neo-subtitle !text-[10px] font-bold uppercase text-[#323232]">OPS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-[#323232] divide-dashed">
                      {shortlistedStudents.map((student) => (
                        <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-9 h-9 border-2 border-[#323232] rounded flex items-center justify-center bg-indigo-500 text-white font-bold mr-3 shadow-[2px_2px_0px_#323232]">
                                {student.student_name ? student.student_name.charAt(0) : 'S'}
                              </div>
                              <div>
                                <div className="neo-subtitle !text-[12px] font-bold text-[#323232] uppercase">{student.student_name || 'N/A'}</div>
                                <div className="neo-subtitle !text-[9px] font-bold opacity-40 uppercase">{student.email || ''}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap neo-subtitle !text-[11px] font-bold text-[#323232] tracking-wider">
                            {student.usn || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="neo-subtitle !text-[12px] font-extrabold text-indigo-700">
                              {student.cgpa ? Number(student.cgpa).toFixed(2) : 'N/A'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-0.5 border-2 border-[#323232] rounded text-[9px] font-bold shadow-[2px_2px_0px_#323232] ${student.status === 'Shortlisted'
                              ? 'bg-green-100 text-green-800'
                              : student.status === 'Notified'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                              }`}>
                              {(student.status || 'SHORTLISTED').toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <button className="neo-subtitle !text-[11px] font-bold text-red-600 hover:text-red-800 uppercase underline underline-offset-4 decoration-2">
                              REJECT
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-4 pt-8 border-t-2 border-[#323232] border-dashed mt-8">
              <button
                onClick={() => setShowShortlistModal(false)}
                className="neo-button !bg-gray-100 !text-[#323232] !px-8 !py-3 uppercase font-bold tracking-widest"
              >
                CLOSE
              </button>
              {shortlistedStudents.length > 0 && (
                <button
                  onClick={handleSendNotifications}
                  disabled={notifying}
                  className={`neo-button !bg-indigo-600 !text-white !px-8 !py-3 uppercase font-bold tracking-widest shadow-[4px_4px_0px_#323232] flex items-center ${notifying ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                >
                  {notifying ? (
                    <>
                      <div className="animate-spin h-4 w-4 mr-3 border-2 border-white border-t-transparent rounded-full" />
                      TRANSMITTING...
                    </>
                  ) : (
                    'DEPLOY NOTIFICATIONS'
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CompaniesPage;
