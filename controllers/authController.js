import Seller from '../models/Seller.js';
import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import sendEmail from '../utils/sendEmail.js';
import crypto from 'crypto';

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES || '1d',
    });
};

// @desc    Register a new seller
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req, res, next) => {
    const { name, email, password } = req.body;

    let seller = await Seller.findOne({ email });

    if (seller && seller.isVerified) {
        return res.status(400).json({ message: 'Seller already exists' });
    }

    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationCodeExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    if (seller) {
        // Update existing unverified seller
        seller.name = name;
        seller.password = password;
        seller.verificationCode = verificationCode;
        seller.verificationCodeExpire = verificationCodeExpire;
        await seller.save();
    } else {
        // Create new seller
        seller = await Seller.create({
            name,
            email,
            password,
            role: 'seller', 
            verificationCode,
            verificationCodeExpire
        });
    }

    if (seller) {
        // Send Email
        try {
            await sendEmail({
                email: seller.email,
                subject: 'Email Verification Code',
                message: `Your verification code is: ${verificationCode}. It expires in 10 minutes.`,
                html: `<h3>Email Verification</h3><p>Your verification code is: <b>${verificationCode}</b></p><p>It expires in 10 minutes.</p>`
            });

            res.status(201).json({
                success: true,
                message: 'Verification code sent to email',
                email: seller.email
            });
        } catch (error) {
            return res.status(500).json({ message: 'Email could not be sent' });
        }
    } else {

        return res.status(400).json({ message: 'Invalid seller data' });
    }
});

// @desc    Verify Email
// @route   POST /api/auth/verify-email
// @access  Public
export const verifyEmail = async (req, res, next) => {
    try {
        const { email, code } = req.body;


        const seller = await Seller.findOne({
            email,
            verificationCode: code,
            verificationCodeExpire: { $gt: Date.now() }
        });

        if (!seller) {
            return res.status(400).json({ message: 'Invalid or expired verification code' });
        }

        seller.isVerified = true;
        seller.verificationCode = undefined;
        seller.verificationCodeExpire = undefined;
        
        await seller.save();

        res.status(200).json({
            _id: seller._id,
            name: seller.name,
            email: seller.email,
            phone: seller.phone,
            role: seller.role,
            token: generateToken(seller._id),
        });
    } catch (saveError) {
        next(saveError);
    }
};

// @desc    Resend Verification Code
// @route   POST /api/auth/resend-verification
// @access  Public
export const resendVerification = asyncHandler(async (req, res, next) => {
    const { email } = req.body;

    const seller = await Seller.findOne({ email });

    if (!seller) {
        return res.status(404).json({ message: 'User not found' });
    }

    if (seller.isVerified) {
        return res.status(400).json({ message: 'User is already verified' });
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationCodeExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    seller.verificationCode = verificationCode;
    seller.verificationCodeExpire = verificationCodeExpire;
    await seller.save();

    try {
        await sendEmail({
            email: seller.email,
            subject: 'Email Verification Code (Resend)',
            message: `Your new verification code is: ${verificationCode}. It expires in 10 minutes.`,
            html: `<h3>Email Verification</h3><p>Your new verification code is: <b>${verificationCode}</b></p><p>It expires in 10 minutes.</p>`
        });

        res.status(200).json({ success: true, message: 'Verification code resent to email' });
    } catch (err) {
        return res.status(500).json({ message: 'Email could not be sent' });
    }
});

// @desc    Login seller
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    const seller = await Seller.findOne({ email }).select('+password');

    if (seller && (await seller.matchPassword(password))) {
        if (!seller.isVerified) {
            return res.status(401).json({ message: 'Please verify your email first' });
        }

        // Role check for Admin 2FA
        if (seller.role === 'admin') {
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            seller.verificationCode = otp;
            seller.verificationCodeExpire = Date.now() + 5 * 60 * 1000; // 5 mins
            await seller.save();

            await sendEmail({
                email: seller.email,
                subject: 'Admin Login OTP',
                message: `Your Admin login OTP is: ${otp}`,
                html: `<h3>Admin Login</h3><p>Your OTP is: <b>${otp}</b></p>`
            });

            return res.status(200).json({
                otpRequired: true,
                email: seller.email,
                message: 'OTP sent to admin email'
            });
        }

        res.json({
            _id: seller._id,
            name: seller.name,
            email: seller.email,
            phone: seller.phone,
            role: seller.role,
            token: generateToken(seller._id),
        });
    } else {
        return res.status(401).json({ message: 'Invalid email or password' });
    }
});

import axios from 'axios';

