import Sidebar from "../components/Members/Sidebar";
import MemberHeader from "../components/Members/MemberHeader";
import ThemeCard from "../components/Members/Theme";
import { useEffect, useState } from "react";
import { getDataFromFirebase } from "../firebase/firebaseUtils";
import UpcomingEvent from "../components/Members/UpcomingEvent";
import UserAnalytics from "../components/Members/MembersCount";
import SquadListing from "../components/Members/SquadListing";
import UpcomingBirthdays from "../components/Members/UpcomingBirthdays";

interface Squad {
  id: string;
  squadName: string;
  squadNumber: string;
  squadLeader: string;
  squadLeaderRank: string;
  squadLeaderBirthday?: string;
  assistantSquadLeader: string;
  assistantSquadLeaderRank: string;
  assistantSquadLeaderBirthday?: string;
  members: {
    name: string;
    rank: string;
    birthday?: string;
  }[];
}

const MembersDashboard = () => {
  const [upcomingEvent, setUpcomingEvent] = useState<any | null>(null);
  const [squads, setSquads] = useState<Squad[]>([]);
  const [allMembers, setAllMembers] = useState<Array<{name: string; rank: string; birthday: string; squadName: string;}>>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      const response = await getDataFromFirebase("events");
      if (response.success && response.data) {
        const eventsArray = Object.entries(response.data).map(([id, value]: [string, any]) => ({
          id,
          ...value,
        }));
        const sortedEvents = eventsArray.sort(
          (a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime()
        );
        const nextEvent = sortedEvents.find(
          (event) => new Date(event.startDateTime) > new Date()
        );
        setUpcomingEvent(nextEvent);
      }
    };

    const fetchSquads = async () => {
      const response = await getDataFromFirebase("squads");
      if (response.success && response.data) {
        const squadsArray = Object.entries(response.data).map(([id, value]: [string, any]) => ({
          id,
          ...value,
        }));
        setSquads(squadsArray);
    
        // Gather all members including squad leaders and assistant squad leaders
        const allMembers = squadsArray.flatMap(squad => {
          const members = [];
    
          if (squad.squadLeader && squad.squadLeaderBirthday) {
            members.push({
              name: squad.squadLeader,
              rank: squad.squadLeaderRank,
              birthday: squad.squadLeaderBirthday,
              squadName: squad.squadName // Include squadName
            });
          }
    
          if (squad.assistantSquadLeader && squad.assistantSquadLeaderBirthday) {
            members.push({
              name: squad.assistantSquadLeader,
              rank: squad.assistantSquadLeaderRank,
              birthday: squad.assistantSquadLeaderBirthday,
              squadName: squad.squadName // Include squadName
            });
          }
    
          if (squad.members) {
            members.push(...squad.members
              .filter((member: { birthday: any; }) => member.birthday)
              .map((member: { name: string; rank: string; birthday: string; }) => ({
                ...member,
                squadName: squad.squadName // Include squadName for each member
              }))
            );
          }
    
          return members;
        });
    
        setAllMembers(allMembers);
      }
    };
    

    fetchEvents();
    fetchSquads();
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
          <UserAnalytics />

          {/* Upcoming Birthdays */}
          <UpcomingBirthdays members={allMembers} />

          <SquadListing />
        </div>
      </div>
    </div>
  );
};

export default MembersDashboard;