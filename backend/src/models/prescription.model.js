import mongoose, { Schema } from "mongoose"
const prescriptionSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: "User" },
    doctorName: String,
    medication: String,
    dosage: String,
    date: { type: Date, default: Date.now },
});

export const Prescription = mongoose.model("Prescription", prescriptionSchema);
