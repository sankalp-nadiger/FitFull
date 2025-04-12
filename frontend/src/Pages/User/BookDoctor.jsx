import React, { useState, useEffect } from 'react';
import { Search, Clock, Hospital, User, Calendar, FileText } from 'lucide-react';
import axios from 'axios';
import Navbar from '../Navbar';
import { Star, Mail, Briefcase, CalendarDays } from 'lucide-react';
function BookApp() {
  const [doctors, setDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [showBooking, setShowBooking] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [issueDetails, setIssueDetails] = useState('');

  // Fetch doctors from backend
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BASE_API_URL}/api/doctor/`);
        setDoctors(response.data);
        console.log('Doctors fetched:', response.data);
      } catch (error) {
        console.error('Error fetching doctors:', error);
        // Fallback to local doctors if API fails
        setDoctors([
          {
            id: 1,
            name: "Dr. Sarah Wilson",
            specialization: "Cardiologist",
            email: "sarah.wilson@example.com",
            image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop&q=60",
            experience: "15 years",
            rating: 4.8
          }
        ]);
      }
    };

    fetchDoctors();
  }, []);

  const specializations = [...new Set(doctors.map(doctor => doctor.specification))];

  const filteredDoctors = doctors?.filter(doctor => {
    const matchesSearch = doctor.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.specification.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialization = !selectedSpecialization || doctor.specification === selectedSpecialization;
    return matchesSearch && matchesSpecialization;
  });

  const handleBookAppointment = async () => {
    if (!selectedDoctor || !selectedDate || !selectedTime) {
      alert('Please select a doctor, date, and time');
      return;
    }
  console.log('Booking appointment with details:', {
      doctorId: selectedDoctor._id,
      date: selectedDate,
      time: selectedTime,
      issueDetails: issueDetails || 'No details provided'
    });
    try {
      await axios.post(
        `${import.meta.env.VITE_BASE_API_URL}/api/doctor/book`,
        {
          doctorId: selectedDoctor._id,
          date: selectedDate,
          time: selectedTime,
          issueDetails: issueDetails || 'No details provided'
        },
        {
          withCredentials: true
        }
      );      
      alert('Appointment booked successfully!');
      setShowBooking(false);
      // Reset form values after successful booking
      setSelectedDate('');
      setSelectedTime('');
      setIssueDetails('');
    } catch (error) {
      console.error('Booking error:', error);
      console.log('Current cookies:', document.cookie);
      alert('Failed to book appointment');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />
      
      <div className="max-w-6xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-8">Find Your Doctor</h1>
        
        <div className="flex gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search doctors by name or specialization..."
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-800 border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="px-4 py-2 rounded-lg bg-gray-800 border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedSpecialization}
            onChange={(e) => setSelectedSpecialization(e.target.value)}
          >
            <option value="" className="bg-gray-900">All Specializations</option>
            {specializations.map(spec => (
              <option key={spec} value={spec} className="bg-gray-900">{spec}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {filteredDoctors.map(doctor => {
    // Create consistent seed from doctor's info
    const seed = doctor.id || doctor.email || doctor.name || "doctor" + Math.random().toString(36).substring(2, 8);
    
    // Professional male avatar parameters
    const avatarParams = new URLSearchParams({
      seed: seed,
      backgroundColor: "b6e3f4,87CEEB,4682B4",
      backgroundType: "gradientLinear",
      clothing: "suit",
      clothingColor: "2c3e50,34495e",
      hair: "short,combover,buzz",
      hairColor: "2c3e50,000000",
      facialHair: "beardLight,beardMedium",
      facialHairProbability: "50",
      eyes: "default",
      mouth: "smile,smirk",
      accessories: "glasses,glassesProbability50",
      accessoriesColor: "565656",
      flip: "true"
    });

    const avatarUrl = `https://api.dicebear.com/7.x/personas/svg?${avatarParams.toString()}`;
    
    const fallbackAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=Dr${doctor.name?.charAt(0) || "D"}&fontFamily=Helvetica&fontWeight=600&backgroundColor=4682B4&color=ffffff`;

    return (
      <div key={doctor.id} className="bg-gray-800 rounded-xl shadow-lg overflow-hidden transform transition hover:scale-[1.02]">
        <div className="w-full h-52 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
          <img
            src={avatarUrl}
            alt={`Dr. ${doctor.fullName}`}
            className="h-44 w-44 rounded-full object-cover border-[3px] border-white shadow-lg"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = fallbackAvatar;
            }}
          />
        </div>
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-bold mb-1">Dr. {doctor.fullName}</h3>
              <p className="text-blue-400 mb-2">{doctor.specification.join(", ")}</p>
            </div>
            <div className="flex items-center bg-blue-900/30 px-2 py-1 rounded-lg">
              <Star className="h-4 w-4 text-yellow-400 mr-1" />
              <span className="font-medium">{doctor.rating}</span>
            </div>
          </div>
          
          <div className="space-y-2 mt-3">
            <div className="flex items-center text-gray-300 text-sm">
              <Mail className="h-4 w-4 mr-2" />
              <span className="truncate">{doctor.email}</span>
            </div>
            <div className="flex items-center text-gray-300 text-sm">
              <Briefcase className="h-4 w-4 mr-2" />
              <span>{doctor.yearexp} experience</span>
            </div>
          </div>

          <button
            className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-all flex items-center justify-center"
            onClick={() => {
              setSelectedDoctor(doctor);
              setShowBooking(true);
            }}
          >
            <CalendarDays className="h-5 w-5 mr-2" />
            Book Appointment
          </button>
        </div>
      </div>
    );
  })}
</div>
      </div>

      {showBooking && selectedDoctor && (
  <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
    <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full overflow-y-auto max-h-[90vh] my-4">
      <h2 className="text-2xl font-bold mb-4">Book Appointment with {selectedDoctor.fullName || selectedDoctor.name}</h2>
      
      <div className="mb-4">
        <label className="block text-gray-300 mb-2 flex items-center">
          <Calendar className="mr-2 text-blue-400" /> Select Date
        </label>
        <input
          type="date"
          className="w-full px-4 py-2 rounded-lg bg-gray-900 border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          min={new Date().toISOString().split('T')[0]}
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-gray-300 mb-2 flex items-center">
          <Clock className="mr-2 text-blue-400" /> Select Time
        </label>
        <div className="grid grid-cols-3 gap-2">
          {['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'].map(time => (
            <button
              key={time}
              className={`flex items-center justify-center px-4 py-2 rounded-lg transition ${
                selectedTime === time 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-900 text-gray-300 hover:bg-gray-700'
              }`}
              onClick={() => setSelectedTime(time)}
            >
              <Clock className="w-4 h-4 mr-2" />
              {time}
            </button>
          ))}
        </div>
      </div>
      
      <div className="mb-6">
        <label className="block text-gray-300 mb-2 flex items-center">
          <FileText className="mr-2 text-blue-400" /> Issue Details
        </label>
        <textarea
          className="w-full px-4 py-2 rounded-lg bg-gray-900 border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Briefly describe your issue or reason for appointment"
          rows="3"
          value={issueDetails}
          onChange={(e) => setIssueDetails(e.target.value)}
        />
      </div>
      
      <div className="flex justify-end space-x-4">
        <button
          className="px-4 py-2 text-gray-400 hover:text-white"
          onClick={() => setShowBooking(false)}
        >
          Cancel
        </button>
        <button
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          onClick={handleBookAppointment}
        >
          Confirm Booking
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}

export default BookApp;