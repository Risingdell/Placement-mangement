import { apiRequest } from './api';

export const getAllStudents = async (filters = {}) => {
    const queryParams = new URLSearchParams();
    Object.keys(filters).forEach(key => {
        if (filters[key]) queryParams.append(key, filters[key]);
    });

    const queryString = queryParams.toString();
    const url = `/admin/students${queryString ? `?${queryString}` : ''}`;

    return await apiRequest(url, { method: 'GET' });
};

export const getStudentById = async (id) => {
    return await apiRequest(`/admin/students/${id}`, { method: 'GET' });
};

export default {
    getAllStudents,
    getStudentById
};
