import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { uploadToFirebase } from "../firebase/firebaseUtils";
import { UserFormInput } from "../components/addBadges/UserFormInput";
import { UserFormMessage } from "../components/addBadges/UserFormMessage";
import { AwardBadgeSelection } from "../pages/AwardBadgelist";
import { ref, get } from "firebase/database";
import { db } from "../firebase/firebaseConfig";

const RANK_OPTIONS = [
  "Recruit",
  "Private",
  "Lance Corporal",
  "Corporal",
  "Sergeant",
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

const calculateAge = (dob: string): number => {
  const birthDate = new Date(dob);
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  return age;
};

const getPlatoon = (squad: string): string => {
  const squadNumber = parseInt(squad.split(" ")[1]);
  if (squadNumber === 1 || squadNumber === 2) return "Platoon A";
  if (squadNumber === 3 || squadNumber === 4) return "Platoon B";
  if (squadNumber === 5 || squadNumber === 6) return "Platoon C";
  if (squadNumber === 7 || squadNumber === 8) return "Platoon D";
  return "Unknown";
};

export const Awards: React.FC = () => {
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [rank, setRank] = useState("Recruit");
  const [squad, setSquad] = useState("Squad 1");
  const [yearJoined, setYearJoined] = useState(new Date().getFullYear().toString());
  const [googleDriveLink, setGoogleDriveLink] = useState("");
  const [selectedBadges, setSelectedBadges] = useState<any[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const usersRef = ref(db, "awards");
      const snapshot = await get(usersRef);

      if (snapshot.exists()) {
        const users = snapshot.val();
        const userExists = Object.values(users).some(
          (user: any) => user.name === name && user.dob === dob
        );

        if (userExists) {
          setMessage("This user has already been registered!");
          return;
        }
      }
    } catch (error) {
      console.error("Error checking user existence:", error);
      setMessage("Error checking if user exists. Please try again.");
      return;
    }

    if (!name || !dob || !rank || !squad || !yearJoined || !googleDriveLink) {
      setMessage("All fields, including 'Google Drive Link', are required!");
      return;
    }

    if (!googleDriveLink.includes("drive.google.com")) {
      setMessage("Please enter a valid Google Drive link");
      return;
    }

    const age = calculateAge(dob);
    if (age < 12) {
      setMessage("Member must be at least 12 years old.");
      return;
    }

    if (age > 22) {
      setMessage("Member must be 22 years old or younger.");
      return;
    }

    if (parseInt(yearJoined) < 2011 || parseInt(yearJoined) > new Date().getFullYear()) {
      setMessage("Year Joined must be between 2012 and the current year.");
      return;
    }

    const platoon = getPlatoon(squad);

    setLoading(true);
    const userData = {
      name,
      dob,
      rank,
      squad,
      platoon,
      yearJoined,
      googleDriveLink,
      badges: selectedBadges,
      id: uuidv4(),
      timestamp: Date.now(),
    };

    const response = await uploadToFirebase("Awards", userData);

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
    setYearJoined("");
    setGoogleDriveLink("");
    setSelectedBadges([]);
  };

  return (
  <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">
    {/* User Form Section - Fixed on desktop */}
    <div className="w-full lg:w-1/2 lg:fixed lg:top-0 lg:left-0 lg:h-screen lg:overflow-y-auto order-2 lg:order-1">
      <div className="flex justify-center items-center p-4 lg:p-6 min-h-full">
        <div className="max-w-md w-full p-4 sm:p-6 bg-white shadow-lg rounded-lg space-y-4 lg:my-8">
          <h1 className="text-2xl sm:text-3xl font-semibold text-center text-gray-800 mb-4">
            Awards Application
          </h1>

          <UserFormMessage message={message} />

          <form onSubmit={handleSubmit} className="space-y-4">
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

            <UserFormInput
              label="Year Joined"
              type="number"
              value={yearJoined}
              onChange={setYearJoined}
              required={true}
              min="2011"
              max={new Date().getFullYear().toString()}
            />

            <UserFormInput
              label="Google Drive Link"
              type="url"
              value={googleDriveLink}
              onChange={setGoogleDriveLink}
              required={true}
              
            />

            <div className="flex justify-center pt-2">
              <button
                type="submit"
                disabled={loading}
                className={`w-full px-4 py-3 text-white font-semibold rounded-md transition-all duration-300 ${
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
    </div>

    {/* Badge Selection Section - Scrolls independently */}
    <div className="w-full lg:w-1/2 lg:ml-[50%] bg-gray-100 p-4 lg:p-6 overflow-y-auto order-1 lg:order-2">
      <div className="sticky top-0 bg-gray-100 py-2 mb-4 z-10 lg:hidden">
        <h2 className="text-xl font-semibold text-center text-gray-800">
          Select Badges
        </h2>
      </div>
      <AwardBadgeSelection
        selectedBadges={selectedBadges}
        setSelectedBadges={setSelectedBadges}
      />
    </div>
  </div>
);
};

export default Awards;