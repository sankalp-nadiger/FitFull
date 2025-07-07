import React, { useState } from "react";
import axios from "axios";
import DoctorLogUp from "./DoctorSignUp2";
import { useNavigate } from "react-router-dom";

const DoctorLogIn = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  async function signInWithGoogle() {
    navigate("/in-loading");
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_API_URL}/api/doctor/login`,
        {
          email,
          mobileNumber: phoneNumber,
          password,
        }
      );

      if (response.status === 200) {
        const { accessToken } = response.data.data;
        sessionStorage.setItem("accessToken", accessToken);
        alert("Login successful!");
        navigate("/doctor-dashboard");
      }
    } catch (error) {
      alert("Error during login: " + error.response.data.message);
    }
  };

  if (isSignUp) return <DoctorLogUp />;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#fff9e9] px-4 py-8 relative overflow-hidden" style={{backgroundImage: "url('/bi.jpg')", backgroundSize: 'cover', backgroundPosition: 'center'}}>
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-2xl">
          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-[#638473] to-[#c17754]">
            <div className="flex justify-center mb-4">
              <img
                src="/aj logo.jpg"
                alt="Logo"
                className="w-20 h-20 rounded-full bg-white p-2 animate-pulse"
              />
            </div>
            <h2 className="text-2xl font-bold text-center text-[#fff9e9]">
              Doctor Sign In
            </h2>
          </div>

          {/* Form */}
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5 text-[#403c39]">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block font-semibold mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#638473] focus:border-[#638473]"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {/* Phone Number */}
              <div>
                <label htmlFor="phoneNumber" className="block font-semibold mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#638473] focus:border-[#638473]"
                  placeholder="Enter your phone number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  maxLength={10}
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block font-semibold mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#638473] focus:border-[#638473]"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-[#638473] font-medium"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3 px-4 bg-[#638473] hover:bg-[#506b5a] text-white font-bold rounded-lg transition duration-200"
              >
                Submit
              </button>
            </form>

            {/* Sign in with Google */}
            <div className="mt-6">
              <button
                onClick={signInWithGoogle}
                className="w-full py-3 px-4 bg-[#c17754] hover:bg-[#a66240] text-white font-bold rounded-lg flex items-center justify-center transition duration-200"
              >
                <svg
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032 s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2 C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
                </svg>
                Sign in with Google
              </button>
            </div>

            {/* Toggle Sign In/Up */}
            <div className="mt-6 text-center">
              <p className="text-[#403c39]">
                Don&apos;t have an account?{" "}
                <span
                  className="text-[#c17754] font-semibold cursor-pointer hover:underline"
                  onClick={() => setIsSignUp(true)}
                >
                  Sign up here
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Animated Background Blobs */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-[#638473] rounded-full opacity-10 animate-blob"></div>
        <div className="absolute top-3/4 left-2/3 w-48 h-48 bg-[#c17754] rounded-full opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/3 w-40 h-40 bg-[#ffd8b7] rounded-full opacity-10 animate-blob animation-delay-4000"></div>
      </div>
    </div>
  );
};

export default DoctorLogIn;
