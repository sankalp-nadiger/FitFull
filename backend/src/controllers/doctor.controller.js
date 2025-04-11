import asyncHandler from "../utils/asynchandler.utils.js";
import {ApiError} from "../utils/API_Error.js";
import ApiResponse from "../utils/API_Response.js";
import { Doctor } from "../models/doctor.model.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Session } from "../models/session.model.js";
import { DiagnosisReport } from "../models/Diagnoses.model.js";
import { Prescription } from "../models/prescription.model.js"
import { TestReport } from "../models/TestReport.model.js";
import { encryptData, decryptData } from "../utils/security.js";
import app from "../app.js"
import {server,io} from "../index.js"
import twilio from "twilio"
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();
import { google } from "googleapis";
import mongoose from "mongoose";

const doctorsData = [
  { fullName: "Dr. Rajesh Sharma", specialization: ["Cardiologist"], mobileNumber: 9876543210, yearexp: 15, hospitals: ["Apollo Hospital"], email: "rajesh.sharma@apollo.com", password: "password" },
  { fullName: "Dr. Priya Iyer", specialization: ["Dermatologist"], mobileNumber: 9123456780, yearexp: 10, hospitals: ["Skin Glow Clinic"], email: "priya.iyer@skinglow.com", password: "password123" },
  { fullName: "Dr. Anil Verma", specialization: ["Neurologist"], mobileNumber: 9234567890, yearexp: 12, hospitals: ["Fortis Neuro Center"], email: "anil.verma@fortis.com", password: "password123" },
  { fullName: "Dr. Kavita Nair", specialization: ["Pediatrician"], mobileNumber: 9345678901, yearexp: 8, hospitals: ["Rainbow Children's Hospital"], email: "kavita.nair@rainbow.com", password: "password123" },
  { fullName: "Dr. Vikram Patil", specialization: ["Orthopedic Surgeon"], mobileNumber: 9456789012, yearexp: 20, hospitals: ["Sancheti Hospital"], email: "vikram.patil@sancheti.com", password: "password123" },
  { fullName: "Dr. Sneha Menon", specialization: ["Oncologist"], mobileNumber: 9567890123, yearexp: 18, hospitals: ["Tata Memorial Hospital"], email: "sneha.menon@tatamemorial.com", password: "password123" },
  { fullName: "Dr. Ramesh Reddy", specialization: ["Endocrinologist"], mobileNumber: 9678901234, yearexp: 14, hospitals: ["Manipal Diabetes Center"], email: "ramesh.reddy@manipal.com", password: "password123" },
  { fullName: "Dr. Aarti Deshmukh", specialization: ["Gynecologist"], mobileNumber: 9789012345, yearexp: 16, hospitals: ["Cloudnine Hospital"], email: "aarti.deshmukh@cloudnine.com", password: "password123" },
  { fullName: "Dr. Sandeep Gupta", specialization: ["Psychiatrist"], mobileNumber: 9890123456, yearexp: 9, hospitals: ["NIMHANS"], email: "sandeep.gupta@nimhans.com", password: "password123" },
  { fullName: "Dr. Pooja Joshi", specialization: ["Urologist"], mobileNumber: 9901234567, yearexp: 11, hospitals: ["Kokilaben Dhirubhai Ambani Hospital"], email: "pooja.joshi@kokilaben.com", password: "password123" },
  { fullName: "Dr. Manish Kulkarni", specialization: ["Pulmonologist"], mobileNumber: 9012345678, yearexp: 13, hospitals: ["Medanta Lung Center"], email: "manish.kulkarni@medanta.com", password: "password123" },
  { fullName: "Dr. Neha Choudhary", specialization: ["Nephrologist"], mobileNumber: 9123456789, yearexp: 7, hospitals: ["Max Super Specialty Hospital"], email: "neha.choudhary@maxhospital.com", password: "password123" },
  { fullName: "Dr. Arvind Mehta", specialization: ["Hematologist"], mobileNumber: 9234567891, yearexp: 19, hospitals: ["AIIMS"], email: "arvind.mehta@aiims.com", password: "password123" },
  { fullName: "Dr. Meera Pillai", specialization: ["Ophthalmologist"], mobileNumber: 9345678912, yearexp: 10, hospitals: ["Shankar Netralaya"], email: "meera.pillai@shankarnetralaya.com", password: "password123" },
  { fullName: "Dr. Rohan Saxena", specialization: ["Gastroenterologist"], mobileNumber: 9456789123, yearexp: 12, hospitals: ["Jaslok Hospital"], email: "rohan.saxena@jaslok.com", password: "password123" },
];
export const insertDoctors = async () => {
  try {
    //await mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });
    await Doctor.insertMany(doctorsData);
    console.log("Doctors inserted successfully");
    //mongoose.connection.close();
  } catch (error) {
    console.error("Error inserting doctors:", error);
    //mongoose.connection.close();
  }
};

