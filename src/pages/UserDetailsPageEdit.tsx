// UserPage.tsx
import React, { useEffect, useState } from "react";
import { getDataFromFirebase, updateDataInFirebase } from "../firebase/firebaseUtils";
import { User } from "../types";
import { Users, User as UserIcon, Users2, ChevronRight } from "lucide-react";
import EditUserForm from "../components/EditMembers/EditUserForm";


const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editedUser, setEditedUser] = useState<Partial<User> | null>(null);

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

  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setEditedUser(user);
  };

  const handleSaveChanges = async (updatedUser: Partial<User>) => {
    if (!editingUser) return;

    try {
      const result = await updateDataInFirebase(editingUser.firebaseId, updatedUser);
      if (result.success) {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.firebaseId === editingUser.firebaseId ? { ...user, ...updatedUser } : user
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

  const handleCancelEdit = () => {
    setEditingUser(null);
    setEditedUser(null);
  };

  const getRankColor = (rank: User['rank']) => ({
    "Sergeant": "bg-red-800",
    "Corporal": "bg-blue-800",
    "Lance Corporal": "bg-green-800",
    "Private": "bg-slate-600",
    "Recruit": "bg-gray-500"
  }[rank]);

  const getRankIcon = (rank: User['rank']) => {
    const size = 24;
    const color = "white";
    switch (rank) {
      case "Sergeant": return <Users2 size={size} color={color} />;
      case "Corporal": return <Users size={size} color={color} />;
      default: return <UserIcon size={size} color={color} />;
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
          <EditUserForm
            editedUser={editedUser}
            onSave={handleSaveChanges}
            onCancel={handleCancelEdit}
          />
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