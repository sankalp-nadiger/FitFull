import asyncHandler from "../utils/asynchandler.utils.js";
import {ApiError} from "../utils/API_Error.js";
import ApiResponse from "../utils/API_Response.js";
import { Doctor } from "../models/doctor.model.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Session } from "../models/session.model.js";
import { verifyOTP } from "./parent.controller.js";
import { Diagnosis } from "../models/Diagnosis.js";
import { Prescription } from "../models/Prescription.js";
import { TestReport } from "../models/TestReport.js";
import app from "../app.js"
import {server,io} from "../index.js"

const generateAccessAndRefreshTokens = async (userId) => {
    try {
      const doctor = await Doctor.findById(userId);
      if (!doctor) {
        throw new ApiError(404, "Doctor not found");
      }
  
      console.log("Doctor found:", doctor);
  
      const accessToken = doctor.generateAccessToken();
      const refreshToken = doctor.generateRefreshToken();
  
      console.log("Access token:", accessToken);
      console.log("Refresh token:", refreshToken);
  
      doctor.refreshToken = refreshToken;
      await doctor.save({ validateBeforeSave: false });
  
      return { accessToken, refreshToken };
    } catch (error) {
      console.error("Error generating tokens:", error);
      throw new ApiError(500, "Something went wrong while generating refresh and access token");
    }
};

export const requestSession = asyncHandler(async (req, res) => {
    const { issueDetails } = req.body;
    const userId=req.user._id;
    if (!userId || !issueDetails) {
        throw new ApiError(400, "User ID and issue details are required");
    }

    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Find an available doctor
    const doctor = await Doctor.findOne({ isAvailable: true });
    if (!doctor) {
        throw new ApiError(404, "No available doctors at the moment");
    }

    // Create a unique room name
    const roomName = `counseling-${userId}-${doctor._id}-${Date.now()}`;
    
    // Create a session
    const session = await Session.create({
        user: user._id,
        doctor: doctor._id,
        roomName,
        issueDetails,
        status: "Pending"
    });

    res.status(201).json({
        success: true,
        message: "Session requested successfully",
        session: {
            _id: session._id,
            roomName,
            doctorName: doctor.name,
            doctorId: doctor._id,
            status: "Pending",
            issueDetails
        }
    });
});

export const addNotesToSession = async (req, res) => {
    const { sessionId, notes } = req.body;

    if (!sessionId || !notes) {
      return res.status(400).json({ message: "Session ID and notes are required." });
    }
  
    try {
      const session = await Session.findById(sessionId);
  
      if (!session) {
        return res.status(404).json({ message: "Session not found." });
      }
  
      if (session.status !== "Active") {
        return res.status(400).json({ message: "Cannot add notes to a session that is not active." });
      }

      session.userNotes = notes;
      await session.save();
  
      return res.status(200).json({ message: "Notes added successfully!" });
    } catch (error) {
      console.error("Error adding notes:", error);
      return res.status(500).json({ message: "Failed to add notes. Please try again." });
    }
};

// Accept Session (Doctor Side)
export const acceptSession = asyncHandler(async (req, res) => {
    const { sessionId } = req.body;
    const doctorId = req.doctor._id;
    const doctor = await Doctor.findById(doctorId);
    const session = await Session.findById(sessionId);
    if (!session) {
        throw new ApiError(404, "Session not found");
    }

    if (session.status !== "Pending") {
        throw new ApiError(400, "Session is not in pending state");
    }
    session.doctor = doctorId;
    // Mark doctor as unavailable
    doctor.isAvailable = false;
    await doctor.save();
    
    session.status = "Active";
    await session.save();

    res.status(200).json({
        success: true,
        message: "Session accepted",
        session: {
            _id: session._id,
            roomName: session.roomName,
            status: "Active",
        }
    });
});

// End Session
export const endSession = asyncHandler(async (req, res) => {
    const { sessionId } = req.body;
    let userId;
    if(!req.isDoctor){
    userId = req.user._id;}
    else{
     userId = req.doctor._id;
    }
    const session = await Session.findById(sessionId);
    if (!session) {
        throw new ApiError(404, "Session not found");
    }
    console.log(session.doctor.toString())
    console.log(userId)
    // Verify that the user ending the session is either the doctor or the user
    if (![session.doctor.toString(), session.user.toString()].includes(userId.toString())) {
        throw new ApiError(403, "Not authorized to end this session");
    }
    
    session.status = "Completed";
    await session.save();
    io.emit(`sessionEnded-${sessionId}`, { sessionId });
    // Make doctor available again
    const doctor = await Doctor.findById(session.doctor);
    if (doctor) {
        doctor.isAvailable = true;
        await doctor.save();
    }

    res.status(200).json({
        success: true,
        message: "Session ended successfully"
    });
});

