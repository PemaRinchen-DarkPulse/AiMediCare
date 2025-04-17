const express = require('express');
const appointmentController = require('../controllers/appointmentController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Protected routes - require authentication
router.get('/patient', protect, appointmentController.getPatientAppointments);
router.post('/', protect, appointmentController.createAppointment);
router.patch('/:id', protect, appointmentController.updateAppointment);

// Development route - only available in development
router.post('/seed', appointmentController.createDummyAppointments);

module.exports = router;