const sendOTP = async (req, res) => {
    const mobileNumber= req.body.mobileNumber;
    const otp=generateOTP();
    await OTP.create({ mobileNumber, otp, createdAt: new Date() });
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_API_KEY_SECRET;
const Twilio_Number = process.env.TWILIO_NUMBER;
const client = twilio(accountSid, authToken);
try {
    const message = await client.messages.create({
        body: `Your OTP is: ${otp}`, // Use template literals to include OTP
        to: `+91${mobileNumber}`, 
        from: Twilio_Number });

    res.json({ success: true, messageSid: message.sid });
} catch (error) {
    res.status(500).json({ success: false, error: error.message });
}
};
// OTP verification function
// const verifyOTP = async (mobileNumber, enteredOTP) => {
//     console.log('Searching for OTP with mobile number:', mobileNumber);
//     const record = await OTP.findOne({ mobileNumber }).setOptions({ bypassHooks: true }).sort({ createdAt: -1 });
//     console.log(record);
//     if (!record || record.otp !== enteredOTP) {
//         return { success: false, message: 'Invalid OTP' };
//     }

//     const isExpired = (new Date() - record.createdAt) > 5 * 60 * 1000; // 5 minutes expiry
//     if (isExpired) {
//         return { success: false, message: 'OTP expired' };
//     }

