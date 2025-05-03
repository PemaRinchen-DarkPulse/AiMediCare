const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Pharmacist = require('../models/Pharmacist');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/email');

// Generate JWT token for user authentication
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// Register a new user with email verification
exports.register = async (req, res) => {
  try {
    console.log('Registration request received:', req.body);
    
    const { 
      name, email, password, role, dateOfBirth, gender, phoneNumber,
      // Address fields
      streetAddress, city, stateProvince, zipCode, country,
      
      // Doctor specific fields
      medicalLicenseNumber, licenseExpiryDate, issuingAuthority, specialization,
      yearsExperience, hospitalAffiliation, hospitalName, hospitalAddress, 
      practiceLocation, consultationFee, accountHolder,
      bankName, accountNumber, routingNumber,
      // Clinic details
      clinicName, clinicPhone, clinicWebsite, 
      clinicStreet, clinicCity, clinicState, clinicZipCode, clinicCountry,
      
      // Patient specific fields
      emergencyContactName, emergencyContactPhone, emergencyContactRelationship,
      insuranceProvider, policyNumber, groupNumber,
      
      // Pharmacist specific fields
      licenseNumber, pharmacyName, pharmacyAddress, pharmacyPhone,
      weekdayHours, weekendHours, customHours
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Email already registered. Please login.',
        toast: {
          type: 'error',
          message: 'Email already registered. Please login.'
        }
      });
    }

    // Create new user with common fields
    const newUser = new User({
      name,
      email,
      password,
      role: role?.toLowerCase() || 'patient', // Default to patient if no role provided
      dateOfBirth,
      gender,
      phoneNumber,
      address: {
        street: streetAddress,
        city,
        state: stateProvince,
        zipCode,
        country
      }
    });

    // Generate verification token
    const verificationToken = newUser.generateVerificationToken();
    
    console.log('Saving new user:', newUser);
    
    // Save user to get the _id
    await newUser.save();
    
    // Based on role, create and save role-specific data
    try {
      if (role?.toLowerCase() === 'doctor' && medicalLicenseNumber) {
        console.log('Creating doctor profile');
        const doctorProfile = new Doctor({
          user: newUser._id,
          medicalLicenseNumber,
          licenseExpiryDate,
          issuingAuthority,
          specialty: specialization,
          specialization,
          yearsExperience: Number(yearsExperience) || 0,
          experience: Number(yearsExperience) || 0,
          hospitalName: hospitalName || hospitalAffiliation,
          hospitalAddress,
          practiceLocation: practiceLocation || hospitalAddress,
          consultationFee: Number(consultationFee) || 0,
          accountHolder,
          bankName,
          accountNumber,
          routingNumber,
          clinicAddress: {
            street: clinicStreet || streetAddress,
            city: clinicCity || city,
            state: clinicState || stateProvince,
            zipCode: clinicZipCode || zipCode,
            country: clinicCountry || country
          }
        });
        console.log('Doctor profile created:', doctorProfile);
        await doctorProfile.save();
        console.log('Doctor profile saved successfully');
      } 
      else if (role?.toLowerCase() === 'patient') {
        console.log('Creating patient profile');
        const patientProfile = new Patient({
          user: newUser._id,
          emergencyContact: {
            name: emergencyContactName,
            phone: emergencyContactPhone,
            relationship: emergencyContactRelationship
          },
          insurance: {
            provider: insuranceProvider,
            policyNumber,
            groupNumber
          }
        });
        console.log('Patient profile created:', patientProfile);
        await patientProfile.save();
        console.log('Patient profile saved successfully');
      } 
      else if (role?.toLowerCase() === 'pharmacist' && licenseNumber) {
        console.log('Creating pharmacist profile');
        const pharmacistProfile = new Pharmacist({
          user: newUser._id,
          licenseNumber,
          licenseExpiryDate,
          issuingAuthority,
          yearsExperience: Number(yearsExperience) || 0,
          pharmacyName,
          pharmacyAddress,
          pharmacyPhone,
          accountHolder,
          bankName,
          accountNumber,
          routingNumber,
          operationalHours: {
            weekday: weekdayHours,
            weekend: weekendHours,
            custom: customHours
          }
        });
        console.log('Pharmacist profile created:', pharmacistProfile);
        await pharmacistProfile.save();
        console.log('Pharmacist profile saved successfully');
      }
    } catch (profileError) {
      // If there's an error saving the profile, delete the user and throw error
      console.error('Error saving profile:', profileError);
      await User.findByIdAndDelete(newUser._id);
      throw new Error(`Error saving ${role} profile: ${profileError.message}`);
    }

    // Create verification URL that matches the route in authRoutes.js
    const verificationURL = `${process.env.CLIENT_URL}/api/auth/verify/${verificationToken}`;

    // Send verification email
    await sendEmail({
      to: newUser.email,
      subject: 'AiMediCare - Verify Your Email',
      text: `Welcome to AiMediCare! Please verify your email by clicking on the following link: ${verificationURL}`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <h2 style="color: #4a90e2;">Welcome to AiMediCare!</h2>
          <p>Thank you for signing up with us. Please verify your email address to continue.</p>
          <div style="margin: 30px 0;">
            <a href="${verificationURL}" target="_blank" style="background-color: #4a90e2; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; display: inline-block;">Verify Email</a>
          </div>
          <p>If the button doesn't work, please copy and paste the following link into your browser:</p>
          <p><a href="${verificationURL}" target="_blank">${verificationURL}</a></p>
          <p>This link will expire in 24 hours.</p>
          <p>Best regards,<br>The AiMediCare Team</p>
        </div>
      `
    });

    res.status(201).json({
      status: 'success',
      message: 'Registration successful! Please check your email to verify your account.',
      toast: {
        type: 'success',
        message: 'Registration successful! Please check your email to verify your account.'
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred during registration. Please try again.',
      toast: {
        type: 'error',
        message: 'Registration failed. Please try again later.'
      }
    });
  }
};

// Verify user email
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    
    // Hash the token to compare with stored hash
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');
    
    // Find user with valid token
    const user = await User.findOne({
      verificationToken: hashedToken,
      verificationTokenExpires: { $gt: Date.now() }
    });
    
    // Check if it's a browser request or API request
    const isAPIRequest = req.xhr || req.headers.accept?.includes('application/json');

    if (!user) {
      if (isAPIRequest) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid or expired verification token',
          toast: {
            type: 'error',
            message: 'The verification link has expired or is invalid. Please request a new one.'
          }
        });
      } else {
        // For browser requests, redirect to login page with error
        return res.redirect(`${process.env.CLIENT_URL}/login?verification=failed&message=invalid`);
      }
    }
    
    // Update user to verified and remove token
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save({ validateBeforeSave: false });
    
    console.log(`User verification successful for ${user.email}`);
    
    if (isAPIRequest) {
      return res.status(200).json({
        status: 'success',
        message: 'Email verification successful! You can now log in.',
        toast: {
          type: 'success',
          message: 'Email successfully verified! You can now log in.'
        }
      });
    } else {
      // For browser requests, redirect to login page with success message
      return res.redirect(`${process.env.CLIENT_URL}/login?verification=success`);
    }
  } catch (error) {
    console.error('Verification error:', error);
    
    // Check if it's a browser request or API request
    const isAPIRequest = req.xhr || req.headers.accept?.includes('application/json');
    
    if (isAPIRequest) {
      return res.status(500).json({
        status: 'error',
        message: 'An error occurred during verification. Please try again.',
        toast: {
          type: 'error',
          message: 'Verification failed. Please try again later.'
        }
      });
    } else {
      // For browser requests, redirect to login page with error
      return res.redirect(`${process.env.CLIENT_URL}/login?verification=failed&message=error`);
    }
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if email and password exist
    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide email and password',
        toast: {
          type: 'error',
          message: 'Please provide both email and password.'
        }
      });
    }
    
    // Find user by email and include password for verification
    const user = await User.findOne({ email }).select('+password');
    
    // Check if user exists
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User does not exist. Please register first.',
        toast: {
          type: 'error',
          message: 'User doesn\'t exist. Please register.'
        }
      });
    }
    
    // Check if user is verified
    if (!user.isVerified) {
      return res.status(401).json({
        status: 'error',
        message: 'Please verify your email before logging in',
        toast: {
          type: 'warning',
          message: 'Please verify your account.'
        }
      });
    }
    
    // Check if password is correct
    const isPasswordCorrect = await user.comparePassword(password);
    
    if (!isPasswordCorrect) {
      return res.status(401).json({
        status: 'error',
        message: 'Incorrect email or password',
        toast: {
          type: 'error',
          message: 'Incorrect email or password. Please try again.'
        }
      });
    }
    
    // Generate JWT token
    const token = signToken(user._id);
    
    // Remove password from output
    user.password = undefined;
    
    // Include role-specific redirect info in response
    let redirectPath;
    switch (user.role) {
      case 'doctor':
        redirectPath = '/doctor/dashboard';
        break;
      case 'patient':
        redirectPath = '/patient/dashboard';
        break;
      case 'pharmacist':
        redirectPath = '/pharmacist/dashboard';
        break;
      default:
        redirectPath = '/patient/dashboard';
    }
    
    res.status(200).json({
      status: 'success',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        redirectPath
      },
      toast: {
        type: 'success',
        message: `Welcome back, ${user.name}!`
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred during login. Please try again.',
      toast: {
        type: 'error',
        message: 'Login failed. Please try again later.'
      }
    });
  }
};

// Logout user
exports.logout = async (req, res) => {
  try {
    // JWT is stateless, so we don't need to do anything on the server
    // The client should remove the token from localStorage
    
    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully',
      toast: {
        type: 'success',
        message: 'You have been logged out successfully.'
      }
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred during logout.',
      toast: {
        type: 'error',
        message: 'Logout failed. Please try again.'
      }
    });
  }
};

// Request password reset
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'No user with that email address exists',
        toast: {
          type: 'error',
          message: 'No account found with that email address.'
        }
      });
    }
    
    // Generate reset token
    const resetToken = user.generatePasswordResetToken();
    await user.save({ validateBeforeSave: false });
    
    // Create reset URL
    const resetURL = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    
    // Send reset password email
    await sendEmail({
      to: user.email,
      subject: 'AiMediCare - Password Reset Request',
      text: `You requested a password reset. Please click on the following link to reset your password: ${resetURL}. This link will expire in 10 minutes.`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <h2 style="color: #4a90e2;">Password Reset Request</h2>
          <p>You have requested to reset your password. Please click the button below to set a new password:</p>
          <div style="margin: 30px 0;">
            <a href="${resetURL}" target="_blank" style="background-color: #4a90e2; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a>
          </div>
          <p>If the button doesn't work, please copy and paste the following link into your browser:</p>
          <p><a href="${resetURL}" target="_blank">${resetURL}</a></p>
          <p>This link will expire in 10 minutes.</p>
          <p>If you didn't request this password reset, please ignore this email.</p>
          <p>Best regards,<br>The AiMediCare Team</p>
        </div>
      `
    });
    
    res.status(200).json({
      status: 'success',
      message: 'Password reset link sent to email',
      toast: {
        type: 'success',
        message: 'A password reset link has been sent to your email address.'
      }
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while processing your request. Please try again.',
      toast: {
        type: 'error',
        message: 'Failed to send password reset link. Please try again later.'
      }
    });
  }
};

// Reset password
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    
    // Hash the token to compare with stored hash
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');
    
    // Find user with valid token
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid or expired reset token',
        toast: {
          type: 'error',
          message: 'The password reset link has expired or is invalid. Please request a new one.'
        }
      });
    }
    
    // Set new password and remove reset tokens
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    
    res.status(200).json({
      status: 'success',
      message: 'Password reset successful! You can now log in with your new password.',
      toast: {
        type: 'success',
        message: 'Password has been reset successfully. You can now log in with your new password.'
      }
    });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred during password reset. Please try again.',
      toast: {
        type: 'error',
        message: 'Password reset failed. Please try again later.'
      }
    });
  }
};