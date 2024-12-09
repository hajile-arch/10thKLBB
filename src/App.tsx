import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Write from './Components/Write'
function App() {

  return (
    <>
      <div className="text-3xl font-bold underline">
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
