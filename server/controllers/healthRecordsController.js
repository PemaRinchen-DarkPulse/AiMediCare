const asyncHandler = require('express-async-handler');
const Patient = require('../models/Patient');
// We'll need to create these models
const HealthRecord = require('../models/HealthRecord');
const EmergencyContact = require('../models/EmergencyContact');
const Allergy = require('../models/Allergy');
const ChronicCondition = require('../models/ChronicCondition');
const Medication = require('../models/Medication');
const LabResult = require('../models/LabResult');
const ImagingReport = require('../models/ImagingReport');
const VitalRecord = require('../models/VitalRecord');
const Immunization = require('../models/Immunization');
const TreatmentPlan = require('../models/TreatmentPlan');

// @desc    Get patient profile
// @route   GET /api/patient/profile
// @access  Private
const getPatientProfile = asyncHandler(async (req, res) => {
  const patient = await Patient.findOne({ user: req.user._id });

  if (!patient) {
    res.status(404);
    throw new Error('Patient profile not found');
  }

  res.status(200).json({
    success: true,
    data: patient
  });
});

// @desc    Get emergency contacts
// @route   GET /api/patient/emergency-contacts
// @access  Private
const getEmergencyContacts = asyncHandler(async (req, res) => {
  const patient = await Patient.findOne({ user: req.user._id });
  
  if (!patient) {
    res.status(404);
    throw new Error('Patient profile not found');
  }

  const emergencyContacts = await EmergencyContact.find({ patient: patient._id });

  res.status(200).json({
    success: true,
    data: emergencyContacts
  });
});

// @desc    Get medical history
// @route   GET /api/patient/medical-history
// @access  Private
const getMedicalHistory = asyncHandler(async (req, res) => {
  const patient = await Patient.findOne({ user: req.user._id });
  
  if (!patient) {
    res.status(404);
    throw new Error('Patient profile not found');
  }

  const medicalHistory = await HealthRecord.find({ 
    patient: patient._id,
    recordType: 'diagnosis'
  }).sort({ date: -1 });

  res.status(200).json({
    success: true,
    data: medicalHistory
  });
});

// @desc    Get allergies
// @route   GET /api/patient/allergies
// @access  Private
const getAllergies = asyncHandler(async (req, res) => {
  const patient = await Patient.findOne({ user: req.user._id });
  
  if (!patient) {
    res.status(404);
    throw new Error('Patient profile not found');
  }

  const allergies = await Allergy.find({ patient: patient._id });

  res.status(200).json({
    success: true,
    data: allergies
  });
});

// @desc    Get chronic conditions
// @route   GET /api/patient/chronic-conditions
// @access  Private
const getChronicConditions = asyncHandler(async (req, res) => {
  const patient = await Patient.findOne({ user: req.user._id });
  
  if (!patient) {
    res.status(404);
    throw new Error('Patient profile not found');
  }

  const chronicConditions = await ChronicCondition.find({ patient: patient._id });

  res.status(200).json({
    success: true,
    data: chronicConditions
  });
});

// @desc    Get medications
// @route   GET /api/patient/medications
// @access  Private
const getMedications = asyncHandler(async (req, res) => {
  const patient = await Patient.findOne({ user: req.user._id });
  
  if (!patient) {
    res.status(404);
    throw new Error('Patient profile not found');
  }

  const medications = await Medication.find({ patient: patient._id }).sort({ startDate: -1 });

  res.status(200).json({
    success: true,
    data: medications
  });
});

// @desc    Get lab results
// @route   GET /api/patient/lab-results
// @access  Private
const getLabResults = asyncHandler(async (req, res) => {
  const patient = await Patient.findOne({ user: req.user._id });
  
  if (!patient) {
    res.status(404);
    throw new Error('Patient profile not found');
  }

  const labResults = await LabResult.find({ patient: patient._id }).sort({ date: -1 });

  res.status(200).json({
    success: true,
    data: labResults
  });
});

// @desc    Get imaging reports
// @route   GET /api/patient/imaging-reports
// @access  Private
const getImagingReports = asyncHandler(async (req, res) => {
  const patient = await Patient.findOne({ user: req.user._id });
  
  if (!patient) {
    res.status(404);
    throw new Error('Patient profile not found');
  }

  const imagingReports = await ImagingReport.find({ patient: patient._id }).sort({ date: -1 });

  res.status(200).json({
    success: true,
    data: imagingReports
  });
});

// @desc    Get vitals history
// @route   GET /api/patient/vitals-history
// @access  Private
const getVitalsHistory = asyncHandler(async (req, res) => {
  const patient = await Patient.findOne({ user: req.user._id });
  
  if (!patient) {
    res.status(404);
    throw new Error('Patient profile not found');
  }

  // Get all vitals records for this patient
  const vitalsData = await VitalRecord.find({ patient: patient._id }).sort({ date: -1 });

  // Organize by vital type
  const bloodPressure = vitalsData
    .filter(record => record.vitalType === 'bloodPressure')
    .map(record => ({
      date: record.date,
      value: record.systolic,
      secondaryValue: record.diastolic
    }));
  
  const bloodSugar = vitalsData
    .filter(record => record.vitalType === 'bloodSugar')
    .map(record => ({
      date: record.date,
      value: record.value
    }));

  const heartRate = vitalsData
    .filter(record => record.vitalType === 'heartRate')
    .map(record => ({
      date: record.date,
      value: record.value
    }));

  const weight = vitalsData
    .filter(record => record.vitalType === 'weight')
    .map(record => ({
      date: record.date,
      value: record.value
    }));
  
  const cholesterol = vitalsData
    .filter(record => record.vitalType === 'cholesterol')
    .map(record => ({
      date: record.date,
      value: record.value
    }));

  res.status(200).json({
    success: true,
    data: {
      bloodPressure,
      bloodSugar,
      heartRate,
      weight,
      cholesterol
    }
  });
});

// @desc    Get immunizations
// @route   GET /api/patient/immunizations
// @access  Private
const getImmunizations = asyncHandler(async (req, res) => {
  const patient = await Patient.findOne({ user: req.user._id });
  
  if (!patient) {
    res.status(404);
    throw new Error('Patient profile not found');
  }

  const immunizations = await Immunization.find({ patient: patient._id }).sort({ date: -1 });

  res.status(200).json({
    success: true,
    data: immunizations
  });
});

// @desc    Get treatment plans
// @route   GET /api/patient/treatment-plans
// @access  Private
const getTreatmentPlans = asyncHandler(async (req, res) => {
  const patient = await Patient.findOne({ user: req.user._id });
  
  if (!patient) {
    res.status(404);
    throw new Error('Patient profile not found');
  }

  const treatmentPlans = await TreatmentPlan.find({ patient: patient._id }).sort({ lastUpdated: -1 });

  res.status(200).json({
    success: true,
    data: treatmentPlans
  });
});

module.exports = {
  getPatientProfile,
  getEmergencyContacts,
  getMedicalHistory,
  getAllergies,
  getChronicConditions,
  getMedications,
  getLabResults,
  getImagingReports,
  getVitalsHistory,
  getImmunizations,
  getTreatmentPlans
};