import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // changed from student to user
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
    type: {type:String, enum: ['Appointment', 'Chat'], required: true},
    roomName: { type: String, required: true },
    issueDetails: { type: String, required: true },
    status: { 
        type: String, 
        enum: ["Pending", "Active", "Upcoming", "Completed"], // added "Active" status for when session is ongoing
        default: "Pending" 
    },
    appointmentTime: { type: Date, required: true },
    userJoined: {type: Boolean, default: ""},
    doctorJoined: {type: Boolean, default: ""},
    doctorFeedback: { type: String, default: ""},
    userNotes: {type: String, default: ""},
    createdAt: { type: Date, default: Date.now },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },

});

export const Session = mongoose.model("Session", sessionSchema);