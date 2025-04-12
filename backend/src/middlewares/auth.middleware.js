import { ApiError } from "../utils/API_Error.js";
import asyncHandler from "../utils/asynchandler.utils.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
//import { Parent } from "../models/parent.model.js";
import { Doctor } from "../models/doctor.model.js";

// Helper function
const verifyJWT = async (token, model, role) => {
  try {
    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // Modified this line to only exclude password but keep tokens
    const entity = await model.findById(decodedToken?._id).select("+tokens");

    if (!entity) {
      throw new ApiError(401, `Invalid Access Token for ${role}`);
    }

    return entity;
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      throw new ApiError(401, "Invalid Token");
    }
    if (error.name === "TokenExpiredError") {
      throw new ApiError(401, "Token Expired");
    }
    throw new ApiError(401, error?.message || "Invalid access token");
  }
};

export const user_verifyJWT = asyncHandler(async (req, _, next) => {
  console.log("Cookies received:", req.cookies); 
  console.log("user_verifyJWT middleware called"); // Debugging line
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");
  const user = await verifyJWT(token, User, "User")
  req.user = user; // Attach the user to the request object
  next();
});

export const doctor_verifyJWT = asyncHandler(async (req, _, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");
  const doctor = await verifyJWT(token, Doctor, "Doctor");
  req.doctor = doctor;
  req.isDoctor= true
  next();
});

export const verifyUserOrDoctor = asyncHandler(async (req, _, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  try {
    const doctor = await verifyJWT(token, Doctor, "Doctor");
    req.doctor = doctor;
    req.isDoctor = true;
    req.isUser = false;
    next();
  } catch (error) {
    try {
      const user = await verifyJWT(token, User, "User");
      req.user = user;
      req.isUser = true;
      req.isDoctor = false;
      next();
    } catch (userError) {
      throw new ApiError(401, "Invalid token or unauthorized");
    }
  }
});