//     return { success: true, message: 'OTP verified' };
// };
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
  const { issueDetails, doctorId, date, time } = req.body;
  const userId = req.user._id;
  
  console.log('Request received:', { userId, doctorId, date, time, issueDetails });
  
  if (!userId || !issueDetails || !doctorId || !date || !time) {
    throw new ApiError(400, "User ID, issue details, doctor ID, date, and time are required");
  }

  // Verify user and doctor existence
  const user = await User.findById(userId).select("+tokens");
  const doctor = await Doctor.findById(doctorId).select("+tokens"); // Add tokens field to selection
  
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  
  if (!doctor) {
    throw new ApiError(404, "Doctor not found");
  }

  console.log('User and doctor found:', { 
    user: user._id.toString(), 
    doctor: doctor._id.toString() 
  });

  // Parse date and time to create start and end times in IST
  const dateTimeStr = `${date}T${time}:00+05:30`;
  console.log('Creating date from string:', dateTimeStr);
  
  const startTime = new Date(dateTimeStr);
  
  if (isNaN(startTime.getTime())) {
    throw new ApiError(400, "Invalid date or time format");
  }
  
  const endTime = new Date(startTime);
  endTime.setHours(endTime.getHours() + 1); // Assuming 1-hour appointments
  
  console.log('Appointment time window:', { 
    startTime: startTime.toISOString(), 
    endTime: endTime.toISOString() 
  });

  // Check scheduling conflicts
  const conflictingSession = await Session.findOne({
    doctor: doctor._id,
    startTime: { $lt: endTime },
    endTime: { $gt: startTime }
  });
  
  if (conflictingSession) {
    console.log('Conflicting session found:', conflictingSession._id.toString());
    throw new ApiError(409, "The doctor already has an appointment during that time");
  }

  // Create the Session in your database
  const session = await Session.create({
    user: user._id,
    doctor: doctor._id,
    status: "Pending",
    issueDetails,
    userJoined: false,
    doctorJoined: false,
    roomName: `room_${user._id}_${doctor._id}_${Date.now()}`,
    type: "video",
    date,
    startTime,
    endTime,
  });

  console.log('Session created successfully:', session._id.toString());

  // Function to create a Google Calendar event for a participant (user or doctor)
  const createCalendarEvent = async (participant, participantType) => {
    try {
      console.log(`Checking ${participantType} tokens:`);
      console.log(`${participantType} tokens structure:`, JSON.stringify(participant.tokens, null, 2));
      
      if (participant.tokens?.googleFitToken) {
        console.log(`Creating OAuth client for ${participantType} calendar event`);
        
        // Create OAuth client with the tokens
        const oauth2Client = new google.auth.OAuth2(
          process.env.GOOGLE_CLIENT_ID,
          process.env.GOOGLE_CLIENT_SECRET,
          process.env.GOOGLE_REDIRECT_URI
        );
        
        // Set credentials based on available tokens
        const credentials = {
          access_token: participant.tokens.googleFitToken,
        };
        
        // Add refresh token if available
        if (participant.tokens.refreshToken) {
          credentials.refresh_token = participant.tokens.refreshToken;
        }
        
        oauth2Client.setCredentials(credentials);
        
        // Create calendar event details
        const eventDetails = {
          summary: `Medical Appointment with ${participantType === 'user' 
            ? `Dr. ${doctor.fullName || doctor.name}` 
            : `Patient ${user.fullName || user.name}`}`,
          description: `Consultation regarding: ${issueDetails}`,
          start: {
            dateTime: startTime.toISOString(),
            timeZone: 'Asia/Kolkata', // IST timezone
          },
          end: {
            dateTime: endTime.toISOString(),
            timeZone: 'Asia/Kolkata', // IST timezone
          },
          attendees: [
            { email: user.email },
            { email: doctor.email }
          ],
          reminders: {
            useDefault: false,
            overrides: [
              { method: 'email', minutes: 24 * 60 },
              { method: 'popup', minutes: 30 },
            ],
          },
          colorId: "1" // Blue color for medical appointments
        };
        
        console.log(`Creating calendar event for ${participantType} with details:`, 
          JSON.stringify(eventDetails, null, 2));
        
        try {
          // Create the calendar event
          const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
          const response = await calendar.events.insert({
            calendarId: 'primary',
            resource: eventDetails,
            sendUpdates: 'all', // Send emails to attendees
          });
          
          console.log(`Calendar event created successfully for ${participantType}!`);
          console.log('Event ID:', response.data.id);
          console.log('Event link:', response.data.htmlLink);
          
          // Return the event ID
          return response.data.id;
          
        } catch (calendarError) {
          console.error(`Failed to create calendar event for ${participantType}:`, calendarError.message);
          
          if (calendarError.response) {
            console.error('Response status:', calendarError.response.status);
            console.error('Error details:', JSON.stringify(calendarError.response.data, null, 2));
          }
          
          return null;
        }
      } else {
        console.log(`Skipping calendar event creation for ${participantType} - no valid tokens available`);
        return null;
      }
    } catch (error) {
      console.error(`Error in ${participantType} calendar event creation process:`, error.message);
      return null;
    }
  };

  // Create calendar events for both user and doctor
  try {
    // Create event for user
    const userEventId = await createCalendarEvent(user, 'user');
    if (userEventId) {
      session.userCalendarEventId = userEventId;
    }
    
    // Create event for doctor
    const doctorEventId = await createCalendarEvent(doctor, 'doctor');
    if (doctorEventId) {
      session.doctorCalendarEventId = doctorEventId;
    }
    
    // Save the session with calendar event IDs
    if (userEventId || doctorEventId) {
      await session.save();
    }
  } catch (error) {
    console.error('Error in calendar events creation:', error.message);
    // Don't re-throw - we still want to return the created session
  }

  return res.status(201).json({
    success: true,
    message: "Session requested and scheduled successfully",
    session: {
      _id: session._id,
      status: session.status,
      issueDetails: session.issueDetails,
      startTime: session.startTime,
      endTime: session.endTime,
      doctorName: doctor.fullName || doctor.name,
    },
  });
});


