import React, { useState, useEffect } from 'react';
import axios from 'axios';

const OTPVerification = ({ email, onOtpVerified }) => {
  const [otp, setOtp] = useState(new Array(6).fill("")); // Initialize OTP array
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes in seconds
  const [error, setError] = useState(''); // Error state

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prevTime => prevTime - 1);
      }, 1000);
      return () => clearInterval(timer); // Cleanup on component unmount or timeLeft change
    }
  }, [timeLeft]);

  const formatTime = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
  };

  const handleChange = (element, index) => {
    if (!isNaN(element.value)) {
      const newOtp = [...otp];
      newOtp[index] = element.value;
      setOtp(newOtp);

      if (element.nextSibling) {
        element.nextSibling.focus();
      }
    }
  };

  const handleKeyDown = (event, index) => {
    if (event.key === "Backspace" && !otp[index] && event.target.previousSibling) {
      event.target.previousSibling.focus();
    }
  };

  const handleSubmit = async () => {
    const otpCode = otp.join(""); // Convert OTP array to a string

    try {
      const response = await axios.post("http://localhost:5000/api/otp/verifyOtp", {
        email: email, // Use the email prop passed from BasicInfo
        otp: otpCode,
      });
      alert(response.data.message);
      onOtpVerified(); // Notify the parent component that OTP is verified
    } catch (error) {
      if (error.response?.data?.error === "Invalid OTP") {
        setError("OTP doesn't match. Please try again.");
      } else {
        setError(error.response?.data?.error || "Error verifying OTP");
      }
    }
  };

  const handleResend = () => {
    setTimeLeft(120); 
    setError(''); 
    alert("OTP has been resent!");
  };

  return (
    <div>
      <div style={styles.card}>
        <h2 style={styles.heading}>OTP Verification</h2>
        <p style={styles.instruction}>
          Enter OTP code sent to your email <strong>{email}</strong>
        </p>
        <div style={styles.otpContainer}>
          {otp.map((_, index) => (
            <input
              key={index}
              type="text"
              maxLength="1"
              style={styles.inputBox}
              value={otp[index]}
              onChange={(e) => handleChange(e.target, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
            />
          ))}
        </div>
        {error && <p style={styles.errorMessage}>{error}</p>}
        <div className="d-flex">
          <p className="me-5" style={styles.resendText}>
            OTP Expires In: <span style={styles.resendLink}>{formatTime()}</span>
          </p>
          {timeLeft === 0 && (
            <p style={styles.resendText}>
              Didn’t receive OTP code?{" "}
              <span style={styles.resendLink} onClick={handleResend}>
                Resend
              </span>
            </p>
          )}
        </div>
        <div>
          <div className="d-grid gap-2 m-1">
            <button className="btn btn-primary" type="button" onClick={handleSubmit}>Verify & proceed</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  card: {
    textAlign: "center",
  },
  heading: {
    fontSize: "22px",
    marginBottom: "10px",
  },
  instruction: {
    fontSize: "14px",
    marginBottom: "20px",
  },
  otpContainer: {
    display: "flex",
    justifyContent: "center",
    gap: "10px",
    marginBottom: "20px",
  },
  inputBox: {
    width: "30px",
    height: "40px",
    textAlign: "center",
    fontSize: "18px",
    border: "1px solid #ccc",
    borderRadius: "5px",
  },
  resendText: {
    fontSize: "14px",
    color: "#444",
  },
  resendLink: {
    color: "#007bff",
    cursor: "pointer",
  },
  errorMessage: {
    color: "red",
    fontSize: "14px",
    marginTop: "10px",
  },
};

export default OTPVerification;
