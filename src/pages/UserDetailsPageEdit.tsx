import React, { useEffect, useState } from "react";
import { getDataFromFirebase, updateDataInFirebase } from "../firebase/firebaseUtils";
import EditBadgeList from "../components/EditMembers/EditBadgeList";
import { Badge, SelectedBadge } from "../types";
import { ChevronRight, Users, Award, Calendar, User, Users2 } from "lucide-react";

interface User {
  firebaseId: string;
  id: string;
  name: string;
  dob: string;
  squad: string;
  yearJoined: string;
  badges: SelectedBadge[];
  rank: "Recruit" | "Private" | "Lance Corporal" | "Corporal" | "Sergeant";
}

 


const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editedUser, setEditedUser] = useState<Partial<User> | null>(null);
  const [showEditAnimation, setShowEditAnimation] = useState(false);

  // Fetch users from Firebase on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const result = await getDataFromFirebase("users");
        if (result.success) {
          const fetchedUsers: User[] = Object.entries(result.data || {}).map(
            ([firebaseId, user]) => ({
              ...(user as Omit<User, "firebaseId">),
              firebaseId,
            })
          );
          setUsers(fetchedUsers);
        } else {
          setError(result.message || "Failed to fetch user data.");
        }
      } catch {
        setError("An error occurred while fetching user data.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Start editing a user
  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setEditedUser(user); // Clone user data for editing
  };

  // Handle form field updates
  const handleFieldChange = (field: keyof User, value: string) => {
    if (!editedUser) return;
    setEditedUser({ ...editedUser, [field]: value });
  };

  // Handle badge addition
  const handleAddBadge = (badge: SelectedBadge) => {
    if (!editedUser) return;

    // If badge level is undefined, default to "Basic"
    const updatedBadge: SelectedBadge = {
      ...badge,
      level: badge.level || "Basic",
    };

    // Add badge to the edited user
    setEditedUser({ ...editedUser, badges: [...(editedUser.badges || []), updatedBadge] });
  };

  // Handle badge deletion
  const handleDeleteBadge = (badgeIndex: number) => {
    if (!editedUser) return;
    const updatedBadges = editedUser.badges?.filter((_, index) => index !== badgeIndex) || [];
    setEditedUser({ ...editedUser, badges: updatedBadges });
  };

  // Save changes to Firebase
  const handleSaveChanges = async () => {
    if (!editedUser || !editingUser) return;

    try {
      const result = await updateDataInFirebase(editingUser.firebaseId, editedUser);
      if (result.success) {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.firebaseId === editingUser.firebaseId ? { ...user, ...editedUser } : user
          )
        );
        setEditingUser(null);
        setEditedUser(null);
      } else {
        alert("Failed to save changes.");
      }
    } catch {
      alert("An error occurred while saving changes.");
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingUser(null);
    setEditedUser(null);
  };
  
  const getRankColor = (rank: User['rank']) => {
    const colors = {
      "Sergeant": "bg-red-800",
      "Corporal": "bg-blue-800",
      "Lance Corporal": "bg-green-800",
      "Private": "bg-slate-600",
      "Recruit": "bg-gray-500"
    };
    return colors[rank];
  };

  

  const getRankIcon = (rank: User['rank']) => {
    const size = 24;
    const color = "white";
    switch (rank) {
      case "Sergeant":
        return <Users2 size={size} color={color} />;
      case "Corporal":
        return <Users size={size} color={color} />;
      default:
        return <User size={size} color={color} />;
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-500"></div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-red-500 text-white p-6 rounded-lg shadow-xl">
        <h2 className="text-2xl font-bold mb-2">Error</h2>
        <p>{error}</p>
      </div>
    </div>
  );

  // Group users by rank and order them
  const rankOrder: User['rank'][] = ["Sergeant", "Corporal", "Lance Corporal", "Private", "Recruit"];
  const groupedUsers = rankOrder.map((rank) => ({
    rank,
    users: users.filter((user) => user.rank === rank),
  }));

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <h1 className="text-5xl font-bold text-white tracking-tight">
            Member Management
          </h1>
          <div className="flex items-center space-x-2 text-gray-400">
            <Users size={24} />
            <span className="text-lg">{users.length} Users</span>
          </div>
        </div>
  
        {editingUser && editedUser ? (
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
                    onClick={handleCancelEdit}
                    className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveChanges}
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
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {groupedUsers.map(({ rank, users }) => (
              <div key={rank} className="bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
                <div className={`p-4 ${getRankColor(rank)} flex items-center justify-between`}>
                  {getRankIcon(rank)}
                  <h2 className="text-xl font-bold text-white">{rank}</h2>
                  <span className="bg-black bg-opacity-30 px-3 py-1 rounded-full text-white text-sm">
                    {users.length}
                  </span>
                </div>
                <div className="p-6 space-y-4">
                  {users.map((user) => (
                    <div
                      key={user.firebaseId}
                      className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors group cursor-pointer"
                      onClick={() => handleEditClick(user)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-white">{user.name}</h3>
                          <p className="text-gray-400 text-sm">{user.squad}</p>
                        </div>
                        <ChevronRight className="text-gray-400 group-hover:text-white transition-colors" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
 
};

export default UsersPage;
