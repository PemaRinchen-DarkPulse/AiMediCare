const User = require('../models/User');
const { generateOTP } = require('../utils/otpUtils');
const sendEmail = require('../utils/sendEmailUtils'); // Import sendEmail utility

const signup = async (req, res) => {
  try {
    const { name, email, password, dob } = req.body;

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Generate OTP and set expiration time
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes

    // Create a new user
    const newUser = new User({
      name,
      email,
      password,
      dob,
      otp: { value: otp, expiresAt }
    });

    // Save the user to the database
    await newUser.save();

    // Send the OTP email
    const emailResult = await sendEmail(email, "OTP for Registration", `Your OTP is: ${otp}`);

    // Check if email was sent successfully
    if (emailResult.success) {
      return res.status(201).json({ message: 'User created successfully, OTP sent to email', otp });
    } else {
      // If email sending fails
      return res.status(500).json({
        message: 'User created, but failed to send email.',
        error: emailResult.error,
        details: emailResult.details
      });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error', error });
  }
};

module.exports = { signup };
