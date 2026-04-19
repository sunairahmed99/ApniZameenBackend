import express from 'express';
import {
  createAgency,
  getAllAgencies,
  getAgencyById,
  approveAgency,
  rejectAgency,
  upgradeAgency,
  createUpgradeRequest,
  getAllUpgradeRequests,
  approveUpgradeRequest,
  rejectUpgradeRequest,
  updateAgency,
  deleteAgency,
  deleteUpgradeRequest,
  getMyAgencies,
  getAgencyStatsByCity,
  deactivateAgency
} from '../controllers/agencyController.js';
import {
  createPlan,
  getPlans,
  getAllPlansAdmin,
  updatePlan,
  deletePlan
} from '../controllers/featuredPlanController.js';

import multer from 'multer';
import { createCloudinaryStorage } from "../middleware/imageUploadMiddleware.js";
import cacheMiddleware from '../middleware/cacheMiddleware.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const agencyStorage = createCloudinaryStorage('zameen_agencies');
const uploadAgency = multer({
  storage: agencyStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed'), false);
    }
  }
});

const router = express.Router();

// --- SPECIFIC ROUTES MUST COME FIRST ---

// Upgrade Request Routes
router.route('/upgrade-request')
  .post(uploadAgency.fields([{ name: 'paymentImage', maxCount: 1 }]), createUpgradeRequest);

router.route('/upgrade-requests')
  .get(getAllUpgradeRequests);

router.route('/upgrade-requests/:id/approve').put(approveUpgradeRequest);
router.route('/upgrade-requests/:id/reject').put(rejectUpgradeRequest);
router.route('/upgrade-requests/:id').delete(deleteUpgradeRequest);


router.route('/stats')
  .get(getAgencyStatsByCity);

router.route('/stats/by-city')
  .get(getAgencyStatsByCity);

// Plan Routes
router.route('/plans/all') // For admin to see all including inactive
  .get(getAllPlansAdmin);

router.route('/plans')
  .get(getPlans)
  .post(createPlan);

router.route('/plans/:id')
  .put(updatePlan)
  .delete(deletePlan);


// Public/Seller Agency Routes (General Collection)
router.route('/my-agencies')
  .get(protect, getMyAgencies);

router.route('/')
  .post(protect, uploadAgency.fields([{ name: 'logo', maxCount: 1 }, { name: 'image', maxCount: 1 }]), createAgency)
  .get(getAllAgencies);


// --- DYNAMIC ROUTES (/:id) MUST COME LAST ---

// Admin Agency Routes (Specific actions on ID)
router.route('/:id/approve').put(protect, admin, approveAgency);
router.route('/:id/reject').put(protect, admin, rejectAgency);
router.route('/:id/deactivate').put(protect, admin, deactivateAgency);
router.route('/:id/upgrade').post(protect, admin, upgradeAgency);

// Get Single Agency by ID (Catch-all for :id)
router.route('/:id')
  .get(getAgencyById)
  .put(uploadAgency.fields([{ name: 'logo', maxCount: 1 }, { name: 'image', maxCount: 1 }]), updateAgency)
  .delete(deleteAgency);

export default router;
