import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const OnboardingPhase = () => {
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

  const chronicIllnessesList = ["Diabetes", "Hypertension", "Thyroid Disorder", "Asthma"];

  const familyHistoryList = ["Heart Disease", "Cancer", "Diabetes", "Hypertension", "Mental Illness"];

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
    Asthma: "Pulmonologist",
    "Heart Disease": "Cardiologist",
    Cancer: "Oncologist",
    "Mental Illness": "Psychiatrist",
  };

  const handleCheckboxChange = (category, value) => {
    setResponses((prev) => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter((item) => item !== value)
        : [...prev[category], value],
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setResponses((prev) => ({
      ...prev,
      [name]: value,
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
    responses.familyHistory.forEach((history) => {
      if (doctorMapping[history]) doctors.add(doctorMapping[history]);
    });

    setRecommendedDoctors(Array.from(doctors));
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold mb-4">Health Questionnaire</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-md p-6 bg-gray-800 rounded-md">
        
        {/* Symptoms */}
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

        {/* Chronic Illnesses */}
        <h2 className="text-lg font-semibold mt-4">Do you have any chronic illnesses?</h2>
        {chronicIllnessesList.map((illness) => (
          <label key={illness} className="block mt-2">
            <input
              type="checkbox"
              checked={responses.chronicIllnesses.includes(illness)}
              onChange={() => handleCheckboxChange("chronicIllnesses", illness)}
              className="mr-2"
            />
            {illness}
          </label>
        ))}

        {/* Allergies */}
        <h2 className="text-lg font-semibold mt-4">Do you have any allergies?</h2>
        <input
          type="text"
          name="allergies"
          value={responses.allergies}
          onChange={handleChange}
          className="w-full p-2 mt-2 rounded-md text-black"
          placeholder="Enter allergies..."
        />

        {/* Medications */}
        <h2 className="text-lg font-semibold mt-4">Are you taking any medications?</h2>
        <input
          type="text"
          name="medications"
          value={responses.medications}
          onChange={handleChange}
          className="w-full p-2 mt-2 rounded-md text-black"
          placeholder="List medications..."
        />

        {/* Hospitalization */}
        <h2 className="text-lg font-semibold mt-4">Have you been hospitalized before?</h2>
        <select
          name="hospitalized"
          value={responses.hospitalized}
          onChange={handleChange}
          className="w-full p-2 mt-2 rounded-md text-black"
        >
          <option value="">Select</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>

        {/* Family History */}
        <h2 className="text-lg font-semibold mt-4">Family Medical History:</h2>
        {familyHistoryList.map((condition) => (
          <label key={condition} className="block mt-2">
            <input
              type="checkbox"
              checked={responses.familyHistory.includes(condition)}
              onChange={() => handleCheckboxChange("familyHistory", condition)}
              className="mr-2"
            />
            {condition}
          </label>
        ))}

        <button type="submit" className="mt-4 px-4 py-2 bg-green-500 text-white rounded-md">
         Save
        </button>
      </form>
      {
      <>{recommendedDoctors.length > 0 && (
        <div className="mt-6 p-4 bg-gray-700 rounded-md w-full max-w-md">
          <h2 className="text-xl font-semibold">Recommended Doctors:</h2>
          <ul className="mt-2">
            {recommendedDoctors.map((doctor, index) => (
              <li key={index} className="mt-1 text-yellow-400">✔ {doctor}</li>
            ))}
          </ul>
          <button>
        <Link to="/main-page" className="mt-4 px-4 py-2 bg-green-500 text-white rounded-md">
          Continue
        </Link>
    </button>
        </div>
      )
      }
    </>
      } 
    </div>
  );
};

export default OnboardingPhase;