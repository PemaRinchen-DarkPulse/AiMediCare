const User = require('../models/User');
const Doctor = require('../models/Doctor');

// @desc    Get doctor profile settings
// @route   GET /api/settings/profile
// @access  Private/Doctor
exports.getProfileSettings = async (req, res) => {
  try {
    const doctorId = req.user._id;
    
    // Get doctor user info
    const doctorUser = await User.findById(doctorId).select('-password');
    if (!doctorUser || doctorUser.role !== 'doctor') {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }
    
    // Get doctor specific info
    const doctorProfile = await Doctor.findOne({ user: doctorId });
    if (!doctorProfile) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }
    
    // Combine the data for the response
    const profileSettings = {
      // Basic user info
      name: doctorUser.name,
      email: doctorUser.email,
      phoneNumber: doctorUser.phoneNumber,
      profileImage: doctorUser.profileImage,
      address: doctorUser.address || {},
      
      // Doctor specific info
      specialty: doctorProfile.specialty || '',
      specialization: doctorProfile.specialization || '',
      medicalLicenseNumber: doctorProfile.medicalLicenseNumber,
      licenseExpiryDate: doctorProfile.licenseExpiryDate,
      issuingAuthority: doctorProfile.issuingAuthority,
      yearsExperience: doctorProfile.yearsExperience || doctorProfile.experience || 0,
      consultationFee: doctorProfile.consultationFee || 0,
      practiceLocation: doctorProfile.practiceLocation || '',
      clinicAddress: doctorProfile.clinicAddress || {},
      education: doctorProfile.education || []
    };
    
    res.status(200).json({
      success: true,
      data: profileSettings
    });
  } catch (error) {
    console.error('Error fetching doctor settings:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch doctor settings'
    });
  }
};

// @desc    Update doctor profile settings
// @route   PUT /api/settings/profile
// @access  Private/Doctor
exports.updateProfileSettings = async (req, res) => {
  try {
    const doctorId = req.user._id;
    const {
      name,
      phoneNumber,
      address,
      specialty,
      specialization,
      consultationFee,
      practiceLocation,
      clinicAddress,
      profileImage
    } = req.body;
    
    // Update user information
    const userUpdate = {};
    if (name) userUpdate.name = name;
    if (phoneNumber) userUpdate.phoneNumber = phoneNumber;
    if (address) userUpdate.address = address;
    if (profileImage) userUpdate.profileImage = profileImage;
    
    const updatedUser = await User.findByIdAndUpdate(
      doctorId,
      userUpdate,
      { new: true }
    ).select('-password');
    
    // Update doctor specific information
    const doctorUpdate = {};
    if (specialty) doctorUpdate.specialty = specialty;
    if (specialization) doctorUpdate.specialization = specialization;
    if (consultationFee) doctorUpdate.consultationFee = consultationFee;
    if (practiceLocation) doctorUpdate.practiceLocation = practiceLocation;
    if (clinicAddress) doctorUpdate.clinicAddress = clinicAddress;
    
    const updatedDoctor = await Doctor.findOneAndUpdate(
      { user: doctorId },
      doctorUpdate,
      { new: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        // Basic user info
        name: updatedUser.name,
        email: updatedUser.email,
        phoneNumber: updatedUser.phoneNumber,
        profileImage: updatedUser.profileImage,
        address: updatedUser.address || {},
        
        // Doctor specific info
        specialty: updatedDoctor.specialty || '',
        specialization: updatedDoctor.specialization || '',
        consultationFee: updatedDoctor.consultationFee || 0,
        practiceLocation: updatedDoctor.practiceLocation || '',
        clinicAddress: updatedDoctor.clinicAddress || {}
      }
    });
  } catch (error) {
    console.error('Error updating doctor profile:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update doctor profile'
    });
  }
};

