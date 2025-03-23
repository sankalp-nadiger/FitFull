import { useState } from "react";
import axios from "axios";

const FamilyForm = ({ onFamilyAdded, setFamilyMember, closeModal }) => {
  const [familyEmails, setFamilyEmails] = useState([""]);
  const [addingFamily, setAddingFamily] = useState(false);
  const [error, setError] = useState("");

  const handleEmailChange = (index, value) => {
    const updatedEmails = [...familyEmails];
    updatedEmails[index] = value;
    setFamilyEmails(updatedEmails);
  };

  // Add email field
  const addEmailField = () => {
    setFamilyEmails([...familyEmails, ""]);
  };

  // Remove email field
  const removeEmailField = (index) => {
    setFamilyEmails(familyEmails.filter((_, i) => i !== index));
  };
  const handleAddFamilyMember = async (e) => {
    e.preventDefault();
    setAddingFamily(true);
    setError("");

    const accessToken = sessionStorage.getItem("accessToken");

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_API_URL}/api/users/family/add`,
        { familyMembers: familyEmails },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Update the family members list directly
      if (setFamilyMember) {
        setFamilyMember(prev => [...prev, ...response.data.addedMembers]);
      }

      // Call the onFamilyAdded callback for refetching if needed
      await onFamilyAdded();
      
      // Reset form
      setFamilyEmails([""]); 
      
      // Close the modal
      closeModal();

      // Show success message
      alert(response.data.message);
    } catch (err) {
      setError(err.response?.data?.message || "Error adding family members");
    } finally {
      setAddingFamily(false);
    }
  };

  return (
    <form onSubmit={handleAddFamilyMember}>
      <div className="space-y-4">
        {familyEmails.map((email, index) => (
          <div key={index} className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => handleEmailChange(index, e.target.value)}
              placeholder="family.member@email.com"
              className="w-full p-2 border rounded"
              required
            />
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

      {error && <p className="text-red-500 mt-2">{error}</p>}

      <div className="mt-6">
        <button
          type="submit"
          disabled={addingFamily}
          className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition disabled:bg-green-400"
        >
          {addingFamily ? "Adding..." : "Add Family Members"}
        </button>
      </div>
    </form>
  );
};

export default FamilyForm;
