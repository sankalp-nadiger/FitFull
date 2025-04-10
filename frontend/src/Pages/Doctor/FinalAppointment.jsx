import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { FaHome, FaUserMd, FaUser, FaSignOutAlt, FaVideo, FaCalendarAlt, FaExclamationCircle } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Modal from '../../utils/modal';

function DoctorAppointments() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Reschedule Modal State
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [newAppointmentDate, setNewAppointmentDate] = useState('');
  const [newAppointmentTime, setNewAppointmentTime] = useState('');

  // Fetch appointments on component mount
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/doctor/active', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        // Ensure appointments is always an array
        setAppointments(Array.isArray(response.data) ? response.data : []);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch appointments');
        setLoading(false);
        // Set to empty array to prevent map error
        setAppointments([]);
      }
    };
  
    fetchAppointments();
  }, []);

  // Open Reschedule Modal
  const openRescheduleModal = (appointment) => {
    setSelectedAppointment(appointment);
    setIsRescheduleModalOpen(true);
  };

  // Close Reschedule Modal
  const closeRescheduleModal = () => {
    setIsRescheduleModalOpen(false);
    setSelectedAppointment(null);
    setNewAppointmentDate('');
    setNewAppointmentTime('');
  };

  const endSession = async () => {
      try {
        setEnding(true);
        await axios.post(
          `${import.meta.env.VITE_BASE_API_URL}/api/doctor/end`,
          { sessionId },
          {
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem('accessToken')}`,
            },
          }
        );
        navigate('/appointments');
      } catch (error) {
        console.error("Failed to end session.", error);
      } finally {
        setEnding(false);
      }
    };

  // Handle Reschedule Submission
  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newAppointmentDate || !newAppointmentTime) {
      alert('Please select both date and time');
      return;
    }

    try {
      // Combine date and time
      const newDateTime = new Date(`${newAppointmentDate}T${newAppointmentTime}`);

      // API call to reschedule
      await axios.post(`http://localhost:8000/api/doctor/reschedule/${selectedAppointment.id}`, {
        newDateTime: newDateTime.toISOString()
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      // Refresh appointments
      const response = await axios.get('http://localhost:8000/api/doctor/active', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      setAppointments(response.data);
      
      // Close modal
      closeRescheduleModal();
      
      // Optional: Show success message
      alert('Appointment rescheduled successfully');
    } catch (err) {
      alert('Failed to reschedule appointment');
    }
  };

  // Reschedule Modal Content
  const RescheduleModalContent = () => {
    if (!selectedAppointment) return null;

    return (
      <form onSubmit={handleRescheduleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Patient Name</label>
          <input 
            type="text" 
            value={selectedAppointment.patientName} 
            disabled 
            className="w-full p-2 border rounded bg-gray-100"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Current Appointment</label>
          <input 
            type="text" 
            value={format(new Date(selectedAppointment.date), 'PPP p')} 
            disabled 
            className="w-full p-2 border rounded bg-gray-100"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">New Date</label>
          <input 
            type="date" 
            value={newAppointmentDate}
            onChange={(e) => setNewAppointmentDate(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">New Time</label>
          <input 
            type="time" 
            value={newAppointmentTime}
            onChange={(e) => setNewAppointmentTime(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        
        <button 
          type="submit" 
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Reschedule Appointment
        </button>
      </form>
    );
  };

  // No Appointments Component
  const NoAppointments = () => (
    <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg">
      <FaExclamationCircle className="text-6xl text-gray-400 mb-4" />
      <h3 className="text-xl font-semibold text-gray-600 mb-2">No Appointments Currently</h3>
      <p className="text-gray-500 text-center">
        You don't have any scheduled appointments at the moment.
      </p>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left Navbar */}
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
      <div className="flex-1 p-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-6">
            <FaCalendarAlt className="mr-3 text-blue-600 text-2xl" />
            <h2 className="text-2xl font-bold text-gray-800">Upcoming Appointments</h2>
          </div>

          {/* Conditional Rendering */}
          {!appointments || appointments.length === 0 ? (
            <NoAppointments />
          ) : (
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <div 
                  key={appointment.id} 
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-800">{appointment.patientName}</h3>
                      <p className="text-gray-600">
                        {format(new Date(appointment.date), 'PPP p')}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">{appointment.type}</p>
                      <p className="text-sm text-gray-700 mt-1">{appointment.symptoms}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        className="flex items-center bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
                        onClick={() => {
                            return (
                                <div className="min-h-screen flex flex-col justify-center items-center bg-gray-900">
                                  <h2 className="text-2xl font-semibold text-white mb-4">Live Consultation</h2>
                                  <div className="relative w-full max-w-4xl h-[70vh] bg-black">
                                    <iframe
                                      src={`https://meet.jit.si/${appointment.roomName}`}
                                      className="absolute top-0 left-0 w-full h-full"
                                      allow="camera; microphone; fullscreen; display-capture"
                                    ></iframe>
                                  </div>
                                  <button
                                    onClick={endSession}
                                    className="mt-6 px-6 py-2 bg-red-500 text-white font-semibold rounded-md hover:bg-red-600 transition"
                                    disabled={ending}
                                  >
                                    {ending ? 'Ending...' : 'End Session'}
                                  </button>
                                </div>
                              );
                        }}
                      >
                        <FaVideo className="mr-2" /> Start Call
                      </button>
                      <button 
                        className="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200 transition"
                        onClick={() => openRescheduleModal(appointment)}
                      >
                        Reschedule
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reschedule Modal */}
      <Modal 
        isOpen={isRescheduleModalOpen} 
        onClose={closeRescheduleModal}
        title="Reschedule Appointment"
      >
        <RescheduleModalContent />
      </Modal>
    </div>
  );
}

export default DoctorAppointments;