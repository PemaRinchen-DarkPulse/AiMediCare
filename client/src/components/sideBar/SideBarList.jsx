import React from 'react';
import { FaTachometerAlt, FaCalendarCheck, FaUserInjured, FaFileInvoiceDollar, FaCog } from 'react-icons/fa';

const SideBarList = ({ isOpen }) => {
  return (
    <div>
      <ul style={styles.list}>
        <li style={{ ...styles.listItem, ...(isOpen ? {} : styles.centerItem) }}>
          <FaTachometerAlt style={styles.icon} /> {isOpen && 'Dashboard'}
        </li>
        <li style={{ ...styles.listItem, ...(isOpen ? {} : styles.centerItem) }}>
          <FaCalendarCheck style={styles.icon} /> {isOpen && 'Appointments'}
        </li>
        <li style={{ ...styles.listItem, ...(isOpen ? {} : styles.centerItem) }}>
          <FaUserInjured style={styles.icon} /> {isOpen && 'Patient Records'}
        </li>
        <li style={{ ...styles.listItem, ...(isOpen ? {} : styles.centerItem) }}>
          <FaFileInvoiceDollar style={styles.icon} /> {isOpen && 'Billing'}
        </li>
        <li style={{ ...styles.listItem, ...(isOpen ? {} : styles.centerItem) }}>
          <FaCog style={styles.icon} /> {isOpen && 'Settings'}
        </li>
      </ul>
    </div>
  );
};

const styles = {
  list: {
    listStyleType: 'none',
    padding: 0,
    margin: 0,
  },
  listItem: {
    padding: '15px',
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    textAlign: 'left', // Default text alignment for open sidebar
  },
  centerItem: {
    justifyContent: 'center', // Center icon and text when sidebar is collapsed
    textAlign: 'center',      // Center the text when sidebar is collapsed
  },
  icon: {
    marginRight: '10px',
    fontSize: '18px', // Adjust icon size if needed
  }
};

export default SideBarList;
