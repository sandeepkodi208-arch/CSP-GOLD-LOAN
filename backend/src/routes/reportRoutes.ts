import express from 'express';
import {
    getDashboardStats,
    getCustomersReport,
    getLoansReport,
    getPaymentsReport,
    getOverdueReport,
    getGoldRatesReport
} from '../controllers/reportController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

router.use(protect);
// According to business logic, reports might optionally require admin. 
// We are keeping it protected, but not strictly admin restricted based on typical flow unless requested.

router.get('/dashboard', getDashboardStats);
router.get('/customers', getCustomersReport);
router.get('/loans', getLoansReport);
router.get('/payments', getPaymentsReport);
router.get('/overdue', getOverdueReport);
router.get('/gold-rates', getGoldRatesReport);

export default router;
