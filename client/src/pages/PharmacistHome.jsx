import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import PharmacistSideBar from "../components/sideBar/PharmacistSideBar";
import ProfileDropdown from "../components/profileManagemnt/ProfileDropdown";
import Navigation from "../components/Navigation";

const PharmacistHome = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <div style={{ minHeight: "100vh",top: 0, left: 0, }}>
      {/* Fixed Navigation */}
      <div 
        className="border position-fixed w-100 bg-secondary" 
        style={{ top: 0, left: 0, zIndex: 1050, height: "70px" }}
      >
        <Navigation toggleSidebar={toggleSidebar} toggleDropdown={toggleDropdown} />
      </div>

      {/* Fixed Sidebar */}
      <div
        style={{
          width: isSidebarOpen ? "250px" : "80px",
          transition: "width 0.2s ease",
          position: "fixed",
          top: "60px", // Below navigation
          left: "0",
          height: "calc(100vh - 60px)",
          backgroundColor: "#f4f4f4",
          flexShrink: 0, 
          zIndex: 1040, // Keep sidebar above content but below navbar
        }}
      >
        <PharmacistSideBar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      </div>

      {/* Main Content - Avoid Overlapping */}
      <div
        className="p-3"
        style={{
          marginLeft: isSidebarOpen ? "250px" : "80px", // Adjust for sidebar
          marginTop:"65px", // Prevent overlap with navigation
          transition: "margin-left 0.2s ease",
        }}
      >
        {isDropdownOpen && <ProfileDropdown />}
        <Outlet /> {/* Dynamic Page Content */}
      </div>
    </div>
  );
};

export default PharmacistHome;
