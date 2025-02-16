import React from "react";
import { FaSearch, FaBell, FaPhone, FaBars } from "react-icons/fa";

const Navigation = ({ toggleSidebar, toggleDropdown }) => {
  return (
    <div className="d-flex justify-content-between align-items-center me-4 mt-2">
      {/* Left Section - Logo and Sidebar Toggle */}
      <div className="d-flex align-items-center">
        <button 
          className="btn me-3"
          onClick={toggleSidebar}
          style={{ background: "none", border: "none" }}
        >
          <FaBars size={20} />
        </button>
        <h4 className="text-primary mb-0">AiMedicare</h4>
      </div>

      <div className="input-group mx-auto rounded-5" style={{ maxWidth: "450px", width: "100%" }}>
        <input
          type="text"
          className="form-control px-3"
          placeholder="Search..."
          style={{
            height: "100%",
            fontSize: "21px",
          }}
        />
        <button className="btn btn-primary" style={{ width: "75px", fontSize: "18px" }}>
          <FaSearch />
        </button>
      </div>

      {/* Right Section - Contact Us, Notifications, Profile */}
      <div className="d-flex align-items-center gap-4">
       

        {/* Notification Bell */}
        <div className="position-relative cursor-pointer text-muted">
          <FaBell size={22} />
          <span
            className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
            style={{ fontSize: "12px" }}
          >
            3
          </span>
        </div>

        {/* Profile Circle */}
        <div
          onClick={toggleDropdown}
          style={{
            width: "50px",
            height: "50px",
            backgroundColor: "#4CAF50",
            color: "#fff",
            borderRadius: "50%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: "20px",
            fontWeight: "bold",
            cursor: "pointer",
            boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
          }}
        >
          P
        </div>
      </div>
    </div>
  );
};

export default Navigation;
