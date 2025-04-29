const express = require('express');
const patientSettingsController = require('../controllers/patientSettingsController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes are protected and restricted to patients only
router.use(protect);
router.use(restrictTo('patient'));

// Profile settings routes
router.route('/profile')
  .get(patientSettingsController.getProfileSettings)
  .put(patientSettingsController.updateProfileSettings);

// Profile image upload
router.post('/profile/upload-image', patientSettingsController.uploadProfileImage);

// Notification preferences routes
router.route('/notifications')
  .get(patientSettingsController.getNotificationPreferences)
  .put(patientSettingsController.updateNotificationPreferences);

// Teleconsultation preferences routes
router.route('/teleconsultation')
  .get(patientSettingsController.getTeleconsultationPreferences)
  .put(patientSettingsController.updateTeleconsultationPreferences);

// Medical information routes
router.route('/medicalinfo')
  .get(patientSettingsController.getMedicalInfo)
  .put(patientSettingsController.updateMedicalInfo);

module.exports = router;