const User = require('../models/User');
const Patient = require('../models/Patient');
const Pharmacist = require('../models/Pharmacist');
const Prescription = require('../models/Prescription');
const PrescriptionDispense = require('../models/PrescriptionDispense');
const MedicationInventory = require('../models/MedicationInventory');
const PharmacyPatientProfile = require('../models/PharmacyPatientProfile');
const MedicationReview = require('../models/MedicationReview');
const MedicationReconciliation = require('../models/MedicationReconciliation');

// @desc    Get pharmacist dashboard data
// @route   GET /api/pharmacy/dashboard
// @access  Private (Pharmacist)
const getPharmacistDashboard = async (req, res) => {
  try {
    const pharmacistId = req.user._id;

    // Get pending prescriptions
    const pendingPrescriptions = await PrescriptionDispense.find({
      pharmacistId,
      status: { $in: ['pending', 'in-progress'] }
    })
    .populate('patientId', 'name email phoneNumber')
    .populate('doctorId', 'name')
    .sort({ createdAt: -1 })
    .limit(10);

    // Get low stock medications
    const lowStockMedications = await MedicationInventory.find({
      pharmacistId,
      lowStockAlert: true,
      isActive: true
    }).limit(10);

    // Get medications expiring soon
    const expiringMedications = await MedicationInventory.find({
      pharmacistId,
      nearExpiryAlert: true,
      isActive: true
    }).limit(10);

    // Get recent dispenses (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentDispenses = await PrescriptionDispense.find({
      pharmacistId,
      dispensingDate: { $gte: sevenDaysAgo },
      status: 'completed'
    }).countDocuments();

    // Get today's revenue
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayRevenue = await PrescriptionDispense.aggregate([
      {
        $match: {
          pharmacistId: req.user._id,
          dispensingDate: { $gte: today, $lt: tomorrow },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' }
        }
      }
    ]);

    // Get patient count
    const patientCount = await PharmacyPatientProfile.countDocuments({
      pharmacistId
    });

    // Get active alerts
    const activeAlerts = await PharmacyPatientProfile.aggregate([
      { $match: { pharmacistId } },
      { $unwind: '$alerts' },
      { $match: { 'alerts.isActive': true } },
      { $group: { _id: '$alerts.severity', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: {
        pendingPrescriptions,
        lowStockMedications,
        expiringMedications,
        statistics: {
          recentDispenses,
          todayRevenue: todayRevenue.length > 0 ? todayRevenue[0].total : 0,
          patientCount,
          pendingCount: pendingPrescriptions.length,
          lowStockCount: lowStockMedications.length,
          expiringCount: expiringMedications.length
        },
        alerts: activeAlerts
      }
    });
  } catch (error) {
    console.error('Get pharmacist dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data',
      error: error.message
    });
  }
};

// @desc    Get all prescriptions for pharmacy
// @route   GET /api/pharmacy/prescriptions
// @access  Private (Pharmacist)
const getPharmacyPrescriptions = async (req, res) => {
  try {
    const pharmacistId = req.user._id;
    const { status, page = 1, limit = 20, search } = req.query;

    let query = { pharmacistId };
    
    if (status) {
      query.status = status;
    }

    let prescriptions;
    
    if (search) {
      // Search in patient names or prescription details
      prescriptions = await PrescriptionDispense.find(query)
        .populate({
          path: 'patientId',
          select: 'name email phoneNumber',
          match: { name: { $regex: search, $options: 'i' } }
        })
        .populate('doctorId', 'name')
        .populate('prescriptionId')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);
        
      // Filter out null patient matches
      prescriptions = prescriptions.filter(p => p.patientId);
    } else {
      prescriptions = await PrescriptionDispense.find(query)
        .populate('patientId', 'name email phoneNumber')
        .populate('doctorId', 'name')
        .populate('prescriptionId')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);
    }

    const total = await PrescriptionDispense.countDocuments(query);

    res.json({
      success: true,
      data: {
        prescriptions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get pharmacy prescriptions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch prescriptions',
      error: error.message
    });
  }
};

