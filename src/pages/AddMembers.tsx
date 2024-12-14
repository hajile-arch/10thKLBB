// UserFormWithBadgeSelection.tsx
import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { uploadToFirebase } from '../firebase/firebaseUtils';
import { UserFormInput } from '../components/addBadges/UserFormInput';
import { UserFormMessage } from '../components/addBadges/UserFormMessage';
import { BadgeSelection } from '../pages/Badgelist';

const RANK_OPTIONS = [
  "Recruit", 
  "Private", 
  "Lance Corporal", 
  "Corporal", 
  "Sergeant"
];

const ROLES_OPTIONS = [
  "None", 
  "Drill Sergeant", 
  "Band Sergeant", 
  "Worship Sergeant", 
  "Logistic Sergeant"
];

export const UserFormWithBadgeSelection: React.FC = () => {
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [rank, setRank] = useState("Recruit");
  const [roles, setRoles] = useState("None");
  const [selectedBadges, setSelectedBadges] = useState<any[]>([]); // To sync badges with BadgeSelection
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !dob || !rank) {
      setMessage("Name, DOB, and Rank are required!");
      return;
    }

    setLoading(true);
    const userData = {
      name,
      dob,
      rank,
      roles,
      badges: selectedBadges, // Include selected badges in submission
      id: uuidv4(),
    };

    const response = await uploadToFirebase("users", userData);

    if (response.success) {
      setMessage("User added successfully!");
      resetForm();
    } else {
      setMessage(`Error: ${response.message}`);
    }
    setLoading(false);
  };

  const resetForm = () => {
    setName("");
    setDob("");
    setRank("Recruit");
    setRoles("None");
    setSelectedBadges([]);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* User Form Section */}
      <div className="w-1/2 flex justify-center items-center p-6">
        <div className="max-w-lg w-full p-8 bg-white shadow-lg rounded-lg space-y-6">
          <h1 className="text-3xl font-semibold text-center text-gray-800 mb-4">
            Add New User
          </h1>

          <UserFormMessage message={message} />

          <form onSubmit={handleSubmit} className="space-y-6">
            <UserFormInput
              label="Name"
              type="text"
              value={name}
              onChange={setName}
              required={true}
            />

            <UserFormInput
              label="Date of Birth"
              type="date"
              value={dob}
              onChange={setDob}
              required={true}
            />

            <UserFormInput
              label="Rank"
              type="select"
              value={rank}
              onChange={setRank}
              options={RANK_OPTIONS}
            />

            <UserFormInput
              label="Other Roles"
              type="select"
              value={roles}
              onChange={setRoles}
              options={ROLES_OPTIONS}
            />

            <div className="flex justify-center">
              <button
                type="submit"
                disabled={loading}
                className={`w-full px-6 py-3 text-white font-semibold rounded-md transition-all duration-300 ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                }`}
              >
                {loading ? "Adding..." : "Add User"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Badge Selection Section */}
      <div className="w-1/2 bg-gray-100 p-6 overflow-y-auto">
        <BadgeSelection 
          selectedBadges={selectedBadges} 
          setSelectedBadges={setSelectedBadges} 
        />
      </div>
    </div>
  );
};

export default UserFormWithBadgeSelection;
