import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";

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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const signUpWithGoogle = async () => {
    navigate("/up-loading");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post("http://localhost:8000/api/users/register", formData, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });
      const { user, accessToken, suggestedActivity } =
          response.data.data;
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-black via-blue-950 to-black text-white px-6 ">
      <h1 className="text-5xl font-bold text-blue-400 mb-8">Sign Up</h1>

      <div className="w-full max-w-2xl p-8 bg-gray-900 shadow-2xl rounded-lg flex flex-col items-center">
        <form onSubmit={handleSubmit} className="w-full space-y-6">
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Full Name"
            className="w-full p-3 border rounded-lg bg-gray-800 text-white"
            required
          />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            className="w-full p-3 border rounded-lg bg-gray-800 text-white"
            required
          />
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Username"
            className="w-full p-3 border rounded-lg bg-gray-800 text-white"
            required
          />
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            className="w-full p-3 border rounded-lg bg-gray-800 text-white"
            required
          />
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg bg-gray-800 text-white"
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleChange}
            placeholder="Age"
            className="w-full p-3 border rounded-lg bg-gray-800 text-white"
            required
          />

          <button
            type="submit"
            className="w-full py-3 text-lg font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all"
            disabled={loading}
          >
            {loading ? "Signing Up..." : "Register"}
          </button>
        </form>

        <hr className="my-6 border-gray-700 w-full" />

        <button
          onClick={signUpWithGoogle}
          className="w-full py-3 text-lg font-bold text-white bg-red-500 rounded-lg hover:bg-red-600 transition-all"
        >
          Sign Up with Google
        </button>
      </div>

      <ToastContainer />
    </div>
  );
};

export default UserSignUp;
