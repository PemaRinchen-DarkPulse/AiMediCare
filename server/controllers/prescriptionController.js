const Prescription = require('../models/Prescription');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');

// Create a new prescription
exports.createPrescription = async (req, res) => {
  try {
    const { appointmentId, diagnosis, medications, notes } = req.body;

    // Fetch the appointment to get doctor and patient IDs
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Appointment not found' 
      });
    }

    // Create the new prescription
    const prescription = await Prescription.create({
      appointmentId,
      doctorId: req.user.id, // Use the logged in doctor's ID
      patientId: appointment.patientId,
      diagnosis,
      medications,
      notes,
      issuedDate: new Date()
    });

    // Populate doctor and patient details
    const populatedPrescription = await Prescription.findById(prescription._id)
      .populate('doctorId', 'name specialization')
      .populate('patientId', 'name dateOfBirth');

    // Update the appointment to include the prescription reference
    await Appointment.findByIdAndUpdate(appointmentId, {
      $push: { prescriptions: prescription._id }
    });

    res.status(201).json({
      success: true,
      data: populatedPrescription
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get prescription by ID
exports.getPrescription = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate('doctorId', 'name specialization')
      .populate('patientId', 'name dateOfBirth');

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }

    // Check if user is authorized to view this prescription
    if (
      req.user.role === 'patient' && prescription.patientId.toString() !== req.user.id ||
      req.user.role === 'doctor' && prescription.doctorId.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this prescription'
      });
    }

    res.status(200).json({
      success: true,
      data: prescription
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all prescriptions for a patient
exports.getPatientPrescriptions = async (req, res) => {
  try {
    const patientId = req.user.id; // From the logged in patient
    
    const prescriptions = await Prescription.find({ patientId })
      .populate('doctorId', 'name specialization')
      .sort({ issuedDate: -1 });

    res.status(200).json({
      success: true,
      data: prescriptions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all prescriptions for a specific patient by patient ID (for doctors)
exports.getPatientPrescriptionsById = async (req, res) => {
  try {
    const { patientId } = req.params;
    
    // Verify that patient exists
    const patientExists = await Patient.exists({ _id: patientId });
    if (!patientExists) {
      return res.status(404).json({
        status: 'fail',
        message: 'Patient not found'
      });
    }
    
    const prescriptions = await Prescription.find({ patientId })
      .populate('doctorId', 'name specialization')
      .sort({ issuedDate: -1 });

    res.status(200).json({
      status: 'success',
      data: prescriptions
    });
  } catch (error) {
    console.error('Error fetching patient prescriptions:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get all prescriptions issued by a doctor
exports.getDoctorPrescriptions = async (req, res) => {
  try {
    const doctorId = req.user.id; // From the logged in doctor
    
    const prescriptions = await Prescription.find({ doctorId })
      .populate('patientId', 'name')
      .sort({ issuedDate: -1 });

    res.status(200).json({
      success: true,
      data: prescriptions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all prescriptions for a specific appointment
exports.getAppointmentPrescriptions = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    
    const prescriptions = await Prescription.find({ appointmentId })
      .populate('doctorId', 'name specialization')
      .populate('patientId', 'name dateOfBirth')
      .sort({ issuedDate: -1 });

    res.status(200).json({
      status: 'success',
      data: prescriptions
    });
  } catch (error) {
    console.error('Error fetching appointment prescriptions:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Update a prescription
exports.updatePrescription = async (req, res) => {
  try {
    const { diagnosis, medications, notes, status } = req.body;
    const doctorId = req.user.id;
    
    // Find the prescription and check if this doctor is authorized to update it
    const prescription = await Prescription.findOne({ 
      _id: req.params.id,
      doctorId
    });

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found or you are not authorized to update it'
      });
    }

    // Update the fields
    if (diagnosis) prescription.diagnosis = diagnosis;
    if (medications) prescription.medications = medications;
    if (notes) prescription.notes = notes;
    if (status) prescription.status = status;

    await prescription.save();

    const updatedPrescription = await Prescription.findById(prescription._id)
      .populate('doctorId', 'name specialization')
      .populate('patientId', 'name dateOfBirth');

    res.status(200).json({
      success: true,
      data: updatedPrescription
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete a prescription
exports.deletePrescription = async (req, res) => {
  try {
    const doctorId = req.user.id;
    
    // Find and ensure this doctor is authorized to delete it
    const prescription = await Prescription.findOne({
      _id: req.params.id,
      doctorId
    });

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found or you are not authorized to delete it'
      });
    }

    // Remove the prescription reference from the appointment
    await Appointment.findByIdAndUpdate(prescription.appointmentId, {
      $pull: { prescriptions: prescription._id }
    });

    // Delete the prescription
    await Prescription.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Prescription deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};