const express = require('express');
const doctorController = require('../controllers/doctorController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.get('/', doctorController.getDoctors);
router.get('/:id', doctorController.getDoctor);
router.get('/:id/availability', doctorController.getDoctorAvailability);

// Development routes - only available in development
router.post('/seed', doctorController.createDummyDoctors);

module.exports = router;