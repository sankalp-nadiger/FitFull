const testReportSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: "User" },
    testName: String,
    result: String,
    date: { type: Date, default: Date.now },
    documentUrl: String, // Link to test report document
});

export const TestReport = mongoose.model("TestReport", testReportSchema);
