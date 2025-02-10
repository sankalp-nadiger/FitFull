import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Onboarding = () => {
  const navigate = useNavigate();
  const [responses, setResponses] = useState({
    symptoms: [],
    chronicIllnesses: [],
    allergies: "",
    stressLevel: "",
    exerciseFrequency: "",
    diet: "",
    smokingAlcohol: "",
    medications: "",
    hospitalized: "",
    familyHistory: [],
  });
  const [recommendedDoctors, setRecommendedDoctors] = useState([]);

  const symptomsList = [
    "Frequent Headaches / Migraines",
    "Joint / Muscle Pain",
    "Anxiety / Depression",
    "Chest Pain / Palpitations",
    "Breathing Issues / Asthma",
    "Skin Rashes / Itching",
    "Stomach Pain / Indigestion",
    "Fever / Infections",
  ];

  const doctorMapping = {
    "Frequent Headaches / Migraines": "Neurologist",
    "Joint / Muscle Pain": "Orthopedic / Physiotherapist",
    "Anxiety / Depression": "Psychiatrist / Psychologist",
    "Chest Pain / Palpitations": "Cardiologist",
    "Breathing Issues / Asthma": "Pulmonologist",
    "Skin Rashes / Itching": "Dermatologist",
    "Stomach Pain / Indigestion": "Gastroenterologist",
    "Fever / Infections": "General Physician",
    Diabetes: "Endocrinologist",
    Hypertension: "Cardiologist",
    "Thyroid Disorder": "Endocrinologist",
  };

  const handleCheckboxChange = (category, value) => {
    setResponses((prev) => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter((item) => item !== value)
        : [...prev[category], value],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    let doctors = new Set();
    responses.symptoms.forEach((symptom) => {
      if (doctorMapping[symptom]) doctors.add(doctorMapping[symptom]);
    });
    responses.chronicIllnesses.forEach((illness) => {
      if (doctorMapping[illness]) doctors.add(doctorMapping[illness]);
    });
    
    setRecommendedDoctors(Array.from(doctors));
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold mb-4">Health Questionnaire</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-md p-6 bg-gray-800 rounded-md">
        <h2 className="text-lg font-semibold">Select your symptoms:</h2>
        {symptomsList.map((symptom) => (
          <label key={symptom} className="block mt-2">
            <input
              type="checkbox"
              checked={responses.symptoms.includes(symptom)}
              onChange={() => handleCheckboxChange("symptoms", symptom)}
              className="mr-2"
            />
            {symptom}
          </label>
        ))}

        <button type="submit" className="mt-4 px-4 py-2 bg-green-500 text-white rounded-md">
          Get Recommendations
        </button>
      </form>

      {recommendedDoctors.length > 0 && (
        <div className="mt-6 p-4 bg-gray-700 rounded-md w-full max-w-md">
          <h2 className="text-xl font-semibold">Recommended Doctors:</h2>
          <ul className="mt-2">
            {recommendedDoctors.map((doctor, index) => (
              <li key={index} className="mt-1 text-yellow-400">✔ {doctor}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Onboarding;
