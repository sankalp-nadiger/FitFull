import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// import {signUpWithGoogle} from "./UserGoogleSignUp";
import { useNavigate } from "react-router-dom";

const UserSignUp = () => {
      const navigate = useNavigate();
  async function signUpWithGoogle() {
        // Step 1: Show loadUpg screen while gettUpg Google OAuth URL
        navigate("/up-loading");  

  }
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-black via-blue-950 to-black text-white px-6">
      <h1 className="text-4xl font-bold text-blue-500 mb-6">Sign Up</h1>
      <div className="w-full max-w-md p-6 bg-gray-900 shadow-lg rounded-lg">
        <button 
          onClick={signUpWithGoogle}
          className="w-full py-2 mb-4 text-lg font-bold text-white bg-red-500 rounded-md hover:bg-red-600 transition-all"
        >
          Sign Up with Google
        </button>
      </div>
      <ToastContainer />
    </div>
  );
};


export default UserSignUp;