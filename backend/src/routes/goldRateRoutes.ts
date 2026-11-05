import express from 'express';
import {
    getGoldRates,
    getLatestGoldRates,
    createGoldRate,
    updateGoldRate,
    deleteGoldRate
} from '../controllers/goldRateController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

router.use(protect);

router.route('/')
    .get(getGoldRates)
    .post(createGoldRate);

router.get('/latest', getLatestGoldRates);

router.route('/:id')
    .put(updateGoldRate)
    .delete(deleteGoldRate);

export default router;
