import { User } from "../models/user.model.js";
import asyncHandler from "../utils/asynchandler.utils.js";
import {fetchGoogleFitHealthData, getAIInsights, getDeviceInstructions, refreshGoogleAccessToken }  from "../services/googleFitService.js";

export const addDevices = asyncHandler(async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: "User not found" });
        let accessToken = await refreshGoogleAccessToken(user._id);
        const sources = await getGoogleFitDevices(accessToken);
        res.json({ success: true, devices: sources });
    } catch (error) {
        console.error("Error fetching devices:", error);
        res.status(500).json({ message: "Failed to fetch devices" });
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
export const AiInsights=async(req,res)=>{
    const user = await User.findById(req.user._id);
    if (!user || !user.healthData) {
        return res.status(400).json({ message: "User data not found" });
    }

    // Call Gemini AI (or your ML model) with the latest health data
    const insights = await getAIInsights(user.healthData);

    res.json({ success: true, insights})
}
export const addInstructions=async(req,res)=>{
    const { deviceName } = req.body;

    const instructions = await getDeviceInstructions(deviceName); // Call Gemini AI
    res.json({ instructions });
}


