import express from "express";
import {  
    addDevices,  
    selectPrimaryDevices,  
    fetchAndStoreHealthData,  
    AiInsights,  
    addInstructions  
} from "../controllers/wearable.controller.js";  
import { user_verifyJWT } from "../middlewares/auth.middleware.js"; // Importing the JWT middleware

const router = express.Router();

// Route to fetch available devices from Google Fit
router.get("/devices", user_verifyJWT, addDevices);

// Route to select a primary device
router.post("/devices/select", user_verifyJWT, selectPrimaryDevices);

// Route to fetch and store health data
router.get("/health-data", user_verifyJWT, fetchAndStoreHealthData);

// Route to get AI-based insights on health data
router.get("/ai-insights", user_verifyJWT, AiInsights);

// Route to get device-specific instructions
router.post("/device/instructions", user_verifyJWT, addInstructions);

export default router;
