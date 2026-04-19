import express from 'express';
import { getPaymentInfo, createPaymentInfo, updatePaymentInfo, deletePaymentInfo } from '../controllers/paymentInfoController.js';

const router = express.Router();

router.get('/', getPaymentInfo);
router.post('/', createPaymentInfo);
router.put('/:id', updatePaymentInfo);
router.delete('/:id', deletePaymentInfo);

export default router;