// @desc    Verify and process prescription
// @route   POST /api/pharmacy/prescriptions/:prescriptionId/verify
// @access  Private (Pharmacist)
const verifyPrescription = async (req, res) => {
  try {
    const { prescriptionId } = req.params;
    const { verificationStatus, verificationNotes, dispensedMedications } = req.body;
    const pharmacistId = req.user._id;

    // Find or create prescription dispense record
    let prescriptionDispense = await PrescriptionDispense.findOne({
      prescriptionId,
      pharmacistId
    });

    if (!prescriptionDispense) {
      // Get original prescription
      const prescription = await Prescription.findById(prescriptionId)
        .populate('patientId')
        .populate('doctorId');

      if (!prescription) {
        return res.status(404).json({
          success: false,
          message: 'Prescription not found'
        });
      }

      // Create new dispense record
      prescriptionDispense = new PrescriptionDispense({
        prescriptionId,
        pharmacistId,
        patientId: prescription.patientId._id,
        doctorId: prescription.doctorId._id,
        dispensedMedications: [],
        totalAmount: 0
      });
    }

    // Update verification status
    prescriptionDispense.verificationStatus = verificationStatus;
    prescriptionDispense.verificationNotes = verificationNotes;
    prescriptionDispense.verifiedBy = pharmacistId;
    prescriptionDispense.verificationDate = new Date();

    if (verificationStatus === 'verified' && dispensedMedications) {
      prescriptionDispense.dispensedMedications = dispensedMedications;
      prescriptionDispense.status = 'in-progress';
      
      // Calculate total amount
      prescriptionDispense.totalAmount = dispensedMedications.reduce((total, med) => {
        return total + (med.totalPrice || 0);
      }, 0);
    } else if (verificationStatus === 'rejected') {
      prescriptionDispense.status = 'cancelled';
    }

    await prescriptionDispense.save();

    // Populate the response
    await prescriptionDispense.populate('patientId', 'name email phoneNumber');
    await prescriptionDispense.populate('doctorId', 'name');

    res.json({
      success: true,
      message: 'Prescription verification updated successfully',
      data: prescriptionDispense
    });
  } catch (error) {
    console.error('Verify prescription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify prescription',
      error: error.message
    });
  }
};

// @desc    Dispense medication
// @route   POST /api/pharmacy/prescriptions/:dispenseId/dispense
// @access  Private (Pharmacist)
const dispenseMedication = async (req, res) => {
  try {
    const { dispenseId } = req.params;
    const { paymentInfo, pickupInfo, counselingNotes, qualityChecks } = req.body;

    const prescriptionDispense = await PrescriptionDispense.findById(dispenseId);

    if (!prescriptionDispense) {
      return res.status(404).json({
        success: false,
        message: 'Prescription dispense record not found'
      });
    }

    // Update payment information
    if (paymentInfo) {
      prescriptionDispense.paymentInfo = paymentInfo;
    }

    // Update pickup information
    if (pickupInfo) {
      prescriptionDispense.pickupInfo = pickupInfo;
    }

    // Update counseling notes
    if (counselingNotes) {
      prescriptionDispense.dispensedMedications.forEach(med => {
        med.counselingProvided = true;
        med.counselingNotes = counselingNotes;
      });
    }

    // Update quality checks
    if (qualityChecks) {
      prescriptionDispense.qualityChecks = {
        ...prescriptionDispense.qualityChecks,
        ...qualityChecks,
        reviewedBy: req.user._id,
        reviewDate: new Date()
      };
    }

    // Update status based on pickup
    if (pickupInfo && pickupInfo.isPickedUp) {
      prescriptionDispense.status = 'completed';
      prescriptionDispense.pickupInfo.pickupDate = new Date();
    }

    // Update inventory for dispensed medications
    for (const med of prescriptionDispense.dispensedMedications) {
      if (med.medicationInventoryId) {
        await MedicationInventory.findByIdAndUpdate(
          med.medicationInventoryId,
          { $inc: { currentStock: -med.dispensedQuantity } }
        );
      }
    }

    await prescriptionDispense.save();

    // Populate the response
    await prescriptionDispense.populate('patientId', 'name email phoneNumber');
    await prescriptionDispense.populate('doctorId', 'name');

    res.json({
      success: true,
      message: 'Medication dispensed successfully',
      data: prescriptionDispense
    });
  } catch (error) {
    console.error('Dispense medication error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to dispense medication',
      error: error.message
    });
  }
};

