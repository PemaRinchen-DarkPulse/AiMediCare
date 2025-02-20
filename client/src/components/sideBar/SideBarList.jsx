import React from "react";
import { Link } from "react-router-dom";
import { 
  FaTachometerAlt, FaCalendarCheck, FaFileMedical, FaPills, 
  FaNotesMedical, FaEnvelope, FaFileInvoiceDollar, FaCog 
} from "react-icons/fa";

const SideBarList = ({ isOpen }) => {
  const menuItems = [
    { icon: <FaTachometerAlt />, label: "Dashboard", path: "/aimedicare/dashboard" },
    { icon: <FaCalendarCheck />, label: "Appointments", path: "/aimedicare/appointments" },
    { icon: <FaFileMedical />, label: "Health Records", path: "/aimedicare/health-records" },
    { icon: <FaPills />, label: "Medications", path: "/aimedicare/medications" },
    { icon: <FaNotesMedical />, label: "Pre-Visit Triage", path: "/aimedicare/triage" },
    { icon: <FaEnvelope />, label: "Messages", path: "/aimedicare/messages" },
    { icon: <FaFileInvoiceDollar />, label: "Billing & Insurance", path: "/aimedicare/billing" },
    { icon: <FaCog />, label: "Settings", path: "/aimedicare/settings" }
  ];

  return (
    <ul style={{ padding: 0, margin: 0, listStyleType: "none" }}>
      {menuItems.map((item, index) => (
        <li key={index} style={{ margin: "5px 0" }}>
          <Link 
            to={item.path} 
            style={{
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              padding: "10px",
              cursor: "pointer",
              transition: "0.3s",
              justifyContent: isOpen ? "flex-start" : "center",
              color: "black"
            }}
          >
            <span style={{ fontSize: "18px" }}>{item.icon}</span>
            {isOpen && <span style={{ marginLeft: "10px" }}>{item.label}</span>}
          </Link>
        </li>
      ))}
    </ul>
  );
};

export default SideBarList;
