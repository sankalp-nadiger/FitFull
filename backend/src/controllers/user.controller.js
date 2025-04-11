import {User} from "../models/user.model.js"
import { ApiError } from "../utils/API_Error.js";
import ApiResponse from "../utils/API_Response.js";
import asyncHandler from "../utils/asynchandler.utils.js";
import { Prescription } from "../models/prescription.model.js";
import { TestReport } from "../models/TestReport.model.js";
import { DiagnosisReport } from "../models/Diagnoses.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { encryptData, decryptData } from "../utils/security.js";
import { Doctor } from "../models/doctor.model.js";
import nodemailer from "nodemailer";

const additionalActivities = [
    // Cardio & Endurance
    {
      title: "Brisk Walking",
      type: "Cardio & Endurance",
      content: "A simple way to improve heart health and stamina. Example: Walk for 30 minutes daily.",
    },
    {
      title: "Jogging or Running",
      type: "Cardio & Endurance",
      content: "Boosts endurance and strengthens the heart. Example: Jog for 20 minutes at a moderate pace.",
    },
    {
      title: "Skipping Rope",
      type: "Cardio & Endurance",
      content: "Enhances coordination and cardiovascular fitness. Example: Do 100 skips per session.",
    },
    {
      title: "Cycling",
      type: "Cardio & Endurance",
      content: "A low-impact way to strengthen leg muscles and improve endurance. Example: Cycle for 5 km daily.",
    },
    {
      title: "Swimming",
      type: "Cardio & Endurance",
      content: "A full-body workout that improves lung capacity and muscle strength. Example: Swim for 30 minutes twice a week.",
    },
  
    // Strength & Muscle Building
    {
      title: "Bodyweight Exercises",
      type: "Strength & Muscle Building",
      content: "Simple strength training without equipment. Example: 3 sets of push-ups, squats, and lunges.",
    },
    {
      title: "Resistance Band Workouts",
      type: "Strength & Muscle Building",
      content: "Strengthens muscles without heavy weights. Example: Do bicep curls and shoulder presses.",
    },
    {
      title: "Core Workouts",
      type: "Strength & Muscle Building",
      content: "Builds a strong foundation and improves posture. Example: Plank for 60 seconds daily.",
    },
    {
      title: "Dumbbell Exercises",
      type: "Strength & Muscle Building",
      content: "Helps in muscle toning and fat loss. Example: Perform shoulder presses and bicep curls.",
    },
    {
      title: "Calisthenics",
      type: "Strength & Muscle Building",
      content: "Uses body weight for functional strength training. Example: Pull-ups, dips, and leg raises.",
    },
  
    // Flexibility & Mobility
    {
      title: "Dynamic Stretching",
      type: "Flexibility & Mobility",
      content: "Prepares muscles for workouts and reduces stiffness. Example: Arm circles, leg swings, and torso twists.",
    },
    {
      title: "Yoga",
      type: "Flexibility & Mobility",
      content: "Improves flexibility, balance, and mental well-being. Example: Hold a downward dog pose for 30 seconds.",
    },
    {
      title: "Foam Rolling",
      type: "Flexibility & Mobility",
      content: "Relieves muscle tightness and improves circulation. Example: Roll out your back and legs for 5 minutes.",
    },
    {
      title: "Pilates",
      type: "Flexibility & Mobility",
      content: "Focuses on core strength and controlled movements. Example: Try 10 minutes of basic Pilates exercises.",
    },
    {
      title: "Tai Chi",
      type: "Flexibility & Mobility",
      content: "A gentle martial art that enhances balance and coordination. Example: Practice slow Tai Chi movements for 15 minutes.",
    },
  
    // Recovery & Relaxation
    {
      title: "Post-Workout Stretching",
      type: "Recovery & Relaxation",
      content: "Prevents soreness and promotes muscle recovery. Example: Stretch each muscle group for 20 seconds.",
    },
    {
      title: "Hydration & Nutrition",
      type: "Recovery & Relaxation",
      content: "Replenish fluids and nutrients post-exercise. Example: Drink a protein smoothie after workouts.",
    },
    {
      title: "Massage Therapy",
      type: "Recovery & Relaxation",
      content: "Relaxes muscles and reduces tension. Example: Use a massage ball to relieve tight spots.",
    },
    {
      title: "Cold & Heat Therapy",
      type: "Recovery & Relaxation",
      content: "Reduces inflammation and aids muscle recovery. Example: Apply an ice pack to sore muscles.",
    },
    {
      title: "Deep Breathing & Meditation",
      type: "Recovery & Relaxation",
      content: "Helps in muscle relaxation and stress reduction. Example: Try deep belly breathing for 5 minutes.",
    }
  ];
  
