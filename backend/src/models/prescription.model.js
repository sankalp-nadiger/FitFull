import mongoose, { Schema } from "mongoose"
const prescriptionSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: "User" },
    doctor: {type: Schema.Types.ObjectId, ref: "Doctor"},
    medication: String,
    dosage: String,
    doctorName: String,
    date: { type: Date, default: Date.now },
});

export const Prescription = mongoose.model("Prescription", prescriptionSchema);
