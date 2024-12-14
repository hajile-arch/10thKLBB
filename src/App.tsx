import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Write from './pages/Write';
import BadgeList from './pages/Read';
import Home from './pages/Homepage';
import AddUser from './pages/AddMembers';
import BadgeSelection from './pages/Badgelist';
import UserDetailsPage from './pages/UserDetailsPage';

function App() {
  const [selectedBadges, setSelectedBadges] = useState<any[]>([]);

  return (
    <>
      <div className="flex">
        <Router>
          <Routes>
          <Route path="/user" element={<UserDetailsPage/>} />
            <Route path="/add" element={<AddUser />} />
            <Route path="/read" element={<BadgeList />} />
            <Route path="/write" element={<Write />} />
            <Route path="/home" element={<Home />} />
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
        </Router>
      </div>
    </>
  );
}

export default App;
