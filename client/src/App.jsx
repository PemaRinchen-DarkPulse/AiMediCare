import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./App.css";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Signup from "./pages/SignUp";
import Aimedicare from "./pages/Aimedicare";
import Dashboard from "./pages/Dashboard";
import Appointments from "./pages/Appointments";
import HealthRecords from "./pages/HealthRecords";
import Medications from "./Medications";
import PrevisitTriage from "./pages/PrevisitTriage";
import Messages from "./pages/Messages";
import BillingInsurance from "./pages/BillingInsurance";
import Settings from "./Settings";

function App() {
  return (
    <GoogleOAuthProvider clientId="296371817530-c47k7552mctmfmrn1m3vtssu4tu7e5vh.apps.googleusercontent.com">
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/aimedicare/*" element={<Aimedicare />}>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="appointments" element={<Appointments />} />
            <Route path="health-records" element={<HealthRecords/>} />
            <Route path="medications" element={<Medications/>} />
            <Route path="triage" element={<PrevisitTriage/>} />
            <Route path="messages" element={<Messages/>} />
            <Route path="billing" element={<BillingInsurance/>} />
            <Route path="settings" element={<Settings/>} />
          </Route>
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
