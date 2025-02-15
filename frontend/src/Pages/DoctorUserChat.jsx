import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

const DoctorPatientChat = ({ doctorId, patientId }) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [chatId, setChatId] = useState(null);
  const messagesEndRef = useRef(null);
  const accessToken = sessionStorage.getItem("accessToken");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChat = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/api/chat/${doctorId}/${patientId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        setChatId(response.data.chatId);
        setMessages(response.data.messages);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching chat:", error);
        setLoading(false);
      }
    };

    if (accessToken) {
      fetchChat();
    } else {
      setLoading(false);
      alert("You must be logged in to access chat.");
    }
  }, [doctorId, patientId, accessToken]);

  // Polling for new messages every 1 second
  useEffect(() => {
    let interval;
    if (chatId) {
      interval = setInterval(async () => {
        try {
          const response = await axios.get(
            `http://localhost:8000/api/chat/messages/${chatId}`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );
          setMessages(response.data.messages);
        } catch (error) {
          console.error("Error fetching messages:", error);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [chatId, accessToken]);

  // Scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !chatId) return;

    try {
      await axios.post(
        `http://localhost:8000/api/chat/send`,
        {
          chatId,
          message: message.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-blue-950 to-black text-white p-6">
      <div className="max-w-3xl mx-auto my-10 p-6 bg-gradient-to-br from-indigo-800 to-purple-600 rounded-lg shadow-lg">
        <div className="text-center mb-4">
          <h2 className="text-3xl font-bold">Doctor-Patient Chat</h2>
        </div>

        {/* Chat Window */}
        <div className="bg-gray-900 rounded-lg p-4">
          {loading ? (
            <p className="text-center">Loading...</p>
          ) : (
            <>
              <div className="bg-gray-800 rounded-lg h-96 overflow-auto p-4 mb-4">
                {messages?.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex w-full mb-2 ${
                      msg.sender === doctorId ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`p-3 max-w-[70%] rounded-xl shadow-md ${
                        msg.sender === doctorId
                          ? "bg-green-500 text-white rounded-br-none"
                          : "bg-gray-200 text-black rounded-bl-none"
                      }`}
                    >
                      <p className="text-xs font-medium mb-0.5 text-opacity-80">
                        {msg.sender === doctorId ? "Doctor" : "Patient"}
                      </p>
                      <p className="text-sm">{msg.message}</p>
                      <p className="text-[11px] text-opacity-80 text-right mt-0.5">
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <form onSubmit={sendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 p-3 rounded-lg bg-gray-700 text-white"
                />
                <button
                  type="submit"
                  className="p-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Send
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorPatientChat;