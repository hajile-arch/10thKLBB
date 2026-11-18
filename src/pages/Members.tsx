import Sidebar from "../components/Members/Sidebar";
import MemberHeader from "../components/Members/MemberHeader";
import ThemeCard from "../components/Members/Theme";
import { useEffect, useState } from "react";
import UpcomingEvent from "../components/Members/UpcomingEvent";
import UserAnalytics from "../components/Members/MembersCount";
import SquadListing from "../components/Members/SquadListing";
import UpcomingBirthdays from "../components/Members/UpcomingBirthdays";
import { getAllMembers } from "../firebase/memberService";
import { getSquadsForYear } from "../firebase/squadService";
import { Member, Squad, isCurrentMember } from "../enum";

const MembersDashboard = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [squads, setSquads] = useState<Squad[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [allMembers, yearSquads] = await Promise.all([
          getAllMembers(),
          getSquadsForYear(),
        ]);
        // The dashboard shows people currently in the company
        setMembers(allMembers.filter(isCurrentMember));
        setSquads(yearSquads);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <Sidebar />

      {/* Main Content */}
      <div className="ml-64 p-6">
        {/* Header */}
        <MemberHeader />

        {/* Grid Layout */}
        <div className="grid grid-cols-12 gap-6">
          {/* Upcoming Event */}
          <UpcomingEvent />

          {/* Profit Card */}
          <ThemeCard />

          {/* Analytics */}
          <UserAnalytics members={members} />

          {/* Upcoming Birthdays */}
          <UpcomingBirthdays members={members} />

          <SquadListing squads={squads} members={members} isLoading={loading} />
        </div>
      </div>
    </div>
  );
};

export default MembersDashboard;
