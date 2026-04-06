// src/pages/UserManagement.tsx
import React, { useState, useEffect } from "react";
import { ref, get, remove } from "firebase/database";
import { db } from "../firebase/firebaseConfig";
import { Link } from "react-router-dom";
import * as XLSX from "xlsx";

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
  dob: string;
  rank: string;
  squad: string;
  platoon: string;
  yearJoined: string;
  googleDriveLink: string;
  badges?: Badge[];
  timestamp?: number;
};

const MemberManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [duplicateUsers, setDuplicateUsers] = useState<Map<string, User[]>>(new Map());
  const [usersToDelete, setUsersToDelete] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [exportData, setExportData] = useState<any[]>([]);

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
        setUsers(usersArray);
        findDuplicates(usersArray);
        prepareExportData(usersArray);
      } else {
        setUsers([]);
        setDuplicateUsers(new Map());
        setExportData([]);
      }
    } catch (err) {
      setError("Failed to fetch users");
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  const findDuplicates = (usersArray: User[]) => {
    const nameMap = new Map<string, User[]>();
    
    usersArray.forEach(user => {
      if (!nameMap.has(user.name)) {
        nameMap.set(user.name, []);
      }
      nameMap.get(user.name)!.push(user);
    });

    const duplicates = new Map<string, User[]>();
    nameMap.forEach((users, name) => {
      if (users.length > 1) {
        const sortedUsers = users.sort((a, b) => {
          if (a.timestamp && b.timestamp) {
            return b.timestamp - a.timestamp;
          }
          return parseInt(b.yearJoined) - parseInt(a.yearJoined);
        });
        
        duplicates.set(name, sortedUsers);
        const usersToDeleteIds = sortedUsers.slice(1).map(user => user.id);
        setUsersToDelete(prev => new Set([...prev, ...usersToDeleteIds]));
      }
    });

    setDuplicateUsers(duplicates);
  };

  const formatBadgesForExport = (badges: Badge[] | undefined): string => {
    if (!badges || !Array.isArray(badges)) return "None";
    
    // Group badges by name and level to show counts
    const badgeCounts = new Map<string, number>();
    
    badges.forEach(badge => {
      if (!badge) return;
      
      const key = badge.level ? `${badge.name} (${badge.level})` : badge.name;
      badgeCounts.set(key, (badgeCounts.get(key) || 0) + 1);
    });
    
    // Convert to formatted string
    return Array.from(badgeCounts.entries())
      .map(([badgeName, count]) => count > 1 ? `${badgeName} x${count}` : badgeName)
      .join(", ");
  };

  const prepareExportData = (usersArray: User[]) => {
    const data = usersArray.map(user => {
      const badgesText = formatBadgesForExport(user.badges);
      const isDuplicate = duplicateUsers.has(user.name);
      const markedForDeletion = usersToDelete.has(user.id);
      
      return {
        'Name': user.name,
        'Rank': user.rank,
        'Squad': user.squad,
        'Platoon': user.platoon,
        'Year Joined': user.yearJoined,
        'DOB': user.dob,
        'Google Drive Link': user.googleDriveLink,
        'Badges Applied': badgesText,
        'Number of Badges': user.badges?.length || 0,
        'Created Date': user.timestamp ? new Date(user.timestamp).toLocaleString() : 'N/A',
        'User ID': user.id,
        'Is Duplicate': isDuplicate ? 'Yes' : 'No',
        'Status': markedForDeletion ? 'Marked for Deletion' : isDuplicate ? 'Keep (Newest)' : 'Keep'
      };
    });
    
    setExportData(data);
  };

  const toggleUserDeletion = (userId: string) => {
    setUsersToDelete(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
    
    // Create a separate sheet for badge breakdown
    const badgeBreakdown = calculateBadgeBreakdown();
    const badgeWorksheet = XLSX.utils.json_to_sheet(badgeBreakdown);
    XLSX.utils.book_append_sheet(workbook, badgeWorksheet, "Badge Statistics");
    
    XLSX.writeFile(workbook, "user_management_report.xlsx");
  };

  const calculateBadgeBreakdown = () => {
    const badgeMap = new Map<string, { count: number, users: string[] }>();
    
    users.forEach(user => {
      if (user.badges && Array.isArray(user.badges)) {
        user.badges.forEach(badge => {
          if (!badge) return;
          
          const key = badge.level ? `${badge.name} (${badge.level})` : badge.name;
          
          if (badgeMap.has(key)) {
            const existing = badgeMap.get(key)!;
            existing.count += 1;
            if (!existing.users.includes(user.name)) {
              existing.users.push(user.name);
            }
          } else {
            badgeMap.set(key, {
              count: 1,
              users: [user.name]
            });
          }
        });
      }
    });
    
    return Array.from(badgeMap.entries())
      .sort(([, a], [, b]) => b.count - a.count)
      .map(([badgeName, data]) => ({
        'Badge Name': badgeName,
        'Total Applications': data.count,
        'Unique Users': data.users.length,
        'User List': data.users.join(", "),
        'Category': badgeName.includes('(') ? badgeName.split('(')[0].trim() : badgeName
      }));
  };

  const exportToCSV = () => {
    const csvContent = [
      Object.keys(exportData[0]).join(","),
      ...exportData.map(row => Object.values(row).map(value => 
        `"${String(value).replace(/"/g, '""')}"`
      ).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "user_management_report.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const deleteSelectedUsers = async () => {
    if (usersToDelete.size === 0) {
      setError("Please select at least one user to delete");
      return;
    }

    setProcessing(true);
    setError(null);
    setSuccess(null);

    try {
      const usersToDeleteArray = Array.from(usersToDelete);
      const deletePromises = usersToDeleteArray.map(async (userId) => {
        try {
          const userRef = ref(db, `Awards/${userId}`);
          await remove(userRef);
          console.log(`Successfully deleted user: ${userId}`);
          return true;
        } catch (error) {
          console.error(`Error deleting user ${userId}:`, error);
          return false;
        }
      });

      const results = await Promise.all(deletePromises);
      const successfulDeletes = results.filter(result => result).length;
      
      if (successfulDeletes > 0) {
        setSuccess(`Successfully deleted ${successfulDeletes} users`);
        setUsersToDelete(new Set());
        setTimeout(() => {
          fetchUsers();
        }, 1000);
      } else {
        setError("Failed to delete any users. Please check console for errors.");
      }
    } catch (err) {
      setError("Failed to delete users");
      console.error("Error deleting users:", err);
    } finally {
      setProcessing(false);
    }
  };

  const getTotalDuplicates = () => {
    let total = 0;
    duplicateUsers.forEach(users => {
      total += users.length - 1;
    });
    return total;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
          <div className="flex gap-2">
            {exportData.length > 0 && (
              <>
                <button
                  onClick={exportToCSV}
                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded text-sm"
                >
                  Export CSV
                </button>
                <button
                  onClick={exportToExcel}
                  className="bg-green-700 hover:bg-green-800 text-white px-3 py-2 rounded text-sm"
                >
                  Export Excel
                </button>
              </>
            )}
            <Link 
              to="/bs" 
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              View Statistics
            </Link>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        {duplicateUsers.size === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-green-500 text-4xl mb-4">✓</div>
            <h2 className="text-xl font-semibold mb-2">No duplicates found!</h2>
            <p className="text-gray-600">All user records are unique.</p>
            <Link 
              to="/bs" 
              className="inline-block mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              View Badge Statistics
            </Link>
          </div>
        ) : (
          <>
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
              <p className="font-semibold">Found {duplicateUsers.size} duplicate user(s)</p>
              <p>Total duplicate records: {getTotalDuplicates()}</p>
              <p>Select which duplicate users to delete (recommended to keep the newest)</p>
            </div>

            <div className="space-y-6">
              {Array.from(duplicateUsers.entries()).map(([name, userList]) => (
                <div key={name} className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">{name}</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {userList.map((user, index) => (
                      <div 
                        key={user.id} 
                        className={`border rounded-lg p-4 transition-all ${
                          usersToDelete.has(user.id)
                            ? 'border-red-500 bg-red-50'
                            : index === 0 
                              ? 'border-green-500 bg-green-50' 
                              : 'border-gray-200'
                        }`}
                      >
                        <div className="flex items-center mb-2">
                          <input
                            type="checkbox"
                            checked={usersToDelete.has(user.id)}
                            onChange={() => toggleUserDeletion(user.id)}
                            disabled={index === 0}
                            className="mr-2 h-4 w-4 text-red-600 disabled:opacity-50"
                          />
                          <span className={`font-medium ${index === 0 ? 'text-green-700' : ''}`}>
                            {index === 0 ? '★ Newest (Keep)' : 'Delete this user'}
                          </span>
                        </div>
                        
                        <div className="text-sm space-y-1">
                          <p><span className="font-medium">Rank:</span> {user.rank}</p>
                          <p><span className="font-medium">Squad:</span> {user.squad}</p>
                          <p><span className="font-medium">Year Joined:</span> {user.yearJoined}</p>
                          <p><span className="font-medium">DOB:</span> {user.dob}</p>
                          {user.timestamp && (
                            <p><span className="font-medium">Created:</span> {new Date(user.timestamp).toLocaleString()}</p>
                          )}
                          <p><span className="font-medium">Badges:</span> {user.badges?.length || 0}</p>
                          {user.badges && user.badges.length > 0 && (
                            <div className="mt-2">
                              <p className="font-medium">Badges Applied:</p>
                              <div className="text-xs bg-gray-100 p-2 rounded max-h-20 overflow-y-auto">
                                {formatBadgesForExport(user.badges)}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">Actions</h3>
                  <p className="text-gray-600">
                    {usersToDelete.size} user(s) selected for deletion
                  </p>
                </div>
                <button
                  onClick={deleteSelectedUsers}
                  disabled={processing || usersToDelete.size === 0}
                  className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white px-6 py-2 rounded"
                >
                  {processing ? "Deleting..." : `Delete ${usersToDelete.size} Users`}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MemberManagement;