import { Request, Response } from 'express';
import Loan from '../models/Loan';

export const getLoans = async (req: Request, res: Response): Promise<void> => {
  try {
    const loans = await Loan.find().sort({ createdAt: -1 });
    res.json({ success: true, message: 'Loans retrieved', data: loans });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getLoanById = async (req: Request, res: Response): Promise<void> => {
  try {
    const loan = await Loan.findById(req.params.id);
    if (!loan) {
      res.status(404).json({ success: false, message: 'Loan not found' });
      return;
    }
    res.json({ success: true, message: 'Loan retrieved', data: loan });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createLoan = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.body.createdAt) req.body.createdAt = new Date().toISOString();
    const newLoan = await Loan.create(req.body);
    res.status(201).json({ success: true, message: 'Loan created', data: newLoan });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateLoan = async (req: Request, res: Response): Promise<void> => {
  try {
    const updatedLoan = await Loan.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedLoan) {
      res.status(404).json({ success: false, message: 'Loan not found' });
      return;
    }
    res.json({ success: true, message: 'Loan updated', data: updatedLoan });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteLoan = async (req: Request, res: Response): Promise<void> => {
  try {
    const deleted = await Loan.findByIdAndDelete(req.params.id);
    if (!deleted) {
      res.status(404).json({ success: false, message: 'Loan not found' });
      return;
    }
    res.json({ success: true, message: 'Loan deleted', data: {} });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
