import React, { useState, useEffect } from 'react';

const OTPVerification = () => {
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes in seconds

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
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

  const handleResend = () => {
    setTimeLeft(120); // Reset the timer
    alert("OTP has been resent!");
  };

  const handleSubmit = () => {
    alert(`Entered OTP: ${otp.join("")}`);
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
        <div class="d-grid gap-2">
  <button class="btn btn-primary" type="button">Button</button>
  <button class="btn btn-primary" type="button">Button</button>
</div>
        </div>
        <div>
          <button style={styles.button} onClick={() => alert("Cancelled!")}>
            Cancel
          </button>
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
    color: "#6b6b6b",
    marginBottom: "20px",
  },
  otpContainer: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "20px",
  },
  inputBox: {
    width: "50px",
    height: "50px",
    textAlign: "center",
    fontSize: "18px",
    borderRadius: "5px",
    border: "1px solid #dcdcdc",
  },
  resendText: {
    fontSize: "14px",
    color: "#6b6b6b",
  },
  resendLink: {
    color: "#007BFF",
    cursor: "pointer",
  },
  button: {
    marginTop: "20px",
    padding: "10px 20px",
    backgroundColor: "#007BFF",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "16px",
  },
};

export default OTPVerification;
