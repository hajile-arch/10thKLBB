import { ChevronLeft, ChevronRight, Cake } from 'lucide-react';
import React from 'react';

interface Member {
  name: string;
  rank: string;
  birthday: string;
  squadName: string;
}

interface BirthdayMember extends Member {
  date: Date;
  daysUntil: number;
}

interface UpcomingBirthdaysProps {
  members: Member[];
}

const UpcomingBirthdays: React.FC<UpcomingBirthdaysProps> = ({ members }) => {
  const [currentPage, setCurrentPage] = React.useState(0);
  const itemsPerPage = 5;

  const calculateUpcomingBirthday = (birthday: string) => {
    const today = new Date();
    const birthDate = new Date(birthday);
    const nextBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
    
    // Check if birthday is today
    const isToday = nextBirthday.toDateString() === today.toDateString();
    if (isToday) {
      return { date: nextBirthday, daysUntil: 0 };
    }
    
    // If birthday has passed this year, set to next year
    if (nextBirthday < today) {
      nextBirthday.setFullYear(today.getFullYear() + 1);
    }
    
    const daysUntil = Math.ceil((nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return { date: nextBirthday, daysUntil };
  };

  const getBirthdayStatus = (daysUntil: number): { label: string; className: string } => {
    if (daysUntil === 0) return { label: "Today!", className: "bg-green-500/20 text-green-500" };
    if (daysUntil <= 7) return { label: "This Week", className: "bg-blue-500/20 text-blue-500" };
    if (daysUntil <= 30) return { label: "Soon", className: "bg-orange-500/20 text-orange-500" };
    return { label: "Upcoming", className: "bg-gray-500/20 text-gray-400" };
  };

  // Sort all members by upcoming birthday
  const sortedMembers = members
    .map(member => ({
      ...member,
      ...calculateUpcomingBirthday(member.birthday)
    }))
    .sort((a, b) => a.daysUntil - b.daysUntil);

  const totalPages = Math.ceil(sortedMembers.length / itemsPerPage);
  const currentMembers = sortedMembers.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const nextPage = () => {
    if (currentPage < totalPages - 1) setCurrentPage(prev => prev + 1);
  };

  const prevPage = () => {
    if (currentPage > 0) setCurrentPage(prev => prev - 1);
  };

  return (
    <div className="col-span-8 bg-gray-800 rounded-2xl p-6 border border-gray-700">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <Cake className="w-5 h-5 text-blue-400" />
          <h3 className="font-medium text-lg">Upcoming Birthdays</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={prevPage}
            disabled={currentPage === 0}
            className={`p-2 rounded-lg hover:bg-gray-700 transition-colors ${
              currentPage === 0 ? 'text-gray-600' : 'text-gray-300'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm text-gray-400">
            Page {currentPage + 1} of {totalPages}
          </span>
          <button
            onClick={nextPage}
            disabled={currentPage === totalPages - 1}
            className={`p-2 rounded-lg hover:bg-gray-700 transition-colors ${
              currentPage === totalPages - 1 ? 'text-gray-600' : 'text-gray-300'
            }`}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-700">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-700/50">
              <th className="text-left py-3 px-4 text-gray-300 font-medium text-sm">Member</th>
              <th className="text-left py-3 px-4 text-gray-300 font-medium text-sm">Squad</th>
              <th className="text-left py-3 px-4 text-gray-300 font-medium text-sm">Birthday</th>
              <th className="text-left py-3 px-4 text-gray-300 font-medium text-sm">Days Until</th>
              <th className="text-left py-3 px-4 text-gray-300 font-medium text-sm">Status</th>
            </tr>
          </thead>
          <tbody>
            {currentMembers.map((member: BirthdayMember) => (
              <tr 
                key={member.name} 
                className="border-t border-gray-700 hover:bg-gray-700/30 transition-colors"
              >
                <td className="py-4 px-4">
                  <div className="flex gap-2 items-center">
                    <span className="text-gray-400 text-sm">{member.rank}</span>
                    <span className="text-white font-medium">{member.name}</span>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span className="text-gray-300 text-sm">{member.squadName}</span>
                </td>
                <td className="py-4 px-4">
                  <span className="text-gray-300 text-sm">
                    {new Date(member.birthday).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <span className="text-gray-300 text-sm">
                    {member.daysUntil} days
                  </span>
                </td>
                <td className="py-4 px-4">
                  <span 
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      getBirthdayStatus(member.daysUntil).className
                    }`}
                  >
                    {getBirthdayStatus(member.daysUntil).label}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UpcomingBirthdays;