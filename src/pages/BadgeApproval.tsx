// src/pages/BadgeApproval.tsx
import React, { useState, useEffect } from "react";
import { ref, get, update, remove } from "firebase/database";
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
  dob: string;
  rank: string;
  squad: string;
  platoon: string;
  yearJoined: string;
  googleDriveLink: string;
  badges?: Badge[];
  timestamp?: number;
};

const BadgeApproval: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      console.log("Fetching users for approval...");
      const usersRef = ref(db, "Awards");
      const snapshot = await get(usersRef);

      if (snapshot.exists()) {
        const usersData = snapshot.val();
        console.log("Users data:", usersData);

        if (!usersData) {
          console.log("No users data found");
          setUsers([]);
          return;
        }

        const usersArray: User[] = Object.entries(usersData).map(([id, userData]: [string, any]) => ({
          ...userData,
          id: id
        }));

        // Initialize all badges as pending if no status is set
        const usersWithBadgeStatus = usersArray.map(user => ({
          ...user,
          badges: user.badges ? user.badges.map((badge: Badge) => ({
            ...badge,
            status: badge.status || "pending"
          })) : []
        }));

        setUsers(usersWithBadgeStatus);
      } else {
        console.log("Snapshot doesn't exist");
        setUsers([]);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const processBadges = (badges: Badge[] | undefined) => {
    if (!badges || !Array.isArray(badges)) return [];

    const badgeCounts = new Map<string, number>();
    const uniqueBadges: (Badge & { status?: string })[] = [];

    badges.forEach((badge) => {
      if (!badge) return;

      if (badge.level) {
        const key = `${badge.name}-${badge.level}-${badge.status || "pending"}`;
        badgeCounts.set(key, (badgeCounts.get(key) || 0) + 1);
        if (
          !uniqueBadges.some(
            (b) => b.name === badge.name && b.level === badge.level && b.status === badge.status
          )
        ) {
          uniqueBadges.push({ ...badge });
        }
      } else {
        const key = `${badge.name}-${badge.status || "pending"}`;
        badgeCounts.set(key, (badgeCounts.get(key) || 0) + 1);
        if (!uniqueBadges.some((b) => b.name === badge.name && !b.level && b.status === badge.status)) {
          uniqueBadges.push({ ...badge });
        }
      }
    });

    return uniqueBadges.map((badge) => {
      const count = badge.level
        ? badgeCounts.get(`${badge.name}-${badge.level}-${badge.status || "pending"}`) || 1
        : badgeCounts.get(`${badge.name}-${badge.status || "pending"}`) || 1;

      return {
        ...badge,
        count: count > 1 ? count : undefined,
      };
    });
  };

  const categorizeBadges = (
    processedBadges: Array<Badge & { count?: number; status?: string }>
  ) => {
    if (!processedBadges || !Array.isArray(processedBadges)) {
      return { proficiency: [], specialService: [] };
    }

    const proficiency = processedBadges.filter(
      (badge) => badge && badge.category === "proficiencyAwards"
    );

    const specialService = processedBadges.filter(
      (badge) =>
        badge &&
        (badge.category === "specialAwards" ||
          badge.category === "serviceAwards")
    );

    return { proficiency, specialService };
  };

  const groupProficiencyByCategory = (
    badges: Array<Badge & { count?: number; status?: string }>
  ) => {
    const categories: { [key: string]: Array<Badge & { count?: number; status?: string }> } = {
      compulsory: [],
      groupA: [],
      groupB: [],
      groupC: [],
      groupD: [],
      others: [],
    };

    if (!badges || !Array.isArray(badges)) return categories;

    badges.forEach((badge) => {
      if (!badge) return;

      const group = badge.subCategory;
      if (categories[group]) {
        categories[group].push(badge);
      } else {
        categories.others.push(badge);
      }
    });

    return categories;
  };

  const capitalizeCategory = (category: string) => {
    return category
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/^./, (str) => str.toUpperCase());
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800", text: "Pending" },
      approved: { color: "bg-green-100 text-green-800", text: "Approved" },
      rejected: { color: "bg-red-100 text-red-800", text: "Rejected" }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const approveBadge = async (userId: string, badge: Badge) => {
    setProcessing(`approving-${userId}-${badge.name}`);
    try {
      const userRef = ref(db, `Awards/${userId}`);
      const userSnapshot = await get(userRef);
      
      if (userSnapshot.exists()) {
        const userData = userSnapshot.val();
        const updatedBadges = userData.badges.map((b: Badge) => 
          b.name === badge.name && b.level === badge.level && b.category === badge.category
            ? { ...b, status: "approved" }
            : b
        );

        await update(userRef, { badges: updatedBadges });
        await fetchUsers();
        setError(null);
      }
    } catch (err) {
      console.error("Error approving badge:", err);
      setError("Failed to approve badge");
    } finally {
      setProcessing(null);
    }
  };

  const rejectBadge = async (userId: string, badge: Badge) => {
    setProcessing(`rejecting-${userId}-${badge.name}`);
    try {
      const userRef = ref(db, `Awards/${userId}`);
      const userSnapshot = await get(userRef);
      
      if (userSnapshot.exists()) {
        const userData = userSnapshot.val();
        const updatedBadges = userData.badges.map((b: Badge) => 
          b.name === badge.name && b.level === badge.level && b.category === badge.category
            ? { ...b, status: "rejected" }
            : b
        );

        await update(userRef, { badges: updatedBadges });
        await fetchUsers();
        setError(null);
      }
    } catch (err) {
      console.error("Error rejecting badge:", err);
      setError("Failed to reject badge");
    } finally {
      setProcessing(null);
    }
  };

  const SimpleBadgesList: React.FC<{
    badges: Array<Badge & { count?: number; status?: string }>;
    user: User;
  }> = ({ badges, user }) => {
    if (!badges.length) {
      return (
        <div className="text-gray-500 text-sm">No badges in this category.</div>
      );
    }

    return (
      <div className="space-y-2">
        {badges.map((badge, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 bg-gray-50 rounded border"
          >
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-medium">
                  {badge.name}
                  {badge.count && badge.count > 1 && ` x${badge.count}`}
                </span>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(badge.status || "pending")}
                  {badge.level && (
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        badge.level.toLowerCase() === "advanced"
                          ? "bg-red-100 text-red-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {badge.level}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {(badge.status === "pending" || !badge.status) && (
              <div className="flex space-x-2 ml-4">
                <button
                  onClick={() => approveBadge(user.id, badge)}
                  disabled={processing === `approving-${user.id}-${badge.name}`}
                  className="bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white px-3 py-1 rounded text-sm"
                >
                  {processing === `approving-${user.id}-${badge.name}` ? "..." : "Approve"}
                </button>
                <button
                  onClick={() => rejectBadge(user.id, badge)}
                  disabled={processing === `rejecting-${user.id}-${badge.name}`}
                  className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white px-3 py-1 rounded text-sm"
                >
                  {processing === `rejecting-${user.id}-${badge.name}` ? "..." : "Reject"}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    );
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
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Badge Approval System
          </h1>
          <p className="text-gray-600">
            Review and approve/reject badge applications
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {users.length === 0 ? (
          <div className="text-center bg-white rounded-lg shadow-md p-8">
            <div className="text-gray-500 text-lg mb-4">No users found</div>
            <p className="text-gray-400">
              No badge applications to review
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {users.map((user) => {
              if (!user) return null;

              const processedBadges = processBadges(user.badges);
              const { proficiency, specialService } = categorizeBadges(processedBadges);
              const proficiencyByCategory = groupProficiencyByCategory(proficiency);
              const hasBadges = processedBadges.length > 0;
              const totalBadges = user.badges ? user.badges.length : 0;
              const pendingBadges = processedBadges.filter(b => b.status === "pending" || !b.status).length;

              return (
                <div
                  key={user.id}
                  className="bg-white rounded-lg shadow-md p-6"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                    {/* User Info */}
                    <div className="flex-1 mb-4 md:mb-0">
                      <div className="flex items-center justify-between mb-3">
                        <h2 className="text-xl font-semibold text-gray-800">
                          {user.name}
                        </h2>
                        {pendingBadges > 0 && (
                          <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                            {pendingBadges} pending
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="flex items-center">
                          <span className="text-gray-600 font-medium mr-2">Rank:</span>
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                            {user.rank}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-gray-600 font-medium mr-2">Squad:</span>
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                            {user.squad}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-gray-600 font-medium mr-2">Platoon:</span>
                          <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">
                            {user.platoon}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-gray-600 font-medium mr-2">Year Joined:</span>
                          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">
                            {user.yearJoined}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Google Drive Link */}
                    <div className="md:text-right">
                      <a
                        href={
                          user.googleDriveLink.startsWith("http")
                            ? user.googleDriveLink
                            : `https://${user.googleDriveLink}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors"
                      >
                        <svg
                          className="w-5 h-5 mr-2"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M7.71 3.29L3.71 7.29C3.08 7.92 3.52 9 4.41 9H6V11C6 12.1 6.9 13 8 13H10V15C10 16.1 10.9 17 12 17H18C19.1 17 20 16.1 20 15V9C20 7.9 19.1 7 18 7H12C10.9 7 10 6.1 10 5V3H8C7.45 3 7 3.45 7 4C7 4.55 7.45 5 8 5H10V7H8C6.9 7 6 7.9 6 9V11H4.41C3.52 11 3.08 12.08 3.71 12.71L7.71 16.71C8.09 17.09 8.22 17.28 8.22 17.28C8.22 17.28 8.46 17.63 8.46 18C8.46 18.37 8.22 18.72 8.22 18.72C8.22 18.72 8.09 18.91 7.71 19.29L3.71 23.29C3.08 23.92 3.52 25 4.41 25H19C21.21 25 23 23.21 23 21V7C23 4.79 21.21 3 19 3H8.41C7.52 3 7.08 4.08 7.71 4.71L7.71 4.71Z" />
                        </svg>
                        View Google Drive
                      </a>
                    </div>
                  </div>

                  {/* Badges Section */}
                  {hasBadges && (
                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                        <svg
                          className="w-5 h-5 mr-2 text-yellow-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Applied Badges ({totalBadges})
                        {pendingBadges > 0 && (
                          <span className="ml-2 text-yellow-600 text-sm">
                            ({pendingBadges} pending review)
                          </span>
                        )}
                      </h3>

                      {/* Proficiency Awards by Category */}
                      {Object.entries(proficiencyByCategory).map(
                        ([category, badges]) => {
                          if (badges.length === 0) return null;

                          return (
                            <div key={category} className="mb-4">
                              <h4 className="font-semibold text-gray-700 mb-2">
                                {capitalizeCategory(category)} Proficiency Awards
                              </h4>
                              <SimpleBadgesList badges={badges} user={user} />
                            </div>
                          );
                        }
                      )}

                      {/* Special & Service Awards */}
                      {specialService.length > 0 && (
                        <div className="mb-4">
                          <h4 className="font-semibold text-gray-700 mb-2">
                            Special & Service Awards
                          </h4>
                          <SimpleBadgesList badges={specialService} user={user} />
                        </div>
                      )}
                    </div>
                  )}

                  {!hasBadges && (
                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <p className="text-gray-500">No badges applied yet.</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default BadgeApproval;