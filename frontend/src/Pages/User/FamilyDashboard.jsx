import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle } from '@headlessui/react';
import FamilyForm from './FamilyMemberForm';

const FamilyReportsSection = ({ 
  familyMembers, 
  setIsFamilyModalOpen, 
  activeTab, 
  setActiveTab 
}) => {
  const [selectedMember, setSelectedMember] = useState('');
  const [familyMember, setFamilyMember] = useState('');
  const [loading, setLoading] = useState({});
  const [data, setData] = useState({
    testReports: [],
    prescriptions: [],
    diagnoses: []
  });
  const [isFamilyModalOpen, setIsFamilyModalOpenState] = useState(false);
  const [error, setError] = useState({});
  const [familyLoading, setFamilyLoading] = useState(false);
const [familyError, setFamilyError] = useState('');
useEffect(() => {
  fetchFamilyMembers();
}, []);

const fetchFamilyMembers = async () => {
    setFamilyLoading(true);
    setFamilyError('');
    console.log("Fetching family members...");
    try {
      const token = sessionStorage.getItem("accessToken");
      const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}/api/users/family`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch family members: ${response.status}`);
      }
  
      const result = await response.json();
      console.log(result)
      setFamilyMember(result.data.familyMembers);
    } catch (error) {
      console.error('Error fetching family members:', error);
      setFamilyError('Failed to load family members. Please try again.');
    } finally {
      setFamilyLoading(false);
    }
  };
  
  const fetchFamilyData = async (email) => {
    if (!email) return;
    
    setLoading(prev => ({ ...prev, [activeTab]: true }));
    setError(prev => ({ ...prev, [activeTab]: '' }));
    
    try {
      const token = sessionStorage.getItem("accessToken");
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const endpoints = {
        tests: 'famReport',
        prescriptions: 'famPresc',
        diagnoses: 'famDiagnosis'
      };

      const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}/api/users/${endpoints[activeTab]}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ familyMemberEmail: email })
      });

      if (!response.ok) {
        throw new Error(`API call failed with status: ${response.status}`);
      }

      const result = await response.json();
      setData(prev => ({
        ...prev,
        [activeTab === 'tests' ? 'testReports' : activeTab]: result
      }));
    } catch (error) {
      console.error('Error fetching family data:', error);
      setError(prev => ({
        ...prev,
        [activeTab]: 'Failed to fetch family member data. Please try again.'
      }));
    } finally {
      setLoading(prev => ({ ...prev, [activeTab]: false }));
    }
  };

  useEffect(() => {
    if (selectedMember) {
      fetchFamilyData(selectedMember);
    }
  }, [selectedMember, activeTab]);

  const renderReportContent = () => {
    switch(activeTab) {
      case "tests":
        return data.testReports?.map((report) => (
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
        return data.prescriptions?.map((report) => (
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
        return data.diagnoses?.map((report) => (
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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Family Medical Records</h2>
        <div className="flex gap-4 items-center">
        <div className="relative">
        <select
  value={selectedMember}
  onChange={(e) => setSelectedMember(e.target.value)}
  className="p-2 border rounded-lg w-64 bg-white"
>
  {familyLoading ? (
    <option>Loading...</option>
  ) : (
    <>
      <option value="">Select Family Member</option>
      {familyMember.length > 0 ? (
        familyMember.map((member) => (
          <option key={member._id} value={member.email}>
            {`${member.fullName} (${member.email})`}
          </option>
        ))
      ) : (
        <option disabled>No members found</option>
      )}
    </>
  )}
</select>
  {/* {familyLoading && (
    <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
    </div>
  )} */}
</div>
          <button
            onClick={() => setIsFamilyModalOpenState(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
          >
            Add Family Member
          </button>
        </div>
      </div>
    
      {selectedMember && (
        <>
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading[activeTab] && (
              <div className="col-span-full flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}

            {error[activeTab] && (
              <div className="col-span-full bg-red-50 p-4 rounded-lg">
                <p className="text-red-600 text-center">{error[activeTab]}</p>
              </div>
            )}

            {!loading[activeTab] && !error[activeTab] && renderReportContent()}

            {!loading[activeTab] && !error[activeTab] && 
              data[activeTab === 'tests' ? 'testReports' : activeTab]?.length === 0 && (
              <div className="col-span-full text-center py-8 text-gray-500">
                No {activeTab} found
              </div>
            )}
          </div>
        </>
      )}

<Dialog open={isFamilyModalOpen} onClose={() => setIsFamilyModalOpenState(false)} className="relative z-50">
  <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
  <div className="fixed inset-0 flex items-center justify-center p-4">
    <div className="relative bg-white rounded-xl p-8 max-w-md w-full mx-4 shadow-lg">
      <button 
        onClick={() => setIsFamilyModalOpenState(false)} 
        className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
      >
        ❌
      </button>
      <DialogTitle className="text-xl font-bold mb-6">Add Family Members</DialogTitle>
      {/* ✅ Pass fetchFamilyMembers function to FamilyForm */}
      <FamilyForm onFamilyAdded={fetchFamilyMembers} setFamilyMember={setFamilyMember}
  closeModal={() => setIsFamilyModalOpenState(false)} />
    </div>
  </div>
</Dialog>

    </div>
  );
};

export default FamilyReportsSection;