// @desc    Get doctor availability settings
// @route   GET /api/settings/availability
// @access  Private/Doctor
exports.getAvailabilitySettings = async (req, res) => {
  try {
    const doctorId = req.user._id;
    
    // Get doctor info including availability
    const doctorUser = await User.findById(doctorId).select('availability');
    
    // Also get doctor-specific info
    const doctorProfile = await Doctor.findOne({ user: doctorId }).select('availableTimeSlots');
    
    // Combine the availability data from both models
    let availability = [];
    
    // Check for new format in User model first
    if (doctorUser && doctorUser.availability && doctorUser.availability.length > 0) {
      // Use the availability from the User model (preferred)
      availability = doctorUser.availability;
    }
    // Fallback to old format in Doctor model if needed
    else if (doctorProfile && doctorProfile.availableTimeSlots && doctorProfile.availableTimeSlots.length > 0) {
      // Convert the old format to the new format
      availability = doctorProfile.availableTimeSlots.map(slot => ({
        date: new Date(), // Use current date as placeholder
        slots: [{
          startTime: slot.startTime,
          endTime: slot.endTime,
          isBooked: false
        }],
        day: slot.day
      }));
    }
    
    res.status(200).json({
      success: true,
      data: {
        availability
      }
    });
  } catch (error) {
    console.error('Error fetching doctor availability settings:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch availability settings'
    });
  }
};

// @desc    Update doctor availability settings
// @route   PUT /api/settings/availability
// @access  Private/Doctor
exports.updateAvailabilitySettings = async (req, res) => {
  try {
    const doctorId = req.user._id;
    const { availability, isAvailable } = req.body;
    
    // Update user information with availability schedule
    const updateData = {};
    
    if (availability !== undefined) {
      updateData.availability = availability;
    }
    
    // Also update Doctor model for backward compatibility
    const doctorUpdateData = {};
    
    // If availability is provided and has items, map them to availableTimeSlots format
    if (availability && availability.length > 0) {
      // Extract days and time slots from availability
      const availableTimeSlots = [];
      availability.forEach(day => {
        if (day.slots && day.slots.length > 0) {
          day.slots.forEach(slot => {
            availableTimeSlots.push({
              day: new Date(day.date).toLocaleDateString('en-US', { weekday: 'long' }),
              startTime: slot.startTime,
              endTime: slot.endTime
            });
          });
        }
      });
      
      doctorUpdateData.availableTimeSlots = availableTimeSlots;
    }
    
    // Update User model
    await User.findByIdAndUpdate(doctorId, updateData);
    
    // Update Doctor model (for backward compatibility)
    if (Object.keys(doctorUpdateData).length > 0) {
      await Doctor.findOneAndUpdate({ user: doctorId }, doctorUpdateData);
    }
    
    res.status(200).json({
      success: true,
      message: 'Availability settings updated successfully',
      data: {
        availability
      }
    });
  } catch (error) {
    console.error('Error updating doctor availability settings:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update availability settings'
    });
  }
};

// @desc    Get doctor notification preferences
// @route   GET /api/settings/notifications
// @access  Private/Doctor
exports.getNotificationPreferences = async (req, res) => {
  try {
    const doctorId = req.user._id;
    
    // Get doctor user info
    const doctorUser = await User.findById(doctorId).select('notificationPreferences');
    
    // Default notification preferences if not set yet
    const notificationPreferences = doctorUser.notificationPreferences || {
      appointmentReminders: true,
      newPatientRegistration: true,
      emergencyCases: true
    };
    
    res.status(200).json({
      success: true,
      data: notificationPreferences
    });
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch notification preferences'
    });
  }
};

// @desc    Update doctor notification preferences
// @route   PUT /api/settings/notifications
// @access  Private/Doctor
exports.updateNotificationPreferences = async (req, res) => {
  try {
    const doctorId = req.user._id;
    const { appointmentReminders, newPatientRegistration, emergencyCases } = req.body;
    
    // Update notification preferences
    const updateData = {
      notificationPreferences: {
        appointmentReminders: appointmentReminders !== undefined ? appointmentReminders : true,
        newPatientRegistration: newPatientRegistration !== undefined ? newPatientRegistration : true,
        emergencyCases: emergencyCases !== undefined ? emergencyCases : true
      }
    };
    
    const updatedUser = await User.findByIdAndUpdate(
      doctorId,
      updateData,
      { new: true }
    ).select('notificationPreferences');
    
    res.status(200).json({
      success: true,
      message: 'Notification preferences updated successfully',
      data: updatedUser.notificationPreferences
    });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update notification preferences'
    });
  }
};

