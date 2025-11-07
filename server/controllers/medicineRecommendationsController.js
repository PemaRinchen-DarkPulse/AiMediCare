const asyncHandler = require('express-async-handler');
const Patient = require('../models/Patient');
const User = require('../models/User');
const PrevisitTriage = require('../models/PrevisitTriage');
const axios = require('axios');

// @desc    Generate AI-powered medication recommendations
// @route   POST /api/medicine-recommendations/generate
// @access  Private/Doctor
const generateMedicationRecommendations = asyncHandler(async (req, res) => {
  const { patientId, appointmentId } = req.body;

  if (!patientId) {
    res.status(400);
    throw new Error('Patient ID is required');
  }

  console.log('Generating medication recommendations for patient:', patientId);

  try {
    // Get comprehensive patient data
    const patientData = await gatherPatientData(patientId, appointmentId);
    
    if (!patientData.patient_id) {
      res.status(404);
      throw new Error('Patient not found');
    }

    console.log('Patient data gathered, calling AI service...');

    // Call AI service for medication recommendations
    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8001';
    const aiResponse = await axios.post(
      `${aiServiceUrl}/api/medication-recommendations`,
      {
        patient_data: patientData
      },
      {
        timeout: 30000, // 30 second timeout
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (aiResponse.data.success) {
      console.log('AI recommendations generated successfully');
      
      res.status(200).json({
        success: true,
        data: aiResponse.data.data,
        message: 'Medication recommendations generated successfully'
      });
    } else {
      throw new Error('AI service returned unsuccessful response');
    }

  } catch (error) {
    console.error('Error generating medication recommendations:', error);
    
    if (error.code === 'ECONNREFUSED') {
      res.status(503);
      throw new Error('AI service is currently unavailable');
    }
    
    if (error.response?.status === 400) {
      res.status(400);
      throw new Error('Invalid patient data for AI analysis');
    }
    
    res.status(500);
    throw new Error('Failed to generate medication recommendations');
  }
});

// @desc    Validate medication recommendation against patient
// @route   POST /api/medicine-recommendations/validate
// @access  Private/Doctor
const validateMedicationRecommendation = asyncHandler(async (req, res) => {
  const { patientId, medication } = req.body;

  if (!patientId || !medication) {
    res.status(400);
    throw new Error('Patient ID and medication data are required');
  }

  try {
    // Get patient data for validation
    const patientData = await gatherPatientData(patientId);
    
    // Call AI service for validation
    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8001';
    const aiResponse = await axios.post(
      `${aiServiceUrl}/api/medication-recommendations/validate`,
      {
        patient_data: patientData,
        medication: medication
      },
      {
        timeout: 15000,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    res.status(200).json({
      success: true,
      data: aiResponse.data.data,
      message: 'Medication validation completed'
    });

  } catch (error) {
    console.error('Error validating medication:', error);
    res.status(500);
    throw new Error('Failed to validate medication recommendation');
  }
});

// Helper function to gather comprehensive patient data
async function gatherPatientData(patientId, appointmentId = null) {
  try {
    console.log('Gathering patient data for:', patientId);

    // Get user data first (patientId is actually a User ID)
    const user = await User.findById(patientId).select('name email dateOfBirth gender phoneNumber');
    
    if (!user) {
      console.log('User not found for ID:', patientId);
      return { patient_id: null };
    }

    // Get patient document that references this user
    const patient = await Patient.findOne({ user: patientId });

    // Calculate age if date of birth is available
    let age = 'Unknown';
    if (user.dateOfBirth) {
      const today = new Date();
      const birthDate = new Date(user.dateOfBirth);
      age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
    }

    // Get pre-visit triage data if available
    let triageData = null;
    if (appointmentId) {
      triageData = await PrevisitTriage.findOne({ 
        appointmentId: appointmentId 
      }).select('responses symptoms questionnaire');
    }

    // Structure comprehensive patient data
    const patientData = {
      patient_id: patientId, // Use the User ID as patient_id
      name: user.name || 'Unknown',
      age: age,
      gender: user.gender || 'Unknown',
      
      // Medical information (from Patient document if exists)
      allergies: patient?.allergies || [],
      medical_history: patient?.medicalHistory || [],
      current_medications: patient?.medications || [],
      blood_type: patient?.bloodType || 'Unknown',
      
      // Emergency contact (if relevant for recommendations)
      emergency_contact: patient?.emergencyContact || {},
      
      // Insurance info (for cost considerations)
      insurance: patient?.insurance || {},
      
      // Triage data if available
      triage_responses: triageData?.responses || {},
      symptoms: triageData?.symptoms || [],
      chief_complaint: triageData?.questionnaire?.title || '',
      
      // Recent vital signs (you might want to add this to Patient model)
      vital_signs: {
        // This would come from a VitalRecords collection if you have it
        // For now, leaving empty
      },
      
      // Metadata
      gathered_at: new Date().toISOString(),
      data_completeness: calculateDataCompleteness(patient, triageData)
    };

    console.log('Patient data gathered successfully:', {
      patient_id: patientData.patient_id,
      has_allergies: patientData.allergies.length > 0,
      has_medical_history: patientData.medical_history.length > 0,
      has_current_medications: patientData.current_medications.length > 0,
      has_triage_data: !!triageData,
      data_completeness: patientData.data_completeness
    });

    return patientData;

  } catch (error) {
    console.error('Error gathering patient data:', error);
    throw error;
  }
}

// Helper function to calculate data completeness score
function calculateDataCompleteness(patient, triageData) {
  let score = 0;
  let totalFields = 8;

  // Check essential fields
  if (patient.user?.dateOfBirth) score++;
  if (patient.user?.gender) score++;
  if (patient.allergies && patient.allergies.length > 0) score++;
  if (patient.medicalHistory && patient.medicalHistory.length > 0) score++;
  if (patient.medications && patient.medications.length > 0) score++;
  if (patient.bloodType && patient.bloodType !== 'Unknown') score++;
  if (triageData?.responses) score++;
  if (triageData?.symptoms && triageData.symptoms.length > 0) score++;

  return Math.round((score / totalFields) * 100);
}

// @desc    Get patient medication history
// @route   GET /api/medicine-recommendations/history/:patientId
// @access  Private/Doctor
const getPatientMedicationHistory = asyncHandler(async (req, res) => {
  const { patientId } = req.params;

  try {
    const patient = await Patient.findById(patientId)
      .select('medications medicalHistory')
      .populate('user', 'name');

    if (!patient) {
      res.status(404);
      throw new Error('Patient not found');
    }

    // You might want to expand this to include prescription history
    // from a separate PrescriptionHistory model
    res.status(200).json({
      success: true,
      data: {
        current_medications: patient.medications || [],
        medical_history: patient.medicalHistory || [],
        patient_name: patient.user?.name || 'Unknown'
      }
    });

  } catch (error) {
    console.error('Error fetching medication history:', error);
    res.status(500);
    throw new Error('Failed to fetch medication history');
  }
});

module.exports = {
  generateMedicationRecommendations,
  validateMedicationRecommendation,
  getPatientMedicationHistory
};