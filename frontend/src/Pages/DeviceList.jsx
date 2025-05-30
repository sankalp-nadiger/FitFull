import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaPlus } from "react-icons/fa";
import Navbar from "./Navbar";

const API_BASE_URL = `${import.meta.env.VITE_BASE_API_URL}/api/wearables`;

const DeviceList = () => {
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [healthData, setHealthData] = useState(null);
  const [showInput, setShowInput] = useState(false);
  const [deviceName, setDeviceName] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiInsights, setAiInsights] = useState("");
  const [showModal, setShowModal] = useState(false);

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
      console.error("Load devices error:", error);
    } finally {
      setLoading(false);
    }
  };

  const addDevice = async () => {
    if (!deviceName.trim()) {
      setError("Please enter a device name.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await axios.post(
        `${API_BASE_URL}/devices`,
        { deviceName },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          withCredentials: true,
        }
      );
      
      if (response.data.success) {
        setDeviceName("");
        setShowInput(false);
        loadDevices(); // Refresh device list
      }
    } catch (error) {
      setError("⚠ Failed to add device. Please try again.");
      console.error("Add device error:", error);
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
        withCredentials: true,
      });

      if (response.data.success) {
        setHealthData(response.data.healthData);
      } else {
        throw new Error("Failed to fetch health data.");
      }
    } catch (error) {
      setError("⚠ Failed to fetch health data.");
      console.error("Fetch health data error:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!healthData) {
      setError("Please fetch health data first.");
      return;
    }

    const userMessage = `
        Based on the following health data:
        - Steps: ${healthData.steps || 'N/A'}
        - Heart Rate: ${healthData.heartRate || 'N/A'}
        - Sleep Hours: ${healthData.sleep || 'N/A'}
        - Calories: ${healthData.calories || 'N/A'}
        Generate a personalized health recommendation.
    `;

    try {
      setAiLoading(true);
      setError(null);      const response = await axios.get(
        `${API_BASE_URL}/ai-insights`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          withCredentials: true,
        }
      );

      const botResponse = response.data.insights;

      if (botResponse) {
        setAiInsights(botResponse);
        setShowModal(true);
      } else {
        throw new Error("Empty response from AI");
      }
    } catch (error) {
      setError("⚠ Failed to fetch AI insights.");
      console.error("AI insights error:", error);
    } finally {
      setAiLoading(false);
    }
  };

  const selectDevice = async (deviceModel) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.post(
        `${API_BASE_URL}/devices/select`,
        { deviceModel },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          withCredentials: true,
        }
      );
      
      if (response.data.success) {
        setSelectedDevice(deviceModel);
      }
    } catch (error) {
      setError("⚠ Failed to select device. Please try again.");
      console.error("Select device error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6 text-gray-200">
      <Navbar />
  
      <div className="mt-6 space-y-4">
        {/* Header */}
        <div className="flex flex-col gap-2 justify-between mb-6">
          <h2 className="text-3xl font-bold">Connected Devices</h2>
          <p className="text-gray-400">Manage your wearable devices</p>
        </div>
  
        {/* Add Device Button */}
        <button
          className="flex items-center gap-2 bg-violet-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-violet-700 transition"
          onClick={() => setShowInput(!showInput)}
          disabled={loading}
        >
          <FaPlus /> {showInput ? "Cancel" : "Add Device"}
        </button>

        {/* Add Device Input */}
        {showInput && (
          <div className="bg-gray-800 p-4 rounded-lg shadow-md">
            <input
              type="text"
              placeholder="Enter device name"
              value={deviceName}
              onChange={(e) => setDeviceName(e.target.value)}
              className="w-full p-2 bg-gray-700 text-white rounded-lg mb-3"
            />
            <div className="flex gap-2">
              <button
                onClick={addDevice}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? "Adding..." : "Add"}
              </button>
              <button
                onClick={() => {
                  setShowInput(false);
                  setDeviceName("");
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
  
        {/* Loading and Error States */}
        {loading && <p className="text-gray-400">Loading...</p>}
        {error && <p className="text-red-400">{error}</p>}
  
        {/* Device List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {devices.length > 0 ? (
            devices.map((device, index) => (
              <div key={index} className="bg-gray-800 p-4 rounded-xl shadow-md">
                <h3 className="text-lg font-semibold">{device.model || device.deviceName || "Unknown Device"}</h3>
                <p className="text-sm text-gray-400">{device.manufacturer || "Unknown"}</p>                <button 
                  onClick={() => selectDevice(device.model || device.deviceName)} 
                  className={`mt-4 py-2 px-5 w-full text-sm font-semibold rounded-lg transition
                    ${selectedDevice === (device.model || device.deviceName) 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-700 text-gray-200 hover:bg-blue-600'}`}
                  disabled={loading}
                >
                  {selectedDevice === (device.model || device.deviceName) ? "Selected ✅" : "Select"}
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
            <h3 className="text-xl font-semibold">Health Data for {selectedDevice}</h3>
            {healthData ? (
              <div className="mt-4 space-y-2">
                <p><strong>Heart Rate:</strong> {healthData.heartRate ? `${healthData.heartRate} bpm` : 'N/A'}</p>
                <p><strong>Steps:</strong> {healthData.steps || 'N/A'}</p>
                <p><strong>Calories Burned:</strong> {healthData.calories ? `${healthData.calories} kcal` : 'N/A'}</p>
                <p><strong>Sleep Hours:</strong> {healthData.sleep ? `${healthData.sleep} hours` : 'N/A'}</p>
              </div>
            ) : (
              <button 
                onClick={fetchHealthData} 
                className="mt-4 py-2 px-5 text-sm font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? "Fetching..." : "Fetch Health Data"}
              </button>
            )}
  
            {healthData && (
              <button 
                onClick={sendMessage} 
                className="mt-4 py-2 px-5 text-sm font-semibold rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50"
                disabled={aiLoading}
              >
                {aiLoading ? "Analyzing..." : "Get AI Insights"}
              </button>
            )}
          </div>
        )}
      </div>
  
      {/* AI Insights Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-70 z-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-[90%] max-w-2xl max-h-[80%] flex flex-col">
            <h2 className="text-xl font-semibold mb-4">AI Health Insights</h2>
            <div className="flex-grow overflow-y-auto">
              <div className="text-gray-300 whitespace-pre-wrap">{aiInsights}</div>
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