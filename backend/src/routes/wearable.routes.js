import express from "express";
import {  
    addDevices,  
    selectPrimaryDevices,  
    fetchAndStoreHealthData,  
    AiInsights,  
    addInstructions,
    loadDevices 
} from "../controllers/wearable.controller.js";  
import { user_verifyJWT } from "../middlewares/auth.middleware.js"; // Importing the JWT middleware

const router = express.Router();

/**
 * @swagger
 * /api/wearables/devices:
 *   post:
 *     summary: Add a new wearable device
 *     tags: [Wearables]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - deviceName
 *             properties:
 *               deviceName:
 *                 type: string
 *                 description: Name of the wearable device to add
 *     responses:
 *       200:
 *         description: Device added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 devices:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       model:
 *                         type: string
 *                       addedAt:
 *                         type: string
 *                         format: date-time
 *       400:
 *         description: Device already added or invalid input
 *       404:
 *         description: User not found
 */
router.post("/devices", user_verifyJWT, addDevices);

/**
 * @swagger
 * /api/wearables/devices/select:
 *   post:
 *     summary: Select a primary wearable device
 *     tags: [Wearables]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - deviceModel
 *             properties:
 *               deviceModel:
 *                 type: string
 *                 description: Model name of the device to set as primary
 *     responses:
 *       200:
 *         description: Primary device selected successfully
 *       404:
 *         description: User not found
 */
router.post("/devices/select", user_verifyJWT, selectPrimaryDevices);

/**
 * @swagger
 * /api/wearables/health-data:
 *   get:
 *     summary: Fetch and store health data from Google Fit
 *     tags: [Wearables]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Health data fetched and stored successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 healthData:
 *                   type: object
 *       400:
 *         description: User not found
 *       500:
 *         description: Failed to fetch health data
 */
router.get("/health-data", user_verifyJWT, fetchAndStoreHealthData);

/**
 * @swagger
 * /api/wearables/ai-insights:
 *   get:
 *     summary: Get AI-based insights on health data
 *     tags: [Wearables]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: AI insights retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 insights:
 *                   type: object
 *       400:
 *         description: User data not found
 *       500:
 *         description: Internal server error
 */
router.get("/ai-insights", user_verifyJWT, AiInsights);

/**
 * @swagger
 * /api/wearables/device/instructions:
 *   get:
 *     summary: Get device-specific instructions
 *     tags: [Wearables]
 *     parameters:
 *       - in: query
 *         name: deviceName
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the device to get instructions for
 *     responses:
 *       200:
 *         description: Device instructions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 instructions:
 *                   type: string
 */
router.get("/device/instructions", addInstructions);

/**
 * @swagger
 * /api/wearables/load:
 *   get:
 *     summary: Load user's connected devices
 *     tags: [Wearables]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Devices loaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 devices:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       model:
 *                         type: string
 *                       addedAt:
 *                         type: string
 *                         format: date-time
 *       404:
 *         description: User not found
 *       500:
 *         description: Failed to load devices
 */
router.get("/load", user_verifyJWT, loadDevices);


export default router;
