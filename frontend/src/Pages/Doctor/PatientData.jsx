import React, { useState } from "react";
import { FileText, Edit, Trash2 } from "react-feather";
import { FaHome, FaUserMd, FaUser, FaSignOutAlt } from "react-icons/fa";
import Modal from "../../utils/modal"; // Ensure you have a reusable Modal component

// Mock Patient Data (Replace with API data if needed)
const patients = [
  {
    id: 1,
    name: "John Doe",
    age: 45,
    lastVisit: "2024-03-15",
    condition: "Hypertension",
    email: "johndoe@example.com",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120&h=120",
  },
  {
    id: 2,
    name: "Jane Smith",
    age: 32,
    lastVisit: "2024-03-14",
    condition: "Diabetes Type 2",
    email: "janesmith@example.com",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=120&h=120",
  },
];

function Details() {
  const [modalType, setModalType] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
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

  // Open modal with selected patient details
  const openModal = (type, patient) => {
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
    setModalType(type);
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedPatient(null);
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left Navbar */}
      <div className="w-1/4 bg-white text-blue p-6 flex flex-col items-center shadow-md">
        <div className="mb-6">
          <img src="/doctor.jpg" alt="Doctor Avatar" className="w-40 h-50 mb-4 rounded-lg shadow-sm" />
          <h2 className="text-xl font-semibold">Dr. John Smith</h2>
          <p className="text-sm text-blue-600">Cardiologist</p>
        </div>
        <div className="space-y-4 w-full">
          <button className="flex items-center w-full rounded-xl px-4 py-2 text-left hover:bg-sky-100">
            <FaHome className="mr-3 text-blue-800" /> <span className="text-blue-800 font-bold">Home</span>
          </button>
          <button className="flex items-center w-full px-4 rounded-xl py-2 text-left hover:bg-sky-100">
            <FaUserMd className="mr-3 text-blue-800" /> <span className="text-blue-800 font-bold">Appointments</span>
          </button>
          <button className="flex items-center w-full px-4 py-2 rounded-xl text-left hover:bg-sky-100">
            <FaUser className="mr-3 text-blue-800" /> <span className="text-blue-800 font-bold">Patients</span>
          </button>
          <button className="flex items-center w-full px-4 py-2 rounded-xl text-left hover:bg-sky-100">
            <FaSignOutAlt className="mr-3 text-blue-800" /> <span className="text-blue-800 font-bold">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800">Patient Records</h1>
          </div>

          {/* Patient Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {patients.map((patient) => (
              <div key={patient.id} className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all p-8 max-w-xl w-full">
                <div className="flex items-center gap-6 mb-6">
                  <img src={patient.image} alt={patient.name} className="w-24 h-24 rounded-full object-cover border-2 border-gray-300" />
                  <div>
                    <h3 className="text-2xl font-semibold text-gray-800">{patient.name}</h3>
                    <p className="text-lg text-gray-600">Age: {patient.age}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 mt-6">
                  <button onClick={() => openModal("prescription", patient)} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                    <FileText size={20} />
                    Add Prescription
                  </button>
                  <button onClick={() => openModal("testReport", patient)} className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">
                    <Edit size={20} />
                    Add Test Report
                  </button>
                  <button onClick={() => openModal("diagnosis", patient)} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600">
                    <Trash2 size={20} />
                    Add Diagnosis
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal for Prescription */}
      <Modal isOpen={modalType === "prescription"} onClose={closeModal} title="Add Prescription">
        <input name="medication" placeholder="Medication" className="border p-2 w-full mb-2" onChange={handleChange} value={formData.medication} />
        <input name="dosage" placeholder="Dosage" className="border p-2 w-full mb-2" onChange={handleChange} value={formData.dosage} />
        <button className="bg-blue-500 text-white px-4 py-2 rounded w-full hover:bg-blue-600" onClick={closeModal}>
          Submit
        </button>
      </Modal>

      {/* Modal for Test Report */}
      <Modal isOpen={modalType === "testReport"} onClose={closeModal} title="Add Test Report">
        <input name="testName" placeholder="Test Name" className="border p-2 w-full mb-2" onChange={handleChange} value={formData.testName} />
        <input name="result" placeholder="Result" className="border p-2 w-full mb-2" onChange={handleChange} value={formData.result} />
        <input type="file" name="document" className="border p-2 w-full mb-2" onChange={handleChange} />
        <button className="bg-green-500 text-white px-4 py-2 rounded w-full hover:bg-green-600" onClick={closeModal}>
          Submit
        </button>
      </Modal>

      {/* Modal for Diagnosis */}
      <Modal isOpen={modalType === "diagnosis"} onClose={closeModal} title="Add Diagnosis">
        <input name="condition" placeholder="Condition" className="border p-2 w-full mb-2" onChange={handleChange} value={formData.condition} />
        <input name="notes" placeholder="Notes" className="border p-2 w-full mb-2" onChange={handleChange} value={formData.notes} />
        <button className="bg-red-500 text-white px-4 py-2 rounded w-full hover:bg-red-600" onClick={closeModal}>
          Submit
        </button>
      </Modal>
    </div>
  );
}

export default Details;
