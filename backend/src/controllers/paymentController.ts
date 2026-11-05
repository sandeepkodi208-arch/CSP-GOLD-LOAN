import { Request, Response } from 'express';
import Payment from '../models/Payment';

export const createPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.body.createdAt) req.body.createdAt = new Date().toISOString();
    const newPayment = await Payment.create(req.body);
    res.status(201).json({ success: true, message: 'Payment recorded', data: newPayment });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPayments = async (req: Request, res: Response): Promise<void> => {
  try {
    const payments = await Payment.find().sort({ createdAt: -1 });
    res.json({ success: true, message: 'Payments retrieved', data: payments });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPaymentById = async (req: Request, res: Response): Promise<void> => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      res.status(404).json({ success: false, message: 'Payment not found' });
      return;
    }
    res.json({ success: true, message: 'Payment retrieved', data: payment });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPaymentsByLoan = async (req: Request, res: Response): Promise<void> => {
  try {
    const payments = await Payment.find({ loanId: req.params.loanId }).sort({ createdAt: -1 });
    res.json({ success: true, message: 'Loan payments retrieved', data: payments });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
