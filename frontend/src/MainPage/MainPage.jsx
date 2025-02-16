import React, { useState, useEffect } from "react";
import { BackgroundLines } from "./BackgroundLines";
import Navbar from "../Pages/Navbar";
import Suggestion from "./activity";
import Footer from "./Footer";
import GlitteringTitle from "./Title";
import { Link } from "react-router-dom";

export default function MainPage() {
  const [suggestedActivity, setSuggestedActivity] = useState(null);

  useEffect(() => {
    const activity = sessionStorage.getItem("activity");
    setSuggestedActivity(activity);
  }, []);

  return (
    <>
      <BackgroundLines className="flex items-center justify-center w-full flex-col px-4">
        <Navbar />
        <div>
          <GlitteringTitle />
          <p className="max-w-xl mx-auto text-sm md:text-lg text-neutral-700 dark:text-neutral-400 text-center">
            An ultimate health companion — Track real-time wellness for you and
            your family, Guided by expert doctors.
          </p>
        </div>
      </BackgroundLines>

      {/* Secure Health Data Store Section */}
      <div className="shadow-[4px_4px_0_rgba(0,0,0,0.3)] hover:shadow-[6px_6px_0_rgba(0,0,0,0.4)] transition duration-300 p-6 bg-black w-full">
        <div className="max-w-[85rem] text-white px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto backdrop-blur-lg bg-[#14072d] bg-opacity-70 p-8 rounded-lg shadow-lg shadow-red-500/50 hover:shadow-blue-500/50 transition-shadow flex flex-col items-center text-center">
          <h2 className="text-2xl md:text-3xl font-bold">
            Secure Health Data Store
          </h2>
          <p className="mt-2 text-gray-300 text-sm md:text-lg">
            Access your records & family members' records. Find out what your
            doctor has advised from your consultations.
          </p>
          <Link
            to="/user-reports"
            className="mt-4 bg-violet-600 hover:bg-blue-600 text-white py-2 px-6 rounded-lg font-medium transition"
          >
            View Records
          </Link>
        </div>
      </div>

      {/* Activity Suggestion Section */}
      <div className="bg-black">
        <Suggestion />
      </div>
      <Footer />
    </>
  );
}
