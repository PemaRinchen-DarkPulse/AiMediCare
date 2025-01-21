const User = require("../models/User");
const moment = require("moment");

const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    // Check if OTP exists and hasn't expired
    if (!user.otp || moment().isAfter(user.otp.expiresAt)) {
      return res.status(400).json({ error: "OTP has expired or doesn't exist" });
    }

    // Check if the entered OTP matches
    if (user.otp.value === otp) {
      return res.status(200).json({ message: "OTP verified successfully" });
    } else {
      return res.status(400).json({ error: "Incorrect OTP" });
    }
  } catch (err) {
    console.error("Error verifying OTP:", err);
    res.status(500).json({ error: "Failed to verify OTP" });
  }
};

module.exports = { verifyOtp };
