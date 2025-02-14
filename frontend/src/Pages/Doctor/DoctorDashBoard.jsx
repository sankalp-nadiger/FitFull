import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PatientDashboard = () => {
  const [patients, setPatients] = useState([]);
  const [formData, setFormData] = useState({
    userEmail: '',
    condition: '',
    notes: '',
    testName: '',
    result: '',
    document: null,
    medication: '',
    dosage: ''
  });

  // Fetch users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/users', { withCredentials: true });
        setPatients(response.data.users);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  // 1️⃣ Submit Diagnosis
  const handleSubmitDiagnosis = async () => {
    const url = 'http://localhost:8000/api/doctor/diagnosis';
    const data = {
      userEmail: formData.userEmail,
      condition: formData.condition,
      notes: formData.notes
    };

    try {
      const response = await axios.post(url, data, { withCredentials: true });
      if (response.data.accessToken) {
        sessionStorage.setItem('accessToken', response.data.accessToken);
      }
      alert(`${response.data.message}`);
    } catch (error) {
      console.error('Error adding diagnosis:', error);
      alert('Failed to add diagnosis');
    }
  };

  // 2️⃣ Submit Test Report
  const handleSubmitTestReport = async () => {
    const url = 'http://localhost:8000/api/doctor/test-report';
    const form = new FormData();
    form.append('userEmail', formData.userEmail);
    form.append('testName', formData.testName);
    form.append('result', formData.result);
    form.append('document', formData.document);

    try {
      const response = await axios.post(url, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      });
      if (response.data.accessToken) {
        sessionStorage.setItem('accessToken', response.data.accessToken);
      }
      alert(`${response.data.message}`);
    } catch (error) {
      console.error('Error adding test report:', error);
      alert('Failed to add test report');
    }
  };

  // 3️⃣ Submit Prescription
  const handleSubmitPrescription = async () => {
    const url = 'http://localhost:8000/api/doctor/prescription';
    const data = {
      userEmail: formData.userEmail,
      medication: formData.medication,
      dosage: formData.dosage
    };

    try {
      const response = await axios.post(url, data, { withCredentials: true });
      if (response.data.accessToken) {
        sessionStorage.setItem('accessToken', response.data.accessToken);
      }
      alert(`${response.data.message}`);
    } catch (error) {
      console.error('Error adding prescription:', error);
      alert('Failed to add prescription');
    }
  };

  // Render UI
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-4">Patient Dashboard</h1>

      {/* Display Patients */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {patients.map((patient) => (
          <div key={patient._id} className="bg-white p-4 shadow rounded-lg">
            <h2 className="text-xl font-semibold">{patient.name}</h2>
            <p>Email: {patient.email}</p>
          </div>
        ))}
      </div>

      {/* Common Email Input */}
      <div className="mb-4">
        <input
          name="userEmail"
          placeholder="User Email"
          className="border p-2 w-full mb-2"
          onChange={handleChange}
          value={formData.userEmail}
        />
      </div>

      {/* Section 1: Add Diagnosis */}
      <div className="mt-4 bg-white p-6 shadow rounded-lg">
        <h2 className="text-xl font-bold mb-4">Add Diagnosis</h2>
        <input
          name="condition"
          placeholder="Condition"
          className="border p-2 w-full mb-2"
          onChange={handleChange}
          value={formData.condition}
        />
        <input
          name="notes"
          placeholder="Notes"
          className="border p-2 w-full mb-2"
          onChange={handleChange}
          value={formData.notes}
        />
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded"
          onClick={handleSubmitDiagnosis}
        >
          Add Diagnosis
        </button>
      </div>

      {/* Section 2: Add Test Report */}
      <div className="mt-4 bg-white p-6 shadow rounded-lg">
        <h2 className="text-xl font-bold mb-4">Add Test Report</h2>
        <input
          name="testName"
          placeholder="Test Name"
          className="border p-2 w-full mb-2"
          onChange={handleChange}
          value={formData.testName}
        />
        <input
          name="result"
          placeholder="Result"
          className="border p-2 w-full mb-2"
          onChange={handleChange}
          value={formData.result}
        />
        <input
          type="file"
          name="document"
          className="border p-2 w-full mb-2"
          onChange={handleChange}
        />
        <button
          className="bg-green-500 hover:bg-green-600 text-white p-2 rounded"
          onClick={handleSubmitTestReport}
        >
          Add Test Report
        </button>
      </div>

      {/* Section 3: Add Prescription */}
      <div className="mt-4 bg-white p-6 shadow rounded-lg">
        <h2 className="text-xl font-bold mb-4">Add Prescription</h2>
        <input
          name="medication"
          placeholder="Medication"
          className="border p-2 w-full mb-2"
          onChange={handleChange}
          value={formData.medication}
        />
        <input
          name="dosage"
          placeholder="Dosage"
          className="border p-2 w-full mb-2"
          onChange={handleChange}
          value={formData.dosage}
        />
        <button
          className="bg-purple-500 hover:bg-purple-600 text-white p-2 rounded"
          onClick={handleSubmitPrescription}
        >
          Add Prescription
        </button>
      </div>
    </div>
  );
};

export default PatientDashboard;
