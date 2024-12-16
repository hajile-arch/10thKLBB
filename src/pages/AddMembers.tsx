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

const SQUAD_OPTIONS = [
  "Squad 1",
  "Squad 2",
  "Squad 3",
  "Squad 4",
  "Squad 5",
  "Squad 6",
  "Squad 7",
  "Squad 8",
];

// Helper function to calculate age
const calculateAge = (dob: string): number => {
  const birthDate = new Date(dob);
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  // Adjust age if the birthday hasn't occurred yet this year
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    return age - 1;
  }

  return age;
};

// Helper function to determine platoon
const getPlatoon = (squad: string): string => {
  const squadNumber = parseInt(squad.split(' ')[1]); // Extract the number from "Squad X"
  if (squadNumber === 1 || squadNumber === 2) return "Platoon A";
  if (squadNumber === 3 || squadNumber === 4) return "Platoon B";
  if (squadNumber === 5 || squadNumber === 6) return "Platoon C";
  if (squadNumber === 7 || squadNumber === 8) return "Platoon D";
  return "Unknown"; // Fallback in case of unexpected input
};

export const UserFormWithBadgeSelection: React.FC = () => {
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [rank, setRank] = useState("Recruit");
  const [squad, setSquad] = useState("Squad 1");
  const [selectedBadges, setSelectedBadges] = useState<any[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!name || !dob || !rank || !squad) {
      setMessage("Name, DOB, Rank, and Squad are required!");
      return;
    }
  
    const age = calculateAge(dob);
    if (age < 13) {
      setMessage("User must be at least 13 years old.");
      return;
    }

    const platoon = getPlatoon(squad); // Determine the platoon
  
    setLoading(true);
    const userData = {
      name,
      dob,
      rank,
      squad,
      platoon,
      badges: selectedBadges,
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
    setSquad("Squad 1");
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
              label="Squad"
              type="select"
              value={squad}
              onChange={setSquad}
              options={SQUAD_OPTIONS}
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
