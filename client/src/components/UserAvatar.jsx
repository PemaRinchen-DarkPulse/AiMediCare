import React from "react";

/**
 * UserAvatar component displays either a profile image or initials in a colored circle
 * 
 * @param {Object} props
 * @param {string} props.name - User's full name
 * @param {string} props.image - URL to user's profile image (optional)
 * @param {string} props.size - Size of the avatar (default: "md")
 * @param {string} props.className - Additional CSS classes
 */
const UserAvatar = ({ name, image, size = "md", className = "" }) => {
  // Get size in pixels based on size prop
  const getSizeInPx = () => {
    switch (size) {
      case "xs": return "30px";
      case "sm": return "40px";
      case "md": return "50px";
      case "lg": return "70px";
      case "xl": return "100px";
      default: return size; // If a specific pixel value is passed
    }
  };

  // Generate user initials
  const getInitials = () => {
    if (!name) return "?";
    
    const nameParts = name.split(' ');
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }
    return nameParts[0][0].toUpperCase();
  };

  // Generate a consistent color based on the user's name
  const getBackgroundColor = () => {
    if (!name) return "#6c757d"; // Default gray
    
    // List of pleasant colors for avatars
    const colors = [
      "#4CAF50", "#2196F3", "#9C27B0", "#F44336", "#FF9800", 
      "#3F51B5", "#00BCD4", "#009688", "#E91E63", "#CDDC39"
    ];
    
    // Simple hash function to get a consistent color for a given name
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Use the hash to pick a color
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  // Determine if we should show the image or initials
  const showImage = image && image.trim() !== '';

  return (
    <div
      className={`user-avatar ${className}`}
      style={{
        width: getSizeInPx(),
        height: getSizeInPx(),
        backgroundColor: showImage ? "transparent" : getBackgroundColor(),
        color: "#fff",
        borderRadius: "50%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontSize: parseInt(getSizeInPx()) / 2.5 + "px",
        fontWeight: "bold",
        overflow: "hidden",
        boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
      }}
    >
      {showImage ? (
        <img
          src={image}
          alt={name || "User"}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
          onError={(e) => {
            // If image fails to load, show initials instead
            e.target.style.display = 'none';
            e.target.parentNode.style.backgroundColor = getBackgroundColor();
            e.target.parentNode.innerHTML = getInitials();
          }}
        />
      ) : (
        getInitials()
      )}
    </div>
  );
};

export default UserAvatar;