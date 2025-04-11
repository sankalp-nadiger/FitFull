import React, { useState } from "react";
import axios from "axios";
import DoctorSignUp from "./DoctorSignUp";
import { useNavigate } from "react-router-dom";
import "./DoctorSignIn.css"; // Make sure to create this file with the CSS content

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
  //       const response = await axios.post(`${import.meta.env.VITE_BASE_API_URL}/api/doctor/send-otp`, {
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
  //     const response = await axios.post(`${import.meta.env.VITE_BASE_API_URL}/api/doctor/verify-otp`, {
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
  async function signInWithGoogle() {
    navigate("/in-loading");
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${import.meta.env.VITE_BASE_API_URL}/api/doctor/login`, {
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-teal-900 via-cyan-900 to-blue-900 px-4 py-8">
      <div className="w-full max-w-md">
        
        <div className="bg-white rounded-lg shadow-xl overflow-hidden relative">
          <div className="p-6 bg-gradient-to-r from-teal-500 to-cyan-600">
            <div className="flex justify-center mb-4">
              <img
                src="/api/placeholder/80/80"
                alt="Welcome"
                className="w-20 h-20 rounded-full bg-white p-2 animate-pulse"
              />
            </div>
            <h2 className="text-2xl font-bold text-center text-white">
              {isSignUp ? "Doctor Sign Up" : "Doctor Sign In"}
            </h2>
          </div>

          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="email" className="block text-gray-700 font-medium">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="phoneNumber" className="block text-gray-700 font-medium">Phone Number</label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  placeholder="Enter your phone number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  maxLength={10}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="block text-gray-700 font-medium">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 px-2 py-1 text-sm text-teal-600 hover:text-teal-800"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg transition-all duration-200 flex items-center justify-center"
              >
                Submit
              </button>
            </form>

            <div className="mt-6">
              <button
                onClick={signInWithGoogle}
                className="w-full py-3 px-4 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition-all duration-200 flex items-center justify-center"
              >
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032 s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2 C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
                </svg>
                Sign in with Google
              </button>
            </div>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                {isSignUp ? "Already have an account? " : "Don't have an account? "}
                <span
                  className="text-teal-600 hover:text-teal-800 font-medium cursor-pointer"
                  onClick={() => setIsSignUp(!isSignUp)}
                >
                  {isSignUp ? "Sign in here" : "Sign up here"}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Animated Background Elements */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-teal-500 rounded-full opacity-10 animate-blob"></div>
        <div className="absolute top-3/4 left-2/3 w-48 h-48 bg-cyan-500 rounded-full opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/3 w-40 h-40 bg-blue-500 rounded-full opacity-10 animate-blob animation-delay-4000"></div>
      </div>
    </div>
  );
};

export default DoctorSignIn;