import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import DoctorSignIn from "./DoctorSignIn";

const DoctorSignUp = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [specifications, setSpecifications] = useState([]);
  const [specificationInput, setSpecificationInput] = useState("");
  const [yearExp, setYearExp] = useState("");
  const [availability, setAvailability] = useState([]);
  const [certificateImage, setCertificateImage] = useState([]); // Store multiple files
  const [isSignIn, setIsSignIn] = useState(false);

  const handleAddSpecification = () => {
    if (specificationInput.trim() !== "") {
      setSpecifications([...specifications, specificationInput.trim()]);
      setSpecificationInput("");
    }
  };

  const handleFileChange = (e) => {
    setCertificateImage([...e.target.files]); // Convert FileList to an array
  };

  const handleSignUp = async (e) => {
    e.preventDefault();

    if (!fullName || !email || !password || !mobileNumber || !yearExp) {
      toast.error("All fields are required!");
      return;
    }

    const formData = new FormData();
    formData.append("fullName", fullName);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("mobileNumber", mobileNumber);
    formData.append("otp", otp);
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
        "http://localhost:8000/api/doctor/register-doctor",
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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-black via-blue-950 to-black text-white px-6">
      <h1 className="text-4xl font-bold text-blue-500 mb-6">Doctor Sign Up</h1>
      <div className="w-full max-w-md p-6 bg-gray-900 shadow-lg rounded-lg">
        <form onSubmit={handleSignUp} className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            className="w-full p-2 bg-gray-800 text-white border border-gray-700 rounded-md"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full p-2 bg-gray-800 text-white border border-gray-700 rounded-md"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-2 bg-gray-800 text-white border border-gray-700 rounded-md"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Mobile Number"
            className="w-full p-2 bg-gray-800 text-white border border-gray-700 rounded-md"
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Years of Experience"
            className="w-full p-2 bg-gray-800 text-white border border-gray-700 rounded-md"
            value={yearExp}
            onChange={(e) => setYearExp(e.target.value)}
            required
          />
          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Specialization"
              className="w-full p-2 bg-gray-800 text-white border border-gray-700 rounded-md"
              value={specificationInput}
              onChange={(e) => setSpecificationInput(e.target.value)}
            />
            <button type="button" onClick={handleAddSpecification} className="p-2 bg-blue-500 rounded-md">
              Add
            </button>
          </div>
          <div className="text-sm text-gray-300">{specifications.join(", ")}</div>
          <input
            type="file"
            multiple
            className="w-full p-2 bg-gray-800 text-white border border-gray-700 rounded-md"
            onChange={handleFileChange}
          />
          <button
            type="submit"
            className="w-full py-2 text-lg font-bold text-white bg-green-500 rounded-md hover:bg-green-600 transition-all"
          >
            Register as Doctor
          </button>
        </form>
        <div className="mt-4 text-center">
          <p className="text-gray-400">
            Already have an account?{" "}
            <span className="text-indigo-400 hover:underline cursor-pointer" onClick={() => setIsSignIn(true)}>
              Login here
            </span>
          </p>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default DoctorSignUp;