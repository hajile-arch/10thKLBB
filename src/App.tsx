import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
  Navigate
} from "react-router-dom";
import Awardslist from "./pages/Awardslist.tsx"
import Write from "./pages/Write";
import Awards from "./pages/Award.tsx"
import BadgeList from "./pages/Read";
import Home from "./pages/Homepage";
import AddUser from "./pages/AddMembers";
import BadgeSelection from "./pages/Badgelist";
import UserDetailsPage from "./pages/UserDetailsPage";
import Preloader from "./components/Preloader.tsx";
import UserDetailsPageEdit from "./pages/UserDetailsPageEdit.tsx";
import UpcomingEventsPage from "./pages/EventFormPage.tsx";
import Aboutus from "./pages/Aboutus.tsx";
import ParadeList from "./components/ParadeDates/ParadeDates.tsx";
import ParadeForm from "./components/ParadeDates/ParadeForm.tsx";
import EventsListPage from "./pages/EventsListPage.tsx";
import EventFormPage from "./pages/EventFormPage.tsx";
import EventCalendar from "./pages/Calendar.tsx";
import MembersDashboard from "./pages/Members.tsx";
import SecretPage from "./pages/secret.tsx";
import LeaveForm from "./pages/LeaveForm.tsx";
import SquadManagement from "./components/Squad Listing/SquadManagement.tsx";
import TestToast from "./pages/test.tsx";
import { ToastContainer } from "react-toastify";
import AttendancePage from "./components/Members/Attendance.tsx";
import TotalParadesPage from "./pages/AttendanceChecker.tsx";
import BirthdayList from "./pages/BirthdayList.tsx";
import UnderConstruction from "./pages/UnderConstruction.tsx";
import ParadeAnnouncementsPage from "./pages/Announcement.tsx";
// import MobileRedirect from "./components/MobileRedirect.tsx";
import BadgeStatistics from "./pages/BadgeStatistics.tsx";
import MemberManagement from "./pages/MemberManagement.tsx";
import BadgeApproval from "./pages/BadgeApproval.tsx";
import BadgeLeaderboard from "./pages/BadgeLeaderboard.tsx";
import MemberSelfRegistration from "./components/Squad Listing/MemberSelfRegistration.tsx";
import SquadOverview from "./pages/squad/SquadOverview.tsx";
import SquadDetail from "./pages/squad/SquadDetail.tsx";
import AttendanceStatsPage from "./components/Attendance/AttendanceStats.tsx";
import MemberProfile from "./components/Members/MemberProfile.tsx"
import NCODashboard from "./pages/ncos.tsx";
import CheckMembers from "./pages/Debug.tsx";


const App: React.FC = () => {
  const [, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [showPreloader, setShowPreloader] = useState(false);

  // Custom hook to detect the current path and apply loading for the Home route
  const AppContent = () => {
    const location = useLocation();

    useEffect(() => {
      if (
        !hasLoaded &&
        (location.pathname === "/" || location.pathname === "/home")
      ) {
        setIsLoading(true);
        setShowPreloader(true); // Trigger preloader
        const timer = setTimeout(() => {
          setIsLoading(false);
          setHasLoaded(true); // Prevent further preloader displays
          setShowPreloader(false); // Hide preloader after 3 seconds
        }, 3000); // Preloader duration

        return () => clearTimeout(timer); // Cleanup timer
      }
      if (hasLoaded) {
        setIsLoading(false); // Hide the preloader after the first load
      }
    }, [location.pathname, hasLoaded]); // Add `hasLoaded` to dependencies

    return showPreloader ? (
      <Preloader onFinish={() => setIsLoading(false)} />
    ) : (
      <div>
        <ToastContainer position="top-right" autoClose={3000} />
        <Routes>
          <Route path="/announcement" element={<ParadeAnnouncementsPage />} />
          <Route path="/MemberRegister" element={<MemberSelfRegistration />} />
<Route path="/members/:memberId" element={<MemberProfile />} />
        <Route path="/squad" element={<SquadOverview />} />        
        <Route path="/squad/:squadNumber" element={<SquadDetail />} />
        <Route path="/debug" element={<CheckMembers/>}/>
          <Route path="/nah" element={<UserDetailsPage />} />
          <Route path="/ncos" element={<NCODashboard />} />
          <Route path="/404" element={<UnderConstruction />} />
          <Route path="/attendance" element={<AttendancePage />} />
          <Route path="/attendance/stats" element={<AttendanceStatsPage />} />
          <Route path="/squadmanagement" element={<SquadManagement />} />
          <Route path="/test" element={<TestToast />} />
          <Route path="/secret" element={<SecretPage />} />
          <Route path="/member" element={<MembersDashboard />} />
          <Route path="/editMember" element={<UserDetailsPageEdit />} />
          <Route path="/addMember" element={<AddUser />} />
          <Route path="/readBadge" element={<BadgeList />} />
          <Route path="/writeBadge" element={<Write />} />
          <Route path="/home" element={<Home />} />
          <Route path="/" element={<Home />} />
          <Route path="/us" element={<Aboutus />} />
          <Route path="/paradelist" element={<ParadeList />} />
          <Route path="/paradeform" element={<ParadeForm />} />
          <Route path="/event" element={<EventsListPage />} />
          <Route path="/calendar" element={<EventCalendar />} />
          <Route path="/leaveform" element={<LeaveForm />} />
          <Route path="/attendancechecker" element={<TotalParadesPage />} />
          <Route path="/BirthdayList" element={<BirthdayList />} />
          <Route path="/event/new" element={<EventFormPage />} />
          <Route path="/awards" element={<Awards />} />
          <Route path="/awardslist" element={<Awardslist />} />
          <Route path="/event/edit/:id" element={<EventFormPage />} />
          <Route path="/badgestats" element={<BadgeStatistics />} />
          <Route path="/removeduplicate" element={<MemberManagement />}/>
          <Route path="/BadgeApproval" element={<BadgeApproval />}/>
          <Route path="/BadgeLeaderboard" element={<BadgeLeaderboard />}/>
          <Route
            path="/badgelist"
            element={
              <BadgeSelection
                selectedBadges={selectedBadges}
                setSelectedBadges={setSelectedBadges}
              />
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    );
  };

  const [selectedBadges, setSelectedBadges] = useState<any[]>([]);

  return (
    <Router>
    {/* <MobileRedirect> */}
      <AppContent />
    {/* </MobileRedirect> */}
  </Router>
  );
};

export default App;
