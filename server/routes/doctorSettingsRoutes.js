const express = require('express');
const doctorSettingsController = require('../controllers/doctorSettingsController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes are protected and restricted to doctors only
router.use(protect);
router.use(restrictTo('doctor'));

// Profile settings routes
router.route('/profile')
  .get(doctorSettingsController.getProfileSettings)
  .put(doctorSettingsController.updateProfileSettings);

// Profile image upload
router.post('/profile/upload-image', doctorSettingsController.uploadProfileImage);

// Availability settings routes
router.route('/availability')
  .get(doctorSettingsController.getAvailabilitySettings)
  .put(doctorSettingsController.updateAvailabilitySettings);

// Notification preferences routes
router.route('/notifications')
  .get(doctorSettingsController.getNotificationPreferences)
  .put(doctorSettingsController.updateNotificationPreferences);

// Teleconsultation settings routes
router.route('/teleconsultation')
  .get(doctorSettingsController.getTeleconsultationSettings)
  .put(doctorSettingsController.updateTeleconsultationSettings);

module.exports = router;