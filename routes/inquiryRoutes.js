import express from 'express';
import { createInquiry, getAllInquiries, getInquiriesForSeller } from '../controllers/inquiryController.js';

import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', createInquiry);
router.get('/', getAllInquiries);
router.get('/seller', protect, getInquiriesForSeller);

export default router;
