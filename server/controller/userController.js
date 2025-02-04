const User = require('../models/User');
const { generateOTP } = require('../utils/otpUtils');
const sendEmail = require('../utils/sendEmailUtils'); // Import sendEmail utility

const signup = async (req, res) => {
  try {
    const { name, email, password, dob } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ existingUser: true, message: 'Email already exists' });
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); 

    const newUser = new User({ name, email, password, dob, otp: { value: otp, expiresAt } });
    await newUser.save();

    const emailResult = await sendEmail(email, "OTP for Registration", `Your OTP is: ${otp}`);
    if (emailResult.success) {
      return res.status(201).json({ message: 'User created successfully, OTP sent to email' });
    } else {
      return res.status(500).json({ message: 'User created, but failed to send email.', error: emailResult.error });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error', error });
  }
};


module.exports = { signup };
