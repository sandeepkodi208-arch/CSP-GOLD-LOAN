import { Request, Response } from 'express';
import GoldRate from '../models/GoldRate';

export const getGoldRates = async (req: Request, res: Response): Promise<void> => {
    try {
        const rates = await GoldRate.find().sort({ createdAt: -1 });
        res.json({ success: true, message: 'Gold rates retrieved', data: rates });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getLatestGoldRates = async (req: Request, res: Response): Promise<void> => {
    try {
        const latest = await GoldRate.findOne().sort({ createdAt: -1 });
        res.json({ success: true, message: 'Latest gold rate retrieved', data: latest });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createGoldRate = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.body.createdAt) req.body.createdAt = new Date().toISOString();
        const newRate = await GoldRate.create(req.body);
        res.status(201).json({ success: true, message: 'Gold rate created', data: newRate });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateGoldRate = async (req: Request, res: Response): Promise<void> => {
    try {
        const updatedRate = await GoldRate.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedRate) {
            res.status(404).json({ success: false, message: 'Gold rate not found' });
            return;
        }
        res.json({ success: true, message: 'Gold rate updated', data: updatedRate });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteGoldRate = async (req: Request, res: Response): Promise<void> => {
    try {
        const deleted = await GoldRate.findByIdAndDelete(req.params.id);
        if (!deleted) {
            res.status(404).json({ success: false, message: 'Gold rate not found' });
            return;
        }
        res.json({ success: true, message: 'Gold rate deleted', data: {} });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};