export const getPendingConsultations = asyncHandler(async (req, res) => {
  const doctorId = req.doctor._id; // Assuming doctor is logged in
  const pendingConsultations = await Session.find({
    doctor: doctorId,
    status: "Pending",
  }).populate("user", "fullName");

  res.status(200).json({
    success: true,
    consultations: pendingConsultations.map((session) => ({
      id: session._id,
      issueDetails: session.issueDetails,
      name: session.user.fullName,
      time: `${new Date(session.startTime).toLocaleTimeString()} - ${new Date(session.endTime).toLocaleTimeString()}`,
      date: session.date
    })),
  });
});

export const joinSession = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  console.log("Route hit join")
  const userId = req.isUser ? req.user._id : null;
  const doctorId = req.isDoctor ? req.doctor._id : null;

  console.log({
    sessionId,
    userId,
    doctorId,
    isUser: req.isUser,
    isDoctor: req.isDoctor
  });

  const session = await Session.findById(sessionId);
  if (!session) {
    throw new ApiError(404, "Session not found");
  }

  console.log({
    session: {
      user: session.user.toString(),
      doctor: session.doctor.toString(),
      userJoined: session.userJoined,
      doctorJoined: session.doctorJoined,
      status: session.status,
      roomName: session.roomName
    }
  });

  if (session.status !== "Pending") {
    throw new ApiError(400, "Session is not in pending state");
  }

  // Update fields based on who is joining
  let updated = false;
  
  if (userId && session.user.toString() === userId.toString() && !session.userJoined) {
    session.userJoined = true;
    updated = true;
    console.log("User joined successfully");
  }

  if (doctorId && session.doctor.toString() === doctorId.toString() && !session.doctorJoined) {
    session.doctorJoined = true;
    updated = true;
    console.log("Doctor joined successfully");
  }

  console.log({ updated, userJoined: session.userJoined, doctorJoined: session.doctorJoined });

  if (!updated) {
    throw new ApiError(400, "User/Doctor already joined or unauthorized");
  }

  // If both have joined, set session to active
  if (session.userJoined && session.doctorJoined) {
    session.status = "Active";
  }

  await session.save();

  res.status(200).json({
    success: true,
    message: session.status === "Active" ? "Session is now active" : "Joined successfully",
    session: {
      _id: session._id,
      status: session.status,
      roomName: session.roomName,
      userJoined: session.userJoined,
      doctorJoined: session.doctorJoined
    },
  });
});
// End Session
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
  const { sessionId, issueDetails } = req.body;
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
          issueDetails,
          roomName: session.roomName,
          status: "Active",
      }
  });
});

