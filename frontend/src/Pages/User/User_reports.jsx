import { useEffect, useState } from "react";
import { Dialog, DialogTitle } from "@headlessui/react";
import axios from "axios";

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
  const [error, setError] = useState('');
  // Filter states
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedFamilyMember, setSelectedFamilyMember] = useState("");
  
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
      if (userActiveTab !== "tests") return; // Only fetch when 'tests' tab is active
  
      try {
        const token = sessionStorage.getItem("accessToken");
        const headers = { Authorization: `Bearer ${token}` };
        const response = await axios.get(`${endpointMap.testReports}`, { headers });
  
        setUserReports((prev) => ({
          ...prev,
          tests: Array.isArray(response.data) ? response.data.map(testReport => ({
            testName: testReport.testName,
            result: testReport.result, // Assuming API already decrypts data
            documentUrl: testReport.documentUrl, 
            date: testReport.date
          })) : [] // Return empty array if it's not an array
        }));
        
      } catch (error) {
        console.error("Error fetching test reports:", error);
      }
    };
  
    fetchTestReports();
  }, [userActiveTab]); // Refetch whenever activeTab changes
  
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
  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        const token = sessionStorage.getItem("accessToken");
        const headers = { Authorization: `Bearer ${token}` };
        const response = await axios.get(`${endpointMap.prescriptions}`, { headers });
  
        setUserReports(prev => ({
          ...prev,
          prescriptions: response.data // Ensure this isn't duplicating!
        }));
      } catch (error) {
        console.error("Error fetching prescriptions:", error);
      }
    };
  
    fetchPrescriptions();
  }, []);
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
  const handleReportSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = sessionStorage.getItem("accessToken");
      const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

      const response = await axios.post(endpointMap[userActiveTab], reportFormData, { headers });

      if (response.data) {
        setUserReports((prev) => ({
          ...prev,
          [userActiveTab]: [...prev[userActiveTab], response.data]
        }));
        setIsReportModalOpen(false);
        setReportFormData({});
      }
    } catch (error) {
      console.error("Error submitting report:", error);
    }
  };

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
  }) => (
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

  {/* Reports Section */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {reports[activeTab]?.map((report) => (
      <div key={report._id} className="bg-gray-50 p-6 rounded-xl">
        <h3 className="font-semibold text-lg mb-2">
          {activeTab === "prescriptions" ? report.medication : report.title || report.diagnosis}
        </h3>
        <p className="text-gray-600 text-sm mb-2">Date: {new Date(report.date).toLocaleDateString()}</p>

        {activeTab === "prescriptions" && (
          <>
            <p className="text-gray-600 text-sm"><strong>Doctor:</strong> {report.doctorName}</p>
            <p className="text-gray-600 text-sm"><strong>Dosage:</strong> {report.dosage}</p>
          </>
        )}
         
        ``
       
      </div>
    ))}
  </div>
</div>

  );

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
        <ReportsSection
    title="Family Medical Records"
    reports={familyReports}
    activeTab={familyActiveTab}
    setActiveTab={setFamilyActiveTab}
    filterComponent={
      <select
        value={selectedFamilyMember}
        onChange={(e) => setSelectedFamilyMember(e.target.value)}
        className="p-2 border rounded-lg"
      >
        <option value="">Select Family Member</option>
        {familyMembers.map((member) => (
          <option key={member._id} value={member.email}>
            {`${member.fullName} (${member.email})`}
          </option>
        ))}
      </select>
    }
    addButton={
      <button
        onClick={() => setIsFamilyModalOpen(true)}
        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
      >
        Add Family Member
      </button>
    }
  />
        {/* Add Report Modal */}
        <Dialog open={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} className="relative z-50">
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <div className="relative bg-white rounded-xl p-8 max-w-md w-full mx-4 shadow-lg">
              <button onClick={() => setIsReportModalOpen(false)} className="absolute top-4 right-4 text-gray-600 hover:text-gray-900">
                ❌
              </button>

              <DialogTitle className="text-xl font-bold mb-6">
                Add New {userActiveTab === "tests" ? "Test Report" : userActiveTab === "prescriptions" ? "Prescription" : "Diagnosis"}
              </DialogTitle>
              
              <form onSubmit={handleReportSubmit}>
                {userActiveTab === "tests" && (
                  <>
                    <label className="block text-sm font-medium mb-1">Test Name</label>
                    <input
                      type="text"
                      required
                      onChange={(e) => setReportFormData({ ...reportFormData, testName: e.target.value })}
                      className="w-full p-2 border rounded mb-4"
                    />
                  </>
                )}
                {userActiveTab === "prescriptions" && (
                  <>
                    <label className="block text-sm font-medium mb-1">Medication</label>
                    <input
                      type="text"
                      required
                      onChange={(e) => setReportFormData({ ...reportFormData, medication: e.target.value })}
                      className="w-full p-2 border rounded mb-4"
                    />
                  </>
                )}
                {userActiveTab === "diagnoses" && (
                  <>
                    <label className="block text-sm font-medium mb-1">Diagnosis</label>
                    <input
                      type="text"
                      required
                      onChange={(e) => setReportFormData({ ...reportFormData, diagnosis: e.target.value })}
                      className="w-full p-2 border rounded mb-4"
                    />
                  </>
                )}

                <label className="block text-sm font-medium mb-1">Doctor Name</label>
                <input
                  type="text"
                  required
                  placeholder="Dr. John Doe"
                  onChange={(e) => setReportFormData({ ...reportFormData, doctorName: e.target.value })}
                  className="w-full p-2 border rounded mb-4"
                />

                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                  Save Report
                </button>
              </form>
            </div>
          </div>
        </Dialog>

        {/* Add Family Member Modal */}
        {familyMemberModal}
      </div>
    </div>
  );
};

export default User_reports;  