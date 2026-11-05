import express from 'express';
import {
    getLoans,
    getLoanById,
    createLoan,
    updateLoan,
    deleteLoan
} from '../controllers/loanController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.use(protect);

router.route('/')
    .get(getLoans)
    .post(createLoan);

router.route('/:id')
    .get(getLoanById)
    .put(updateLoan)
    .delete(deleteLoan);

export default router;
