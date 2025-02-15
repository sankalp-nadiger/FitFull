import {User} from "../models/user.model.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv'
dotenv.config();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
async function fetchGoogleFitHealthData(accessToken, selectedDevice) {
    try {
        const sources = await getGoogleFitDevices(accessToken);
        console.log("Available Sources:", JSON.stringify(sources, null, 2));

        const findSource = (metric) => {
            const foundSource = sources.find(source =>
                source.id.includes(metric) &&
                (selectedDevice ? source.id.includes(selectedDevice) : true)
            );

            if (!foundSource) {
                console.warn(`No source found for ${metric}`);
            }
            return foundSource;
        };

        const stepSource = findSource("com.google.step_count.delta");
        const heartRateSource = findSource("com.google.heart_rate.bpm");
        const sleepSource = findSource("com.google.sleep.segment");
        const caloriesSource = findSource("com.google.calories.expended");

        console.log("Step Source:", stepSource?.id || "Not Found");
        console.log("Heart Rate Source:", heartRateSource?.id || "Not Found");
        console.log("Sleep Source:", sleepSource?.id || "Not Found");
        console.log("Calories Source:", caloriesSource?.id || "Not Found");

        // Fetch health data
        const stepData = stepSource ? await fetchGoogleFitSteps(accessToken, stepSource.id) : { steps: 0 };
        const heartRateData = await fetchGoogleFitHeartRate(accessToken);
        const sleepData = await fetchGoogleFitSleep(accessToken);
        const caloriesData = await fetchGoogleFitCalories(accessToken); // New function to fetch calories

        console.log("Total Steps:", stepData.steps);
        console.log("Heart Rate Data:", heartRateData);
        console.log("Sleep Data:", sleepData);
        console.log("Calories Burned:", caloriesData);

        return { 
            steps: stepData.steps, 
            heartRate: heartRateData.heartRate || 0, 
            sleep: sleepData,
            caloriesBurned: caloriesData.calories || 0 
        };
    } catch (error) {
        console.error("Error fetching Google Fit health data:", error);
        return { steps: 0, heartRate: 0, sleep: 0, caloriesBurned: 0 };
    }
}


async function fetchGoogleFitSteps(accessToken, dataSourceId) {
    if (!dataSourceId) return { steps: 0 };

    const url = "https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate";

    // Get current date & time in IST (UTC+5:30)
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000; // IST offset in milliseconds

    // Get today's date at 12:00 AM IST
    const todayMidnightIST = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const todayMidnightUTC = new Date(todayMidnightIST.getTime() - istOffset);

    // Get current time in IST and convert to UTC
    const currentTimeIST = new Date(now.getTime() + istOffset);
    const currentTimeUTC = new Date(now.getTime()); // Already UTC

    // Convert to milliseconds for Google Fit API
    const startTime = todayMidnightUTC.getTime();
    const endTime = currentTimeUTC.getTime();

    const requestBody = {
        "aggregateBy": [{
            "dataSourceId": dataSourceId,
            "dataTypeName": "com.google.step_count.delta",
        }],
        "bucketByTime": { "durationMillis": 86400000 }, // Aggregate over 1 day
        "startTimeMillis": startTime, // From 12 AM IST (converted to UTC)
        "endTimeMillis": endTime, // Up to current time in IST (converted to UTC)
        "flush": true 
    };

    try {
        console.log("Fetching steps from Google Fit using:", dataSourceId);
        console.log("Start Time (IST):", todayMidnightIST.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }));
        console.log("End Time (IST):", currentTimeIST.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }));
        console.log("Start Time (UTC):", new Date(startTime).toISOString());
        console.log("End Time (UTC):", new Date(endTime).toISOString());

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API Error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log("Google Fit Steps Response:", JSON.stringify(data, null, 2));

        // Extract step count
        let totalSteps = 0;
        if (data?.bucket?.length > 0) {
            data.bucket.forEach(bucket => {
                if (bucket.dataset?.length > 0) {
                    bucket.dataset.forEach(dataset => {
                        if (dataset.point?.length > 0) {
                            dataset.point.forEach(point => {
                                totalSteps += point.value[0]?.intVal || 0;
                            });
                        }
                    });
                }
            });
        }

        console.log("Total Steps (12 AM IST to Current Time IST):", totalSteps);
        return { steps: totalSteps };

    } catch (error) {
        console.error("Error fetching Google Fit step data:", error);
        return { steps: 0 };
    }
}





async function fetchGoogleFitHeartRate(accessToken) {
    const url = "https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate";

    // Get current date in IST
    const now = new Date();
    const nowIST = now.getTime(); // Current time in IST

    // Get 12 AM IST of the current day
    const todayMidnightIST = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0).getTime();

    const requestBody = {
        "aggregateBy": [{ "dataTypeName": "com.google.heart_rate.bpm" }],
        "bucketByTime": { "durationMillis": 60000 }, // 1-minute intervals
        "startTimeMillis": todayMidnightIST, // From 12 AM IST today
        "endTimeMillis": nowIST, // Up to now (IST)
        "flush": true // Force fresh data from Google Fit
    };

    try {
        console.log("Fetching today's heart rate data from Google Fit...");

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API Error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log("Google Fit Heart Rate Response:", JSON.stringify(data, null, 2));

        // Extract the latest heart rate value of today
        let latestHeartRate = 0;
        let latestTimestamp = null;

        if (data?.bucket?.length > 0) {
            data.bucket.forEach(bucket => {
                if (bucket.dataset?.length > 0) {
                    bucket.dataset.forEach(dataset => {
                        dataset.point.forEach(point => {
                            if (point.value?.[0]?.fpVal !== undefined) {
                                latestHeartRate = point.value[0]?.fpVal;
                                latestTimestamp = new Date(point.endTimeNanos / 1000000).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
                            }
                        });
                    });
                }
            });
        }

        console.log(`Latest Heart Rate Today (IST): ${latestHeartRate} BPM at ${latestTimestamp}`);
        return { heartRate: latestHeartRate, timestamp: latestTimestamp };

    } catch (error) {
        console.error("Error fetching Google Fit heart rate data:", error);
        return { heartRate: 0, timestamp: null };
    }
}


