import React from 'react';
import PatientData from './Patient';
import PatientDashboard from './PatientData';

const FinalPatient = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col md:flex-row gap-6">
      {/* Left Side: Patient Data */}
      <div className="w-full md:w-1/2 bg-white p-6 shadow-lg rounded-lg">
        <h1 className="text-2xl font-bold mb-4">Patient Data</h1>
        <PatientData />
      </div>
      
      {/* Right Side: Add Prescriptions & Other Info */}
      <div className="w-full md:w-1/2 bg-white p-6 shadow-lg rounded-lg">
        <h1 className="text-2xl font-bold mb-4">Manage Patient Records</h1>
        <PatientDashboard />
      </div>
    </div>
  );
};

export default FinalPatient;
