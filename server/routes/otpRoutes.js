const express = require("express");
const { verifyOtp } = require("../controller/otpController");

const router = express.Router();

// POST request to verify OTP
router.post("/verifyOtp", verifyOtp);

module.exports = router;
