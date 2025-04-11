import mongoose, { Schema } from "mongoose"
import bcrypt from 'bcryptjs';
import jwt from "jsonwebtoken";

const healthDataSchema = new Schema({
  steps: { type: Number, default: 0 },
  heartRate: { type: Number, default: 0 },
  sleep: { type: Number, default: 0 },
  calories: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now },
});

const userSchema = new Schema(
  {
    username: {
      type: String,
      //required: true,
      unique: true,
      minLength: 10,
      maxLength: 30,
      sparse:true
    },
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: function () {
        return !this.authProvider;
      },
    },
    healthData: { type: healthDataSchema, default: {} },
    avatar: {
      type: String, // Profile picture URL
    },
    age: {
      type: Number,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      //required: true,
    },
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local", // Tracks if user registered via Google/Spotify/local signup
    },
    googleId: {
      type: String, // Stores Google OAuth ID
      unique: true,
      sparse: true, // Allows null values while enforcing uniqueness
    },
    spotifyId: {
      type: String, // Stores Spotify OAuth ID
      unique: true,
      sparse: true,
    },
    pendingFamilyRequests: [{
      email: String,
      fullName: String,
      status: {
        type: String,
        enum: ['pending', 'approved', 'denied'],
        default: 'pending'
      },
      voiceVerification: String, // Path to stored voice file
      requestedAt: Date,
      approvedAt: Date
    }], 
    tokens: {
      googleFitToken: String,
      googleFitTokenExpiry: Date,
      refreshToken: String, // General refresh token for session handling
      spotifyAccessToken: String, // Spotify access token
      spotifyRefreshToken: String, // Spotify refresh token (to get new access tokens)
    },
    location: {
      type: {
        type: String,
        enum: ["Point"], // GeoJSON type for geospatial data
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
      },
      address: {
        type: String, // Human-readable address
      },
    },
    progress: {
      type: Number,
      default: 0, // Percentage progress if it's a goal (e.g., 0-100%)
    },
    lastLoginDate: {
      type: Date,
    },
    selectedDevice: String,
    issues: [
      {
        type: Schema.Types.ObjectId,
        ref: "Issue",
      },
    ],
    family: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    streak: {
      type: Number,
      default: 0,
    },
    maxStreak: {
      type: Number,
      default: 0,
    },
    achievements: {
      type: String,
    },
    devices: [
      {
        model: String,  // Stores the device model
        addedAt: { type: Date, default: Date.now }  // Stores the timestamp
      }
    ],
  
    onboardingData: {
      symptoms: { type: [String], default: [] },
      chronicIllnesses: { type: [String], default: [] },
      allergies: { type: String, default: "" },
      stressLevel: { type: String, default: "" },
      exerciseFrequency: { type: String, default: "" },
      diet: { type: String, default: "" },
      smokingAlcohol: { type: String, default: "" },
      medications: { type: String, default: "" },
      hospitalized: { type: String, default: "" },
      familyHistory: { type: [String], default: [] },
    },
    recommendedDoctors: { type: [String], default: [] }, 
    prescriptions: [{ type: Schema.Types.ObjectId, ref: "Prescription" }],
    testReports: [{ type: Schema.Types.ObjectId, ref: "TestReport" }],
    diagnoses: [{ type: Schema.Types.ObjectId, ref: "Diagnosis" }],

  },
  { timestamps: true }
);
userSchema.index({ location: "2dsphere" });

userSchema.methods.assignRandomAvatar = async function () {
  const male_avatars = [
    "https://tse2.mm.bing.net/th?id=OIP.Yj7V4oP9Noi8p77a8Oyd5QHaJA&pid=Api&P=0&h=180",
    "https://tse2.mm.bing.net/th?id=OIP.zxQil4x4JMZtZm-7tUNF1QHaH_&pid=Api&P=0&h=180",
    "https://tse3.mm.bing.net/th?id=OIP.CHiM-UEsM0jqElrYHEftiwHaHa&pid=Api&P=0&h=180",
    "https://tse2.mm.bing.net/th?id=OIP.2Be2070ayk9DYoV9xRXFEgHaHa&pid=Api&P=0&h=180"
  ];

  const female_avatars = [
    "https://tse3.mm.bing.net/th?id=OIP.GYuOR-Ox5UCX3-R_Qz49aQHaHa&pid=Api&P=0&h=180",
    "https://tse1.mm.bing.net/th?id=OIP.HJ_CpQ29Bd9OeU98QDMe-gHaHa&pid=Api&P=0&h=180",
    "https://tse3.mm.bing.net/th?id=OIP.KpNNDej-Xh6Njm4Xf-15BQHaHa&pid=Api&P=0&h=180",
    "https://tse1.mm.bing.net/th?id=OIP.opldioYHZSr8ja6_DlApqgHaHa&pid=Api&P=0&h=180"
  ];

  if (!this.avatar) {
    if (this.gender === "M") {
      this.avatar = male_avatars[Math.floor(Math.random() * male_avatars.length)];
    } else if (this.gender === "F") {
      this.avatar = female_avatars[Math.floor(Math.random() * female_avatars.length)];
    }
    await this.save(); // Save the changes to the database
  }
};

// Pre-save hook for password hashing
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

      userSchema.methods.isPasswordCorrect = async function (password) {
        return await bcrypt.compare(password, this.password);
      };
      
      userSchema.methods.generateAccessToken = function () {
        return jwt.sign(
          {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName,
          },
          process.env.ACCESS_TOKEN_SECRET,
          {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
          },
        );
      };
      userSchema.methods.generateRefreshToken = function () {
        return jwt.sign(
          {
            _id: this._id,
          },
          process.env.REFRESH_TOKEN_SECRET,
          {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
          },
        );
      };


export const User= mongoose.model("User", userSchema)