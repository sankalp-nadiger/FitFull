import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import { motion } from 'framer-motion';
import Navbar from '../Navbar';

const socket = io(`${import.meta.env.VITE_BASE_API_URL}`, {
  transports: ['websocket'],
  withCredentials: true,
});

const UserTelemedicine = () => {
  const navigate = useNavigate();
  
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notes, setNotes] = useState('');
  const [noteStatus, setNoteStatus] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [feedbackStatus, setFeedbackStatus] = useState('');
  const [rating, setRating] = useState(5);
  const [endedSession, setEndedSession] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [testReport, setTestReport] = useState(null);
  const [testReportStatus, setTestReportStatus] = useState('');
  const [recommendedDoctors, setRecommendedDoctors] = useState([]);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [summaryStatus, setSummaryStatus] = useState("");

  // Payment states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState(0);

  const handleSendMedicalSummary = async () => {
    try {
      setSummaryStatus("Generating and sending medical summary...");
      
      const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}/api/sessions/send-medical-summary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId: activeSession._id }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSummaryStatus("Medical summary sent successfully!");
      } else {
        setSummaryStatus(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error sending medical summary:", error);
      setSummaryStatus("Failed to send medical summary. Please try again.");
    }
  };

  // Fetch active sessions on component mount
  useEffect(() => {
    fetchActiveSessions();
  }, []);

  const fetchActiveSessions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_BASE_API_URL}/api/doctor/active`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('accessToken')}`,
        },
        withCredentials: true,
      });
      
      setSessions(response.data.sessions);
      setError('');
    } catch (error) {
      setError('Failed to fetch appointments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Socket event handler for session updates
  useEffect(() => {
    const handleSessionUpdate = (data) => {
      fetchActiveSessions();
    };

    socket.on('sessionUpdate', handleSessionUpdate);

    return () => {
      socket.off('sessionUpdate', handleSessionUpdate);
    };
  }, []);

  // Handle session ending
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

  const initiatePayment = (session) => {
    if (!session) return;
    
    setSelectedSession(session);
    const fee = session.fee || 500; // Default to 500 if no fee is specified
    setPaymentAmount(fee);
    setShowPaymentModal(true);
  };

  const handlePaymentComplete = () => {
    if (!selectedSession) return;
    
    setShowPaymentModal(false);
    joinSession(selectedSession._id);
  };

  const cancelPayment = () => {
    setShowPaymentModal(false);
    setSelectedSession(null);
  };

  const joinSession = async (sessionId) => {
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
        const session = sessions.find(s => s._id === sessionId);
        setActiveSession(session);
        setShowModal(true);
        
        // Emit socket event for user joining
        socket.emit('userJoined', { sessionId });
      }
    } catch (error) {
      setError('Failed to join session. Please try again.');
    }
  };

  const handleAddNotes = async () => {
    try {
      // Get the authentication token from localStorage or wherever you store it
      const accessToken = sessionStorage.getItem('accessToken'); // Adjust based on how you store your token
      
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_API_URL}/api/doctor/sessions/${sessionId}/notes`,
        { notes: notes }, // This is the request body in axios format
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}` // Add the Bearer token
          }
        }
      );
      
      // Axios automatically handles the JSON parsing
      const data = response.data;
      
      // Axios handles status codes differently than fetch
      setNoteStatus(data.message || "Notes added successfully!");
    } catch (error) {
      console.error("Error saving notes:", error);
      // Get the error message from the response if available
      const errorMessage = error.response?.data?.message || "An error occurred while saving notes";
      setNoteStatus(errorMessage);
    }
  };

  const endSession = async () => {
    if (!activeSession) {
      setError('No active session to end.');
      return;
    }
    
    try {
      await axios.post(
        `${import.meta.env.VITE_BASE_API_URL}/api/users/end`,
        { sessionId: activeSession._id },
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem('accessToken')}`,
          },
        }
      );
  
      socket.emit('endSession', { sessionId: activeSession._id });
      setEndedSession(activeSession);
      setActiveSession(null);
      setShowModal(false);
      setShowFeedback(true);
    } catch (error) {
      setError('Failed to end session. Please try again.');
    }
  };

  const handleTestReportUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('report', file);
    formData.append('sessionId', activeSession._id);

    try {
      setTestReportStatus('Uploading...');
      await axios.post(
        `${import.meta.env.VITE_BASE_API_URL}/api/users/upload-report`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${sessionStorage.getItem('accessToken')}`,
          },
        }
      );
      setTestReportStatus('Report uploaded successfully!');
      setTimeout(() => setTestReportStatus(''), 3000);
      setTestReport(file.name);
    } catch (error) {
      setTestReportStatus('Failed to upload report. Please try again.');
    }
  };

  const handleFeedbackSubmit = async () => {
    if (!endedSession || !endedSession._id) {
      setFeedbackStatus("Session information missing.");
      return;
    }
  
    if (!feedback.trim()) {
      setFeedbackStatus("Please provide some feedback");
      return;
    }
  
    try {
      await axios.post(
        `${import.meta.env.VITE_BASE_API_URL}/api/users/feedback`,
        {
          feedback,
          rating,
          sessionId: endedSession._id
        },
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
          },
        }
      );
  
      setFeedbackStatus("Thank you for your feedback!");

      // After feedback, get doctor recommendations
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_API_URL}/api/doctor/recommendations/${endedSession.doctor._id}`,
          {
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
            },
          }
        );
        
        setRecommendedDoctors(response.data.recommendations);
        setShowRecommendations(true);
      } catch (err) {
        console.error("Failed to fetch doctor recommendations:", err);
      }

    } catch (error) {
      setFeedbackStatus("Failed to submit feedback. Please try again.");
    }
  };

  const handleSkipFeedback = () => {
    setShowFeedback(false);
    setFeedback('');
    setRating(5);
    setEndedSession(null);
    setFeedbackStatus('');
  };

  const formatSessionTime = (session) => {
    if (!session.startTime) return "Not started yet";
    
    const start = new Date(session.startTime);
    const options = { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    
    return start.toLocaleDateString('en-US', options);
  };

  const bookAppointmentWithDoctor = async (doctorId) => {
    navigate(`/book-appointment?doctorId=${doctorId}`);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Generate a random transaction ID for display purposes
  const generateTransactionId = () => {
    return 'TXN_' + Math.random().toString(36).substr(2, 9).toUpperCase();
  };

  return (
    <div className="flex flex-col items-center min-h-screen w-full bg-gray-900 p-4">
      <Navbar />
      {/* Top Navigation Bar */}
      <div className="w-full flex justify-between items-center mb-8 bg-gray-800 p-4 rounded-lg">
        <button 
          onClick={() => navigate('/Main-page')}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
        >
          Back To Main Page
        </button>
        <h1 className="text-2xl font-bold text-white">My Appointments</h1>
        <button
          onClick={() => navigate('/book-appointment')}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition"
        >
          Book New Appointment
        </button>
      </div>
  
      {/* Main Content */}
      <div className="w-full max-w-6xl">
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
  
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : showFeedback ? (
          <motion.div
            className="bg-white rounded-lg shadow-lg p-6 w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-semibold mb-4 text-purple-800 text-center">
              {showRecommendations ? 'Doctor Recommendations' : 'Session Feedback'}
            </h2>
            
            {!showRecommendations ? (
              <div className="space-y-4">
                <div className="flex flex-col items-center space-y-2">
                  <p className="text-lg font-medium">Rate your experience (1-5):</p>
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        className={`text-2xl ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Please share your feedback about the session"
                  rows="4"
                  className="w-full p-3 border border-gray-300 rounded-md shadow-sm"
                />
                {feedbackStatus && (
                  <p className={`text-center ${feedbackStatus.includes('Thank you') ? 'text-green-600' : 'text-red-500'}`}>
                    {feedbackStatus}
                  </p>
                )}
                <div className="flex space-x-4">
                  <button
                    onClick={handleFeedbackSubmit}
                    className="flex-1 p-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                  >
                    Submit Feedback
                  </button>
                  <button
                    onClick={handleSkipFeedback}
                    className="flex-1 p-3 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                  >
                    Skip
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <p className="text-center text-lg">Based on your recent appointment, you might want to get a second opinion from these specialists:</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recommendedDoctors.map(doctor => (
                    <div key={doctor._id} className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                      <h3 className="text-xl font-medium text-purple-700">{doctor.fullName}</h3>
                      <p className="text-gray-600">{doctor.yearexp} years experience</p>
                      <p className="text-gray-700 mt-1">Specializations: {doctor.specification.join(', ')}</p>
                      <p className="text-gray-700">Rating: {doctor.rating} ★</p>
                      <p className="text-gray-700 mt-2">Hospitals: {doctor.hospitals.join(', ')}</p>
                      <button
                        onClick={() => bookAppointmentWithDoctor(doctor._id)}
                        className="mt-3 w-full p-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                      >
                        Book Appointment
                      </button>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-center mt-4">
                  <button
                    onClick={() => {
                      setShowRecommendations(false);
                      setShowFeedback(false);
                      setEndedSession(null);
                    }}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    View All Appointments
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          <>
            {sessions.length === 0 ? (
              <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                <h2 className="text-2xl font-semibold mb-4 text-gray-700">No Appointments Found</h2>
                <p className="text-gray-600 mb-6">You don't have any scheduled appointments at the moment.</p>
                <button
                  onClick={() => navigate('/book-appointment')}
                  className="px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                >
                  Book Your First Appointment
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sessions.map(session => (
                  <motion.div
                    key={session._id}
                    className="bg-white rounded-lg shadow-lg p-5 border-l-4 border-purple-500"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-semibold text-gray-800">
                        Dr. {session.doctor.fullName}
                      </h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        session.status === 'Active' ? 'bg-green-100 text-green-800' :
                        session.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        session.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {session.status}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-2">
                      <span className="font-medium">Appointment:</span> {formatSessionTime(session)}
                    </p>
                    
                    <p className="text-gray-600 mb-2">
                      <span className="font-medium">Type:</span> {session.type.charAt(0).toUpperCase() + session.type.slice(1)} Consultation
                    </p>
                    
                    <div className="bg-gray-50 p-3 rounded-md mb-3">
                      <p className="text-gray-700 text-sm">
                        <span className="font-medium">Issue:</span> {session.issueDetails}
                      </p>
                    </div>
                    
                    {session.status === 'Pending' && !activeSession && (
                      <button
                        onClick={() => initiatePayment(session)}
                        className="w-full mt-2 p-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        Pay & Join Session
                      </button>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
  
      {/* Payment Modal with Static QR Code */}
      {showPaymentModal && selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <motion.div 
            className="bg-white rounded-lg shadow-xl w-full max-w-md p-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-center mb-4">
              <h2 className="text-2xl font-bold text-purple-800">Complete Payment</h2>
              <p className="text-gray-600 mt-2">
                Please scan the QR code to pay for your appointment with Dr. {selectedSession.doctor.fullName}
              </p>
            </div>
  
            <div className="flex flex-col items-center bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-lg">
              {/* Attractive QR Code with branded overlay */}
              <div className="relative mb-6 p-2 bg-white rounded-lg shadow-lg">
                <img 
                  src="https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=upi://pay?pa=healthcareclinic@icici&pn=HealthcareClinic&am=500&cu=INR&tn=AppointmentFee" 
                  alt="Payment QR Code" 
                  className="w-64 h-64 object-contain"
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-30">
                  <div className="w-16 h-16 rounded-full bg-purple-600 flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">HC</span>
                  </div>
                </div>
              </div>
  
              <div className="w-full space-y-4">
                <div className="bg-white p-4 rounded-md border border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Amount</span>
                    <span className="text-lg font-semibold text-gray-800">{formatCurrency(paymentAmount)}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-gray-500">Transaction ID</span>
                    <span className="text-sm text-gray-700">{generateTransactionId()}</span>
                  </div>
                </div>
                
                <div className="text-center text-sm text-gray-500">
                  <p>You can also pay using any UPI app or internet banking</p>
                  <div className="flex justify-center space-x-4 mt-2">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/UPI-Logo-vector.svg/1200px-UPI-Logo-vector.svg.png" alt="UPI" className="h-6" />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Paytm_Logo_%28standalone%29.svg/2560px-Paytm_Logo_%28standalone%29.svg.png" alt="Paytm" className="h-6" />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Google_Pay_Logo.svg/2560px-Google_Pay_Logo.svg.png" alt="GPay" className="h-6" />
                  </div>
                </div>
  
                <div className="flex space-x-4 w-full pt-4">
                  <button
                    onClick={cancelPayment}
                    className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition font-medium border border-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePaymentComplete}
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-md hover:from-purple-700 hover:to-blue-700 transition font-medium shadow-md"
                  >
                    I've Paid
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
  
      {/* Session Modal */}
      {showModal && activeSession && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl h-[90vh] flex flex-col">
            <div className="p-4 bg-purple-700 text-white rounded-t-lg flex justify-between items-center">
              <h2 className="text-xl font-semibold">
                Session with Dr. {activeSession.doctor?.fullName}
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
              
              {/* Controls Area */}
              <div className="w-full md:w-64 p-4 bg-gray-50 overflow-y-auto">
                <div className="mb-4">
                  <h3 className="text-lg font-medium mb-2 text-gray-800">Session Notes</h3>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes about your consultation..."
                    rows="5"
                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm text-sm"
                  />
                  <button
                    onClick={handleAddNotes}
                    className="w-full mt-2 p-2 bg-blue-600 text-white rounded-md text-sm"
                  >
                    Save Notes
                  </button>
                  {noteStatus && (
                    <p className={`text-sm mt-1 ${noteStatus.includes('successfully') ? 'text-green-600' : 'text-red-500'}`}>
                      {noteStatus}
                    </p>
                  )}
                </div>
                
                <div className="mb-4 pt-4 border-t border-gray-200">
                  <h3 className="text-lg font-medium mb-2 text-gray-800">Upload Test Report</h3>
                  <label className="w-full flex flex-col items-center px-4 py-6 bg-white rounded-md shadow-sm border border-gray-300 cursor-pointer hover:bg-gray-50">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                    </svg>
                    <span className="mt-2 text-sm text-gray-600">
                      {testReport ? testReport : "Select a file"}
                    </span>
                    <input 
                      type="file" 
                      className="hidden" 
                      onChange={handleTestReportUpload}
                      accept=".pdf,.jpg,.jpeg,.png"
                    />
                  </label>
  
                  {testReportStatus && (
                    <p className={`text-sm mt-1 ${testReportStatus.includes('successfully') ? 'text-green-600' : 'text-red-500'}`}>
                      {testReportStatus}
                    </p>
                  )}
  
                  <div className="mt-4">
                  <button 
                    onClick={handleSendMedicalSummary}
                    className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm transition duration-150"
                  >
                    Send Medical Summary to Doctor
                  </button>
                  {summaryStatus && (
                    <p className={`text-sm mt-1 ${summaryStatus.includes('successfully') ? 'text-green-600' : 'text-red-500'}`}>
                      {summaryStatus}
                    </p>
                  )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserTelemedicine;