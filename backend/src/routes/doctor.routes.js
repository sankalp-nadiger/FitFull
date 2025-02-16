import express from "express";
import { doctor_verifyJWT, user_verifyJWT, verifyUserOrDoctor } from "../middlewares/auth.middleware.js";
import {
    requestSession,
    acceptSession,
    endSession,
    getActiveSessions,
    addNotesToSession,
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
    getPendingConsultations
} from "../controllers/doctor.controller.js";
// import { sendOTP } from "../controllers/parent.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = express.Router();

// Auth routes
router.post("/register-doctor", upload.fields([{ name: "certificateImage", maxCount: 1 }]), registerDoctor);
//router.post("/send-otp", sendOTP);
router.post("/login", loginDoctor);
router.post("/logout", doctor_verifyJWT, logoutDoctor);

// Session management
router.post("/request", user_verifyJWT, requestSession);
router.post("/:sessionId/join-session", verifyUserOrDoctor, joinSession);
router.post("/accept", doctor_verifyJWT, acceptSession);
router.post("/:sessionId/end", verifyUserOrDoctor, endSession);
router.get("/active", verifyUserOrDoctor, getActiveSessions);
router.post("/notes", user_verifyJWT, addNotesToSession);
router.get("/pending-consultations", doctor_verifyJWT, getPendingConsultations);

// import express from "express";
// import { getAllDoctors } from "../controllers/doctorController.js";

// const router = express.Router();

router.get("/", getAllDoctors); // Get all registered doctors

// Doctor profile and stats
router.post("/feedback", doctor_verifyJWT, updateFeedback);
router.get("/stats", doctor_verifyJWT, getDoctorStats);
router.post("/profile", doctor_verifyJWT, updateProfile);

// Medical records routes
router.post("/prescription", doctor_verifyJWT, addPrescription);
router.get("/prescriptions", doctor_verifyJWT, getDoctorPrescriptions);

router.post("/test-report", upload.fields([{ name: "document", maxCount: 1 }]), doctor_verifyJWT, addTestReport);
router.get("/test-reports", doctor_verifyJWT, getDoctorTestReports);

router.post("/diagnosis", doctor_verifyJWT, addDiagnosis);
router.get("/diagnoses", doctor_verifyJWT, getDoctorDiagnoses);


router.get("/patients", doctor_verifyJWT, getPatientsByDoctor);

export default router;