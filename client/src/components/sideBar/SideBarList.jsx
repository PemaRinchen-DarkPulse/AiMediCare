import React from "react";
import { Link } from "react-router-dom";
import { 
  FaTachometerAlt, FaCalendarCheck, FaFileMedical, FaPills, 
  FaNotesMedical, FaEnvelope, FaFileInvoiceDollar, FaCog 
} from "react-icons/fa";

const SideBarList = ({ isOpen }) => {
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
    <ul style={{ padding: 0, margin: 0, listStyleType: "none" }}>
      {menuItems.map((item, index) => (
        <li key={index}>
          <Link
            to={item.path}
            style={{
              display: "flex",
              alignItems: "center",
              padding: "0.5rem 1rem",
              color: "#212529",
              textDecoration: "none",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis"
            }}
          >
            <div style={{ marginRight: isOpen ? "10px" : "0", width: "24px" }}>
              {item.icon}
            </div>
            {isOpen && <span>{item.label}</span>}
          </Link>
        </li>
      ))}
    </ul>
  );
};

export default SideBarList;
