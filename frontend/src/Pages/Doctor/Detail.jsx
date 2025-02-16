import React, { useState, useEffect } from "react";
import { FileText, Edit, Trash2 } from "lucide-react";
import { FaHome, FaUserMd, FaUser, FaSignOutAlt } from "react-icons/fa";
import Modal from "../../utils/modal";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Detail() {
  const [patientsList, setPatientsList] = useState([]);
  const [activeModalType, setActiveModalType] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [formData, setFormData] = useState({
    userEmail: "",
    condition: "",
    notes: "",
    testName: "",
    result: "",
    document: null,
    medication: "",
    dosage: "",
  });
  const navigate=useNavigate();
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const accessToken = sessionStorage.getItem("accessToken");
        if (!accessToken) {
          throw new Error("No access token found");
        }

        const response = await axios.get("http://localhost:8000/api/doctor/patients", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (response.data && response.data.patients) {
          setPatientsList(response.data.patients);
        } else if (Array.isArray(response.data)) {
          setPatientsList(response.data);
        }
      } catch (error) {
        console.error("Error fetching patients:", error);
        setPatientsList([]);
      }
    };

    fetchPatients();
  }, []);
  const openModal = (modalType, patient) => {
    setSelectedPatient(patient);
    setFormData({
      userEmail: patient.email,
      condition: patient.condition,
      notes: "",
      testName: "",
      result: "",
      document: null,
      medication: "",
      dosage: "",
    });
    setActiveModalType(modalType);
    setErrorMessage(null);
  };

  const closeModal = () => {
    setActiveModalType(null);
    setSelectedPatient(null);
    setErrorMessage(null);
  };

  const handleInputChange = (event) => {
    const { name, value, files } = event.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  const getApiEndpoint = (modalType) => {
    const apiBaseUrl = "http://localhost:8000/api/doctor";
    switch (modalType) {
      case "prescription":
        return `${apiBaseUrl}/prescription`;
      case "testReport":
        return `${apiBaseUrl}/test-report`;
      case "diagnosis":
        return `${apiBaseUrl}/diagnosis`;
      default:
        return null;
    }
  };

  const handleFormSubmit = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const apiEndpoint = getApiEndpoint(activeModalType);
      if (!apiEndpoint) {
        throw new Error("Invalid modal type");
      }

      const accessToken = sessionStorage.getItem("accessToken");
      if (!accessToken) {
        throw new Error("No access token found");
      }

      let requestData;
      if (activeModalType === "prescription") {
        requestData = {
          userEmail: formData.userEmail,
          medication: formData.medication,
          dosage: formData.dosage,
        };
      } else if (activeModalType === "testReport") {
        const formDataObject = new FormData();
        formDataObject.append("userEmail", formData.userEmail);
        formDataObject.append("testName", formData.testName);
        formDataObject.append("result", formData.result);
        if (formData.document) {
          formDataObject.append("document", formData.document);
        }
        requestData = formDataObject;
      } else if (activeModalType === "diagnosis") {
        requestData = {
          userEmail: formData.userEmail,
          condition: formData.condition,
          notes: formData.notes,
        };
      }

      const response = await axios({
        method: "POST",
        url: apiEndpoint,
        data: requestData,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          ...(activeModalType !== "testReport" && { "Content-Type": "application/json" }),
        },
      });

      if (response.status === 200 || response.status === 201) {
        alert(`${activeModalType} added successfully!`);
        closeModal();
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigate = (route) => {
    navigate(`/${route}`)
    console.log(`Navigating to ${route}`);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left Navbar */}
      <div className="w-1/4 bg-white text-blue p-6 flex flex-col items-center">
        <div className="mb-6">
          <img src="/doctor.jpg" alt="Doctor Avatar" className="w-40 h-50 mb-4" />
          <h2 className="text-xl font-semibold">Dr.Girish</h2>
          <p className="text-sm text-blue-600">Cardiologist</p>
        </div>
        <div className="space-y-4 w-full">
          <button 
            onClick={() => handleNavigate('doctor-dashboard')}
            className="flex items-center w-full rounded-xl px-4 py-2 text-left hover:bg-sky-100"
          >
            <FaHome className="mr-3 text-blue-800" /> <span className="text-blue-800 font-bold">Home</span>
          </button>
          <button 
            onClick={() => handleNavigate('appointments')}
            className="flex items-center w-full px-4 rounded-xl py-2 text-left hover:bg-sky-100"
          >
            <FaUserMd className="mr-3 text-blue-800" /> <span className="text-blue-800 font-bold">Appointments</span>
          </button>
          <button 
            className="flex items-center w-full px-4 py-2 rounded-xl text-left hover:bg-sky-100"
          >
            <FaUser className="mr-3 text-blue-800" /> <span className="text-blue-800 font-bold">Patients</span>
          </button>
          <button 
            onClick={() => handleNavigate('logout')}
            className="flex items-center w-full px-4 py-2 rounded-xl text-left hover:bg-sky-100"
          >
            <FaSignOutAlt className="mr-3 text-blue-800" /> <span className="text-blue-800 font-bold">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-3/4 p-6 ">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold mb-6 text-blue-900">Patient Records</h1>
          </div>

          {/* Patient Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {patientsList.map((patient) => (
              <div key={patient.id} className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all p-8 max-w-xl w-full">
                <div className="flex items-center gap-6 mb-6">
                  <img 
                    src="/api/placeholder/96/96" 
                    alt={patient.fullName} 
                    className="w-24 h-24 rounded-full object-cover border-2 border-gray-300" 
                  />
                  <div>
                    <h3 className="text-2xl font-semibold text-gray-800">{patient.fullName}</h3>
                    <p className="text-lg text-gray-600">{patient.email}</p>
                  </div>
                </div>

                <div className="space-y-4 text-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Patient ID:</span>
                    <span className="text-gray-900 font-medium">{patient.id}</span>
                  </div>
                </div>

                <div className="flex gap-4 mt-6">
                  <button 
                    onClick={() => openModal("prescription", patient)} 
                    className="flex-1 flex items-center justify-center gap-3 bg-blue-50 text-blue-600 px-5 py-3 rounded-lg hover:bg-blue-100 transition-all text-lg font-medium"
                  >
                    <FileText size={20} />
                    Add Prescription
                  </button>
                  <button 
                    onClick={() => openModal("testReport", patient)} 
                    className="flex-1 flex items-center justify-center gap-3 bg-green-50 text-green-600 px-5 py-3 rounded-lg hover:bg-green-100 transition-all text-lg font-medium"
                  >
                    <Edit size={20} />
                    Add Test Report
                  </button>
                  <button 
                    onClick={() => openModal("diagnosis", patient)} 
                    className="flex-1 flex items-center justify-center gap-3 bg-red-50 text-red-600 px-5 py-3 rounded-lg hover:bg-red-100 transition-all text-lg font-medium"
                  >
                    <Trash2 size={20} />
                    Add Diagnosis
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Prescription Modal */}
      <Modal isOpen={activeModalType === "prescription"} onClose={closeModal} title="Add Prescription">
        <div className="space-y-4">
          {errorMessage && <div className="text-red-600 bg-red-50 p-3 rounded-lg">{errorMessage}</div>}
          <input
            name="medication"
            placeholder="Medication"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            onChange={handleInputChange}
            value={formData.medication}
            disabled={isLoading}
          />
          <input
            name="dosage"
            placeholder="Dosage"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            onChange={handleInputChange}
            value={formData.dosage}
            disabled={isLoading}
          />
          <button
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300"
            onClick={handleFormSubmit}
            disabled={isLoading}
          >
            {isLoading ? 'Adding...' : 'Add Prescription'}
          </button>
        </div>
      </Modal>

      {/* Test Report Modal */}
      <Modal isOpen={activeModalType === "testReport"} onClose={closeModal} title="Add Test Report">
        <div className="space-y-4">
          {errorMessage && <div className="text-red-600 bg-red-50 p-3 rounded-lg">{errorMessage}</div>}
          <input
            name="testName"
            placeholder="Test Name"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            onChange={handleInputChange}
            value={formData.testName}
            disabled={isLoading}
          />
          <input
            name="result"
            placeholder="Result"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            onChange={handleInputChange}
            value={formData.result}
            disabled={isLoading}
          />
          <input
            type="file"
            name="document"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            onChange={handleInputChange}
            disabled={isLoading}
          />
          <button
            className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-300"
            onClick={handleFormSubmit}
            disabled={isLoading}
          >
            {isLoading ? 'Adding...' : 'Add Test Report'}
          </button>
        </div>
      </Modal>

      {/* Diagnosis Modal */}
      <Modal isOpen={activeModalType === "diagnosis"} onClose={closeModal} title="Add Diagnosis">
        <div className="space-y-4">
          {errorMessage && <div className="text-red-600 bg-red-50 p-3 rounded-lg">{errorMessage}</div>}
          <input
            name="condition"
            placeholder="Condition"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            onChange={handleInputChange}
            value={formData.condition}
            disabled={isLoading}
          />
          <textarea
            name="notes"
            placeholder="Notes"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 min-h-[100px]"
            onChange={handleInputChange}
            value={formData.notes}
            disabled={isLoading}
          />
          <button
            className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:bg-red-300"
            onClick={handleFormSubmit}
            disabled={isLoading}
          >
            {isLoading ? 'Adding...' : 'Add Diagnosis'}
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default Detail;