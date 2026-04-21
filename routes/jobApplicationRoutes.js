import express from 'express';
import { applyForJob, getApplications, updateApplicationStatus } from '../controllers/jobApplicationController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { uploadCV } from '../middleware/cvUploadMiddleware.js';

const router = express.Router();

// Public route to apply
router.post('/', uploadCV('cv'), applyForJob);

// Admin routes
router.get('/', protect, admin, getApplications);
router.put('/:id', protect, admin, updateApplicationStatus);

export default router;
