import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import axios from 'axios';
//import queryString from 'querystring';  
import { google } from 'googleapis'; 
import { User } from './models/user.model.js';
import dotenv, { configDotenv } from 'dotenv';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import { getRandomActivity } from "./controllers/user.controller.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
dotenv.config();

// Router imports
import userRouter from './routes/user.routes.js';
//import resourceRouter from "./routes/resource.routes.js";
//import activityRouter from "./routes/activity.routes.js";
 import communityRouter from "./routes/community.routes.js";
import doctorRouter from "./routes/doctor.routes.js";
// import dm_chatRouter from "./routes/dm_chat.routes.js";
// import journalRouter from "./routes/journal.routes.js";
// import storyRouter from "./routes/story.routes.js";
// import postsRouter from "./routes/posts.routes.js";
// import recomendations from "./routes/recommendations.route.js";
import wearableRouter from "./routes/wearable.routes.js" 
import healthRouter from "./routes/healthData.routes.js";
import ocrRouter from "./routes/ocr.routes.js";
const app = express();

// Middleware
app.use(cors({
  origin: ["http://localhost:5173", "https://fitfull.netlify.app", "https://carefull.netlify.app"],
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
}));

app.use(express.json({ limit: "1000mb" }));
app.use(express.urlencoded({ extended: true, limit: "1000mb" }));
app.use(express.static("public"));
app.use(cookieParser());
const upload = multer();
app.use(upload.none()); 
const SPOTIFY_CLIENT_ID = 'YOUR_SPOTIFY_CLIENT_ID';
const SPOTIFY_CLIENT_SECRET = 'YOUR_SPOTIFY_CLIENT_SECRET';
const SPOTIFY_REDIRECT_URI = 'http://localhost:5173/loading';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta1/models/gemini-1.5-pro:generateContent?key=${GEMINI_API_KEY}`;
// Routes
app.use("/api/users", userRouter);
// app.use("/api/resources", resourceRouter);
// app.use("/api/journals", journalRouter);
// app.use("/api/activity", activityRouter);
 app.use("/api/community", communityRouter);
app.use("/api/doctor", doctorRouter);
// app.use("/api/dm_chat", dm_chatRouter);
// //app.use("/api/parent", parentRouter);
// app.use("/api/story", storyRouter);
// app.use("/api/post", postsRouter);
// app.use("/api/recommendations", recomendations);
app.use("/api/health", healthRouter);
app.use("/api/wearables",wearableRouter)
app.use("/api/ocr",ocrRouter);


const signupOAuthClient = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.SIGNUP_REDIRECT_URI
);
const loginOAuthClient = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.LOGIN_REDIRECT_URI
);
// Route to Start Google OAuth
  app.get("/auth/google-url", (req, res) => {
    const oauth2Client = signupOAuthClient;
    const url = oauth2Client.generateAuthUrl({
        access_type: "offline",
        prompt: "consent",
        scope: [
          "https://www.googleapis.com/auth/calendar", // Added Calendar scope
          "https://www.googleapis.com/auth/fitness.activity.read",
          "https://www.googleapis.com/auth/userinfo.profile",
          "https://www.googleapis.com/auth/userinfo.email",
          "https://www.googleapis.com/auth/fitness.heart_rate.read",
          "https://www.googleapis.com/auth/fitness.sleep.read"
        ],
      });
  
    res.json({url});
  });


  app.post('/analyze', async (req, res) => {
    try {
      const { text } = req.body;
      const prompt = `Analyze this medical test report and give:
  1. Bullet point insights.
  2. A spoken summary.
  
  Report:
  ${text}`;
  
      const response = await axios.post(
        GEMINI_ENDPOINT,
        {
          contents: [{ parts: [{ text: prompt }] }],
        },
        { headers: { 'Content-Type': 'application/json' } }
      );
  
      const resultText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response';
      res.json({ result: resultText });
    } catch (error) {
      console.error('Gemini API error:', error.message);
      res.status(500).json({ error: 'Failed to fetch Gemini insights' });
    }
  });


  
  //CHATBOT

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  app.post("/api/chat", async (req, res) => {
    try {
        const { message, systemPrompt } = req.body;
        console.log("User message:", message);
        console.log("System prompt:", systemPrompt);

        if (!message) {
            return res.status(400).json({ error: "Message is required" });
        }

        const prompt = systemPrompt ? `${systemPrompt}\n\nUser: ${message}` : message;

        const result = await model.generateContent(prompt);

        console.log("Gemini Raw Response:", JSON.stringify(result, null, 2));

        const botResponse = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!botResponse) {
            return res.status(500).json({ error: "No valid response from Gemini" });
        }

        res.json({ botResponse });

    } catch (error) {
        console.error("Detailed error:", {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });

        res.status(500).json({ 
            error: "Internal Server Error", 
            details: error.message 
        });
    }
});

  // Route to Handle Google OAuth Callback
  app.post("/auth/google/callback", async (req, res) => {
    const { code } = req.body;
    console.log('Received code:', code);

    if (!code) {
        return res.status(400).json({ 
            success: false, 
            message: "No authorization code provided" 
        });
    }
    const oauth2Client = signupOAuthClient;
    try {
        // Exchange code for tokens with correct parameters
        const { tokens } = await oauth2Client.getToken({
            code: code,
            redirect_uri: oauth2Client.redirectUri  // This is crucial
        });
        
        console.log('Token exchange successful');
        oauth2Client.setCredentials(tokens);

        // Get user info from Google
        const oauth2 = google.oauth2({ 
            version: "v2", 
            auth: oauth2Client 
        });
        const { data: googleUser } = await oauth2.userinfo.get();

        // Store user info in database
        let user = await User.findOne({ email: googleUser.email });
        if (user) {
            return res.status(409).json({  // 409 Conflict for already existing user
                success: false,
                message: "User already exists. Please sign in instead."
            });
        }

        if (!user) {
            user = new User({
                fullName: `${googleUser.given_name} ${googleUser.family_name}`,
                email: googleUser.email,
                avatar: googleUser.picture,
                googleId: googleUser.id,
                authProvider: "google",
                username: googleUser.email.split('@')[0] + "_" + Math.floor(Math.random() * 10000),
                tokens: { 
                    googleFitToken: tokens.access_token,
                    googleFitTokenExpiry: new Date(tokens.expiry_date),
                    refreshToken: tokens.refresh_token  // Store refresh token if available
                },
            });
            await user.save();
        } else {
            // Update existing user's tokens
            user.tokens = { 
                googleFitToken: tokens.access_token,
                refreshToken: tokens.refresh_token
            };
            await user.save();
        }
        const activity= getRandomActivity();
        const jwtToken = jwt.sign(
            { userId: user._id }, 
            process.env.ACCESS_TOKEN_SECRET, 
            { expiresIn: "7d" }
        );
        console.log(jwtToken);
        res.json({ 
            success: true, 
            jwt: jwtToken, 
            user: {
                id: user._id,
                email: user.email,
                fullName: user.fullName,
                avatar: user.avatar,
                suggestedActivity: activity
            } 
        });

    } catch (error) {
        console.error("Google OAuth Error:", error);
        console.error("Error details:", {
            message: error.message,
            response: error.response?.data
        });
        
        res.status(500).json({ 
            success: false, 
            message: "Google authentication failed",
            error: error.message 
        });
    }
});


app.get("/auth/login-google", async (req, res) => {
  // Generate Google OAuth URL for fresh token each time
  const oauth2Client = loginOAuthClient;
  const authUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: ["https://www.googleapis.com/auth/fitness.activity.read",
        "https://www.googleapis.com/auth/calendar",
        'https://www.googleapis.com/auth/userinfo.email',
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/fitness.activity.read",
        "https://www.googleapis.com/auth/fitness.heart_rate.read",
        "https://www.googleapis.com/auth/fitness.sleep.read"
      ],
      prompt: "consent",
  });

  res.json({ url: authUrl });
});

app.post("/auth/google/check-login", async (req, res) => {
    const { code } = req.body;
    console.log("Attempting token exchange with code:", code);
    
    if (!code) {
      return res.status(400).json({ success: false, message: "No authorization code provided" });
    }
    
    const oauth2Client = loginOAuthClient;
    try {
      // Exchange code for tokens
      console.log("Exchanging code for tokens...");
      const { tokens } = await oauth2Client.getToken(code);
        console.log("Token exchange successful:", tokens);
      console.log("Tokens received:", {
        access_token_exists: !!tokens.access_token,
        refresh_token_exists: !!tokens.refresh_token,
        expiry_date_exists: !!tokens.expiry_date
      });

      oauth2Client.setCredentials(tokens);
  
      // Get user info from Google
      const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
      const { data: googleUser } = await oauth2.userinfo.get();
      console.log("Google user info retrieved:", googleUser.email);
  
      // Check if user exists in the database
      let user = await User.findOne({ email: googleUser.email });
  
      if (!user) {
        return res.status(404).json({ success: false, message: "User does not exist. Please sign up first." });
      }
      
      console.log("User found in database with ID:", user._id);
      
      // Make sure the tokens object exists
      if (!user.tokens) {
        user.tokens = {};
      }
      
      // Update access & refresh tokens with proper validation
      user.tokens.googleFitToken = tokens.access_token;
      const freshUser = await User.findById(user._id);
console.log("Verified tokens after save:", freshUser.tokens);
      // Safely handle the expiry date
      if (tokens.expires_in && !isNaN(tokens.expires_in)) {
        user.tokens.googleFitTokenExpiry = new Date(Date.now() + (tokens.expires_in * 1000));
      } else if (tokens.expiry_date) {
        user.tokens.googleFitTokenExpiry = new Date(tokens.expiry_date);
      } else {
        user.tokens.googleFitTokenExpiry = new Date(Date.now() + (3600 * 1000));
      }
      
      // Only update refresh token if a new one is provided
      if (tokens.refresh_token) {
        freshUser.tokens.refreshToken = tokens.refresh_token;
      }
      console.log(user.tokens.refreshToken)
      console.log(!!tokens.refresh_token);
      await freshUser.save();
      
      const activity = getRandomActivity();
      
      // Generate JWT for the existing user
      const jwtToken = jwt.sign(
        { _id: user._id },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "7d" }
      );
      
      // Set the JWT as accessToken cookie
      res.cookie('accessToken', jwtToken, {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
        httpOnly: true, // Prevents JavaScript from reading the cookie
        secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in production
        sameSite: 'strict' // Prevents CSRF attacks
      });
      
      console.log("JWT cookie set successfully as 'accessToken'");
      res.json({ success: true, user, suggestedActivity: activity });
  
    } catch (error) {
      console.error("Google OAuth Error:", error);
      console.error("Error details:", error.message);
      if (error.response && error.response.data) {
        console.error("Response data:", error.response.data);
      }
      
      return res.status(401).json({ 
        success: false, 
        message: "Google authentication failed", 
        error: error.message,
        details: error.response?.data || "Unknown error"
      });
    }
  });

app.post('/auth/spotify', async (req, res) => {
    const state = Math.random().toString(36).substring(7);  // Random state string for security
    const scope = 'playlist-read-private user-library-read';
    const authUrl = `https://accounts.spotify.com/authorize?` +
                    `client_id=${SPOTIFY_CLIENT_ID}&` +
                    `response_type=code&` +
                    `redirect_uri=${encodeURIComponent(SPOTIFY_REDIRECT_URI)}&` +
                    `scope=${encodeURIComponent(scope)}&` +
                    `state=${state}`;
  
    // Redirects user to Spotify's login page
    res.redirect(authUrl);
  });
  
