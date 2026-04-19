import express from 'express';
import { createSubscriptionRequest, getSubscriptionRequests, updateSubscriptionStatus, deleteSubscriptionRequest, getSellerSubscriptions } from '../controllers/subscriptionController.js';
import upload from '../middleware/uploadImage.js';

const router = express.Router();

router.post('/', upload.single('paymentScreenshot'), createSubscriptionRequest);
router.get('/', getSubscriptionRequests);
router.get('/seller/:sellerId', getSellerSubscriptions);
router.put('/:id/status', updateSubscriptionStatus);
router.delete('/:id', deleteSubscriptionRequest);

export default router;
