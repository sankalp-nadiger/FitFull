import React, { useState, useEffect } from 'react';

const PatientData = () => {
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    // Fetch patient list from the backend
    fetch('/api/patients')
      .then(response => response.json())
      .then(data => setPatients(data))
      .catch(error => console.error('Error fetching patients:', error));
  }, []);

  const handleUpdate = (id, field, value) => {
    setPatients(patients.map(patient => 
      patient.id === id ? { ...patient, [field]: value } : patient
    ));
  };

  const handleSubmit = (id) => {
    const patient = patients.find(p => p.id === id);
    fetch(`/api/patients/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patient),
    })
    .then(response => response.json())
    .then(data => console.log('Updated:', data))
    .catch(error => console.error('Error updating patient:', error));
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6">Patient Data</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {patients.map(patient => (
          <div key={patient.id} className="bg-white shadow-lg rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-2">{patient.name}</h2>
            <div className="mb-2">
              <label className="block text-sm font-medium">Prescriptions</label>
              <textarea
                className="w-full p-2 border border-gray-300 rounded"
                value={patient.prescriptions}
                onChange={(e) => handleUpdate(patient.id, 'prescriptions', e.target.value)}
              />
            </div>
            <div className="mb-2">
              <label className="block text-sm font-medium">Tests</label>
              <textarea
                className="w-full p-2 border border-gray-300 rounded"
                value={patient.tests}
                onChange={(e) => handleUpdate(patient.id, 'tests', e.target.value)}
              />
            </div>
            <div className="mb-2">
              <label className="block text-sm font-medium">Diagnosis</label>
              <textarea
                className="w-full p-2 border border-gray-300 rounded"
                value={patient.diagnosis}
                onChange={(e) => handleUpdate(patient.id, 'diagnosis', e.target.value)}
              />
            </div>
            <button
              onClick={() => handleSubmit(patient.id)}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Save
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PatientData;
