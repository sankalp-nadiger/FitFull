import mongoose, { Schema } from "mongoose";
const testReportSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: "User" },
    testName: String,
    result: String,
    date: { type: Date, default: Date.now },
    documentUrl: String,
});

export const TestReport = mongoose.model("TestReport", testReportSchema);
