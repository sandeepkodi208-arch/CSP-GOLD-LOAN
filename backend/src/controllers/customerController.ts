import { Request, Response } from 'express';
import Customer from '../models/Customer';

export const getCustomers = async (req: Request, res: Response): Promise<void> => {
    try {
        const customers = await Customer.find().sort({ createdAt: -1 });
        res.json({ success: true, message: 'Customers retrieved', data: customers });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getCustomerById = async (req: Request, res: Response): Promise<void> => {
    try {
        const customer = await Customer.findById(req.params.id);
        if (!customer) {
            res.status(404).json({ success: false, message: 'Customer not found' });
            return;
        }
        res.json({ success: true, message: 'Customer retrieved', data: customer });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createCustomer = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.body.createdAt) req.body.createdAt = new Date().toISOString();
        const newCustomer = await Customer.create(req.body);
        res.status(201).json({ success: true, message: 'Customer created', data: newCustomer });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateCustomer = async (req: Request, res: Response): Promise<void> => {
    try {
        const updatedCustomer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedCustomer) {
            res.status(404).json({ success: false, message: 'Customer not found' });
            return;
        }
        res.json({ success: true, message: 'Customer updated', data: updatedCustomer });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteCustomer = async (req: Request, res: Response): Promise<void> => {
    try {
        const deleted = await Customer.findByIdAndDelete(req.params.id);
        if (!deleted) {
            res.status(404).json({ success: false, message: 'Customer not found' });
            return;
        }
        res.json({ success: true, message: 'Customer deleted', data: {} });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};
