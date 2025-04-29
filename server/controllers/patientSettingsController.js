const User = require('../models/User');
const Patient = require('../models/Patient');
const EmergencyContact = require('../models/EmergencyContact');
const Allergy = require('../models/Allergy');
const ChronicCondition = require('../models/ChronicCondition');

// Get patient profile settings
exports.getProfileSettings = async (req, res) => {
  try {
    // Get current user ID from authenticated request
    const userId = req.user.id;

    // Find user details
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Find patient details
    const patient = await Patient.findOne({ user: userId });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found'
      });
    }

    // Combine user and patient data
    const profileData = {
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      dateOfBirth: patient.dateOfBirth,
      gender: patient.gender,
      address: user.address || {},
      profileImage: user.profileImage || ''
    };

    return res.status(200).json({
      success: true,
      data: profileData
    });
  } catch (error) {
    console.error('Error fetching patient profile settings:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching profile settings',
      error: error.message
    });
  }
};

// Update patient profile settings
exports.updateProfileSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Validate required fields
    const { name, email, phoneNumber } = req.body;
    if (!name || !email || !phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Name, email and phone number are required'
      });
    }

    // Update user data
    const userUpdateData = {
      name,
      email,
      phoneNumber,
      address: req.body.address || {}
    };

    const user = await User.findByIdAndUpdate(userId, userUpdateData, { new: true }).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update patient-specific data
    const patientUpdateData = {};
    if (req.body.dateOfBirth) patientUpdateData.dateOfBirth = req.body.dateOfBirth;
    if (req.body.gender) patientUpdateData.gender = req.body.gender;

    const patient = await Patient.findOneAndUpdate(
      { user: userId },
      patientUpdateData,
      { new: true }
    );

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found'
      });
    }

    // Return combined updated data
    const profileData = {
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      dateOfBirth: patient.dateOfBirth,
      gender: patient.gender,
      address: user.address || {},
      profileImage: user.profileImage || ''
    };

    return res.status(200).json({
      success: true,
      message: 'Profile settings updated successfully',
      data: profileData
    });
  } catch (error) {
    console.error('Error updating patient profile settings:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while updating profile settings',
      error: error.message
    });
  }
};

// Upload profile image
exports.uploadProfileImage = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // In a real implementation, you would handle file upload with multer
    // and then store the image URL or path
    const { profileImage } = req.body;
    
    if (!profileImage) {
      return res.status(400).json({
        success: false,
        message: 'Profile image is required'
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { profileImage },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Profile image updated successfully',
      data: { profileImage: user.profileImage }
    });
  } catch (error) {
    console.error('Error uploading profile image:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while uploading profile image',
      error: error.message
    });
  }
};

// Get notification preferences
exports.getNotificationPreferences = async (req, res) => {
  try {
    const userId = req.user.id;

    const patient = await Patient.findOne({ user: userId });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Return notification preferences
    // Default values if not set
    const notificationPreferences = {
      appointmentReminders: patient.notificationPreferences?.appointmentReminders !== undefined 
        ? patient.notificationPreferences.appointmentReminders 
        : true,
      healthTips: patient.notificationPreferences?.healthTips !== undefined 
        ? patient.notificationPreferences.healthTips 
        : true,
      medicationReminders: patient.notificationPreferences?.medicationReminders !== undefined 
        ? patient.notificationPreferences.medicationReminders 
        : true
    };

    return res.status(200).json({
      success: true,
      data: notificationPreferences
    });
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching notification preferences',
      error: error.message
    });
  }
};

// Update notification preferences
exports.updateNotificationPreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const { appointmentReminders, healthTips, medicationReminders } = req.body;

    // Validate that at least one preference is provided
    if (appointmentReminders === undefined && 
        healthTips === undefined && 
        medicationReminders === undefined) {
      return res.status(400).json({
        success: false,
        message: 'At least one notification preference must be provided'
      });
    }

    // Find patient
    const patient = await Patient.findOne({ user: userId });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Update notification preferences
    const notificationPreferences = {
      appointmentReminders: appointmentReminders !== undefined 
        ? appointmentReminders 
        : patient.notificationPreferences?.appointmentReminders || true,
      healthTips: healthTips !== undefined 
        ? healthTips 
        : patient.notificationPreferences?.healthTips || true,
      medicationReminders: medicationReminders !== undefined 
        ? medicationReminders 
        : patient.notificationPreferences?.medicationReminders || true
    };

    patient.notificationPreferences = notificationPreferences;
    await patient.save();

    return res.status(200).json({
      success: true,
      message: 'Notification preferences updated successfully',
      data: notificationPreferences
    });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while updating notification preferences',
      error: error.message
    });
  }
};

