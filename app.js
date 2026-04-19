import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import bannerAdRouter from './routes/bannerAdRoutes.js';
import bannerRouter from './routes/bannerRoutes.js';
import homePageBoxRouter from './routes/homePageBoxRoutes.js';
import blogRouter from './routes/blogRoutes.js';

import agencyRouter from './routes/agencyRoutes.js';
import propertyRouter from './routes/propertyRoutes.js';
import projectRouter from './routes/projectRoutes.js';
import browseSectionRouter from './routes/browseSectionRoutes.js';
import inquiryRouter from './routes/inquiryRoutes.js';
import authRoutes from './routes/authRoutes.js';
import dealRoutes from './routes/dealRoutes.js';
import subscriptionRoutes from './routes/subscriptionRoutes.js';
import projectRequestRoutes from './routes/projectRequestRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import paymentInfoRouter from './routes/paymentInfoRoutes.js';
import paymentRouter from './routes/paymentRoutes.js';
import paymentPriceRouter from './routes/paymentPriceRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';

import analyticsRouter from './routes/analyticsRoutes.js';
import jobRouter from './routes/jobRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ============================================
// RATE LIMITING CONFIGURATION
// ============================================

// General API Rate Limiter - High limit to prevent 429s on legitimate traffic
// Allowing 10,000 requests per 15 minutes (approx 11 req/sec average)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10000,
  message: {
    error: 'Too many requests from this IP, please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many requests',
      message: 'You have exceeded the request limit. Please try again later.',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
    });
  }
});

// ============================================
// MIDDLEWARE
// ============================================

// Trust proxy (for Render, Heroku, Nginx, etc.)
app.set('trust proxy', 1);

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false, // Disable CSP for dev — enable in production if needed
}));
app.use(compression()); // gzip all responses
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim()) : '*',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Apply general rate limiting to all API routes
app.use('/api/', generalLimiter);

// ============================================
// API ROUTES
// ============================================

app.use('/api/banner-ads', bannerAdRouter);
app.use('/api/banners', bannerRouter);
app.use('/api/homepage-boxes', homePageBoxRouter);
app.use('/api/blogs', blogRouter);

app.use('/api/auth', authRoutes);

// Removed specific strict limiters as they were blocking read operations
app.use('/api/agencies', agencyRouter);
app.use('/api/properties', propertyRouter);
app.use('/api/projects', projectRouter);

app.use('/api/browse-sections', browseSectionRouter);
app.use('/api/inquiries', inquiryRouter);
app.use('/api/deals', dealRoutes);
app.use('/api/subscription-requests', subscriptionRoutes);
app.use('/api/project-requests', projectRequestRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payment-info', paymentInfoRouter);
app.use('/api/payments', paymentRouter);
app.use('/api/payment-prices', paymentPriceRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/jobs', jobRouter);
app.use('/api/settings', settingsRoutes);





app.use((err, req, res, next) => {

  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || 'Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : (err.stack || ''),
  });
});


export default app;