async function fetchGoogleFitSleep(accessToken) {
    const url = "https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate";

    // Get start time as 12 AM IST today
    const now = new Date();
    const todayMidnightIST = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0).getTime();
    const nowIST = now.getTime(); // Current time in IST

    const requestBody = {
        "aggregateBy": [{ "dataTypeName": "com.google.sleep.segment" }],
        "bucketByTime": { "durationMillis": 86400000 }, // Aggregate daily
        "startTimeMillis": todayMidnightIST, // From 12 AM IST today
        "endTimeMillis": nowIST, // Up to now
        "flush": true // Force fresh data from Google Fit
    };

    try {
        console.log("Fetching sleep data from Google Fit...");

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API Error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log("Google Fit Sleep Response:", JSON.stringify(data, null, 2));

        let totalSleepDuration = 0; // Total sleep duration in minutes

        if (data?.bucket?.length > 0) {
            data.bucket.forEach(bucket => {
                if (bucket.dataset?.length > 0) {
                    bucket.dataset.forEach(dataset => {
                        dataset.point.forEach(point => {
                            if (point.value?.[0]?.intVal !== undefined) {
                                const startTime = point.startTimeNanos / 1000000;
                                const endTime = point.endTimeNanos / 1000000;
                                const duration = (endTime - startTime) / (1000 * 60); // Convert to minutes
                                totalSleepDuration += duration;
                            }
                        });
                    });
                }
            });
        }

        console.log(`Total Sleep Duration (Minutes): ${totalSleepDuration}`);
        return totalSleepDuration; // ✅ Return only a `Number`, not an object

    } catch (error) {
        console.error("Error fetching Google Fit sleep data:", error);
        return 0; // ✅ Return `0` (not `{ sleep: 0 }`)
    }
}

async function fetchGoogleFitCalories(accessToken) {
    const url = "https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate";

    // Get start time as 12 AM IST today
    const now = new Date();
    const todayMidnightIST = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0).getTime();
    const nowIST = now.getTime(); // Current time in IST

    const requestBody = {
        "aggregateBy": [{ "dataTypeName": "com.google.calories.expended" }],
        "bucketByTime": { "durationMillis": 86400000 }, // Aggregate daily
        "startTimeMillis": todayMidnightIST, // From 12 AM IST today
        "endTimeMillis": nowIST, // Up to now
        "flush": true // Force fresh data from Google Fit
    };

    try {
        console.log("Fetching calories data from Google Fit...");

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API Error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log("Google Fit Calories Response:", JSON.stringify(data, null, 2));

        let totalCalories = 0;
        if (data?.bucket?.length > 0) {
            data.bucket.forEach(bucket => {
                if (bucket.dataset?.length > 0) {
                    bucket.dataset.forEach(dataset => {
                        dataset.point.forEach(point => {
                            if (point.value?.[0]?.fpVal !== undefined) {
                                totalCalories += point.value[0].fpVal; // Get the total calories burned
                            }
                        });
                    });
                }
            });
        }

        console.log(`Total Calories Burned: ${totalCalories}`);
        return { calories: totalCalories }; // Return just the calorie value
    } catch (error) {
        console.error("Error fetching Google Fit calorie data:", error);
        return { calories: 0 };
    }
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
  
      return suggestions;
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

const getGoogleFitDevices = async (accessToken) => {
    try {
        const response = await fetch("https://www.googleapis.com/fitness/v1/users/me/dataSources", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error(`Error fetching data: ${response.statusText}`);
        }

        const rawResponse = await response.json();

        if (!rawResponse || !rawResponse.dataSource) {
            throw new Error("Invalid Google Fit response");
        }

        // Define relevant metrics to extract
        const relevantMetrics = [
            "step_count.delta",
            "calories.expended",
            "heart_minutes",
            "active_minutes"
        ];

        // Filter the required data streams
        const filteredStreams = rawResponse.dataSource.filter(stream => 
            relevantMetrics.some(metric => stream.dataStreamId.includes(metric))
        );

        // Extract formatted data
        const formattedData = filteredStreams.map(stream => ({
            id: stream.dataStreamId,
            name: stream.dataStreamName,
            type: stream.type
        }));

        console.log("Filtered Google Fit Data Streams:", formattedData);
        return formattedData;
    } catch (error) {
        console.error("Error fetching Google Fit data:", error);
        return [];
    }
};

export {fetchGoogleFitHealthData, getAIInsights, getDeviceInstructions}