// Get teleconsultation preferences
exports.getTeleconsultationPreferences = async (req, res) => {
  try {
    const userId = req.user.id;

    const patient = await Patient.findOne({ user: userId })
      .populate('emergencyContact', 'name phone relationship');

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Return teleconsultation preferences
    const teleconsultationPreferences = {
      preferredPlatform: patient.teleconsultationPreferences?.preferredPlatform || 'In-App',
      isEnabled: patient.teleconsultationPreferences?.isEnabled !== undefined 
        ? patient.teleconsultationPreferences.isEnabled 
        : true,
      emergencyContact: patient.emergencyContact || {
        name: '',
        phone: '',
        relationship: ''
      }
    };

    return res.status(200).json({
      success: true,
      data: teleconsultationPreferences
    });
  } catch (error) {
    console.error('Error fetching teleconsultation preferences:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching teleconsultation preferences',
      error: error.message
    });
  }
};

// Update teleconsultation preferences
exports.updateTeleconsultationPreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const { preferredPlatform, isEnabled, emergencyContact } = req.body;

    // Validate platform is one of the allowed values
    if (preferredPlatform && !['Zoom', 'Google Meet', 'In-App'].includes(preferredPlatform)) {
      return res.status(400).json({
        success: false,
        message: 'Platform must be one of: Zoom, Google Meet, In-App'
      });
    }

    // Find patient
    const patient = await Patient.findOne({ user: userId });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Update teleconsultation preferences
    const teleconsultationPrefs = {
      preferredPlatform: preferredPlatform || patient.teleconsultationPreferences?.preferredPlatform || 'In-App',
      isEnabled: isEnabled !== undefined ? isEnabled : patient.teleconsultationPreferences?.isEnabled || true
    };

    patient.teleconsultationPreferences = teleconsultationPrefs;

    // Update or create emergency contact if provided
    let updatedEmergencyContact = patient.emergencyContact;
    if (emergencyContact && (emergencyContact.name || emergencyContact.phone || emergencyContact.relationship)) {
      // If patient already has an emergency contact, update it
      if (patient.emergencyContact) {
        updatedEmergencyContact = await EmergencyContact.findByIdAndUpdate(
          patient.emergencyContact,
          emergencyContact,
          { new: true }
        );
      } else {
        // Create a new emergency contact
        const newEmergencyContact = new EmergencyContact({
          patient: patient._id,
          ...emergencyContact
        });
        updatedEmergencyContact = await newEmergencyContact.save();
        patient.emergencyContact = updatedEmergencyContact._id;
      }
    }

    await patient.save();

    return res.status(200).json({
      success: true,
      message: 'Teleconsultation preferences updated successfully',
      data: {
        preferredPlatform: teleconsultationPrefs.preferredPlatform,
        isEnabled: teleconsultationPrefs.isEnabled,
        emergencyContact: updatedEmergencyContact || null
      }
    });
  } catch (error) {
    console.error('Error updating teleconsultation preferences:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while updating teleconsultation preferences',
      error: error.message
    });
  }
};

// Get medical information
exports.getMedicalInfo = async (req, res) => {
  try {
    const userId = req.user.id;

    const patient = await Patient.findOne({ user: userId });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Return medical information based on actual schema structure
    const medicalInfo = {
      allergies: patient.allergies || [],
      medicalConditions: patient.medicalHistory || [],
      medications: patient.medications || []
    };

    return res.status(200).json({
      success: true,
      data: medicalInfo
    });
  } catch (error) {
    console.error('Error fetching medical information:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching medical information',
      error: error.message
    });
  }
};

// Update medical information
exports.updateMedicalInfo = async (req, res) => {
  try {
    const userId = req.user.id;
    const { allergies, medicalConditions, medications } = req.body;

    // Find patient
    const patient = await Patient.findOne({ user: userId });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Update allergies directly in the patient document
    if (Array.isArray(allergies)) {
      patient.allergies = allergies;
    }

    // Update medical history directly in the patient document
    if (Array.isArray(medicalConditions)) {
      patient.medicalHistory = medicalConditions;
    }

    // Update medications directly in the patient document
    if (Array.isArray(medications)) {
      patient.medications = medications;
    }

    await patient.save();

    // Return updated medical info
    const updatedPatient = await Patient.findOne({ user: userId });

    const medicalInfo = {
      allergies: updatedPatient.allergies || [],
      medicalConditions: updatedPatient.medicalHistory || [],
      medications: updatedPatient.medications || []
    };

    return res.status(200).json({
      success: true,
      message: 'Medical information updated successfully',
      data: medicalInfo
    });
  } catch (error) {
    console.error('Error updating medical information:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while updating medical information',
      error: error.message
    });
  }
};