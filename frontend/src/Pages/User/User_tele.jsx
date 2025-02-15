import { useState, useEffect } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  TextField,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import { motion } from "framer-motion";
import Navbar from "../Navbar";

export default function UserTelemedicine({ userId }) {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeSession, setActiveSession] = useState(null);

  // ✅ Fetch doctors list from backend
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/doctor");
        setDoctors(response.data);
      } catch (error) {
        console.error("Error fetching doctors:", error);
        setError("Failed to load doctors. Please try again later.");
      }
    };
    fetchDoctors();
  }, []);

  // ✅ Polling every 5 seconds to check if the doctor has accepted the session
  useEffect(() => {
    if (!userId) return;

    let interval;

    const fetchActiveSession = async () => {
      try {
        const { data } = await axios.get("http://localhost:8000/api/user/active", {
          headers: { Authorization: `Bearer ${sessionStorage.getItem("accessToken")}` },
        });

        console.log("Polling Response:", data); // Debugging API Response

        if (data.session) {
          setActiveSession(data.session);

          // ✅ Stop polling when jitsiLink is available
          if (data.session.jitsiLink) {
            console.log("Jitsi Link Found:", data.session.jitsiLink);
            clearInterval(interval);
          }
        }
      } catch (error) {
        console.error("Error fetching active session:", error);
      }
    };

    fetchActiveSession(); // Initial Call
    interval = setInterval(fetchActiveSession, 5000); // Poll every 5 seconds

    return () => clearInterval(interval); // Cleanup when component unmounts
  }, [userId]);

  // ✅ Manually fetch active session
  const checkSessionManually = async () => {
    try {
      const { data } = await axios.get("http://localhost:8000/api/user/active", {
        headers: { Authorization: `Bearer ${sessionStorage.getItem("accessToken")}` },
      });

      console.log("Manual Check Response:", data);

      if (data.session) {
        setActiveSession(data.session);
      }
    } catch (error) {
      console.error("Error fetching session manually:", error);
    }
  };

  // ✅ Handle appointment booking
  const handleBookAppointment = async () => {
    if (!selectedDoctor || !date || !time) {
      setError("Please select a doctor, date, and time.");
      return;
    }

    const accessToken = sessionStorage.getItem("accessToken");
    if (!accessToken) {
      setError("You must be logged in to book an appointment.");
      return;
    }

    const appointmentDetails = {
      issueDetails: "General consultation",
      appointmentTime: `${date.toISOString().split("T")[0]} ${time}`,
      doctorEmail: selectedDoctor.email,
    };

    try {
      setLoading(true);
      const response = await axios.post(
        "http://localhost:8000/api/doctor/request",
        appointmentDetails,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      console.log("Appointment booked:", response.data);

      if (response.data.sessionId) {
        setActiveSession({ sessionId: response.data.sessionId, jitsiLink: "" });
      }

      setOpenDialog(true);
    } catch (error) {
      console.error("Error booking appointment:", error);
      setError(error.response?.data?.message || "Failed to book appointment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
        <h1 className="text-3xl font-bold mb-6">Telemedicine Booking</h1>

        {error && <p className="text-red-500">{error}</p>}

        {/* Show Doctors List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doctor) => (
            <motion.div key={doctor._id} whileHover={{ scale: 1.05 }}>
              <Card
                sx={{
                  cursor: "pointer",
                  border: selectedDoctor?._id === doctor._id ? "2px solid blue" : "",
                }}
                onClick={() => setSelectedDoctor(doctor)}
              >
                <CardContent className="flex flex-col items-center">
                  <img
                    src={doctor.image || "https://via.placeholder.com/150"}
                    alt={doctor.fullName}
                    className="rounded-xl w-full h-40 object-cover mb-4"
                  />
                  <h2 className="text-xl font-semibold">{doctor.fullName}</h2>
                  <p className="text-gray-500">{doctor.specification?.join(", ")}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Show Date & Time Picker when doctor is selected */}
        {selectedDoctor && (
          <div className="mt-6 bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">Select Date & Time</h2>
            <div className="flex gap-6">
              <DatePicker
                selected={date}
                onChange={(date) => setDate(date)}
                className="border p-2 rounded-md"
              />
              <TextField label="Select Time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
            <Button variant="contained" className="mt-4" onClick={handleBookAppointment} disabled={loading}>
              {loading ? "Booking..." : "Book Appointment"}
            </Button>
          </div>
        )}

        {/* Appointment Confirmation Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <DialogTitle>Appointment Confirmed</DialogTitle>
          <DialogContent>
            <p>
              Appointment booked with {selectedDoctor?.fullName} on {date?.toLocaleDateString()} at {time}
            </p>
          </DialogContent>
        </Dialog>

        {/* Show Jitsi Meet when session is accepted */}
        {activeSession?.jitsiLink ? (
          <div className="mt-6 bg-white p-6 rounded-lg shadow-lg w-full">
            <h2 className="text-2xl font-semibold mb-4">Live Consultation</h2>
            <iframe
              src={activeSession.jitsiLink}
              width="100%"
              height="500px"
              allow="camera; microphone; fullscreen"
            ></iframe>
          </div>
        ) : (
          <Button variant="outlined" className="mt-4" onClick={checkSessionManually}>
            Check for Active Session
          </Button>
        )}
      </div>
    </>
  );
}
