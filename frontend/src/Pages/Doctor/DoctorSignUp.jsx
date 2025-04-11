import React, { useState, useRef } from "react";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import DoctorSignIn from "./DoctorSignIn";

const DoctorSignUp = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [specifications, setSpecifications] = useState([]);
  const [specificationInput, setSpecificationInput] = useState("");
  const [yearExp, setYearExp] = useState("");
  const [availability, setAvailability] = useState([]);
  const [certificateImage, setCertificateImage] = useState([]);
  const [isSignUp, setIsSignUp] = useState(true);
  const [isSignIn, setIsSignIn] = useState(false);
  const [profilePic, setProfilePic] = useState(null);
  const [isDraggingProfile, setIsDraggingProfile] = useState(false);
  const [isDraggingCerts, setIsDraggingCerts] = useState(false);
  
  const profileInputRef = useRef(null);
  const certificationsInputRef = useRef(null);

  const handleAddSpecification = () => {
    if (specificationInput.trim() !== "") {
      setSpecifications([...specifications, specificationInput.trim()]);
      setSpecificationInput("");
    }
  };

  const handleSpecificationKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSpecification();
    }
  };

  const handleRemoveSpecification = (indexToRemove) => {
    setSpecifications(specifications.filter((_, index) => index !== indexToRemove));
  };

  const handleProfilePicChange = (e) => {
    if (e.target.files.length > 0) {
      setProfilePic(e.target.files[0]);
    }
  };

  const handleProfilePicClick = () => {
    profileInputRef.current.click();
  };

  const handleCertificationsClick = () => {
    certificationsInputRef.current.click();
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setCertificateImage([...certificateImage, ...Array.from(e.target.files)]);
    }
  };

  const handleRemoveCertificate = (indexToRemove) => {
    setCertificateImage(certificateImage.filter((_, index) => index !== indexToRemove));
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

  // Drag and drop handlers for certifications
  const handleCertsDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingCerts(true);
  };

  const handleCertsDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingCerts(false);
  };

  const handleCertsDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleCertsDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingCerts(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setCertificateImage([...certificateImage, ...Array.from(e.dataTransfer.files)]);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();

    if (!fullName || !email || !password || !phoneNumber || !yearExp) {
      toast.error("All fields are required!");
      return;
    }

    const formData = new FormData();
    formData.append("fullName", fullName);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("mobileNumber", phoneNumber);
    formData.append("otp", otp);
    
    if (profilePic) {
      formData.append("profilePic", profilePic);
    }
    
    formData.append("yearExp", yearExp);
    formData.append("availability", JSON.stringify(availability));
    formData.append("specifications", JSON.stringify(specifications));

    if (certificateImage.length > 0) {
      certificateImage.forEach((file) => {
        formData.append("certificateImage", file);
      });
    }

    try {
      const response = await axios.post(
       `${import.meta.env.VITE_BASE_API_URL}/api/doctor/register-doctor`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.status === 201) {
        toast.success("Sign-up successful! Redirecting...");
        setTimeout(() => navigate("/doctor-dashboard"), 2000);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed!");
    }
  };

  if (isSignIn) {
    return <DoctorSignIn />;
  }
  
  const signUpWithGoogle = async () => {
    navigate("/up-loading"); // Redirecting to Google OAuth flow
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 via-blue-950 to-gray-900 px-4 py-8">
      <div className="w-full max-w-md">
       
        <div className="bg-white rounded-lg shadow-xl overflow-hidden relative">
          <div className="p-6 bg-gradient-to-r from-teal-500 to-cyan-600">
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
              {isSignIn ? "Doctor Sign In" : "Doctor Sign Up"}
            </h2>
          </div>

          <div className="p-6">
            <form onSubmit={handleSignUp} className="space-y-4">
             
              <div className="space-y-2">
                <label htmlFor="fullName" className="block text-gray-700 font-medium">Full Name</label>
                <input
                  type="text"
                  id="fullName"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
         
              <div className="space-y-2">
                <label htmlFor="email" className="block text-gray-700 font-medium">Email</label>
                <input
                  type="email"
                  id="email"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50"
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
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50"
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
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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

              <div className="space-y-2">
                <label htmlFor="yearExp" className="block text-gray-700 font-medium">Years of Experience</label>
                <input
                  type="number"
                  id="yearExp"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50"
                  placeholder="Enter years of experience"
                  value={yearExp}
                  onChange={(e) => setYearExp(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="specialization" className="block text-gray-700 font-medium">Specialization</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    id="specialization"
                    className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50"
                    placeholder="Add your specialization"
                    value={specificationInput}
                    onChange={(e) => setSpecificationInput(e.target.value)}
                    onKeyPress={handleSpecificationKeyPress}
                  />
                  <button
                    type="button"
                    onClick={handleAddSpecification}
                    className="px-4 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-lg"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
                {specifications.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {specifications.map((spec, index) => (
                      <span 
                        key={index} 
                        className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm flex items-center group"
                      >
                        {spec}
                        <button
                          type="button"
                          onClick={() => handleRemoveSpecification(index)}
                          className="ml-2 text-indigo-600 hover:text-indigo-800"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div 
                className={`space-y-2 ${isDraggingCerts ? 'ring-2 ring-indigo-500 rounded-lg' : ''}`}
                onDragEnter={handleCertsDragEnter}
                onDragLeave={handleCertsDragLeave}
                onDragOver={handleCertsDragOver}
                onDrop={handleCertsDrop}
              >
                <label htmlFor="certifications" className="block text-gray-700 font-medium">Certifications</label>
                <div 
                  onClick={handleCertificationsClick}
                  className={`border-2 border-dashed ${isDraggingCerts ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'} rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors`}
                >
                  <input
                    type="file"
                    id="certifications"
                    ref={certificationsInputRef}
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-indigo-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-sm font-medium text-gray-700">
                    {isDraggingCerts ? "Drop files here" : "Click to upload or drag & drop"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Upload your certifications and medical licenses
                  </p>
                </div>
                
                {certificateImage.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-medium text-gray-700">
                      {certificateImage.length} file(s) selected
                    </p>
                    <div className="space-y-2">
                      {certificateImage.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
                          <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="text-sm text-gray-700 truncate max-w-xs">{file.name}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveCertificate(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition-all duration-200 flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {isSignIn ? "Sign In" : "Register as Doctor"}
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
                <span>{isSignIn ? "Sign In" : "Sign Up"} with Google</span>
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

export default DoctorSignUp;