import React, { useState } from "react";
import SideBar from "../components/sideBar/SideBar";
import ProfileDropdown from "../components/profileManagemnt/ProfileDropdown";

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Manage dropdown visibility

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen); // Toggle dropdown on user profile click
  };

  return (
    <div className="dashboard d-flex" style={{ minHeight: "100vh" }}>
      <div
        style={{
          width: isSidebarOpen ? "250px" : "80px",
          transition: "width 0.1s ease",
          position: "fixed",
          top: 0,
          left: 0,
          height: "100vh",
          zIndex: 1000,
          backgroundColor: "#f4f4f4",
        }}
      >
        <SideBar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      </div>
      <div
        style={{
          marginLeft: isSidebarOpen ? "250px" : "80px",
          transition: "margin-left 0.2s ease",
          padding: "20px",
          minHeight: "100vh",
          flex: 1,
        }}
      >
        <h1>Welcome UserName!</h1>
        <div
          onClick={toggleDropdown} // Trigger dropdown toggle
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            width: "50px",
            height: "50px",
            backgroundColor: "#4CAF50",
            color: "#fff",
            borderRadius: "50%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: "18px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          P
        </div>

        {isDropdownOpen && <ProfileDropdown />}
        <div className="border"
          style={{
            marginTop: "50px",
            padding: "20px",
            backgroundColor: "#fff",
            borderRadius: "10px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          }}
        >
          <h2 style={{ color: "#555", marginBottom: "10px" }}>
            Dashboard Overview
          </h2>
          <p style={{ color: "#777" }}>
            Here is where you can manage your tasks, view analytics, and access
            all your features.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
