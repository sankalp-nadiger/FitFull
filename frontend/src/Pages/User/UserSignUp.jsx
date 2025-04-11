import React, { useState, useRef } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import UserSignIn from "./UserSignIn";

const UserSignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    username: "",
    password: "",
    gender: "Male",
    age: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [profilePic, setProfilePic] = useState(null);
  const [isDraggingProfile, setIsDraggingProfile] = useState(false);
  const [isSignIn, setIsSignIn] = useState(false);
  
  const profileInputRef = useRef(null);
  if (isSignIn) {
    return <UserSignIn />;
  }
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProfilePicChange = (e) => {
    if (e.target.files.length > 0) {
      setProfilePic(e.target.files[0]);
    }
  };

  const handleProfilePicClick = () => {
    profileInputRef.current.click();
  };

  // Drag and drop handlers for profile picture
  const handleProfileDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingProfile(true);
  };

  const handleProfileDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingProfile(false);
  };

  const handleProfileDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleProfileDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingProfile(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        setProfilePic(file);
      } else {
        toast.error("Please drop an image file for your profile picture");
      }
    }
  };

  const signUpWithGoogle = async () => {
    navigate("/up-loading");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const submitFormData = new FormData();
    
    // Append all form data
    Object.keys(formData).forEach(key => {
      submitFormData.append(key, formData[key]);
    });
    
    // Append profile pic if exists
    if (profilePic) {
      submitFormData.append("profilePic", profilePic);
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_API_URL}/api/users/register`, 
        submitFormData, 
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );
      
      const { user, accessToken, suggestedActivity } = response.data.data;
      sessionStorage.setItem("accessToken", accessToken);
      sessionStorage.setItem("user", JSON.stringify(user));
      sessionStorage.setItem("activity", JSON.stringify(suggestedActivity));
      toast.success("User registered successfully!");
      console.log("Registration Success:", response.data);
      navigate("/onboard");
    } catch (error) {
      console.error("Registration Error:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Registration failed!");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 via-blue-950 to-gray-900 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden relative">
          <div className="p-6 bg-gradient-to-r from-indigo-600 to-purple-700">
            <div 
              className={`flex justify-center mb-4 relative ${isDraggingProfile ? 'ring-4 ring-indigo-300' : ''}`}
              onDragEnter={handleProfileDragEnter}
              onDragLeave={handleProfileDragLeave}
              onDragOver={handleProfileDragOver}
              onDrop={handleProfileDrop}
              onClick={handleProfilePicClick}
            >
              <input
                type="file"
                ref={profileInputRef}
                accept="image/*"
                className="hidden"
                onChange={handleProfilePicChange}
              />
              
              {profilePic ? (
                <div className="relative group">
                  <img
                    src={URL.createObjectURL(profilePic)}
                    alt="Profile"
                    className="w-24 h-24 rounded-full bg-white p-1 object-cover cursor-pointer"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-xs">Change</span>
                  </div>
                </div>
              ) : (
                <div className="relative group w-24 h-24 rounded-full bg-white/20 flex items-center justify-center cursor-pointer hover:bg-white/30 transition-all duration-200">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                  </svg>
                  
                  {/* Tooltip */}
                  <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                    Upload profile picture
                  </div>
                </div>
              )}
              
              {isDraggingProfile && (
                <div className="absolute inset-0 bg-indigo-500 bg-opacity-20 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium">Drop image here</span>
                </div>
              )}
            </div>
            <h2 className="text-2xl font-bold text-center text-white">
              {isSignIn ? "Sign In" : "Sign Up"}
            </h2>
          </div>

          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="fullName" className="block text-gray-700 font-medium">Full Name</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50"
                  placeholder="Enter your full name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="email" className="block text-gray-700 font-medium">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50"
                  placeholder="Enter your email"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="username" className="block text-gray-700 font-medium">Username</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50"
                  placeholder="Choose a username"
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
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50"
                    placeholder="Create a password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 px-2 py-1 text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="gender" className="block text-gray-700 font-medium">Gender</label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="age" className="block text-gray-700 font-medium">Age</label>
                  <input
                    type="number"
                    id="age"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50"
                    placeholder="Age"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition-all duration-200 flex items-center justify-center"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Register
                  </span>
                )}
              </button>
            </form>

            <div className="mt-6">
              <button
                onClick={signUpWithGoogle}
                className="w-full py-3 px-4 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition-all duration-200 flex items-center justify-center"
              >
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032 s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2 C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
                </svg>
                <span>Sign Up with Google</span>
              </button>
            </div>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                {isSignIn ? "Don't have an account? " : "Already have an account? "}
                <span
                  className="text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer"
                  onClick={() => setIsSignIn(!isSignIn)}
                >
                  {isSignIn ? "Sign up here" : "Sign in here"}
                </span>
              </p>
            </div>
            
          </div>
        </div>
      </div>

      {/* Animated Background Elements */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-indigo-500 rounded-full opacity-10 animate-blob"></div>
        <div className="absolute top-3/4 left-2/3 w-48 h-48 bg-purple-500 rounded-full opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/3 w-40 h-40 bg-blue-500 rounded-full opacity-10 animate-blob animation-delay-4000"></div>
      </div>
      
      <ToastContainer />
    </div>
  );
};

export default UserSignUp;