const diagnosisSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: "User" },
    condition: String,
    doctorName: String,
    date: { type: Date, default: Date.now },
});

export const Diagnosis = mongoose.model("Diagnosis", diagnosisSchema);
