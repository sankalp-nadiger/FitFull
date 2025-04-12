// payment.routes.js - Express routes for payment functionality (ES6)

import express from 'express';
import {
  generatePaymentOrder,
  verifyPayment,
  getPaymentStatus,
} from '../controllers/payment.controller.js';
import { user_verifyJWT } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Create a new payment order
router.post('/create-order', user_verifyJWT, generatePaymentOrder);

// Verify payment after completion
router.post('/verify', user_verifyJWT, verifyPayment);

// Check payment status
router.get('/status/:paymentId',user_verifyJWT, getPaymentStatus);

export default router;
