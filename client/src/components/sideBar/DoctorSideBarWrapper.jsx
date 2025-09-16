import React, { useEffect, useState } from 'react';
import { FaBars, FaTimes, FaStethoscope } from 'react-icons/fa';
import DoctorSideBar from './DoctorSideBar';
import '../../styles/Sidebar.css';

const DoctorSideBarWrapper = ({ isOpen, toggleSidebar }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleOverlayClick = () => {
    if (isMobile && isOpen) {
      toggleSidebar();
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && (
        <div 
          className={`sidebar-overlay ${isOpen ? 'active' : ''}`}
          onClick={handleOverlayClick}
        />
      )}
      
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Header Section */}
        <div className="sidebar-header">
          {isOpen && (
            <div className="sidebar-brand">
              <FaStethoscope style={{ marginRight: '10px', color: '#4ecdc4' }} />
              Doctor Portal
            </div>
          )}
          <button 
            className="sidebar-toggle"
            onClick={toggleSidebar}
            aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}
          >
            {isOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* Content Section */}
        <div className="sidebar-content">
          <DoctorSideBar isOpen={isOpen} />
        </div>
        
        {/* Footer Section */}
        <div className="sidebar-footer">
          © 2025 Pema Rinchen & Tshewang Rinzin
          <br />
          <small>All rights reserved</small>
        </div>
      </div>
    </>
  );
};

export default DoctorSideBarWrapper;