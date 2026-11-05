import axios from 'axios';
import type { Customer, Loan, Payment, Appraisal, GoldRate, Settings } from '../types';

const api = axios.create({
    baseURL: import.meta.env['VITE_API_URL'] || 'http://localhost:5000/api',
});

// Request Interceptor: Attach JWT Token automatically to all protected routes
api.interceptors.request.use((config) => {
    const authState = localStorage.getItem('glms:auth_token');
    if (authState) {
        config.headers.Authorization = `Bearer ${authState}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export const fetchCustomers = async (): Promise<Customer[]> => (await api.get('/customers')).data.data;
export const createCustomer = async (data: Partial<Customer>): Promise<Customer> => (await api.post('/customers', data)).data.data;
export const updateCustomer = async (id: string, data: Partial<Customer>): Promise<Customer> => (await api.put(`/customers/${id}`, data)).data.data;
export const deleteCustomer = async (id: string): Promise<void> => (await api.delete(`/customers/${id}`)).data.data;

export const fetchLoans = async (): Promise<Loan[]> => (await api.get('/loans')).data.data;
export const createLoan = async (data: Partial<Loan>): Promise<Loan> => (await api.post('/loans', data)).data.data;
export const updateLoan = async (id: string, data: Partial<Loan>): Promise<Loan> => (await api.put(`/loans/${id}`, data)).data.data;
export const deleteLoan = async (id: string): Promise<void> => (await api.delete(`/loans/${id}`)).data.data;

export const fetchAppraisals = async (): Promise<Appraisal[]> => (await api.get('/appraisals')).data.data;
export const createAppraisal = async (data: Partial<Appraisal>): Promise<Appraisal> => (await api.post('/appraisals', data)).data.data;
export const updateAppraisal = async (id: string, data: Partial<Appraisal>): Promise<Appraisal> => (await api.put(`/appraisals/${id}`, data)).data.data;
export const deleteAppraisal = async (id: string): Promise<void> => (await api.delete(`/appraisals/${id}`)).data.data;

export const fetchPayments = async (): Promise<Payment[]> => (await api.get('/payments')).data.data;
export const createPayment = async (data: Partial<Payment>): Promise<Payment> => (await api.post('/payments', data)).data.data;

export const fetchLatestGoldRate = async (): Promise<GoldRate> => (await api.get('/gold-rates/latest')).data.data;
export const createGoldRate = async (data: Partial<GoldRate>): Promise<GoldRate> => (await api.post('/gold-rates', data)).data.data;

export const registerUser = async (userData: any): Promise<any> => (await api.post('/auth/register', userData)).data;
export const loginUser = async (credentials: any): Promise<{ token: string, user: any }> => (await api.post('/auth/login', credentials)).data.data;

export const fetchDashboardStats = async (): Promise<any> => (await api.get('/reports/dashboard')).data.data;

export default api;
