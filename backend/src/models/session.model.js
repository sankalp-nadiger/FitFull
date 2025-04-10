import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
        issueDetails: { type: String, required: true },
        //appointmentTime: { type: Date, required: true },
        status: { type: String, default: "Pending" },
        userJoined: { type: Boolean, default: false },
        doctorJoined: { type: Boolean, default: false },
        startTime: { type: Date, required: false },
        endTime: { type: Date, required: false },
        roomName: { type: String, required: true },
        type: { type: String, default: "video" }
      });

export const Session = mongoose.model("Session", sessionSchema);