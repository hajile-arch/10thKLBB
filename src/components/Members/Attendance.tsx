import { useState, useEffect } from "react";
import { getDatabase, ref, get, set } from "firebase/database";
import app from "../../firebase/firebase";
import { Member, MemberStatus, AttendanceStatus } from "../../enum";
import { useNavigate } from "react-router-dom";

interface AttendanceRecord {
  memberId: string;
  status: AttendanceStatus;
  notes?: string;
}

const AttendancePage = () => {
  const CURRENT_YEAR = new Date().getFullYear();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [paradeDates, setParadeDates] = useState<string[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [attendance, setAttendance] = useState<{
    [memberId: string]: AttendanceRecord;
  }>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | AttendanceStatus>(
    "all",
  );
  const [filterSquad, setFilterSquad] = useState<"all" | number>("all");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
const [squadLeaders, setSquadLeaders] = useState<
  Record<number, { leader?: string; assistants: string[] }>
>({});
  useEffect(() => {
    loadParadeDates();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      loadAttendanceData();
    }
  }, [selectedDate, filterSquad]);

  const loadParadeDates = async () => {
    try {
      setLoading(true);
      const db = getDatabase(app);

      // Load parade dates from parades/{month}/{dateId}
      const paradesSnap = await get(ref(db, "parades"));

      if (paradesSnap.exists()) {
        const paradesData = paradesSnap.val();
        const dates: string[] = [];

        // Loop through months (January, February, etc.)
        Object.values(paradesData).forEach((monthData: any) => {
          // Loop through dates in each month
          Object.values(monthData).forEach((dateEntry: any) => {
            if (dateEntry.date) {
              dates.push(dateEntry.date);
            }
          });
        });

        // Sort dates
        dates.sort();
        setParadeDates(dates);

        // Set default to most recent date or today
        if (dates.length > 0) {
          const today = new Date().toISOString().split("T")[0];
          const closestDate =
            dates.find((d) => d >= today) || dates[dates.length - 1];
          setSelectedDate(closestDate);
        }
      } else {
        // Fallback to today if no parade dates
        setSelectedDate(new Date().toISOString().split("T")[0]);
      }
    } catch (error) {
      console.error("Error loading parade dates:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadAttendanceData = async () => {
    try {
      const db = getDatabase(app);
      const squadsSnap = await get(ref(db, `squads/${CURRENT_YEAR}`));
      if (squadsSnap.exists()) {
        const squadsData = squadsSnap.val();
const leadershipMap: Record<number, { leader?: string; assistants: string[] }> = {};

Object.values(squadsData).forEach((squad: any) => {
  const squadNumber = squad.squadNumber;

  leadershipMap[squadNumber] = {
    leader: squad.squadLeaderId,
    assistants: squad.assistantSquadLeaderIds || [], // now an array
  };
});

setSquadLeaders(leadershipMap);
      }
      let membersList: Member[] = [];
      // Load members based on squad filter
      const membersSnap = await get(ref(db, "members"));
      if (membersSnap.exists()) {
        const membersData = membersSnap.val();
        membersList = Object.entries(membersData)
          .map(
            ([id, data]: [string, any]) =>
              ({
                ...data,
                id,
              }) as Member,
          )
          .filter((m) => {
            // Filter by active status
            if (m.status !== MemberStatus.ACTIVE) return false;

            // Filter by squad
            if (filterSquad !== "all") {
              if (filterSquad === 0) {
                return !m.currentSquad;
              }
              return m.currentSquad === filterSquad;
            }
            return true;
          })
          .sort((a, b) => {
            // Sort by squad first, then by rank, then by name
            if (a.currentSquad !== b.currentSquad) {
              return (a.currentSquad || 999) - (b.currentSquad || 999);
            }
            const rankOrder = ["SGT", "CPL", "LCPL", "PTE", "REC"];
            const rankDiff =
              rankOrder.indexOf(a.rank) - rankOrder.indexOf(b.rank);
            if (rankDiff !== 0) return rankDiff;
            return a.name.localeCompare(b.name);
          });

        setMembers(membersList);
      }

      // Load attendance for selected date
      const dateKey = selectedDate.replace(/-/g, "_");
      const attendanceSnap = await get(
        ref(db, `attendance/${CURRENT_YEAR}/${dateKey}`),
      );

      if (attendanceSnap.exists()) {
        const dayData = attendanceSnap.val();

        // Merge all squad records into single attendance object
        const mergedAttendance: { [key: string]: AttendanceRecord } = {};
        Object.keys(dayData).forEach((key) => {
          if (key !== "date" && typeof dayData[key] === "object") {
            Object.entries(dayData[key]).forEach(([memberId, record]: any) => {
              mergedAttendance[memberId] = {
                memberId,
                status: record.status,
                ...(record.notes ? { notes: record.notes } : {}),
              };
            });
          }
        });

        setAttendance(mergedAttendance);
      } else {
        // Initialize with all members as absent
        const initialAttendance: { [key: string]: AttendanceRecord } = {};
        membersList.forEach((member: Member) => {
          initialAttendance[member.id] = {
            memberId: member.id,
            status: "absent",
          };
        });
        setAttendance(initialAttendance);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
    // Load squad leadership data for current year
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const db = getDatabase(app);
      const dateKey = selectedDate.replace(/-/g, "_");

      // Group attendance by squad
      const squadGroups: {
        [squad: string]: { [memberId: string]: AttendanceRecord };
      } = {};

      members.forEach((member) => {
        const record = attendance[member.id];
        const cleanRecord: AttendanceRecord = {
          memberId: record.memberId,
          status: record.status,
          ...(record.notes !== undefined && record.notes !== ""
            ? { notes: record.notes }
            : {}),
        };

        if (record) {
          const squadKey = member.currentSquad
            ? `squad${member.currentSquad}`
            : "unassigned";
          if (!squadGroups[squadKey]) {
            squadGroups[squadKey] = {};
          }
          squadGroups[squadKey][member.id] = cleanRecord;
        }
      });

      const attendanceData: any = {
        date: selectedDate,
        ...squadGroups,
      };

      await set(
        ref(db, `attendance/${CURRENT_YEAR}/${dateKey}`),
        attendanceData,
      );
      alert("Attendance saved successfully!");
    } catch (error) {
      console.error("Error saving attendance:", error);
      alert("Error saving attendance. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const updateAttendance = (memberId: string, status: AttendanceStatus) => {
    setAttendance((prev) => ({
      ...prev,
      [memberId]: {
        ...prev[memberId],
        memberId,
        status,
      },
    }));
  };

  const updateNotes = (memberId: string, notes: string) => {
    setAttendance((prev) => ({
      ...prev,
      [memberId]: {
        ...prev[memberId],
        memberId,
        ...(notes.trim() ? { notes } : {}),
      },
    }));
  };

  const markAllAs = (status: AttendanceStatus) => {
    const confirmed = window.confirm(
      `Mark all visible members as ${status}? This will overwrite current attendance.`,
    );
    if (!confirmed) return;

    const updated: { [key: string]: AttendanceRecord } = { ...attendance };
    getFilteredMembers().forEach((member) => {
      updated[member.id] = {
        memberId: member.id,
        status,
        notes: attendance[member.id]?.notes,
      };
    });
    setAttendance(updated);
  };

  const getFilteredMembers = () => {
    let filtered = members;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.name.toLowerCase().includes(query) ||
          m.rank.toLowerCase().includes(query),
      );
    }

    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter(
        (m) => attendance[m.id]?.status === filterStatus,
      );
    }

    return filtered;
  };

  const getStats = () => {
    const present = members.filter(
      (m) => attendance[m.id]?.status === "present",
    ).length;
    const absent = members.filter(
      (m) => attendance[m.id]?.status === "absent",
    ).length;
    const excused = members.filter(
      (m) => attendance[m.id]?.status === "excused",
    ).length;
    const total = members.length;

    return { present, absent, excused, total };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-xl">Loading...</div>
        </div>
      </div>
    );
  }

  const stats = getStats();
  const filteredMembers = getFilteredMembers();
  const rankPriority: Record<string, number> = {
    Sergeant: 1,
    Corporal: 2,
    "Lance Corporal": 3,
    Private: 4,
    Recruit: 5,
  };

  const sortedMembers = [...filteredMembers].sort((a, b) => {
    // 1️⃣ Sort by squad first
    const squadA = a.currentSquad ?? 999;
    const squadB = b.currentSquad ?? 999;

    if (squadA !== squadB) {
      return squadA - squadB;
    }

    // 2️⃣ Get leadership info for this squad
    const leadership = squadLeaders[squadA];

    const aIsSL = leadership?.leader === a.id;
    const bIsSL = leadership?.leader === b.id;

const aIsASL = leadership?.assistants?.includes(a.id);
const bIsASL = leadership?.assistants?.includes(b.id);

    // 3️⃣ SL always first
    if (aIsSL) return -1;
    if (bIsSL) return 1;

    // 4️⃣ ASL second
    if (aIsASL) return -1;
    if (bIsASL) return 1;

    // 5️⃣ Then by rank
    const rankA = rankPriority[a.rank] ?? 999;
    const rankB = rankPriority[b.rank] ?? 999;

    if (rankA !== rankB) {
      return rankA - rankB;
    }

    // 6️⃣ Finally by name (clean alphabetical inside same rank)
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                Attendance
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Year {CURRENT_YEAR}
              </p>
            </div>
            <button
              onClick={() => navigate("/attendance/stats")}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-md"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <span className="hidden sm:inline">View Stats</span>
            </button>
          </div>
        </div>

        {/* Date & Squad Selection - Improved UI */}
        <div className="bg-white rounded-xl shadow p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Date Selection Card */}
            <div className="border-2 border-blue-100 rounded-xl p-4 bg-gradient-to-br from-blue-50 to-white">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <label className="text-sm font-semibold text-gray-900">
                  Select Parade Date
                </label>
              </div>
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 font-medium shadow-sm hover:border-gray-400 transition"
              >
                <option value="">-- Select Date --</option>
                {paradeDates.map((date) => (
                  <option key={date} value={date}>
                    {new Date(date).toLocaleDateString("en-US", {
                      weekday: "short",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </option>
                ))}
              </select>
              {paradeDates.length === 0 && (
                <div className="mt-3 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <svg
                    className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="text-xs text-amber-800">
                    No parade dates found. Please add dates in Parade Settings.
                  </p>
                </div>
              )}
            </div>

            {/* Squad Selection Card */}
            <div className="border-2 border-purple-100 rounded-xl p-4 bg-gradient-to-br from-purple-50 to-white">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-purple-600 p-2 rounded-lg">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <label className="text-sm font-semibold text-gray-900">
                  Select Squad
                </label>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setFilterSquad("all")}
                  className={`px-3 py-2 rounded-lg text-sm font-medium border-2 transition ${
                    filterSquad === "all"
                      ? "bg-purple-600 text-white border-purple-600 shadow-md"
                      : "bg-white text-gray-700 border-gray-300 hover:border-purple-300"
                  }`}
                >
                  All
                </button>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                  <button
                    key={num}
                    onClick={() => setFilterSquad(num)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium border-2 transition ${
                      filterSquad === num
                        ? "bg-purple-600 text-white border-purple-600 shadow-md"
                        : "bg-white text-gray-700 border-gray-300 hover:border-purple-300"
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Stats - Responsive Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mt-4 pt-4 border-t">
            <div className="text-center p-2 sm:p-3 bg-gray-50 rounded-lg">
              <div className="text-xl sm:text-2xl font-bold text-gray-800">
                {stats.total}
              </div>
              <div className="text-xs text-gray-600">Total</div>
            </div>
            <div className="text-center p-2 sm:p-3 bg-green-50 rounded-lg">
              <div className="text-xl sm:text-2xl font-bold text-green-700">
                {stats.present}
              </div>
              <div className="text-xs text-green-600">Present</div>
            </div>
            <div className="text-center p-2 sm:p-3 bg-red-50 rounded-lg">
              <div className="text-xl sm:text-2xl font-bold text-red-700">
                {stats.absent}
              </div>
              <div className="text-xs text-red-600">Absent</div>
            </div>
            <div className="text-center p-2 sm:p-3 bg-yellow-50 rounded-lg">
              <div className="text-xl sm:text-2xl font-bold text-yellow-700">
                {stats.excused}
              </div>
              <div className="text-xs text-yellow-600">Excused</div>
            </div>
          </div>

          {/* Quick Actions - Mobile Friendly */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-2 mt-4 pt-4 border-t">
            <button
              onClick={() => markAllAs("present")}
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition"
            >
              Mark All Present
            </button>
            <button
              onClick={() => markAllAs("absent")}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition"
            >
              Mark All Absent
            </button>
            <button
              onClick={() => markAllAs("excused")}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm hover:bg-yellow-700 transition"
            >
              Mark All Excused
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow p-4 mb-4 sm:mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="present">Present Only</option>
              <option value="absent">Absent Only</option>
              <option value="excused">Excused Only</option>
            </select>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            Showing {filteredMembers.length} of {members.length} members
          </div>
        </div>

        {/* Attendance List - Desktop Table */}
        <div className="hidden md:block bg-white rounded-xl shadow overflow-hidden mb-6">
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredMembers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      {selectedDate
                        ? "No members found matching your filters"
                        : "Please select a parade date"}
                    </td>
                  </tr>
                ) : (
                  sortedMembers.map((member) => {
                    const leadership = squadLeaders[member.currentSquad ?? -1];

                    const isSL = leadership?.leader === member.id;
                    const isASL = leadership?.assistants?.includes(member.id);
                    const record = attendance[member.id] || {
                      memberId: member.id,
                      status: "absent",
                    };
                    const leadershipTitles: string[] = [];
                    if (
                      member.id === squadLeaders[member.currentSquad!]?.leader
                    ) {
                      leadershipTitles.push("SL");
                    }
                    if (squadLeaders[member.currentSquad!]?.assistants?.includes(member.id)) {
  leadershipTitles.push("ASL");
} {
                      leadershipTitles.push("ASL");
                    }

                    return (
                      <tr key={member.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div
                            onClick={() => navigate(`/members/${member.id}`)}
                            className="cursor-pointer"
                          >
                            <div className="font-medium text-gray-900 flex items-center gap-2">
                              {member.name}

                              {isSL && (
                                <span className="text-xs font-semibold bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                                  SL
                                </span>
                              )}

                              {isASL && (
  <span className="text-xs font-semibold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
    ASL
  </span>
)}
                            </div>
                            <div className="text-sm text-gray-600">
                              {member.rank} • Squad{" "}
                              {member.currentSquad ?? "Unassigned"}
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-600">
                            {member.rank}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-600">
                            {member.currentSquad
                              ? `Squad ${member.currentSquad}`
                              : "Unassigned"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                updateAttendance(member.id, "present")
                              }
                              className={`px-3 py-1 rounded-md text-sm font-medium border transition ${
                                record.status === "present"
                                  ? "bg-green-600 text-white border-green-600"
                                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                              }`}
                            >
                              Present
                            </button>
                            <button
                              onClick={() =>
                                updateAttendance(member.id, "absent")
                              }
                              className={`px-3 py-1 rounded-md text-sm font-medium border transition ${
                                record.status === "absent"
                                  ? "bg-red-600 text-white border-red-600"
                                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                              }`}
                            >
                              Absent
                            </button>
                            <button
                              onClick={() =>
                                updateAttendance(member.id, "excused")
                              }
                              className={`px-3 py-1 rounded-md text-sm font-medium border transition ${
                                record.status === "excused"
                                  ? "bg-yellow-600 text-white border-yellow-600"
                                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                              }`}
                            >
                              Excused
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="text"
                            value={record.notes || ""}
                            onChange={(e) =>
                              updateNotes(member.id, e.target.value)
                            }
                            placeholder="Add notes..."
                            className="w-full px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Attendance List - Mobile Cards */}
        <div className="md:hidden space-y-3 mb-6">
          {filteredMembers.length === 0 ? (
            <div className="bg-white rounded-xl shadow p-6 text-center text-gray-500">
              {selectedDate
                ? "No members found matching your filters"
                : "Please select a parade date"}
            </div>
          ) : (
            sortedMembers.map((member) => {
              const leadership = squadLeaders[member.currentSquad ?? -1];

              const isSL = leadership?.leader === member.id;
              const isASL = leadership?.assistants?.includes(member.id);
              const record = attendance[member.id] || {
                memberId: member.id,
                status: "absent",
              };
              const leadershipTitles: string[] = [];
              if (member.id === squadLeaders[member.currentSquad!]?.leader) {
                leadershipTitles.push("SL");
              }
              if (squadLeaders[member.currentSquad!]?.assistants?.includes(member.id)) {
  leadershipTitles.push("ASL");
}
              return (
                <div key={member.id} className="bg-white rounded-xl shadow p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <button
                        type="button"
                        onClick={() => navigate(`/members/${member.id}`)}
                        className="text-left group"
                      >
                        <div className="font-medium text-blue-600 group-hover:underline flex items-center gap-2">
                          {member.name}

                          {isSL && (
                            <span className="text-xs font-semibold bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                              SL
                            </span>
                          )}

                          {isASL && (
  <span className="text-xs font-semibold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
    ASL
  </span>
)}
                        </div>
                        <div className="text-sm text-gray-600">
                          {member.rank} • Squad{" "}
                          {member.currentSquad ?? "Unassigned"}
                        </div>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={() => updateAttendance(member.id, "present")}
                          className={`px-3 py-2 rounded-lg text-sm font-medium border transition ${
                            record.status === "present"
                              ? "bg-green-600 text-white border-green-600"
                              : "bg-white text-gray-700 border-gray-300"
                          }`}
                        >
                          Present
                        </button>
                        <button
                          onClick={() => updateAttendance(member.id, "absent")}
                          className={`px-3 py-2 rounded-lg text-sm font-medium border transition ${
                            record.status === "absent"
                              ? "bg-red-600 text-white border-red-600"
                              : "bg-white text-gray-700 border-gray-300"
                          }`}
                        >
                          Absent
                        </button>
                        <button
                          onClick={() => updateAttendance(member.id, "excused")}
                          className={`px-3 py-2 rounded-lg text-sm font-medium border transition ${
                            record.status === "excused"
                              ? "bg-yellow-600 text-white border-yellow-600"
                              : "bg-white text-gray-700 border-gray-300"
                          }`}
                        >
                          Excused
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Notes
                      </label>
                      <input
                        type="text"
                        value={record.notes || ""}
                        onChange={(e) => updateNotes(member.id, e.target.value)}
                        placeholder="Add notes..."
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Save Button - Sticky on Mobile */}
        <div className="sticky bottom-4 md:static md:flex md:justify-end">
          <button
            onClick={handleSave}
            disabled={saving || !selectedDate}
            className="w-full md:w-auto px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition shadow-lg"
          >
            {saving ? "Saving..." : "Save Attendance"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttendancePage;
