import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Write from './services/Write'
function App() {

  return (
    <>
      <div className="flex">
        <Router>
          <Routes>
            <Route path="/" element={ <Write/>}/>
            <Route path="/write" element={ <Write/>}/>

          </Routes>
        </Router>
      </div>
    </>
  )
}

export default App
