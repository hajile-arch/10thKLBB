import React from "react";
import { Squad } from "../../types";
import { UserPlus, Trash2, Users, ChevronDown } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface SquadFormProps {
  formData: Omit<Squad, "id">;
  onChange: (formData: Omit<Squad, "id">) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isEditing: boolean;
}

export const SquadForm = ({
  formData,
  onChange,
  onSubmit,
  onCancel,
  isEditing,
}: SquadFormProps) => {
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    onChange({ ...formData, [name]: value });
  };

  const handleMemberChange = (
    index: number,
    field: "name" | "rank" | "birthday",
    value: string
  ) => {
    const updatedMembers = [...formData.members];
    updatedMembers[index] = { ...updatedMembers[index], [field]: value };
    onChange({ ...formData, members: updatedMembers });
  };

  const handleAddMember = () => {
    onChange({
      ...formData,
      members: [...formData.members, { name: "", rank: "Recruit", birthday: "" }],
    });
  };

  const handleRemoveMember = (index: number) => {
    onChange({
      ...formData,
      members: formData.members.filter((_, i) => i !== index),
    });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    try {
      toast.success("Form submitted successfully!");
      setTimeout(() => {
        onSubmit(e);
      }, 1500);
    } catch (error) {
      console.error(error);
      toast.error("An error occurred. Please try again.");
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-white rounded-lg shadow-lg">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <Users className="w-5 h-5" />
          {isEditing ? "Edit Squad" : "Create New Squad"}
        </h2>
      </div>

      <form onSubmit={handleFormSubmit} className="p-6">
        <div className="space-y-6">
          {/* Squad Number and Name fields remain unchanged */}
          <div className="space-y-2">
            <label htmlFor="squadNumber" className="block text-sm font-medium text-gray-700">
              Squad Number
            </label>
            <div className="relative">
              <select
                id="squadNumber"
                name="squadNumber"
                value={formData.squadNumber}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none pr-10"
              >
                <option value="">Select Squad</option>
                {Array.from({ length: 8 }, (_, i) => (
                  <option key={i + 1} value={`Squad ${i + 1}`}>
                    Squad {i + 1}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="squadName" className="block text-sm font-medium text-gray-700">
              Squad Name
            </label>
            <input
              type="text"
              id="squadName"
              name="squadName"
              value={formData.squadName || ''}
              onChange={handleInputChange}
              placeholder="Enter squad name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Leadership Section with added birthday fields */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-700">Leadership</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label htmlFor="squadLeader" className="block text-sm font-medium text-gray-700">
                  Squad Leader
                </label>
                <div className="flex flex-col md:flex-row gap-4">
                  <input
                    type="text"
                    id="squadLeader"
                    name="squadLeader"
                    value={formData.squadLeader}
                    onChange={handleInputChange}
                    placeholder="Name"
                    className="flex-1 mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <select
                    name="squadLeaderRank"
                    value={formData.squadLeaderRank}
                    onChange={handleInputChange}
                    className="mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Recruit">Recruit</option>
                    <option value="Private">Private</option>
                    <option value="Lance Corporal">Lance Corporal</option>
                    <option value="Corporal">Corporal</option>
                    <option value="Sergeant">Sergeant</option>
                  </select>
                  <input
                    type="date"
                    name="squadLeaderBirthday"
                    value={formData.squadLeaderBirthday || ''}
                    onChange={handleInputChange}
                    className="mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="assistantSquadLeader" className="block text-sm font-medium text-gray-700">
                  Assistant Squad Leader
                </label>
                <div className="flex flex-col md:flex-row gap-4">
                  <input
                    type="text"
                    id="assistantSquadLeader"
                    name="assistantSquadLeader"
                    value={formData.assistantSquadLeader}
                    onChange={handleInputChange}
                    placeholder="Name"
                    className="flex-1 mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <select
                    name="assistantSquadLeaderRank"
                    value={formData.assistantSquadLeaderRank}
                    onChange={handleInputChange}
                    className="mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Recruit">Recruit</option>
                    <option value="Private">Private</option>
                    <option value="Lance Corporal">Lance Corporal</option>
                    <option value="Corporal">Corporal</option>
                    <option value="Sergeant">Sergeant</option>
                  </select>
                  <input
                    type="date"
                    name="assistantSquadLeaderBirthday"
                    value={formData.assistantSquadLeaderBirthday || ''}
                    onChange={handleInputChange}
                    className="mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Officers (without birthday fields) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="officerOne" className="block text-sm font-medium text-gray-700">
                    Officer One
                  </label>
                  <input
                    type="text"
                    id="officerOne"
                    name="officerOne"
                    value={formData.officerOne}
                    onChange={handleInputChange}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="officerTwo" className="block text-sm font-medium text-gray-700">
                    Officer Two
                  </label>
                  <input
                    type="text"
                    id="officerTwo"
                    name="officerTwo"
                    value={formData.officerTwo}
                    onChange={handleInputChange}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Members Section with birthday field */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-700">Squad Members</h3>
              <button
                type="button"
                onClick={handleAddMember}
                className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-500 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Add Member
              </button>
            </div>

            <div className="border border-gray-200 rounded-md p-4 max-h-96 overflow-y-auto">
              <div className="space-y-4">
                {(formData.members || []).map((member, index) => (
                  <div key={index} className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={member.name}
                        onChange={(e) => handleMemberChange(index, "name", e.target.value)}
                        placeholder="Member Name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1 sm:w-48">
                        <select
                          value={member.rank}
                          onChange={(e) => handleMemberChange(index, "rank", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none pr-10"
                        >
                          <option value="Recruit">Recruit</option>
                          <option value="Private">Private</option>
                          <option value="Lance Corporal">Lance Corporal</option>
                          <option value="Corporal">Corporal</option>
                          <option value="Sergeant">Sergeant</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                      </div>
                      <input
                        type="date"
                        value={member.birthday || ''}
                        onChange={(e) => handleMemberChange(index, "birthday", e.target.value)}
                        className="w-40 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(index)}
                        className="p-2 text-red-600 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {isEditing ? "Update" : "Create"} Squad
          </button>
        </div>
      </form>
    </div>
  );
};

export default SquadForm;