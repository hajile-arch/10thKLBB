import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Write from './pages/Write'
import BadgeList from './pages/Read'
function App() {

  return (
    <>
      <div className="flex">
        <Router>
          <Routes>
            <Route path="/read" element={ <BadgeList/>}/>
            <Route path="/write" element={ <Write/>}/>

          </Routes>
        </Router>
      </div>
    </>
  )
}

export default App