// @desc    Google Login
// @route   POST /api/auth/google-login
// @access  Public
export const googleLogin = asyncHandler(async (req, res, next) => {
    const { access_token } = req.body;

    if (!access_token) {
        return res.status(400).json({ message: 'Google access token is required' });
    }

    try {
        // Fetch user data from Google
        const googleResponse = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${access_token}` }
        });

        const { email, name } = googleResponse.data;

        let seller = await Seller.findOne({ email });

        if (seller) {
            // Found existing user
            if (!seller.isVerified) {
                // If they logged in via Google but weren't verified, verify them
                seller.isVerified = true;
                seller.verificationCode = undefined;
                seller.verificationCodeExpire = undefined;
                await seller.save();
            }

            res.status(200).json({
                _id: seller._id,
                name: seller.name,
                email: seller.email,
                phone: seller.phone,
                role: seller.role,
                token: generateToken(seller._id),
            });
        } else {
            // New user via Google
            const randomPassword = crypto.randomBytes(16).toString('hex');

            seller = await Seller.create({
                name: name,
                email: email,
                password: randomPassword,
                role: 'seller',
                isVerified: true
            });

            res.status(201).json({
                _id: seller._id,
                name: seller.name,
                email: seller.email,
                phone: seller.phone,
                role: seller.role,
                token: generateToken(seller._id),
            });
        }
    } catch (error) {
        return res.status(401).json({ message: 'Invalid Google access token' });
    }
});

// @desc    Verify Admin OTP
// @route   POST /api/auth/verify-admin-otp
// @access  Public
export const verifyAdminOTP = asyncHandler(async (req, res, next) => {
    const { email, code } = req.body;

    const seller = await Seller.findOne({
        email,
        verificationCode: code,
        verificationCodeExpire: { $gt: Date.now() }
    });

    if (!seller || seller.role !== 'admin') {
        return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    seller.verificationCode = undefined;
    seller.verificationCodeExpire = undefined;
    await seller.save();

    res.status(200).json({
        _id: seller._id,
        name: seller.name,
        email: seller.email,
        phone: seller.phone,
        role: seller.role,
        token: generateToken(seller._id),
    });
});

// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = asyncHandler(async (req, res, next) => {
    const seller = await Seller.findOne({ email: req.body.email });

    if (!seller) {
        return res.status(404).json({ message: 'Seller not found' });
    }

    // Generate reset code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    seller.resetPasswordToken = resetCode;
    seller.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 mins
    await seller.save();

    try {
        await sendEmail({
            email: seller.email,
            subject: 'Password Reset Code',
            message: `Your password reset code is: ${resetCode}`,
            html: `<h3>Password Reset</h3><p>Your reset code is: <b>${resetCode}</b></p>`
        });

        res.status(200).json({ success: true, message: 'Reset code sent to email' });
    } catch (err) {
        seller.resetPasswordToken = undefined;
        seller.resetPasswordExpire = undefined;
        await seller.save();
        return res.status(500).json({ message: 'Email could not be sent' });
    }
});

// @desc    Reset Password
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = asyncHandler(async (req, res, next) => {
    const { email, code, password } = req.body;

    const seller = await Seller.findOne({
        email,
        resetPasswordToken: code,
        resetPasswordExpire: { $gt: Date.now() }
    });

    if (!seller) {
        return res.status(400).json({ message: 'Invalid or expired reset code' });
    }

    seller.password = password;
    seller.resetPasswordToken = undefined;
    seller.resetPasswordExpire = undefined;
    await seller.save();

    res.status(200).json({ success: true, message: 'Password reset successful' });
});

// @desc    Update Seller Profile
// @route   PUT /api/auth/update-profile
// @access  Private
export const updateProfile = asyncHandler(async (req, res, next) => {
    const { name, phone, phoneNumber } = req.body;

    if (!name) {
        res.status(400);
        throw new Error('Name is required');
    }

    // Determine role updating if it's 'user'
    let updateOps = {
        name: name,
        phone: phone || phoneNumber || req.seller.phone
    };

    // If current role is 'user', migrate it to 'seller' (for existing DB records)
    if (req.seller && req.seller.role === 'user') {
        updateOps.role = 'seller';
    }

    const updatedSeller = await Seller.findByIdAndUpdate(
        req.seller._id,
        { $set: updateOps },
        { new: true, runValidators: true }
    );

    if (updatedSeller) {
        res.json({
            _id: updatedSeller._id,
            name: updatedSeller.name,
            email: updatedSeller.email,
            phone: updatedSeller.phone,
            role: updatedSeller.role,
            token: generateToken(updatedSeller._id),
        });
    } else {
        res.status(404);
        throw new Error('Seller not found');
    }
});

// @desc    Get current Seller data
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res, next) => {
    // Lean helps in case the field exists in DB but not in Schema (legacy data)
    const seller = await Seller.findById(req.seller.id).lean();

    if (!seller) {
        res.status(404);
        throw new Error('Seller not found');
    }

    res.status(200).json({
        _id: seller._id,
        name: seller.name,
        email: seller.email,
        phone: seller.phone || seller.phoneNumber, // Map legacy field to standard one
        role: seller.role,
    });
});

// @desc    Change Password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = asyncHandler(async (req, res, next) => {
    const { oldPassword, newPassword } = req.body;

    const seller = await Seller.findById(req.seller.id).select('+password');

    if (seller && (await seller.matchPassword(oldPassword))) {
        seller.password = newPassword;
        await seller.save();
        res.json({ message: 'Password changed successfully' });
    } else {
        res.status(401);
        throw new Error('Invalid old password');
    }
});

// Removed duplicate getMe



