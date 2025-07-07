import React, { useState, useRef } from "react";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import DoctorLogIn from "./DoctorSignIn2";

const DoctorLogUp = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [yearExp, setYearExp] = useState("");
  const [specifications, setSpecifications] = useState([]);
  const [specInput, setSpecInput] = useState("");
  const [certificateImage, setCertificateImage] = useState([]);
  const [profilePic, setProfilePic] = useState(null);
  const [isSignIn, setIsSignIn] = useState(false);

  const profileInputRef = useRef(null);
  const certsInputRef = useRef(null);

  const handleAddSpec = () => {
    if (specInput.trim()) {
      setSpecifications([...specifications, specInput.trim()]);
      setSpecInput("");
    }
  };

  const handleRemoveSpec = (i) => {
    setSpecifications(specifications.filter((_, index) => index !== i));
  };

  const handleFileChange = (e) => {
    setCertificateImage([...certificateImage, ...Array.from(e.target.files)]);
  };

  const handleRemoveCertificate = (index) => {
    setCertificateImage(certificateImage.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!fullName || !email || !password || !phoneNumber || !yearExp) {
      toast.error("All fields are required!");
      return;
    }

    const formData = new FormData();
    formData.append("fullName", fullName);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("mobileNumber", phoneNumber);
    formData.append("yearExp", yearExp);
    formData.append("specifications", JSON.stringify(specifications));
    if (profilePic) formData.append("profilePic", profilePic);
    certificateImage.forEach(file => formData.append("certificateImage", file));

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BASE_API_URL}/api/doctor/register-doctor`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      if (res.status === 201) {
        toast.success("Registered Successfully!");
        setTimeout(() => navigate("/doctor-dashboard"), 2000);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration Failed");
    }
  };

  if (isSignIn) return <DoctorLogIn />;

  return (
    <div className="min-h-screen flex items-center justify-center relative px-4 py-8">
      {/* Background Image with Opacity */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/bg_sign.webp')",
          opacity: 0.3
        }}
      ></div>
      
      {/* Background Gradient Overlay */}
      <div className="absolute inset-0 bg-white opacity-70"></div>
      
      {/* Content */}
      <div className="w-full max-w-md relative z-10">
        <div className="bg-[#fff9e9] rounded-lg shadow-xl overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-[#638473] to-[#c17754]">
            <div className="flex justify-center mb-4">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setProfilePic(e.target.files[0])}
                ref={profileInputRef}
                className="hidden"
              />
              <div
                onClick={() => profileInputRef.current.click()}
                className="cursor-pointer group relative"
              >
                {profilePic ? (
                  <img
                    src={URL.createObjectURL(profilePic)}
                    className="w-20 h-20 rounded-full bg-white p-1 object-cover"
                    alt="profile"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-white/30 flex items-center justify-center text-white text-xl">
                    +
                  </div>
                )}
              </div>
            </div>
            <h2 className="text-2xl font-bold text-center text-[#fff9e9]">Doctor Sign Up</h2>
          </div>

          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                { id: "fullName", label: "Full Name", type: "text", val: fullName, setVal: setFullName },
                { id: "email", label: "Email", type: "email", val: email, setVal: setEmail },
                { id: "phoneNumber", label: "Phone Number", type: "tel", val: phoneNumber, setVal: setPhoneNumber },
                { id: "yearExp", label: "Years of Experience", type: "number", val: yearExp, setVal: setYearExp },
              ].map((field) => (
                <div key={field.id}>
                  <label className="text-[#403c39] font-medium block mb-1" htmlFor={field.id}>{field.label}</label>
                  <input
                    id={field.id}
                    type={field.type}
                    className="w-full px-4 py-2 bg-[#fff9e9] border border-[#638473] rounded-lg focus:ring-2 focus:ring-[#638473]"
                    value={field.val}
                    onChange={(e) => field.setVal(e.target.value)}
                    required
                  />
                </div>
              ))}

              {/* Password Field */}
              <div>
                <label className="text-[#403c39] font-medium block mb-1" htmlFor="password">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    className="w-full px-4 py-2 bg-[#fff9e9] border border-[#638473] rounded-lg focus:ring-2 focus:ring-[#638473]"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2 text-sm text-[#638473]"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {/* Specialization Field */}
              <div>
                <label className="text-[#403c39] font-medium block mb-1">Specialization</label>
                <div className="flex">
                  <input
                    type="text"
                    value={specInput}
                    onChange={(e) => setSpecInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSpec())}
                    className="flex-1 px-4 py-2 bg-[#fff9e9] border border-[#638473] rounded-l-lg focus:ring-2 focus:ring-[#638473]"
                    placeholder="Add specialization"
                  />
                  <button
                    type="button"
                    onClick={handleAddSpec}
                    className="px-4 bg-[#638473] text-white rounded-r-lg"
                  >
                    +
                  </button>
                </div>
                <div className="flex flex-wrap mt-2 gap-2">
                  {specifications.map((spec, idx) => (
                    <span
                      key={idx}
                      className="bg-[#ffd8b7] text-[#403c39] px-3 py-1 rounded-full text-sm flex items-center"
                    >
                      {spec}
                      <button
                        type="button"
                        onClick={() => handleRemoveSpec(idx)}
                        className="ml-2 text-[#c17754]"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Certifications Upload */}
              <div>
                <label className="text-[#403c39] font-medium block mb-1">Certifications</label>
                <div
                  onClick={() => certsInputRef.current.click()}
                  className="cursor-pointer p-4 bg-[#fff9e9] border-2 border-dashed border-[#638473] rounded-lg text-center hover:bg-[#ffd8b7] transition"
                >
                  <p className="text-[#403c39]">Click or drag to upload certificates</p>
                </div>
                <input
                  type="file"
                  ref={certsInputRef}
                  className="hidden"
                  multiple
                  onChange={handleFileChange}
                />
                <ul className="mt-2 text-sm text-[#403c39] space-y-1">
                  {certificateImage.map((file, idx) => (
                    <li key={idx} className="flex justify-between">
                      {file.name}
                      <button onClick={() => handleRemoveCertificate(idx)} type="button" className="text-red-500">
                        remove
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-[#638473] hover:bg-[#403c39] text-white font-semibold py-3 rounded-lg transition"
              >
                Register
              </button>
            </form>

            <button
              onClick={() => navigate("/up-loading")}
              className="w-full mt-4 bg-[#c17754] hover:bg-[#a65e3f] text-white font-semibold py-3 rounded-lg transition flex items-center justify-center"
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032 s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2 C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
              </svg>
              Sign Up with Google
            </button>

            <div className="mt-4 text-center text-[#403c39]">
              Already have an account?{" "}
              <span
                className="text-[#c17754] hover:underline cursor-pointer"
                onClick={() => setIsSignIn(true)}
              >
                Sign in here
              </span>
            </div>
          </div>
        </div>
        <ToastContainer />
      </div>
    </div>
  );
};

export default DoctorLogUp;