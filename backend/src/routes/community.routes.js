import express from 'express';
import { createCommunityRoom, joinCommunityRoom, sendMessageToCommunityRoom ,getCommunityRooms} from '../controllers/community.controller.js';
import { user_verifyJWT } from '../middlewares/auth.middleware.js';

const router = express.Router();

/**
 * @swagger
 * /api/community/create:
 *   post:
 *     summary: Create a new community room
 *     tags: [Community]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the community room
 *               description:
 *                 type: string
 *                 description: Description of the community room
 *     responses:
 *       200:
 *         description: Community room created successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized - Invalid or missing token
 */
router.post('/create', user_verifyJWT, createCommunityRoom);

/**
 * @swagger
 * /api/community/join:
 *   post:
 *     summary: Join an existing community room
 *     tags: [Community]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - roomId
 *             properties:
 *               roomId:
 *                 type: string
 *                 description: ID of the community room to join
 *     responses:
 *       200:
 *         description: Successfully joined the community room
 *       404:
 *         description: Community room not found
 *       401:
 *         description: Unauthorized - Invalid or missing token
 */
router.post('/join', user_verifyJWT, joinCommunityRoom);

/**
 * @swagger
 * /api/community/rooms:
 *   get:
 *     summary: Get all available community rooms
 *     tags: [Community]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all community rooms
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   description:
 *                     type: string
 *                   members:
 *                     type: array
 *                     items:
 *                       type: string
 *       401:
 *         description: Unauthorized - Invalid or missing token
 */
router.get('/rooms', user_verifyJWT, getCommunityRooms);

/**
 * @swagger
 * /api/community/message:
 *   post:
 *     summary: Send a message to a community room
 *     tags: [Community]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - roomId
 *               - message
 *             properties:
 *               roomId:
 *                 type: string
 *                 description: ID of the community room
 *               message:
 *                 type: string
 *                 description: Message to be sent
 *     responses:
 *       200:
 *         description: Message sent successfully
 *       404:
 *         description: Community room not found
 *       401:
 *         description: Unauthorized - Invalid or missing token
 */
router.post('/message', user_verifyJWT, sendMessageToCommunityRoom);

export default router;