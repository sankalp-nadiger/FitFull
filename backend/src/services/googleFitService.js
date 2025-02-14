import {User} from "../models/user.model.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
dotenv.config();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
async function fetchGoogleFitHealthData(accessToken, selectedDevice) {
    const sources = await getGoogleFitDevices(accessToken);
    
    // Find data sources for selected device
    const stepSource = sources.find(source => 
        source.device?.model === selectedDevice && 
        source.dataType?.name === "com.google.step_count.delta"
    );

    const heartRateSource = sources.find(source => 
        source.device?.model === selectedDevice && 
        source.dataType?.name === "com.google.heart_rate.bpm"
    );

    const sleepSource = sources.find(source => 
        source.device?.model === selectedDevice && 
        source.dataType?.name === "com.google.sleep.segment"
    );

    // Fetch health data
    const steps = await fetchGoogleFitSteps(accessToken, stepSource?.dataSourceId);
    const heartRate = await fetchGoogleFitHeartRate(accessToken, heartRateSource?.dataSourceId);
    const sleep = await fetchGoogleFitSleep(accessToken, sleepSource?.dataSourceId);

    return { steps, heartRate, sleep };
}

async function fetchGoogleFitSteps(accessToken, dataSourceId) {
    if (!dataSourceId) return 0;
    const url = `https://www.googleapis.com/fitness/v1/users/me/dataSources/${dataSourceId}/datasets`;

    const response = await fetch(url, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${accessToken}`,
        },
    });

    const data = await response.json();

    // Extract step data from the response
    if (data && data.bucket) {
        // You can adjust this based on the structure of data returned
        return data.bucket.map(bucket => ({
            startTime: bucket.startTimeMillis,
            endTime: bucket.endTimeMillis,
            steps: bucket.dataset[0]?.point[0]?.value[0]?.intVal || 0, // Get steps count
        }));
    }

    return [];
}

async function fetchGoogleFitHeartRate(accessToken, dataSourceId) {
    if (!dataSourceId) return 0;
    const url = `https://www.googleapis.com/fitness/v1/users/me/dataSources/${dataSourceId}/datasets`;

    const response = await fetch(url, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${accessToken}`,
        },
    });

    const data = await response.json();

    // Extract heart rate data from the response
    if (data && data.bucket) {
        return data.bucket.map(bucket => ({
            startTime: bucket.startTimeMillis,
            endTime: bucket.endTimeMillis,
            heartRate: bucket.dataset[0]?.point[0]?.value[0]?.fpVal || 0, // Get heart rate value
        }));
    }

    return [];
}

async function fetchGoogleFitSleep(accessToken, dataSourceId) {
    if (!dataSourceId) return 0; // No data source found

    const url = `https://www.googleapis.com/fitness/v1/users/me/dataSources/${dataSourceId}/datasets`;
    const response = await fetch(url, {
        method: "GET",
        headers: { "Authorization": `Bearer ${accessToken}` }
    });

    const data = await response.json();
    return data.bucket?.[0]?.dataset?.[0]?.point?.[0]?.value?.[0]?.intVal || 0;
}

async function getAIInsights(healthData) {
    try{
    const prompt = `
        Based on the following health data:
        Steps: ${healthData.steps}
        Heart Rate: ${healthData.heartRate}
        Sleep Hours: ${healthData.sleep}

        Generate a personalized health recommendation.
    `;
    
    // Generate content using the model
    const result = await model.generateContent(prompt);

    // Extract the text (which may be a function or a string)
    let aiSuggestions = result.response.text;
    if (typeof aiSuggestions === "function") {
        aiSuggestions = aiSuggestions();
      }
  
      // If it's a string, split it into individual topics and rejoin them as a single string
      const suggestions = typeof aiSuggestions === "string" 
        ? aiSuggestions.split("\n").filter(Boolean).join("\n") 
        : "";
  
      //console.log(suggestions); // Debugging
  
      res.status(200).json({
        message: "AI suggestions generated successfully",
        suggestions, // Send as string now
      });
    } catch (error) {
      console.error("Error generating AI suggestions:", error);
      res.status(500).json({ message: "Error generating AI suggestions", error: error.message });
    }
  };

async function getDeviceInstructions(deviceName) {
    try{
    const prompt = `How do I connect a ${deviceName} to Google Fit? Give me step by step instructions.`;
    
    const result = await model.generateContent(prompt);

    // Extract the text (which may be a function or a string)
    let aiSuggestions = result.response.text;
    if (typeof aiSuggestions === "function") {
        aiSuggestions = aiSuggestions();
      }
  
      // If it's a string, split it into individual topics and rejoin them as a single string
      const suggestions = typeof aiSuggestions === "string" 
        ? aiSuggestions.split("\n").filter(Boolean).join("\n") 
        : "";
  
      //console.log(suggestions); // Debugging
  
      res.status(200).json({
        message: "AI suggestions generated successfully",
        suggestions, // Send as string now
      });
    } catch (error) {
      console.error("Error generating AI suggestions:", error);
      res.status(500).json({ message: "Error generating AI suggestions", error: error.message });
    }
  };

export const refreshGoogleAccessToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) throw new Error("User not found.");

        // ✅ If token is still valid, return it
        if (user.tokens.googleFitToken && user.tokens.googleFitTokenExpiry > Date.now()) {
            return user.tokens.googleFitToken;
        }

        // 🔄 Otherwise, refresh using the refresh token
        if (!user.tokens.refreshToken) {
            throw new Error("No refresh token available.");
        }

        const oauth2Client = signupOAuthClient;
        oauth2Client.setCredentials({ refresh_token: user.tokens.refreshToken });

        const { credentials } = await oauth2Client.refreshAccessToken();

        user.tokens.googleFitToken = credentials.access_token;
        user.tokens.googleFitTokenExpiry = new Date(credentials.expiry_date);
        await user.save();

        return credentials.access_token;
    } catch (error) {
        console.error("Error refreshing Google access token:", error);
        throw new Error("Failed to refresh access token.");
    }
};

async function getGoogleFitDevices(accessToken) {
    const response = await fetch("https://www.googleapis.com/fitness/v1/users/me/dataSources", {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    const dataSources = await response.json();
    console.log(dataSources);
    return dataSources;
}

export {fetchGoogleFitHealthData, getAIInsights, getDeviceInstructions}