import React, { useState } from "react";
import axios from "axios";
import DoctorSignUp from "./DoctorSignUp";
import { useNavigate } from "react-router-dom";
import { use } from "react";

const DoctorSignIn = () => {
  const [isSignUp, setIsSignUp] = useState(false); // Toggle between SignIn & SignUp
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  // const [otp, setOtp] = useState("");
  // const [otpSent, setOtpSent] = useState(false);
  // const [otpError, setOtpError] = useState(false);
  // const [otpTimer, setOtpTimer] = useState(30);
  const [showPassword, setShowPassword] = useState(false);
  const navigate=useNavigate();

  // const handleSendOtp = async () => {
  //   if (phoneNumber.length === 10) {
  //     try {
  //       const response = await axios.post("http://localhost:8000/api/doctor/send-otp", {
  //         mobileNumber: phoneNumber,
  //       });
  //       if (response.data.success) {
  //         setOtpSent(true);
  //         setOtpError(false);
  //         alert("OTP sent to your phone!");
  //         startOtpTimer();
  //       }
  //     } catch (error) {
  //       alert("Error sending OTP: " + error.response.data.error);
  //     }
  //   } else {
  //     alert("Please enter a valid phone number.");
  //   }
  // };

  // const startOtpTimer = () => {
  //   let timer = 30;
  //   const intervalId = setInterval(() => {
  //     timer -= 1;
  //     setOtpTimer(timer);
  //     if (timer === 0) {
  //       clearInterval(intervalId);
  //     }
  //   }, 1000);
  // };

  // const handleVerifyOtp = async () => {
  //   if (otp.length !== 6) {
  //     setOtpError(true);
  //     alert("Invalid OTP.");
  //     return;
  //   }

  //   try {
  //     const response = await axios.post("http://localhost:8000/api/doctor/verify-otp", {
  //       mobileNumber: phoneNumber,
  //       otp,
  //     });

  //     if (response.data.success) {
  //       alert("OTP verified successfully!");
  //     }
  //   } catch (error) {
  //     setOtpError(true);
  //     alert("Error verifying OTP: " + error.response.data.message);
  //   }
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:8000/api/doctor/login", {
        email,
        mobileNumber: phoneNumber,
        password,
      });

      if (response.status === 200) {
        const { accessToken } = response.data.data;
        sessionStorage.setItem("accessToken", accessToken);
        console.log(accessToken)
        alert("Login successful!");
        navigate("/doctor-dashboard");
      }
    } catch (error) {
      alert("Error during login: " + error.response.data.message);
    }
  };

  if (isSignUp) {
    return <DoctorSignUp />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-black via-blue-950 to-black text-white px-6">
      <h1 className="text-4xl font-bold text-yellow-600 mb-6">Doctor Signin</h1>

      <div className="w-full max-w-md p-6 bg-gray-900 shadow-lg rounded-lg flex flex-col items-center">
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div className="flex flex-col">
            <label htmlFor="email" className="text-sm font-medium text-gray-300">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="mt-1 p-2 w-full bg-gray-800 text-white border border-gray-700 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="phoneNumber" className="text-sm font-medium text-gray-300">
              Phone Number
            </label>
            <input
              id="phoneNumber"
              type="tel"
              className="mt-1 p-2 w-full bg-gray-800 text-white border border-gray-700 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Enter your phone number"
              maxLength={10}
              required
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="password" className="text-sm font-medium text-gray-300">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className="mt-1 p-2 w-full bg-gray-800 text-white border border-gray-700 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-300"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* OTP Field (Commented out for now) */}
          {/* {otpSent && (
            <div className="flex flex-col">
              <label htmlFor="otp" className="text-sm font-medium text-gray-300">OTP</label>
              <input
                id="otp"
                type="text"
                className="mt-1 p-2 w-full bg-gray-800 text-white border border-gray-700 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter OTP"
                maxLength={6}
                required
              />
              {otpError && <span className="text-red-500 text-sm">Invalid OTP. Please try again.</span>}
            </div>
          )} */}

          <button
            type="submit"
            className="w-full px-4 py-2 font-semibold bg-green-500 text-white rounded-md hover:bg-green-600 transition-all"
          >
            Submit
          </button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-gray-400">
            Don't have an account?{" "}
            <span
              className="text-indigo-400 hover:underline cursor-pointer"
              onClick={() => setIsSignUp(true)} // Toggle to SignUp
            >
              Click here to sign up
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default DoctorSignIn;