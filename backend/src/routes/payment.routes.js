// payment.routes.js - Express routes for payment functionality (ES6)

import express from 'express';
import {
  generatePaymentOrder,
  verifyPayment,
  getPaymentStatus,
} from '../controllers/payment.controller.js';
import { user_verifyJWT } from '../middlewares/auth.middleware.js';

const router = express.Router();

/**
 * @swagger
 * /api/payment/create-order:
 *   post:
 *     summary: Generate a new payment order
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - currency
 *               - sessionId
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Payment amount (in whole units)
 *               currency:
 *                 type: string
 *                 description: Currency code (e.g., INR, USD)
 *               sessionId:
 *                 type: string
 *                 description: ID of the consultation session
 *     responses:
 *       200:
 *         description: Payment order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 id:
 *                   type: string
 *                   description: Payment ID
 *                 orderId:
 *                   type: string
 *                   description: Razorpay order ID
 *                 amount:
 *                   type: number
 *                 currency:
 *                   type: string
 *                 qrCode:
 *                   type: string
 *                   description: UPI QR code data URL
 *       400:
 *         description: Missing required fields
 *       404:
 *         description: Session not found
 *       500:
 *         description: Server error
 */
router.post('/create-order', user_verifyJWT, generatePaymentOrder);

/**
 * @swagger
 * /api/payment/verify:
 *   post:
 *     summary: Verify payment after completion
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - paymentId
 *             properties:
 *               paymentId:
 *                 type: string
 *                 description: ID of the payment to verify
 *               razorpayPaymentId:
 *                 type: string
 *                 description: Payment ID from Razorpay (optional)
 *               razorpaySignature:
 *                 type: string
 *                 description: Payment signature from Razorpay (optional)
 *     responses:
 *       200:
 *         description: Payment verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 payment:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     status:
 *                       type: string
 *                     amount:
 *                       type: number
 *                     paidAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Payment ID is required
 *       404:
 *         description: Payment not found
 *       500:
 *         description: Server error
 */
router.post('/verify', user_verifyJWT, verifyPayment);

/**
 * @swagger
 * /api/payment/status/{paymentId}:
 *   get:
 *     summary: Get payment status
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: paymentId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the payment to check
 *     responses:
 *       200:
 *         description: Payment status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 payment:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     status:
 *                       type: string
 *                     amount:
 *                       type: number
 *                     currency:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     paidAt:
 *                       type: string
 *                       format: date-time
 *       404:
 *         description: Payment not found
 *       500:
 *         description: Server error
 */
router.get('/status/:paymentId', user_verifyJWT, getPaymentStatus);

export default router;
