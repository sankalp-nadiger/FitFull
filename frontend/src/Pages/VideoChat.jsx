import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

const VideoChat = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { sessionId, roomName } = location.state || {};
  const [ending, setEnding] = useState(false);

  const endSession = async () => {
    try {
      setEnding(true);
      await axios.post(
        `${import.meta.env.VITE_BASE_API_URL}/api/counsellor/end`,
        { sessionId },
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem('accessToken')}`,
          },
        }
      );
      navigate('/sessions');
    } catch (error) {
      console.error("Failed to end session.", error);
    } finally {
      setEnding(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-900">
      <h2 className="text-2xl font-semibold text-white mb-4">Live Video Session</h2>
      <div className="relative w-full max-w-4xl h-[70vh] bg-black">
        <iframe
          src={`https://meet.jit.si/${roomName}`}
          className="absolute top-0 left-0 w-full h-full"
          allow="camera; microphone; fullscreen; display-capture"
        ></iframe>
      </div>
      <button
        onClick={endSession}
        className="mt-6 px-6 py-2 bg-red-500 text-white font-semibold rounded-md hover:bg-red-600 transition"
        disabled={ending}
      >
        {ending ? 'Ending...' : 'End Session'}
      </button>
    </div>
  );
};

export default VideoChat;
