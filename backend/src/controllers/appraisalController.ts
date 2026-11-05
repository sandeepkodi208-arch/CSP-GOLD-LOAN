import { Request, Response } from 'express';
import Appraisal from '../models/Appraisal';

export const getAppraisals = async (req: Request, res: Response): Promise<void> => {
    try {
        const appraisals = await Appraisal.find().sort({ createdAt: -1 });
        res.json({ success: true, message: 'Appraisals retrieved', data: appraisals });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getAppraisalById = async (req: Request, res: Response): Promise<void> => {
    try {
        const appraisal = await Appraisal.findById(req.params.id);
        if (!appraisal) {
            res.status(404).json({ success: false, message: 'Appraisal not found' });
            return;
        }
        res.json({ success: true, message: 'Appraisal retrieved', data: appraisal });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createAppraisal = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.body.createdAt) req.body.createdAt = new Date().toISOString();
        const newAppraisal = await Appraisal.create(req.body);
        res.status(201).json({ success: true, message: 'Appraisal created', data: newAppraisal });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateAppraisal = async (req: Request, res: Response): Promise<void> => {
    try {
        const updatedAppraisal = await Appraisal.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedAppraisal) {
            res.status(404).json({ success: false, message: 'Appraisal not found' });
            return;
        }
        res.json({ success: true, message: 'Appraisal updated', data: updatedAppraisal });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteAppraisal = async (req: Request, res: Response): Promise<void> => {
    try {
        const deleted = await Appraisal.findByIdAndDelete(req.params.id);
        if (!deleted) {
            res.status(404).json({ success: false, message: 'Appraisal not found' });
            return;
        }
        res.json({ success: true, message: 'Appraisal deleted', data: {} });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};
