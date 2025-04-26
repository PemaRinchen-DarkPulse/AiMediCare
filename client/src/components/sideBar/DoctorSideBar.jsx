import React from "react";
import { Link } from "react-router-dom";
import { 
  FaTachometerAlt, FaCalendarCheck, FaFileMedical, FaPills, 
  FaNotesMedical, FaEnvelope, FaFileInvoiceDollar, FaCog 
} from "react-icons/fa";

const DoctorSideBar = ({ isOpen }) => {
  const menuItems = [
    { icon: <FaTachometerAlt />, label: "Dashboard", path: "/doctor/dashboard" },
    { icon: <FaCalendarCheck />, label: "Appointmenst", path: "/doctor/appointments" },
    { icon: <FaFileMedical />, label: "Patients", path: "/doctor/patients" },
    { icon: <FaPills />, label: "Diagnostics", path: "/doctor/diagnostics" },
    { icon: <FaNotesMedical />, label: "Link 4", path: "/patient/triage" },
    { icon: <FaEnvelope />, label: "Link 5", path: "/aimedicare/messages" },
    { icon: <FaFileInvoiceDollar />, label: "Link 6", path: "/aimedicare/billing" },
    { icon: <FaCog />, label: "Link 8", path: "/aimedicare/settings" }
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

export default DoctorSideBar;
