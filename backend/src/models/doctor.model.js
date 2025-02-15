import mongoose, {Schema} from "mongoose";
import bcrypt from 'bcryptjs';
import jwt from "jsonwebtoken";

const doctorSchema= new Schema({
    specification:
    [{
        type: String,
        required: true
    }],
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    about: String,
    email: {
      type: String,
      //required: true,
      unique: true,
      lowercase: true,
    },
    mobileNumber:
    {
      type: Number,
      required: true
    },
    yearexp:
    {
        type: Number,
        required: true
    },
   hospitals:[
        {
            type: String
        }],
    certifications:[
    {
        type: String
    }],
    password: String,
    rating:
    {
        type: Number
    },
    feedback:[
    {
        type: String
    }],
    availability: [
        {
            day: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
            slots: [
                {
                    startTime: { type: String, required: true }, // e.g., "14:30"
                    endTime: { type: String, required: true }   // e.g., "15:30"
                }
            ]
        }
    ],
    isAvailable:
    {
      type: Boolean,
      default: false
    }
});
doctorSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
  
    this.password = await bcrypt.hash(this.password, 10);
    next();
  });
  
  doctorSchema.methods.isPasswordCorrect = async function (password) {
    console.log("Entered:", `"${password}"`);
    console.log("Stored:", `"${this.password}"`);
    return await bcrypt.compare(password,this.password);
  };
  
  doctorSchema.methods.generateAccessToken = function () {
    return jwt.sign(
      {
        _id: this._id,
        email: this.email,
        fullName: this.fullName,
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
      },
    );
  };
  doctorSchema.methods.generateRefreshToken = function () {
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

export const Doctor= mongoose.model("Doctor", doctorSchema);