import React from 'react';
import { Nav, NavItem, NavLink } from 'reactstrap';
import { FaPills, FaHistory, FaUserMd, FaClipboardCheck } from 'react-icons/fa';
import PropTypes from 'prop-types';

const TabNavigation = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'active', title: 'Active Prescriptions', icon: <FaPills className="me-2" /> },
    { id: 'historical', title: 'Historical Prescription Record', icon: <FaHistory className="me-2" /> },
    { id: 'provider', title: 'Provider Prescription Review', icon: <FaUserMd className="me-2" /> },
    { id: 'reconciliation', title: 'Prescription Reconciliation', icon: <FaClipboardCheck className="me-2" /> }
  ];

  return (
    <Nav tabs className="mb-4">
      {tabs.map((tab) => (
        <NavItem key={tab.id}>
          <NavLink
            className={`d-flex align-items-center ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => onTabChange(tab.id)}
            style={{ cursor: 'pointer' }}
          >
            {tab.icon} {tab.title}
          </NavLink>
        </NavItem>
      ))}
    </Nav>
  );
};

TabNavigation.propTypes = {
  activeTab: PropTypes.string.isRequired,
  onTabChange: PropTypes.func.isRequired
};

export default TabNavigation;