import React, { useState, useEffect } from 'react';
import axios from 'axios';

const OTPVerification = () => {
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes in seconds
  const [error, setError] = useState('');

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
      const response = await axios.post("http://localhost:5000/api/otp/verify", {
        email: 'userEmail', // Ensure you pass the email dynamically
        otp: otpCode,
      });
      alert(response.data.message);
    } catch (error) {
      setError(error.response?.data?.error || "Error verifying OTP");
    }
  };

  const handleResend = () => {
    setTimeLeft(120); // Reset the timer
    alert("OTP has been resent!");
  };

  return (
    <div className="p-4">
      <div style={styles.card}>
        <h2 style={styles.heading}>OTP Verification</h2>
        <p style={styles.instruction}>
          Enter OTP code sent to your email <strong>example@gmail.com</strong>
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
    fontSize: "20px",
  },
  resendText: {
    fontSize: "14px",
    color: "gray",
  },
  resendLink: {
    color: "#007BFF",
    cursor: "pointer",
  }
};

export default OTPVerification;
