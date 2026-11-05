import express from 'express';
import {
    getAppraisals,
    getAppraisalById,
    createAppraisal,
    updateAppraisal,
    deleteAppraisal
} from '../controllers/appraisalController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.use(protect);

router.route('/')
    .get(getAppraisals)
    .post(createAppraisal);

router.route('/:id')
    .get(getAppraisalById)
    .put(updateAppraisal)
    .delete(deleteAppraisal);

export default router;