const generateAccessAndRefreshTokens = async (userId) => {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new ApiError(404, "User not found");
      }
  
      console.log("User found:", user); 
  
      const accessToken = user.generateAccessToken();
      const refreshToken = user.generateRefreshToken();
  
      user.refreshToken = refreshToken;
      await user.save({ validateBeforeSave: false });
  
      return { accessToken, refreshToken };
    } catch (error) {
      console.error("Error generating tokens:", error);
      throw new ApiError(
        500,
        "Something went wrong while generating refresh and access token"
      );
    }
};


import jwt from "jsonwebtoken";


const transporter = nodemailer.createTransport({
  service: "gmail", 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Create HTML email template
const createApprovalEmailTemplate = (requestingUser, token) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4CAF50; color: white; padding: 10px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .button { 
          display: inline-block; 
          background-color: #4CAF50; 
          color: white; 
          padding: 10px 20px; 
          text-decoration: none; 
          border-radius: 5px; 
        }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Family Access Request</h2>
        </div>
        <div class="content">
          <p>Hello,</p>
          <p><strong>${requestingUser.fullName}</strong> has requested to add you as a family member, which would grant them access to view your medical records.</p>
          <p>Please confirm if you'd like to approve this request:</p>
          <p style="text-align: center;">
            <a href="https://fitfull.onrender.com/api/users/family/approve/${token}" class="button">Approve Request</a>
          </p>
          <p>If you didn't expect this request, you can safely ignore this email.</p>
          <p>Thank you,<br>Health App Team</p>
        </div>
        <div class="footer">
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Modified addFamilyMembers function
const addFamilyMembers = asyncHandler(async (req, res) => {
  try {
    const { familyMembers } = req.body; // Array of emails
    const userId = req.user._id; // Current user's ID from auth middleware

    if (!familyMembers || !Array.isArray(familyMembers)) {
      throw new ApiError(400, "Family members must be provided as an array of emails");
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // Find users by email
    const members = await User.find({ email: { $in: familyMembers } }, "_id email fullName");

    if (members.length === 0) {
      throw new ApiError(404, "No valid family members found");
    }

    // Create pending family requests
    const pendingRequests = [];
    
    // Send approval emails to each family member
    for (const member of members) {
      // Generate a JWT token for verification
      const token = jwt.sign(
        { 
          requesterId: userId,
          recipientId: member._id
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "7d" }
      );
      
      // Create email options
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: member.email,
        subject: `${user.fullName} wants to add you as a family member`,
        html: createApprovalEmailTemplate(user, token)
      };
      
      // Send email
      await transporter.sendMail(mailOptions);
      
      // Track pending request
      pendingRequests.push({
        email: member.email,
        fullName: member.fullName,
        status: "pending"
      });
    }

    // Save pending requests to user document
    if (!user.pendingFamilyRequests) {
      user.pendingFamilyRequests = [];
    }
    
    user.pendingFamilyRequests.push(...pendingRequests);
    await user.save();

    return res.status(200).json(
      new ApiResponse(200, { pendingRequests }, "Family member approval emails sent successfully")
    );
  } catch (error) {
    console.error("Error adding family members:", error);
    throw new ApiError(500, error.message || "Error adding family members");
  }
});

// New endpoint to handle approval
export const approveFamilyMember = asyncHandler(async (req, res) => {
  try {
    const { token } = req.params;
    
    // Verify the token
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const { requesterId, recipientId } = decoded;
    
    // Find both users
    const requester = await User.findById(requesterId);
    const recipient = await User.findById(recipientId);
    
    if (!requester || !recipient) {
      throw new ApiError(404, "User not found");
    }
    
    // Initialize family arrays if they don't exist
    if (!requester.family) requester.family = [];
    if (!recipient.family) recipient.family = [];
    
    // Check if already added
    const alreadyAdded = requester.family.some(id => id.toString() === recipientId.toString());
    
    if (!alreadyAdded) {
      // Add recipient to requester's family
      requester.family.push(recipientId);
      
      // Update pending requests status
      if (requester.pendingFamilyRequests) {
        requester.pendingFamilyRequests = requester.pendingFamilyRequests.map(req => {
          if (req.email === recipient.email) {
            return { ...req, status: "approved" };
          }
          return req;
        });
      }
      
      await requester.save();
    }
    
    // Render HTML response page
    const htmlResponse = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Request Approved</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; text-align: center; margin-top: 50px; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .success { color: #4CAF50; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1 class="success">Request Approved!</h1>
          <p>You have successfully approved ${requester.fullName}'s request to add you as a family member.</p>
          <p>You can now close this window.</p>
        </div>
      </body>
      </html>
    `;
    
    // Respond with HTML
    return res.status(200).send(htmlResponse);
  } catch (error) {
    console.error("Error approving family member:", error);
    
    // If token is invalid or expired
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      const htmlError = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Invalid or Expired Link</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; text-align: center; margin-top: 50px; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .error { color: #f44336; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1 class="error">Invalid or Expired Link</h1>
            <p>This approval link is no longer valid. Please request a new invitation.</p>
          </div>
        </body>
        </html>
      `;
      return res.status(400).send(htmlError);
    }
    
    throw new ApiError(500, error.message || "Error approving family member");
  }
});



export const removeFamilyMember = asyncHandler(async (req, res) => {
    try {
        const { memberEmail } = req.body;
        const userId = req.user._id;

        if (!memberEmail) {
            throw new ApiError(400, "Member email is required");
        }

        // Find the user
        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError(404, "User not found");
        }

        // Find the family member by email
        const member = await User.findOne({ email: memberEmail }, "_id");
        if (!member) {
            throw new ApiError(404, "Family member not found");
        }

        // Remove the member from the family array
        const memberId = member._id.toString();
        if (!user.family.includes(memberId)) {
            return res.status(400).json(
                new ApiResponse(400, { user }, "Family member not found in your list")
            );
        }

        user.family = user.family.filter(id => id.toString() !== memberId);
        await user.save();

        // Fetch the updated user with populated family members
        const updatedUser = await User.findById(userId)
            .populate("family", "fullName email username")
            .select("-password -refreshToken");

        return res.status(200).json(
            new ApiResponse(
                200,
                { user: updatedUser },
                "Family member removed successfully"
            )
        );
    } catch (error) {
        console.error("Error removing family member:", error);
        throw new ApiError(500, error.message || "Error removing family member");
    }
});

const registerUser = asyncHandler(async (req, res) => {
    try {
        const { fullName, email, username, password, gender, age } = req.body;
    
        if ([fullName, email, username, password].some((field) => field?.trim() === "")) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }
    
        // Check if user exists
        const existedUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existedUser) {
            return res.status(409).json({ success: false, message: "User with email or username already exists" });
        }
  
        // Process location
        // let parsedLocation;
        // try {
        //     parsedLocation = JSON.parse(location);
        //     if (!parsedLocation.type || !parsedLocation.coordinates) {
        //         throw new Error("Invalid location format");
        //     }
        // } catch (error) {
        //     return res.status(400).json({ success: false, message: "Invalid location JSON format" });
        // }
  
        // Create user
        const user = await User.create({
            fullName,
            email,
            password,
            gender,
            age,
            username: username.toLowerCase(),
            // location: parsedLocation,
            authProvider: "local",
            family: [] // Initialize empty family array
        });
  
        console.log("User successfully created:", user);
        await user.assignRandomAvatar(); 
        await user.save();
  
        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
        console.log("Generated Tokens:", { accessToken, refreshToken });
  
        const options = {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
        };
        const randomActivity = getRandomActivity();
        return res
            .status(201)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json({
                success: true,
                message: "User registered successfully",
                data: {
                    user: await User.findById(user._id).select("-password"),
                    accessToken,
                    suggestedActivity: randomActivity
                },
            });
  
    } catch (error) {
        console.error("Error during registration:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
});

export const getRandomActivity = () => {
    const randomIndex = Math.floor(Math.random() * additionalActivities.length);
    return additionalActivities[randomIndex];
};
  
const loginUser = asyncHandler(async (req, res) => {
    const { username, password } = req.body;
    console.log("Request body:", req.body);

    if (!username) {
        throw new ApiError(400, "Username or email is required");
    }

    const user = await User.findOne({ $or: [{ username }] });

    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    let passwordSet = false;

    if (!user.password && password) {
        await user.save();
        passwordSet = true;
    } else {
        const isPasswordValid = await user.isPasswordCorrect(password);
        if (!isPasswordValid) {
            throw new ApiError(401, "Invalid user credentials");
        }
    }

    const now = new Date();
    const lastLogin = user.lastLoginDate;

    if (!lastLogin) {
        user.streak = 1;
    } else {
        const diffInDays = Math.floor((now - lastLogin) / (1000 * 60 * 60 * 24));

        if (diffInDays === 1) {
            user.streak += 1;
        } else if (diffInDays > 1) {
            user.streak = 1;
        }
    }

    user.maxStreak = Math.max(user.maxStreak, user.streak);
    user.lastLoginDate = now;
    await user.save();

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
     console.log(accessToken)
    const loggedInUser = await User.findById(user._id)
        .select("-password -refreshToken")
        .populate('family', 'fullName email username'); // Populate family members

    const options = {
        httpOnly: true,
        secure: true,
    };

    const randomActivity = getRandomActivity();

    const responseMessage = passwordSet
        ? "Password has been set and user logged in successfully"
        : "User logged in successfully";

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200, {
                user: loggedInUser,
                accessToken,
                refreshToken,
                streak: user.streak,
                maxStreak: user.maxStreak,
                suggestedActivity: randomActivity,
            }, responseMessage),
        );
});

