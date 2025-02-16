import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaTrash, FaStar, FaBellSlash, FaPlus, FaCheck, FaTimes } from "react-icons/fa";

const API_BASE_URL = "http://localhost:8000/api/wearables";

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
  const [showModal, setShowModal] = useState(false); // 🚀 State for modal visibility
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

      console.log("Health Data Response:", response);
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
      const response = await axios.post("http://localhost:8000/api/chat", {
        message: userMessage,
      });

      const botResponse = response.data.botResponse;

      if (botResponse) {
        setAiInsights(botResponse);
        setShowModal(true); // 🚀 Open modal after fetching insights
      } else {
        throw new Error("Empty response from AI");
      }
    } catch (error) {
      console.error("Error fetching AI insights:", error);
      setError("⚠ Failed to fetch AI insights.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Connected Devices</h2>
          <p className="text-gray-500">Manage your wearable devices</p>
        </div>
        <button
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 transition"
          onClick={() => setShowInput(true)}
        >
          <FaPlus /> Add Device
        </button>
      </div>

      {loading && <p className="text-gray-600">Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* Device List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {devices.length > 0 ? (
          devices.map((device, index) => (
            <div key={index} className="bg-white p-4 rounded-xl shadow-md">
              <h3 className="text-lg font-semibold text-gray-800">{device.model || "Unknown Device"}</h3>
              <p className="text-sm text-gray-500">{device.manufacturer || "Unknown"}</p>
              <button 
                onClick={() => setSelectedDevice(device.model)} 
                className={`mt-4 py-2 px-5 w-full text-sm font-semibold rounded-lg 
                  ${selectedDevice === device.model ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-800 hover:bg-blue-500 hover:text-white'}`}>
                {selectedDevice === device.model ? "Selected ✅" : "Select"}
              </button>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No devices connected. Please add a device.</p>
        )}
      </div>

      {/* Health Data and AI Insights Section */}
      {selectedDevice && (
        <div className="mt-6 p-4 bg-white shadow-md rounded-lg">
          <h3 className="text-xl font-semibold text-gray-800">Health Data</h3>
          {healthData ? (
            <div className="mt-4">
              <p><strong>Heart Rate:</strong> {healthData.heartRate} bpm</p>
              <p><strong>Steps:</strong> {healthData.steps}</p>
              <p><strong>Calories Burned:</strong> {healthData.totalCalories} kcal</p>
            </div>
          ) : (
            <button 
              onClick={fetchHealthData} 
              className="py-2 px-5 text-sm font-semibold rounded-lg bg-blue-500 text-white hover:bg-blue-600"
              disabled={loading}
            >
              {loading ? "Fetching..." : "Fetch Health Data"}
            </button>
          )}

          {healthData && (
            <button 
              onClick={sendMessage} 
              className="mt-4 py-2 px-5 text-sm font-semibold rounded-lg bg-blue-500 text-white hover:bg-blue-600"
              disabled={aiLoading}
            >
              {aiLoading ? "Analyzing..." : "Fetch AI Insights"}
            </button>
          )}
        </div>
      )}

      {/* 🚀 AI Insights Modal */}
      {showModal && (
  <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
    <div className="bg-white p-6 rounded-lg shadow-lg w-[60%] h-[80%] flex flex-col">
      <h2 className="text-xl font-semibold text-gray-800">AI Insights</h2>
      <div className="flex-grow overflow-y-auto mt-4">
        <p className="text-gray-700">{aiInsights}</p>
      </div>
      <button
        onClick={() => setShowModal(false)}
        className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 self-end"
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
