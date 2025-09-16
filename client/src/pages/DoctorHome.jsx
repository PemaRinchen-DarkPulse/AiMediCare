import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import SideBar from "../components/sideBar/DoctorSideBar";
import ProfileDropdown from "../components/profileManagemnt/ProfileDropdown";
import Navigation from "../components/Navigation";
import ChatBotBubble from "../components/chatbot/ChatBotBubble";

const DoctorHome = () => {
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
      <SideBar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Content - Avoid Overlapping */}
      <div className={`page-content ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        {isDropdownOpen && <ProfileDropdown />}
        <Outlet /> {/* Dynamic Page Content */}
      </div>

      {/* ChatBot */}
      <ChatBotBubble />
    </div>
  );
};

export default DoctorHome;
