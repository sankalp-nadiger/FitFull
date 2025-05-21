import express from "express";
import { user_verifyJWT} from "../middlewares/auth.middleware.js";
import {
  registerUser,
  loginUser,
  addFamilyMembers,
  removeFamilyMember,
  getFamilyMembers,
  getPrescription,
  getTestReport,
  getFamDiag, getFamPresc, getDiagnosisReport, getFamilyTest, addDiagnosisReport,
  savePrescription,
  saveTestReport,
  approveFamilyMember, approvalDeniedPage, approvalSuccessPage, getVerificationPage,
  //getCurrentUser,
  getAllUsersWithDetails
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { endSession, joinSession } from "../controllers/doctor.controller.js";
const router = express.Router();

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid input data
 */
router.post("/register", registerUser);

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Login user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *                 streak:
 *                   type: number
 *                 suggestedActivity:
 *                   type: object
 */
router.post("/login", loginUser);

/**
 * @swagger
 * /api/users/full:
 *   get:
 *     summary: Get all users with their details
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of all users with their details
 */
router.get('/full', getAllUsersWithDetails);

/**
 * @swagger
 * /api/users/family/add:
 *   post:
 *     summary: Add family members
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Family member request sent successfully
 */
router.post("/family/add", user_verifyJWT, addFamilyMembers);

/**
 * @swagger
 * /api/users/family/remove:
 *   delete:
 *     summary: Remove a family member
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - familyMemberId
 *             properties:
 *               familyMemberId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Family member removed successfully
 */
router.delete("/family/remove", user_verifyJWT, removeFamilyMember);

/**
 * @swagger
 * /api/users/family:
 *   get:
 *     summary: Get user's family members
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of family members
 */
router.get("/family", user_verifyJWT, getFamilyMembers);

/**
 * @swagger
 * /api/users/addReport:
 *   post:
 *     summary: Save a test report
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reportData:
 *                 type: object
 *     responses:
 *       200:
 *         description: Test report saved successfully
 */
router.post("/addReport", express.json({ limit: '1000mb' }), user_verifyJWT, saveTestReport);

/**
 * @swagger
 * /api/users/addPresc:
 *   post:
 *     summary: Save a prescription
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Prescription saved successfully
 */
router.post('/addPresc', user_verifyJWT, savePrescription);

/**
 * @swagger
 * /api/users/addDiagnosis:
 *   post:
 *     summary: Add a diagnosis report
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Diagnosis report added successfully
 */
router.post('/addDiagnosis', user_verifyJWT, addDiagnosisReport);

/**
 * @swagger
 * /api/users/prescriptions:
 *   get:
 *     summary: Get user's prescriptions
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of prescriptions
 */
router.get("/prescriptions", user_verifyJWT, getPrescription);

/**
 * @swagger
 * /api/users/test-reports:
 *   get:
 *     summary: Get user's test reports
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of test reports
 */
router.get("/test-reports", user_verifyJWT, getTestReport);

/**
 * @swagger
 * /api/users/diagnoses:
 *   get:
 *     summary: Get user's diagnoses
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of diagnoses
 */
router.get("/diagnoses", user_verifyJWT, getDiagnosisReport);

/**
 * @swagger
 * /api/users/famReport:
 *   post:
 *     summary: Get family member's test reports
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - familyMemberId
 *             properties:
 *               familyMemberId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Family member's test reports retrieved successfully
 */
router.post("/famReport", user_verifyJWT, getFamilyTest);

/**
 * @swagger
 * /api/users/famPresc:
 *   post:
 *     summary: Get family member's prescriptions
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Family member's prescriptions retrieved successfully
 */
router.post("/famPresc", user_verifyJWT, getFamPresc);

/**
 * @swagger
 * /api/users/famDiagnosis:
 *   post:
 *     summary: Get family member's diagnoses
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Family member's diagnoses retrieved successfully
 */
router.post("/famDiagnosis", user_verifyJWT, getFamDiag);

/**
 * @swagger
 * /api/users/join-session:
 *   post:
 *     summary: Join a session
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully joined session
 */
router.post("/join-session", user_verifyJWT, joinSession);

/**
 * @swagger
 * /api/users/end:
 *   post:
 *     summary: End a session
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Session ended successfully
 */
router.post("/end", user_verifyJWT, endSession);

/**
 * @swagger
 * /api/users/verify-family-request/{token}:
 *   post:
 *     summary: Verify family request
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Family request verification page
 */
router.post("/verify-family-request/:token", getVerificationPage);

/**
 * @swagger
 * /api/users/family/approve:
 *   post:
 *     summary: Approve family member request
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Family member request approved
 */
router.post("/family/approve", express.json({limit: '1000mb'}), approveFamilyMember);

/**
 * @swagger
 * /api/users/approval-success/{token}:
 *   get:
 *     summary: Success page for family approval
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Approval success page
 */
router.get("/approval-success/:token", approvalSuccessPage);

/**
 * @swagger
 * /api/users/approval-denied/{token}:
 *   get:
 *     summary: Denied page for family approval
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Approval denied page
 */
router.get("/approval-denied/:token", approvalDeniedPage);
 


export default router;