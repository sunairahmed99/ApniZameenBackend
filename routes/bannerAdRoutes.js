import express from 'express';
import {
  createBannerRequest,
  getAllRequests,
  getSellerRequests,
  updateRequestStatus,
  getPublicBanners,
  updateBannerRequest,
  deleteBannerRequest,
  updateBannerAdmin,
  getMyBannerRequests
} from '../controllers/bannerAdController.js';

import {
  getActivePlans,
  getAllPlans,
  createPlan,
  updatePlan,
  deletePlan
} from '../controllers/bannerPlanController.js';

import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadImage.js';

const router = express.Router();

// Public route for homepage
router.get('/public', getPublicBanners);

// Seller routes
router.get('/my-requests', protect, getMyBannerRequests);
router.post('/request', protect, upload.fields([{ name: 'bannerImage', maxCount: 1 }, { name: 'paymentScreenshot', maxCount: 1 }]), createBannerRequest);
router.get('/seller/:sellerId', getSellerRequests);
router.put('/request/:id', protect, upload.fields([{ name: 'bannerImage', maxCount: 1 }, { name: 'paymentScreenshot', maxCount: 1 }]), updateBannerRequest);
router.delete('/request/:id', protect, deleteBannerRequest);

// Admin routes
router.get('/admin/all', getAllRequests);
router.put('/admin/:id/status', updateRequestStatus);
router.put('/admin/update/:id', upload.fields([{ name: 'bannerImage', maxCount: 1 }]), updateBannerAdmin);
router.delete('/admin/delete/:id', deleteBannerRequest);

// Banner Plan Routes
router.get('/plans', getActivePlans);
router.get('/plans/admin/all', getAllPlans);
router.post('/plans', createPlan);
router.put('/plans/:id', updatePlan);
router.delete('/plans/:id', deletePlan);

export default router;
