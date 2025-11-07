const express = require('express');
const { 
  getPatients, 
  getPatientById, 
  updatePatient, 
  getPatientVitals,
  addPatientVital,
  getPatientAllergies,
  addPatientAllergy,
  getPatientMedicalHistory,
  addPatientMedicalHistory,
  getPatientChronicConditions,
  addPatientChronicCondition,
  getPatientImmunizations,
  addPatientImmunization
} = require('../controllers/patientManagementController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);
router.use(restrictTo('doctor'));

// Main patient routes
router.route('/')
  .get(getPatients);

router.route('/:patientId')
  .get(getPatientById)
  .put(updatePatient);

// Vitals routes
router.route('/:patientId/vitals')
  .get(getPatientVitals)
  .post(addPatientVital);

// Allergies routes
router.route('/:patientId/allergies')
  .get(getPatientAllergies)
  .post(addPatientAllergy);

// Medical history routes
router.route('/:patientId/medical-history')
  .get(getPatientMedicalHistory)
  .post(addPatientMedicalHistory);

// Chronic conditions routes
router.route('/:patientId/chronic-conditions')
  .get(getPatientChronicConditions)
  .post(addPatientChronicCondition);

// Immunizations routes
router.route('/:patientId/immunizations')
  .get(getPatientImmunizations)
  .post(addPatientImmunization);

module.exports = router;