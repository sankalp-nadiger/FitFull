import { useEffect, useState } from "react";
import { Dialog, DialogTitle } from "@headlessui/react";
import axios from "axios";
import FamilyReportsSection from "./FamilyDashboard"

const User_reports = () => {
  // Tabs state for both sections
  const [userActiveTab, setUserActiveTab] = useState("tests");
  const [familyActiveTab, setFamilyActiveTab] = useState("tests");
  // AI Insights related states
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [aiInsights, setAiInsights] = useState(null);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [currentReport, setCurrentReport] = useState(null);
  const [ocrText, setOcrText] = useState("");
  const [aiSummary, setAiSummary] = useState("");
  
  // Save the API key in state for proper usage throughout component
  const [geminiApiKey, setGeminiApiKey] = useState(import.meta.env.VITE_GEMINI_API_KEY);
  const [apiKeyConfigured, setApiKeyConfigured] = useState(true); // Assume key is valid by default

  // Add these helper functions to your component
  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
  };

  const speakReportInLanguage = (languageCode) => {
    setShowLanguageModal(false);
    setSpeaking(true);
    
    // Stop any ongoing speech
    window.speechSynthesis.cancel();
    
    // Format the report text in a more conversational way
    const textToSpeak = `
      Here is your ${currentReport.testName} test report from ${new Date(currentReport.date).toLocaleDateString()}.
      The results show ${currentReport.result}.
      This test was ordered by ${currentReport.doctorName || 'your doctor'}.
    `;
    
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = languageCode;
    utterance.rate = 0.9; // Slightly slower for better comprehension
    
    utterance.onend = () => {
      setSpeaking(false);
    };
    
    utterance.onerror = () => {
      console.error("Speech synthesis error");
      setSpeaking(false);
    };
    
    // Wait for voices to load if needed
    const voices = window.speechSynthesis.getVoices();
    
    if (voices.length > 0) {
      // Try to find a matching voice
      const matchingVoices = voices.filter(v => v.lang.startsWith(languageCode.split('-')[0]));
      
      // If multiple voices are available, prefer female voices for medical info
      const voice = matchingVoices.find(v => v.name.toLowerCase().includes('female')) || 
                    matchingVoices[0];
      
      if (voice) {
        utterance.voice = voice;
      }
      window.speechSynthesis.speak(utterance);
    } else {
      // If voices aren't loaded yet, wait for them
      window.speechSynthesis.onvoiceschanged = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        const matchingVoices = availableVoices.filter(v => 
          v.lang.startsWith(languageCode.split('-')[0])
        );
        
        const voice = matchingVoices.find(v => v.name.toLowerCase().includes('female')) || 
                      matchingVoices[0];
        
        if (voice) {
          utterance.voice = voice;
        }
        
        window.speechSynthesis.speak(utterance);
      };
    }
  };

  // FIXED: Improved AI insights function with better error handling
  const handleViewAIInsights = async (report) => {
    setCurrentReport(report);
    setIsLoadingAI(true);
    setIsAIModalOpen(true);
    
    try {
      // First prepare the text to analyze
      let textToAnalyze = '';
      
      if (report.documentUrl) {
        try {
          textToAnalyze = await extractTextFromPDF(report.documentUrl);
        } catch (ocrError) {
          console.warn("OCR failed, falling back to basic data:", ocrError);
          textToAnalyze = `Test: ${report.testName}\nDate: ${report.date}\nResult: ${report.result}\nDoctor: ${report.doctorName}`;
        }
      } else {
        textToAnalyze = `Test: ${report.testName}\nDate: ${report.date}\nResult: ${report.result}\nDoctor: ${report.doctorName}`;
      }
      
      setOcrText(textToAnalyze);
      const insights = await generateAIInsights(textToAnalyze, report.testName);
      setAiInsights(insights);
      
    } catch (error) {
      console.error("Error generating insights:", error);
      setAiInsights(`Error: ${error.message}`);
    } finally {
      setIsLoadingAI(false);
    }
  };
  

  // FIXED: Improved OCR text extraction with better error handling
  const extractTextFromPDF = async (pdfUrl) => {
    try {
      const token = sessionStorage.getItem("accessToken");
      if (!token) {
        throw new Error("Authentication token not found. Please log in again.");
      }
      
      // Adding console log to debug
      console.log("Extracting text from document URL:", pdfUrl);
      
      // Call your backend OCR service
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_API_URL}/api/ocr/extract`,
        { documentUrl: pdfUrl },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          timeout: 30000 // 30 seconds timeout for OCR processing
        }
      );
      
      console.log("OCR response:", response.data);
      
      if (!response.data.text || response.data.text.trim() === "") {
        return "No text could be extracted from this document. The document may be image-based or contain no readable text.";
      }
      
      return response.data.text;
    } catch (error) {
      console.error("Error extracting text from document:", error);
      
      // If the server endpoint is not available or not working, return a message
      if (error.code === 'ERR_NETWORK') {
        throw new Error("OCR service is currently unavailable. Using report data instead.");
      }
      
      if (error.response?.status === 401) {
        throw new Error("Session expired. Please log in again.");
      } else if (error.response?.status === 413) {
        throw new Error("Document too large to process.");
      } else if (error.code === 'ECONNABORTED') {
        throw new Error("Document processing timed out. Using report data instead.");
      }
      throw new Error(error.response?.data?.message || "Failed to extract text from document");
    }
  };

  // FIXED: Improved AI insights generation with direct Gemini API call
  const generateAIInsights = async (text, testName) => {
    try {
      // Validate input
      if (!text || text.trim() === "") {
        throw new Error("No report text provided for analysis");
      }
  
      // Use the latest Gemini API endpoint
      const apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
  
      // Construct a better prompt
      const prompt = `
      Analyze this medical test report and provide:
  
      1. Test Summary: Brief explanation of what ${testName || 'this test'} measures and if it is not medical report then respond by saying this is not a medical report.
  
      Report Details:
      ${text}
  
      Please use clear, simple language suitable for patients.
      `;
  
      const response = await axios.post(
        apiUrl,
        {
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.2,
            topP: 0.8,
            topK: 40
          }
        },
        {
          params: { key: geminiApiKey }, // Pass API key as query parameter
          headers: {
            "Content-Type": "application/json"
          },
          timeout: 15000
        }
      );
  
      // Handle response
      if (!response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error("Invalid response format from AI service");
      }
  
      return formatResponse(response.data.candidates[0].content.parts[0].text);
      
    } catch (error) {
      console.error("API Error:", error.response?.data || error.message);
      throw new Error(`AI service error: ${error.response?.data?.error?.message || error.message}`);
    }
  };
  
  // Helper function to format the response
  const formatResponse = (text) => {
    return text
      .replace(/\n\n/g, '<br><br>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>');
  };
  
  // FIXED: Improved AI summary generation for speech
  const generateAISummary = async () => {
    if (!ocrText) {
      setAiSummary("No text available to summarize.");
      return;
    }
    
    setIsLoadingAI(true);
    try {
      console.log("Generating AI summary for speech");
      
      // Create a more concise version for speech
      const response = await axios.post(
        "https://generativelanguage.googleapis.com/v1/models/gemini-1.5:generateContent",
        {
          contents: [
            {
              parts: [
                {
                  text: `Create a brief, simple summary of this medical test report. Make it conversational, short (max 3 paragraphs), and easy to understand when read aloud:\n\n${ocrText}`
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 300,
            topP: 0.8,
            topK: 40
          }
        },
        {
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": geminiApiKey
          }
        }
      );
      
      // Extract and clean up the summary
      const summary = response.data.candidates[0].content.parts[0].text;
      
      // Remove markdown formatting for cleaner speech
      const cleanSummary = summary
        .replace(/\*\*/g, '')
        .replace(/\*/g, '')
        .replace(/#/g, '')
        .replace(/\n\n/g, ' ')
        .replace(/\n/g, ' ');
        
      setAiSummary(cleanSummary);
      
      // Speak the summary
      const utterance = new SpeechSynthesisUtterance(cleanSummary);
      utterance.lang = 'en-US';
      utterance.rate = 0.9; // Slightly slower for medical information
      
      // Get voices and try to find a clear one
      const voices = window.speechSynthesis.getVoices();
      
      if (voices.length > 0) {
        // Prefer a female voice for medical info as they tend to be clearer
        const preferredVoice = voices.find(v => 
          v.lang === 'en-US' && v.name.includes('Female')
        ) || voices.find(v => v.lang === 'en-US');
        
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }
      }
      
      window.speechSynthesis.speak(utterance);
      setSpeaking(true);
      
      utterance.onend = () => {
        setSpeaking(false);
      };
      
      utterance.onerror = () => {
        console.error("Speech synthesis error");
        setSpeaking(false);
      };
      
    } catch (error) {
      console.error("Error generating AI summary:", error);
      setAiSummary("Failed to generate summary. " + (error.message || "Please try again."));
    } finally {
      setIsLoadingAI(false);
    }
  };
  
  // Modal states
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isFamilyModalOpen, setIsFamilyModalOpen] = useState(false);
  
  // Form data states
  const [reportFormData, setReportFormData] = useState({});
  const [familyFormData, setFamilyFormData] = useState({ fullName: "" });
  const [familyEmails, setFamilyEmails] = useState(['']); // Array to hold multiple email inputs
  const [addingFamily, setAddingFamily] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [base64File, setBase64File] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState(null);
  
  // Filter states
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedFamilyMember, setSelectedFamilyMember] = useState("");
  const [isLoading, setIsLoading] = useState({
    tests: false,
    prescriptions: false,
    diagnoses: false
  });
  const [error, setError] = useState({
    tests: null,
    prescriptions: null,
    diagnoses: null
  });  
  
  // Reports data states
  const [userReports, setUserReports] = useState({
    testReports: [],
    prescriptions: [],
    diagnoses: []
  });
  const [familyReports, setFamilyReports] = useState({
    testReports: [],
    prescriptions: [],
    diagnoses: []
  });

  // Mock data for doctors and family members (replace with API data)
  const [doctors, setDoctors] = useState([
    { fullName: "Dr. John Doe", specialization: "Cardiology", email: "john.doe@hospital.com" },
    { fullName: "Dr. Jane Smith", specialization: "Neurology", email: "jane.smith@hospital.com" }
  ]);
  const [familyMembers, setFamilyMembers] = useState([]);
  useEffect(() => {
    const fetchTestReports = async () => {
      if (userActiveTab !== "tests") return;
      
      setIsLoading(prev => ({ ...prev, tests: true }));
      setError(prev => ({ ...prev, tests: null }));
  
      try {
        const token = sessionStorage.getItem("accessToken");
        const headers = { Authorization: `Bearer ${token}` };
        const response = await axios.get(
          `${endpointMap.tests}${selectedDoctor ? `?doctor=${selectedDoctor}` : ''}`,
          { headers }
        );
  
        setUserReports(prev => ({
          ...prev,
          testReports: Array.isArray(response.data) ? response.data.map(report => ({
            ...report,
            date: report.date, // Ensure date is included
            result: report.result,
            documentUrl: report.documentUrl
          })) : []
        }));
      } catch (error) {
        console.error("Error fetching test reports:", error);
        setError(prev => ({
          ...prev,
          tests: error.response?.data?.message || "Failed to fetch test reports"
        }));
      } finally {
        setIsLoading(prev => ({ ...prev, tests: false }));
      }
    };
  
    fetchTestReports();
  }, [userActiveTab, selectedDoctor]);
  
  // FIXED: Better API key handling
  useEffect(() => {
    // Check if API key is properly configured
    const checkApiKey = () => {
      // First try from environment variables
      const envKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (envKey && envKey !== "YOUR_GEMINI_API_KEY") {
        setGeminiApiKey(envKey);
        setApiKeyConfigured(true);
        console.log("Using Gemini API key from environment variables");
        return;
      }
      
      // Next try from local storage
      const savedKey = localStorage.getItem("gemini_api_key");
      if (savedKey) {
        setGeminiApiKey(savedKey);
        setApiKeyConfigured(true);
        console.log("Using Gemini API key from local storage");
        return;
      }
      
      // Finally, use the default key (which may or may not work)
      console.log("Using default Gemini API key");
    };
    
    checkApiKey();
  }, []);

  // Fetch Prescriptions
  useEffect(() => {
    const fetchPrescriptions = async () => {
      if (userActiveTab !== "prescriptions") return;
      
      setIsLoading(prev => ({ ...prev, prescriptions: true }));
      setError(prev => ({ ...prev, prescriptions: null }));
  
      try {
        const token = sessionStorage.getItem("accessToken");
        const headers = { Authorization: `Bearer ${token}` };
        const response = await axios.get(
          `${endpointMap.prescriptions}${selectedDoctor ? `?doctor=${selectedDoctor}` : ''}`,
          { headers }
        );
  
        setUserReports(prev => ({
          ...prev,
          prescriptions: Array.isArray(response.data) ? response.data.map(prescription => ({
            ...prescription,
            date: prescription.date,
            medication: prescription.medication,
            dosage: prescription.dosage,
            duration: prescription.duration,
            instructions: prescription.instructions,
            documentUrl: prescription.documentUrl
          })) : []
        }));
      } catch (error) {
        console.error("Error fetching prescriptions:", error);
        setError(prev => ({
          ...prev,
          prescriptions: error.response?.data?.message || "Failed to fetch prescriptions"
        }));
      } finally {
        setIsLoading(prev => ({ ...prev, prescriptions: false }));
      }
    };
  
    fetchPrescriptions();
  }, [userActiveTab, selectedDoctor]);
  
  // Fetch Diagnoses
  useEffect(() => {
    const fetchDiagnoses = async () => {
      if (userActiveTab !== "diagnoses") return;
      
      setIsLoading(prev => ({ ...prev, diagnoses: true }));
      setError(prev => ({ ...prev, diagnoses: null }));
  
      try {
        const token = sessionStorage.getItem("accessToken");
        const headers = { Authorization: `Bearer ${token}` };
        const response = await axios.get(
          `${endpointMap.diagnoses}${selectedDoctor ? `?doctor=${selectedDoctor}` : ''}`,
          { headers }
        );
  
        setUserReports(prev => ({
          ...prev,
          diagnoses: Array.isArray(response.data) ? response.data.map(diagnosis => ({
            ...diagnosis,
            date: diagnosis.date,
            diagnosis: diagnosis.diagnosis,
            symptoms: diagnosis.symptoms,
            notes: diagnosis.notes,
            followUpDate: diagnosis.followUpDate,
            documentUrl: diagnosis.documentUrl
          })) : []
        }));
      } catch (error) {
        console.error("Error fetching diagnoses:", error);
        setError(prev => ({
          ...prev,
          diagnoses: error.response?.data?.message || "Failed to fetch diagnoses"
        }));
      } finally {
        setIsLoading(prev => ({ ...prev, diagnoses: false }));
      }
    };
  
    fetchDiagnoses();
  }, [userActiveTab, selectedDoctor]);
  // Fetch family members
 
 // useEffect(() => {
  //   const fetchPrescriptions = async () => {
  //     try {
  //       const token = sessionStorage.getItem("accessToken");
  //       const headers = { Authorization: `Bearer ${token}` };
  //       const response = await axios.get(`${endpointMap.prescriptions}`, { headers });
  
  //       setUserReports(prev => ({
  //         ...prev,
  //         prescriptions: response.data // Ensure this isn't duplicating!
  //       }));
  //     } catch (error) {
  //       console.error("Error fetching prescriptions:", error);
  //     }
  //   };
  
  //   fetchPrescriptions();
  // }, []);
  // API endpoints
  const endpointMap = {
    tests: `${import.meta.env.VITE_BASE_API_URL}/api/users/test-reports`,
    prescriptions: `${import.meta.env.VITE_BASE_API_URL}/api/users/prescriptions`,
    diagnoses: `${import.meta.env.VITE_BASE_API_URL}/api/users/diagnoses`
  };

  // Fetch reports
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const token = sessionStorage.getItem("accessToken");
        const headers = { Authorization: `Bearer ${token}` };
        
        // Fetch user reports
        const [testReports, prescriptions, diagnoses] = await Promise.all([
          axios.get(`${endpointMap.tests}${selectedDoctor ? `?doctor=${selectedDoctor}` : ''}`, { headers }),
          axios.get(`${endpointMap.prescriptions}${selectedDoctor ? `?doctor=${selectedDoctor}` : ''}`, { headers }),
          axios.get(`${endpointMap.diagnoses}${selectedDoctor ? `?doctor=${selectedDoctor}` : ''}`, { headers })
        ]);

        setUserReports({
          testReports: testReports.data,
          prescriptions: prescriptions.data,
          diagnoses: diagnoses.data
        });

       
      } catch (error) {
        console.error("Error fetching reports:", error);
      }
    };
    
    fetchReports();
  }, [selectedDoctor]);

  // FIXED: Improved file handling for uploads
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    
    if (file) {
      setSelectedFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        // Store the base64 string correctly
        setBase64File(event.target.result);
        console.log("File converted to base64");
      };
      reader.readAsDataURL(file);
    } else {
      setBase64File(null);
      setSelectedFileName(null);
    }
  };

  // Handle adding a new report
  const handleReportSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = sessionStorage.getItem("accessToken");
      const headers = { 
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json" 
      };
  
      let endpoint;
      let requestBody;
  
      switch (userActiveTab) {
        case "tests":
          endpoint = "/addReport";
          requestBody = {
            testName: reportFormData.testName || "",
            result: reportFormData.result || "",
            doctorName: reportFormData.doctorName || ""
          };
          
          // Add the document if available
          if (base64File) {
            requestBody.documentBase64 = base64File;
            requestBody.fileName = selectedFileName;
            console.log("Including document in request");
          }
          break;
  
        case "prescriptions":
          endpoint = "/addPresc";
          requestBody = {
            doctorName: reportFormData.doctorName || "",
            medication: reportFormData.medication || "",
            dosage: reportFormData.dosage || ""
          };
          break;
  
        case "diagnoses":
          endpoint = "/addDiagnosis";
          requestBody = {
            doctorName: reportFormData.doctorName || "",
            condition: reportFormData.condition || "",
            notes: reportFormData.notes || "",
            date: reportFormData.date || ""
          };
          break;
  
        default:
          return;
      }
  
      // Update API call to use the base URL from environment
      const apiUrl = `${import.meta.env.VITE_BASE_API_URL}/api/users${endpoint}`;
      console.log("Sending request to:", apiUrl);
      
      const response = await axios.post(
        apiUrl,
        requestBody,
        { 
          headers,
          withCredentials: true // Important for cookies
        }
      );
  
      if (response.data.success) {
        console.log("Report added successfully");
        
        // Refresh the data
        setIsLoading(prev => ({ ...prev, [userActiveTab]: true }));
        setError(prev => ({ ...prev, [userActiveTab]: null }));
        
        try {
          // Fetch updated data
          const fetchEndpoint = endpointMap[userActiveTab];
          const doctorFilter = selectedDoctor ? `?doctor=${selectedDoctor}` : '';
          
          const updatedResponse = await axios.get(
            `${fetchEndpoint}${doctorFilter}`,
            { 
              headers: { Authorization: `Bearer ${token}` },
              withCredentials: true 
            }
          );
          
          // Update state with the fresh data
          setUserReports(prev => {
            const newState = { ...prev };
            
            if (userActiveTab === "tests") {
              newState.testReports = updatedResponse.data;
            } else if (userActiveTab === "prescriptions") {
              newState.prescriptions = updatedResponse.data;
            } else if (userActiveTab === "diagnoses") {
              newState.diagnoses = updatedResponse.data;
            }
            
            return newState;
          });
        } catch (fetchError) {
          console.error(`Error fetching updated ${userActiveTab}:`, fetchError);
          setError(prev => ({
            ...prev, 
            [userActiveTab]: fetchError.response?.data?.message || `Failed to refresh ${userActiveTab} data`
          }));
        } finally {
          setIsLoading(prev => ({ ...prev, [userActiveTab]: false }));
        }
        
        // Reset form and close modal
        setReportFormData({});
        setSelectedFile(null);
        setBase64File(null);
        setSelectedFileName(null);
        setIsReportModalOpen(false);
      }
    } catch (error) {
      console.error(`Error submitting ${userActiveTab} report:`, error);
      setError(prev => ({ 
        ...prev, 
        [userActiveTab]: error.response?.data?.message || `Failed to submit ${userActiveTab}`
      }));
    }
  };
  
  const reportModal = (
    <Dialog open={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="relative bg-white rounded-xl p-8 max-w-md w-full mx-4 shadow-lg">
          <button 
            onClick={() => {
              setIsReportModalOpen(false);
              setReportFormData({});
              setSelectedFile(null);
            }} 
            className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
          >
            ❌
          </button>
  
          <DialogTitle className="text-xl font-bold mb-6">
            Add New {userActiveTab === "tests" ? "Test Report" : userActiveTab === "prescriptions" ? "Prescription" : "Diagnosis"}
          </DialogTitle>
  
          <form onSubmit={handleReportSubmit} encType="multipart/form-data">
            {/* Common field for all types */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Doctor Name</label>
              <input
                type="text"
                required
                value={reportFormData.doctorName || ''}
                onChange={(e) => setReportFormData(prev => ({ ...prev, doctorName: e.target.value }))}
                className="w-full p-2 border rounded"
                placeholder="Dr. John Doe"
              />
            </div>
  
            {/* Test Report Fields */}
            {userActiveTab === "tests" && (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Test Name</label>
                  <input
                    type="text"
                    required
                    value={reportFormData.testName || ''}
                    onChange={(e) => setReportFormData(prev => ({ ...prev, testName: e.target.value }))}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Result</label>
                  <textarea
                    required
                    value={reportFormData.result || ''}
                    onChange={(e) => setReportFormData(prev => ({ ...prev, result: e.target.value }))}
                    className="w-full p-2 border rounded"
                    rows={3}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Document (Optional)</label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => setSelectedFile(e.target.files[0])}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </>
            )}
  
            {/* Prescription Fields */}
            {userActiveTab === "prescriptions" && (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Medication</label>
                  <input
                    type="text"
                    required
                    value={reportFormData.medication || ''}
                    onChange={(e) => setReportFormData(prev => ({ ...prev, medication: e.target.value }))}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Dosage</label>
                  <input
                    type="text"
                    required
                    value={reportFormData.dosage || ''}
                    onChange={(e) => setReportFormData(prev => ({ ...prev, dosage: e.target.value }))}
                    className="w-full p-2 border rounded"
                    placeholder="e.g., 500mg twice daily"
                  />
                </div>
              </>
            )}
  
            {/* Diagnosis Fields */}
            {userActiveTab === "diagnoses" && (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Condition</label>
                  <input
                    type="text"
                    required
                    value={reportFormData.condition || ''}
                    onChange={(e) => setReportFormData(prev => ({ ...prev, condition: e.target.value }))}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Notes</label>
                  <textarea
                    required
                    value={reportFormData.notes || ''}
                    onChange={(e) => setReportFormData(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full p-2 border rounded"
                    rows={3}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={reportFormData.date || ''}
                    onChange={(e) => setReportFormData(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </>
            )}
  
            <button 
              type="submit" 
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Save {userActiveTab === "tests" ? "Test Report" : userActiveTab === "prescriptions" ? "Prescription" : "Diagnosis"}
            </button>
          </form>
        </div>
      </div>
    </Dialog>
  );

  // Add this helper function to your component
const handleDownloadFile = (url, fileName) => {
  if (!url) {
    console.error("No file URL provided for download");
    return;
  }
  
  // Create a temporary anchor element
  const link = document.createElement('a');
  link.href = url;
  
  // Set the download attribute with the file name
  // If no fileName is provided, extract it from the URL
  const downloadName = fileName || url.split('/').pop();
  link.setAttribute('download', downloadName);
  
  // Append to body, click and remove
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
  const handleAddFamilyMember = async (e) => {
    if(e) e.preventDefault();
    setError('');
    setAddingFamily(true);

    try {
      const token = sessionStorage.getItem("accessToken");
      const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

      // Filter out empty emails
      const validEmails = familyEmails.filter(email => email.trim() !== '');

      if (validEmails.length === 0) {
        setError('Please add at least one email');
        return;
      }

      const response = await axios.post(
        `${import.meta.env.VITE_BASE_API_URL}/api/users/family/add`, 
        { familyMembers: validEmails },
        { headers }
      );

      if (response.data?.data?.user?.family) {
        setFamilyMembers(response.data.data.user.family);
        setIsFamilyModalOpen(false);
        setFamilyEmails(['']); // Reset the form
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Error adding family members');
      console.error("Error adding family members:", error);
    } finally {
      setAddingFamily(false);
    }
  };

  // Handle adding new email input field
  const addEmailField = () => {
    setFamilyEmails([...familyEmails, '']);
  };

  // Handle removing email input field
  const removeEmailField = (index) => {
    const newEmails = familyEmails.filter((_, i) => i !== index);
    setFamilyEmails(newEmails);
  };

  // Handle email input change
  const handleEmailChange = (index, value) => {
    const newEmails = [...familyEmails];
    newEmails[index] = value;
    setFamilyEmails(newEmails);
  };
  const familyMemberModal = (
    <Dialog open={isFamilyModalOpen} onClose={() => setIsFamilyModalOpen(false)} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="relative bg-white rounded-xl p-8 max-w-md w-full mx-4 shadow-lg">
          <button 
            onClick={() => {
              setIsFamilyModalOpen(false);
              setFamilyEmails(['']);
              setError('');
            }} 
            className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
          >
            ❌
          </button>
  
          <DialogTitle className="text-xl font-bold mb-6">Add Family Members</DialogTitle>
          
          {error && typeof error === 'string' && (
            <div className="mb-4 p-2 bg-red-100 text-red-600 rounded">
              {error}
            </div>
          )}
  
          <form onSubmit={(e) => {
            e.preventDefault();
            handleAddFamilyMember();
          }}>
            <div className="space-y-4">
              {familyEmails.map((email, index) => (
                <div key={index} className="flex gap-2">
                  <div className="flex-1">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => handleEmailChange(index, e.target.value)}
                      placeholder="family.member@email.com"
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  {familyEmails.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeEmailField(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4 flex gap-4">
              <button
                type="button"
                onClick={addEmailField}
                className="text-blue-600 hover:text-blue-700"
              >
                + Add Another Email
              </button>
            </div>
  
            <button 
              type="submit" 
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition mt-6"
              disabled={addingFamily}
            >
              {addingFamily ? "Adding..." : "Add Family Members"}
            </button>
          </form>
        </div>
      </div>
    </Dialog>
  );
  // AI Insights Modal
  const aiInsightsModal = (
    <Dialog open={isAIModalOpen} onClose={() => setIsAIModalOpen(false)} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="relative bg-white rounded-xl p-8 max-w-3xl w-full mx-4 shadow-lg max-h-[90vh] overflow-y-auto">
          <button 
            onClick={() => {
              setIsAIModalOpen(false);
              stopSpeaking();
            }} 
            className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
            aria-label="Close"
          >
            ❌
          </button>
  
          <DialogTitle className="text-xl font-bold mb-6 pr-8">
            AI Insights: {currentReport?.testName || "Medical Report"}
          </DialogTitle>
  
          {isLoadingAI ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-600">Analyzing your medical report...</p>
              <p className="mt-2 text-gray-500 text-sm">This may take a moment for complex reports</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Report Summary */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Report Details</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p><span className="font-medium">Test:</span> {currentReport?.testName}</p>
                  <p><span className="font-medium">Date:</span> {currentReport?.date && new Date(currentReport.date).toLocaleDateString()}</p>
                  <p><span className="font-medium">Doctor:</span> {currentReport?.doctorName || "Not specified"}</p>
                  {currentReport?.result && (
                    <p><span className="font-medium">Result Summary:</span> {currentReport.result}</p>
                  )}
                </div>
              </div>
  
              {/* AI Generated Insights */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold">AI Analysis</h3>
                  <div className="flex space-x-2">
                    {!speaking ? (
                      <button 
                        onClick={generateAISummary}
                        className="text-sm px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition disabled:bg-gray-400"
                        disabled={!ocrText || isLoadingAI}
                      >
                        Read Summary
                      </button>
                    ) : (
                      <button 
                        onClick={stopSpeaking}
                        className="text-sm px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                      >
                        Stop Reading
                      </button>
                    )}
                    <button 
                      onClick={() => setShowLanguageModal(true)}
                      className="text-sm px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition disabled:bg-gray-400"
                      disabled={!currentReport}
                    >
                      Change Language
                    </button>
                  </div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg prose max-w-none">
                  {aiInsights ? (
                    aiInsights.includes("Error") || aiInsights.includes("Failed") ? (
                      <div className="text-red-600">
                        <p><strong>Sorry!</strong> {aiInsights}</p>
                        <p className="text-sm mt-2">You can still view the original report text below.</p>
                      </div>
                    ) : (
                      <div dangerouslySetInnerHTML={{ __html: aiInsights }}></div>
                    )
                  ) : (
                    <p className="text-gray-500 italic">No AI insights available.</p>
                  )}
                </div>
              </div>
  
              {/* Original OCR Text */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Original Text</h3>
                <div className="bg-gray-50 p-4 rounded-lg max-h-48 overflow-y-auto border">
                  {ocrText ? (
                    <pre className="whitespace-pre-wrap text-sm text-gray-700">{ocrText}</pre>
                  ) : (
                    <p className="text-gray-500 italic">No text extracted. The document may be an image or scanned file.</p>
                  )}
                </div>
              </div>
              
              {/* Action buttons */}
              <div className="flex justify-end space-x-3 pt-2">
  <button
    onClick={() => {
      setIsAIModalOpen(false);
      stopSpeaking();
    }}
    className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
  >
    Close
  </button>
  {currentReport?.documentUrl && (
    <>
      <a
        href={currentReport.documentUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        View Original Document
      </a>
      <button
        onClick={() => handleDownloadFile(currentReport.documentUrl, `${currentReport.testName || 'medical-report'}_${new Date(currentReport.date).toLocaleDateString()}.pdf`)}
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
      >
        Download Document
      </button>
    </>
  )}
</div>
            </div>
          )}
        </div>
      </div>
    </Dialog>
  );

  // Language Selection Modal
  const languageModal = (
    <Dialog open={showLanguageModal} onClose={() => setShowLanguageModal(false)} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="relative bg-white rounded-xl p-6 max-w-sm w-full mx-4 shadow-lg">
          <DialogTitle className="text-lg font-bold mb-4">Select Language</DialogTitle>
          
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => speakReportInLanguage('en-US')}
              className="p-2 bg-blue-100 hover:bg-blue-200 rounded text-left transition"
            >
              English
            </button>
            <button 
              onClick={() => speakReportInLanguage('es-ES')}
              className="p-2 bg-blue-100 hover:bg-blue-200 rounded text-left transition"
            >
              Spanish
            </button>
            <button 
              onClick={() => speakReportInLanguage('fr-FR')}
              className="p-2 bg-blue-100 hover:bg-blue-200 rounded text-left transition"
            >
              French
            </button>
            <button 
              onClick={() => speakReportInLanguage('de-DE')}
              className="p-2 bg-blue-100 hover:bg-blue-200 rounded text-left transition"
            >
              German
            </button>
            <button 
              onClick={() => speakReportInLanguage('zh-CN')}
              className="p-2 bg-blue-100 hover:bg-blue-200 rounded text-left transition"
            >
              Chinese
            </button>
            <button 
              onClick={() => speakReportInLanguage('hi-IN')}
              className="p-2 bg-blue-100 hover:bg-blue-200 rounded text-left transition"
            >
              Hindi
            </button>
          </div>
          
          <button 
            onClick={() => setShowLanguageModal(false)}
            className="w-full mt-4 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </Dialog>
  );
  useEffect(() => {
    const fetchFamilyMembers = async () => {
      try {
        const token = sessionStorage.getItem("accessToken");
        const headers = { Authorization: `Bearer ${token}` };
        
        const response = await axios.get(`${import.meta.env.VITE_BASE_API_URL}/api/users/family`, { headers });
        
        if (response.data?.data?.familyMembers) {
          setFamilyMembers(response.data.data.familyMembers);
        }
      } catch (error) {
        console.error("Error fetching family members:", error);
      }
    };

    fetchFamilyMembers();
  }, []);
  // Main component render
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Modals */}
      {reportModal}
      {familyMemberModal}
      {aiInsightsModal}
      {languageModal}

      {/* Main Tabs */}
      <div className="bg-white rounded-xl shadow-lg mb-8">
        <div className="border-b border-gray-200">
          <ul className="flex flex-wrap -mb-px">
            <li className="mr-2">
              <button
                onClick={() => setUserActiveTab("tests")}
                className={`inline-block py-4 px-4 font-medium text-md ${
                  userActiveTab === "tests"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                My Test Reports
              </button>
            </li>
            <li className="mr-2">
              <button
                onClick={() => setUserActiveTab("prescriptions")}
                className={`inline-block py-4 px-4 font-medium text-md ${
                  userActiveTab === "prescriptions"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                My Prescriptions
              </button>
            </li>
            <li className="mr-2">
              <button
                onClick={() => setUserActiveTab("diagnoses")}
                className={`inline-block py-4 px-4 font-medium text-md ${
                  userActiveTab === "diagnoses"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                My Diagnoses
              </button>
            </li>
            <li className="mr-2">
              <button
                onClick={() => setUserActiveTab("family")}
                className={`inline-block py-4 px-4 font-medium text-md ${
                  userActiveTab === "family"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Family Reports
              </button>
            </li>
          </ul>
        </div>

        {/* User Reports Content */}
        {userActiveTab !== "family" ? (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                My {userActiveTab === "tests" ? "Test Reports" : userActiveTab === "prescriptions" ? "Prescriptions" : "Diagnoses"}
              </h2>
              <button
                onClick={() => setIsReportModalOpen(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
              >
                <span className="mr-1">+</span> Add New
              </button>
            </div>

            {/* Filter Options */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-1">Filter by Doctor:</label>
              <select
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
                className="p-2 border rounded w-full md:w-64"
              >
                <option value="">All Doctors</option>
                {doctors.map((doctor, index) => (
                  <option key={index} value={doctor.fullName}>
                    {doctor.fullName}
                  </option>
                ))}
              </select>
            </div>

            {/* Loading State */}
            {isLoading[userActiveTab] && (
              <div className="flex justify-center items-center py-12">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}

            {/* Error State */}
            {error[userActiveTab] && (
              <div className="bg-red-100 text-red-600 p-4 rounded mb-6">
                {error[userActiveTab]}
              </div>
            )}

            {/* Test Reports */}
            {userActiveTab === "tests" && !isLoading.tests && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {userReports.testReports && userReports.testReports.length > 0 ? (
                  userReports.testReports.map((report, index) => (
                    <div key={index} className="border rounded-lg p-4 shadow-sm hover:shadow-md transition">
                      <h3 className="font-semibold text-lg mb-1">{report.testName}</h3>
                      <p className="text-sm text-gray-500 mb-2">
                        {new Date(report.date).toLocaleDateString()} | Dr. {report.doctorName || "Unknown"}
                      </p>
                      <p className="text-sm mb-3 line-clamp-2">
                        <span className="font-medium">Result:</span> {report.result}
                      </p>
                      <div className="flex space-x-2">
                        {report.documentUrl && (
                          <>
                            <a
                              href={report.documentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded transition"
                            >
                              View File
                            </a>
                            <button
                              onClick={() => handleDownloadFile(report.documentUrl, `${report.testName}_${new Date(report.date).toLocaleDateString()}.pdf`)}
                              className="text-sm px-3 py-1.5 bg-green-100 hover:bg-green-200 text-green-700 rounded transition"
                            >
                              Download
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleViewAIInsights(report)}
                          className="text-sm px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition"
                        >
                          AI Insights
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12 text-gray-500">
                    No test reports found. Add your first report.
                  </div>
                )}
              </div>
            )}
            {/* Prescriptions */}
            {userActiveTab === "prescriptions" && !isLoading.prescriptions && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {userReports.prescriptions && userReports.prescriptions.length > 0 ? (
                  userReports.prescriptions.map((prescription, index) => (
                    <div key={index} className="border rounded-lg p-4 shadow-sm hover:shadow-md transition">
                      <h3 className="font-semibold text-lg mb-1">{prescription.medication}</h3>
                      <p className="text-sm text-gray-500 mb-2">
                        {new Date(prescription.date).toLocaleDateString()} | Dr. {prescription.doctorName || "Unknown"}
                      </p>
                      <p className="text-sm mb-2">
                        <span className="font-medium">Dosage:</span> {prescription.dosage}
                      </p>
                      {prescription.instructions && (
                        <p className="text-sm mb-3 line-clamp-2">
                          <span className="font-medium">Instructions:</span> {prescription.instructions}
                        </p>
                      )}
                      {prescription.documentUrl && (
                        <div className="flex space-x-2">
                          <a
                            href={prescription.documentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded transition"
                          >
                            View File
                          </a>
                          <button
                            onClick={() => handleDownloadFile(prescription.documentUrl, `${prescription.medication}_${new Date(prescription.date).toLocaleDateString()}.pdf`)}
                            className="text-sm px-3 py-1.5 bg-green-100 hover:bg-green-200 text-green-700 rounded transition"
                          >
                            Download
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12 text-gray-500">
                    No prescriptions found. Add your first prescription.
                  </div>
                )}
              </div>
            )}

            {/* Diagnoses */}
            {userActiveTab === "diagnoses" && !isLoading.diagnoses && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {userReports.diagnoses && userReports.diagnoses.length > 0 ? (
                  userReports.diagnoses.map((diagnosis, index) => (
                    <div key={index} className="border rounded-lg p-4 shadow-sm hover:shadow-md transition">
                      <h3 className="font-semibold text-lg mb-1">{diagnosis.diagnosis}</h3>
                      <p className="text-sm text-gray-500 mb-2">
                        {new Date(diagnosis.date).toLocaleDateString()} | Dr. {diagnosis.doctorName || "Unknown"}
                      </p>
                      {diagnosis.symptoms && (
                        <p className="text-sm mb-2">
                          <span className="font-medium">Symptoms:</span> {diagnosis.symptoms}
                        </p>
                      )}
                      {diagnosis.notes && (
                        <p className="text-sm mb-3 line-clamp-2">
                          <span className="font-medium">Notes:</span> {diagnosis.notes}
                        </p>
                      )}
                      {diagnosis.followUpDate && (
                        <p className="text-sm mb-3">
                          <span className="font-medium">Follow-up:</span> {new Date(diagnosis.followUpDate).toLocaleDateString()}
                        </p>
                      )}
                      {diagnosis.documentUrl && (
                        <a
                          href={diagnosis.documentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded transition"
                        >
                          View File
                        </a>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12 text-gray-500">
                    No diagnoses found. Add your first diagnosis.
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          // Family Reports Section
          <div className="p-6">
            {/* Instead of handling family selection here, we now pass the proper props to FamilyReportsSection */}
            <FamilyReportsSection
  familyMembers={familyMembers}
  setIsFamilyModalOpen={setIsFamilyModalOpen}
  activeTab={familyActiveTab}
  setActiveTab={setFamilyActiveTab}
/>
          </div>
        )}
      </div>
    </div>
  );
};

export default User_reports;  