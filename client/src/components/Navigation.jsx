import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaBell, FaBars, FaCog, FaSignOutAlt } from "react-icons/fa";
import { Dropdown } from "react-bootstrap";
import { useAuth } from "../context/AuthContext";
import { toast } from 'react-toastify';

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
    <nav 
      className="modern-navbar d-flex justify-content-between align-items-center px-4 py-3"
      style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
        backdropFilter: 'blur(20px)',
        position: 'sticky',
        top: 0,
        zIndex: 1040,
        margin: 0,
        borderRadius: 0,
      }}
    >
      {/* Left Section - Logo and Sidebar Toggle */}
      <div className="d-flex align-items-center">
        <button 
          className="navbar-toggle-btn me-3"
          onClick={toggleSidebar}
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            borderRadius: '12px',
            padding: '12px',
            color: 'white',
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px) scale(1.05)';
            e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0) scale(1)';
            e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
          }}
        >
          <FaBars size={18} />
        </button>
        
        <div className="brand-container d-flex align-items-center">
          <h4 
            className="brand-text mb-0"
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: '700',
              fontSize: '1.4rem',
              letterSpacing: '-0.5px',
            }}
          >
            AiMedicare
          </h4>
        </div>
      </div>

      {/* Center Section - Modern Search Bar */}
      <div 
        className="search-container mx-auto"
        style={{ 
          maxWidth: '480px', 
          width: '100%',
          position: 'relative',
        }}
      >
        <div 
          className="search-wrapper"
          style={{
            position: 'relative',
            background: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '16px',
            border: '1px solid rgba(226, 232, 240, 0.8)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
            backdropFilter: 'blur(10px)',
            overflow: 'hidden',
            transition: 'all 0.3s ease',
          }}
          onFocus={(e) => {
            e.currentTarget.style.boxShadow = '0 8px 30px rgba(102, 126, 234, 0.15)';
            e.currentTarget.style.border = '1px solid rgba(102, 126, 234, 0.3)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.06)';
            e.currentTarget.style.border = '1px solid rgba(226, 232, 240, 0.8)';
          }}
        >
          <input
            type="text"
            className="search-input"
            placeholder="Search patients, appointments, or records..."
            style={{
              width: '100%',
              border: 'none',
              outline: 'none',
              padding: '14px 20px 14px 50px',
              fontSize: '15px',
              background: 'transparent',
              color: '#374151',
              fontWeight: '500',
            }}
          />
          <FaSearch 
            style={{
              position: 'absolute',
              left: '18px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#9ca3af',
              fontSize: '16px',
            }}
          />
          <button 
            className="search-btn"
            style={{
              position: 'absolute',
              right: '8px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              borderRadius: '10px',
              padding: '8px 16px',
              color: 'white',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-50%) scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(-50%) scale(1)';
            }}
          >
            Search
          </button>
        </div>
      </div>

      {/* Right Section - Action Icons */}
      <div className="d-flex align-items-center gap-3">
        {/* Settings Icon */}
        <div 
          className="nav-icon-btn"
          onClick={navigateToSettings}
          style={{
            width: '44px',
            height: '44px',
            background: 'rgba(255, 255, 255, 0.8)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            border: '1px solid rgba(226, 232, 240, 0.8)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            backdropFilter: 'blur(10px)',
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(102, 126, 234, 0.1)';
            e.target.style.border = '1px solid rgba(102, 126, 234, 0.3)';
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.8)';
            e.target.style.border = '1px solid rgba(226, 232, 240, 0.8)';
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'none';
          }}
        >
          <FaCog size={18} style={{ color: '#6b7280' }} />
        </div>

        {/* Notification Bell */}
        <div 
          className="nav-icon-btn position-relative"
          style={{
            width: '44px',
            height: '44px',
            background: 'rgba(255, 255, 255, 0.8)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            border: '1px solid rgba(226, 232, 240, 0.8)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            backdropFilter: 'blur(10px)',
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(239, 68, 68, 0.1)';
            e.target.style.border = '1px solid rgba(239, 68, 68, 0.3)';
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 8px 25px rgba(239, 68, 68, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.8)';
            e.target.style.border = '1px solid rgba(226, 232, 240, 0.8)';
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'none';
          }}
        >
          <FaBell size={18} style={{ color: '#6b7280' }} />
          <span
            className="notification-badge position-absolute"
            style={{
              top: '-2px',
              right: '-2px',
              width: '20px',
              height: '20px',
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              color: 'white',
              borderRadius: '50%',
              fontSize: '11px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid white',
              boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)',
              animation: 'pulse 2s infinite',
            }}
          >
            3
          </span>
        </div>

        {/* Profile Avatar with Dropdown */}
        <Dropdown 
          align="end" 
          show={showDropdown} 
          onToggle={(isOpen) => setShowDropdown(isOpen)}
        >
          <Dropdown.Toggle 
            as="div" 
            id="profile-dropdown" 
            className="p-0"
            style={{ border: 'none', background: 'none', boxShadow: 'none' }}
            bsPrefix="custom-dropdown-toggle"
          >
            <div
              className="profile-avatar"
              style={{
                width: '44px',
                height: '44px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#fff',
                borderRadius: '12px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontSize: '16px',
                fontWeight: '700',
                cursor: 'pointer',
                border: '2px solid white',
                boxShadow: '0 4px 20px rgba(16, 185, 129, 0.25)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px) scale(1.05)';
                e.target.style.boxShadow = '0 8px 30px rgba(16, 185, 129, 0.35)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0) scale(1)';
                e.target.style.boxShadow = '0 4px 20px rgba(16, 185, 129, 0.25)';
              }}
            >
              {getUserInitials()}
            </div>
          </Dropdown.Toggle>

          <Dropdown.Menu 
            className="profile-dropdown-menu"
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(226, 232, 240, 0.8)',
              borderRadius: '12px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              padding: '8px',
              minWidth: '200px',
            }}
          >
            <Dropdown.Item 
              onClick={navigateToProfile}
              style={{
                borderRadius: '8px',
                padding: '12px 16px',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s ease',
              }}
            >
              My Profile
            </Dropdown.Item>
            <Dropdown.Item 
              onClick={navigateToSettings}
              style={{
                borderRadius: '8px',
                padding: '12px 16px',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s ease',
              }}
            >
              Settings
            </Dropdown.Item>
            <Dropdown.Divider style={{ margin: '8px 0' }} />
            <Dropdown.Item 
              onClick={handleLogout} 
              className="text-danger"
              style={{
                borderRadius: '8px',
                padding: '12px 16px',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s ease',
              }}
            >
              <FaSignOutAlt className="me-2" /> Logout
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        
        .search-input::placeholder {
          color: #9ca3af;
          font-weight: 400;
        }
        
        .profile-dropdown-menu .dropdown-item:hover {
          background: rgba(102, 126, 234, 0.1) !important;
          color: #667eea !important;
        }
        
        .nav-icon-btn:hover {
          transform: translateY(-2px);
        }

        /* Hide dropdown arrow/caret */
        .custom-dropdown-toggle::after {
          display: none !important;
        }
        
        .dropdown-toggle::after {
          display: none !important;
        }
        
        .dropdown-toggle {
          border: none !important;
          background: none !important;
          box-shadow: none !important;
        }
      `}</style>
    </nav>
  );
};

export default Navigation;
