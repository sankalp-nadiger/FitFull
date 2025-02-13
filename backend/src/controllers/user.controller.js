import {User} from "../models/user.model.js"
import { ApiError } from "../utils/API_Error.js";
import ApiResponse from "../utils/API_Response.js";
import asyncHandler from "../utils/asynchandler.utils.js";
import { Prescription } from "../models/prescription.model.js";
import { TestReport } from "../models/TestReport.model.js";
import { Diagnosis } from "../models/Diagnoses.model.js";
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

// New function to add family members
export const addFamilyMembers = asyncHandler(async (req, res) => {
    try {
        const { familyMembers } = req.body;
        const userId = req.user._id; // Get the current user's ID from the auth middleware

        if (!familyMembers || !Array.isArray(familyMembers)) {
            throw new ApiError(400, "Family members must be provided as an array");
        }

        // Find the user
        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError(404, "User not found");
        }

        // Initialize family array if it doesn't exist
        if (!user.family) {
            user.family = [];
        }

        // Validate and add each family member
        for (const memberId of familyMembers) {
            // Check if the member exists
            const memberExists = await User.findById(memberId);
            if (!memberExists) {
                throw new ApiError(404, `Family member with ID ${memberId} not found`);
            }

            // Check if member is already in family
            if (!user.family.includes(memberId)) {
                user.family.push(memberId);
            }
        }

        // Save the updated user
        await user.save();

        // Fetch the updated user with populated family members
        const updatedUser = await User.findById(userId)
            .populate('family', 'fullName email username')
            .select('-password -refreshToken');

        return res.status(200).json(
            new ApiResponse(
                200,
                { user: updatedUser },
                "Family members added successfully"
            )
        );
    } catch (error) {
        console.error("Error adding family members:", error);
        throw new ApiError(500, error.message || "Error adding family members");
    }
});

// Function to remove family members
export const removeFamilyMember = asyncHandler(async (req, res) => {
    try {
        const { memberId } = req.body;
        const userId = req.user._id;

        if (!memberId) {
            throw new ApiError(400, "Member ID is required");
        }

        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError(404, "User not found");
        }

        // Remove the member from the family array
        user.family = user.family.filter(id => id.toString() !== memberId);
        await user.save();

        const updatedUser = await User.findById(userId)
            .populate('family', 'fullName email username')
            .select('-password -refreshToken');

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
                },
            });
  
    } catch (error) {
        console.error("Error during registration:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
});

// const getRandomActivity = () => {
//     const randomIndex = Math.floor(Math.random() * additionalActivities.length);
//     return additionalActivities[randomIndex];
// };
  
const loginUser = asyncHandler(async (req, res) => {
    const { username, password, email } = req.body;
    console.log("Request body:", req.body);

    if (!username && !email) {
        throw new ApiError(400, "Username or email is required");
    }

    const user = await User.findOne({ $or: [{ username }, { email }] });

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

    //const randomActivity = getRandomActivity();

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
                //suggestedActivity: randomActivity,
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


/**
 * Get all prescriptions assigned to a specific user
 */
export const getUserPrescriptions = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming authentication middleware sets req.user

    const prescriptions = await Prescription.find({ user: userId }).populate("user", "name email");

    if (!prescriptions.length) {
      return res.status(404).json({ message: "No prescriptions found for this user." });
    }

    res.status(200).json({ success: true, prescriptions });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};


/**
 * Get all test reports for a specific user
 */
export const getUserTestReports = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming authentication middleware sets req.user

    const reports = await TestReport.find({ user: userId }).populate("user", "name email");

    if (!reports.length) {
      return res.status(404).json({ message: "No test reports found for this user." });
    }

    res.status(200).json({ success: true, reports });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};


/**
 * Get all diagnoses for a specific user
 */
export const getUserDiagnoses = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming authentication middleware sets req.user

    const diagnoses = await Diagnosis.find({ user: userId }).populate("user", "name email");

    if (!diagnoses.length) {
      return res.status(404).json({ message: "No diagnoses found for this user." });
    }

    res.status(200).json({ success: true, diagnoses });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};


export {registerUser, loginUser}