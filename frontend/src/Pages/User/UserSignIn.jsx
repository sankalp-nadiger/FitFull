import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import UserSignUp from "./UserSignUp";

const UserSignIn = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false); // State for password visibility toggle
  const [isSignUp, setIsSignUp] = useState(false); // State for managing active form (SignIn or SignUp)

  // Sign in with Google
  async function signInWithGoogle() {
    navigate("/in-loading");
  }

  // Handle sign in form submission
  const handleSignIn = async (event) => {
    event.preventDefault();

    // Collect form data
    const username = event.target.username.value;
    const password = event.target.password.value;

    // Validate fields
    if (!password || !username) {
      alert("Please fill in all fields.");
      return;
    }

    setLoading(true);

    try {
      console.log(`fetching data from ${import.meta.env.VITE_BASE_API_URL}`)
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_API_URL}/api/users/login`,
        {
          username,
          password,
   
        },
        {
          withCredentials: true, // ✅ Send & receive cookies!
        }
      );
      

      if (response.status === 200) {
        const { user, accessToken, streak, maxStreak, suggestedActivity } =
          response.data.data;

        console.log("Login successful:", response.data);
        console.log(suggestedActivity);

        // Save user data and tokens
        sessionStorage.setItem("accessToken", accessToken);
        sessionStorage.setItem("user", JSON.stringify(user));
        sessionStorage.setItem("activity", JSON.stringify(suggestedActivity));

        // Display streak and suggested activity
        alert(`Welcome back, ${user.username}!
          Your streak: ${streak}
          Max streak: ${maxStreak}`);

        // Redirect to dashboard
        navigate("/main-page");
      } else {
        alert("Login failed. Please try again.");
      }
    } catch (error) {
      console.error("Login error:", error.response?.data?.message || error.message);
      alert(
        error.response?.data?.message || "An error occurred during login. Please try again."
      );
    } finally {
      setLoading(false); // Hide loading state
    }
  };
  if (isSignUp) {
    return <UserSignUp />;
  }
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-purple-900 via-blue-900 to-indigo-900 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-indigo-500 to-purple-600">
            <div className="flex justify-center mb-4">
              <img
                src="/api/placeholder/64/64"
                alt="Welcome"
                className="w-16 h-16 rounded-full bg-white p-2"
              />
            </div>
            <h2 className="text-2xl font-bold text-center text-white">
              {!isSignUp ? "User Sign In" : "User Sign Up"}
            </h2>
          </div>

          <div className="p-6">
            {!isSignUp ? (
              <form onSubmit={handleSignIn} className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="username" className="block text-gray-700 font-medium">Username</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter your username"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="block text-gray-700 font-medium">Password</label>
                  <div className="relative">
                    <input
                      type={passwordVisible ? "text" : "password"}
                      id="password"
                      name="password"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setPasswordVisible(!passwordVisible)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 px-2 py-1 text-sm text-indigo-600 hover:text-indigo-800"
                    >
                      {passwordVisible ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-all duration-200 flex items-center justify-center"
                  disabled={loading}
                >
                  {loading ? "Signing In..." : "Sign In"}
                </button>
              </form>
            ) : (
              <UserSignUp />
            )}

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
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSignIn;