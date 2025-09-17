import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  FaTachometerAlt, FaCalendarCheck, FaFileMedical, FaPills, 
  FaNotesMedical, FaStethoscope, FaFileInvoiceDollar, FaCog,
  FaHeartbeat, FaSyringe, FaClipboardList
} from "react-icons/fa";

const SideBarList = ({ isOpen }) => {
  const location = useLocation();
  
  const menuItems = [
    { 
      icon: <FaTachometerAlt />, 
      label: "Dashboard", 
      path: "/patient/dashboard",
      description: "Overview and quick access"
    },
    { 
      icon: <FaCalendarCheck />, 
      label: "Appointments", 
      path: "/patient/appointments",
      description: "Manage your appointments"
    },
    { 
      icon: <FaFileMedical />, 
      label: "Health Records", 
      path: "/patient/health-records",
      description: "View medical history"
    },
    { 
      icon: <FaPills />, 
      label: "Medications", 
      path: "/patient/medications",
      description: "Track prescriptions"
    },
    { 
      icon: <FaClipboardList />, 
      label: "Pre-Visit Triage", 
      path: "/patient/triage",
      description: "Complete health assessments"
    },
    { 
      icon: <FaStethoscope />, 
      label: "Diagnostics", 
      path: "/patient/diagnostics",
      description: "Lab results and tests"
    },
    { 
      icon: <FaFileInvoiceDollar />, 
      label: "Billing", 
      path: "/patient/billing-insurance",
      description: "Insurance and payments"
    },
    { 
      icon: <FaCog />, 
      label: "Settings", 
      path: "/patient/settings",
      description: "Account preferences"
    },
  ];

  return (
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
  );
};

export default SideBarList;
