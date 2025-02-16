import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
        issueDetails: { type: String, required: true },
        // appointmentTime: { type: Date, required: true },
        status: { type: String, default: "Pending" },
        userJoined: { type: Boolean, default: false }, // ✅ Default to false
        doctorJoined: { type: Boolean, default: false }, // ✅ Default to false
        startTime: { type: Date, required: false }, // ✅ Set required: false if not available
        endTime: { type: Date, required: false }, // ✅ Same here
        roomName: { type: String, required: false }, // ✅ Optional if auto-generated later
        type: { type: String, default: "video" } // ✅ Default value
      });

export const Session = mongoose.model("Session", sessionSchema);