// Get family members
export const getFamilyMembers = asyncHandler(async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId)
            .populate('family', 'fullName email username')
            .select('family');

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        return res.status(200).json(
            new ApiResponse(
                200,
                { familyMembers: user.family },
                "Family members retrieved successfully"
            )
        );
    } catch (error) {
        console.error("Error getting family members:", error);
        throw new ApiError(500, error.message || "Error retrieving family members");
    }
});

export const saveTestReport = async (req, res) => {
    try {
        const { testName, result } = req.body;

        const encryptedResult = encryptData(result);
        let documentUrl = null;
    const documentLocalPath =
      (req?.files?.document && req.files.document[0]?.path) || null;
  
    if (documentLocalPath) {
      const documentUploaded = await uploadOnCloudinary(documentLocalPath);
  
      documentUrl = documentUploaded.url;
    }
    console.log(req.body);
        const encryptedDocumentUrl = documentUrl ? encryptData(documentUrl) : null;

        const newTestReport = new TestReport({
            user: req.user._id, // User ID from auth middleware
            testName,
            result: encryptedResult,
            documentUrl: encryptedDocumentUrl
        });

        await newTestReport.save();
        res.json({ success: true, message: "Test report saved securely!" });
    } catch (error) {
        console.error("Error saving test report:", error);
        res.status(500).json({ success: false, message: "Failed to save test report" });
    }
};

