import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { FaHome, FaUserMd, FaUser, FaSignOutAlt, FaVideo, FaCalendarAlt, FaExclamationCircle } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import Modal from '../../utils/modal';

const socket = io(`${import.meta.env.VITE_BASE_API_URL}`, {
  transports: ['websocket'],
  withCredentials: true,
});

function DoctorAppointments() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [endedSession, setEndedSession] = useState(null);
  const [activeSession, setActiveSession] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  // Reschedule Modal State
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [newAppointmentDate, setNewAppointmentDate] = useState('');
  const [newAppointmentTime, setNewAppointmentTime] = useState('');

  // Fetch appointments on component mount
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BASE_API_URL}/api/doctor/pending-consultations`, {
          headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('accessToken')}`
          }
        });
        console.log(response.data);
        // Ensure appointments is always an array
        setAppointments(Array.isArray(response.data.consultations) ? response.data.consultations : []);
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

  useEffect(() => {
    if (!activeSession) return;

    const handleSessionEnd = (data) => {
      setEndedSession(activeSession);
      setActiveSession(null);
      setShowModal(false);
      setShowFeedback(true);
    };

    socket.on(`sessionEnded-${activeSession._id}`, handleSessionEnd);

    return () => {
      socket.off(`sessionEnded-${activeSession._id}`, handleSessionEnd);
    };
  }, [activeSession]);

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
    if (!activeSession) {
      setError('No active session to end.');
      return;
    }
  
    try {
      await axios.post(
        `${import.meta.env.VITE_BASE_API_URL}/api/doctor/end`,
        { sessionId: activeSession.id },
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem('accessToken')}`,
          },
        }
      );
  
      socket.emit('endSession', { sessionId: activeSession.id });
      setEndedSession(activeSession);
      setActiveSession(null);
      setShowModal(false);
      setShowFeedback(true);
    } catch (error) {
      setError('Failed to end session. Please try again.');
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
      await axios.post(`${import.meta.env.VITE_BASE_API_URL}/api/doctor/reschedule/${selectedAppointment.id}`, {
        newDateTime: newDateTime.toISOString()
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      // Refresh appointments
      const response = await axios.get(`${import.meta.env.VITE_BASE_API_URL}/api/doctor/active`, {
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
      <form onSubmit={handleRescheduleSubmit} className="space-y-6">
        <div>
          <label className="block text-stone-700 font-semibold mb-2">Patient Name</label>
          <input 
            type="text" 
            value={selectedAppointment.patientName} 
            disabled 
            className="w-full p-3 border border-stone-300 rounded-xl bg-stone-50 text-stone-600"
          />
        </div>
        
        <div>
          <label className="block text-stone-700 font-semibold mb-2">Current Appointment</label>
          <input 
            type="text" 
            value={format(new Date(selectedAppointment.date), 'PPP p')} 
            disabled 
            className="w-full p-3 border border-stone-300 rounded-xl bg-stone-50 text-stone-600"
          />
        </div>
        
        <div>
          <label className="block text-stone-700 font-semibold mb-2">New Date</label>
          <input 
            type="date" 
            value={newAppointmentDate}
            onChange={(e) => setNewAppointmentDate(e.target.value)}
            className="w-full p-3 border border-stone-300 rounded-xl focus:border-green-400 focus:ring-2 focus:ring-green-200 transition-colors"
            required
          />
        </div>
        
        <div>
          <label className="block text-stone-700 font-semibold mb-2">New Time</label>
          <input 
            type="time" 
            value={newAppointmentTime}
            onChange={(e) => setNewAppointmentTime(e.target.value)}
            className="w-full p-3 border border-stone-300 rounded-xl focus:border-green-400 focus:ring-2 focus:ring-green-200 transition-colors"
            required
          />
        </div>
        
        <button 
          type="submit" 
          className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white p-3 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
        >
          Reschedule Appointment
        </button>
      </form>
    );
  };

  // No Appointments Component
  const NoAppointments = () => (
    <div className="flex flex-col items-center justify-center p-12 bg-gradient-to-br from-stone-50 to-stone-100 rounded-2xl border border-stone-200">
      <div className="w-20 h-20 bg-stone-200 rounded-full flex items-center justify-center mb-6">
        <FaExclamationCircle className="text-3xl text-stone-400" />
      </div>
      <h3 className="text-2xl font-bold text-stone-600 mb-3">No Appointments Currently</h3>
      <p className="text-stone-500 text-center text-lg">
        You don't have any scheduled appointments at the moment.
      </p>
    </div>
  );

  const joinSession = async (sessionId) => {
    console.log(sessionId)
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_API_URL}/api/doctor/${sessionId}/join-session`,
        {},
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem('accessToken')}`,
          },
        }
      );
      
      if (response.data.success) {
        console.log('success')
        console.log(response.data); // Log to verify the response structure
        
        // Get basic info from appointments and enhanced data from API response
        const sessionBasicInfo = appointments.find(s => s.id === sessionId);
        const sessionWithRoomName = {
          ...sessionBasicInfo,
          roomName: response.data.session.roomName // Use roomName from API response
        };
        
        setActiveSession(sessionWithRoomName);
        setShowModal(true);
        
        // Emit socket event for user joining
        socket.emit('doctorJoined', { sessionId });
      }
    } catch (error) {
      setError('Failed to join session. Please try again.');
    }
  };

  return (
    <div className="flex min-h-screen bg-stone-100">
      {/* Left Navbar */}
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
          <p className="text-sm text-stone-600 bg-green-200 px-3 py-1 rounded-full inline-block">Cardiologist</p>
        </div>
        
        <div className="space-y-3 w-full">
          <button className="flex items-center w-full rounded-xl px-4 py-3 text-left hover:bg-green-200 transition-all duration-200 group border border-transparent hover:border-green-300 hover:shadow-md" onClick={() => navigate('/')}>
            <FaHome className="mr-3 text-stone-700 group-hover:text-stone-800" />
            <span className='text-stone-700 font-semibold group-hover:text-stone-800'>Home</span>
          </button>
          <button className="flex items-center w-full px-4 rounded-xl py-3 text-left bg-green-200 border border-green-300 shadow-md" onClick={() => navigate('/appointments')}>
            <FaUserMd className="mr-3 text-stone-800" />
            <span className='text-stone-800 font-semibold'>Appointments</span>
          </button>
          <button className="flex items-center w-full px-4 py-3 rounded-xl text-left hover:bg-green-200 transition-all duration-200 group border border-transparent hover:border-green-300 hover:shadow-md" onClick={() => navigate('/details')}>
            <FaUser className="mr-3 text-stone-700 group-hover:text-stone-800" />
            <span className='text-stone-700 font-semibold group-hover:text-stone-800'>Patients</span>
          </button>
          <button className="flex items-center w-full px-4 py-3 rounded-xl text-left hover:bg-red-100 transition-all duration-200 group border border-transparent hover:border-red-200 hover:shadow-md mt-8">
            <FaSignOutAlt className="mr-3 text-red-600 group-hover:text-red-700" />
            <span className='text-red-600 font-semibold group-hover:text-red-700'>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-stone-200">
          <div className="flex items-center mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-500 rounded-xl flex items-center justify-center mr-4 shadow-lg">
              <FaCalendarAlt className="text-white text-xl" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-stone-800">Upcoming Appointments</h2>
              <div className="w-16 h-1 bg-gradient-to-r from-orange-400 to-orange-300 rounded-full mt-2"></div>
            </div>
          </div>

          {/* Conditional Rendering */}
          {!appointments || appointments.length === 0 ? (
            <NoAppointments />
          ) : (
            <div className="space-y-6">
              {appointments.map((appointment) => (
                <div 
                  key={appointment.id} 
                  className="bg-gradient-to-r from-stone-50 to-stone-25 border border-stone-200 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:border-green-200"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center mb-3">
                        <div className="w-3 h-3 bg-green-400 rounded-full mr-3"></div>
                        <h3 className="font-bold text-xl text-stone-800">{appointment.name || appointment.patientName}</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center text-stone-600">
                          <FaCalendarAlt className="mr-2 text-orange-500" />
                          <span className="font-medium">
                            {appointment.date && format(new Date(appointment.date), 'MMM dd, yyyy')}
                          </span>
                        </div>
                        <div className="flex items-center text-stone-600">
                          <div className="w-2 h-2 bg-orange-400 rounded-full mr-3"></div>
                          <span className="font-medium">{appointment.time}</span>
                        </div>
                      </div>
                      
                      <div className="bg-white rounded-lg p-4 border border-stone-200 mb-4">
                        <p className="text-sm text-stone-500 font-medium mb-1">Consultation Type</p>
                        <p className="text-stone-700 font-semibold">{appointment.type || "General Consultation"}</p>
                      </div>
                      
                      <div className="bg-white rounded-lg p-4 border border-stone-200">
                        <p className="text-sm text-stone-500 font-medium mb-1">Issue Details</p>
                        <p className="text-stone-700">{appointment.issueDetails || appointment.symptoms || "No details provided"}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-3 ml-6">
                      <button
                        onClick={() => joinSession(appointment.id)}
                        className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center justify-center font-semibold shadow-lg hover:shadow-xl"
                      >
                        <FaVideo className="mr-2" /> Start Call
                      </button>
                      <button 
                        className="px-6 py-3 bg-gradient-to-r from-orange-100 to-orange-50 text-orange-700 rounded-xl hover:from-orange-200 hover:to-orange-100 transition-all duration-200 font-semibold border border-orange-200 hover:border-orange-300"
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

      {/* Video Call Modal */}
      {showModal && activeSession && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-t-2xl flex justify-between items-center">
              <h2 className="text-2xl font-bold">
                Session with Patient {activeSession.user?.fullName}
              </h2>
              <button
                onClick={endSession}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
              >
                End Session
              </button>
            </div>
            
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              {/* Video Call Area */}
              <div className="flex-1 p-2 bg-stone-100">
                <iframe
                  src={`https://meet.jit.si/${activeSession.roomName}`}
                  width="100%"
                  height="100%"
                  allow="camera; microphone; fullscreen; display-capture"
                  className="rounded-xl shadow-lg"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DoctorAppointments;