import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaTrash, FaStar, FaBellSlash, FaPlus, FaCheck, FaTimes } from "react-icons/fa";
import Navbar from "./Navbar";

const API_BASE_URL = `${import.meta.env.VITE_BASE_API_URL}/api/wearables`;

const DeviceList = () => {
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [healthData, setHealthData] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [deviceName, setDeviceName] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiInsights, setAiInsights] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [messages, setMessages] = useState([]);

  const accessToken = sessionStorage.getItem("accessToken");

  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_BASE_URL}/load`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        withCredentials: true,
      });
      setDevices(response.data.devices);
    } catch (error) {
      setError("⚠ Failed to fetch devices. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchHealthData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${API_BASE_URL}/health-data`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (response.data.success) {
        setHealthData(response.data.healthData);
      } else {
        throw new Error("Failed to fetch health data.");
      }
    } catch (error) {
      setError("⚠ Failed to fetch health data.");
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    const userMessage = `
        Based on the following health data:
        - Steps: ${healthData.steps}
        - Heart Rate: ${healthData.heartRate}
        - Sleep Hours: ${healthData.sleep}
        Generate a personalized health recommendation.
    `;

    try {
      setAiLoading(true);
      const response = await axios.post(`${import.meta.env.VITE_BASE_API_URL}/api/chat`, {
        message: userMessage,
      });

      const botResponse = response.data.botResponse;

      if (botResponse) {
        setAiInsights(botResponse);
        setShowModal(true);
      } else {
        throw new Error("Empty response from AI");
      }
    } catch (error) {
      setError("⚠ Failed to fetch AI insights.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6 text-gray-200">
      <Navbar />
  
      {/* Add padding below the Navbar */}
      <div className="mt-6 space-y-4">
        {/* Header */}
        <div className="flex flex-col gap-2 justify-between mb-6">
          <h2 className="text-3xl font-bold">Connected Devices</h2>
          <p className="text-gray-400">Manage your wearable devices</p>
        </div>
  
        <button
          className="flex items-center gap-2 bg-violet-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-800 transition"
          onClick={() => setShowInput(true)}
        >
          <FaPlus /> Add Device
        </button>
  
        {loading && <p className="text-gray-400">Loading...</p>}
        {error && <p className="text-red-400">{error}</p>}
  
        {/* Device List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {devices.length > 0 ? (
            devices.map((device, index) => (
              <div key={index} className="bg-gray-800 p-4 rounded-xl shadow-md">
                <h3 className="text-lg font-semibold">{device.model || "Unknown Device"}</h3>
                <p className="text-sm text-gray-400">{device.manufacturer || "Unknown"}</p>
                <button 
                  onClick={() => setSelectedDevice(device.model)} 
                  className={`mt-4 py-2 px-5 w-full text-sm font-semibold rounded-lg 
                    ${selectedDevice === device.model ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-200 hover:bg-blue-600'}`}>
                  {selectedDevice === device.model ? "Selected ✅" : "Select"}
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-400">No devices connected. Please add a device.</p>
          )}
        </div>
  
        {/* Health Data and AI Insights Section */}
        {selectedDevice && (
          <div className="mt-6 p-4 bg-gray-800 shadow-md rounded-lg">
            <h3 className="text-xl font-semibold">Health Data</h3>
            {healthData ? (
              <div className="mt-4">
                <p><strong>Heart Rate:</strong> {healthData.heartRate} bpm</p>
                <p><strong>Steps:</strong> {healthData.steps}</p>
                <p><strong>Calories Burned:</strong> {healthData.calories} kcal</p>
              </div>
            ) : (
              <button 
                onClick={fetchHealthData} 
                className="py-2 px-5 text-sm font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? "Fetching..." : "Fetch Health Data"}
              </button>
            )}
  
            {healthData && (
              <button 
                onClick={sendMessage} 
                className="mt-4 py-2 px-5 text-sm font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                disabled={aiLoading}
              >
                {aiLoading ? "Analyzing..." : "Fetch AI Insights"}
              </button>
            )}
          </div>
        )}
      </div>
  
      {/* AI Insights Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-70">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-[60%] h-[80%] flex flex-col">
            <h2 className="text-xl font-semibold">AI Insights</h2>
            <div className="flex-grow overflow-y-auto mt-4">
              <p className="text-gray-300">{aiInsights}</p>
            </div>
            <button
              onClick={() => setShowModal(false)}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 self-end"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};  

export default DeviceList;
