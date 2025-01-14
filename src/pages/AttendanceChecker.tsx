import  { useEffect, useState } from "react";
import { getDataFromFirebase } from "../firebase/firebaseUtils";
import { ArrowLeft, Calendar, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Parade {
  date: string;
}

interface ParadesByMonth {
  [month: string]: {
    [key: string]: Parade;
  };
}

interface AttendanceRecord {
  date: string;
  memberId: string;
  memberName: string;
  squadName: string;
  status: 'present' | 'absent' | 'excused';
  rank?: string;
}

interface Member {
  id: string;
  name: string;
  rank?: string;
  squadName: string;
  role: string;
}

interface AttendanceStats {
  totalParades: number;
  present: number;
  absent: number;
  excused: number;
  attendanceRate: number;
}

interface MemberAttendance {
  member: Member;
  stats: AttendanceStats;
}

export const TotalParadesPage = () => {
  const [parades, setParades] = useState<ParadesByMonth | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [memberStats, setMemberStats] = useState<MemberAttendance[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate=useNavigate();

  const handleBack=()=>{
    navigate(-1);
  }

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // Fetch parades
        const paradesResult = await getDataFromFirebase("parades");
        if (paradesResult.success) {
          setParades(paradesResult.data as ParadesByMonth);
        }

        // Fetch members from squads
        const squadsResult = await getDataFromFirebase("squads");
        if (squadsResult.success) {
          const allMembers: Member[] = [];
          Object.values(squadsResult.data).forEach((squad: any) => {
            // Add squad leader
            allMembers.push({
              id: `${squad.squadNumber}_${squad.squadLeader}`,
              name: squad.squadLeader,
              rank: squad.squadLeaderRank,
              squadName: squad.squadName,
              role: 'Squad Leader'
            });

            // Add assistant squad leader
            allMembers.push({
              id: `${squad.squadNumber}_${squad.assistantSquadLeader}`,
              name: squad.assistantSquadLeader,
              rank: squad.assistantSquadLeaderRank,
              squadName: squad.squadName,
              role: 'Assistant Squad Leader'
            });

            // Add regular members
            squad.members.forEach((member: any) => {
              allMembers.push({
                id: `${squad.squadNumber}_${member.name}`,
                name: member.name,
                rank: member.rank,
                squadName: squad.squadName,
                role: 'Member'
              });
            });
          });
          setMembers(allMembers);
        }

        // Fetch attendance records
        // When fetching attendance records, modify this part:
const attendanceResult = await getDataFromFirebase("attendance");
if (attendanceResult.success && attendanceResult.data) {
  // Transform and type the attendance data
  const transformedRecords: AttendanceRecord[] = Object.entries(attendanceResult.data)
    .flatMap(([id, recordData]: [string, any]) => {
      if (typeof recordData === 'object' && recordData !== null) {
        // If the record has nested data
        if ('status' in recordData) {
          return [{
            id,
            date: recordData.date || '',
            memberId: recordData.memberId || '',
            memberName: recordData.memberName || '',
            squadName: recordData.squadName || '',
            status: recordData.status as 'present' | 'absent' | 'excused',
            rank: recordData.rank
          }];
        } else {
          // Handle nested structure
          return Object.entries(recordData).map(([nestedId, nestedData]: [string, any]) => ({
            id: `${id}_${nestedId}`,
            date: nestedData.date || '',
            memberId: nestedData.memberId || '',
            memberName: nestedData.memberName || '',
            squadName: nestedData.squadName || '',
            status: nestedData.status as 'present' | 'absent' | 'excused',
            rank: nestedData.rank
          }));
        }
      }
      return [];
    });

  setAttendanceRecords(transformedRecords);
}

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  useEffect(() => {
    if (parades && members && attendanceRecords) {
      calculateMemberStats();
    }
  }, [parades, members, attendanceRecords]);

  const calculateMemberStats = () => {
    if (!parades || !members || !attendanceRecords) return;

    const totalParades = Object.values(parades).reduce((total, month) => 
      total + Object.keys(month).length, 0
    );

    const stats: MemberAttendance[] = members.map(member => {
      const memberRecords = attendanceRecords.filter(record => 
        record.memberId === member.id || 
        record.memberName === member.name
      );

      const present = memberRecords.filter(record => record.status === 'present').length;
      const absent = memberRecords.filter(record => record.status === 'absent').length;
      const excused = memberRecords.filter(record => record.status === 'excused').length;
      const attendanceRate = (present / totalParades) * 100;

      return {
        member,
        stats: {
          totalParades,
          present,
          absent,
          excused,
          attendanceRate
        }
      };
    });

    // Sort by attendance rate descending
    stats.sort((a, b) => b.stats.attendanceRate - a.stats.attendanceRate);
    setMemberStats(stats);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Calendar className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-600">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
       <button
        onClick={handleBack}
        className="mb-4 flex items-center text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-5 h-5 mr-1" />
        Back
      </button>
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 bg-gray-50 border-b">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Calendar className="mr-2" />
            Attendance Statistics
          </h1>
        </div>

        <div className="p-6">
          {parades && (
            <div className="mb-6">
              <p className="text-lg text-gray-700">
                Total number of parades:{" "}
                <span className="font-semibold">
                  {Object.values(parades).reduce((total, month) => 
                    total + Object.keys(month).length, 0
                  )}
                </span>
              </p>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Member
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Squad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Present
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Absent
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Excused
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Attendance Rate
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {memberStats.map(({ member, stats }) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="h-5 w-5 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{member.name}</div>
                          {member.rank && (
                            <div className="text-sm text-gray-500">{member.rank}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {member.squadName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {member.role}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-green-600">
                      {stats.present}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-red-600">
                      {stats.absent}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-yellow-600">
                      {stats.excused}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                      {stats.attendanceRate.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TotalParadesPage;