import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaTrash, FaStar, FaBellSlash, FaPlus } from "react-icons/fa";

const API_BASE_URL = "http://localhost:8000/api/wearableDevices";

const DeviceList = () => {
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [healthData, setHealthData] = useState(null);
  const [aiInsights, setAiInsights] = useState(null);

  const accessToken = sessionStorage.getItem("accessToken");

  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_BASE_URL}/devices`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setDevices(response.data.devices);
    } catch (error) {
      setError("⚠️ Failed to fetch devices. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const selectDevice = async (deviceModel) => {
    try {
      setLoading(true);
      setError(null);

      await axios.post(
        `${API_BASE_URL}/devices/select`,
        { deviceModel },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      setSelectedDevice(deviceModel);
    } catch (error) {
      setError("⚠️ Failed to select device. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const deleteDevice = async (deviceModel) => {
    try {
      setLoading(true);
      setError(null);

      await axios.delete(`${API_BASE_URL}/devices/${deviceModel}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      setDevices(devices.filter((device) => device.model !== deviceModel));
    } catch (error) {
      setError("⚠️ Failed to delete device.");
    } finally {
      setLoading(false);
    }
  };

  const getDeviceImage = (model) => {
    const images = {
      "Apple Watch Series 8": "/images/apple_watch.png",
      "Fitbit Charge 5": "/images/fitbit_charge.png",
      "Galaxy Watch 4": "/images/galaxy_watch.png",
    };
    return images[model] || "/images/default_device.png";
  };

  const fetchHealthData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_BASE_URL}/devices/health`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setHealthData(response.data.healthData);
    } catch (error) {
      setError("⚠️ Failed to fetch health data.");
    } finally {
      setLoading(false);
    }
  };

  const getAIInsights = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_BASE_URL}/devices/ai-insights`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setAiInsights(response.data.insights);
    } catch (error) {
      setError("⚠️ Failed to fetch AI insights.");
    } finally {
      setLoading(false);
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
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 transition">
          <FaPlus /> Add Device
        </button>
      </div>

      {/* Error & Loading States */}
      {loading && <p className="text-gray-600">Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* Device Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {devices.length > 0 ? (
          devices.map((device, index) => {
            const model = device.model || "Unknown Device";
            const isSelected = selectedDevice === model;

            return (
              <div
                key={index}
                className="bg-white p-4 rounded-xl shadow-md relative flex flex-col items-center"
              >
                {/* Device Image */}
                <img
                  src={getDeviceImage(model)}
                  alt={model}
                  className="w-24 h-24 object-cover rounded-full mb-3"
                />

                {/* Device Name */}
                <h3 className="text-lg font-semibold text-gray-800">{model}</h3>
                <p className="text-sm text-gray-500">{device.manufacturer || "Unknown"}</p>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-3">
                  <button className="p-2 bg-yellow-100 text-yellow-500 rounded-full hover:bg-yellow-200">
                    <FaStar />
                  </button>
                  <button className="p-2 bg-gray-100 text-gray-500 rounded-full hover:bg-gray-200">
                    <FaBellSlash />
                  </button>
                  <button
                    className="p-2 bg-red-100 text-red-500 rounded-full hover:bg-red-200"
                    onClick={() => deleteDevice(model)}
                  >
                    <FaTrash />
                  </button>
                </div>

                {/* Select Button */}
                <button
                  onClick={() => selectDevice(model)}
                  className={`mt-4 py-2 px-5 w-full text-sm font-semibold rounded-lg ${
                    isSelected
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-800 hover:bg-blue-500 hover:text-white"
                  }`}
                >
                  {isSelected ? "✅ Selected" : "Select"}
                </button>
              </div>
            );
          })
        ) : (
          <p className="text-gray-500">No devices connected. Please add a device.</p>
        )}
      </div>

      {/* Health Data Section */}
      <div className="mt-10">
        <h3 className="text-2xl font-semibold text-gray-800">Health Data</h3>
        <button
          className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          onClick={fetchHealthData}
        >
          Fetch Health Data
        </button>
        {healthData && (
          <div className="mt-6 p-4 bg-white shadow-md rounded-xl">
            <h4 className="text-xl font-semibold">Health Metrics</h4>
            <pre className="text-sm text-gray-600">{JSON.stringify(healthData, null, 2)}</pre>
          </div>
        )}
      </div>

      {/* AI Insights Section */}
      <div className="mt-10">
        <h3 className="text-2xl font-semibold text-gray-800">AI Insights</h3>
        <button
          className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          onClick={getAIInsights}
        >
          Get AI Insights
        </button>
        {aiInsights && (
          <div className="mt-6 p-4 bg-white shadow-md rounded-xl">
            <h4 className="text-xl font-semibold">AI Insights</h4>
            <pre className="text-sm text-gray-600">{JSON.stringify(aiInsights, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeviceList;
