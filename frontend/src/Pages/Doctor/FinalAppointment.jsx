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
            <h3 className="font-semibold text-lg text-gray-800">{appointment.name || appointment.patientName}</h3>
            {/* Display time directly since it's already formatted */}
            <p className="text-gray-600">
            {appointment.date && format(new Date(appointment.date), 'MMM dd, yyyy')}
            </p>
            <p className="text-gray-600">
              {appointment.time}
            </p>
            <p className="text-sm text-gray-500 mt-1">{appointment.type || "Consultation"}</p>
            <p className="text-sm text-gray-700 mt-1">{appointment.issueDetails || appointment.symptoms || "No details provided"}</p>
          </div>
          <div className="flex space-x-2">
           
                <button
                onClick={() => joinSession(appointment.id)}
                className="w-full mt-2 p-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
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
      {showModal && activeSession && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl h-[90vh] flex flex-col">
            <div className="p-4 bg-purple-700 text-white rounded-t-lg flex justify-between items-center">
              <h2 className="text-xl font-semibold">
                Session with Patient {activeSession.user?.fullName}
              </h2>
              <button
                onClick={endSession}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded-md transition"
              >
                End Session
              </button>
            </div>
            
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              {/* Video Call Area */}
              <div className="flex-1 p-1 bg-gray-100">
                <iframe
                  src={`https://meet.jit.si/${activeSession.roomName}`}
                  width="100%"
                  height="100%"
                  allow="camera; microphone; fullscreen; display-capture"
                  className="rounded-none shadow-none"
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