import React from 'react';
import SideBarList from './SideBarList';

const SideBar = ({ isOpen, toggleSidebar }) => {
  return (
    <div 
      className={`sidebar ${isOpen ? 'open' : ''} shadow border`} 
      style={{ 
        height: '95vh', 
        width: isOpen ? '250px' : '80px', 
        transition: 'width 0.1s ease',
        display: 'flex', 
        flexDirection: 'column',
        overflow: 'hidden',
        justifyContent: 'space-between',
      }}
    >
      <div>
        <button 
          onClick={toggleSidebar} 
          style={{
            background: 'none', 
            border: 'none', 
            padding: '10px', 
            cursor: 'pointer',
            alignSelf: 'center'
          }}
        >
        </button>
        <SideBarList isOpen={isOpen} />
      </div>
      
      {/* Footer Section */}
      {isOpen && (
        <div style={{
          padding: '10px',
          textAlign: 'center',
          borderTop: '1px solid #ddd',
          fontSize: '14px',
          color: 'black',
          marginBottom:'30px'
        }}>
          &copy; Peam Rinchen & Tshewang Rinzin
        </div>
      )}
    </div>
  );
};

export default SideBar;
