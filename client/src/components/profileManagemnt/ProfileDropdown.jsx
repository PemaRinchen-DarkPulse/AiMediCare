import React from 'react';
import { FaUser, FaIdCard, FaLock, FaHistory, FaUserMd, FaPills, FaFileInvoice, FaCog, FaSignOutAlt } from 'react-icons/fa';

const ProfileDropdown = () => {
  return (
    <div className='border'
      style={{
        backgroundColor: '#fff',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        padding: '12px',
        borderRadius: '8px',
        position: 'absolute',
        top: '80px',
        right: '20px',
        width: '280px',
        zIndex: 999,
        transition: 'opacity 0.3s ease-in-out',
        opacity: 1,
      }}
    >
      <div style={{ padding: '8px 16px', fontWeight: 'bold', fontSize: '14px' }}>Account & Profile Settings</div>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        <DropdownItem icon={<FaUser />} text="Personal Details" />
        <DropdownItem icon={<FaIdCard />} text="Profile Picture & ID Upload" />
      </ul>
      
      <div style={{ padding: '8px 16px', fontWeight: 'bold', fontSize: '14px' }}>Privacy & Security</div>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        <DropdownItem icon={<FaLock />} text="Data Sharing Preferences" />
        <DropdownItem icon={<FaHistory />} text="Session & Login History" />
      </ul>
      
      <div style={{ padding: '8px 16px', fontWeight: 'bold', fontSize: '14px' }}>Appointment & Consultation</div>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        <DropdownItem icon={<FaUserMd />} text="Doctor Preferences" />
      </ul>
      
      <div style={{ padding: '8px 16px', fontWeight: 'bold', fontSize: '14px' }}>Medication & Pharmacy</div>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        <DropdownItem icon={<FaPills />} text="Medication Reminders" />
      </ul>
      
      <div style={{ padding: '8px 16px', fontWeight: 'bold', fontSize: '14px' }}>Insurance & Billing</div>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        <DropdownItem icon={<FaFileInvoice />} text="Insurance Policy Details" />
      </ul>
      
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, borderTop: '1px solid #ddd', marginTop: '8px' }}>
        <DropdownItem icon={<FaCog />} text="All Settings" />
        <DropdownItem icon={<FaSignOutAlt />} text="Logout" />
      </ul>
    </div>
  );
};

const DropdownItem = ({ icon, text }) => {
  return (
    <li
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '12px 16px',
        fontSize: '14px',
        cursor: 'pointer',
        borderRadius: '4px',
        transition: 'background-color 0.3s ease',
      }}
      onMouseOver={(e) => (e.target.style.backgroundColor = '#f4f4f4')}
      onMouseOut={(e) => (e.target.style.backgroundColor = 'transparent')}
    >
      <span style={{ marginRight: '8px' }}>{icon}</span>
      {text}
    </li>
  );
};

export default ProfileDropdown;
