import React, { useState } from "react";
import { Routes, Route, Outlet } from "react-router-dom";
import SideBar from "../components/sideBar/SideBar";
import ProfileDropdown from "../components/profileManagemnt/ProfileDropdown";
import Navigation from "../components/Navigation";

const Aimedicare = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <div className="dashboard d-flex flex-column" style={{ minHeight: "100vh" }}>
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

      {/* Main Content */}
      <div
        style={{
          marginLeft: isSidebarOpen ? "250px" : "80px",
          transition: "margin-left 0.2s ease",
          minHeight: "100vh",
          flex: 1,
        }}
      >
        {isDropdownOpen && <ProfileDropdown />}
        {/* Navigation Component */}
        <div className="me-4 my-3">
          <Navigation toggleDropdown={toggleDropdown} />
        </div>

        {/* Dynamic Content: This will change based on the route */}
        <div className="content">
          <Outlet /> {/* This renders the nested routes */}
        </div>
      </div>
    </div>
  );
};

export default Aimedicare;