// Get Active Sessions (Doctor Side)
export const getActiveSessions = asyncHandler(async (req, res) => {
    const doctorId = req.doctor._id;

    const sessions = await Session.find({
        doctor: doctorId,
        status: { $in: ["Pending", "Active"] }
    }).populate('user', 'username');

    res.status(200).json({
        success: true,
        sessions
    });
});

export const registerDoctor = asyncHandler(async (req, res) => {
    if (typeof req.body.availability === 'string') {
        req.body.availability = JSON.parse(req.body.availability);
    }
    const { 
        fullName, 
        email, 
        password, 
        mobileNumber, 
        otp, 
        specifications = [], 
        yearExp, 
        availability = [],
    } = req.body;

    let certifications = [];
    if (req.files && req.files.length > 0) {
        certifications = req.files.map(file => ({
            url: file.path,
            fileName: file.filename,
        }));}
        console.log(req.body.availability);

    // Validate fields
    if ([fullName, email, password, mobileNumber, otp, yearExp].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }
    let certificateImgUrl = null;
    const certificateLocalPath =
      (req?.files?.certificateImage && req.files.certificateImage[0]?.path) || null;
  
    if (certificateLocalPath) {
      const certificateImg = await uploadOnCloudinary(certificateLocalPath, { folder: Mindfull });
  
      if (!certificateImg) {
        throw new ApiError(400, "Certificate upload failed");
      }
  
      certificateImgUrl = certificateImg.url;
    }
    console.log(req.body);
    // Verify OTP
    const otpVerification = await verifyOTP(mobileNumber, otp);
    if (!otpVerification.success) {
        throw new ApiError(400, otpVerification.message);
    }

    // Check if doctor already exists
    const existedDoctor = await Doctor.findOne({
        $or: [{ fullName }, { email }],
    });

    if (existedDoctor) {
        throw new ApiError(409, "User with email or username already exists");
    }

    // Create the doctor
    const doctor = await Doctor.create({
        fullName,
        email,
        password,
        mobileNumber,
        specification: specifications,
        yearexp: yearExp,
        certifications: certificateImgUrl ? [certificateImgUrl] : [], 
        availability
    });

    // Send response with created doctor
    const createdDoctor = await Doctor.findById(doctor._id).select("-password -refreshToken");
    return res
        .status(201)
        .json(new ApiResponse(201, { createdDoctor }, "Doctor registered successfully"));
});

// Login Doctor
export const loginDoctor = asyncHandler(async (req, res) => {
    const { password, email, mobileNumber, otp } = req.body;

    // Validate user credentials
    if (!(mobileNumber && otp)) {
        throw new ApiError(400, "Mobile number and OTP are required");
    }

    const otpVerification = await verifyOTP(mobileNumber, otp);
    if (!otpVerification.success) {
        throw new ApiError(400, otpVerification.message);
    }

    const doctor = await Doctor.findOne({
        $or: [{ email }, { mobileNumber }],
    });

    if (!doctor) {
        throw new ApiError(404, "User does not exist");
    }

    const isPasswordValid = await doctor.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials");
    }
    doctor.isAvailable = true;
    await doctor.save();

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(doctor._id);

    const loggedInDoctor = await Doctor.findById(doctor._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                { user: loggedInDoctor, accessToken, refreshToken },
                "User logged in successfully"
            )
        );
});

// Logout Doctor
export const logoutDoctor = asyncHandler(async (req, res) => {
    const { mobileNumber, otp } = req.body;

    // Validate OTP if provided
    if (mobileNumber && otp) {
        const otpVerification = await verifyOTP(mobileNumber, otp);
        if (!otpVerification.success) {
            throw new ApiError(400, otpVerification.message);
        }
    }

    // Remove refresh token to logout
    await Doctor.findByIdAndUpdate(
        req.doctor._id,
        {
            $unset: {
                refreshToken: 1,
            },
        },
        {
            new: true,
        }
    );

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out"));
});

export const updateFeedback = asyncHandler(async (req, res) => {
    const doctorId = req.doctor._id;
    const { feedback } = req.body;

    // Validate inputs
    if (!doctorId || !feedback?.trim()) {
        throw new ApiError(400, "Doctor ID and feedback are required");
    }

    // Find the doctor and update feedback
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
        throw new ApiError(404, "Doctor not found");
    }

    doctor.feedback.push(feedback);
    await doctor.save();

    return res
        .status(200)
        .json(new ApiResponse(200, { feedback: doctor.feedback }, "Feedback updated successfully"));
});

