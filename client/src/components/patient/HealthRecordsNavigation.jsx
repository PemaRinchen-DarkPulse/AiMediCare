import React from 'react';
import PropTypes from 'prop-types';
import { Nav, NavItem, NavLink } from 'reactstrap';

const HealthRecordsNavigation = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'summary', label: 'Summary', icon: 'fas fa-clipboard-list' },
    { id: 'medicalHistory', label: 'Medical History', icon: 'fas fa-file-medical' },
    { id: 'medications', label: 'Medications', icon: 'fas fa-pills' },
    { id: 'labResults', label: 'Lab Results', icon: 'fas fa-flask' },
    { id: 'imaging', label: 'Imaging', icon: 'fas fa-x-ray' },
    { id: 'vitals', label: 'Vitals', icon: 'fas fa-heartbeat' },
    { id: 'immunizations', label: 'Immunizations', icon: 'fas fa-syringe' },
    { id: 'treatmentPlans', label: 'Treatment Plans', icon: 'fas fa-clipboard-check' }
  ];

  return (
    <Nav tabs className="mb-4 flex-nowrap overflow-auto hide-scrollbar">
      {tabs.map(tab => (
        <NavItem key={tab.id}>
          <NavLink
            className={`cursor-pointer px-3 py-2 d-flex align-items-center ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <i className={`${tab.icon} me-2`}></i>
            <span>{tab.label}</span>
          </NavLink>
        </NavItem>
      ))}
    </Nav>
  );
};

HealthRecordsNavigation.propTypes = {
  activeTab: PropTypes.string.isRequired,
  setActiveTab: PropTypes.func.isRequired
};

export default HealthRecordsNavigation;