// End Session
export const endSession = asyncHandler(async (req, res) => {
  console.log("Route hit");
  const { sessionId } = req.body;
  let userId;
  if (!req.isDoctor) {
      userId = req.user._id;
  } else {
      userId = req.doctor._id;
  }
  const session = await Session.findById(sessionId);
  if (!session) {
      throw new ApiError(404, "Session not found");
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

export const getUserAppointments = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const sessions = await Session.find({ user: userId })
    .populate('user', 'username email') // adjust fields as needed
    .populate('doctor', 'fullName specification email'); // adjust to match your Doctor schema

  res.status(200).json({
    success: true,
    sessions,
  });
});



// @desc   Get all registered doctors
// @route  GET /api/doctors
// @access Public
export const getAllDoctors = asyncHandler(async (req, res) => {
  const doctors = await Doctor.find().select("fullName specification email image"); // Fetch necessary details

  if (doctors.length > 0) {
    res.json(doctors);
  } else {
    res.status(404).json({ message: "No doctors found" });
  }
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
    if ([fullName, email, password, mobileNumber, yearExp].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }
    let certificateImgUrl = null;
    const certificateLocalPath =
      (req?.files?.certificateImage && req.files.certificateImage[0]?.path) || null;
  
    if (certificateLocalPath) {
      const certificateImg = await uploadOnCloudinary(certificateLocalPath, { folder: "FitFull" });
  
      if (!certificateImg) {
        throw new ApiError(400, "Certificate upload failed");
      }
  
      certificateImgUrl = certificateImg.url;
    }
    console.log(req.body);
    // Verify OTP
    // const otpVerification = await verifyOTP(mobileNumber, otp);
    // if (!otpVerification.success) {
    //     throw new ApiError(400, otpVerification.message);
    // }

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
    if (!(mobileNumber )) {
        throw new ApiError(400, "Mobile number  are required");
    }

    // const otpVerification = await verifyOTP(mobileNumber, otp);
    // if (!otpVerification.success) {
    //     throw new ApiError(400, otpVerification.message);
    // }

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
    const { mobileNumber} = req.body;

    // // Validate OTP if provided
    // if (mobileNumber && otp) {
    //     const otpVerification = await verifyOTP(mobileNumber, otp);
    //     if (!otpVerification.success) {
    //         throw new ApiError(400, otpVerification.message);
    //     }
    // }

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
    const { email, feedback } = req.body;

    // Validate inputs
    if (!email || !feedback?.trim()) {
        throw new ApiError(400, "Doctor email and feedback are required");
    }

    // Find the doctor by email
    const doctor = await Doctor.findOne({ email });
    if (!doctor) {
        throw new ApiError(404, "Doctor not found");
    }

    // Update feedback
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
export const addPrescription = asyncHandler(async (req, res) => {
  try {
      const { userEmail, medication, dosage } = req.body;
      const doctorId = req.doctor._id;

      if (!userEmail || !medication || !dosage) {
          throw new ApiError(400, "All fields are required");
      }

      // Find user by email
      const user = await User.findOne({ email: userEmail });
      if (!user) {
          throw new ApiError(404, "User not found");
      }
      const doctor = await Doctor.findById(req.doctor._id);
      const doctorName = doctor ? doctor.fullName : null; 
      // Create new prescription
      const newPrescription = new Prescription({
          user: user._id,
          doctor: doctorId,
          doctorName: doctorName,
          medication: encryptData(medication),
          dosage: encryptData(dosage),
      });

      await newPrescription.save();

      res.status(201).json({
          success: true,
          message: "Prescription added successfully",
          prescription: newPrescription
      });
  } catch (error) {
      console.error("Error adding prescription:", error);
      throw new ApiError(500, error.message || "Server Error");
  }
});

/**
 * Get all prescriptions suggested by a specific doctor
 */
export const getDoctorPrescriptions = asyncHandler(async (req, res) => {
  try {
      const doctorId = req.doctor._id;

      // Fetch prescriptions for the logged-in doctor
      const prescriptions = await Prescription.find({ doctor: doctorId })
          .populate("user", "fullName email");

      if (!prescriptions.length) {
          throw new ApiError(404, "No prescriptions found for this doctor.");
      }

      // Decrypt medication and dosage
      const decryptedPrescriptions = prescriptions.map(prescription => ({
          ...prescription._doc,
          medication: decryptData(prescription.medication),
          dosage: decryptData(prescription.dosage),
      }));

      res.status(200).json({ success: true, prescriptions: decryptedPrescriptions });
  } catch (error) {
      console.error("Error fetching prescriptions:", error);
      throw new ApiError(500, error.message || "Server Error");
  }
});

/**
 * Doctor adds a test report for a user
 */
export const addTestReport = asyncHandler(async (req, res) => {
  try {
    const { userEmail, testName, result} = req.body;
    if (!userEmail || !testName || !result ) {
      throw new ApiError(400, "User email, test name, result, and document URL are required");
    }

    // Find user by email
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    let documentUrl = null;
    const documentLocalPath =
      (req?.files?.document && req.files.document[0]?.path) || null;
  
    if (documentLocalPath) {
      const documentUploaded = await uploadOnCloudinary(documentLocalPath, {folder: "FitFull"});
  
      documentUrl = documentUploaded.url;
    }
    console.log(req.body);
        const encryptedDocumentUrl = documentUrl ? encryptData(documentUrl) : null;
    // Create new test report
    const newTestReport = new TestReport({
      user: user._id,
      doctor: req.doctor._id,
      testName,
      result: encryptData(result),
      documentUrl: encryptedDocumentUrl,
    });

    await newTestReport.save();

    res.status(201).json({
      success: true,
      message: "Test report added successfully",
      testReport: newTestReport,
    });
  } catch (error) {
    console.error("Error adding test report:", error);
    throw new ApiError(500, error.message || "Server Error");
  }
});


/**
 * Get all test reports added by a specific doctor (Optional: If you want to filter by doctor)
 */
export const getDoctorTestReports = asyncHandler(async (req, res) => {
  try {
    const doctorId = req.doctor._id; // Assuming doctor authentication

    // Find test reports where the doctor is referenced
    const reports = await TestReport.find({ doctor: doctorId }).populate("user", "fullName email");

    if (!reports.length) {
      throw new ApiError(404, "No test reports found for this doctor.");
    }

    // Decrypt sensitive data
    const decryptedReports = reports.map(report => ({
      ...report._doc,
      result: decryptData(report.result),
      documentUrl: decryptData(report.documentUrl),
    }));

    res.status(200).json({ success: true, reports: decryptedReports });
  } catch (error) {
    console.error("Error fetching test reports:", error);
    throw new ApiError(500, error.message || "Server Error");
  }
});

/**
 * Doctor adds a diagnosis for a user
 */
export const addDiagnosis = asyncHandler(async (req, res) => {
  try {
    const { condition, notes, userEmail } = req.body;

    if (!userEmail || !condition) {
      throw new ApiError(400, "All fields are required");
    }

    // Find the user by email
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    const doctor = await Doctor.findById(req.doctor._id);
    const doctorName = doctor ? doctor.fullName : null; 

    // Create new diagnosis report
    const newDiagnosis = new DiagnosisReport({
      user: user._id,
      doctor: req.doctor._id,
      doctorName: doctorName,
      condition: encryptData(condition),
      notes: encryptData(notes)
    });

    await newDiagnosis.save();

    res.status(201).json({
      success: true,
      message: "Diagnosis added successfully",
      diagnosis: newDiagnosis,
    });
  } catch (error) {
    console.error("Error adding diagnosis:", error);
    throw new ApiError(500, error.message || "Server Error");
  }
});

/**
 * Get all diagnoses added by a specific doctor
 */
export const getDoctorDiagnoses = asyncHandler(async (req, res) => {
  try {
    
    // Fetch diagnoses where doctor is the reference
    const diagnoses = await DiagnosisReport.find({ doctor: req.doctor._id }).populate("user", "fullName email");
    console.log(diagnoses)

    if (!diagnoses.length) {
      return res.status(404).json({ message: "No diagnoses found for this doctor." });
    }

    // Decrypt conditions before sending response
    const decryptedDiagnoses = diagnoses.map(diagnosis => ({
      ...diagnosis._doc,
      condition: decryptData(diagnosis.condition),
      notes: decryptData(diagnosis.notes),
    }));

    res.status(200).json({
      success: true,
      diagnoses: decryptedDiagnoses,
    });

  } catch (error) {
    console.error("Error fetching diagnoses:", error);
    throw new ApiError(500, error.message || "Server Error");
  }
});

export const getPatientsByDoctor = async (req, res) => {
    try {
        const doctorId = req.doctor._id;

        // Find all sessions where this doctor was involved
        const sessions = await Session.find({ doctor: doctorId }).select("user").lean();

        // Extract unique user IDs
        const uniqueUserIds = [...new Set(sessions.map(session => session.user.toString()))];

        // Fetch user details
        const patients = await User.find({ _id: { $in: uniqueUserIds } })
            .select("fullName avatar email")
            .lean();

        return res.status(200).json({ success: true, patients });
    } catch (error) {
        console.error("Error fetching patients:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

