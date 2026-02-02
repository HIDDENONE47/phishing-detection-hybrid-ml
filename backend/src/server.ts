import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import urlScanRoutes from './routes/urlScan.routes';
import emailScanRoutes from './routes/emailScan.routes';
import userRoutes from './routes/user.routes';
import adminRoutes from './routes/admin.routes';
import feedbackRoutes from './routes/feedback.routes';
import reportRoutes from './routes/report.routes';
import axios from "axios";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Debug: Log environment variables
console.log('MongoDB URI:', process.env.MONGODB_URI ? 'URI is set' : 'URI is not set');

// Middleware
const corsOptions = {
  origin: "http://localhost:3000",  // your React frontend
  credentials: true,                // allow cookies/headers
};

app.use(cors(corsOptions));;
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/scan/url', urlScanRoutes);
app.use('/api/scan/email', emailScanRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/reports', reportRoutes);

// MongoDB connection
// Use the connection string from mongodb/config.js if MONGODB_URI is not set
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://haseeb:zer09876@cluster0.bsjucp4.mongodb.net/";

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });








