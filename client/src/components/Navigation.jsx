import React from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaBell, FaBars, FaCog, FaSignOutAlt } from "react-icons/fa";
import { Dropdown } from "react-bootstrap";
import { useAuth } from "../context/AuthContext";
import { toast } from 'react-toastify';

const Navigation = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

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

  return (
    <div className="d-flex justify-content-between align-items-center me-4 mt-2">
      {/* Left Section - Logo and Sidebar Toggle */}
      <div className="d-flex align-items-center">
        <button 
          className="btn me-3"
          onClick={toggleSidebar}
          style={{ background: "none", border: "none" }}
        >
          <FaBars size={20} />
        </button>
        <h4 className="text-primary mb-0">AiMedicare</h4>
      </div>

      <div className="input-group mx-auto rounded-5" style={{ maxWidth: "450px", width: "100%" }}>
        <input
          type="text"
          className="form-control px-3"
          placeholder="Search..."
          style={{
            height: "100%",
            fontSize: "21px",
          }}
        />
        <button className="btn btn-primary" style={{ width: "75px", fontSize: "18px" }}>
          <FaSearch />
        </button>
      </div>

      
      <div className="d-flex align-items-center gap-4">
        {/* Settings Icon */}
        <FaCog size={22} className="cursor-pointer text-muted" onClick={() => navigate('/patient/settings')} />

        {/* Notification Bell */}
        <div className="position-relative cursor-pointer text-muted">
          <FaBell size={22} />
          <span
            className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
            style={{ fontSize: "12px" }}
          >
            3
          </span>
        </div>

        {/* Profile Circle with Dropdown */}
        <Dropdown align="end">
          <Dropdown.Toggle as="div" id="profile-dropdown" className="p-0">
            <div
              style={{
                width: "50px",
                height: "50px",
                backgroundColor: "#4CAF50",
                color: "#fff",
                borderRadius: "50%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontSize: "20px",
                fontWeight: "bold",
                cursor: "pointer",
                boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
              }}
            >
              {getUserInitials()}
            </div>
          </Dropdown.Toggle>

          <Dropdown.Menu>
            <Dropdown.Item onClick={() => navigate('/patient/profile')}>My Profile</Dropdown.Item>
            <Dropdown.Item onClick={() => navigate('/patient/settings')}>Settings</Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item onClick={handleLogout} className="text-danger">
              <FaSignOutAlt className="me-2" /> Logout
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
    </div>
  );
};

export default Navigation;
