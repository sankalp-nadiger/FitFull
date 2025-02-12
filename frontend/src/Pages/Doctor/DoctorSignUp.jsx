import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";

const UserSignUp = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState("Male");
  const [age, setAge] = useState("");
  const [location, setLocation] = useState("");

  async function signUpWithGoogle() {
    navigate("/up-loading"); // Navigate to loading screen before Google OAuth
  }

  const handleSignUp = async (e) => {
    e.preventDefault();

    if (!fullName || !email || !username || !password || !age || !location) {
      toast.error("All fields are required!");
      return;
    }

    try {
      const response = await axios.post("http://localhost:8000/api/user/register", {
        fullName,
        email,
        username,
        password,
        gender,
        age,
        location,
      });

      if (response.status === 201) {
        toast.success("Sign-up successful! Redirecting...");
        setTimeout(() => navigate("/userDashboard"), 2000);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed!");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-black via-blue-950 to-black text-white px-6">
      <h1 className="text-4xl font-bold text-blue-500 mb-6">Sign Up</h1>
      
      <div className="w-full max-w-md p-6 bg-gray-900 shadow-lg rounded-lg">
        {/* Google Sign-Up */}
        <button 
          onClick={signUpWithGoogle}
          className="w-full py-2 mb-4 text-lg font-bold text-white bg-red-500 rounded-md hover:bg-red-600 transition-all"
        >
          Sign Up with Google
        </button>

        <div className="text-center text-gray-400 my-2">or</div>

        {/* Email & Password Sign-Up Form */}
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
            type="text" 
            placeholder="Username" 
            className="w-full p-2 bg-gray-800 text-white border border-gray-700 rounded-md"
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
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

          <select 
            className="w-full p-2 bg-gray-800 text-white border border-gray-700 rounded-md"
            value={gender} 
            onChange={(e) => setGender(e.target.value)}
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>

          <input 
            type="number" 
            placeholder="Age" 
            className="w-full p-2 bg-gray-800 text-white border border-gray-700 rounded-md"
            value={age} 
            onChange={(e) => setAge(e.target.value)} 
            required 
          />

          <input 
            type="text" 
            placeholder="Location (JSON format)" 
            className="w-full p-2 bg-gray-800 text-white border border-gray-700 rounded-md"
            value={location} 
            onChange={(e) => setLocation(e.target.value)} 
            required 
          />

          <button 
            type="submit"
            className="w-full py-2 text-lg font-bold text-white bg-green-500 rounded-md hover:bg-green-600 transition-all"
          >
            Sign Up with Email
          </button>
        </form>
      </div>

      <ToastContainer />
    </div>
  );
};

export default UserSignUp;