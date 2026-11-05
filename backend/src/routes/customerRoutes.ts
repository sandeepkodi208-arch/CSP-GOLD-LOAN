import express from 'express';
import {
    getCustomers,
    getCustomerById,
    createCustomer,
    updateCustomer,
    deleteCustomer
} from '../controllers/customerController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Apply protect middleware to all customer routes
router.use(protect);

router.route('/')
    .get(getCustomers)
    .post(createCustomer);

router.route('/:id')
    .get(getCustomerById)
    .put(updateCustomer)
    .delete(deleteCustomer);

export default router;
