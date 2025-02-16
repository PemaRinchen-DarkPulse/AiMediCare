import React from "react";
import { 
  FaTachometerAlt, FaCalendarCheck, FaFileMedical, FaPills, 
  FaNotesMedical, FaEnvelope, FaFileInvoiceDollar, FaCog 
} from "react-icons/fa";

const SideBarList = ({ isOpen }) => {
  const menuItems = [
    { icon: <FaTachometerAlt />, label: "Dashboard" },
    { icon: <FaCalendarCheck />, label: "Appointments" },
    { icon: <FaFileMedical />, label: "Health Records" },
    { icon: <FaPills />, label: "Medications" },
    { icon: <FaNotesMedical />, label: "Pre-Visit Triage" },
    { icon: <FaEnvelope />, label: "Messages" },
    { icon: <FaFileInvoiceDollar />, label: "Billing & Insurance" },
    { icon: <FaCog />, label: "Settings" }
  ];

  return (
    <ul style={{ padding: 0, margin: 0, listStyleType: "none" }}>
      {menuItems.map((item, index) => (
        <li
          key={index}
          style={{
            display: "flex",
            alignItems: "center",
            padding: "12px",
            cursor: "pointer",
            transition: "0.3s",
            color: "#fff",
            background: "#2C3E50",
            margin: "5px 0",
            borderRadius: "8px",
            justifyContent: isOpen ? "flex-start" : "center", // Align items properly
          }}
        >
          <span style={{ fontSize: "18px" }}>{item.icon}</span>
          {isOpen && <span style={{ marginLeft: "10px" }}>{item.label}</span>}
        </li>
      ))}
    </ul>
  );
};

export default SideBarList;
