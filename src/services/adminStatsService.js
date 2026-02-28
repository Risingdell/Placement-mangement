import { apiRequest } from './api';

export const getDashboardStats = async () =>
    apiRequest('/admin/stats/dashboard', { method: 'GET' });

export const getBranchWiseStats = async () =>
    apiRequest('/admin/stats/branch-wise', { method: 'GET' });

export const getCompanyWiseStats = async () =>
    apiRequest('/admin/stats/company-wise', { method: 'GET' });

export const getSalaryAnalysis = async () =>
    apiRequest('/admin/stats/salary-analysis', { method: 'GET' });

export const getApplicationTrends = async () =>
    apiRequest('/admin/stats/application-trends', { method: 'GET' });

export default {
    getDashboardStats,
    getBranchWiseStats,
    getCompanyWiseStats,
    getSalaryAnalysis,
    getApplicationTrends,
};
