import express from 'express';
import { getDashboardStats } from '../controllers/adminController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get dashboard statistics
router.get('/stats', protect, admin, getDashboardStats);

export default router;
