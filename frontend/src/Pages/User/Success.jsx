import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SuccessPage = () => {
  const [showCheck, setShowCheck] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Show checkmark after a delay
    setTimeout(() => {
      setShowCheck(true);
    }, 500);

    // Navigate to home page after the animation ends
    setTimeout(() => {
      navigate('/mainPage'); 
        }, 2500); // Adjust the time based on your animation duration
  }, [navigate]);

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100">
      <div
        className={`w-24 h-24 border-4 border-green-500 rounded-full flex justify-center items-center bg-white transition-all duration-500 ${
          showCheck ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-12 h-12 text-green-500 animate-checkmark"
        >
          <path d="M20 6L9 17l-5-5"></path>
        </svg>
      </div>
      <h2 className="mt-6 text-3xl text-green-600 font-semibold">Success!</h2>
    </div>
  );
};

export default SuccessPage;
