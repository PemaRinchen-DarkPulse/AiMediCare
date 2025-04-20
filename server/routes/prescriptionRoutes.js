const express = require('express');
const router = express.Router();
const prescriptionController = require('../controllers/prescriptionController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// All prescription routes require authentication
router.use(protect);

// Routes for doctors
router.post('/', restrictTo('doctor'), prescriptionController.createPrescription);
router.get('/doctor', restrictTo('doctor'), prescriptionController.getDoctorPrescriptions);
router.patch('/:id', restrictTo('doctor'), prescriptionController.updatePrescription);
router.delete('/:id', restrictTo('doctor'), prescriptionController.deletePrescription);

// Routes for patients
router.get('/patient', restrictTo('patient'), prescriptionController.getPatientPrescriptions);
// Add route for getting prescriptions by patient ID (for doctors)
router.get('/patient/:patientId', restrictTo('doctor'), prescriptionController.getPatientPrescriptionsById);

// New route to get prescriptions for a specific appointment
router.get('/appointment/:appointmentId', prescriptionController.getAppointmentPrescriptions);

// Routes for both doctors and patients
router.get('/:id', prescriptionController.getPrescription);

module.exports = router;