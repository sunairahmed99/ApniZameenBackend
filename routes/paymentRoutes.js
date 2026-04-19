import express from 'express';
import { uploadPaymentProof, getPendingPayments, reviewPayment } from '../controllers/paymentController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { createUploadMiddleware } from '../middleware/imageUploadMiddleware.js';

const router = express.Router();
const upload = createUploadMiddleware('image', 'payment_proofs');

router.route('/upload')
    .post(protect, upload, uploadPaymentProof);

router.route('/pending')
    .get(protect, admin, getPendingPayments);

router.route('/review')
    .post(protect, admin, reviewPayment);

export default router;
