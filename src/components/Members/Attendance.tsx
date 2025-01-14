import React, { useState, useEffect } from 'react';
import { getDataFromFirebase, uploadToFirebase } from '../../firebase/firebaseUtils';
import { AttendanceRecord, Member, AttendanceStats, ParadeDate,MonthlyParades } from '../../types';
import { SquadSelector } from '../Attendance/SquadSelector';
import { AttendanceTable } from '../Attendance/AttendanceTable';
import { ArrowLeft, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FirebaseAttendanceData {
  [key: string]: {
    [key: string]: {
      date?: string;
      memberId?: string;
      memberName?: string;
      squadName?: string;
      status: 'present' | 'absent' | 'excused';
      rank?: string;
    };
  } | {
    date?: string;
    memberId?: string;
    memberName?: string;
    squadName?: string;
    status: 'present' | 'absent' | 'excused';
    rank?: string;
  };
}

const ErrorAlert: React.FC<{ message: string }> = ({ message }) => (
  <div className="bg-red-50 border-l-4 border-red-400 p-4 m-6">
    <div className="flex">
      <div className="flex-shrink-0">
        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      </div>
      <div className="ml-3">
        <p className="text-sm text-red-700">{message}</p>
      </div>
    </div>
  </div>
);

const AttendancePage: React.FC = () => {
  const [selectedSquad, setSelectedSquad] = useState<string>('all');
  const [members, setMembers] = useState<Member[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<AttendanceStats>({
    present: 0,
    absent: 0,
    excused: 0,
    total: 0,
  });
  const [paradeDates, setParadeDates] = useState<ParadeDate[]>([]);
  const navigate=useNavigate();

  const handleBack=()=>{
    navigate(-1);
  }


  useEffect(() => {
    fetchSquadsAndMembers();
    fetchAttendanceRecords();
    fetchParadeDates();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [attendanceRecords, selectedSquad, selectedDate]);

  const fetchSquadsAndMembers = async () => {
    try {
      setError(null);
      const response = await getDataFromFirebase('squads');
      if (response.success && response.data) {
        const squadsArray = Object.entries(response.data).map(([, squadData]: [string, any]) => {
          const { squadName, squadNumber, members, squadLeader, assistantSquadLeader, ...rest } = squadData;

          const membersWithRole = members.map((member: any) => ({
            ...member,
            id: `${squadNumber}_${member.name.replace(/\s+/g, '_')}`,
            role: 'Member',
            squadNumber,
            squadName,
          }));

          const squadLeaderMember = {
            id: `${squadNumber}_${squadLeader.replace(/\s+/g, '_')}`,
            name: squadLeader,
            role: 'Squad Leader',
            squadName,
            squadNumber,
            rank: rest.squadLeaderRank || 'Unknown',
            squadLeaderRank: rest.squadLeaderRank,
          };

          const aslMember = {
            id: `${squadNumber}_${assistantSquadLeader.replace(/\s+/g, '_')}`,
            name: assistantSquadLeader,
            role: 'Assistant Squad Leader',
            squadName,
            squadNumber,
            rank: rest.assistantSquadLeaderRank || 'Unknown',
            assistantSquadLeaderRank: rest.assistantSquadLeaderRank,
          };

          return {
            squadName,
            squadNumber,
            members: [squadLeaderMember, aslMember, ...membersWithRole],
          };
        });

        const allMembers = squadsArray.flatMap((squad) => squad.members);
        setMembers(allMembers);
      } else {
        throw new Error(response.message || 'Failed to fetch squads data');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch squads data';
      setError(errorMessage);
      console.error('Error fetching squads:', err);
    }
  };

  const getAttendanceMap = () => {
    return attendanceRecords
      .filter(record => record.date === selectedDate)
      .reduce((acc, record) => {
        if (record.memberId && record.status) {
          acc[record.memberId] = record;
        }
        return acc;
      }, {} as Record<string, AttendanceRecord>);
  };
  
  const fetchAttendanceRecords = async () => {
    try {
      setError(null);
      setLoading(true);
      const response = await getDataFromFirebase('attendance');
      
      if (response.success && response.data) {
        const firebaseData = response.data as FirebaseAttendanceData;
        
        // Transform the nested data structure with proper typing
        const records = Object.entries(firebaseData).flatMap(([id, data]) => {
          // Handle nested data structure
          if (typeof data === 'object' && data !== null) {
            if ('status' in data) {
              // Handle direct data structure
              return [{
                id,
                date: data.date || id.split('_')[0],
                memberId: data.memberId || `${id.split('_')[1]}_${id.split('_')[2]}`,
                memberName: data.memberName || id.split('_')[2],
                squadName: data.squadName || id.split('_')[1],
                status: data.status,
                rank: data.rank
              }] as AttendanceRecord[];
            } else {
              // Handle nested object structure
              return Object.entries(data).map(([nestedId, nestedData]) => ({
                id: `${id}_${nestedId}`,
                date: nestedData.date || id.split('_')[0],
                memberId: nestedData.memberId || `${id.split('_')[1]}_${id.split('_')[2]}`,
                memberName: nestedData.memberName || id.split('_')[2],
                squadName: nestedData.squadName || id.split('_')[1],
                status: nestedData.status,
                rank: nestedData.rank
              })) as AttendanceRecord[];
            }
          }
          return [] as AttendanceRecord[];
        }).filter((record): record is AttendanceRecord => Boolean(record.status));

        console.log('Transformed Records:', records);
        setAttendanceRecords(records);
      } else {
        throw new Error(response.message || 'Failed to fetch attendance records');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch attendance records';
      setError(errorMessage);
      console.error('Error fetching attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const relevantRecords = attendanceRecords.filter(
      (record) =>
        record.date === selectedDate &&
        (selectedSquad === 'all' || record.squadName === `Squad ${selectedSquad}`)
    );

    const newStats = relevantRecords.reduce(
      (acc, record) => {
        if (record.status in acc) {
          acc[record.status as keyof AttendanceStats]++;
        }
        acc.total = relevantRecords.length;
        return acc;
      },
      { present: 0, absent: 0, excused: 0, total: 0 }
    );

    setStats(newStats);
  };

  const handleAttendanceChange = async (
    memberId: string,
    status: 'present' | 'absent' | 'excused'
  ) => {
    try {
      setError(null);
      const member = members.find(m => m.id === memberId);
      if (!member) {
        throw new Error(`Member not found: ${memberId}`);
      }
  
      const newRecord: AttendanceRecord = {
        date: selectedDate,
        memberId: memberId,
        status: status,
        memberName: member.name,
        squadName: member.squadName || '',
        rank: member.rank,
      };
  
      // Create consistent record ID
      const recordId = `${selectedDate}_${member.squadName || ''}_${member.name}`;
      const attendancePath = `attendance/${recordId}`;
      
      const response = await uploadToFirebase(attendancePath, newRecord);
      
      if (!response.success) {
        throw new Error('Failed to update attendance in Firebase');
      }
  
      // Update local state with consistent format
      setAttendanceRecords(prevRecords => {
        const existingIndex = prevRecords.findIndex(
          record => record.memberId === memberId && record.date === selectedDate
        );
  
        if (existingIndex >= 0) {
          const updatedRecords = [...prevRecords];
          updatedRecords[existingIndex] = { ...newRecord, id: recordId };
          return updatedRecords;
        } else {
          return [...prevRecords, { ...newRecord, id: recordId }];
        }
      });
  
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update attendance';
      setError(errorMessage);
      console.error('Error updating attendance:', err);
    }
  };

  const filteredMembers = selectedSquad === 'all'
  ? members
  : members.filter((member) => member.squadNumber === `Squad ${selectedSquad}`);

  const DateSelector: React.FC<{
    availableDates: ParadeDate[];
    selectedDate: string;
    onDateChange: (date: string) => void;
  }> = ({ availableDates, selectedDate, onDateChange }) => (
    <div className="w-64">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Select Parade Date
      </label>
      <select
        value={selectedDate}
        onChange={(e) => onDateChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
      >
        {availableDates.map((parade) => (
          <option key={parade.id} value={parade.date}>
            {new Date(parade.date).toLocaleDateString()}
          </option>
        ))}
      </select>
    </div>
  );
  
  const formatDate = (date: string | Date): string => {
    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) {
        return 'Invalid Date';
      }
      // Adjust for timezone by using local date methods instead of UTC
      const year = dateObj.getFullYear()   ;
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  const fetchParadeDates = async () => {
    try {
      setError(null);
      const response = await getDataFromFirebase('parades');
  
      if (response.success && response.data) {
        console.log('Raw parade data:', response.data);
        const months = response.data as MonthlyParades;
  
        // Transform the nested structure into parade dates
        const allDates: ParadeDate[] = [];
  
        Object.entries(months).forEach(([month, dates]) => {
          Object.entries(dates).forEach(([dateId, dateData]) => {
            console.log('Processing date entry:', { month, dateId, dateData });
  
            if (dateData && dateData.date) {
              const formattedDate = formatDate(dateData.date);
              if (formattedDate !== 'Invalid Date') {
                allDates.push({
                  date: formattedDate,
                  id: dateId,
                });
              }
            }
          });
        });
  
        // Sort dates in ascending order starting from January
        const sortedDates = allDates.sort((a, b) => {
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          return dateA - dateB; // Ascending order
        });
  
        console.log('Processed parade dates:', sortedDates);
  
        setParadeDates(sortedDates);
  
        // Set the first date (January or earliest) as the selected date if available
        if (sortedDates.length > 0) {
          setSelectedDate(sortedDates[0].date);
        }
      } else {
        throw new Error(response.message || 'Failed to fetch parade dates');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch parade dates';
      setError(errorMessage);
      console.error('Error fetching parade dates:', err);
    }
  };
  


  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
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
            Squad Attendance
          </h1>
        </div>

        {error && <ErrorAlert message={error} />}

        <div className="p-6">
          <div className="mb-6 space-y-6">
            <div className="flex justify-between items-center">
              <DateSelector
                availableDates={paradeDates}
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
              />

              <div className="flex gap-4">
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-500">Present</div>
                  <div className="text-xl font-bold text-green-600">{stats.present}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-500">Absent</div>
                  <div className="text-xl font-bold text-red-600">{stats.absent}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-500">Excused</div>
                  <div className="text-xl font-bold text-yellow-600">{stats.excused}</div>
                </div>
              </div>
            </div>

            <SquadSelector
              selectedSquad={selectedSquad}
              onSquadChange={setSelectedSquad}
            />
          </div>

          <AttendanceTable
            members={filteredMembers}
            attendance={getAttendanceMap()}
            onUpdateAttendance={handleAttendanceChange}
          />
        </div>
      </div>
    </div>
  );
};

export default AttendancePage;