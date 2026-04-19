import express from 'express';
import {
    register,
    verifyEmail,
    resendVerification,
    login,
    googleLogin,
    verifyAdminOTP,
    forgotPassword,
    resetPassword,
    updateProfile,
    changePassword,
    getMe
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerification);
router.post('/login', login);
router.post('/google-login', googleLogin);
router.post('/verify-admin-otp', verifyAdminOTP);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.put('/update-profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.get('/me', protect, getMe);

export default router;
