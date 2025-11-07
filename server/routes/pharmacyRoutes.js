const express = require('express');
const router = express.Router();
const {
  getPharmacistDashboard,
  getPharmacyPrescriptions,
  verifyPrescription,
  dispenseMedication,
  getMedicationInventory,
  addMedicationToInventory,
  updateMedicationInventory,
  getPatientProfiles,
  getPatientProfile,
  updatePatientProfile,
  getPharmacyReports
} = require('../controllers/pharmacyController');
const {
  performMedicationReconciliation,
  resolveReconciliationDiscrepancy,
  checkDrugInteractions,
  getAdherenceTracking,
  updateAdherenceTracking
} = require('../controllers/medicationManagementController');
const {
  getAIMedicationInteractionAnalysis,
  generateAIMedicationCounseling,
  getAIAdherenceAnalysis,
  getAIClinicalDecisionSupport,
  getAIInventoryOptimization,
  getAIPharmacyMedicationRecommendations
} = require('../controllers/pharmacyAIController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// All routes are protected and require pharmacist role
router.use(protect);
router.use(restrictTo('pharmacist'));

// Dashboard routes
router.get('/dashboard', getPharmacistDashboard);

// Prescription routes
router.get('/prescriptions', getPharmacyPrescriptions);
router.post('/prescriptions/:prescriptionId/verify', verifyPrescription);
router.post('/prescriptions/:dispenseId/dispense', dispenseMedication);

// Inventory routes
router.get('/inventory', getMedicationInventory);
router.post('/inventory', addMedicationToInventory);
router.put('/inventory/:inventoryId', updateMedicationInventory);

// Patient profile routes
router.get('/patients', getPatientProfiles);
router.get('/patients/:patientId', getPatientProfile);
router.put('/patients/:patientId', updatePatientProfile);

// Reports routes
router.get('/reports', getPharmacyReports);

// Medication management routes
router.post('/medication-reconciliation', performMedicationReconciliation);
router.put('/medication-reconciliation/:reconciliationId/resolve', resolveReconciliationDiscrepancy);
router.post('/drug-interactions/check', checkDrugInteractions);
router.get('/adherence/:patientId', getAdherenceTracking);
router.put('/adherence/:patientId', updateAdherenceTracking);

// AI-powered pharmacy routes
router.post('/ai/interaction-analysis', getAIMedicationInteractionAnalysis);
router.post('/ai/counseling', generateAIMedicationCounseling);
router.post('/ai/adherence-analysis', getAIAdherenceAnalysis);
router.post('/ai/clinical-support', getAIClinicalDecisionSupport);
router.post('/ai/inventory-optimization', getAIInventoryOptimization);
router.post('/ai/medication-recommendations', getAIPharmacyMedicationRecommendations);

module.exports = router;