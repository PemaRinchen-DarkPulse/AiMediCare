import React from 'react';
import SideBarList from './SideBarList';
import './ModernSidebar.css';

const SideBar = ({ isOpen, toggleSidebar }) => {
  return (
    <div 
      className={`healthcare-sidebar sidebar-patient ${isOpen ? 'open' : ''}`}
      style={{ 
        height: '95vh', 
        width: isOpen ? '250px' : '80px', 
        display: 'flex', 
        flexDirection: 'column',
        position: 'relative',
      }}
    >
      {/* Menu Items */}
      <div style={{ flex: 1, overflow: 'hidden', paddingTop: '1rem' }}>
        <SideBarList isOpen={isOpen} />
      </div>
    </div>
  );
};

export default SideBar;
