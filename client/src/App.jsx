import React from 'react'
import { BrowserRouter as Router,Routes,Route } from 'react-router-dom'
import './App.css'
import LandingPage from './pages/LandingPage'
import Login from './components/userAuth/Login'
import Signup from './pages/SignUp'
import Dashboard from './pages/Dashboard'
import { GoogleOAuthProvider } from "@react-oauth/google";
function App() {
  return (
    <>
        <GoogleOAuthProvider clientId="296371817530-c47k7552mctmfmrn1m3vtssu4tu7e5vh.apps.googleusercontent.com">

    <Router>
      <Routes>
        <Route path='' element={<LandingPage/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/signup' element={<Signup/>}/>
        <Route path='/dashboard' element={<Dashboard/>}/>
      </Routes>
    </Router>
    </GoogleOAuthProvider>
    </>
  )
}

export default App
