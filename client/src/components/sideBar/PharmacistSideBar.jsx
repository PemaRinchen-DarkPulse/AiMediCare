import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  FaTachometerAlt, FaPills, FaUsers, FaFileInvoiceDollar, 
  FaCog, FaUserCheck, FaClipboardCheck, FaChartLine,
  FaPrescriptionBottleAlt, FaSearch,
  FaHistory, FaShieldAlt, FaExclamationTriangle
} from "react-icons/fa";
import './ModernSidebar.css';

const PharmacistSideBar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  
  const menuItems = [
    { 
      icon: <FaTachometerAlt />, 
      label: "Dashboard", 
      path: "/pharmacist/dashboard",
      description: "Overview and analytics"
    },
    { 
      icon: <FaPills />, 
      label: "Prescriptions", 
      path: "/pharmacist/prescriptions",
      description: "Manage prescriptions"
    },
    { 
      icon: <FaClipboardCheck />, 
      label: "Dispensing", 
      path: "/pharmacist/dispensing",
      description: "Medication dispensing"
    },
    { 
      icon: <FaSearch />, 
      label: "Drug Information", 
      path: "/pharmacist/drug-info",
      description: "Drug database and interactions"
    },
    { 
      icon: <FaUsers />, 
      label: "Patients", 
      path: "/pharmacist/patients",
      description: "Patient consultation"
    },
    { 
      icon: <FaExclamationTriangle />, 
      label: "Drug Interactions", 
      path: "/pharmacist/interactions",
      description: "Safety alerts and warnings"
    },
    { 
      icon: <FaHistory />, 
      label: "Medication History", 
      path: "/pharmacist/history",
      description: "Patient medication records"
    },
    { 
      icon: <FaChartLine />, 
      label: "Inventory", 
      path: "/pharmacist/inventory",
      description: "Stock management"
    },
    { 
      icon: <FaFileInvoiceDollar />, 
      label: "Billing", 
      path: "/pharmacist/billing",
      description: "Insurance and payments"
    },
    { 
      icon: <FaCog />, 
      label: "Settings", 
      path: "/pharmacist/settings",
      description: "Account preferences"
    },
  ];

  return (
    <div 
      className={`healthcare-sidebar sidebar-pharmacist ${isOpen ? 'open' : ''}`}
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
        <ul className="sidebar-menu">
          {menuItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            
            return (
              <li key={index} className="sidebar-menu-item">
                <Link
                  to={item.path}
                  className={`sidebar-menu-link ${isActive ? 'active' : ''}`}
                  title={!isOpen ? item.label : ''}
                >
                  <div className="sidebar-icon-container">
                    {item.icon}
                  </div>
                  <span className="sidebar-label">{item.label}</span>
                  
                  {/* Tooltip for collapsed state */}
                  {!isOpen && (
                    <div className="sidebar-tooltip">
                      <div className="fw-semibold">{item.label}</div>
                      <div style={{ fontSize: '0.65rem', opacity: 0.9 }}>
                        {item.description}
                      </div>
                    </div>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default PharmacistSideBar;