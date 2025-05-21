import express from "express";
import { doctor_verifyJWT, user_verifyJWT, verifyUserOrDoctor } from "../middlewares/auth.middleware.js";
import {
    requestSession,
    acceptSession,
    endSession,
    getUserAppointments,
  
    updateFeedback,
    getDoctorStats,
    updateProfile,
    addPrescription,
    getDoctorPrescriptions,
    addTestReport,
    getDoctorTestReports,
    addDiagnosis,
    getDoctorDiagnoses,
    registerDoctor,
    loginDoctor,
    logoutDoctor,
    joinSession,
    getPatientsByDoctor,
    getAllDoctors,
    getPendingConsultations,
   
} from "../controllers/doctor.controller.js";
// import { sendOTP } from "../controllers/parent.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/doctor/register-doctor:
 *   post:
 *     summary: Register a new doctor
 *     tags: [Doctor]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - email
 *               - password
 *               - mobileNumber
 *               - yearExp
 *             properties:
 *               fullName:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               mobileNumber:
 *                 type: string
 *               specifications:
 *                 type: array
 *                 items:
 *                   type: string
 *               yearExp:
 *                 type: number
 *               certificateImage:
 *                 type: string
 *                 format: binary
 *               availability:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Doctor registered successfully
 *       400:
 *         description: Invalid input data
 */
router.post("/register-doctor", upload.fields([{ name: "certificateImage", maxCount: 1 }]), registerDoctor);

/**
 * @swagger
 * /api/doctor/login:
 *   post:
 *     summary: Login for doctors
 *     tags: [Doctor]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - mobileNumber
 *               - password
 *             properties:
 *               mobileNumber:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", loginDoctor);

/**
 * @swagger
 * /api/doctor/logout:
 *   post:
 *     summary: Logout doctor
 *     tags: [Doctor]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - mobileNumber
 *             properties:
 *               mobileNumber:
 *                 type: string
 *     responses:
 *       200:
 *         description: Logout successful
 *       401:
 *         description: Unauthorized
 */
router.post("/logout", doctor_verifyJWT, logoutDoctor);

/**
 * @swagger
 * /api/doctor/book:
 *   post:
 *     summary: Book a session with a doctor
 *     tags: [Doctor]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - doctorId
 *               - date
 *               - time
 *               - issueDetails
 *             properties:
 *               doctorId:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               time:
 *                 type: string
 *                 format: time
 *               issueDetails:
 *                 type: string
 *     responses:
 *       201:
 *         description: Session booked successfully
 *       400:
 *         description: Invalid input or scheduling conflict
 */
router.post("/book", user_verifyJWT, requestSession);
/**
 * @swagger
 * /api/doctor/{sessionId}/join-session:
 *   post:
 *     summary: Join a session (for both doctor and user)
 *     tags: [Doctor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully joined session
 *       404:
 *         description: Session not found
 */
router.post("/:sessionId/join-session", verifyUserOrDoctor, joinSession);

/**
 * @swagger
 * /api/doctor/end:
 *   post:
 *     summary: End a session
 *     tags: [Doctor]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sessionId
 *             properties:
 *               sessionId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Session ended successfully
 *       404:
 *         description: Session not found
 */
router.post("/end", verifyUserOrDoctor, endSession);

/**
 * @swagger
 * /api/doctor/active:
 *   get:
 *     summary: Get user's active appointments
 *     tags: [Doctor]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of active appointments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   status:
 *                     type: string
 *                   startTime:
 *                     type: string
 *                     format: date-time
 */
router.get("/active", user_verifyJWT, getUserAppointments);

/**
 * @swagger
 * /api/doctor/pending-consultations:
 *   get:
 *     summary: Get pending consultations for doctor
 *     tags: [Doctor]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of pending consultations
 */
router.get("/pending-consultations", doctor_verifyJWT, getPendingConsultations);

/**
 * @swagger
 * /api/doctor:
 *   get:
 *     summary: Get all registered doctors
 *     tags: [Doctor]
 *     responses:
 *       200:
 *         description: List of all doctors
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   fullName:
 *                     type: string
 *                   specification:
 *                     type: array
 *                     items:
 *                       type: string
 *                   email:
 *                     type: string
 */
router.get("/", getAllDoctors);

/**
 * @swagger
 * /api/doctor/feedback:
 *   post:
 *     summary: Update doctor's feedback
 *     tags: [Doctor]
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
 *               - feedback
 *             properties:
 *               email:
 *                 type: string
 *               feedback:
 *                 type: string
 *     responses:
 *       200:
 *         description: Feedback updated successfully
 */
router.post("/feedback", doctor_verifyJWT, updateFeedback);

/**
 * @swagger
 * /api/doctor/stats:
 *   get:
 *     summary: Get doctor's statistics
 *     tags: [Doctor]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Doctor statistics retrieved successfully
 */
router.get("/stats", doctor_verifyJWT, getDoctorStats);

/**
 * @swagger
 * /api/doctor/profile:
 *   post:
 *     summary: Update doctor's profile
 *     tags: [Doctor]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               updates:
 *                 type: object
 *                 properties:
 *                   fullName:
 *                     type: string
 *                   email:
 *                     type: string
 *                   specification:
 *                     type: array
 *                     items:
 *                       type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
router.post("/profile", doctor_verifyJWT, updateProfile);

/**
 * @swagger
 * /api/doctor/prescription:
 *   post:
 *     summary: Add a prescription
 *     tags: [Doctor]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - medications
 *             properties:
 *               userId:
 *                 type: string
 *               medications:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       201:
 *         description: Prescription added successfully
 */
router.post("/prescription", doctor_verifyJWT, addPrescription);

/**
 * @swagger
 * /api/doctor/prescriptions:
 *   get:
 *     summary: Get all prescriptions by doctor
 *     tags: [Doctor]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of prescriptions
 */
router.get("/prescriptions", doctor_verifyJWT, getDoctorPrescriptions);

/**
 * @swagger
 * /api/doctor/test-report:
 *   post:
 *     summary: Add a test report
 *     tags: [Doctor]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - testType
 *               - results
 *             properties:
 *               userId:
 *                 type: string
 *               testType:
 *                 type: string
 *               results:
 *                 type: object
 *     responses:
 *       201:
 *         description: Test report added successfully
 */
router.post("/test-report", express.json({ limit: '1000mb' }), doctor_verifyJWT, addTestReport);

/**
 * @swagger
 * /api/doctor/test-reports:
 *   get:
 *     summary: Get all test reports by doctor
 *     tags: [Doctor]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of test reports
 */
router.get("/test-reports", doctor_verifyJWT, getDoctorTestReports);

/**
 * @swagger
 * /api/doctor/diagnosis:
 *   post:
 *     summary: Add a diagnosis
 *     tags: [Doctor]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - condition
 *               - notes
 *             properties:
 *               userId:
 *                 type: string
 *               condition:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Diagnosis added successfully
 */
router.post("/diagnosis", doctor_verifyJWT, addDiagnosis);

/**
 * @swagger
 * /api/doctor/diagnoses:
 *   get:
 *     summary: Get all diagnoses by doctor
 *     tags: [Doctor]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of diagnoses
 */
router.get("/diagnoses", doctor_verifyJWT, getDoctorDiagnoses);

/**
 * @swagger
 * /api/doctor/patients:
 *   get:
 *     summary: Get all patients for a doctor
 *     tags: [Doctor]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of patients
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   fullName:
 *                     type: string
 *                   email:
 *                     type: string
 */
router.get("/patients", doctor_verifyJWT, getPatientsByDoctor);

export default router;