// @desc    Get doctor teleconsultation settings
// @route   GET /api/settings/teleconsultation
// @access  Private/Doctor
exports.getTeleconsultationSettings = async (req, res) => {
  try {
    const doctorId = req.user._id;
    
    // Get doctor user info 
    const doctorUser = await User.findById(doctorId).select('teleconsultationSettings');
    
    // Get doctor-specific fee info
    const doctorProfile = await Doctor.findOne({ user: doctorId }).select('consultationFee');
    
    // Default teleconsultation settings if not set yet
    const teleconsultationSettings = doctorUser.teleconsultationSettings || {
      platform: 'In-App',
      isEnabled: true,
      meetingLink: '',
      consultationFee: doctorProfile ? doctorProfile.consultationFee : 0
    };
    
    res.status(200).json({
      success: true,
      data: teleconsultationSettings
    });
  } catch (error) {
    console.error('Error fetching teleconsultation settings:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch teleconsultation settings'
    });
  }
};

// @desc    Update doctor teleconsultation settings
// @route   PUT /api/settings/teleconsultation
// @access  Private/Doctor
exports.updateTeleconsultationSettings = async (req, res) => {
  try {
    const doctorId = req.user._id;
    const { platform, isEnabled, meetingLink, consultationFee } = req.body;
    
    // Validate platform selection
    if (platform && !['Zoom', 'Google Meet', 'In-App'].includes(platform)) {
      return res.status(400).json({
        success: false,
        message: 'Platform must be either Zoom, Google Meet, or In-App'
      });
    }
    
    // Update user model with teleconsultation settings
    const updateData = {
      teleconsultationSettings: {
        platform: platform || 'In-App',
        isEnabled: isEnabled !== undefined ? isEnabled : true,
        meetingLink: meetingLink || ''
      }
    };
    
    const updatedUser = await User.findByIdAndUpdate(
      doctorId,
      updateData,
      { new: true }
    ).select('teleconsultationSettings');
    
    // Update consultation fee in doctor model if provided
    if (consultationFee !== undefined) {
      // Validate consultation fee
      if (consultationFee < 0) {
        return res.status(400).json({
          success: false,
          message: 'Consultation fee cannot be negative'
        });
      }
      
      await Doctor.findOneAndUpdate(
        { user: doctorId },
        { consultationFee },
        { new: true }
      );
    }
    
    // Get updated doctor profile for fee info
    const doctorProfile = await Doctor.findOne({ user: doctorId }).select('consultationFee');
    
    // Combine the response data
    const responseData = {
      ...updatedUser.teleconsultationSettings.toObject(),
      consultationFee: doctorProfile ? doctorProfile.consultationFee : 0
    };
    
    res.status(200).json({
      success: true,
      message: 'Teleconsultation settings updated successfully',
      data: responseData
    });
  } catch (error) {
    console.error('Error updating teleconsultation settings:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update teleconsultation settings'
    });
  }
};

// @desc    Upload profile image 
// @route   POST /api/settings/profile/upload-image
// @access  Private/Doctor
exports.uploadProfileImage = async (req, res) => {
  try {
    // Note: Actual file upload would require middleware like multer
    // This is a placeholder for the endpoint
    
    const doctorId = req.user._id;
    const { imageUrl } = req.body;
    
    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Image URL is required'
      });
    }
    
    // Update user profile image
    const updatedUser = await User.findByIdAndUpdate(
      doctorId,
      { profileImage: imageUrl },
      { new: true }
    ).select('profileImage');
    
    res.status(200).json({
      success: true,
      message: 'Profile image updated successfully',
      data: {
        profileImage: updatedUser.profileImage
      }
    });
  } catch (error) {
    console.error('Error uploading profile image:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload profile image'
    });
  }
};