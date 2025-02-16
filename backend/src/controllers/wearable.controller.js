import { User } from "../models/user.model.js";
import asyncHandler from "../utils/asynchandler.utils.js";
import {fetchGoogleFitHealthData, getAIInsights, getDeviceInstructions, refreshGoogleAccessToken }  from "../services/googleFitService.js";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;


export const addDevices = asyncHandler(async (req, res) => {
    try {
        const { deviceName } = req.body; // Get device from frontend
        if (!deviceName) return res.status(400).json({ message: "Device name is required" });

        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: "User not found" });

        // Check if device already exists
        const existingDevice = user.devices.find(device => device.model === deviceName);
        if (existingDevice) return res.status(400).json({ message: "Device already added" });

        // Add new device to user's schema
        const newDevice = { model: deviceName, addedAt: new Date() };
        user.devices.push(newDevice);

        // Save user with new device
        await user.save();

        res.json({ success: true, message: "Device added successfully", devices: user.devices });
    } catch (error) {
        console.error("Error adding device:", error);
        res.status(500).json({ message: "Failed to add device" });
    }
});

export const selectPrimaryDevices =asyncHandler(async(req,res)=>{
    const { deviceModel } = req.body; // Example: "Galaxy Watch 4"
    const user = await User.findById(req.user._id);

    if (!user) return res.status(404).json({ message: "User not found" });

    user.selectedDevice = deviceModel; // Save selected device
    await user.save();

    res.json({ success: true, message: "Primary device selected successfully!" });
})
 export const fetchAndStoreHealthData = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }
        let accessToken = await refreshGoogleAccessToken(user._id);
        // Fetch health data from Google Fit
        const healthData = await fetchGoogleFitHealthData(accessToken, user.selectedDevice);

        // Save latest health data to MongoDB
        user.healthData = { ...healthData, lastUpdated: new Date() };
        await user.save();

        return res.json({ success: true, healthData });
    } catch (error) {
        console.error("Error fetching/storing health data:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch health data" });
 }
};
  // AI Insights Controller
  export const AiInsights = async (req, res) => {
    try {
      const user = await User.findById(req.user._id);
      if (!user || !user.healthData) {
        return res.status(400).json({ message: "User data not found" });
      }
      // Call Gemini AI for insights
      const insights = await getAIInsights(user.healthData);
  
      res.json({ success: true, insights });
    } catch (error) {
      console.error("Error in AiInsights:", error.message);
      res.status(500).json({ message: "Internal Server Error" });
    }
  };


export const addInstructions=async(req,res)=>{
    const { deviceName } = req.body;

    const instructions = await getDeviceInstructions(deviceName); // Call Gemini AI
    res.json({ instructions });
}
export const loadDevices = asyncHandler(async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: "User not found" });

        res.json({ success: true, devices: user.devices });
    } catch (error) {
        console.error("Error loading devices:", error);
        res.status(500).json({ message: "Failed to load devices" });
    }
});



