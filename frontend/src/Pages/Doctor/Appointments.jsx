import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaHome, FaUserMd, FaUser, FaSignOutAlt } from "react-icons/fa";

const PendingConsultations = () => {
  const navigate = useNavigate();
  const [consultations, setConsultations] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch pending consultations every 5 seconds
  useEffect(() => {
    const fetchConsultations = async () => {
      try {
        const { data } = await axios.get(
          "http://localhost:8000/api/doctor/pending-consultations",
          {
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`
            }
          }
        );

        console.log("Fetched consultations:", data);
        setConsultations(data.consultations);
      } catch (error) {
        console.error("Error fetching consultations:", error);
        setError("Failed to load consultations");
      }
    };

    fetchConsultations();
    const interval = setInterval(fetchConsultations, 5000);

    return () => clearInterval(interval);
  }, []);

  // Accept a consultation session
  const acceptSession = async (sessionId) => {
    if (!sessionId) {
      console.error("Error: sessionId is undefined!");
      setError("Session ID is missing.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      console.log("Accepting session with ID:", sessionId);

      // Accept the session (no Jitsi link in the request)
      const acceptResponse = await axios.post(
        "http://localhost:8000/api/doctor/accept",
        { sessionId },
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`
          }
        }
      );

      console.log("Session accepted response:", acceptResponse.data);
      if (!acceptResponse.data.success) {
        throw new Error(acceptResponse.data.message || "Failed to accept session");
      }

      // Join the session
      const joinResponse = await axios.post(
        "http://localhost:8000/api/doctor/join-session",
        { sessionId },
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`
          }
        }
      );

      console.log("Session joined response:", joinResponse.data);
      if (!joinResponse.data.success) {
        throw new Error(joinResponse.data.message || "Failed to join session");
      }

      // Set active session for Jitsi Meet
      setActiveSessionId(sessionId);

      // Update UI
      setConsultations((prevConsultations) =>
        prevConsultations.map((consultation) =>
          consultation._id === sessionId || consultation.id === sessionId
            ? { ...consultation, status: "Ongoing", doctorJoined: true }
            : consultation
        )
      );
    } catch (error) {
      console.error("Error with session:", error.response?.data || error.message);
      setError(error.response?.data?.message || error.message || "Failed to process session");
    } finally {
      setLoading(false);
    }
  };

  // Generate Jitsi room name
  const getRoomName = () => (activeSessionId ? `consultation_${activeSessionId}` : null);

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-1/4 bg-white text-blue p-6 flex flex-col items-center">
        <div className="mb-6">
          <img src="/doctor.jpg" alt="Doctor Avatar" className="w-40 h-50 mb-4" />
          <h2 className="text-xl font-semibold">Dr. John Smith</h2>
          <p className="text-sm text-blue-600">Cardiologist</p>
        </div>
        <div className="space-y-4 w-full">
          <button className="flex items-center w-full rounded-xl px-4 py-2 text-left hover:bg-sky-100" onClick={() => navigate("/")}>
            <FaHome className="mr-3 text-blue-800" /> <span className="text-blue-800 font-bold">Home</span>
          </button>
          <button className="flex items-center w-full px-4 rounded-xl py-2 text-left hover:bg-sky-100" onClick={() => navigate("/appointments")}>
            <FaUserMd className="mr-3 text-blue-800" /> <span className="text-blue-800 font-bold">Appointments</span>
          </button>
          <button className="flex items-center w-full px-4 py-2 rounded-xl text-left hover:bg-sky-100" onClick={() => navigate("/details")}>
            <FaUser className="mr-3 text-blue-800" /> <span className="text-blue-800 font-bold">Patients</span>
          </button>
          <button className="flex items-center w-full px-4 py-2 rounded-xl text-left hover:bg-sky-100">
            <FaSignOutAlt className="mr-3 text-blue-800" /> <span className="text-blue-800 font-bold">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white p-6 rounded-xl shadow-md mb-6 w-3/4">
        <h3 className="text-lg font-semibold mb-4">Pending Consultations</h3>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {consultations.length === 0 ? (
            <p className="text-gray-500">No pending consultations</p>
          ) : (
            consultations.map((consultation, index) => {
              console.log(`Consultation ${index}:`, consultation); // Debugging log
              
              // Use _id if available, fallback to id if not
              const sessionId = consultation._id || consultation.id;

              return (
                <div key={sessionId || index} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <h4 className="font-medium">{consultation.name}</h4>
                    <p className="text-sm text-gray-500">{consultation.time}</p>
                  </div>
                  <div className="flex justify-center">
                    {sessionId ? (
                      <button
                        className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
                        onClick={() => acceptSession(sessionId)}
                        disabled={loading}
                      >
                        {loading ? "Processing..." : "Accept"}
                      </button>
                    ) : (
                      <p className="text-red-500">Error: Missing session ID</p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Show Jitsi Meet iframe if an active session is available */}
        {getRoomName() && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">Live Consultation</h3>
            <iframe
              src={`https://meet.jit.si/${getRoomName()}`}
              width="100%"
              height="500px"
              allow="camera; microphone; fullscreen; display-capture"
              allowFullScreen
              className="border rounded-lg"
            ></iframe>
          </div>
        )}
      </div>
    </div>
  );
};

export default PendingConsultations;