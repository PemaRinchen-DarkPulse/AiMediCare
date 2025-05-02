const express = require('express');
const appointmentController = require('../controllers/appointmentController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Protected routes - require authentication
router.get('/patient', protect, appointmentController.getPatientAppointments);
router.post('/', protect, appointmentController.createAppointment);
router.patch('/:id', protect, appointmentController.updateAppointment);

// Doctor routes
router.get('/doctor', protect, appointmentController.getDoctorAppointments);
router.post('/:id/respond', protect, appointmentController.doctorRespondToAppointment);
router.patch('/:id/doctor', protect, appointmentController.doctorUpdateAppointment);
router.post('/:id/complete', protect, appointmentController.completeAppointment);

// Patient confirmation route
router.post('/:id/confirm', protect, appointmentController.patientConfirmAppointment);

// Development route - only available in development
router.post('/seed', appointmentController.createDummyAppointments);

module.exports = router;