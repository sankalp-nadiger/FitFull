import React from 'react';
import { FileText, Edit, Trash2 } from 'lucide-react';
import { FaHome, FaUserMd, FaUser, FaSignOutAlt } from 'react-icons/fa';

// Mock patient data - in a real app this would come from your backend
const patients = [
  {
    id: 1,
    name: "John Doe",
    age: 45,
    lastVisit: "2024-03-15",
    condition: "Hypertension",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120&h=120"
  },
  {
    id: 2,
    name: "Jane Smith",
    age: 32,
    lastVisit: "2024-03-14",
    condition: "Diabetes Type 2",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=120&h=120"
  }
];

function Details() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left Navbar */}
      <div className="w-1/4 bg-white text-blue p-6 flex flex-col items-center shadow-md">
        <div className="mb-6">
          <img 
            src="/doctor.jpg" 
            alt="Doctor Avatar" 
            className="w-40 h-50 mb-4 rounded-lg shadow-sm" 
          />
          <h2 className="text-xl font-semibold">Dr. John Smith</h2>
          <p className="text-sm text-blue-600">Cardiologist</p>
        </div>
        <div className="space-y-4 w-full">
          <button className="flex items-center w-full rounded-xl px-4 py-2 text-left hover:bg-sky-100">
            <FaHome className="mr-3 text-blue-800" /> <span className='text-blue-800 font-bold'>Home</span>
          </button>
          <button className="flex items-center w-full px-4 rounded-xl py-2 text-left hover:bg-sky-100">
            <FaUserMd className="mr-3 text-blue-800" /> <span className='text-blue-800 font-bold'>Appointments</span>
          </button>
          <button className="flex items-center w-full px-4 py-2 rounded-xl text-left hover:bg-sky-100">
            <FaUser className="mr-3 text-blue-800" /> <span className='text-blue-800 font-bold'>Patients</span>
          </button>
          <button className="flex items-center w-full px-4 py-2 rounded-xl text-left hover:bg-sky-100">
            <FaSignOutAlt className="mr-3 text-blue-800" /> <span className='text-blue-800 font-bold'>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800">Patient Records</h1>
          </div>

          {/* Patient Cards Grid - Now only 2 per row with wider width */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {patients.map((patient) => (
              <div key={patient.id} className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all p-8 max-w-xl w-full">
                {/* Patient Header */}
                <div className="flex items-center gap-6 mb-6">
                  <img
                    src={patient.image}
                    alt={patient.name}
                    className="w-24 h-24 rounded-full object-cover border-2 border-gray-300"
                  />
                  <div>
                    <h3 className="text-2xl font-semibold text-gray-800">{patient.name}</h3>
                    <p className="text-lg text-gray-600">Age: {patient.age}</p>
                  </div>
                </div>

                {/* Patient Details */}
                <div className="space-y-4 text-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Last Visit:</span>
                    <span className="text-gray-900 font-medium">{patient.lastVisit}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Condition:</span>
                    <span className="text-gray-900 font-medium">{patient.condition}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 mt-6">
                  <button className="flex-1 flex items-center justify-center gap-3 bg-blue-50 text-blue-600 px-5 py-3 rounded-lg hover:bg-blue-100 transition-all text-lg font-medium">
                    <FileText size={20} />
                    Add Prescription
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-3 bg-green-50 text-green-600 px-5 py-3 rounded-lg hover:bg-green-100 transition-all text-lg font-medium">
                    <Edit size={20} />
                    Add Test Report
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-3 bg-red-50 text-red-600 px-5 py-3 rounded-lg hover:bg-red-100 transition-all text-lg font-medium">
                    <Trash2 size={20} />
                    Add Diagnosis
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Details;