export const savePrescription = async (req, res) => {
    try {
        const { doctorName, medication, dosage } = req.body;
        console.log(medication)
        console.log(dosage)
        const encryptedMedication = encryptData(medication);
        const encryptedDosage = encryptData(dosage);

        const newPrescription = new Prescription({
            user: req.user._id,
            doctorName,
            medication: encryptedMedication,
            dosage: encryptedDosage
        });

        await newPrescription.save();
        res.json({ success: true, message: "Prescription saved securely!" });
    } catch (error) {
        console.error("Error saving prescription:", error);
        res.status(500).json({ success: false, message: "Failed to save prescription" });
    }
};

export const getPrescription = async (req, res) => {
    try {
        const prescriptions = await Prescription.find({ user: req.user._id });

        if (!prescriptions.length) {
            return res.status(404).json({ message: "No prescriptions found" });
        }

        res.json(prescriptions.map(prescription => ({
            doctorName: prescription.doctorName,
            medication: decryptData(prescription.medication),
            dosage: decryptData(prescription.dosage),
            date: prescription.date
        })));
        
    } catch (error) {
        console.error("Error retrieving prescriptions:", error);
        res.status(500).json({ success: false, message: "Failed to retrieve prescriptions" });
    }
};

/**
 * Get all test reports for a logged-in user
 */
