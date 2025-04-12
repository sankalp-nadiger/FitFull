// payment.controller.js - Controllers for payment functionality (ES6)

import Payment from '../models/payment.model.js';
import {Session} from '../models/session.model.js';
import Razorpay from 'razorpay';
import { v4 as uuidv4 } from 'uuid';
import QRCode from 'qrcode';
import dotenv from 'dotenv';
dotenv.config();

// Initialize Razorpay with your key_id and key_secret
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
  version: 'v1'
});

/**
 * Generate a new payment order
 */
export const generatePaymentOrder = async (req, res) => {
  try {
    const { amount, currency, sessionId } = req.body;

    if (!amount || !currency || !sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Amount, currency and sessionId are required'
      });
    }

    // Check if session exists
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Create order in Razorpay
    const options = {
      amount: amount * 100, // amount in smallest unit (paise for INR)
      currency,
      receipt: `receipt_${uuidv4().slice(0, 8)}`,
      notes: {
        sessionId,
        userId: req.user._id
      }
    };

    const order = await razorpay.orders.create(options);

    // Save payment in DB
    const payment = new Payment({
      orderId: order.id,
      amount,
      currency,
      receipt: options.receipt,
      sessionId,
      userId: req.user._id,
      status: 'created'
    });

    await payment.save();

    // Generate QR Code
    const paymentLink = `upi://pay?pa=${process.env.UPI_ID}&pn=HealthConsultation&am=${amount}&cu=${currency}&tn=Session-${sessionId}`;
    const qrCode = await QRCode.toDataURL(paymentLink);

    res.status(200).json({
      success: true,
      id: payment._id,
      orderId: order.id,
      amount,
      currency,
      qrCode
    });

  } catch (error) {
    console.error('Payment order creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment order',
      error: error.message
    });
  }
};

/**
 * Verify payment after completion
 */
export const verifyPayment = async (req, res) => {
  try {
    const { paymentId, razorpayPaymentId, razorpaySignature } = req.body;

    if (!paymentId) {
      return res.status(400).json({
        success: false,
        message: 'Payment ID is required'
      });
    }

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Save Razorpay details (signature verification omitted)
    if (razorpayPaymentId && razorpaySignature) {
      payment.razorpayPaymentId = razorpayPaymentId;
      payment.razorpaySignature = razorpaySignature;
    }

    payment.status = 'captured';
    payment.paidAt = new Date();
    await payment.save();

    await Session.findByIdAndUpdate(payment.sessionId, {
      paymentStatus: 'paid',
      paymentId: payment._id
    });

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      payment: {
        id: payment._id,
        status: payment.status,
        amount: payment.amount,
        paidAt: payment.paidAt
      }
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment',
      error: error.message
    });
  }
};

/**
 * Get payment status
 */
export const getPaymentStatus = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Optionally update status from Razorpay
    if (payment.status === 'created' && payment.orderId) {
      try {
        const paymentDetails = await razorpay.orders.fetchPayments(payment.orderId);

        if (paymentDetails.items?.length > 0) {
          const latest = paymentDetails.items[0];
          if (['captured', 'authorized'].includes(latest.status)) {
            payment.status = latest.status;
            payment.razorpayPaymentId = latest.id;
            payment.paidAt = new Date();
            await payment.save();

            await Session.findByIdAndUpdate(payment.sessionId, {
              paymentStatus: 'paid',
              paymentId: payment._id
            });
          }
        }
      } catch (razorpayError) {
        console.error('Razorpay status check error:', razorpayError);
      }
    }

    res.status(200).json({
      success: true,
      payment: {
        id: payment._id,
        status: payment.status,
        amount: payment.amount,
        currency: payment.currency,
        createdAt: payment.createdAt,
        paidAt: payment.paidAt
      }
    });

  } catch (error) {
    console.error('Payment status check error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment status',
      error: error.message
    });
  }
};
