import express from 'express';
import {
    createProjectRequest,
    getMyProjectRequests,
    getAllProjectRequests,
    updateProjectRequestStatus,
    deleteProjectRequest
} from '../controllers/projectRequestController.js';
import upload from '../middleware/uploadImage.js';

import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Seller routes
router.post('/', protect, upload.single('paymentScreenshot'), createProjectRequest);
router.get('/my', protect, getMyProjectRequests);

// Admin/General routes
router.get('/', getAllProjectRequests);
router.put('/:id/status', updateProjectRequestStatus);
router.delete('/:id', deleteProjectRequest);

export default router;
