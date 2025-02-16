import React from 'react';
import { FaHome, FaUserMd, FaUser, FaSignOutAlt, FaMapMarkerAlt, FaEnvelope, FaPhone} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const DoctorDashboard = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-1/4 bg-white text-blue p-6 flex flex-col items-center">
        <div className="mb-6">
          <img 
            src="/doctor.jpg" 
            alt="Doctor Avatar" 
            className="w-40 h-50 mb-4 " 
          />
          <h2 className="text-xl font-semibold">Dr. Girish</h2>
          <p className="text-sm text-blue-600">Cardiologist</p>
        </div>
        <div className="space-y-4 w-full" >
          <button className="flex items-center w-full rounded-xl px-4 py-2 text-left hover:bg-sky-100" onClick={() => navigate('/')}>
            <FaHome className="mr-3 text-blue-800" /> <span className='text-blue-800 font-bold'>Home</span>
          </button>
          <button className="flex items-center w-full px-4  rounded-xl py-2 text-left hover:bg-sky-100" onClick={() => navigate('/appointments')} >
            <FaUserMd className="mr-3 text-blue-800" /> <span className='text-blue-800 font-bold'>Appointments</span>
          </button>
          <button className="flex items-center w-full px-4 py-2 rounded-xl text-left hover:bg-sky-100" onClick={() => navigate('/details')}>
            <FaUser className="mr-3 text-blue-800" /> <span className='text-blue-800 font-bold'>Patients</span>
          </button>
          <button className="flex items-center w-full px-4 py-2 rounded-xl text-left hover:bg-sky-100">
            <FaSignOutAlt className="mr-3 text-blue-800" /> <span className='text-blue-800 font-bold'>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-3/4 p-6">
        <h1 className="text-2xl font-bold mb-6 text-blue-900">Doctor Dashboard</h1>

        {/* About Me */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-blue-900">About Me</h2>
          <p className="text-gray-700">
            Experienced cardiologist with over 15 years of practice in diagnosing and treating cardiovascular conditions. 
            Specialized in interventional cardiology and preventive cardiac care. Committed to providing comprehensive 
            patient care and staying updated with the latest medical advancements.
          </p>
        </div>

        {/* Education */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-blue-900">Education</h2>
          <div className="mb-2">
            <p className="font-medium">MD in Cardiology</p>
            <p className="text-gray-600">Harvard Medical School | 2005-2009</p>
          </div>
          <div>
            <p className="font-medium">MBBS</p>
            <p className="text-gray-600">Johns Hopkins University | 2000-2005</p>
          </div>
        </div>

        {/* Experience */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-blue-900">Experience</h2>
          <div>
            <p className="font-medium">Senior Cardiologist</p>
            <p className="text-gray-600">Central Hospital | 2015-Present</p>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-6 flex flex-col space-y-2">
          <div className="flex items-center">
            <FaEnvelope className="text-blue-700 mr-3" />
            <p className="text-gray-700">girish@email.com</p>
          </div>
          <div className="flex items-center">
            <FaPhone className="text-blue-700 mr-3" />
            <p className="text-gray-700">+999999999</p>
          </div>
          <div className="flex items-center">
            <FaMapMarkerAlt className="text-blue-700 mr-3" />
            <p className="text-gray-700">Mysore,Karnataka</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
