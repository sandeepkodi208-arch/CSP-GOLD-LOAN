import express from 'express';
import {
    createPayment,
    getPayments,
    getPaymentById,
    getPaymentsByLoan
} from '../controllers/paymentController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.use(protect);

router.route('/')
    .get(getPayments)
    .post(createPayment);

router.route('/:id')
    .get(getPaymentById);

// The getPaymentsByLoan will actually be mapped in loanRoutes realistically,
// but according to requirements we can also support it under /api/loans/:loanId/payments
// Let's export it here, and we can mount it in the main server file over the path or handled properly.

export const loanPaymentRouter = express.Router({ mergeParams: true });
loanPaymentRouter.route('/').get(protect, getPaymentsByLoan);

export default router;
