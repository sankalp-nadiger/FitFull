import React from 'react';
import { FaHome, FaUserMd, FaUser, FaSignOutAlt} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

function Appointments() {
    const navigate = useNavigate();
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
       <div className="w-1/4 bg-white text-blue p-6 flex flex-col items-center">
              <div className="mb-6">
                <img 
                  src="/doctor.jpg" 
                  alt="Doctor Avatar" 
                  className="w-40 h-50 mb-4 " 
                />
                <h2 className="text-xl font-semibold">Dr. John Smith</h2>
                <p className="text-sm text-blue-600">Cardiologist</p>
              </div>
              <div className="space-y-4 w-full" >
                <button className="flex items-center w-full rounded-xl px-4 py-2 text-left hover:bg-sky-100" onClick={() => navigate('/doctor-dashboard')}>
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
        {/* Overview Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-red-100 p-4 rounded-xl text-center">
            <h3 className="text-xl font-semibold">140</h3>
            <p className="text-gray-600">New Messages</p>
          </div>
          <div className="bg-blue-100 p-4 rounded-xl text-center">
            <h3 className="text-xl font-semibold">210</h3>
            <p className="text-gray-600">Bookings</p>
          </div>
          <div className="bg-purple-100 p-4 rounded-xl text-center">
            <h3 className="text-xl font-semibold">21,000</h3>
            <p className="text-gray-600">Earnings</p>
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-white p-6 rounded-xl shadow-md mb-6">
          <h3 className="text-lg font-semibold mb-4">Calendar</h3>
          <div className="flex justify-between items-center">
            {['13', '14', '15', '16', '17', '18', '19'].map((day, index) => (
              <div
                key={index}
                className={`flex flex-col items-center ${day === '16' ? 'text-blue-800' : 'text-gray-700'}`}
              >
                <div
                  className={`w-10 h-10 flex items-center justify-center rounded-full ${day === '16' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                >
                  {day}
                </div>
                <span className="text-sm">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][index]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Consultations */}
        <div className="bg-white p-6 rounded-xl shadow-md mb-6">
          <h3 className="text-lg font-semibold mb-4">Today's Consultations</h3>
          <div className="space-y-4">
            {[{ name: 'Amiksha Batra', time: '1:30pm-03:30pm' }, { name: 'Ross Geller', time: '1:30pm-03:30pm' }].map((consultation, index) => (
              <div key={index} className="flex justify-between items-center border-b pb-2">
                <div>
                  <h4 className="font-medium">{consultation.name}</h4>
                  <p className="text-sm text-gray-500">{consultation.time}</p>
                </div>
                <span className="text-blue-500">Completed</span>
              </div>
            ))}
          </div>
        </div>
            {/* pending */}
            <div className="bg-white p-6 rounded-xl shadow-md mb-6">
          <h3 className="text-lg font-semibold mb-4">Pending Consultations</h3>
          <div className="space-y-4">
            {[{ name: 'Amiksha Batra', time: '1:30pm-03:30pm' }, { name: 'Ross Geller', time: '1:30pm-03:30pm' },{name: 'Vaibhav Ron', time: '9:30pm-12:30pm'}].map((consultation, index) => (
              <div key={index} className="flex justify-between items-center border-b pb-2">
                <div>
                  <h4 className="font-medium">{consultation.name}</h4>
                  <p className="text-sm text-gray-500">{consultation.time}</p>
                </div>
                <div className="flex justify-center">
            <button className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-green-500">Accept</button>
          </div>    
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Appointments;
