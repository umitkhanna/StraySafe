import express from "express";
import cors from "cors";
import pino from "pino-http";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import connectDB from "./config/database.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(pino());
app.use(express.json({ limit: "5mb" }));
app.use(cookieParser());

// CORS configuration for both web and React Native
app.use(cors({ 
  origin: function (origin, callback) {
    // Allowing requests with no origin for mobile app
    if (!origin) return callback(null, true);
    
    const allowedOrigins = process.env.CORS_ORIGIN?.split(",") || ['*'];
    
    // Allow all origins in development
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    // Check if origin is allowed
    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true, // Allow credentials (cookies) to be sent
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);


// Health check endpoint
app.get("/health", (_req, res) => {
  res.json({ 
    ok: true,
    message: "StraySafe API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});


// Test endpoint to verify MongoDB connection
app.get("/db-status", async (_req, res) => {
  try {
    const mongoose = await import('mongoose');
    const state = mongoose.connection.readyState;
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    
    res.json({
      database: states[state] || 'unknown',
      host: mongoose.connection.host || 'N/A'
    });
  } catch (error) {
    res.status(500).json({
      database: 'error',
      message: error.message
    });
  }
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Something went wrong!',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});
/*
// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});
*/
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`API listening on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`CORS Origin: ${process.env.CORS_ORIGIN || '*'}`);
});
