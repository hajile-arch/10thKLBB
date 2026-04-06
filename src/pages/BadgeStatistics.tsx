// src/pages/BadgeStatistics.tsx
import React, { useState, useEffect } from "react";
import { ref, get } from "firebase/database";
import { db } from "../firebase/firebaseConfig";
import * as XLSX from 'xlsx';

type Badge = {
  iconUrl?: string;
  name: string;
  level?: string;
  category: string;
  subCategory: string;
  description?: string;
};

type User = {
  id: string;
  name: string;
  badges?: Badge[];
};

type BadgeCount = {
  name: string;
  level?: string;
  category: string;
  count: number;
  users: string[]; // List of user names who have this badge
};

const BadgeStatistics: React.FC = () => {
  const [badgeCounts, setBadgeCounts] = useState<BadgeCount[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalBadges, setTotalBadges] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data on component mount
  useEffect(() => {
    const fetchBadgeStatistics = async () => {
      try {
        const usersRef = ref(db, "Awards");
        const snapshot = await get(usersRef);
        if (snapshot.exists()) {
          const usersData = snapshot.val();
          const usersArray: User[] = Object.values(usersData);
          setTotalUsers(usersArray.length);

          const badgeMap = new Map<string, BadgeCount>();
          let totalBadgeCount = 0;

          usersArray.forEach(user => {
            if (user.badges && Array.isArray(user.badges)) {
              user.badges.forEach(badge => {
                if (!badge) return;

                // Exclude badges with level 'advanced'
                if (badge.level && badge.level.toLowerCase() === 'advanced') {
                  return;
                }

                // Create a unique key
                const key = badge.level ? `${badge.name}-${badge.level}` : badge.name;

                if (badgeMap.has(key)) {
                  const existing = badgeMap.get(key)!;
                  existing.count += 1;
                  if (!existing.users.includes(user.name)) {
                    existing.users.push(user.name);
                  }
                } else {
                  badgeMap.set(key, {
                    name: badge.name,
                    level: badge.level,
                    category: badge.category,
                    count: 1,
                    users: [user.name],
                  });
                }
                totalBadgeCount += 1;
              });
            }
          });

          const badgeCountsArray = Array.from(badgeMap.values()).sort(
            (a, b) => b.count - a.count
          );

          setBadgeCounts(badgeCountsArray);
          setTotalBadges(totalBadgeCount);
        } else {
          setBadgeCounts([]);
        }
      } catch (err) {
        setError("Failed to fetch badge statistics");
        console.error("Error fetching badge statistics:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBadgeStatistics();
  }, []);

  // Function to export badge data to Excel
  const exportToExcel = () => {
    const data = badgeCounts.map(badge => ({
      'Badge Name': badge.name,
      'Level': badge.level || 'N/A',
      'Category': badge.category,
      'Count': badge.count,
      'Percentage': totalBadges > 0 ? ((badge.count / totalBadges) * 100).toFixed(1) + '%' : '0%',
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Badge Statistics');
    XLSX.writeFile(workbook, 'BadgeStatistics.xlsx');
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
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Badge Statistics</h1>
          <p className="text-gray-600">Total badges applied across all users</p>
          
          {/* Stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <h3 className="text-2xl font-bold text-blue-600">{totalUsers}</h3>
              <p className="text-gray-600">Total Users</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <h3 className="text-2xl font-bold text-green-600">{totalBadges}</h3>
              <p className="text-gray-600">Total Badges Applied</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <h3 className="text-2xl font-bold text-purple-600">
                {totalUsers > 0 ? (totalBadges / totalUsers).toFixed(1) : 0}
              </h3>
              <p className="text-gray-600">Average Badges per User</p>
            </div>
          </div>
          
          {/* Advanced badges count */}
          <div className="mt-4">
            <h4 className="text-xl font-semibold text-gray-700">
              {(() => {
                // Count the number of badges with level 'advanced'
                const advCount = badgeCounts.reduce((sum, b) => {
                  if (b.level && b.level.toLowerCase() === 'advanced') return sum + b.count;
                  return sum;
                }, 0);
                return `${advCount} badges are "Advanced"`;
              })()}
            </h4>
          </div>
        </div>
        
        {/* Export Button */}
        <div className="flex justify-end mb-4">
          <button
            className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded"
            onClick={exportToExcel}
          >
            Export to Excel
          </button>
        </div>
        
        {/* Badge Breakdown or No Data */}
        {badgeCounts.length === 0 ? (
          <div className="text-center bg-white rounded-lg shadow-md p-8">
            <div className="text-gray-500 text-lg mb-4">No badge data found</div>
            <p className="text-gray-400">No users have applied for badges yet</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Badge Breakdown</h2>
            
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-2 text-left">Badge Name</th>
                    <th className="px-4 py-2 text-left">Level</th>
                    <th className="px-4 py-2 text-left">Category</th>
                    <th className="px-4 py-2 text-center">Count</th>
                    <th className="px-4 py-2 text-center">Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {badgeCounts.map((badge, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2 font-medium">{badge.name}</td>
                      <td className="px-4 py-2">
                        {badge.level && (
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              badge.level.toLowerCase() === 'advanced'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {badge.level}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-gray-600">{badge.category}</td>
                      <td className="px-4 py-2 text-center font-semibold">{badge.count}</td>
                      <td className="px-4 py-2 text-center">
                        {totalBadges > 0
                          ? ((badge.count / totalBadges) * 100).toFixed(1) + '%'
                          : '0%'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Category Breakdown */}
            <div className="mt-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Category Breakdown</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from(new Set(badgeCounts.map(b => b.category))).map((category) => {
                  const categoryBadges = badgeCounts.filter(b => b.category === category);
                  const categoryTotal = categoryBadges.reduce((sum, b) => sum + b.count, 0);
                  return (
                    <div key={category} className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-800">{category}</h4>
                      <p className="text-2xl font-bold text-blue-600">{categoryTotal}</p>
                      <p className="text-sm text-gray-600">
                        {totalBadges > 0
                          ? ((categoryTotal / totalBadges) * 100).toFixed(1) + '% of total'
                          : '0% of total'}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BadgeStatistics;