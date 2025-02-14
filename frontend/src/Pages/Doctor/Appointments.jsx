import React from 'react';
import { FaHome, FaCalendarAlt, FaUserMd, FaClipboardList, FaCog, FaBook, FaSignOutAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

function Appointments() {
    const navigate = useNavigate();
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-1/5 bg-gradient-to-b from-green-400 to-green-600 text-white p-6 flex flex-col">
        <div className="flex flex-col items-center mb-6">
          <img
            src="https://via.placeholder.com/80"
            alt="Profile"
            className="w-20 h-20 rounded-full mb-2"
          />
          <h2 className="text-lg font-semibold">Hi, Christan Gray</h2>
          <div className="mt-2 flex space-x-2">
            <button className="bg-white text-green-600 px-3 py-1 rounded-full text-xs">Profile</button>
            <button className="bg-white text-green-600 px-3 py-1 rounded-full text-xs relative">
              Notifications <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs px-1 rounded-full">2</span>
            </button>
          </div>
        </div>
        <nav className="flex-1">
          <ul className="space-y-4">
            <li className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/doctor-dashboard')}>
              <FaHome /> <span>Home</span>
            </li>
            <li className="flex items-center space-x-2 cursor-pointer">
              <FaCalendarAlt /> <span>My Availability</span>
            </li>
            <li className="flex items-center space-x-2 cursor-pointer">
              <FaUserMd /> <span>Doctor Database</span>
            </li>
            <li className="flex items-center space-x-2 cursor-pointer">
              <FaClipboardList /> <span>Consultations</span>
            </li>
            <li className="flex items-center space-x-2 cursor-pointer">
              <FaCog /> <span>Account</span>
            </li>
            <li className="flex items-center space-x-2 cursor-pointer">
              <FaBook /> <span>Patient Education</span>
            </li>
            <li className="flex items-center space-x-2 cursor-pointer">
              <FaSignOutAlt /> <span>Logout</span>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="w-4/5 p-6">
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
                className={`flex flex-col items-center ${day === '16' ? 'text-green-600' : 'text-gray-700'}`}
              >
                <div
                  className={`w-10 h-10 flex items-center justify-center rounded-full ${day === '16' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
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
                <span className="text-green-500">Completed</span>
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
            <button className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-blue-500">Accept</button>
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
