import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { TextField, Card, CardContent, Button, Dialog, DialogTitle, DialogContent } from "@mui/material";
import { motion } from "framer-motion";
import Navbar from "../Navbar";

const doctors = [
  { id: 1, name: "Dr. Alice Johnson", specialty: "Cardiologist", image: "https://via.placeholder.com/150" },
  { id: 2, name: "Dr. Brian Smith", specialty: "Dermatologist", image: "https://via.placeholder.com/150" },
  { id: 3, name: "Dr. Clara Wilson", specialty: "Psychologist", image: "https://via.placeholder.com/150" },
];

export default function UserTelemedicine() {
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState("");
  const [openDialog, setOpenDialog] = useState(false);

  const handleBookAppointment = () => {
    if (selectedDoctor && date && time) {
      setOpenDialog(true);
    }
  };

  return (<>
 
    <Navbar/>
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold mb-6">Telemedicine Booking</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {doctors.map((doctor) => (
          <motion.div key={doctor.id} whileHover={{ scale: 1.05 }}>
            <Card
              sx={{
                cursor: "pointer",
                border: selectedDoctor?.id === doctor.id ? "2px solid blue" : "",
              }}
              onClick={() => setSelectedDoctor(doctor)}
            >
              <CardContent className="flex flex-col items-center">
                <img src={doctor.image} alt={doctor.name} className="rounded-xl w-full h-40 object-cover mb-4" />
                <h2 className="text-xl font-semibold">{doctor.name}</h2>
                <p className="text-gray-500">{doctor.specialty}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {selectedDoctor && (
        <div className="mt-6 bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Select Date & Time</h2>
          <div className="flex gap-6">
            <DatePicker selected={date} onChange={(date) => setDate(date)} className="border p-2 rounded-md" />
            <TextField label="Select Time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          </div>
          <Button variant="contained" className="mt-4" onClick={handleBookAppointment}>
            Book Appointment
          </Button>
        </div>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Appointment Confirmed</DialogTitle>
        <DialogContent>
          <p>
            Appointment booked with {selectedDoctor?.name} on {date?.toLocaleDateString()} at {time}
          </p>
        </DialogContent>
      </Dialog>
    </div>
 </>
  );
}
