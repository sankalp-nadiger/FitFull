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
    if (!accessToken) return { steps: 0 };

    const url = "https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate";

    // Calculate today's midnight and end of day in IST
    const now = new Date();
    const todayMidnightIST = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const endOfDayIST = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    const requestBody = {
        "aggregateBy": [{
            "dataTypeName": "com.google.step_count.delta"
        }],
        "bucketByTime": { "durationMillis": 86400000 }, // 24 hours
        "startTimeMillis": todayMidnightIST.getTime(),
        "endTimeMillis": endOfDayIST.getTime(),
        "flush": true 
    };

    try {
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
            console.error("Google Fit API Error:", errorText);
            throw new Error(`API Error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log("Step data response:", JSON.stringify(data, null, 2));

        let totalSteps = 0;
        if (data.bucket && data.bucket.length > 0) {
            data.bucket.forEach(bucket => {
                bucket.dataset.forEach(dataset => {
                    dataset.point.forEach(point => {
                        if (point.value && point.value.length > 0) {
                            totalSteps += Number(point.value[0].intVal || 0);
                        }
                    });
                });
            });
        }

        console.log("Total steps calculated:", totalSteps);
        return { steps: totalSteps };

    } catch (error) {
        console.error("Error fetching Google Fit step data:", error);
        return { steps: 0, error: error.message };
    }
}
async function fetchGoogleFitHeartRate(accessToken) {
    const url = "https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate";
    const now = new Date();
    const todayMidnightIST = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0).getTime();
    const endOfDayIST = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).getTime();

    const requestBody = {
        "aggregateBy": [{ "dataTypeName": "com.google.heart_rate.bpm" }],
        "bucketByTime": { "durationMillis": 60000 },
        "startTimeMillis": todayMidnightIST,
        "endTimeMillis": endOfDayIST,
        "flush": true 
    };

    try {
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

        return { heartRate: latestHeartRate, timestamp: latestTimestamp };

    } catch (error) {
        return { heartRate: 0, timestamp: null };
    }
}

async function fetchGoogleFitSleep(accessToken) {
    const url = "https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate";
    const now = new Date();
    const todayMidnightIST = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0).getTime();
    const endOfDayIST = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).getTime();

    const requestBody = {
        "aggregateBy": [{ "dataTypeName": "com.google.sleep.segment" }],
        "bucketByTime": { "durationMillis": 86400000 },
        "startTimeMillis": todayMidnightIST,
        "endTimeMillis": endOfDayIST,
        "flush": true 
    };

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            return 0;
        }

        const data = await response.json();

        let totalSleepDuration = 0;

        if (data?.bucket?.length > 0) {
            data.bucket.forEach(bucket => {
                if (bucket.dataset?.length > 0) {
                    bucket.dataset.forEach(dataset => {
                        dataset.point.forEach(point => {
                            if (point.value?.[0]?.intVal !== undefined) {
                                const startTime = point.startTimeNanos / 1000000;
                                const endTime = point.endTimeNanos / 1000000;
                                totalSleepDuration += (endTime - startTime) / (1000 * 60);
                            }
                        });
                    });
                }
            });
        }

        return totalSleepDuration;

    } catch (error) {
        return 0;
    }
}

async function fetchGoogleFitCalories(accessToken) {
    const url = "https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate";

    const now = new Date();
    const todayMidnightIST = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0).getTime();
    const endOfDayIST = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).getTime();

    const requestBody = {
        "aggregateBy": [{ "dataTypeName": "com.google.calories.expended" }],
        "bucketByTime": { "durationMillis": 86400000 },
        "startTimeMillis": todayMidnightIST,
        "endTimeMillis": endOfDayIST,
        "flush": true 
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
                                totalCalories += point.value[0].fpVal;
                            }
                        });
                    });
                }
            });
        }

        console.log(`Total Calories Burned: ${totalCalories}`);
        return { totalCalories };
    } catch (error) {
        console.error("Error fetching Google Fit calorie data:", error);
        return { calories: 0 };
    }
}

async function getAIInsights(healthData) {
    try {
        const prompt = `
            Based on the following health data:
            - Steps: ${healthData.steps}
            - Heart Rate: ${healthData.heartRate}
            - Sleep Hours: ${healthData.sleep}

            Generate a personalized health recommendation.
        `;

        // ✅ Correct API Call
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
                contents: [{ role: "user", parts: [{ text: prompt }] }],
            }
        );

        console.log("Gemini API Response:", response.data);

        // ✅ Extract the response text
        const aiSuggestions =
            response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response from AI";

        return aiSuggestions; // Return the result

    } catch (error) {
        console.error("Error generating AI suggestions:", error.response?.data || error.message);
        return "Error generating AI suggestions";
    }
}

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