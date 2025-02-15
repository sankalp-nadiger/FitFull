// controllers/healthQuestionnaireController.js
import { User } from "../models/User.js";
import { Doctor } from "../models/Doctor.js";

const healthQuestionnaireController = {
  // Save health questionnaire data
  saveQuestionnaire: async (req, res) => {
    try {
      const userId = req.user._id; // Assuming you have authentication middleware
      const {
        symptoms,
        chronicIllnesses,
        allergies,
        stressLevel,
        exerciseFrequency,
        diet,
        smokingAlcohol,
        medications,
        hospitalized,
        familyHistory
      } = req.body;

      // Find user and update their onboarding data
      const user = await User.findById(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Update onboarding data
      user.onboardingData = {
        symptoms,
        chronicIllnesses,
        allergies,
        stressLevel,
        exerciseFrequency,
        diet,
        smokingAlcohol,
        medications,
        hospitalized,
        familyHistory
      };

      // Generate recommended doctors based on symptoms, chronic illnesses, and family history
      const doctorMapping = {
        "Frequent Headaches / Migraines": "Neurologist",
        "Joint / Muscle Pain": "Orthopedic / Physiotherapist",
        "Anxiety / Depression": "Psychiatrist / Psychologist",
        "Chest Pain / Palpitations": "Cardiologist",
        "Breathing Issues / Asthma": "Pulmonologist",
        "Skin Rashes / Itching": "Dermatologist",
        "Stomach Pain / Indigestion": "Gastroenterologist",
        "Fever / Infections": "General Physician",
        "Diabetes": "Endocrinologist",
        "Hypertension": "Cardiologist",
        "Thyroid Disorder": "Endocrinologist",
        "Asthma": "Pulmonologist",
        "Heart Disease": "Cardiologist",
        "Cancer": "Oncologist",
        "Mental Illness": "Psychiatrist"
      };

      const doctors = new Set();
      
      symptoms.forEach(symptom => {
        if (doctorMapping[symptom]) doctors.add(doctorMapping[symptom]);
      });
      
      chronicIllnesses.forEach(illness => {
        if (doctorMapping[illness]) doctors.add(doctorMapping[illness]);
      });
      
      familyHistory.forEach(condition => {
        if (doctorMapping[condition]) doctors.add(doctorMapping[condition]);
      });

      const recommendedDoctors = Array.from(doctors);
      user.recommendedDoctors = recommendedDoctors;

      await user.save();

      // Find actual doctor documents based on specializations
      const actualDoctors = await Doctor.find({
        specification: { $in: recommendedDoctors }
      }).select('fullName specification about hospitals rating');

      res.status(200).json({
        message: 'Health questionnaire saved successfully',
        recommendedDoctors,
        doctors: actualDoctors
      });
    } catch (error) {
      console.error('Error saving questionnaire:', error);
      res.status(500).json({ 
        success: false,
        message: 'Server error', 
        error: error.message 
      });
    }
  },

  // Get health questionnaire data
  getQuestionnaire: async (req, res) => {
    try {
      const userId = req.user._id;
      
      const user = await User.findById(userId)
        .select('onboardingData recommendedDoctors');
      
      if (!user) {
        return res.status(404).json({ 
          success: false,
          message: 'User not found' 
        });
      }

      // Find actual doctor documents based on specializations
      const doctors = await Doctor.find({
        specification: { $in: user.recommendedDoctors }
      }).select('fullName specification about hospitals rating');

      res.status(200).json({
        success: true,
        onboardingData: user.onboardingData,
        recommendedDoctors: user.recommendedDoctors,
        doctors
      });
    } catch (error) {
      console.error('Error fetching questionnaire:', error);
      res.status(500).json({ 
        success: false,
        message: 'Server error', 
        error: error.message 
      });
    }
  }
};

export default healthQuestionnaireController;