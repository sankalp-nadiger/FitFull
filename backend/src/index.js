import dotenv from "dotenv";
import connectDB from "./utils/db.connect.js";
import app from './app.js';
import { Server } from "socket.io";
import http from "http";
import {insertDoctors} from "./controllers/doctor.controller.js"
dotenv.config({ path: '../.env' });

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173", // Adjust according to your frontend URL
        methods: ["GET", "POST"]
    }
});

let activeSessions = {}; // Store active video call sessions

// WebSocket connection
io.on("connection", (socket) => {
    console.log(`✅ New WebSocket connected: ${socket.id}`);

    // When doctor accepts a session
    socket.on("accept-session", ({ sessionId, userId }) => {
        console.log(`Doctor accepted session: ${sessionId}`);

        const jitsiLink = `https://meet.jit.si/consultation_${sessionId}`;

        // Store the session
        activeSessions[sessionId] = jitsiLink;

        // Notify the user and doctor to join the meeting
        io.to(userId).emit("session-accepted", { sessionId, jitsiLink });
        io.to(socket.id).emit("session-accepted", { sessionId, jitsiLink });

        console.log(`🔔 Notified both doctor and user to join: ${jitsiLink}`);
    });

    // Join a session room (User or Doctor)
    socket.on("join-session", ({ sessionId }) => {
        socket.join(sessionId);
        console.log(`User joined session: ${sessionId}`);
    });

    socket.on("disconnect", () => {
        console.log(`❌ User disconnected: ${socket.id}`);
    });
});

// Connect to MongoDB and start server
connectDB()
    .then(() => {
        //await insertDoctors();
        server.listen(process.env.PORT || 8000, () => {
            console.log(`⚙️ Server is running at port : ${process.env.PORT || 8000}`);
        });
    })
    .catch((err) => {
        console.log("❌ MONGO DB connection failed !!! ", err);
    });

export { server, io };