// @desc    Get medication inventory
// @route   GET /api/pharmacy/inventory
// @access  Private (Pharmacist)
const getMedicationInventory = async (req, res) => {
  try {
    const pharmacistId = req.user._id;
    const { 
      page = 1, 
      limit = 20, 
      search, 
      category, 
      stockStatus, 
      expiryStatus 
    } = req.query;

    let query = { pharmacistId, isActive: true };

    if (search) {
      query.$or = [
        { medicationName: { $regex: search, $options: 'i' } },
        { genericName: { $regex: search, $options: 'i' } },
        { brandName: { $regex: search, $options: 'i' } },
        { ndc: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) {
      query.category = category;
    }

    if (stockStatus) {
      switch (stockStatus) {
        case 'low-stock':
          query.lowStockAlert = true;
          break;
        case 'out-of-stock':
          query.currentStock = 0;
          break;
        case 'in-stock':
          query.currentStock = { $gt: 0 };
          query.lowStockAlert = false;
          break;
      }
    }

    if (expiryStatus === 'expiring-soon') {
      query.nearExpiryAlert = true;
    }

    const inventory = await MedicationInventory.find(query)
      .sort({ medicationName: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await MedicationInventory.countDocuments(query);

    // Add virtual fields to response
    const inventoryWithVirtuals = inventory.map(item => {
      const itemObj = item.toObject({ virtuals: true });
      return itemObj;
    });

    res.json({
      success: true,
      data: {
        inventory: inventoryWithVirtuals,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get medication inventory error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inventory',
      error: error.message
    });
  }
};

// @desc    Add medication to inventory
// @route   POST /api/pharmacy/inventory
// @access  Private (Pharmacist)
const addMedicationToInventory = async (req, res) => {
  try {
    const pharmacistId = req.user._id;
    const medicationData = {
      ...req.body,
      pharmacistId
    };

    const medication = new MedicationInventory(medicationData);
    await medication.save();

    res.status(201).json({
      success: true,
      message: 'Medication added to inventory successfully',
      data: medication
    });
  } catch (error) {
    console.error('Add medication to inventory error:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Medication with this NDC already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to add medication to inventory',
      error: error.message
    });
  }
};

// @desc    Update medication inventory
// @route   PUT /api/pharmacy/inventory/:inventoryId
// @access  Private (Pharmacist)
const updateMedicationInventory = async (req, res) => {
  try {
    const { inventoryId } = req.params;
    const pharmacistId = req.user._id;

    const medication = await MedicationInventory.findOneAndUpdate(
      { _id: inventoryId, pharmacistId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!medication) {
      return res.status(404).json({
        success: false,
        message: 'Medication not found'
      });
    }

    res.json({
      success: true,
      message: 'Medication inventory updated successfully',
      data: medication
    });
  } catch (error) {
    console.error('Update medication inventory error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update medication inventory',
      error: error.message
    });
  }
};

// @desc    Get patient profiles
// @route   GET /api/pharmacy/patients
// @access  Private (Pharmacist)
const getPatientProfiles = async (req, res) => {
  try {
    console.log('getPatientProfiles called by user:', req.user); // Debug log
    const { page = 1, limit = 20, search } = req.query;

    let query = {};

    // Add search functionality
    if (search) {
      query = {
        $or: [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phoneNumber: { $regex: search, $options: 'i' } }
        ]
      };
    }

    console.log('Query:', query); // Debug log

    // Get patients from the main Patient model
    const patients = await Patient.find(query)
      .select('firstName lastName email phoneNumber dateOfBirth bloodType allergies chronicConditions')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    console.log('Found patients:', patients.length); // Debug log

    const total = await Patient.countDocuments(query);
    console.log('Total patients:', total); // Debug log

    // Transform patients to match expected format
    const transformedPatients = patients.map(patient => ({
      _id: patient._id,
      firstName: patient.firstName,
      lastName: patient.lastName,
      email: patient.email,
      phoneNumber: patient.phoneNumber,
      dateOfBirth: patient.dateOfBirth,
      bloodType: patient.bloodType,
      allergies: patient.allergies || [],
      chronicConditions: patient.chronicConditions || [],
      // Add pharmacy-specific fields if needed
      pharmacyNotes: '',
      lastVisit: patient.updatedAt,
      isActive: true
    }));

    res.json({
      success: true,
      data: {
        patients: transformedPatients,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get patient profiles error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch patient profiles',
      error: error.message
    });
  }
};

// @desc    Get patient profile by ID
// @route   GET /api/pharmacy/patients/:patientId
// @access  Private (Pharmacist)
const getPatientProfile = async (req, res) => {
  try {
    const { patientId } = req.params;
    const pharmacistId = req.user._id;

    const patientProfile = await PharmacyPatientProfile.findOne({
      patientId,
      pharmacistId
    })
    .populate('patientId', 'name email phoneNumber dateOfBirth gender address')
    .populate('medicationHistory.prescriptionDispenseId');

    if (!patientProfile) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found'
      });
    }

    // Get recent prescriptions for this patient
    const recentPrescriptions = await PrescriptionDispense.find({
      patientId,
      pharmacistId
    })
    .populate('prescriptionId')
    .sort({ dispensingDate: -1 })
    .limit(10);

    const profileWithVirtuals = patientProfile.toObject({ virtuals: true });

    res.json({
      success: true,
      data: {
        profile: profileWithVirtuals,
        recentPrescriptions
      }
    });
  } catch (error) {
    console.error('Get patient profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch patient profile',
      error: error.message
    });
  }
};

