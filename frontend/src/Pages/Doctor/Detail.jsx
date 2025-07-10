import React, { useState, useEffect } from "react";
import { FileText, Edit, Clipboard, Eye, Plus } from "lucide-react";
import { FaHome, FaUserMd, FaUser, FaSignOutAlt, FaPlus, FaTimes } from "react-icons/fa";
import Modal from "../../utils/modal";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Detail() {
  const [patientsList, setPatientsList] = useState([]);
  const [activeModalType, setActiveModalType] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [patientRecords, setPatientRecords] = useState({
    prescriptions: [],
    testReports: [],
    diagnoses: []
  });
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
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const accessToken = sessionStorage.getItem("accessToken");
        if (!accessToken) throw new Error("No access token found");

        const response = await axios.get(
          `${import.meta.env.VITE_BASE_API_URL}/api/doctor/patients`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );

        setPatientsList(
          Array.isArray(response.data?.patients)
            ? response.data.patients
            : response.data || []
        );
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
      condition: patient.condition || "",
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
    setPatientRecords({
      prescriptions: [],
      testReports: [],
      diagnoses: []
    });
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  const fetchPatientRecords = async (patient) => {
    try {
      setIsLoading(true);
      const accessToken = sessionStorage.getItem("accessToken");
      if (!accessToken) throw new Error("No access token found");

      const headers = { Authorization: `Bearer ${accessToken}` };
      const baseURL = import.meta.env.VITE_BASE_API_URL;

      // Fetch all three types of records
      const [prescriptionsRes, testReportsRes, diagnosesRes] = await Promise.all([
        axios.get(`${baseURL}/api/doctor/prescriptions`, { headers }),
        axios.get(`${baseURL}/api/doctor/test-reports`, { headers }),
        axios.get(`${baseURL}/api/doctor/diagnoses`, { headers })
      ]);

      // Filter records for the selected patient
      const patientPrescriptions = prescriptionsRes.data.prescriptions?.filter(
        p => p.user.email === patient.email
      ) || [];
      
      const patientTestReports = testReportsRes.data.reports?.filter(
        r => r.user.email === patient.email
      ) || [];
      
      const patientDiagnoses = diagnosesRes.data.diagnoses?.filter(
        d => d.user.email === patient.email
      ) || [];

      setPatientRecords({
        prescriptions: patientPrescriptions,
        testReports: patientTestReports,
        diagnoses: patientDiagnoses
      });

      setSelectedPatient(patient);
      setActiveModalType("viewRecords");
    } catch (error) {
      console.error("Error fetching patient records:", error);
      setErrorMessage("Failed to fetch patient records. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const accessToken = sessionStorage.getItem("accessToken");
      if (!accessToken) throw new Error("No access token found");

      let apiEndpoint = `${import.meta.env.VITE_BASE_API_URL}/api/doctor`;
      let requestData = { userEmail: formData.userEmail };

      switch (activeModalType) {
        case "prescription":
          apiEndpoint += "/prescription";
          requestData = { ...requestData, medication: formData.medication, dosage: formData.dosage };
          break;
        case "testReport":
          apiEndpoint += "/test-report";
          if (formData.document) {
            const documentBase64 = await new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result);
              reader.onerror = reject;
              reader.readAsDataURL(formData.document);
            });
            requestData = {
              ...requestData,
              testName: formData.testName,
              result: formData.result,
              documentBase64,
              fileName: formData.document.name,
            };
          } else {
            requestData = { ...requestData, testName: formData.testName, result: formData.result };
          }
          break;
        case "diagnosis":
          apiEndpoint += "/diagnosis";
          requestData = { ...requestData, condition: formData.condition, notes: formData.notes };
          break;
        default:
          throw new Error("Invalid modal type");
      }

      const response = await axios.post(apiEndpoint, requestData, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if ([200, 201].includes(response.status)) {
        alert(`${activeModalType} added successfully!`);
        closeModal();
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setErrorMessage(
        error.response?.data?.message || "An error occurred. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigate = (route) => navigate(`/${route}`);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-stone-100 flex">
      {/* Sidebar - Consistent with Doctor Dashboard */}
      <div className="w-1/4 bg-gradient-to-b from-green-100 to-green-50 border-r border-green-200 p-6 flex flex-col items-center shadow-lg">
        <div className="mb-8 text-center">
          <div className="relative mb-6">
            <img
              src="/doctor.jpg"
              alt="Doctor Avatar"
              className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-green-200 shadow-lg"
            />
            <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
          <h2 className="text-2xl font-bold text-stone-800 mb-1">Dr. Girish</h2>
          <p className="text-sm text-stone-600 bg-green-200 px-3 py-1 rounded-full inline-block">
            Cardiologist
          </p>
        </div>

        <div className="space-y-3 w-full">
          <button
            onClick={() => handleNavigate("doctor-dashboard")}
            className="flex items-center w-full rounded-xl px-4 py-3 text-left hover:bg-green-200 transition-all duration-200 group border border-transparent hover:border-green-300 hover:shadow-md"
          >
            <FaHome className="mr-3 text-stone-700 group-hover:text-stone-800" />
            <span className="text-stone-700 font-semibold group-hover:text-stone-800">
              Home
            </span>
          </button>
          <button
            onClick={() => handleNavigate("appointments")}
            className="flex items-center w-full px-4 rounded-xl py-3 text-left hover:bg-green-200 transition-all duration-200 group border border-transparent hover:border-green-300 hover:shadow-md"
          >
            <FaUserMd className="mr-3 text-stone-700 group-hover:text-stone-800" />
            <span className="text-stone-700 font-semibold group-hover:text-stone-800">
              Appointments
            </span>
          </button>
          <button className="flex items-center w-full px-4 py-3 rounded-xl text-left bg-green-200 transition-all duration-200 group border border-green-300 shadow-md">
            <FaUser className="mr-3 text-stone-800" />
            <span className="text-stone-800 font-semibold">Patients</span>
          </button>
          <button
            onClick={() => handleNavigate("logout")}
            className="flex items-center w-full px-4 py-3 rounded-xl text-left hover:bg-red-100 transition-all duration-200 group border border-transparent hover:border-red-200 hover:shadow-md mt-8"
          >
            <FaSignOutAlt className="mr-3 text-red-600 group-hover:text-red-700" />
            <span className="text-red-600 font-semibold group-hover:text-red-700">
              Logout
            </span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-3/4 p-8 space-y-6">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-stone-800 mb-2">
              Patient Records
            </h1>
            <div className="w-16 h-1 bg-gradient-to-r from-orange-400 to-orange-300 rounded-full"></div>
          </div>
        </div>

        {/* Patient Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {patientsList.map((patient) => (
            <div
              key={patient.id}
              className="bg-white shadow-lg rounded-2xl p-6 border border-stone-200 hover:shadow-xl transition-shadow duration-300"
            >
              <div className="flex items-center gap-6 mb-6">
                <img
                  src="https://image.freepik.com/free-vector/man-profile-cartoon_18591-58482.jpg"
                  alt={patient.fullName}
                  className="w-20 h-20 rounded-full object-cover border-4 border-green-200 shadow-md"
                />
                <div>
                  <h3 className="text-xl font-semibold text-stone-800">
                    {patient.fullName}
                  </h3>
                  <p className="text-stone-600">{patient.email}</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* View Records Button - Distinct Section */}
                <div className="border-b border-stone-200 pb-3">
                  <button
                    onClick={() => fetchPatientRecords(patient)}
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-4 py-3 rounded-xl flex items-center justify-center transition-all duration-200 transform hover:scale-105 shadow-lg font-semibold"
                  >
                    <Eye className="mr-2" size={20} />
                    View Medical Records
                  </button>
                </div>

                {/* Add Records Section */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-stone-600 mb-2 flex items-center">
                    <Plus className="mr-1" size={16} />
                    Add New Records
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => openModal("prescription", patient)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg flex flex-col items-center transition-all duration-200 transform hover:scale-105 shadow-md text-xs"
                    >
                      <FileText size={16} className="mb-1" />
                      Prescription
                    </button>
                    <button
                      onClick={() => openModal("testReport", patient)}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg flex flex-col items-center transition-all duration-200 transform hover:scale-105 shadow-md text-xs"
                    >
                      <Edit size={16} className="mb-1" />
                      Test Report
                    </button>
                    <button
                      onClick={() => openModal("diagnosis", patient)}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded-lg flex flex-col items-center transition-all duration-200 transform hover:scale-105 shadow-md text-xs"
                    >
                      <Clipboard size={16} className="mb-1" />
                      Diagnosis
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* View Records Modal */}
      {activeModalType === "viewRecords" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">
                  {selectedPatient?.fullName}'s Medical Records
                </h2>
                <p className="text-purple-100">{selectedPatient?.email}</p>
              </div>
              <button
                onClick={closeModal}
                className="text-white hover:text-purple-200 transition-colors"
              >
                <FaTimes size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {isLoading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="text-lg text-stone-600">Loading records...</div>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Prescriptions Column */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                      <FileText className="text-blue-600" size={24} />
                      <h3 className="text-xl font-semibold text-stone-800">
                        Prescriptions ({patientRecords.prescriptions.length})
                      </h3>
                    </div>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {patientRecords.prescriptions.length > 0 ? (
                        patientRecords.prescriptions.map((prescription, index) => (
                          <div key={index} className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <div className="font-semibold text-blue-800 mb-2">
                              {prescription.medication}
                            </div>
                            <div className="text-sm text-stone-600 mb-2">
                              Dosage: {prescription.dosage}
                            </div>
                            <div className="text-xs text-stone-500">
                              {formatDate(prescription.createdAt)}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-stone-500">
                          No prescriptions found
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Test Reports Column */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                      <Edit className="text-green-600" size={24} />
                      <h3 className="text-xl font-semibold text-stone-800">
                        Test Reports ({patientRecords.testReports.length})
                      </h3>
                    </div>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {patientRecords.testReports.length > 0 ? (
                        patientRecords.testReports.map((report, index) => (
                          <div key={index} className="bg-green-50 p-4 rounded-lg border border-green-200">
                            <div className="font-semibold text-green-800 mb-2">
                              {report.testName}
                            </div>
                            <div className="text-sm text-stone-600 mb-2">
                              Result: {report.result}
                            </div>
                            {report.documentUrl && (
                              <div className="text-xs text-blue-600 mb-2">
                                <a href={report.documentUrl} target="_blank" rel="noopener noreferrer">
                                  View Document
                                </a>
                              </div>
                            )}
                            <div className="text-xs text-stone-500">
                              {formatDate(report.createdAt)}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-stone-500">
                          No test reports found
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Diagnoses Column */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                      <Clipboard className="text-orange-600" size={24} />
                      <h3 className="text-xl font-semibold text-stone-800">
                        Diagnoses ({patientRecords.diagnoses.length})
                      </h3>
                    </div>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {patientRecords.diagnoses.length > 0 ? (
                        patientRecords.diagnoses.map((diagnosis, index) => (
                          <div key={index} className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                            <div className="font-semibold text-orange-800 mb-2">
                              {diagnosis.condition}
                            </div>
                            <div className="text-sm text-stone-600 mb-2">
                              Notes: {diagnosis.notes}
                            </div>
                            <div className="text-xs text-stone-500">
                              {formatDate(diagnosis.createdAt)}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-stone-500">
                          No diagnoses found
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Existing Modals */}
      <Modal
        isOpen={activeModalType === "prescription"}
        onClose={closeModal}
        title="Add Prescription"
      >
        <div className="space-y-4">
          {errorMessage && (
            <div className="text-red-600 bg-red-50 p-3 rounded-lg">
              {errorMessage}
            </div>
          )}
          <div className="space-y-2">
            <label className="text-stone-600">Medication</label>
            <input
              name="medication"
              className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onChange={handleInputChange}
              value={formData.medication}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <label className="text-stone-600">Dosage</label>
            <input
              name="dosage"
              className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onChange={handleInputChange}
              value={formData.dosage}
              disabled={isLoading}
            />
          </div>
          <button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:bg-blue-300 mt-4 flex items-center justify-center"
            onClick={handleFormSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              "Adding..."
            ) : (
              <>
                <FaPlus className="mr-2" />
                Add Prescription
              </>
            )}
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={activeModalType === "testReport"}
        onClose={closeModal}
        title="Add Test Report"
      >
        <div className="space-y-4">
          {errorMessage && (
            <div className="text-red-600 bg-red-50 p-3 rounded-lg">
              {errorMessage}
            </div>
          )}
          <div className="space-y-2">
            <label className="text-stone-600">Test Name</label>
            <input
              name="testName"
              className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              onChange={handleInputChange}
              value={formData.testName}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <label className="text-stone-600">Result</label>
            <input
              name="result"
              className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              onChange={handleInputChange}
              value={formData.result}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <label className="text-stone-600">Document</label>
            <input
              type="file"
              name="document"
              className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              onChange={handleInputChange}
              disabled={isLoading}
            />
          </div>
          <button
            className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors disabled:bg-green-300 mt-4 flex items-center justify-center"
            onClick={handleFormSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              "Adding..."
            ) : (
              <>
                <FaPlus className="mr-2" />
                Add Test Report
              </>
            )}
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={activeModalType === "diagnosis"}
        onClose={closeModal}
        title="Add Diagnosis"
      >
        <div className="space-y-4">
          {errorMessage && (
            <div className="text-red-600 bg-red-50 p-3 rounded-lg">
              {errorMessage}
            </div>
          )}
          <div className="space-y-2">
            <label className="text-stone-600">Condition</label>
            <input
              name="condition"
              className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              onChange={handleInputChange}
              value={formData.condition}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <label className="text-stone-600">Notes</label>
            <textarea
              name="notes"
              className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 min-h-[100px]"
              onChange={handleInputChange}
              value={formData.notes}
              disabled={isLoading}
            />
          </div>
          <button
            className="w-full bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors disabled:bg-orange-300 mt-4 flex items-center justify-center"
            onClick={handleFormSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              "Adding..."
            ) : (
              <>
                <FaPlus className="mr-2" />
                Add Diagnosis
              </>
            )}
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default Detail;