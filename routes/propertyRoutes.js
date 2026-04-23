import express from 'express';
import {
    createProperty, getProperties, adminGetProperties, updatePropertyAdmin, deleteProperty, getPropertyTypes, getPropertyCounts, getSearchCounts,
    getPropertyById, getPropertyBySlug, getSellerDashboardStats, getMyPropertiesList, incrementPropertyViews, incrementPropertyLeads, getDynamicHomepageBoxes, updatePropertySeller, getSellerScoreboard, renewProperty, getUploadSignature
} from '../controllers/propertyController.js';
import { protect } from '../middleware/authMiddleware.js';
import { getLocations, addLocation, deleteLocation } from '../controllers/locationController.js';
import uploadPropertyMedia from '../middleware/uploadPropertyMedia.js';
import cacheMiddleware from '../middleware/cacheMiddleware.js';

const router = express.Router();

// Location Routes
router.get('/locations', getLocations);
router.post('/locations', addLocation);
router.delete('/locations/:id', deleteLocation);

// Config API
router.get('/types', getPropertyTypes);
router.get('/upload-signature', protect, getUploadSignature);

// Property Routes
router.post('/', uploadPropertyMedia.fields([{ name: 'images', maxCount: 10 }]), createProperty);
router.get('/', getProperties);
router.get('/search', getProperties);
router.get('/search-counts', getSearchCounts);
router.get('/admin/all', adminGetProperties);
router.put('/admin/:id', updatePropertyAdmin);
router.delete('/:id', deleteProperty);
router.get('/counts', cacheMiddleware(600), getPropertyCounts); // Cache for 10 mins
router.get('/slug/:slug', getPropertyBySlug);
router.get('/dynamic-boxes', cacheMiddleware(300), getDynamicHomepageBoxes); // Cache for 5 mins
router.get('/scoreboard', getSellerScoreboard); // Public scoreboard - MUST be before /:id
router.post('/:id/view', incrementPropertyViews); // View Count
router.post('/:id/lead', incrementPropertyLeads); // Lead Count (Call/Email/WhatsApp)
router.get('/:id', getPropertyById);

// Seller Dashboard Stats & List
router.get('/seller/stats', protect, getSellerDashboardStats);
router.get('/seller/list', protect, getMyPropertiesList);
// PATCH: Status-only update (JSON body, no file upload)
router.patch('/seller/:id/status', protect, updatePropertySeller);
// PUT: Full property edit (multipart/form-data with file uploads)
router.put('/seller/:id', protect, uploadPropertyMedia.fields([{ name: 'images', maxCount: 10 }]), updatePropertySeller);
router.post('/renew/:id', protect, renewProperty);

export default router;

