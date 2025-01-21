import { useState } from 'react'
import { BrowserRouter as Router,Routes,Route } from 'react-router-dom'
import './App.css'
import LandingPage from './pages/LandingPage'
import Login from './components/userAuth/Login'
import Signup from './components/userAuth/Signup'
function App() {
  return (
    <>
    <Router>
      <Routes>
        <Route path='' element={<LandingPage/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/signup' element={<Signup/>}/>
      </Routes>
    </Router>
    </>
  )
}

export default App
