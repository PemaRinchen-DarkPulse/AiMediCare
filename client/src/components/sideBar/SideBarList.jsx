import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  FaTachometerAlt, FaCalendarCheck, FaFileMedical, FaPills, 
  FaNotesMedical, FaEnvelope, FaFileInvoiceDollar, FaCog 
} from "react-icons/fa";

const SideBarList = ({ isOpen }) => {
  const location = useLocation();
  
  const menuItems = [
    { icon: <FaTachometerAlt />, label: "Dashboard", path: "/patient/dashboard" },
    { icon: <FaCalendarCheck />, label: "Appointments", path: "/patient/appointments" },
    { icon: <FaFileMedical />, label: "Health Records", path: "/patient/health-records" },
    { icon: <FaPills />, label: "Medications", path: "/patient/medications" },
    { icon: <FaNotesMedical />, label: "Pre-Visit Triage", path: "/patient/triage" },
    { icon: <FaEnvelope />, label: "Diagnostics", path: "/patient/diagnostics" },
    { icon: <FaCog />, label: "Settings", path: "/patient/settings" },
  ];

  return (
    <ul className="sidebar-menu">
      {menuItems.map((item, index) => (
        <li key={index} className="sidebar-menu-item">
          <Link
            to={item.path}
            className={`sidebar-menu-link ${location.pathname === item.path ? 'active' : ''}`}
          >
            <div className="sidebar-menu-icon">
              {item.icon}
            </div>
            <span className="sidebar-menu-text">{item.label}</span>
            {!isOpen && (
              <div className="sidebar-tooltip">
                {item.label}
              </div>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
};

export default SideBarList;
