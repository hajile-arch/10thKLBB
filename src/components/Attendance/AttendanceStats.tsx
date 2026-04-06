import { useState, useEffect } from "react";
import { getDatabase, ref, get } from "firebase/database";
import app from "../../firebase/firebase";
import {
  Member,
  MemberStatus,
  AttendanceStatus,
  MemberStats,
} from "../../enum";
import { useNavigate } from "react-router-dom";

type AttendanceRange = "all" | "excellent" | "good" | "fair" | "poor";

const AttendanceStatsPage = () => {
  const CURRENT_YEAR = new Date().getFullYear();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<Member[]>([]);
  const [stats, setStats] = useState<MemberStats[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRange, setFilterRange] = useState<AttendanceRange>("all");
  const [filterSquad, setFilterSquad] = useState<"all" | number>("all");
  const [sortBy, setSortBy] = useState<"name" | "rate" | "present">("rate");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const db = getDatabase(app);

      // Load all active members
      const membersSnap = await get(ref(db, "members"));
      if (!membersSnap.exists()) {
        setLoading(false);
        return;
      }

      const membersData = membersSnap.val();
      const membersList = Object.entries(membersData)
        .map(
          ([id, data]: [string, any]) =>
            ({
              ...data,
              id,
            } as Member)
        )
        .filter((m) => m.status === MemberStatus.ACTIVE);

      setMembers(membersList);

      // Load all attendance records for the year
      const attendanceSnap = await get(ref(db, `attendance/${CURRENT_YEAR}`));

      if (!attendanceSnap.exists()) {
        // No attendance data yet
        const emptyStats = membersList.map((member) => ({
          member,
          totalParades: 0,
          present: 0,
          absent: 0,
          excused: 0,
          attendanceRate: 0,
        }));
        setStats(emptyStats);
        setLoading(false);
        return;
      }

      const attendanceData = attendanceSnap.val();
      const memberStatsMap: { [memberId: string]: MemberStats } = {};

      // Initialize stats for all members
      membersList.forEach((member) => {
        memberStatsMap[member.id] = {
          member,
          totalParades: 0,
          present: 0,
          absent: 0,
          excused: 0,
          attendanceRate: 0,
        };
      });

      // Process all attendance records
      Object.values(attendanceData).forEach((dayData: any) => {
        // Skip if not an object (like date field)
        if (typeof dayData !== "object") return;

        // Loop through all squad groups
        Object.keys(dayData).forEach((key) => {
          if (key === "date") return;

          const squadRecords = dayData[key];
          if (typeof squadRecords !== "object") return;

          // Process each member's record
          Object.entries(squadRecords).forEach(
            ([memberId, record]: [string, any]) => {
              if (memberStatsMap[memberId]) {
                memberStatsMap[memberId].totalParades++;

                if (record.status === "present") {
                  memberStatsMap[memberId].present++;
                } else if (record.status === "absent") {
                  memberStatsMap[memberId].absent++;
                } else if (record.status === "excused") {
                  memberStatsMap[memberId].excused++;
                }
              }
            }
          );
        });
      });

      // Calculate attendance rates
      const statsArray = Object.values(memberStatsMap).map((stat) => {
        const rate =
          stat.totalParades > 0 ? (stat.present / stat.totalParades) * 100 : 0;
        return {
          ...stat,
          attendanceRate: Math.round(rate * 100) / 100, // Round to 2 decimal places
        };
      });

      setStats(statsArray);
    } catch (error) {
      console.error("Error loading attendance stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const getAttendanceRangeLabel = (rate: number): string => {
    if (rate >= 96) return "Excellent";
    if (rate >= 90) return "Good";
    if (rate >= 80) return "Fair";
    return "Poor";
  };

  const getAttendanceRangeColor = (rate: number): string => {
    if (rate >= 96) return "bg-green-100 text-green-800 border-green-300";
    if (rate >= 90) return "bg-blue-100 text-blue-800 border-blue-300";
    if (rate >= 80) return "bg-yellow-100 text-yellow-800 border-yellow-300";
    return "bg-red-100 text-red-800 border-red-300";
  };

  const getFilteredAndSortedStats = () => {
    let filtered = stats;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.member.name.toLowerCase().includes(query) ||
          s.member.rank.toLowerCase().includes(query)
      );
    }

    // Filter by attendance range
    if (filterRange !== "all") {
      filtered = filtered.filter((s) => {
        if (filterRange === "excellent") return s.attendanceRate >= 96;
        if (filterRange === "good")
          return s.attendanceRate >= 90 && s.attendanceRate < 96;
        if (filterRange === "fair")
          return s.attendanceRate >= 80 && s.attendanceRate < 90;
        if (filterRange === "poor") return s.attendanceRate < 80;
        return true;
      });
    }

    // Filter by squad
    if (filterSquad !== "all") {
      filtered = filtered.filter((s) => {
        if (filterSquad === 0) return !s.member.currentSquad;
        return s.member.currentSquad === filterSquad;
      });
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === "name") {
        return a.member.name.localeCompare(b.member.name);
      } else if (sortBy === "rate") {
        return b.attendanceRate - a.attendanceRate; // Descending
      } else if (sortBy === "present") {
        return b.present - a.present; // Descending
      }
      return 0;
    });

    return filtered;
  };

  const getOverallStats = () => {
    const excellent = stats.filter((s) => s.attendanceRate >= 96).length;
    const good = stats.filter(
      (s) => s.attendanceRate >= 90 && s.attendanceRate < 96
    ).length;
    const fair = stats.filter(
      (s) => s.attendanceRate >= 80 && s.attendanceRate < 90
    ).length;
    const poor = stats.filter((s) => s.attendanceRate < 80).length;
    const avgRate =
      stats.length > 0
        ? stats.reduce((sum, s) => sum + s.attendanceRate, 0) / stats.length
        : 0;

    return {
      excellent,
      good,
      fair,
      poor,
      avgRate: Math.round(avgRate * 100) / 100,
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-xl">Loading statistics...</div>
        </div>
      </div>
    );
  }

  const filteredStats = getFilteredAndSortedStats();
  const overallStats = getOverallStats();

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={() => navigate("/attendance")}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition shadow-sm"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back
          </button>

          <div>
            <h1 className="text-3xl font-bold">Attendance Statistics</h1>
            <p className="text-gray-600">Year {CURRENT_YEAR}</p>
          </div>
        </div>

        {/* Overall Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
          <div className="bg-white rounded-xl shadow p-4 text-center">
            <div className="text-2xl font-bold text-gray-800">
              {stats.length}
            </div>
            <div className="text-xs text-gray-600">Total Members</div>
          </div>
          <div className="bg-green-50 rounded-xl shadow p-4 text-center border-2 border-green-200">
            <div className="text-2xl font-bold text-green-700">
              {overallStats.excellent}
            </div>
            <div className="text-xs text-green-600">Excellent (96-100%)</div>
          </div>
          <div className="bg-blue-50 rounded-xl shadow p-4 text-center border-2 border-blue-200">
            <div className="text-2xl font-bold text-blue-700">
              {overallStats.good}
            </div>
            <div className="text-xs text-blue-600">Good (90-95%)</div>
          </div>
          <div className="bg-yellow-50 rounded-xl shadow p-4 text-center border-2 border-yellow-200">
            <div className="text-2xl font-bold text-yellow-700">
              {overallStats.fair}
            </div>
            <div className="text-xs text-yellow-600">Fair (80-89%)</div>
          </div>
          <div className="bg-red-50 rounded-xl shadow p-4 text-center border-2 border-red-200">
            <div className="text-2xl font-bold text-red-700">
              {overallStats.poor}
            </div>
            <div className="text-xs text-red-600">Poor (&lt;80%)</div>
          </div>
        </div>

        {/* Average Rate */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow p-4 mb-6 text-white text-center">
          <div className="text-sm font-medium mb-1">
            Overall Average Attendance Rate
          </div>
          <div className="text-4xl font-bold">{overallStats.avgRate}%</div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or rank..."
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            {/* Range Filter */}
            <select
              value={filterRange}
              onChange={(e) =>
                setFilterRange(e.target.value as AttendanceRange)
              }
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Ranges</option>
              <option value="excellent">Excellent (96-100%)</option>
              <option value="good">Good (90-95%)</option>
              <option value="fair">Fair (80-89%)</option>
              <option value="poor">Poor (&lt;80%)</option>
            </select>

            {/* Squad Filter */}
            <select
              value={filterSquad}
              onChange={(e) =>
                setFilterSquad(
                  e.target.value === "all" ? "all" : parseInt(e.target.value)
                )
              }
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Squads</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                <option key={num} value={num}>
                  Squad {num}
                </option>
              ))}
              <option value="0">Unassigned</option>
            </select>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="rate">Sort by Rate (High to Low)</option>
              <option value="name">Sort by Name (A-Z)</option>
              <option value="present">Sort by Days Present</option>
            </select>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            Showing {filteredStats.length} of {stats.length} members
          </div>
        </div>

        {/* Stats Table - Desktop */}
        <div className="hidden md:block bg-white rounded-xl shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Member
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Squad
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Parades
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Present
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Absent
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Excused
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Attendance Rate
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredStats.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      No members found matching your filters
                    </td>
                  </tr>
                ) : (
                  filteredStats.map((stat) => (
                    <tr key={stat.member.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">
                          {stat.member.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">
                          {stat.member.rank}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">
                          {stat.member.currentSquad
                            ? `Squad ${stat.member.currentSquad}`
                            : "Unassigned"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-sm font-medium text-gray-900">
                          {stat.totalParades}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-sm font-medium text-green-600">
                          {stat.present}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-sm font-medium text-red-600">
                          {stat.absent}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-sm font-medium text-yellow-600">
                          {stat.excused}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-lg font-bold text-gray-900">
                          {stat.attendanceRate}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${getAttendanceRangeColor(
                            stat.attendanceRate
                          )}`}
                        >
                          {getAttendanceRangeLabel(stat.attendanceRate)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stats Cards - Mobile */}
        <div className="md:hidden space-y-3">
          {filteredStats.length === 0 ? (
            <div className="bg-white rounded-xl shadow p-6 text-center text-gray-500">
              No members found matching your filters
            </div>
          ) : (
            filteredStats.map((stat) => (
              <div
                key={stat.member.id}
                className="bg-white rounded-xl shadow p-4"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-medium text-gray-900">
                      {stat.member.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {stat.member.rank} •{" "}
                      {stat.member.currentSquad
                        ? `Squad ${stat.member.currentSquad}`
                        : "Unassigned"}
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium border ${getAttendanceRangeColor(
                      stat.attendanceRate
                    )}`}
                  >
                    {getAttendanceRangeLabel(stat.attendanceRate)}
                  </span>
                </div>

                <div className="mb-3">
                  <div className="text-3xl font-bold text-gray-900 text-center">
                    {stat.attendanceRate}%
                  </div>
                  <div className="text-xs text-gray-500 text-center">
                    Attendance Rate
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 text-center">
                  <div>
                    <div className="text-lg font-semibold text-gray-900">
                      {stat.totalParades}
                    </div>
                    <div className="text-xs text-gray-600">Total</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-green-600">
                      {stat.present}
                    </div>
                    <div className="text-xs text-gray-600">Present</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-red-600">
                      {stat.absent}
                    </div>
                    <div className="text-xs text-gray-600">Absent</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-yellow-600">
                      {stat.excused}
                    </div>
                    <div className="text-xs text-gray-600">Excused</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceStatsPage;
