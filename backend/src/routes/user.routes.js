import express from "express";
import { user_verifyJWT } from "../middlewares/auth.middleware.js";
import {
  registerUser,
  loginUser,
  addFamilyMembers,
  removeFamilyMember,
  getFamilyMembers,
  getUserPrescriptions,
  getUserTestReports,
  getUserDiagnoses,
} from "../controllers/user.controller.js";

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected routes - Require JWT authentication
router.post("/family/add", user_verifyJWT, addFamilyMembers);
router.delete("/family/remove", user_verifyJWT, removeFamilyMember);
router.get("/family", user_verifyJWT, getFamilyMembers);

router.get("/prescriptions", user_verifyJWT, getUserPrescriptions);
router.get("/test-reports", user_verifyJWT, getUserTestReports);
router.get("/diagnoses", user_verifyJWT, getUserDiagnoses);

export default router;
