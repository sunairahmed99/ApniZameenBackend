import express from 'express';
import { logEvent } from '../controllers/analyticsController.js';
import { protect_optional } from '../middleware/authMiddleware.js';

const router = express.Router();

// protect_optional allows the route to work for both logged-in and guest sellers
router.post('/log', protect_optional, logEvent);

export default router;

