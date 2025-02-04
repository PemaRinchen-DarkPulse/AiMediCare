import React from 'react';
import SideBarList from './SideBarList';
import { FaBars } from 'react-icons/fa';

const SideBar = ({ isOpen, toggleSidebar }) => {
  return (
    <div 
      className={`sidebar ${isOpen ? 'open' : ''} shadow border`} 
      style={{ 
        height: '100vh', 
        width: isOpen ? '250px' : '80px', 
        transition: 'width 0.1s ease',
        display: 'flex', 
        flexDirection: 'column'
      }}
    >
      <div 
        className="d-flex justify-content-between align-items-center"
        style={{
          padding: '10px 20px',
          ...(isOpen ? {} : { justifyContent: 'center', width: '100%' })
        }}
      >
        {isOpen && <h4 className='text-primary'>AiMedicare</h4>} 
        <button
          className="btn"
          type="button"
          onClick={toggleSidebar}
          style={{ background: 'none', border: 'none' }}
        >
          <FaBars size={18} />
        </button>
      </div>
      <hr />
      <SideBarList isOpen={isOpen} />
      <div style={{ flex: 1 }} />
      {isOpen && (
        <div className="footer" style={{fontSize: '12px', color: '#6c757d', textAlign: 'center', padding: '20px 0' }}>
          <hr />
          <p className="px-3" style={{ marginBottom: '0' }}>
            &copy; {new Date().getFullYear()} Design and Developed by <span style={{ fontWeight: 'bold' }}>Pema Rinchen</span> & <span style={{ fontWeight: 'bold' }}>Tshewang Rinzin</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default SideBar;
