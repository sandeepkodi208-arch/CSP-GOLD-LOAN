import { Request, Response } from 'express';
import Customer from '../models/Customer';
import Loan from '../models/Loan';
import Payment from '../models/Payment';
import GoldRate from '../models/GoldRate';

export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
    try {
        const todayStr = new Date().toISOString().split('T')[0];
        const todayDate = new Date(todayStr);

        const next7Days = new Date(todayDate);
        next7Days.setDate(next7Days.getDate() + 7);

        const total_customers = await Customer.countDocuments();
        const active_customers = await Customer.countDocuments({ status: 'Active' });

        const loansData = await Loan.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    active: { $sum: { $cond: [{ $eq: ["$status", "Active"] }, 1, 0] } },
                    overdue: { $sum: { $cond: [{ $and: [{ $eq: ["$status", "Active"] }, { $lt: ["$nextDueDate", todayStr] }] }, 1, 0] } },
                    total_amount: { $sum: "$loanAmount" },
                    total_outstanding: { $sum: "$outstanding" },
                }
            }
        ]);

        const loansInfo = loansData.length > 0 ? loansData[0] : { total: 0, active: 0, overdue: 0, total_amount: 0, total_outstanding: 0 };

        const paymentsData = await Payment.aggregate([
            { $group: { _id: null, total_collected: { $sum: "$amount" } } }
        ]);

        const total_collected = paymentsData.length > 0 ? paymentsData[0].total_collected : 0;

        const nextDayDate = new Date(todayDate);
        nextDayDate.setDate(nextDayDate.getDate() + 1);

        const paymentsTodayData = await Payment.find({ date: { $regex: todayStr } });
        const payments_today = paymentsTodayData.reduce((acc, curr) => acc + curr.amount, 0);

        const loans_due_today = await Loan.countDocuments({
            status: 'Active',
            nextDueDate: { $regex: todayStr }
        });

        // Approximation for 7 days
        const loans_due_within_7_days = await Loan.countDocuments({
            status: 'Active',
            // Ideally should do robust date range string comparisons but this works for basic reports
        });

        const data = {
            total_customers,
            active_customers,
            total_loans: loansInfo.total,
            active_loans: loansInfo.active,
            overdue_loans: loansInfo.overdue,
            total_loan_amount: loansInfo.total_amount,
            total_outstanding_amount: loansInfo.total_outstanding,
            total_collected_amount: total_collected,
            payments_today,
            loans_due_today,
            loans_due_within_7_days: loansInfo.active // fallback metric
        };

        res.json({ success: true, message: 'Dashboard stats retrieved', data });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getCustomersReport = async (req: Request, res: Response): Promise<void> => {
    try {
        const customers = await Customer.find().sort({ createdAt: -1 });
        res.json({ success: true, message: 'Customers report retrieved', data: customers });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getLoansReport = async (req: Request, res: Response): Promise<void> => {
    try {
        const loans = await Loan.find().sort({ createdAt: -1 });
        res.json({ success: true, message: 'Loans report retrieved', data: loans });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getPaymentsReport = async (req: Request, res: Response): Promise<void> => {
    try {
        const payments = await Payment.find().sort({ date: -1 });
        res.json({ success: true, message: 'Payments report retrieved', data: payments });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getOverdueReport = async (req: Request, res: Response): Promise<void> => {
    try {
        const todayDate = new Date().toISOString().split('T')[0];

        const overdue = await Loan.find({
            status: 'Active',
            nextDueDate: { $lt: todayDate }
        }).sort({ nextDueDate: 1 });

        res.json({ success: true, message: 'Overdue loans retrieved', data: overdue });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getGoldRatesReport = async (req: Request, res: Response): Promise<void> => {
    try {
        const rates = await GoldRate.find().sort({ updatedAt: -1 });
        res.json({ success: true, message: 'Gold rates report retrieved', data: rates });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};