// @desc    Update patient profile
// @route   PUT /api/pharmacy/patients/:patientId
// @access  Private (Pharmacist)
const updatePatientProfile = async (req, res) => {
  try {
    const { patientId } = req.params;
    const pharmacistId = req.user._id;

    let patientProfile = await PharmacyPatientProfile.findOne({
      patientId,
      pharmacistId
    });

    if (!patientProfile) {
      // Create new profile if it doesn't exist
      patientProfile = new PharmacyPatientProfile({
        patientId,
        pharmacistId,
        ...req.body
      });
    } else {
      // Update existing profile
      Object.assign(patientProfile, req.body);
    }

    await patientProfile.save();
    await patientProfile.populate('patientId', 'name email phoneNumber');

    res.json({
      success: true,
      message: 'Patient profile updated successfully',
      data: patientProfile
    });
  } catch (error) {
    console.error('Update patient profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update patient profile',
      error: error.message
    });
  }
};

// @desc    Get pharmacy reports
// @route   GET /api/pharmacy/reports
// @access  Private (Pharmacist)
const getPharmacyReports = async (req, res) => {
  try {
    const pharmacistId = req.user._id;
    const { reportType, startDate, endDate } = req.query;

    const start = new Date(startDate || new Date().setMonth(new Date().getMonth() - 1));
    const end = new Date(endDate || new Date());

    let reportData = {};

    switch (reportType) {
      case 'sales':
        reportData = await generateSalesReport(pharmacistId, start, end);
        break;
      case 'inventory':
        reportData = await generateInventoryReport(pharmacistId);
        break;
      case 'patient-activity':
        reportData = await generatePatientActivityReport(pharmacistId, start, end);
        break;
      case 'medication-adherence':
        reportData = await generateAdherenceReport(pharmacistId, start, end);
        break;
      default:
        reportData = await generateOverviewReport(pharmacistId, start, end);
    }

    res.json({
      success: true,
      data: reportData
    });
  } catch (error) {
    console.error('Get pharmacy reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate reports',
      error: error.message
    });
  }
};

