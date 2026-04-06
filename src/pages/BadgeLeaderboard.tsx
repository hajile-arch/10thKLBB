// src/pages/BadgeLeaderboard.tsx
import React, { useState, useEffect } from "react";
import { ref, get } from "firebase/database";
import { db } from "../firebase/firebaseConfig";

type Badge = {
  iconUrl?: string;
  name: string;
  level?: string;
  category: string;
  subCategory: string;
  description?: string;
  status?: "pending" | "approved" | "rejected";
};

type User = {
  id: string;
  name: string;
  rank: string;
  squad: string;
  platoon: string;
  yearJoined: string;
  badges?: Badge[];
};

// Extended type for users with approved badges data
type UserWithApprovedBadges = User & {
  approvedBadges: Badge[];
  approvedBadgeCount: number;
};

const BadgeLeaderboard: React.FC = () => {
  const [users, setUsers] = useState<UserWithApprovedBadges[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const usersRef = ref(db, "Awards");
      const snapshot = await get(usersRef);

      if (snapshot.exists()) {
        const usersData = snapshot.val();
        const usersArray: User[] = Object.entries(usersData).map(([id, userData]: [string, any]) => ({
          ...userData,
          id: id
        }));

        // Filter users to only include approved badges and sort by badge count
        const usersWithApprovedBadges: UserWithApprovedBadges[] = usersArray
          .map(user => {
            // Filter only approved badges
            const approvedBadges = user.badges?.filter((badge: Badge) => 
              badge && badge.status === "approved"
            ) || [];

            return {
              ...user,
              approvedBadges,
              approvedBadgeCount: approvedBadges.length
            };
          })
          .filter(user => user.approvedBadgeCount > 0) // Only show users with approved badges
          .sort((a, b) => b.approvedBadgeCount - a.approvedBadgeCount); // Sort by badge count descending

        setUsers(usersWithApprovedBadges);
      } else {
        setUsers([]);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const getBadgeDisplayName = (badge: Badge) => {
    return badge.level ? `${badge.name} (${badge.level})` : badge.name;
  };

  const getRankColor = (index: number) => {
    if (index === 0) return "bg-yellow-100 border-yellow-300"; // Gold
    if (index === 1) return "bg-gray-100 border-gray-300"; // Silver
    if (index === 2) return "bg-orange-100 border-orange-300"; // Bronze
    return "bg-white border-gray-200"; // Others
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return `${index + 1}`;
  };

  // Safely quote CSV fields
const csvEscape = (val: unknown) => {
  if (val === null || val === undefined) return "";
  const s = String(val);
  // Quote if contains comma, quote, or newline
  if (/[",\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
};

// Make "Name (Level)" display for a badge
const formatBadge = (badge: Badge) =>
  badge.level ? `${badge.name} (${badge.level})` : badge.name;

// Build & download CSV
const handleExportCSV = () => {
  const headers = [
    "Name",
    "Rank",
    "Squad",
    "Platoon",
    "Year Joined",
    "Approved Badge Count",
    "Approved Badges"
  ];

  const rows = users.map(u => {
    const badgesJoined = (u.approvedBadges || [])
      .map(formatBadge)
      .join("; "); // use semicolon to avoid extra commas in CSV columns

    return [
      u.name,
      u.rank,
      u.squad,
      u.platoon,
      u.yearJoined,
      u.approvedBadgeCount,
      badgesJoined
    ].map(csvEscape).join(",");
  });

  // Prepend BOM for Excel UTF-8
  const csvString = "\uFEFF" + [headers.join(","), ...rows].join("\n");

  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  const today = new Date().toISOString().slice(0,10);
  a.download = `badge-leaderboard-${today}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-500 text-center p-8 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
  <div>
    <h1 className="text-3xl font-bold text-gray-800 mb-1">
      Badge Leaderboard
    </h1>
    <p className="text-gray-600">
      Members ranked by number of approved badges
    </p>
  </div>

  <button
    onClick={handleExportCSV}
    className="inline-flex items-center px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 shadow-sm"
    title="Download leaderboard as CSV"
  >
    ⬇️ Export CSV
  </button>
</div>

        {users.length === 0 ? (
          <div className="text-center bg-white rounded-lg shadow-md p-8">
            <div className="text-gray-500 text-lg mb-4">No approved badges found</div>
            <p className="text-gray-400">
              No users have approved badges yet. Start by approving badges in the approval system.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {users.map((user, index) => (
              <div
                key={user.id}
                className={`border-2 rounded-lg p-6 shadow-sm ${getRankColor(index)}`}
              >
                <div className="flex items-start justify-between">
                  {/* User Info and Rank */}
                  <div className="flex items-start space-x-4 flex-1">
                    {/* Rank Badge */}
                    <div className="flex-shrink-0">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
                        index === 0 ? 'bg-yellow-200 text-yellow-800' :
                        index === 1 ? 'bg-gray-200 text-gray-800' :
                        index === 2 ? 'bg-orange-200 text-orange-800' :
                        'bg-blue-200 text-blue-800'
                      }`}>
                        {getRankIcon(index)}
                      </div>
                    </div>

                    {/* User Details */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h2 className="text-xl font-semibold text-gray-800">
                          {user.name}
                        </h2>
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                          {user.rank}
                        </span>
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">
                          {user.squad}
                        </span>
                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm font-medium">
                          {user.platoon}
                        </span>
                      </div>

                      {/* Badge Count */}
                      <div className="mb-3">
                        <span className="text-2xl font-bold text-gray-700">
                          {user.approvedBadgeCount}
                        </span>
                        <span className="text-gray-600 ml-1">
                          approved badge{user.approvedBadgeCount !== 1 ? 's' : ''}
                        </span>
                      </div>

                      {/* Approved Badges */}
                      <div className="flex flex-wrap gap-2">
                        {user.approvedBadges.map((badge: Badge, badgeIndex: number) => (
                          <span
                            key={badgeIndex}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white border border-gray-300 text-gray-700 shadow-sm"
                          >
                            {getBadgeDisplayName(badge)}
                            {badge.level && (
                              <span
                                className={`ml-2 px-1.5 py-0.5 rounded text-xs ${
                                  badge.level.toLowerCase() === "advanced"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-blue-100 text-blue-800"
                                }`}
                              >
                                {badge.level}
                              </span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Year Joined */}
                  <div className="text-right flex-shrink-0">
                    <div className="bg-gray-100 px-3 py-1 rounded-lg">
                      <div className="text-sm text-gray-600">Year Joined</div>
                      <div className="font-semibold text-gray-800">{user.yearJoined}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        {users.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow-md p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{users.length}</div>
              <div className="text-gray-600">Total Members</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {users.reduce((sum, user) => sum + user.approvedBadgeCount, 0)}
              </div>
              <div className="text-gray-600">Total Approved Badges</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {(users.reduce((sum, user) => sum + user.approvedBadgeCount, 0) / users.length).toFixed(1)}
              </div>
              <div className="text-gray-600">Avg Badges per Member</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {users[0]?.approvedBadgeCount || 0}
              </div>
              <div className="text-gray-600">Most Badges ({users[0]?.name || 'N/A'})</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BadgeLeaderboard;