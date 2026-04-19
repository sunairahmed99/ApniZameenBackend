import express from 'express';
import {
    createAdDeal,
    getAllAdDeals,
    getActiveAdDeals,
    updateAdDeal,
    deleteAdDeal,
    createAdRequest,
    getMyAdRequests,
    getAllAdRequests,
    updateAdRequestStatus,
    deleteAdRequest,
    getActiveAdvertisements
} from '../controllers/adController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadImage.js';

const router = express.Router();

// Ad Deals (Packages)
router.get('/deals', getActiveAdDeals);
router.get('/admin/deals', protect, admin, getAllAdDeals);
router.post('/deals', protect, admin, createAdDeal);
router.put('/deals/:id', protect, admin, updateAdDeal);
router.delete('/deals/:id', protect, admin, deleteAdDeal);

// Active Ads (Public)
router.get('/active-ads', getActiveAdvertisements);

// Ad Requests
router.get('/my-requests', protect, getMyAdRequests);
router.post('/request', protect, upload.fields([
    { name: 'adImage', maxCount: 1 },
    { name: 'paymentScreenshot', maxCount: 1 }
]), createAdRequest);

// Admin Ad Requests
router.get('/admin/requests', protect, admin, getAllAdRequests);
router.put('/admin/requests/:id/status', protect, admin, updateAdRequestStatus);
router.delete('/admin/requests/:id', protect, admin, deleteAdRequest);

export default router;
