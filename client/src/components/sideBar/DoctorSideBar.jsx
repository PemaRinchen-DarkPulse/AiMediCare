import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  FaTachometerAlt, FaCalendarCheck, FaFileMedical, FaPills, 
  FaNotesMedical, FaEnvelope, FaFileInvoiceDollar, FaCog 
} from "react-icons/fa";

const DoctorSideBar = ({ isOpen }) => {
  const location = useLocation();
  
  const menuItems = [
    { icon: <FaTachometerAlt />, label: "Dashboard", path: "/doctor/dashboard" },
    { icon: <FaCalendarCheck />, label: "Appointments", path: "/doctor/appointments" },
    { icon: <FaFileMedical />, label: "Patients", path: "/doctor/patients" },
    { icon: <FaPills />, label: "Diagnostics", path: "/doctor/diagnostics" },
    { icon: <FaCog />, label: "Settings", path: "/doctor/settings" },
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

export default DoctorSideBar;