// Helper functions for reports
const generateSalesReport = async (pharmacistId, startDate, endDate) => {
  const salesData = await PrescriptionDispense.aggregate([
    {
      $match: {
        pharmacistId,
        dispensingDate: { $gte: startDate, $lte: endDate },
        status: 'completed'
      }
    },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: '%Y-%m-%d', date: '$dispensingDate' } }
        },
        totalSales: { $sum: '$totalAmount' },
        prescriptionCount: { $sum: 1 }
      }
    },
    { $sort: { '_id.date': 1 } }
  ]);

  const totalRevenue = await PrescriptionDispense.aggregate([
    {
      $match: {
        pharmacistId,
        dispensingDate: { $gte: startDate, $lte: endDate },
        status: 'completed'
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$totalAmount' },
        count: { $sum: 1 }
      }
    }
  ]);

  return {
    dailySales: salesData,
    summary: totalRevenue[0] || { total: 0, count: 0 }
  };
};

const generateInventoryReport = async (pharmacistId) => {
  const inventoryStats = await MedicationInventory.aggregate([
    { $match: { pharmacistId, isActive: true } },
    {
      $group: {
        _id: '$category',
        totalItems: { $sum: 1 },
        totalValue: { $sum: { $multiply: ['$currentStock', '$unitPrice'] } },
        lowStockItems: {
          $sum: { $cond: ['$lowStockAlert', 1, 0] }
        },
        expiringItems: {
          $sum: { $cond: ['$nearExpiryAlert', 1, 0] }
        }
      }
    }
  ]);

  return { inventoryByCategory: inventoryStats };
};

const generatePatientActivityReport = async (pharmacistId, startDate, endDate) => {
  const patientActivity = await PrescriptionDispense.aggregate([
    {
      $match: {
        pharmacistId,
        dispensingDate: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: '$patientId',
        prescriptionCount: { $sum: 1 },
        totalSpent: { $sum: '$totalAmount' },
        lastVisit: { $max: '$dispensingDate' }
      }
    },
    { $sort: { prescriptionCount: -1 } },
    { $limit: 20 }
  ]);

  return { topPatients: patientActivity };
};

const generateAdherenceReport = async (pharmacistId, startDate, endDate) => {
  const adherenceData = await PharmacyPatientProfile.aggregate([
    { $match: { pharmacistId } },
    {
      $group: {
        _id: null,
        averageAdherence: { $avg: '$complianceAssessment.overallAdherence' },
        patientsWithLowAdherence: {
          $sum: {
            $cond: [
              { $lt: ['$complianceAssessment.overallAdherence', 80] },
              1,
              0
            ]
          }
        },
        totalPatients: { $sum: 1 }
      }
    }
  ]);

  return { adherenceStats: adherenceData[0] || { averageAdherence: 0, patientsWithLowAdherence: 0, totalPatients: 0 } };
};

const generateOverviewReport = async (pharmacistId, startDate, endDate) => {
  const [sales, inventory, patients, adherence] = await Promise.all([
    generateSalesReport(pharmacistId, startDate, endDate),
    generateInventoryReport(pharmacistId),
    generatePatientActivityReport(pharmacistId, startDate, endDate),
    generateAdherenceReport(pharmacistId, startDate, endDate)
  ]);

  return { sales, inventory, patients, adherence };
};

module.exports = {
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
};