// getStats 
export const getDoctorStats = async (req, res) => {
    try {
        const doctorId = req.doctor._id

        // Find the doctor by ID
        const doctor = await Doctor.findById(doctorId);
        
        if (!doctor) {
            return res.status(404).json({ message: "Doctor not found" });
        }

        // Get the number of sessions the doctor has taken
        const sessionsCount = await Session.countDocuments({ doctor: doctorId });

        // Calculate other stats like total session duration
        const sessions = await Session.find({ doctor: doctorId });
        const totalSessionDuration = sessions.reduce((total, session) => {
            const duration = new Date(session.endTime) - new Date(session.startTime);
            return total + duration;
        }, 0);

        // Format total session duration to hours, minutes, etc.
        const totalDurationHours = Math.floor(totalSessionDuration / 3600000);
        const totalDurationMinutes = Math.floor((totalSessionDuration % 3600000) / 60000);

        // Return the stats as a response
        return res.status(200).json({
            doctorName: doctor.fullName,
            sessionsTaken: sessionsCount,
            totalSessionDuration: `${totalDurationHours} hours ${totalDurationMinutes} minutes`
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};

export const updateProfile = asyncHandler(async (req, res) => {
    const doctorId = req.doctor._id;
    const { updates } = req.body;

    // Validate inputs
    if (!doctorId || typeof updates !== "object") {
        throw new ApiError(400, "Doctor ID and updates object are required");
    }

    // Allowed fields for update
    const allowedFields = ["fullName", "email", "mobileNumber", "specification", "yearexp", "certifications", "availability"];
    const sanitizedUpdates = Object.keys(updates)
        .filter((key) => allowedFields.includes(key))
        .reduce((obj, key) => ({ ...obj, [key]: updates[key] }), {});

    // Find and update the doctor
    const doctor = await Doctor.findByIdAndUpdate(
        doctorId,
        { $set: sanitizedUpdates },
        { new: true, runValidators: true }
    ).select("-password -refreshToken");

    if (!doctor) {
        throw new ApiError(404, "Doctor not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, { updatedDoctor: doctor }, "Profile updated successfully"));
});


/**
 * Doctor adds a prescription for a user
 */
export const addPrescription = async (req, res) => {
  try {
    const {  doctorName, medication, dosage } = req.body;
    const userId = req.user._id;
    if (!userId || !doctorName || !medication || !dosage) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newPrescription = new Prescription({
      user: userId,
      doctorName,
      medication,
      dosage,
    });

    await newPrescription.save();

    res.status(201).json({ success: true, message: "Prescription added successfully", prescription: newPrescription });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

/**
 * Get all prescriptions suggested by a specific doctor
 */
export const getDoctorPrescriptions = async (req, res) => {
  try {
    const { doctorName } = req.params;

    const prescriptions = await Prescription.find({ doctorName }).populate("user", "name email");

    if (!prescriptions.length) {
      return res.status(404).json({ message: "No prescriptions found for this doctor." });
    }

    res.status(200).json({ success: true, prescriptions });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};


/**
 * Doctor adds a test report for a user
 */
export const addTestReport = async (req, res) => {
  try {
    const {  testName, result, documentUrl } = req.body;
     const userId=req.user._id;
    if (!userId || !testName || !result || !documentUrl) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newTestReport = new TestReport({
      user: userId,
      testName,
      result,
      documentUrl,
    });

    await newTestReport.save();

    res.status(201).json({ success: true, message: "Test report added successfully", testReport: newTestReport });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

/**
 * Get all test reports added by a specific doctor (Optional: If you want to filter by doctor)
 */
export const getDoctorTestReports = async (req, res) => {
  try {
    const { doctorName } = req.params;

    const reports = await TestReport.find({ doctorName }).populate("user", "name email");

    if (!reports.length) {
      return res.status(404).json({ message: "No test reports found for this doctor." });
    }

    res.status(200).json({ success: true, reports });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};


/**
 * Doctor adds a diagnosis for a user
 */
export const addDiagnosis = async (req, res) => {
  try {
    const {  condition, doctorName } = req.body;
        const userId=req.user._id
    if (!userId || !condition || !doctorName) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newDiagnosis = new Diagnosis({
      user: userId,
      condition,
      doctorName,
    });

    await newDiagnosis.save();

    res.status(201).json({ success: true, message: "Diagnosis added successfully", diagnosis: newDiagnosis });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

/**
 * Get all diagnoses added by a specific doctor
 */
export const getDoctorDiagnoses = async (req, res) => {
  try {
    const { doctorName } = req.params;

    const diagnoses = await Diagnosis.find({ doctorName }).populate("user", "name email");

    if (!diagnoses.length) {
      return res.status(404).json({ message: "No diagnoses found for this doctor." });
    }

    res.status(200).json({ success: true, diagnoses });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};