export const getTestReport = async (req, res) => {
    try {
        const testReports = await TestReport.find({ user: req.user._id });

        // Ensure an empty array is returned if no test reports are found
        if (!testReports.length) return res.json([]);

        res.json(testReports.map(testReport => ({
            testName: testReport.testName,
            result: decryptData(testReport.result),
            documentUrl: testReport.documentUrl ? decryptData(testReport.documentUrl) : null,
            date: testReport.date
        })));
    } catch (error) {
        console.error("Error retrieving test report:", error);
        res.status(500).json([]); // Ensure array response even on failure
    }
};


export const addDiagnosisReport = async (req, res) => {
    try {
        const { doctorName, condition, notes, date } = req.body;

        const newReport = new DiagnosisReport({
            user: req.user._id, // User ID from middleware
            doctorName,
            condition: encryptData(condition),
            notes: encryptData(notes),
            date
        });

        await newReport.save();
        res.json({ success: true, message: "Diagnosis report saved securely!" });
    } catch (error) {
        console.error("Error saving diagnosis report:", error);
        res.status(500).json({ success: false, message: "Failed to save diagnosis report" });
    }
};

export const getDiagnosisReport = async (req, res) => {
    try {
        const diagnosisReports = await DiagnosisReport.find({ user: req.user._id });
        if (!diagnosisReports.length) return res.status(404).json({ message: "No diagnosis report found" });
        res.json(diagnosisReports.map(diagnosis=>({
            doctorName: diagnosis.doctorName,
            condition: decryptData(diagnosis.condition),
            notes: decryptData(diagnosis.notes),
            date: diagnosis.date
        })));
    } catch (error) {
        console.error("Error retrieving diagnosis report:", error);
        res.status(500).json({ success: false, message: "Failed to retrieve diagnosis report" });
    }
};

