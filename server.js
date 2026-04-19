import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dns from 'dns';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';

import app from './app.js';
import initializeSocket from './socket.js';
import projectPlanRoutes from './routes/projectPlanRoutes.js';

// ===================== Path Setup =====================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ===================== DNS Fix for MongoDB Atlas SRV =====================
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
dns.setDefaultResultOrder('ipv4first');

// ===================== Config =====================
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const MONGO_URI = process.env.MONGO_URI;

// ===================== HTTP + Socket.IO Server =====================
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
      : '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  // Production Socket.IO settings
  pingTimeout: 60000,
  pingInterval: 25000,
  maxHttpBufferSize: 1e6, // 1MB
});

// Make io accessible in Express routes
app.set('io', io);

// Initialize socket event handlers (separate module)
initializeSocket(io);

// ===================== Additional Routes =====================
app.use('/api/project-plans', projectPlanRoutes);

// ===================== Serve Frontend in Production =====================
if (NODE_ENV === 'production') {
  const frontendBuildPath = path.join(__dirname, '..', 'project', 'dist');
  
  // Serve static files from React build
  app.use(express.static(frontendBuildPath));

  // Handle React Router — all non-API routes serve index.html
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendBuildPath, 'index.html'));
  });

  console.log(`📦 Serving frontend from: ${frontendBuildPath}`);
}

// ===================== Internet Check =====================
async function checkInternet() {
  return new Promise((resolve) => {
    dns.lookup('google.com', (err) => {
      resolve(!err || err.code !== 'ENOTFOUND');
    });
  });
}

// ===================== Graceful Shutdown =====================
function setupGracefulShutdown() {
  const shutdown = async (signal) => {
    console.log(`\n🛑 ${signal} received. Shutting down gracefully...`);
    
    httpServer.close(() => {
      console.log('✅ HTTP server closed');
    });

    try {
      await mongoose.connection.close();
      console.log('✅ MongoDB connection closed');
    } catch (err) {
      console.error('❌ Error closing MongoDB:', err.message);
    }

    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  // Handle uncaught exceptions
  process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err.message);
    if (NODE_ENV === 'production') {
      process.exit(1);
    }
  });

  process.on('unhandledRejection', (reason) => {
    console.error('❌ Unhandled Rejection:', reason);
  });
}

// ===================== Start Server =====================
async function start() {
  try {
    // Check internet
    const isOnline = await checkInternet();
    if (!isOnline) {
      console.error('⚠️  No internet connection detected. MongoDB Atlas may not be reachable.');
    }

    // Validate env
    if (!MONGO_URI) {
      throw new Error('MONGO_URI is not set in environment variables');
    }

    // Connect MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: NODE_ENV === 'production' ? 20 : 10,
      minPoolSize: NODE_ENV === 'production' ? 5 : 2,
      connectTimeoutMS: 10000,
    });
    console.log('✅ MongoDB connected successfully');
    app.set('mongoConnected', true);

    // Setup graceful shutdown
    setupGracefulShutdown();

    // Start listening
    httpServer.listen(PORT, () => {
      console.log(`\n🚀 Server running in ${NODE_ENV} mode on port ${PORT}`);
      console.log(`   Local:  http://localhost:${PORT}`);
      if (NODE_ENV === 'production') {
        console.log(`   App:    http://localhost:${PORT}`);
      }
      console.log('');
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    if (err.message.includes('timed out') || err.message.includes('querySrv')) {
      console.error('   → This is likely due to poor or no internet connection');
    }
    process.exit(1);
  }
}

start();
