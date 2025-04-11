import React, { useState } from "react";
import DoctorSignIn from "./Doctor/DoctorSignIn";
import UserSignIn from "./User/UserSignIn";
import "./Auth.css";

const Auth = () => {
  const [activeTab, setActiveTab] = useState("user");

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-b from-gray-900 via-blue-950 to-gray-900">
      {/* Left Sidebar - Fixed height with no overflow */}
      <div className="w-80 flex-shrink-0 bg-gray-900 flex flex-col overflow-hidden">
        <div className="p-8">
        <div className="flex items-center justify-center space-x-2 mb-16">
  <img
    src="/FitFull logo wo text.png"
    alt="Logo"
    className="w-16 h-16"
  />
  <h1 className="text-4xl font-bold text-green-400">FitFull</h1>
</div>
          
          <div className="flex flex-col space-y-4">
            <button
              className={`p-4 text-left rounded-lg font-medium transition-all ${
                activeTab === "doctor" 
                  ? "bg-green-900 text-white" 
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
              onClick={() => setActiveTab("doctor")}
            >
              Doctor Sign In
            </button>
            
            <button
              className={`p-4 text-left rounded-lg font-medium transition-all ${
                activeTab === "user" 
                  ? "bg-violet-700 text-white" 
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
              onClick={() => setActiveTab("user")}
            >
              User Sign In
            </button>
          </div>
        </div>
        
        <div className="mt-auto p-8">
          <p className="text-sm text-gray-500">Need help? Contact support</p>
        </div>
      </div>
      
      {/* Right Content Area - Takes remaining space with scrolling */}
      <div className="flex-grow overflow-auto">
        {activeTab === "doctor" ? <DoctorSignIn /> : <UserSignIn />}
      </div>
    </div>
  );
};

export default Auth
