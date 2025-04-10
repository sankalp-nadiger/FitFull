import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Clock, RefreshCw, Trash2, ArrowLeft, Hospital } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UserAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [rescheduleAppointment, setRescheduleAppointment] = useState(null);
  const [selectedNewDate, setSelectedNewDate] = useState('');
  const [selectedNewTime, setSelectedNewTime] = useState('');
  const navigate = useNavigate();

  // Fetch user appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/user/appointments');
        setAppointments(response.data);
      } catch (error) {
        console.error('Error fetching appointments:', error);
        // Fallback mock data
        setAppointments([
          {
            id: 1,
            doctorName: "Dr. Sarah Wilson",
            specialization: "Cardiologist",
            date: "2024-06-15",
            time: "14:00",
            doctorImage: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop&q=60"
          },
          {
            id: 2,
            doctorName: "Dr. James Chen",
            specialization: "Neurologist", 
            date: "2024-06-20",
            time: "10:00",
            doctorImage: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&auto=format&fit=crop&q=60"
          }
        ]);
      }
    };

    fetchAppointments();
  }, []);

  // Handle rescheduling appointment
  const handleReschedule = async () => {
    if (!selectedNewDate || !selectedNewTime) {
      alert('Please select both a new date and time');
      return;
    }

    try {
      await axios.put(`http://localhost:8000/api/appointments/${rescheduleAppointment?.id}/reschedule`, {
        date: selectedNewDate,
        time: selectedNewTime
      });

      // Update local state
      setAppointments(appointments.map(app => 
        app.id === rescheduleAppointment?.id 
          ? {...app, date: selectedNewDate, time: selectedNewTime} 
          : app
      ));

      // Reset rescheduling state
      setRescheduleAppointment(null);
      setSelectedNewDate('');
      setSelectedNewTime('');

      alert('Appointment rescheduled successfully!');
    } catch (error) {
      console.error('Rescheduling error:', error);
      alert('Failed to reschedule appointment');
    }
  };

  // Handle appointment cancellation
  const handleCancelAppointment = async (appointmentId) => {
    try {
      await axios.delete(`http://localhost:8000/api/appointments/${appointmentId}`);
      
      // Remove appointment from local state
      setAppointments(appointments.filter(app => app.id !== appointmentId));
      
      alert('Appointment cancelled successfully!');
    } catch (error) {
      console.error('Cancellation error:', error);
      alert('Failed to cancel appointment');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Navbar */}
      <nav className="bg-gray-800 p-4 shadow-lg flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Hospital className="w-8 h-8 text-blue-500" />
          <h1 className="text-xl font-bold">MediConnect</h1>
        </div>
        <button 
          onClick={() => navigate('/')}
          className="flex items-center text-white hover:text-blue-400 transition"
        >
          <ArrowLeft className="mr-2" /> Back to Doctors
        </button>
      </nav>

      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-8">My Appointments</h1>

        {appointments.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            <p className="text-xl">You have no upcoming appointments</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {appointments.map((appointment) => (
              <div 
                key={appointment.id} 
                className="bg-gray-800 rounded-lg p-6 flex items-center justify-between hover:bg-gray-700 transition"
              >
                <div className="flex items-center space-x-6">
                  <img 
                    src={appointment.doctorImage} 
                    alt={appointment.doctorName}
                    className="w-24 h-24 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="text-xl font-semibold">{appointment.doctorName}</h3>
                    <p className="text-blue-400">{appointment.specialization}</p>
                    <div className="flex items-center space-x-4 mt-2 text-gray-300">
                      <div className="flex items-center">
                        <Calendar className="w-5 h-5 mr-2 text-blue-500" />
                        {appointment.date}
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-5 h-5 mr-2 text-blue-500" />
                        {appointment.time}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-4">
                  <button 
                    onClick={() => setRescheduleAppointment(appointment)}
                    className="text-blue-400 hover:text-blue-300 flex items-center"
                  >
                    <RefreshCw className="mr-2" /> Reschedule
                  </button>
                  <button 
                    onClick={() => handleCancelAppointment(appointment.id)}
                    className="text-red-400 hover:text-red-300 flex items-center"
                  >
                    <Trash2 className="mr-2" /> Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rescheduling Modal */}
      {rescheduleAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center">
          <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-6">Reschedule Appointment</h2>
            <p className="text-gray-400 mb-4">
              Rescheduling appointment with {rescheduleAppointment.doctorName}
            </p>
            
            <div className="mb-4">
              <label className="block text-gray-300 mb-2">New Date</label>
              <input
                type="date"
                className="w-full px-4 py-2 rounded-lg bg-gray-900 border-gray-700 text-white"
                min={new Date().toISOString().split('T')[0]}
                value={selectedNewDate}
                onChange={(e) => setSelectedNewDate(e.target.value)}
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-300 mb-2">New Time</label>
              <div className="grid grid-cols-3 gap-2">
                {['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'].map(time => (
                  <button
                    key={time}
                    className={`px-4 py-2 rounded-lg transition ${
                      selectedNewTime === time 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-900 text-gray-300 hover:bg-gray-700'
                    }`}
                    onClick={() => setSelectedNewTime(time)}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setRescheduleAppointment(null)}
                className="px-4 py-2 text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleReschedule}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Confirm Reschedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserAppointments;