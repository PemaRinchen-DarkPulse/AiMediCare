const express = require('express');
const router = express.Router();
const medicineRecommendationsController = require('../controllers/medicineRecommendationsController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

// Only doctors can access these routes
router.get('/', restrictTo('doctor'), medicineRecommendationsController.getMedicineRecommendations);

module.exports = router;