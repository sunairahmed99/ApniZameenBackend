import express from 'express';
import {
    getPaymentPrices,
    createPaymentPrice,
    updatePaymentPrice,
    deletePaymentPrice
} from '../controllers/paymentPriceController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(getPaymentPrices)
    .post(protect, admin, createPaymentPrice);

router.route('/:id')
    .put(protect, admin, updatePaymentPrice)
    .delete(protect, admin, deletePaymentPrice);

export default router;
