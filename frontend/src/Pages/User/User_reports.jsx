import { useEffect, useState } from "react";
import { Dialog, DialogTitle } from "@headlessui/react";
import axios from "axios";
import FamilyReportsSection from "./FamilyDashboard"

const User_reports = () => {
  // Tabs state for both sections
  const [userActiveTab, setUserActiveTab] = useState("tests");
  const [familyActiveTab, setFamilyActiveTab] = useState("tests");
  
  // Modal states
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isFamilyModalOpen, setIsFamilyModalOpen] = useState(false);
  
  // Form data states
  const [reportFormData, setReportFormData] = useState({});
  const [familyFormData, setFamilyFormData] = useState({ fullName: "" });
  const [familyEmails, setFamilyEmails] = useState(['']); // Array to hold multiple email inputs
  const [addingFamily, setAddingFamily] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
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
  useEffect(() => {
    const fetchFamilyMembers = async () => {
      try {
        const token = sessionStorage.getItem("accessToken");
        const headers = { Authorization: `Bearer ${token}` };
        
        const response = await axios.get("http://localhost:8000/api/users/family", { headers });
        
        if (response.data?.data?.familyMembers) {
          setFamilyMembers(response.data.data.familyMembers);
        }
      } catch (error) {
        console.error("Error fetching family members:", error);
      }
    };

    fetchFamilyMembers();
  }, []);
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
    tests: "http://localhost:8000/api/users/test-reports",
    prescriptions: "http://localhost:8000/api/users/prescriptions",
    diagnoses: "http://localhost:8000/api/users/diagnoses"
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

        // Fetch family reports if family member is selected
        if (selectedFamilyMember) {
          const [familyTests, familyPrescriptions, familyDiagnoses] = await Promise.all([
            axios.get(`${endpointMap.tests}/family/${selectedFamilyMember}`, { headers }),
            axios.get(`${endpointMap.prescriptions}/family/${selectedFamilyMember}`, { headers }),
            axios.get(`${endpointMap.diagnoses}/family/${selectedFamilyMember}`, { headers })
          ]);

          setFamilyReports({
            testReports: familyTests.data,
            prescriptions: familyPrescriptions.data,
            diagnoses: familyDiagnoses.data
          });
        }
      } catch (error) {
        console.error("Error fetching reports:", error);
      }
    };
    
    fetchReports();
  }, [selectedDoctor, selectedFamilyMember]);

  // Handle adding a new report
  // Update the form submission handler
  const handleReportSubmit = async (e) => {
    e.preventDefault();
    try {
        const token = sessionStorage.getItem("accessToken");

        // FormData needs to be used in all cases
        const formData = new FormData();

        let endpoint = "";

        switch (userActiveTab) {
            case "tests":
                endpoint = "/addReport";
                formData.append("testName", reportFormData.testName || "");
formData.append("result", reportFormData.result || "");
formData.append("doctorName", reportFormData.doctorName || "");
formData.append("document", selectedFile);
                break;

            case "prescriptions":
                endpoint = "/addPresc";
                formData.append("doctorName", reportFormData.doctorName || "");
                formData.append("medication", reportFormData.medication || "");
                formData.append("dosage", reportFormData.dosage || "");
                break;

            case "diagnoses":
                endpoint = "/addDiagnosis";
                formData.append("doctorName", reportFormData.doctorName || "");
                formData.append("condition", reportFormData.condition || "");
                formData.append("notes", reportFormData.notes || "");
                formData.append("date", reportFormData.date || "");
                break;

            default:
                return;
        }

        // Debugging: Log FormData entries
        console.log("Submitting FormData:");
        for (let pair of formData.entries()) {
            console.log(pair[0] + ": " + pair[1]);
        }

        let requestBody;
switch (userActiveTab) {
    case "tests":
        endpoint = "/addReport";
        requestBody = formData;
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
}

const response = await axios.post(
    `${"http://localhost:8000/api/users/"}${endpoint}`,
    requestBody,
    {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": selectedFile ? "multipart/form-data" : "application/json",
        },
    }
);
        

if (response.data.success) {
  // Define fetch functions that return promises
  const fetchTestReports = async () => {
      const response = await axios.get('http://localhost:8000/api/users/test-reports', {
          headers: {
              Authorization: `Bearer ${token}`
          }
      });
      return response.data;
  };

  const fetchPrescriptions = async () => {
      const response = await axios.get('http://localhost:8000/api/users/prescriptions', {
          headers: {
              Authorization: `Bearer ${token}`
          }
      });
      return response.data;
  };

  const fetchDiagnoses = async () => {
      const response = await axios.get('http://localhost:8000/api/users/diagnoses', {
          headers: {
              Authorization: `Bearer ${token}`
          }
      });
      return response.data;
  };

  // Map of fetch functions
  const fetchFunction = {
      tests: fetchTestReports,
      prescriptions: fetchPrescriptions,
      diagnoses: fetchDiagnoses
  };

  const fetchUserActiveTab = fetchFunction[userActiveTab];

  if (fetchUserActiveTab) {
      try {
          const updatedReports = await fetchUserActiveTab(); // Execute the function
          setUserReports((prev) => ({
              ...prev,
              [userActiveTab]: updatedReports
          }));
      } catch (error) {
          console.error('Error fetching updated reports:', error);
          // Handle error appropriately
      }
  }
}
      
            // Reset form and close modal
            setReportFormData({});
            setSelectedFile(null);
            setIsReportModalOpen(false);
        
    } catch (error) {
        console.error(`Error submitting ${userActiveTab} report:`, error);
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
  const handleAddFamilyMember = async (e) => {
    e.preventDefault();
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
        "http://localhost:8000/api/users/family/add", 
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
          
          {error && (
            <div className="mb-4 p-2 bg-red-100 text-red-600 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleAddFamilyMember}>
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

            <div className="mt-6">
              <button 
                type="submit" 
                disabled={addingFamily}
                className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition disabled:bg-green-400"
              >
                {addingFamily ? 'Adding...' : 'Add Family Members'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Dialog>
  );

  const ReportsSection = ({ 
    title, 
    reports, 
    activeTab, 
    setActiveTab, 
    filterComponent, 
    addButton 
  }) => {
    // Helper function to render the correct report content based on activeTab
    const renderReportContent = () => {
      switch(activeTab) {
        case "tests":
          return reports.testReports?.map((report) => (
            <div key={report._id} className="bg-gray-50 p-6 rounded-xl">
              <h3 className="font-semibold text-lg mb-2">{report.testName}</h3>
              <div className="space-y-2">
                <p className="text-gray-600 text-sm">
                  <strong>Date:</strong> {new Date(report.date).toLocaleDateString()}
                </p>
                <p className="text-gray-600 text-sm">
                  <strong>Result:</strong> {report.result}
                </p>
                {report.doctorName && (
                  <p className="text-gray-600 text-sm">
                    <strong>Doctor:</strong> {report.doctorName}
                  </p>
                )}
                {report.documentUrl && (
                  <div className="mt-3">
                    <a 
                      href={report.documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                    >
                      <span>View Document</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                )}
              </div>
            </div>
          ));
  
        case "prescriptions":
          return reports.prescriptions?.map((report) => (
            <div key={report._id} className="bg-gray-50 p-6 rounded-xl">
              <h3 className="font-semibold text-lg mb-2">{report.medication}</h3>
              <div className="space-y-2">
                <p className="text-gray-600 text-sm">
                  <strong>Date:</strong> {new Date(report.date).toLocaleDateString()}
                </p>
                <p className="text-gray-600 text-sm">
                  <strong>Doctor:</strong> {report.doctorName}
                </p>
                <p className="text-gray-600 text-sm">
                  <strong>Dosage:</strong> {report.dosage}
                </p>
                <p className="text-gray-600 text-sm">
                  <strong>Duration:</strong> {report.duration}
                </p>
                <p className="text-gray-600 text-sm">
                  <strong>Instructions:</strong> {report.instructions}
                </p>
                {report.documentUrl && (
                  <div className="mt-3">
                    <a 
                      href={report.documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                    >
                      <span>View Prescription</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                )}
              </div>
            </div>
          ));
  
        case "diagnoses":
          return reports.diagnoses?.map((report) => (
            <div key={report._id} className="bg-gray-50 p-6 rounded-xl">
              <h3 className="font-semibold text-lg mb-2">{report.diagnosis}</h3>
              <div className="space-y-2">
                <p className="text-gray-600 text-sm">
                  <strong>Date:</strong> {new Date(report.date).toLocaleDateString()}
                </p>
                <p className="text-gray-600 text-sm">
                  <strong>Doctor:</strong> {report.doctorName}
                </p>
                <p className="text-gray-600 text-sm">
                  <strong>Symptoms:</strong> {report.symptoms}
                </p>
                <p className="text-gray-600 text-sm">
                  <strong>Notes:</strong> {report.notes}
                </p>
                {report.followUpDate && (
                  <p className="text-gray-600 text-sm">
                    <strong>Follow-up Date:</strong> {new Date(report.followUpDate).toLocaleDateString()}
                  </p>
                )}
                {report.documentUrl && (
                  <div className="mt-3">
                    <a 
                      href={report.documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                    >
                      <span>View Diagnosis Report</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                )}
              </div>
            </div>
          ));
  
        default:
          return null;
      }
    };
  
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          <div className="flex gap-4 items-center">
            {filterComponent}
            {addButton}
          </div>
        </div>
  
        {/* Tabs Navigation */}
        <div className="flex border-b mb-6">
          {["tests", "prescriptions", "diagnoses"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 capitalize ${
                activeTab === tab ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
  
        {/* Reports Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading?.[activeTab] && (
            <div className="col-span-full flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}
  
          {error?.[activeTab] && (
            <div className="col-span-full bg-red-50 p-4 rounded-lg">
              <p className="text-red-600 text-center">{error[activeTab]}</p>
            </div>
          )}
  
          {!isLoading?.[activeTab] && !error?.[activeTab] && renderReportContent()}
  
          {!isLoading?.[activeTab] && !error?.[activeTab] && 
            reports[activeTab === 'tests' ? 'testReports' : activeTab]?.length === 0 && (
            <div className="col-span-full text-center py-8 text-gray-500">
              No {activeTab} found
            </div>
          )}
        </div>
      </div>
    );
  };
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* User Reports Section */}
        <ReportsSection
          title="My Medical Records"
          reports={userReports}
          activeTab={userActiveTab}
          setActiveTab={setUserActiveTab}
          filterComponent={
            <select
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
              className="p-2 border rounded-lg"
            >
              <option value="">All Doctors</option>
              {doctors.map((doctor) => (
                <option key={doctor.email} value={doctor.email}>
                  {`${doctor.fullName} - ${doctor.specialization}`}
                </option>
              ))}
            </select>
          }
          addButton={
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Add New Report
            </button>
          }
        />

        {/* Family Reports Section */}
        <FamilyReportsSection
  familyMembers={familyMembers}
  setIsFamilyModalOpen={setIsFamilyModalOpen}
  activeTab={familyActiveTab}
  setActiveTab={setFamilyActiveTab}
/>
      
{reportModal}

        {/* Add Family Member Modal */}
        {/* {familyMemberModal} */}
      </div>
    </div>
  );
};

export default User_reports;  