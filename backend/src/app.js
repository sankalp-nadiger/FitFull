import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import axios from 'axios';
//import queryString from 'querystring';  
import { google } from 'googleapis'; 
import { User } from './models/user.model.js';
import dotenv, { configDotenv } from 'dotenv';
import jwt from 'jsonwebtoken';
dotenv.config();

// Router imports
import userRouter from './routes/user.routes.js';
//import resourceRouter from "./routes/resource.routes.js";
//import activityRouter from "./routes/activity.routes.js";
// import communityRouter from "./routes/community.routes.js";
// import doctorRouter from "./routes/doctor.routes.js";
// import dm_chatRouter from "./routes/dm_chat.routes.js";
// import journalRouter from "./routes/journal.routes.js";
// import storyRouter from "./routes/story.routes.js";
// import postsRouter from "./routes/posts.routes.js";
// import recomendations from "./routes/recommendations.route.js";

const app = express();
const router = express.Router();
// Middleware
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
}));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

const SPOTIFY_CLIENT_ID = 'YOUR_SPOTIFY_CLIENT_ID';
const SPOTIFY_CLIENT_SECRET = 'YOUR_SPOTIFY_CLIENT_SECRET';
const SPOTIFY_REDIRECT_URI = 'http://localhost:5173/loading';

// Routes
app.use("/api/users", userRouter);
// app.use("/api/resources", resourceRouter);
// app.use("/api/journals", journalRouter);
// app.use("/api/activity", activityRouter);
// app.use("/api/community", communityRouter);  // Community Chat Route
// app.use("/api/doctor", doctorRouter);
// app.use("/api/dm_chat", dm_chatRouter);
// //app.use("/api/parent", parentRouter);
// app.use("/api/story", storyRouter);
// app.use("/api/post", postsRouter);
// app.use("/api/recommendations", recomendations);

const SIGNUP_REDIRECT_URI = "http://localhost:5173/up-loading";
const LOGIN_REDIRECT_URI = "http://localhost:5173/in-loading";

const signupOAuthClient = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    SIGNUP_REDIRECT_URI
);

const loginOAuthClient = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    LOGIN_REDIRECT_URI
);
  
  // Route to Start Google OAuth
  app.get("/auth/google-url", (req, res) => {
    const oauth2Client = signupOAuthClient;
    const url = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: ["https://www.googleapis.com/auth/fitness.activity.read",
        'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email',
      ],
    });
  
    res.json({url});
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

        const jwtToken = jwt.sign(
            { userId: user._id }, 
            process.env.ACCESS_TOKEN_SECRET, 
            { expiresIn: "7d" }
        );

        res.json({ 
            success: true, 
            jwt: jwtToken, 
            user: {
                id: user._id,
                email: user.email,
                fullName: user.fullName,
                avatar: user.avatar
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
        'https://www.googleapis.com/auth/userinfo.email',
        "https://www.googleapis.com/auth/userinfo.profile" 
      ],
      prompt: "consent",
  });

  res.json({ url: authUrl });
});

app.post("/auth/google/check-login", async (req, res) => {
  const { code } = req.body;
    console.log(code)
  if (!code) {
      return res.status(400).json({ success: false, message: "No authorization code provided" });
  }
  const oauth2Client = loginOAuthClient;
  try {
      // Exchange code for tokens
      const { tokens } = await oauth2Client.getToken(code);
      oauth2Client.setCredentials(tokens);

      // Get user info from Google
      const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
      const { data: googleUser } = await oauth2.userinfo.get();

      // Check if user exists in the database
      let user = await User.findOne({ email: googleUser.email });

      if (!user) {
          return res.status(404).json({ success: false, message: "User does not exist. Please sign up first." });
      }
      if (user) {
        // Update access & refresh tokens
        user.tokens.googleFitToken = tokens.access_token;
        user.tokens.googleFitTokenExpiry = Date.now() + tokens.expiry_date;
    
        // Only update refresh token if a new one is provided
        if (tokens.refresh_token) {
            user.tokens.refreshToken = tokens.refresh_token;
        }
    
        await user.save();
    }
    

      // Generate JWT for the existing user
      const jwtToken = jwt.sign(
          { userId: user._id },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: "7d" }
      );

      res.json({ success: true, jwt: jwtToken, user });

  } catch (error) {
      console.error("Google OAuth Error:", error);
      res.status(500).json({ success: false, message: "Google authentication failed" });
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