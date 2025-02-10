import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
const axios = require('axios');
const querystring = require('querystring');

// Router imports
import userRouter from './routes/user.routes.js';
import resourceRouter from "./routes/resource.routes.js";
import activityRouter from "./routes/activity.routes.js";
import communityRouter from "./routes/community.routes.js";
import doctorRouter from "./routes/doctor.routes.js";
import dm_chatRouter from "./routes/dm_chat.routes.js";
import journalRouter from "./routes/journal.routes.js";
//import parentRouter from "./routes/parent.routes.js";
import storyRouter from "./routes/story.routes.js";
import postsRouter from "./routes/posts.routes.js";
import recomendations from "./routes/recommendations.route.js";

const app = express();

// Middleware
app.use(cors({
    origin: 'http://localhost:5173', // Adjust the frontend URL as needed
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
}));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

const SPOTIFY_CLIENT_ID = 'YOUR_SPOTIFY_CLIENT_ID';
const SPOTIFY_CLIENT_SECRET = 'YOUR_SPOTIFY_CLIENT_SECRET';
const SPOTIFY_REDIRECT_URI = 'http://localhost:8000/auth/spotify/callback';

// Routes
app.use("/api/users", userRouter);
app.use("/api/resources", resourceRouter);
app.use("/api/journals", journalRouter);
app.use("/api/activity", activityRouter);
app.use("/api/community", communityRouter);  // Community Chat Route
app.use("/api/doctor", doctorRouter);
app.use("/api/dm_chat", dm_chatRouter);
//app.use("/api/parent", parentRouter);
app.use("/api/story", storyRouter);
app.use("/api/post", postsRouter);
app.use("/api/recommendations", recomendations);

app.post('/auth/spotify', async (req, res) => {
    const state = Math.random().toString(36).substring(7);  // Random state string for security
    const scope = 'playlist-read-private user-library-read';
    const authUrl = `https://accounts.spotify.com/authorize?` +
                    `client_id=${SPOTIFY_CLIENT_ID}&` +
                    `response_type=code&` +
                    `redirect_uri=${encodeURIComponent(SPOTIFY_REDIRECT_URI)}&` +
                    `scope=${encodeURIComponent(scope)}&` +
                    `state=${state}`;
  
    // Redirect user to Spotify's login page
    res.redirect(authUrl);
  });
  
  app.get('/auth/spotify/callback', async (req, res) => {
    const { code } = req.query;  // Extract authorization code from Spotify redirect

    if (!code) {
        return res.redirect('http://localhost:5173/error?message=No+authorization+code+received');
    }

    // 🚀 Instead of processing everything now, redirect the user to frontend's loading page
    res.redirect(`http://localhost:5173/loading?code=${code}`);
});

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
