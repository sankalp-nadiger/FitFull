import React, { useState } from "react";
import DoctorSignIn from "./Doctor/DoctorSignIn";
import UserSignIn from "./User/UserSignIn";

const SignInInterface = () => {
  const [activeTab, setActiveTab] = useState("doctor");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-black via-blue-950 to-black text-white px-6">
      {/* Tab Switcher */}
      <div className="flex space-x-4 mb-6">
        <button
          className={`px-4 py-2 font-bold rounded-md transition-all ${
            activeTab === "doctor"
              ? "bg-green-500 text-white"
              : "bg-gray-700 text-gray-300"
          }`}
          onClick={() => setActiveTab("doctor")}
        >
          Doctor Sign In
        </button>
        <button
          className={`px-4 py-2 font-bold rounded-md transition-all ${
            activeTab === "user"
              ? "bg-green-500 text-white"
              : "bg-gray-700 text-gray-300"
          }`}
          onClick={() => setActiveTab("user")}
        >
          User Sign In
        </button>
      </div>

      {/* Conditional Rendering */}
      {activeTab === "doctor" ? <DoctorSignIn /> : <UserSignIn />}
    </div>
  );
};

export default SignInInterface;