//   app.get('/auth/spotify/callback', async (req, res) => {
//     const { code } = req.query;

//     if (!code) {
//         return res.redirect('http://localhost:5173/error?message=No+authorization+code+received');
//     }

//     res.redirect(`http://localhost:5173/loading?code=${code}`);
// });

app.post('/auth/spotify/exchange-token', async (req, res) => {
    const { code } = req.body;
  
    if (!code) {
        return res.json({ success: false, message: "No authorization code provided" });
    }

    try {
        // Exchange authorization code for access/refresh tokens
        const response = await axios.post('https://accounts.spotify.com/api/token', querystring.stringify({
            code,
            redirect_uri: 'http://localhost:5000/auth/spotify/callback',
            grant_type: 'authorization_code',
            client_id: 'YOUR_SPOTIFY_CLIENT_ID',
            client_secret: 'YOUR_SPOTIFY_CLIENT_SECRET',
        }), { headers: { "Content-Type": "application/x-www-form-urlencoded" } });

        const { access_token, refresh_token } = response.data;

        // Store in database
        const user = await User.findOne({ email: req.user.email });
        if (user) {
            user.spotifyAccessToken = access_token;
            user.spotifyRefreshToken = refresh_token;
            await user.save();
        }

        res.json({ success: true });
    } catch (error) {
        console.error("Spotify token exchange failed:", error);
        res.json({ success: false, message: "Failed to exchange token" });
    }
});


// Start Server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;