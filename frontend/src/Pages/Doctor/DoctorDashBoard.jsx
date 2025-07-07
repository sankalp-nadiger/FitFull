import React, { useState, useEffect } from 'react';
import { FaHome, FaUserMd, FaUser, FaSignOutAlt, FaMapMarkerAlt, FaEnvelope, FaPhone, FaEdit, FaSave, FaTimes, FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [doctorDetails, setDoctorDetails] = useState(null);
  const [newSpecialization, setNewSpecialization] = useState("");
  const [newCertification, setNewCertification] = useState("");

  useEffect(() => {
    const fetchDoctorProfile = async () => {
      try {
        const accessToken = sessionStorage.getItem("accessToken");

        if (!accessToken) {
          console.error("No access token found");
          return;
        }

        const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}/api/doctors/current`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          const filteredData = { ...data.data };

          // Remove unwanted fields
          ["id", "createdAt", "updatedAt", "_v", "refreshToken", "lastLoginDate", "avatar"].forEach(
            (field) => delete filteredData[field]
          );

          setDoctorDetails(filteredData);
        } else {
          console.error("Failed to fetch doctor profile");
        }
      } catch (error) {
        console.error("Error fetching doctor profile:", error);
      }
    };

    fetchDoctorProfile();
  }, []);

  const handleEdit = (field, value) => {
    setDoctorDetails((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddSpecialization = () => {
    if (newSpecialization.trim() === "") return;
    setDoctorDetails((prev) => ({
      ...prev,
      specializations: [...(prev.specializations || []), newSpecialization],
    }));
    setNewSpecialization("");
  };

  const handleAddCertification = () => {
    if (newCertification.trim() === "") return;
    setDoctorDetails((prev) => ({
      ...prev,
      certifications: [...(prev.certifications || []), newCertification],
    }));
    setNewCertification("");
  };

  const handleSaveProfile = async () => {
    if (!doctorDetails) return;

    const accessToken = sessionStorage.getItem("accessToken");

    if (!accessToken) {
      alert("Authentication required.");
      return;
    }

    const formData = new FormData();
    formData.append("fullName", doctorDetails.fullName || "Dr. Girish");
    formData.append("email", doctorDetails.email || "girish@email.com");
    formData.append("phone", doctorDetails.phone || "+999999999");
    formData.append("location", doctorDetails.location || "Mysore, Karnataka");
    formData.append("specialization", doctorDetails.specialization || "Cardiologist");
    formData.append("experience", doctorDetails.experience || "15+ years");
    formData.append("education", JSON.stringify(doctorDetails.education || []));
    formData.append("specializations", JSON.stringify(doctorDetails.specializations || []));
    formData.append("certifications", JSON.stringify(doctorDetails.certifications || []));
    formData.append("aboutMe", doctorDetails.aboutMe || "");

    try {
      const response = await fetch("http://localhost:8000/api/doctors/update", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      });

      if (response.ok) {
        alert("Profile updated successfully");
        setIsEditing(false);
      } else {
        alert("Failed to update profile. Please try again.");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("There was an error while updating the profile.");
    }
  };

  // Default doctor data if not loaded from API
  const defaultDoctorData = {
    fullName: "Dr. Girish",
    email: "girish@email.com",
    phone: "+999999999",
    location: "Mysore, Karnataka",
    specialization: "Cardiologist",
    experience: "15+ years",
    aboutMe: "Experienced cardiologist with over 15 years of practice in diagnosing and treating cardiovascular conditions. Specialized in interventional cardiology and preventive cardiac care. Committed to providing comprehensive patient care and staying updated with the latest medical advancements.",
    education: [
      { degree: "MD in Cardiology", institution: "Harvard Medical School", year: "2005-2009" },
      { degree: "MBBS", institution: "Johns Hopkins University", year: "2000-2005" }
    ],
    specializations: ["Interventional Cardiology", "Preventive Cardiac Care", "Cardiovascular Surgery"],
    certifications: ["Board Certified Cardiologist", "Advanced Cardiac Life Support", "Interventional Cardiology Fellowship"]
  };

  const currentData = doctorDetails || defaultDoctorData;

  return (
    <div className="min-h-screen bg-stone-100 flex">
      {/* Sidebar */}
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
          <h2 className="text-2xl font-bold text-stone-800 mb-1">{currentData.fullName}</h2>
          <p className="text-sm text-stone-600 bg-green-200 px-3 py-1 rounded-full inline-block">{currentData.specialization}</p>
        </div>
        
        <div className="space-y-3 w-full">
          <button className="flex items-center w-full rounded-xl px-4 py-3 text-left hover:bg-green-200 transition-all duration-200 group border border-transparent hover:border-green-300 hover:shadow-md" onClick={() => navigate('/')}>
            <FaHome className="mr-3 text-stone-700 group-hover:text-stone-800" />
            <span className='text-stone-700 font-semibold group-hover:text-stone-800'>Home</span>
          </button>
          <button className="flex items-center w-full px-4 rounded-xl py-3 text-left hover:bg-green-200 transition-all duration-200 group border border-transparent hover:border-green-300 hover:shadow-md" onClick={() => navigate('/appointments')}>
            <FaUserMd className="mr-3 text-stone-700 group-hover:text-stone-800" />
            <span className='text-stone-700 font-semibold group-hover:text-stone-800'>Appointments</span>
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
      <div className="w-3/4 p-8 space-y-6">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-stone-800 mb-2">Doctor Dashboard</h1>
            <div className="w-16 h-1 bg-gradient-to-r from-orange-400 to-orange-300 rounded-full"></div>
          </div>
          <div className="flex space-x-3">
            {isEditing ? (
              <>
                <button
                  onClick={handleSaveProfile}
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg flex items-center transition transform hover:scale-105 shadow-lg"
                >
                  <FaSave className="mr-2" />
                  Save Profile
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg flex items-center transition transform hover:scale-105 shadow-lg"
                >
                  <FaTimes className="mr-2" />
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg flex items-center transition transform hover:scale-105 shadow-lg"
              >
                <FaEdit className="mr-2" />
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* About Me */}
        <div className="bg-white shadow-lg rounded-2xl p-8 border border-stone-200 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center mb-6">
            <div className="w-1 h-8 bg-gradient-to-b from-green-400 to-green-500 rounded-full mr-4"></div>
            <h2 className="text-2xl font-bold text-stone-800">About Me</h2>
          </div>
          {isEditing ? (
            <textarea
              value={currentData.aboutMe}
              onChange={(e) => handleEdit("aboutMe", e.target.value)}
              className="w-full p-4 border border-stone-300 rounded-lg text-stone-600 leading-relaxed text-lg resize-none"
              rows="4"
            />
          ) : (
            <p className="text-stone-600 leading-relaxed text-lg">
              {currentData.aboutMe}
            </p>
          )}
        </div>

        {/* Education */}
        <div className="bg-white shadow-lg rounded-2xl p-8 border border-stone-200 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center mb-6">
            <div className="w-1 h-8 bg-gradient-to-b from-orange-400 to-orange-500 rounded-full mr-4"></div>
            <h2 className="text-2xl font-bold text-stone-800">Education</h2>
          </div>
          <div className="space-y-6">
            {currentData.education.map((edu, index) => (
              <div key={index} className="bg-gradient-to-r from-orange-50 to-orange-25 p-6 rounded-xl border-l-4 border-orange-400">
                {isEditing ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={edu.degree}
                      onChange={(e) => {
                        const newEducation = [...currentData.education];
                        newEducation[index].degree = e.target.value;
                        handleEdit("education", newEducation);
                      }}
                      className="w-full p-2 border border-stone-300 rounded font-bold text-lg text-stone-800"
                    />
                    <input
                      type="text"
                      value={`${edu.institution} | ${edu.year}`}
                      onChange={(e) => {
                        const [institution, year] = e.target.value.split(" | ");
                        const newEducation = [...currentData.education];
                        newEducation[index].institution = institution;
                        newEducation[index].year = year;
                        handleEdit("education", newEducation);
                      }}
                      className="w-full p-2 border border-stone-300 rounded text-stone-600"
                    />
                  </div>
                ) : (
                  <>
                    <p className="font-bold text-lg text-stone-800 mb-2">{edu.degree}</p>
                    <p className="text-stone-600">{edu.institution} | {edu.year}</p>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Specializations */}
        <div className="bg-white shadow-lg rounded-2xl p-8 border border-stone-200 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center mb-6">
            <div className="w-1 h-8 bg-gradient-to-b from-blue-400 to-blue-500 rounded-full mr-4"></div>
            <h2 className="text-2xl font-bold text-stone-800">Specializations</h2>
          </div>
          <div className="flex flex-wrap gap-3 mb-4">
            {currentData.specializations?.map((spec, index) => (
              <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {spec}
              </span>
            ))}
          </div>
          {isEditing && (
            <div className="flex gap-2 mt-4">
              <input
                type="text"
                value={newSpecialization}
                onChange={(e) => setNewSpecialization(e.target.value)}
                className="flex-1 p-2 border border-stone-300 rounded"
                placeholder="Add new specialization"
              />
              <button
                onClick={handleAddSpecialization}
                className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition"
              >
                <FaPlus />
              </button>
            </div>
          )}
        </div>

        {/* Experience */}
        <div className="bg-white shadow-lg rounded-2xl p-8 border border-stone-200 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center mb-6">
            <div className="w-1 h-8 bg-gradient-to-b from-stone-400 to-stone-500 rounded-full mr-4"></div>
            <h2 className="text-2xl font-bold text-stone-800">Experience</h2>
          </div>
          <div className="bg-gradient-to-r from-stone-50 to-stone-25 p-6 rounded-xl border-l-4 border-stone-400">
            <p className="font-bold text-lg text-stone-800 mb-2">Senior Cardiologist</p>
            <p className="text-stone-600">Central Hospital | 2015-Present</p>
            {isEditing ? (
              <input
                type="text"
                value={currentData.experience}
                onChange={(e) => handleEdit("experience", e.target.value)}
                className="w-full p-2 border border-stone-300 rounded mt-2"
                placeholder="Years of experience"
              />
            ) : (
              <p className="text-stone-600 mt-2">{currentData.experience} of experience</p>
            )}
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white shadow-lg rounded-2xl p-8 border border-stone-200 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center mb-6">
            <div className="w-1 h-8 bg-gradient-to-b from-orange-400 to-orange-500 rounded-full mr-4"></div>
            <h2 className="text-2xl font-bold text-stone-800">Contact Information</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center p-4 bg-gradient-to-r from-green-50 to-green-25 rounded-xl hover:from-green-100 hover:to-green-50 transition-colors duration-200">
              <div className="w-10 h-10 bg-green-400 rounded-full flex items-center justify-center mr-4">
                <FaEnvelope className="text-white text-sm" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-stone-500 uppercase tracking-wider">Email</p>
                {isEditing ? (
                  <input
                    type="email"
                    value={currentData.email}
                    onChange={(e) => handleEdit("email", e.target.value)}
                    className="w-full p-1 border border-stone-300 rounded text-stone-700 font-semibold"
                  />
                ) : (
                  <p className="text-stone-700 font-semibold">{currentData.email}</p>
                )}
              </div>
            </div>
            <div className="flex items-center p-4 bg-gradient-to-r from-orange-50 to-orange-25 rounded-xl hover:from-orange-100 hover:to-orange-50 transition-colors duration-200">
              <div className="w-10 h-10 bg-orange-400 rounded-full flex items-center justify-center mr-4">
                <FaPhone className="text-white text-sm" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-stone-500 uppercase tracking-wider">Phone</p>
                {isEditing ? (
                  <input
                    type="tel"
                    value={currentData.phone}
                    onChange={(e) => handleEdit("phone", e.target.value)}
                    className="w-full p-1 border border-stone-300 rounded text-stone-700 font-semibold"
                  />
                ) : (
                  <p className="text-stone-700 font-semibold">{currentData.phone}</p>
                )}
              </div>
            </div>
            <div className="flex items-center p-4 bg-gradient-to-r from-stone-50 to-stone-25 rounded-xl hover:from-stone-100 hover:to-stone-50 transition-colors duration-200">
              <div className="w-10 h-10 bg-stone-400 rounded-full flex items-center justify-center mr-4">
                <FaMapMarkerAlt className="text-white text-sm" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-stone-500 uppercase tracking-wider">Location</p>
                {isEditing ? (
                  <input
                    type="text"
                    value={currentData.location}
                    onChange={(e) => handleEdit("location", e.target.value)}
                    className="w-full p-1 border border-stone-300 rounded text-stone-700 font-semibold"
                  />
                ) : (
                  <p className="text-stone-700 font-semibold">{currentData.location}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Certifications */}
        <div className="bg-white shadow-lg rounded-2xl p-8 border border-stone-200 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center mb-6">
            <div className="w-1 h-8 bg-gradient-to-b from-purple-400 to-purple-500 rounded-full mr-4"></div>
            <h2 className="text-2xl font-bold text-stone-800">Certifications</h2>
          </div>
          <div className="flex flex-wrap gap-3 mb-4">
            {currentData.certifications?.map((cert, index) => (
              <span key={index} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                {cert}
              </span>
            ))}
          </div>
          {isEditing && (
            <div className="flex gap-2 mt-4">
              <input
                type="text"
                value={newCertification}
                onChange={(e) => setNewCertification(e.target.value)}
                className="flex-1 p-2 border border-stone-300 rounded"
                placeholder="Add new certification"
              />
              <button
                onClick={handleAddCertification}
                className="bg-purple-500 text-white p-2 rounded hover:bg-purple-600 transition"
              >
                <FaPlus />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;