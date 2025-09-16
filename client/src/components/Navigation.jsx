import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaBell, FaBars, FaCog, FaSignOutAlt, FaUser } from "react-icons/fa";
import { Dropdown } from "react-bootstrap";
import { useAuth } from "../context/AuthContext";
import { toast } from 'react-toastify';
import "../styles/Navigation.css";

const Navigation = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  // Handle user logout
  const handleLogout = async () => {
    const result = await logout();
    if (result.toast) {
      toast.info(result.toast.message);
    }
    navigate('/'); // Redirect to landing page
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user || !user.name) return "?";
    
    const nameParts = user.name.split(' ');
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }
    return nameParts[0][0].toUpperCase();
  };

  // Handle settings navigation based on user role
  const navigateToSettings = () => {
    if (!user) return;
    setShowDropdown(false);
    
    switch (user.role) {
      case 'patient':
        navigate('/patient/settings');
        break;
      case 'doctor':
        navigate('/doctor/settings');
        break;
      case 'pharmacist':
        navigate('/pharmacist/settings');
        break;
      default:
        navigate('/patient/settings');
    }
  };
  
  const navigateToProfile = () => {
    setShowDropdown(false);
    navigate('/patient/profile');
  };

  return (
    <div className="navigation-container d-flex justify-content-between align-items-center">
      {/* Left Section - Logo and Sidebar Toggle */}
      <div className="navigation-left">
        <button 
          className="sidebar-toggle-btn"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
        >
          <FaBars size={18} />
        </button>
        <h4 className="brand-logo">
          AiMediCare
        </h4>
      </div>

      {/* Center Section - Search Bar */}
      <div className="navigation-search">
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="Search patients, appointments, medications..."
            aria-label="Search"
          />
          <button className="search-btn" aria-label="Search">
            <FaSearch size={16} />
          </button>
        </div>
      </div>

      {/* Right Section - Actions */}
      <div className="navigation-actions">
        {/* Settings Icon */}
        <div 
          className="action-icon" 
          onClick={navigateToSettings}
          role="button"
          tabIndex={0}
          aria-label="Settings"
          title="Settings"
        >
          <FaCog size={18} />
        </div>

        {/* Notification Bell */}
        <div className="notification-container">
          <div 
            className="action-icon" 
            role="button"
            tabIndex={0}
            aria-label="Notifications"
            title="Notifications"
          >
            <FaBell size={18} />
            <span className="notification-badge">3</span>
          </div>
        </div>

        {/* Profile Circle with Dropdown */}
        <Dropdown 
          align="end" 
          show={showDropdown} 
          onToggle={(isOpen) => setShowDropdown(isOpen)}
        >
          <Dropdown.Toggle as="div" id="profile-dropdown" className="p-0">
            <div className="profile-avatar" title={`${user?.name || 'User'} - ${user?.role || 'User'}`}>
              {getUserInitials()}
            </div>
          </Dropdown.Toggle>

          <Dropdown.Menu className="dropdown-menu">
            <Dropdown.Item onClick={navigateToProfile} className="dropdown-item">
              <FaUser /> My Profile
            </Dropdown.Item>
            <Dropdown.Item onClick={navigateToSettings} className="dropdown-item">
              <FaCog /> Settings
            </Dropdown.Item>
            <Dropdown.Divider className="dropdown-divider" />
            <Dropdown.Item onClick={handleLogout} className="dropdown-item text-danger">
              <FaSignOutAlt /> Logout
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
    </div>
  );
};

export default Navigation;
