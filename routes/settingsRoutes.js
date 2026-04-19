import express from 'express';
import { getSettings, updateSettings } from '../controllers/settingsController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route to get settings for the frontend (footer, etc.)
router.get('/', getSettings);

// Admin only route to update settings
router.put('/', protect, admin, updateSettings);

export default router;
