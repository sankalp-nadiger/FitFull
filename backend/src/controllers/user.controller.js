import {User} from "../models/user.model.js"
import asyncHandler from "../utils/asynchandler.utils.js";
const generateAccessAndRefreshTokens = async (userId) => {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new ApiError(404, "User not found");
      }
  
      console.log("User found:", user); 
  
      const accessToken = user.generateAccessToken();
      const refreshToken = user.generateRefreshToken();
  
      user.refreshToken = refreshToken; // Store the refresh token in the user document
      await user.save({ validateBeforeSave: false });
  
      return { accessToken, refreshToken };
    } catch (error) {
      console.error("Error generating tokens:", error); // Log the error for debugging
      throw new ApiError(
        500,
        "Something went wrong while generating refresh and access token"
      );
    }
  };
  
const registerUser = asyncHandler(async (req, res) => {
    try {
        const { fullName, email, username, password, gender, age, location } = req.body;
    
        if ([fullName, email, username, password].some((field) => field?.trim() === "")) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }
    
        // Check if user exists
        const existedUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existedUser) {
            return res.status(409).json({ success: false, message: "User with email or username already exists" });
        }
  
        // Process location
        let parsedLocation;
        try {
            parsedLocation = JSON.parse(location);
            if (!parsedLocation.type || !parsedLocation.coordinates) {
                throw new Error("Invalid location format");
            }
        } catch (error) {
            return res.status(400).json({ success: false, message: "Invalid location JSON format" });
        }
  
        // Create user
        const user = await User.create({
            fullName,
            email,
            password,
            gender,
            age,
            username: username.toLowerCase(),
            location: parsedLocation,
            authProvider: "local"
        });
  
        console.log("User successfully created:", user);
        await user.assignRandomAvatar(); 
        await user.save();
  
        // Generate tokens
        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
        console.log("Generated Tokens:", { accessToken, refreshToken });
  
        // Cookie options
        const options = {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
        };
  
        // Send response
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

  const getRandomActivity = () => {
    const randomIndex = Math.floor(Math.random() * additionalActivities.length);
    return additionalActivities[randomIndex];
  };
  
  const loginUser = asyncHandler(async (req, res) => {
    const { username, password, email } = req.body;
    console.log("Request body:", req.body);

    if (!username && !email) {
        throw new ApiError(400, "Username or email is required");
    }

    // Find user by username or email
    const user = await User.findOne({ $or: [{ username }, { email }] });

    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    let passwordSet = false;

    // Check if user signed up with OAuth but is trying to log in with a password
    if (!user.password && password) {
        await user.save();
        passwordSet = true;  // Flag set to true since password is being set
    } else {
        // Regular password authentication
        const isPasswordValid = await user.isPasswordCorrect(password);
        if (!isPasswordValid) {
            throw new ApiError(401, "Invalid user credentials");
        }
    }

    // Streak logic
    const now = new Date();
    const lastLogin = user.lastLoginDate;

    if (!lastLogin) {
        user.streak = 1; // First login
    } else {
        const diffInDays = Math.floor((now - lastLogin) / (1000 * 60 * 60 * 24));

        if (diffInDays === 1) {
            user.streak += 1; // Continue streak
        } else if (diffInDays > 1) {
            user.streak = 1; // Reset streak
        }
    }

    // Update max streak
    user.maxStreak = Math.max(user.maxStreak, user.streak);

    // Update last login date
    user.lastLoginDate = now;
    await user.save();

    // Generate JWT tokens
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    // Remove sensitive info
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true,
    };

    // Suggested activity
    const randomActivity = getRandomActivity();

    // Response Message: Password set or existing password validated
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

export {registerUser, loginUser}