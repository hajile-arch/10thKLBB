// EditUserForm.tsx
import React from "react";
import { User, SelectedBadge } from "../../types";
import EditBadgeList from "./EditBadgeList";
import { Award } from "lucide-react";

interface EditUserFormProps {
  editedUser: Partial<User>;
  onSave: (user: Partial<User>) => void;
  onCancel: () => void;
}

const EditUserForm: React.FC<EditUserFormProps> = ({
  editedUser: initialUser,
  onSave,
  onCancel,
}) => {
  const [editedUser, setEditedUser] = React.useState<Partial<User>>(initialUser);

  const handleFieldChange = (field: keyof User, value: string) => {
    setEditedUser({ ...editedUser, [field]: value });
  };

  const handleAddBadge = (badge: SelectedBadge) => {
    const updatedBadge = badge.category === 'serviceAwards' || badge.category === 'specialAwards'
      ? { ...badge }  // Don't add level for service and special awards
      : { ...badge, level: badge.level || "Basic" };  // Add default level only for other awards
    
    setEditedUser({
      ...editedUser,
      badges: [...(editedUser.badges || []), updatedBadge],
    });
  };

  const handleDeleteBadge = (badgeIndex: number) => {
    const updatedBadges = editedUser.badges?.filter((_, index) => index !== badgeIndex) || [];
    setEditedUser({ ...editedUser, badges: updatedBadges });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Edit Form */}
      <div className="bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-3xl font-bold text-white">Edit User Profile</h2>
        </div>
        <form className="p-6 space-y-6">
          {/* Name Input */}
          <div className="space-y-2">
            <label className="block text-gray-300 text-sm font-medium">Full Name</label>
            <input
              type="text"
              value={editedUser.name || ""}
              onChange={(e) => handleFieldChange("name", e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Enter full name"
            />
          </div>

          {/* Date of Birth Input */}
          <div className="space-y-2">
            <label className="block text-gray-300 text-sm font-medium">Date of Birth</label>
            <input
              type="date"
              value={editedUser.dob || ""}
              onChange={(e) => handleFieldChange("dob", e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          {/* Squad Input */}
          <div className="space-y-2">
            <label className="block text-gray-300 text-sm font-medium">Squad Assignment</label>
            <input
              type="text"
              value={editedUser.squad || ""}
              onChange={(e) => handleFieldChange("squad", e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Enter squad name"
            />
          </div>

          {/* Year Joined Input */}
          <div className="space-y-2">
            <label className="block text-gray-300 text-sm font-medium">Year Joined</label>
            <input
              type="text"
              value={editedUser.yearJoined || ""}
              onChange={(e) => handleFieldChange("yearJoined", e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Enter year joined"
            />
          </div>

          <div className="pt-6 border-t border-gray-700 flex justify-end space-x-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onSave(editedUser)}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>

      {/* Badges Section */}
      <div className="bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-3xl font-bold text-white flex items-center">
            <Award className="mr-3" /> Badges
          </h2>
        </div>
        <div className="p-6">
          <EditBadgeList
            badges={editedUser.badges || []}
            onDeleteBadge={handleDeleteBadge}
            onAddBadge={handleAddBadge}
          />
        </div>
      </div>
    </div>
  );
};

export default EditUserForm;