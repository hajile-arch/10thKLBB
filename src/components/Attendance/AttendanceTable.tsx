import { Member, AttendanceRecord } from '../../types';

// Add explicit type for member ID
type MemberId = string;

interface AttendanceTableProps {
  members: Member[];
  attendance: Record<MemberId, AttendanceRecord>;
  onUpdateAttendance: (memberId: MemberId, status: 'present' | 'absent' | 'excused') => Promise<void>;
}

export const AttendanceTable = ({ members, attendance, onUpdateAttendance }: AttendanceTableProps) => {
  const getRank = (member: Member) => {
    if (member.role === 'Squad Leader') return member.squadLeaderRank || 'N/A';
    if (member.role === 'Assistant Squad Leader') return member.assistantSquadLeaderRank || 'N/A';
    return member.rank || 'N/A';
    
  };
  console.log('AttendanceTable Props:', {
    members,
    attendance,
  });
  // Generate a consistent ID for members without one
  const generateMemberId = (member: Member): MemberId => {
    if (member.id) return member.id;
    
    // Create a deterministic ID using available member data
    const idComponents = [
      member.name || 'unnamed',
      member.rank || 'norank',
      member.squadNumber || 'nosquad',
    ].map(str => str.toLowerCase().replace(/\s+/g, '-'));
    
    return idComponents.join('_');
  };

  const getButtonStyles = (currentStatus: string | undefined, buttonStatus: string) => {
    const isActive = currentStatus === buttonStatus;
    let styles = 'px-3 py-1 rounded-md text-sm transition-all ';
    
    if (buttonStatus === 'present') {
      styles += isActive 
        ? 'bg-green-600 text-white' 
        : 'border border-green-600 text-green-600 hover:bg-green-600 hover:text-white';
    } else if (buttonStatus === 'absent') {
      styles += isActive 
        ? 'bg-red-600 text-white'
        : 'border border-red-600 text-red-600 hover:bg-red-600 hover:text-white';
    } else {
      styles += isActive 
        ? 'bg-yellow-600 text-white'
        : 'border border-yellow-600 text-yellow-600 hover:bg-yellow-600 hover:text-white';
    }

    return styles;
  };

  const handleStatusChange = async (memberId: MemberId, status: 'present' | 'absent' | 'excused') => {
    try {
      await onUpdateAttendance(memberId, status);
    } catch (error) {
      console.error(`Failed to update attendance for member ${memberId}:`, error);
      // You might want to add proper error handling here (e.g., showing a toast notification)
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse border border-gray-700">
        <thead>
          <tr className="bg-gray-700 text-white">
            <th className="p-3 text-left">Rank</th>
            <th className="p-3 text-left">Name</th>
            <th className="p-3 text-left">Squad</th>
            <th className="p-3 text-left">Status</th>
            <th className="p-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {members.map((member) => {
            const memberId = generateMemberId(member);
            const currentAttendance = attendance[memberId];

            return (
              <tr key={memberId} className="border-b border-gray-700 hover:bg-gray-200">
                <td className="p-3">{getRank(member)}</td>
                <td className="p-3">
                  {member.name || 'Unnamed'}{' '}
                  {member.role && <span className="text-sm text-gray-500">({member.role})</span>}
                </td>
                <td className="p-3">{member.squadName || member.squadNumber || 'N/A'}</td>
                <td className="p-3">
                  {currentAttendance?.status || <span className="text-gray-500">Not marked</span>}
                </td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <button
                      className={getButtonStyles(currentAttendance?.status, 'present')}
                      onClick={() => handleStatusChange(memberId, 'present')}
                    >
                      Present
                    </button>
                    <button
                      className={getButtonStyles(currentAttendance?.status, 'absent')}
                      onClick={() => handleStatusChange(memberId, 'absent')}
                    >
                      Absent
                    </button>
                    <button
                      className={getButtonStyles(currentAttendance?.status, 'excused')}
                      onClick={() => handleStatusChange(memberId, 'excused')}
                    >
                      Excused
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};