const getFamilyTest = async (req, res) => {
    try {
        const { familyMemberEmail } = req.body; // Email of the family member whose data is requested
        const requestingUser = req.user; // Authenticated user

        // Validate request
        if (!familyMemberEmail) {
            return res.status(400).json({ message: "Family member email is required." });
        }

        // Find the requested family member
        const requestedUser = await User.findOne({ email: familyMemberEmail });
        if (!requestedUser) {
            return res.status(404).json({ message: "Requested user not found." });
        }

        // Check if the requesting user has access to this user's data
        if (!requestingUser.family.includes(requestedUser._id)) {
            return res.status(403).json({ message: "You do not have access to this family member's records." });
        }

        // Retrieve the test report of the requested user
        const testReports = await TestReport.find({ user: requestedUser._id });

        if (!testReports.length) return res.status(404).json({ message: "No test report found for this user." });

        res.json(testReports.map(testReport=>({
            testName: testReport.testName,
            result: decryptData(testReport.result),
            documentUrl: testReport.documentUrl ? decryptData(testReport.documentUrl) : null,
            date: testReport.date
        })));
    } catch (error) {
        console.error("Error retrieving test report:", error);
        res.status(500).json({ success: false, message: "Failed to retrieve test report" });
    }
};
export const getUsers = asyncHandler(async (req, res) => {
    try {
      const users = await User.find({}, 'name email'); // Fetch only necessary fields
      res.status(200).json({ users });
    } catch (error) {
      console.error('Error fetching users:', error);
      throw new ApiError(500, 'Failed to fetch users');
    }
  });

  export const getDoctors = asyncHandler(async (req, res) => {
    try {
      const doctors = await Doctor.find({}, 'name email'); // Fetch only necessary fields
      res.status(200).json({ doctors });
    } catch (error) {
      console.error('Error fetching doctors:', error);
      throw new ApiError(500, 'Failed to fetch users');
    }
  });

const getFamPresc = async (req, res) => {
    try {
        const { familyMemberEmail } = req.body; // Email of the family member whose data is requested
        const requestingUser = req.user; // Authenticated user

        if (!familyMemberEmail) {
            return res.status(400).json({ message: "Family member email is required." });
        }

        const requestedUser = await User.findOne({ email: familyMemberEmail });
        if (!requestedUser) {
            return res.status(404).json({ message: "Requested user not found." });
        }

        if (!requestingUser.family.includes(requestedUser._id)) {
            return res.status(403).json({ message: "You do not have access to this family member's prescriptions." });
        }

        const prescriptions = await Prescription.find({ user: requestedUser._id });

        if (!prescriptions.length) return res.status(404).json({ message: "No prescription found for this user." });

        res.json(prescriptions.map(prescription=>({
            doctorName: prescription.doctorName,
            medication: decryptData(prescription.medication),
            dosage: decryptData(prescription.dosage),
            date: prescription.date
        })));
    } catch (error) {
        console.error("Error retrieving prescription:", error);
        res.status(500).json({ success: false, message: "Failed to retrieve prescription" });
    }
};

const getFamDiag = async (req, res) => {
    try {
        const { familyMemberEmail } = req.body; // Email of the family member whose data is requested
        const requestingUser = req.user; // Authenticated user

        if (!familyMemberEmail) {
            return res.status(400).json({ message: "Family member email is required." });
        }

        const requestedUser = await User.findOne({ email: familyMemberEmail });
        if (!requestedUser) {
            return res.status(404).json({ message: "Requested user not found." });
        }
        
        if (!requestingUser.family.includes(requestedUser._id)) {
            return res.status(403).json({ message: "You do not have access to this family member's diagnosis reports." });
        }

        const diagnosisReports = await DiagnosisReport.find({ user: requestedUser._id });

        if (!diagnosisReports.length) return res.status(404).json({ message: "No diagnosis report found for this user." });

        res.json(diagnosisReports.map(diagnosisReport=>({
            doctorName: diagnosisReport.doctorName,
            condition: decryptData(diagnosisReport.notes),
            notes: decryptData(diagnosisReport.notes),
            date: diagnosisReport.date
        })));
    } catch (error) {
        console.error("Error retrieving diagnosis report:", error);
        res.status(500).json({ success: false, message: "Failed to retrieve diagnosis report" });
    }
};
export {registerUser, loginUser, getFamilyTest, getFamPresc, getFamDiag, addFamilyMembers}