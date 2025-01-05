import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import Write from "./pages/Write";
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

const App: React.FC = () => {
  const [, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [showPreloader, setShowPreloader] = useState(false);

  // Custom hook to detect the current path and apply loading for the Home route
  const AppContent = () => {
    const location = useLocation();

    useEffect(() => {
      if (!hasLoaded && (location.pathname === "/" || location.pathname === "/home")) {
        setIsLoading(true);
        setShowPreloader(true);  // Trigger preloader
        const timer = setTimeout(() => {
          setIsLoading(false);
          setHasLoaded(true);  // Prevent further preloader displays
          setShowPreloader(false);  // Hide preloader after 3 seconds
        }, 3000); // Preloader duration

        return () => clearTimeout(timer); // Cleanup timer
      }
      if (hasLoaded) {
        setIsLoading(false); // Hide the preloader after the first load
      }
    }, [location.pathname, hasLoaded]);  // Add `hasLoaded` to dependencies

    return showPreloader ? (
      <Preloader onFinish={() => setIsLoading(false)} />
    ) : (
      <div>
        <ToastContainer position="top-right" autoClose={3000} />
        <Routes>
          <Route path="/ncos" element={<UserDetailsPage />} />
          
          <Route path="/squadmanagement" element={<SquadManagement />} />
          <Route path="/test" element={<TestToast />} />
          <Route path="/secret" element={<SecretPage />} />
          <Route path="/member" element={<MembersDashboard />} />
          <Route path="/edituser" element={<UserDetailsPageEdit />} />
          <Route path="/add" element={<AddUser />} />
          <Route path="/read" element={<BadgeList />} />
          <Route path="/write" element={<Write />} />
          <Route path="/home" element={<Home />} />
          <Route path="/" element={<Home />} />
          <Route path="/us" element={<Aboutus/>}/>
          <Route path="/paradelist" element={<ParadeList/>}/>
          <Route path="/paradeform" element={<ParadeForm/>}/>
          <Route path="/event" element={<EventsListPage />} />
          <Route path="/calendar" element={<EventCalendar  />} />
          <Route path="/leaveform" element={<LeaveForm  />} />
  <Route path="/event/new" element={<EventFormPage />} />
  <Route path="/event/edit/:id" element={<EventFormPage />} />
          <Route
            path="/badgelist"
            element={
              <BadgeSelection
                selectedBadges={selectedBadges}
                setSelectedBadges={setSelectedBadges}
              />
            }
          />
        </Routes>
      </div>
    );
  };

  const [selectedBadges, setSelectedBadges] = useState<any[]>([]);

  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
