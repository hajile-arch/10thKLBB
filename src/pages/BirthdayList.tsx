import { useEffect, useState } from 'react';
import { getDataFromFirebase } from '../firebase/firebaseUtils';
import { ArrowLeft, Calendar, Gift, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Member {
  name: string;
  birthday?: string;
  rank?: string;
  squadName: string;
  role: string;
}

interface MonthlyBirthdays {
  [key: string]: Member[];
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const BirthdayList = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [monthlyBirthdays, setMonthlyBirthdays] = useState<MonthlyBirthdays>({});
  const navigate =useNavigate();


  const handleBack = () => {
    navigate(-1); // Goes back one step in history
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await getDataFromFirebase('squads');

      if (response.success && response.data) {
        const birthdays: MonthlyBirthdays = {};
        // Initialize all months
        MONTHS.forEach(month => {
          birthdays[month] = [];
        });

        // Process each squad
        Object.values(response.data).forEach((squad: any) => {
          const processMembers = (memberData: any, role: string) => {
            if (memberData.birthday) {
              const date = new Date(memberData.birthday);
              const month = MONTHS[date.getMonth()];
              birthdays[month].push({
                name: memberData.name,
                birthday: memberData.birthday,
                rank: memberData.rank,
                squadName: squad.squadName,
                role: role
              });
            }
          };

          // Process squad leader
          processMembers(
            { 
              name: squad.squadLeader, 
              birthday: squad.squadLeaderBirthday,
              rank: squad.squadLeaderRank 
            }, 
            'Squad Leader'
          );

          // Process assistant squad leader
          processMembers(
            { 
              name: squad.assistantSquadLeader, 
              birthday: squad.assistantSquadLeaderBirthday,
              rank: squad.assistantSquadLeaderRank 
            }, 
            'Assistant Squad Leader'
          );

          // Process regular members
          squad.members.forEach((member: any) => {
            processMembers(member, 'Member');
          });
        });

        // Sort members within each month by day
        Object.keys(birthdays).forEach(month => {
          birthdays[month].sort((a, b) => {
            const dateA = new Date(a.birthday || '');
            const dateB = new Date(b.birthday || '');
            return dateA.getDate() - dateB.getDate();
          });
        });

        setMonthlyBirthdays(birthdays);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch member data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
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

  const currentMonth = MONTHS[new Date().getMonth()];

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
            Birthday Calendar
          </h1>
        </div>

        <div className="p-6">
          {/* Current Month Highlight */}
          {monthlyBirthdays[currentMonth]?.length > 0 && (
            <div className="mb-8 bg-blue-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-blue-900 mb-4 flex items-center">
                <Gift className="mr-2" />
                Birthdays This Month
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {monthlyBirthdays[currentMonth].map((member, index) => (
                  <div key={index} className="bg-white p-4 rounded-md shadow">
                    <div className="font-medium text-blue-900">{member.name}</div>
                    <div className="text-sm text-gray-600">
                      {new Date(member.birthday!).getDate()} {currentMonth}
                    </div>
                    {member.rank && (
                      <div className="text-sm text-gray-500">{member.rank}</div>
                    )}
                    <div className="text-sm text-gray-500">{member.squadName}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All Months */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {MONTHS.map(month => (
              <div key={month} className="border rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b">
                  <h3 className="font-medium text-gray-900">{month}</h3>
                </div>
                <div className="p-4">
                  {monthlyBirthdays[month]?.length > 0 ? (
                    <ul className="space-y-2">
                      {monthlyBirthdays[month].map((member, index) => (
                        <li key={index} className="text-sm">
                          <div className="font-medium">{member.name}</div>
                          <div className="text-gray-500">
                            {new Date(member.birthday!).getDate()} {month}
                            {member.rank && ` • ${member.rank}`}
                          </div>
                          <div className="text-gray-500">{member.squadName}</div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">No birthdays</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BirthdayList;