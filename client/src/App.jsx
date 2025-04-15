import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./App.css";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Signup from "./pages/SignUp";
import Dashboard from "./pages/patient/Dashboard";
import Appointments from "./pages/patient/PatientAppointments";
import HealthRecords from "./pages/patient/HealthRecords";
import Medications from "./pages/patient/Medications";
import PrevisitTriage from "./pages/patient/PrevisitTriage";
import Messages from "./pages/patient/Messages";
import BillingInsurance from "./pages/patient/BillingInsurance";
import Settings from "./Settings";
import PatientHome from "./pages/PatientHome";

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    // You could add a loading spinner here
    return <div>Loading...</div>;
  }
  
  if (!isAuthenticated()) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

function App() {
  return (
    <GoogleOAuthProvider clientId="296371817530-c47k7552mctmfmrn1m3vtssu4tu7e5vh.apps.googleusercontent.com">
      <AuthProvider>
        <Router>
          <ToastContainer position="top-right" autoClose={5000} />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/patient/*" element={
              <ProtectedRoute>
                <PatientHome />
              </ProtectedRoute>
            }>
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
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
