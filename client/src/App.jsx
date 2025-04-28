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
import DoctorHome from "./pages/DoctorHome";
import PharmacistHome from "./pages/PharmacistHome";
import DoctorAppointments from "./pages/doctor/DoctorAppointments";
import Patients from "./pages/doctor/Patients";
import Diagnostics from "./pages/doctor/Diagnostics";
import DoctorPrescriptions from "./pages/doctor/DoctorPrescriptions";
import DoctorSettings from "./pages/doctor/DoctorSettings";
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import PatientSettings from "./pages/patient/PatientSettings";
import PatientDiagnostics from "./pages/patient/PatientDiagnostics";
// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    // You could add a loading spinner here
    return <div>Loading...</div>;
  }
  
  if (!isAuthenticated()) {
    return <Navigate to="/" />; // Redirect to landing page instead of login
  }
  
  return children;
};

// Email Verification Handler Component
const EmailVerificationHandler = () => {
  const { search, pathname } = window.location;
  const token = pathname.split('/').pop();
  
  React.useEffect(() => {
    // The backend already handles the redirect, so we shouldn't need to do anything here
    // This component now serves as a loading screen while the backend processes the verification
    
    // For better UX, we can directly redirect to the backend verification endpoint
    window.location.href = `http://localhost:5000/api/auth/verify/${token}`;
    
    // The backend will redirect to /login?verification=success or /login?verification=failed
  }, [token]);
  
  return (
    <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
      <div className="text-center">
        <h2>Verifying your email...</h2>
        <p>Please wait while we verify your account.</p>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <GoogleOAuthProvider clientId="296371817530-c47k7552mctmfmrn1m3vtssu4tu7e5vh.apps.googleusercontent.com">
      <AuthProvider>
        <Router>
          <ToastContainer 
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={true}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* Add route for email verification */}
            <Route path="/api/auth/verify/:token" element={<EmailVerificationHandler />} />
            
            {/* Patient Routes */}
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
              <Route path="diagnostics" element={<PatientDiagnostics/>} />
              <Route path="settings" element={<PatientSettings/>} />
            </Route>
            
            {/* Doctor Routes */}
            <Route path="/doctor/*" element={
              <ProtectedRoute>
                <DoctorHome />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="doctor" />} />
              <Route path="dashboard" element={<DoctorDashboard/>} />
              <Route path="appointments" element={<DoctorAppointments/>} />
              <Route path="patients" element={<Patients/>} />
              <Route path="diagnostics" element={<Diagnostics/>} />
              <Route path="Prescriptions" element={<DoctorPrescriptions/>} />
              <Route path="settings" element={<DoctorSettings/>} />
            </Route>
            
            {/* Pharmacist Routes */}
            <Route path="/pharmacist/*" element={
              <ProtectedRoute>
                <PharmacistHome />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="dashboard" />} />
              <Route path="dashboard" element={<div>Pharmacist Dashboard</div>} />
              <Route path="prescriptions" element={<div>Prescription Management</div>} />
              <Route path="inventory" element={<div>Medication Inventory</div>} />
              <Route path="patients" element={<div>Patient Records</div>} />
              <Route path="messages" element={<div>Pharmacist Messages</div>} />
              <Route path="settings" element={<Settings/>} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
