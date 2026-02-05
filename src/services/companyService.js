import api from './api';

// Get all companies
export const getAllCompanies = async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const endpoint = params ? `/admin/companies?${params}` : '/admin/companies';

    const res = await fetch(`http://localhost:5000/api${endpoint}`, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
        }
    });

    if (!res.ok) throw new Error('Failed to fetch companies');
    return res.json();
};

// Get company by ID
export const getCompanyById = async (id) => {
    const res = await fetch(`http://localhost:5000/api/admin/companies/${id}`, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
        }
    });

    if (!res.ok) throw new Error('Failed to fetch company');
    return res.json();
};

// Create new company
export const createCompany = async (companyData) => {
    const res = await fetch('http://localhost:5000/api/admin/companies', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(companyData)
    });

    if (!res.ok) throw new Error('Failed to create company');
    return res.json();
};

// Update company
export const updateCompany = async (id, companyData) => {
    const res = await fetch(`http://localhost:5000/api/admin/companies/${id}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(companyData)
    });

    if (!res.ok) throw new Error('Failed to update company');
    return res.json();
};

// Delete company
export const deleteCompany = async (id) => {
    const res = await fetch(`http://localhost:5000/api/admin/companies/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
        }
    });

    if (!res.ok) throw new Error('Failed to delete company');
    return res.json();
};

// Get eligible students based on criteria
export const getEligibleStudents = async (criteria) => {
    const params = new URLSearchParams();

    if (criteria.minCgpa) params.append('minCgpa', criteria.minCgpa);
    if (criteria.branches && criteria.branches.length > 0) {
        params.append('branches', criteria.branches.join(','));
    }
    if (criteria.maxBacklogs !== undefined) params.append('maxBacklogs', criteria.maxBacklogs);
    if (criteria.batchYears && criteria.batchYears.length > 0) {
        params.append('batchYears', criteria.batchYears.join(','));
    }

    const endpoint = params.toString() ?
        `/admin/companies/eligible-students?${params.toString()}` :
        '/admin/companies/eligible-students';

    const res = await fetch(`http://localhost:5000/api${endpoint}`, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
        }
    });

    if (!res.ok) throw new Error('Failed to fetch eligible students');
    return res.json();
};

// Get company shortlists
export const getCompanyShortlists = async (companyId) => {
    const res = await fetch(`http://localhost:5000/api/admin/companies/${companyId}/shortlists`, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
        }
    });

    if (!res.ok) throw new Error('Failed to fetch shortlists');
    return res.json();
};

// Create a shortlist entry for a company
export const createShortlist = async (companyId, shortlistData) => {
    const res = await fetch(`http://localhost:5000/api/admin/companies/${companyId}/shortlists`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(shortlistData)
    });

    if (!res.ok) throw new Error('Failed to create shortlist');
    return res.json();
};

// Search students by name or USN
export const searchStudents = async (searchTerm) => {
    const res = await fetch(`http://localhost:5000/api/admin/students?search=${searchTerm}`, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
        }
    });

    if (!res.ok) throw new Error('Failed to search students');
    return res.json();
};

// Send bulk notifications to shortlisted students
export const notifyShortlistedStudents = async (companyId) => {
    const res = await fetch(`http://localhost:5000/api/admin/companies/${companyId}/notify`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
        }
    });

    if (!res.ok) throw new Error('Failed to send notifications');
    return res.json();
};


export default {
    getAllCompanies,
    getCompanyById,
    createCompany,
    updateCompany,
    deleteCompany,
    getEligibleStudents,
    getCompanyShortlists,
    createShortlist,
    searchStudents,
    notifyShortlistedStudents
};
