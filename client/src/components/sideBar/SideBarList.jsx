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
    { icon: <FaEnvelope />, label: "Messages", path: "/patient/messages" },
    { icon: <FaFileInvoiceDollar />, label: "Billing & Insurance", path: "/patient/billing" },
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
