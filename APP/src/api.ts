import axios from 'axios';
import type { Customer, Product, Invoice } from './types';

const API_URL = 'http://localhost:8000/api/';

export const customerAPI = {
    getCustomers: () => axios.get(`${API_URL}customers/`),
    getCustomer: (id: number) => axios.get(`${API_URL}customers/${id}/`),
    addCustomer: (data: Customer) => axios.post(`${API_URL}customers/`, data), 
    loginCustomer: (data: any) => axios.post(`${API_URL}customers/login/`, data),
    
    // CHANGED TO PATCH: This allows partial updates (just name, email, or number)
    updateCustomer: (id: number, data: any) => axios.patch(`${API_URL}customers/${id}/`, data),
    
    deleteCustomer: (id: number) => axios.delete(`${API_URL}customers/${id}/`)
};

export const productAPI = {
    getProducts: () => axios.get(`${API_URL}products/`),
    getProduct: (id: number) => axios.get(`${API_URL}products/${id}/`),
    addProduct: (data: any) => axios.post(`${API_URL}products/`, data),
    updateProduct: (id: number, data: any) => axios.patch(`${API_URL}products/${id}/`, data),
    deleteProduct: (id: number) => axios.delete(`${API_URL}products/${id}/`)
};

export const invoiceAPI = {
    getInvoices: () => axios.get(`${API_URL}invoices/`),
    getInvoice: (id: number) => axios.get(`${API_URL}invoices/${id}/`),
    createInvoice: (data: Invoice) => axios.post(`${API_URL}invoices/`, data),
    updateInvoice: (id: number, data: any) => axios.put(`${API_URL}invoices/${id}/`, data),
    deleteInvoice: (id: number) => axios.delete(`${API_URL}invoices/${id}/`),
};