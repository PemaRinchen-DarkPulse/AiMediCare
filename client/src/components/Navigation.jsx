import React from "react";

const Navigation = ({ toggleDropdown }) => {
  return (
    <div className="w-100 d-flex justify-content-end align-items-center">
      <div>Notification</div>
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
          fontSize: "18px",
          fontWeight: "bold",
          cursor: "pointer",
        }}
      >
        P
      </div>
    </div>
  );
};

export default Navigation;
