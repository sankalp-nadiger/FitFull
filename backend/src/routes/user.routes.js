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
  //getCurrentUser,
  // getUsers
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { endSession, joinSession } from "../controllers/doctor.controller.js";
const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);
// Protected routes - Require JWT authentication
router.post("/family/add", user_verifyJWT, addFamilyMembers);
router.delete("/family/remove", user_verifyJWT, removeFamilyMember);
router.get("/family", user_verifyJWT, getFamilyMembers);
router.post("/addReport",  upload.single("document"), user_verifyJWT, saveTestReport);
router.post('/addPresc', user_verifyJWT, savePrescription);
router.post('/addDiagnosis', user_verifyJWT, addDiagnosisReport);
router.get("/prescriptions", user_verifyJWT, getPrescription);
router.get("/test-reports", user_verifyJWT, getTestReport);
router.get("/diagnoses", user_verifyJWT, getDiagnosisReport);
router.post("/famReport", user_verifyJWT, getFamilyTest);
router.post("/famPresc", user_verifyJWT, getFamPresc);
router.post("/famDiagnosis", user_verifyJWT, getFamDiag);
router.post("/join-session", user_verifyJWT, joinSession);
router.post("/end", user_verifyJWT, endSession);
//router.get("/current", user_verifyJWT, getCurrentUser); 


export default router;