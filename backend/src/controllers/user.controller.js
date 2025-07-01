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
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get the equivalent of __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
export const getAllUsersWithDetails = async (req, res) => {
  try {
    const users = await User.find()
      .populate('prescriptions')
      .populate('testReports')
      .populate('family');

    res.status(200).json(users);
  } catch (err) {
    console.error("Error fetching users with full details:", err);
    res.status(500).json({ message: 'Failed to fetch users with details', error: err.message });
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
const createApprovalEmailTemplate = (requestingUser, token, recipientName) => {
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
            <p>Hello ${recipientName},</p>
            <p><strong>${requestingUser.fullName}</strong> has requested to add you as a family member, which would grant them access to view your medical records.</p>
            <p>For enhanced security, we've implemented a two-factor verification process. Please click the button below to proceed to our secure verification page:</p>
            <p style="text-align: center;">
             <form action="${process.env.BACKEND_URL}/api/users/verify-family-request/${token}" method="POST" style="display:inline;">
  <button type="submit" class="button" style="border:none; background:none; padding:0; font: inherit; cursor: pointer; color: inherit;">
    Verify Request
  </button>
</form>

            </p>
            <p>On the verification page, you'll need to:</p>
            <ol>
              <li>Confirm the requester's identity</li>
              <li>Record a brief voice confirmation</li>
              <li>Submit your approval</li>
            </ol>
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

  export const getVerificationPage = asyncHandler(async (req, res) => {
    try {
      console.log('Route hit');
      const { token } = req.params;
      
      // Verify the token but don't process approval yet
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      const { requesterId, recipientId } = decoded;
      
      // Find both users
      const requester = await User.findById(requesterId);
      const recipient = await User.findById(recipientId);
      
      if (!requester || !recipient) {
        throw new ApiError(404, "User not found");
      }
      
      // Render the verification page
      const verificationPage = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Family Request Verification</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f5f5f5; }
          .container { max-width: 800px; margin: 30px auto; padding: 20px; background-color: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { background-color: #4CAF50; color: white; padding: 15px; text-align: center; border-radius: 8px 8px 0 0; margin: -20px -20px 20px; }
          .content { padding: 20px 0; }
          .verifier { margin-bottom: 30px; border-bottom: 1px solid #eee; padding-bottom: 20px; }
          .requester-info { background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
          .button { 
            display: inline-block; 
            background-color: #4CAF50; 
            color: white; 
            padding: 12px 24px; 
            text-decoration: none; 
            border-radius: 5px; 
            border: none;
            cursor: pointer;
            font-size: 16px;
            margin-top: 10px;
          }
          .button:disabled {
            background-color: #cccccc;
            cursor: not-allowed;
          }
          .button-secondary {
            background-color: #f44336;
          }
          .voice-controls {
            display: flex;
            flex-direction: column;
            align-items: center;
            margin: 20px 0;
          }
          .record-button {
            display: inline-block;
            background-color: #f44336;
            color: white;
            width: 60px;
            height: 60px;
            border-radius: 50%;
            text-align: center;
            line-height: 60px;
            font-size: 24px;
            cursor: pointer;
            margin-bottom: 10px;
          }
          .recording {
            animation: pulse 1.5s infinite;
          }
          .hidden { display: none; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          .verification-steps {
            counter-reset: step;
            margin: 30px 0;
          }
          .step {
            position: relative;
            padding-left: 50px;
            margin-bottom: 20px;
          }
          .step:before {
            counter-increment: step;
            content: counter(step);
            position: absolute;
            left: 0;
            top: 0;
            width: 30px;
            height: 30px;
            background-color: #4CAF50;
            color: white;
            border-radius: 50%;
            text-align: center;
            line-height: 30px;
            font-weight: bold;
          }
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
          }
          #confirmText {
            font-size: 18px;
            font-weight: bold;
            margin: 20px 0;
            padding: 10px;
            background-color: #f0f8ff;
            border-radius: 5px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Family Request Verification</h1>
          </div>
          <div class="content">
            <h2>Hello ${recipient.fullName},</h2>
            
            <div class="requester-info">
              <h3>Request Details:</h3>
              <p><strong>${requester.fullName}</strong> (${requester.email}) has requested to add you as a family member.</p>
              <p>This will grant them access to view your medical records and health information.</p>
            </div>
            
            <div class="verification-steps">
              <div class="step">
                <h3>Verify Identity</h3>
                <p>Please confirm that you know <strong>${requester.fullName}</strong> and are comfortable sharing your health information with them.</p>
                <label>
                  <input type="checkbox" id="identityConfirmed"> Yes, I confirm this request is legitimate
                </label>
              </div>
              
              <div class="step">
                <h3>Voice Verification</h3>
                <p>For added security, please record yourself saying the following phrase:</p>
                <div id="confirmText">"I, ${recipient.fullName}, approve ${requester.fullName} to access my medical records."</div>
                
                <div class="voice-controls">
                  <div class="record-button" id="recordButton">
                    <i>🎤</i>
                  </div>
                  <p id="recordingStatus">Click to start recording</p>
                  <audio id="audioPlayback" controls class="hidden"></audio>
                </div>
              </div>
              
              <div class="step">
                <h3>Final Approval</h3>
                <p>Once you've completed the steps above, click the button below to approve this request:</p>
                <button id="approveButton" class="button" disabled>Approve Request</button>
                <button id="denyButton" class="button button-secondary">Deny Request</button>
              </div>
            </div>
          </div>
          <div class="footer">
            <p>This is a secure verification page. If you have any concerns, please contact support.</p>
          </div>
        </div>
        
        <script>
let mediaRecorder;
let audioChunks = [];
let audioBlob;
const recordButton = document.getElementById('recordButton');
const recordingStatus = document.getElementById('recordingStatus');
const audioPlayback = document.getElementById('audioPlayback');
const identityConfirmed = document.getElementById('identityConfirmed');
const approveButton = document.getElementById('approveButton');
const denyButton = document.getElementById('denyButton');
let transcription = "";

// Define checkEnableApproveButton function early to avoid scope issues
function checkEnableApproveButton() {
  approveButton.disabled = !(identityConfirmed.checked && audioBlob);
}

recordButton.addEventListener('click', () => {
  if (mediaRecorder && mediaRecorder.state === 'recording') {
    stopRecording();
  } else {
    startRecording();
  }
});

async function startRecording() {
  audioChunks = [];
  transcription = "";
  
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    
    // Set up speech recognition right away
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.continuous = true;
      recognition.interimResults = false;
      
      recognition.onresult = function(event) {
        // Get the latest transcription result
        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript;
        
        // Append to the full transcription
        transcription += transcript + " ";
        // Removed the recordingStatus.textContent line
      };
      
      recognition.onerror = function(event) {
        console.error('Speech recognition error:', event.error);
        // Removed the recordingStatus.textContent line
      };
      
      // Start recognition at the same time as recording
      recognition.start();
      
      // When recording stops, also stop recognition
      mediaRecorder.addEventListener('stop', () => {
        try {
          recognition.stop();
        } catch (e) {
          console.log('Recognition may have already stopped:', e);
        }
      });
    }

    // Handle the audio data from recording
    mediaRecorder.addEventListener('dataavailable', event => {
      audioChunks.push(event.data);
    });

    mediaRecorder.addEventListener('stop', () => {
      audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
      const audioUrl = URL.createObjectURL(audioBlob);
      audioPlayback.src = audioUrl;
      audioPlayback.classList.remove('hidden');
      
      // Check for negative words in transcription without updating status
      if (transcription) {
        const negativeWords = ['no', 'reject', 'decline', 'disapprove', 'cancel', 'hate', 'dislike', 'negative', 'stop', 'don\\'t'];
        const hasNegativeWords = negativeWords.some(word => 
          transcription.toLowerCase().includes(word.toLowerCase())
        );
        
        if (hasNegativeWords) {
          approveButton.disabled = true;
        } else {
          checkEnableApproveButton();
        }
      } else {
        checkEnableApproveButton();
      }
      
      recordButton.classList.remove('recording');
    });

    mediaRecorder.start();
    recordButton.classList.add('recording');
  } catch (err) {
    console.error('Error accessing microphone:', err);
  }
}
function stopRecording() {
  if (mediaRecorder) {
    mediaRecorder.stop();
    mediaRecorder.stream.getTracks().forEach(track => track.stop());
  }
}

identityConfirmed.addEventListener('change', checkEnableApproveButton);

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result.split(',')[1]; // remove data URL part
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

approveButton.addEventListener('click', async () => {
  try {
    approveButton.disabled = true;
    approveButton.textContent = 'Processing...';

    const base64Audio = await blobToBase64(audioBlob);

    const response = await fetch('/api/users/family/approve', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        token: '${token}',
        voiceRecording: base64Audio,
        transcription: transcription // Send the transcription along with the audio
      })
    });

    if (response.ok) {
      window.location.href = '${process.env.BACKEND_URL}/api/users/approval-success/${token}';
    } else {
      const errorData = await response.json();
      alert('Error: ' + (errorData.message || 'Failed to process approval'));
      approveButton.disabled = false;
      approveButton.textContent = 'Approve Request';
    }
  } catch (error) {
    console.error('Error submitting approval:', error);
    alert('Error submitting approval. Please try again.');
    approveButton.disabled = false;
    approveButton.textContent = 'Approve Request';
  }
});

denyButton.addEventListener('click', () => {
  if (confirm('Are you sure you want to deny this request?')) {
    window.location.href = '${process.env.BACKEND_URL}/api/users/approval-denied/${token}';
  }
});
</script>
</body>
      </html>
    `;
      return res.status(200).send(verificationPage);
    } catch (error) {
      console.error("Error displaying verification page:", error);
      
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
              <p>This verification link is no longer valid. Please request a new invitation.</p>
            </div>
          </body>
          </html>
        `;
        return res.status(400).send(htmlError);
      }
      
      throw new ApiError(500, error.message || "Error displaying verification page");
    }
  });

  export const addFamilyMembers = asyncHandler(async (req, res) => {
    try {
      const { familyMembers } = req.body; // Array of emails
      const userId = req.user._id; // Current user's ID from auth middleware
  
      if (!familyMembers ) {
        throw new ApiError(400, "Family members must be provided as an array of emails");
      }
  
      // Find the user
      const user = await User.findById(userId);
      if (!user) {
        throw new ApiError(404, "User not found");
      }
  
      // Find users by email (corrected query)
      const members = await User.find({ 
        email: { $in: familyMembers }, 
        _id: { $ne: userId } // Exclude the requesting user
      }, "_id email fullName");
      
      if (members.length === 0) {
        throw new ApiError(404, "No valid family members found");
      }
  
      // Create pending family requests
      const pendingRequests = [];
      
      // Send approval emails to each family member
      for (const member of members) {
        // Skip if this member is already in pending requests
        const alreadyPending = user.pendingFamilyRequests?.some(
          req => req.email === member.email && req.status === 'pending'
        );
        
        // Skip if this member is already a family member
        const alreadyFamily = user.family?.some(
          fam => fam.email === member.email
        );
        
        if (alreadyPending || alreadyFamily) {
          continue; // Skip this member
        }
        
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
          html: createApprovalEmailTemplate(user, token, member.fullName)
        };
        
        // Send email
        await transporter.sendMail(mailOptions);
        
        // Track pending request
        pendingRequests.push({
          email: member.email,
          fullName: member.fullName,
          userId: member._id, // Store the user ID for easy lookup later
          status: "pending",
          requestedAt: new Date(),
          approvalToken: token // Store the token for reference
        });
      }
      
      // Initialize pendingFamilyRequests array if it doesn't exist
      if (!user.pendingFamilyRequests) {
        user.pendingFamilyRequests = [];
      }
      
      // Add new pending requests to user document
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


  export const approveFamilyMember = asyncHandler(async (req, res) => {
    try {
      console.log('Route hit');
      const { token, voiceRecording, transcription } = req.body;
  
      if (!token || !voiceRecording) {
        return res.status(400).json({ success: false, message: "Missing token or voice recording" });
      }
  
      // Check transcription for negative words if it exists
      if (transcription) {
        console.log('Checking transcription:', transcription);
        const negativeWords = ['no', 'reject', 'decline', 'disapprove', 'cancel', 'hate', 'dislike', 'negative', 'stop', 'don\'t'];
        
        const hasNegativeWords = negativeWords.some(word => 
          transcription.toLowerCase().includes(word.toLowerCase())
        );
        
        if (hasNegativeWords) {
          return res.status(400).json({ 
            success: false, 
            message: "Approval rejected due to negative sentiment in voice recording" 
          });
        }
      }
  
      // Verify the token and extract the payload
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      const { requesterId, recipientId } = decoded;
  
      // Find the user who added the family member
      const user = await User.findById(requesterId);
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
  
      // Find the recipient user to get their details
      const recipientUser = await User.findById(recipientId);
      if (!recipientUser) {
        return res.status(404).json({ success: false, message: "Recipient user not found" });
      }
  
      // Initialize family array if it doesn't exist
      if (!user.family) {
        user.family = [];
      }
  
      // Check if recipient is already in the user's family
      const alreadyInFamily = user.family.some(memberId => 
        memberId.toString() === recipientUser._id.toString()
      );
      
      if (alreadyInFamily) {
        return res.status(400).json({ success: false, message: "User is already a family member" });
      }
  
      user.family.push(recipientUser._id);
      await user.save();
  
      return res.status(200).json({ success: true, message: "Family member approved successfully" });
    } catch (error) {
      console.error("Approval error:", error);
  
      // Token issues
      if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
        return res.status(401).json({ success: false, message: "Invalid or expired token" });
      }
  
      return res.status(500).json({ success: false, message: "Server error during approval" });
    }
  });

  

  export const approvalSuccessPage = asyncHandler(async (req, res) => {
    try {
      const { token } = req.params;
      
      // Verify the token to get user info for personalization
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      const { requesterId } = decoded;
      
      const requester = await User.findById(requesterId);
      
      const successPage = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Approval Successful</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; text-align: center; margin-top: 50px; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .success { color: #4CAF50; }
            .checkmark {
              width: 80px;
              height: 80px;
              border-radius: 50%;
              display: block;
              stroke-width: 2;
              stroke: #4CAF50;
              stroke-miterlimit: 10;
              margin: 10% auto;
              box-shadow: inset 0px 0px 0px #4CAF50;
              animation: fill .4s ease-in-out .4s forwards, scale .3s ease-in-out .9s both;
            }
            .checkmark__circle {
              stroke-dasharray: 166;
              stroke-dashoffset: 166;
              stroke-width: 2;
              stroke-miterlimit: 10;
              stroke: #4CAF50;
              fill: none;
              animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
            }
            .checkmark__check {
              transform-origin: 50% 50%;
              stroke-dasharray: 48;
              stroke-dashoffset: 48;
              animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
            }
            @keyframes stroke {
              100% { stroke-dashoffset: 0; }
            }
            @keyframes scale {
              0%, 100% { transform: none; }
              50% { transform: scale3d(1.1, 1.1, 1); }
            }
            @keyframes fill {
              100% { box-shadow: inset 0px 0px 0px 30px #4CAF50; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <svg class="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
              <circle class="checkmark__circle" cx="26" cy="26" r="25" fill="none"/>
              <path class="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
            </svg>
            <h1 class="success">Approval Successful!</h1>
            <p>You have successfully approved ${requester ? requester.fullName : 'the'}'s request to add you as a family member.</p>
            <p>Your voice verification has been recorded and the relationship has been established.</p>
            <p>You can now close this window.</p>
          </div>
        </body>
        </html>
      `;
      
      return res.status(200).send(successPage);
    } catch (error) {
      console.error("Error displaying success page:", error);
      
      // If token is invalid, still show a generic success page
      const genericSuccessPage = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Approval Successful</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; text-align: center; margin-top: 50px; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .success { color: #4CAF50; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1 class="success">Approval Successful!</h1>
            <p>You have successfully approved the request to add you as a family member.</p>
            <p>Your voice verification has been recorded and the relationship has been established.</p>
            <p>You can now close this window.</p>
          </div>
        </body>
        </html>
      `;
      
      return res.status(200).send(genericSuccessPage);
    }
  });
  
  // Denial page route
  export const approvalDeniedPage = asyncHandler(async (req, res) => {
    const deniedPage = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Request Denied</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; text-align: center; margin-top: 50px; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .denied { color: #f44336; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1 class="denied">Request Denied</h1>
          <p>You have chosen to deny this family member request.</p>
          <p>No access has been granted and the request has been canceled.</p>
          <p>You can now close this window.</p>
        </div>
      </body>
      </html>
    `;
    
    return res.status(200).send(deniedPage);
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

        const {
            fullName,
            email,
            password,
            gender,
            age,
            current_height,
            current_weight,
            pregnancy_trimester,
            expected_due_date,
            user_name 
        } = req.body;

        if ([email, password].some((field) => field?.toString().trim() === "")) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        // Check if user exists only by email
        const existedUser = await User.findOne({ email });
        if (existedUser) {
            return res.status(409).json({ success: false, message: "User with this email already exists" });
        }

        // If fullName is not provided, generate from user_name
        let computedFullName = fullName;
        if (!computedFullName && user_name) {
            // Capitalize first letter, stop at first number or space
            let result = '';
            for (let i = 0; i < user_name.length; i++) {
                const char = user_name[i];
                if (char === ' ' || !isNaN(Number(char))) break;
                result += i === 0 ? char.toUpperCase() : char;
            }
            computedFullName = result;
        }

        const user = await User.create({
            fullName: computedFullName,
            email,
            password,
            gender,
            age,
            current_height,
            current_weight,
            pregnancy_trimester,
            expected_due_date,
            username: user_name ? user_name.toLowerCase() : undefined,
            authProvider: "local",
            family: []
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
    const { email, password } = req.body;
    console.log("Request body:", req.body);

    if (!email || !password) {
        throw new ApiError(400, "Email and password are required");
    }

    const user = await User.findOne({ email });

    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials");
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
            }, "User logged in successfully"),
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

export const saveTestReport = asyncHandler(async (req, res) => {
    try {
      console.log("Route hit");
      const { userEmail, testName, result, documentBase64, fileName } = req.body;
      
      if (!testName || !result) {
        throw new ApiError(400, "Test name and result are required");
      }
  
      // Use authenticated user directly from middleware
      const user = req.user;
      
      let documentUrl = null;
      
      // Handle base64 file if provided
      if (documentBase64) {
        // Create temp directory path
        const tempDir = path.join(__dirname, '../../public/temp');
        
        // Create temp directory if it doesn't exist
        if (!fs.existsSync(tempDir)) {
          fs.mkdirSync(tempDir, { recursive: true });
        }
        
        // Create a temporary file path
        const tempFilePath = path.join(tempDir, fileName || 'upload.pdf');
        
        // Extract the base64 data part (remove metadata if present)
        const base64Data = documentBase64.split(';base64,').pop();
        
        // Write the file to disk
        fs.writeFileSync(tempFilePath, Buffer.from(base64Data, 'base64'));
        
        try {
          // Upload to Cloudinary
          const documentUploaded = await uploadOnCloudinary(tempFilePath, {folder: "FitFull"});
          documentUrl = documentUploaded.url;
        } catch (error) {
          console.error("Error uploading to Cloudinary:", error);
          throw new ApiError(500, "Error uploading document");
        } finally {
          // Clean up the temporary file (in a try-catch to handle if file doesn't exist)
          try {
            if (fs.existsSync(tempFilePath)) {
              fs.unlinkSync(tempFilePath);
            }
          } catch (unlinkError) {
            console.error("Error removing temp file:", unlinkError);
            // Continue execution even if temp file removal fails
          }
        }
      } else {
        // Handle file upload through multer if no base64
        const documentLocalPath = 
          (req?.files?.document && req.files.document[0]?.path) || null;
      
        if (documentLocalPath) {
          const documentUploaded = await uploadOnCloudinary(documentLocalPath);
          documentUrl = documentUploaded.url;
        }
      }
      
      const encryptedDocumentUrl = documentUrl ? encryptData(documentUrl) : null;
      
      // Create new test report
      const newTestReport = new TestReport({
        user: user._id,
        testName,
        result: encryptData(result),
        documentUrl: encryptedDocumentUrl,
      });
  
      await newTestReport.save();
  
      res.status(201).json({
        success: true,
        message: "Test report saved securely!",
        testReport: newTestReport,
      });
    } catch (error) {
      console.error("Error saving test report:", error);
      throw new ApiError(500, error.message || "Failed to save test report");
    }
  });

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
      console.log("Starting getFamilyTest handler");
      const { familyMemberEmail } = req.body;
      console.log("Family member email:", familyMemberEmail);
      const requestingUser = req.user;
      console.log("Requesting user ID:", requestingUser._id);

      // Validate request
      if (!familyMemberEmail) {
          console.log("Missing email in request");
          return res.status(400).json({ message: "Family member email is required." });
      }

      // Find the requested family member
      console.log("Looking up requested user");
      const requestedUser = await User.findOne({ email: familyMemberEmail });
      
      if (!requestedUser) {
          console.log("Requested user not found");
          return res.status(404).json({ message: "Requested user not found." });
      }
      console.log("Found requested user:", requestedUser._id);

      // Check if the requesting user has access
      console.log("Checking family access, user family array:", requestingUser.family);
      if (!requestingUser.family.includes(requestedUser._id)) {
          console.log("Access denied - not in family list");
          return res.status(403).json({ message: "You do not have access to this family member's records." });
      }
      console.log("Access verified");

      // Retrieve the test reports
      console.log("Finding test reports for user:", requestedUser._id);
      const testReports = await TestReport.find({ user: requestedUser._id });
      console.log("Test reports found:", testReports.length);

      if (!testReports.length) {
          console.log("No test reports found");
          return res.status(404).json({ message: "No test report found for this user." });
      }

      console.log("Processing reports for response");
      const processedReports = testReports.map(testReport => ({
          testName: testReport.testName,
          result: decryptData(testReport.result),
          documentUrl: testReport.documentUrl ? decryptData(testReport.documentUrl) : null,
          date: testReport.date
      }));
      
      console.log("Sending response");
      res.json(processedReports);
  } catch (error) {
      console.error("Error retrieving test report:", error);
      res.status(500).json({ success: false, message: "Failed to retrieve test report" });
  }
};

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
export {registerUser, loginUser, getFamilyTest, getFamPresc, getFamDiag}