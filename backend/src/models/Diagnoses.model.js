import mongoose, { Schema } from "mongoose"
const diagnosisSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: "User" },
    condition: String,
    doctor: {type: Schema.Types.ObjectId, ref: "Doctor"},
    doctorName: String,
    date: { type: Date, default: Date.now },
    notes: String
});

export const DiagnosisReport = mongoose.model("DiagnosisReport", diagnosisSchema);
