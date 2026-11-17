import { useState } from "react";
import {
  MoreVertical,
  Users,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Member, Squad, parseDob } from "../../enum";
import { getSquadPeople } from "../../firebase/squadService";

interface SquadListingProps {
  squads: Squad[];
  members: Member[];
  isLoading: boolean;
}

const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const formatBirthday = (dob?: string) => {
  const parsed = parseDob(dob);
  return parsed ? `${parsed.day} ${MONTHS_SHORT[parsed.month]}` : "";
};

const SquadListing = ({ squads, members, isLoading }: SquadListingProps) => {
  const [startIndex, setStartIndex] = useState(0);
  const [selectedSquad, setSelectedSquad] = useState<Squad | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handlePrevious = () => {
    setStartIndex((prev) => Math.max(0, prev - 3));
  };

  const handleNext = () => {
    setStartIndex((prev) => Math.max(0, Math.min(squads.length - 3, prev + 3)));
  };

  const visibleSquads = squads.slice(startIndex, startIndex + 3);

  const handleSquadClick = (squad: Squad) => {
    setSelectedSquad(squad);
  };

  const closeModal = () => {
    setSelectedSquad(null);
  };

  const handleMoreClick = () => {
    setShowPasswordModal(true);
  };

  const validatePassword = () => {
    const correctPassword = "10thkl"; // Replace with your desired password
    if (password === correctPassword) {
      setShowPasswordModal(false);
      navigate("/squad");
    } else {
      setError("Incorrect password. Please try again.");
    }
  };

  const selectedPeople = selectedSquad
    ? getSquadPeople(selectedSquad, members)
    : null;

  if (isLoading) {
    return (
      <div className="col-span-4 bg-gray-800 rounded-2xl p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="col-span-4 bg-gray-800 rounded-2xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-medium text-white">Squad Listing</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevious}
            disabled={startIndex === 0}
            className="text-gray-400 hover:text-white disabled:opacity-50 disabled:hover:text-gray-400"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={handleNext}
            disabled={startIndex >= squads.length - 3}
            className="text-gray-400 hover:text-white disabled:opacity-50 disabled:hover:text-gray-400"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <button onClick={handleMoreClick} className="p-2">
            <MoreVertical className="h-5 w-5 text-white" />
          </button>
        </div>
      </div>
      <div className="space-y-4">
        {squads.length === 0 && (
          <p className="text-sm text-gray-400">No squads set up for this year yet.</p>
        )}
        {visibleSquads.map((squad) => {
          const { leader, assistants, regulars } = getSquadPeople(squad, members);
          const headcount = (leader ? 1 : 0) + assistants.length + regulars.length;
          return (
          <div
            key={squad.squadNumber}
            className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors cursor-pointer"
            onClick={() => handleSquadClick(squad)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-gray-600 p-2 rounded-lg">
                  <Users className="h-5 w-5 text-gray-300" />
                </div>
                <div>
                  <h4 className="text-white font-medium">
                    Squad {squad.squadNumber}
                  </h4>
                  <p className="text-sm text-gray-400">
                    {leader ? `${leader.rank} ${leader.name}` : "No squad leader"}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400">{headcount} in squad</p>
              </div>
            </div>
          </div>
          );
        })}
      </div>

      {/* Modal */}
      {selectedSquad && selectedPeople && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div
            className="bg-gray-800 rounded-lg shadow-lg w-full max-w-lg max-h-[85vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white">
                Squad {selectedSquad.squadNumber}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3 text-sm text-gray-300">
              <p>
                <span className="font-medium text-gray-200">Squad Leader:</span>{" "}
                {selectedPeople.leader
                  ? `${selectedPeople.leader.rank} ${selectedPeople.leader.name}`
                  : "N/A"}
              </p>
              <p>
                <span className="font-medium text-gray-200">
                  Assistant {selectedPeople.assistants.length > 1 ? "Leaders" : "Leader"}:
                </span>{" "}
                {selectedPeople.assistants
                  .map((m) => `${m.rank} ${m.name}`)
                  .join(", ") || "N/A"}
              </p>
              <p>
                <span className="font-medium text-gray-200">Officers:</span>{" "}
                {[selectedSquad.officerName, selectedSquad.officerTwoName]
                  .filter(Boolean)
                  .join(", ") || "N/A"}
              </p>
              <div>
                <span className="font-medium text-gray-200">
                  Members ({selectedPeople.regulars.length}):
                </span>
                <ul className="mt-2 space-y-2">
                  {selectedPeople.regulars.map((member) => (
                    <li
                      key={member.id}
                      className="flex justify-between items-center gap-4 bg-gray-700 p-2 rounded-lg"
                    >
                      <div className="flex gap-2 items-center">
                        <span className="text-gray-300">{member.rank}</span>
                        <span className="text-white">{member.name}</span>
                      </div>
                      <span className="font-medium text-white whitespace-nowrap">
                        {formatBirthday(member.dob)}
                      </span>
                    </li>
                  ))}
                  {selectedPeople.regulars.length === 0 && (
                    <li className="text-gray-400">No members assigned.</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg shadow-lg w-96 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white">Enter Password</h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>
            <div className="mt-4 text-right">
              <button
                onClick={validatePassword}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SquadListing;
