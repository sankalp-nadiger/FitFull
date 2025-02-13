import express from "express";
import {  
    addDevices,  
    selectPrimaryDevices,  
    fetchAndStoreHealthData,  
    AiInsights,  
    addInstructions  
} from "../controllers/wearable.controller.js";  
import { user_VERIFYJWT } from "../middleware/authMiddleware.js"; // Importing the JWT middleware

const router = express.Router();

// Route to fetch available devices from Google Fit
router.get("/devices", user_VERIFYJWT, addDevices);

// Route to select a primary device
router.post("/devices/select", user_VERIFYJWT, selectPrimaryDevices);

// Route to fetch and store health data
router.get("/health-data", user_VERIFYJWT, fetchAndStoreHealthData);

// Route to get AI-based insights on health data
router.get("/ai-insights", user_VERIFYJWT, AiInsights);

// Route to get device-specific instructions
router.post("/device/instructions", user_VERIFYJWT, addInstructions);

export default router;
