// Member management: pick a member, edit their details and badges
import React, { useEffect, useState } from "react";
import { Users, User as UserIcon, Users2, ChevronRight } from "lucide-react";
import EditUserForm, { MemberEdits } from "../components/EditMembers/EditUserForm";
import {
  getAllMembers,
  getAllMemberBadges,
  updateMember,
  saveMemberBadges,
} from "../firebase/memberService";
import { Member } from "../enum";
import { SelectedBadge } from "../types";

type RankName = "Sergeant" | "Corporal" | "Lance Corporal" | "Private" | "Recruit";

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<Member[]>([]);
  const [badgesByMember, setBadgesByMember] = useState<Record<string, SelectedBadge[]>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<Member | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const [members, badges] = await Promise.all([
          getAllMembers(),
          getAllMemberBadges(),
        ]);
        setUsers(members.sort((a, b) => (a.name || "").localeCompare(b.name || "")));
        setBadgesByMember(badges as Record<string, SelectedBadge[]>);
      } catch {
        setError("An error occurred while fetching member data.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleEditClick = (user: Member) => {
    setEditingUser(user);
  };

  const handleSaveChanges = async (edits: MemberEdits, badges: SelectedBadge[]) => {
    if (!editingUser) return;

    setSaving(true);
    try {
      const memberResult = await updateMember(editingUser.id, edits as Partial<Member>);
      if (!memberResult.success) {
        alert(`Failed to save changes: ${memberResult.error || "unknown error"}`);
        return;
      }

      const badgeResult = await saveMemberBadges(editingUser.id, badges);
      if (!badgeResult.success) {
        alert(
          `Member details were saved, but the badges were not: ${badgeResult.error || "unknown error"}`
        );
        return;
      }

      const { yearJoined, ...rest } = edits;
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === editingUser.id
            ? { ...user, ...rest, yearJoined: yearJoined ?? undefined }
            : user
        )
      );
      setBadgesByMember((prev) => ({ ...prev, [editingUser.id]: badges }));
      setEditingUser(null);
    } catch {
      alert("An error occurred while saving changes.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
  };

  const getRankColor = (rank: RankName) => ({
    "Sergeant": "bg-red-800",
    "Corporal": "bg-blue-800",
    "Lance Corporal": "bg-green-800",
    "Private": "bg-slate-600",
    "Recruit": "bg-gray-500"
  }[rank]);

  const getRankIcon = (rank: RankName) => {
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

  const rankOrder: RankName[] = ["Sergeant", "Corporal", "Lance Corporal", "Private", "Recruit"];
  const groupedUsers = rankOrder.map((rank) => ({
    rank,
    users: users.filter((user) => user.rank === rank),
  }));

  return (
    <div className="min-h-screen bg-gray-900 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between gap-4 mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-5xl font-bold text-white tracking-tight">
            Member Management
          </h1>
          <div className="flex items-center space-x-2 text-gray-400">
            <Users size={24} />
            <span className="text-lg">{users.length} Members</span>
          </div>
        </div>

        {editingUser ? (
          <EditUserForm
            key={editingUser.id}
            member={editingUser}
            badges={badgesByMember[editingUser.id] || []}
            saving={saving}
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
                      key={user.id}
                      className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors group cursor-pointer"
                      onClick={() => handleEditClick(user)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-white">{user.name}</h3>
                          <p className="text-gray-400 text-sm">
                            {user.currentSquad ? `Squad ${user.currentSquad}` : "Unassigned"}
                            {user.status && user.status !== "Active" && ` • ${user.status}`}
                          </p>
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