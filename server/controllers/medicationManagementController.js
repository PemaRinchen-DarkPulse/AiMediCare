const MedicationReconciliation = require('../models/MedicationReconciliation');
const PharmacyPatientProfile = require('../models/PharmacyPatientProfile');
const PrescriptionDispense = require('../models/PrescriptionDispense');
const axios = require('axios');

// @desc    Perform medication reconciliation
// @route   POST /api/pharmacy/medication-reconciliation
// @access  Private (Pharmacist)
const performMedicationReconciliation = async (req, res) => {
  try {
    const { patientId, sources, currentMedications } = req.body;
    const pharmacistId = req.user._id;

    // Get patient's existing medication reconciliation record
    let reconciliation = await MedicationReconciliation.findOne({ patientId });

    if (!reconciliation) {
      reconciliation = new MedicationReconciliation({
        patientId,
        performerId: pharmacistId,
        performedBy: req.user.name
      });
    }

    // Update sources
    reconciliation.sources = sources;
    reconciliation.lastReconciliationDate = new Date();
    reconciliation.status = 'pending';

    // Get patient's pharmacy profile
    const patientProfile = await PharmacyPatientProfile.findOne({
      patientId,
      pharmacistId
    });

    if (patientProfile) {
      // Compare current medications with profile medications
      const discrepancies = [];
      
      // Check for medications in profile but not in current list
      patientProfile.currentMedications.forEach(profileMed => {
        if (profileMed.status === 'active') {
          const found = currentMedications.find(currMed => 
            currMed.medicationName.toLowerCase() === profileMed.medicationName.toLowerCase()
          );
          
          if (!found) {
            discrepancies.push({
              medicationName: profileMed.medicationName,
              description: `Medication in profile but not reported by patient`,
              status: 'pending'
            });
          } else if (found.dosage !== profileMed.dosage) {
            discrepancies.push({
              medicationName: profileMed.medicationName,
              description: `Dosage discrepancy - Profile: ${profileMed.dosage}, Reported: ${found.dosage}`,
              status: 'pending'
            });
          }
        }
      });

      // Check for medications reported by patient but not in profile
      currentMedications.forEach(currMed => {
        const found = patientProfile.currentMedications.find(profileMed => 
          profileMed.medicationName.toLowerCase() === currMed.medicationName.toLowerCase() &&
          profileMed.status === 'active'
        );
        
        if (!found) {
          discrepancies.push({
            medicationName: currMed.medicationName,
            description: `Medication reported by patient but not in pharmacy profile`,
            status: 'pending'
          });
        }
      });

      reconciliation.discrepancies = discrepancies;

      if (discrepancies.length === 0) {
        reconciliation.status = 'resolved';
      }
    }

    await reconciliation.save();

    res.json({
      success: true,
      message: 'Medication reconciliation performed successfully',
      data: reconciliation
    });
  } catch (error) {
    console.error('Medication reconciliation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to perform medication reconciliation',
      error: error.message
    });
  }
};

// @desc    Resolve medication reconciliation discrepancy
// @route   PUT /api/pharmacy/medication-reconciliation/:reconciliationId/resolve
// @access  Private (Pharmacist)
const resolveReconciliationDiscrepancy = async (req, res) => {
  try {
    const { reconciliationId } = req.params;
    const { discrepancyIndex, resolution, updateProfile } = req.body;

    const reconciliation = await MedicationReconciliation.findById(reconciliationId);

    if (!reconciliation) {
      return res.status(404).json({
        success: false,
        message: 'Medication reconciliation record not found'
      });
    }

    if (discrepancyIndex >= reconciliation.discrepancies.length) {
      return res.status(400).json({
        success: false,
        message: 'Invalid discrepancy index'
      });
    }

    // Update the discrepancy
    reconciliation.discrepancies[discrepancyIndex].status = 'resolved';
    reconciliation.discrepancies[discrepancyIndex].resolution = resolution;
    reconciliation.discrepancies[discrepancyIndex].resolvedBy = req.user.name;
    reconciliation.discrepancies[discrepancyIndex].resolutionDate = new Date();

    // Check if all discrepancies are resolved
    const unresolvedDiscrepancies = reconciliation.discrepancies.filter(d => d.status !== 'resolved');
    if (unresolvedDiscrepancies.length === 0) {
      reconciliation.status = 'resolved';
    }

    await reconciliation.save();

    // Update patient profile if requested
    if (updateProfile) {
      const patientProfile = await PharmacyPatientProfile.findOne({
        patientId: reconciliation.patientId,
        pharmacistId: req.user._id
      });

      if (patientProfile && updateProfile.medication) {
        // Add or update medication in profile
        const existingMedIndex = patientProfile.currentMedications.findIndex(
          med => med.medicationName.toLowerCase() === updateProfile.medication.medicationName.toLowerCase()
        );

        if (existingMedIndex >= 0) {
          patientProfile.currentMedications[existingMedIndex] = {
            ...patientProfile.currentMedications[existingMedIndex],
            ...updateProfile.medication
          };
        } else {
          patientProfile.currentMedications.push(updateProfile.medication);
        }

        await patientProfile.save();
      }
    }

    res.json({
      success: true,
      message: 'Discrepancy resolved successfully',
      data: reconciliation
    });
  } catch (error) {
    console.error('Resolve reconciliation discrepancy error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resolve discrepancy',
      error: error.message
    });
  }
};

// @desc    Check for drug interactions
// @route   POST /api/pharmacy/drug-interactions/check
// @access  Private (Pharmacist)
const checkDrugInteractions = async (req, res) => {
  try {
    const { medications, patientId } = req.body;

    if (!medications || medications.length < 2) {
      return res.json({
        success: true,
        data: {
          interactions: [],
          message: 'Need at least 2 medications to check for interactions'
        }
      });
    }

    // Get patient profile for additional context
    let patientProfile = null;
    if (patientId) {
      patientProfile = await PharmacyPatientProfile.findOne({
        patientId,
        pharmacistId: req.user._id
      });
    }

    // Check for known interactions in our database
    const interactions = [];
    
    for (let i = 0; i < medications.length; i++) {
      for (let j = i + 1; j < medications.length; j++) {
        const medA = medications[i];
        const medB = medications[j];
        
        // Check for known interactions (you would typically have a drug interaction database)
        const interaction = await checkKnownInteractions(medA, medB);
        if (interaction) {
          interactions.push(interaction);
        }
      }
    }

    // Check against patient allergies
    const allergyAlerts = [];
    if (patientProfile && patientProfile.allergies) {
      medications.forEach(med => {
        const allergyMatch = patientProfile.allergies.find(allergy => 
          med.name.toLowerCase().includes(allergy.allergen.toLowerCase()) ||
          allergy.allergen.toLowerCase().includes(med.name.toLowerCase())
        );
        
        if (allergyMatch) {
          allergyAlerts.push({
            medication: med.name,
            allergen: allergyMatch.allergen,
            reactionType: allergyMatch.reactionType,
            symptoms: allergyMatch.symptoms
          });
        }
      });
    }

    // Try to get interactions from external API (if available)
    let externalInteractions = [];
    try {
      // This would call an external drug interaction API
      // externalInteractions = await getExternalDrugInteractions(medications);
    } catch (error) {
      console.log('External API not available:', error.message);
    }

    // Combine all interactions and remove duplicates
    const allInteractions = [...interactions, ...externalInteractions];
    const uniqueInteractions = allInteractions.filter((interaction, index, self) =>
      index === self.findIndex(i => 
        i.medicationA.name === interaction.medicationA.name && 
        i.medicationB.name === interaction.medicationB.name
      )
    );

    res.json({
      success: true,
      data: {
        interactions: uniqueInteractions,
        allergyAlerts,
        checkedMedications: medications,
        checkDate: new Date()
      }
    });
  } catch (error) {
    console.error('Drug interaction check error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check drug interactions',
      error: error.message
    });
  }
};

// Helper function to check known interactions in database
const checkKnownInteractions = async (medA, medB) => {
  // This would query a drug interaction database
  // For now, we'll return some common known interactions
  const knownInteractions = [
    {
      medA: 'warfarin',
      medB: 'aspirin',
      type: 'major',
      description: 'Increased risk of bleeding',
      management: 'Monitor INR closely and watch for signs of bleeding'
    },
    {
      medA: 'simvastatin',
      medB: 'amlodipine',
      type: 'moderate',
      description: 'Increased risk of myopathy',
      management: 'Consider dose adjustment of simvastatin'
    },
    {
      medA: 'metformin',
      medB: 'contrast dye',
      type: 'major',
      description: 'Risk of lactic acidosis',
      management: 'Discontinue metformin before contrast procedure'
    }
  ];

  const interaction = knownInteractions.find(interaction =>
    (interaction.medA.toLowerCase() === medA.name.toLowerCase() && 
     interaction.medB.toLowerCase() === medB.name.toLowerCase()) ||
    (interaction.medA.toLowerCase() === medB.name.toLowerCase() && 
     interaction.medB.toLowerCase() === medA.name.toLowerCase())
  );

  if (interaction) {
    return {
      medicationA: { name: medA.name },
      medicationB: { name: medB.name },
      interactionType: interaction.type,
      description: interaction.description,
      management: interaction.management,
      severity: interaction.type === 'major' ? 5 : interaction.type === 'moderate' ? 3 : 1
    };
  }

  return null;
};

// @desc    Get medication adherence tracking
// @route   GET /api/pharmacy/adherence/:patientId
// @access  Private (Pharmacist)
const getAdherenceTracking = async (req, res) => {
  try {
    const { patientId } = req.params;
    const pharmacistId = req.user._id;

    const patientProfile = await PharmacyPatientProfile.findOne({
      patientId,
      pharmacistId
    }).populate('patientId', 'name email');

    if (!patientProfile) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found'
      });
    }

    // Get recent prescription dispenses for adherence calculation
    const recentDispenses = await PrescriptionDispense.find({
      patientId,
      pharmacistId,
      status: 'completed',
      dispensingDate: { $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) } // Last 90 days
    }).sort({ dispensingDate: -1 });

    // Calculate adherence scores for each medication
    const adherenceData = patientProfile.currentMedications
      .filter(med => med.status === 'active')
      .map(med => {
        const medicationDispenses = recentDispenses.filter(dispense =>
          dispense.dispensedMedications.some(dispMed => 
            dispMed.medicationName.toLowerCase() === med.medicationName.toLowerCase()
          )
        );

        let adherenceScore = 100; // Start with perfect adherence
        let missedRefills = 0;
        let totalExpectedRefills = 0;

        if (med.nextRefillDue && medicationDispenses.length > 0) {
          // Calculate expected refills based on frequency and last dispense
          const lastDispense = medicationDispenses[0];
          const daysSinceLastDispense = Math.floor(
            (new Date() - new Date(lastDispense.dispensingDate)) / (1000 * 60 * 60 * 24)
          );

          // Estimate refill frequency (this is simplified)
          const estimatedRefillInterval = 30; // days
          totalExpectedRefills = Math.floor(daysSinceLastDispense / estimatedRefillInterval);
          
          if (totalExpectedRefills > medicationDispenses.length) {
            missedRefills = totalExpectedRefills - medicationDispenses.length;
            adherenceScore = Math.max(0, 100 - (missedRefills * 20)); // Reduce by 20% per missed refill
          }
        }

        return {
          medicationName: med.medicationName,
          adherenceScore,
          lastRefillDate: med.lastRefillDate,
          nextRefillDue: med.nextRefillDue,
          totalDispenses: medicationDispenses.length,
          missedRefills,
          status: adherenceScore >= 80 ? 'good' : adherenceScore >= 60 ? 'moderate' : 'poor'
        };
      });

    const overallAdherence = adherenceData.length > 0 
      ? adherenceData.reduce((sum, med) => sum + med.adherenceScore, 0) / adherenceData.length
      : 100;

    res.json({
      success: true,
      data: {
        patient: patientProfile.patientId,
        overallAdherence: Math.round(overallAdherence),
        medicationAdherence: adherenceData,
        complianceAssessment: patientProfile.complianceAssessment,
        recentDispenseCount: recentDispenses.length,
        assessmentDate: new Date()
      }
    });
  } catch (error) {
    console.error('Get adherence tracking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch adherence tracking',
      error: error.message
    });
  }
};

// @desc    Update adherence tracking
// @route   PUT /api/pharmacy/adherence/:patientId
// @access  Private (Pharmacist)
const updateAdherenceTracking = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { complianceAssessment, medicationUpdates } = req.body;
    const pharmacistId = req.user._id;

    const patientProfile = await PharmacyPatientProfile.findOne({
      patientId,
      pharmacistId
    });

    if (!patientProfile) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found'
      });
    }

    // Update compliance assessment
    if (complianceAssessment) {
      patientProfile.complianceAssessment = {
        ...patientProfile.complianceAssessment,
        ...complianceAssessment,
        lastAssessmentDate: new Date(),
        assessedBy: pharmacistId
      };
    }

    // Update individual medication adherence scores
    if (medicationUpdates) {
      medicationUpdates.forEach(update => {
        const medIndex = patientProfile.currentMedications.findIndex(
          med => med.medicationName.toLowerCase() === update.medicationName.toLowerCase()
        );
        
        if (medIndex >= 0) {
          patientProfile.currentMedications[medIndex].adherenceScore = update.adherenceScore;
          if (update.lastRefillDate) {
            patientProfile.currentMedications[medIndex].lastRefillDate = update.lastRefillDate;
          }
          if (update.nextRefillDue) {
            patientProfile.currentMedications[medIndex].nextRefillDue = update.nextRefillDue;
          }
        }
      });
    }

    await patientProfile.save();

    res.json({
      success: true,
      message: 'Adherence tracking updated successfully',
      data: patientProfile.complianceAssessment
    });
  } catch (error) {
    console.error('Update adherence tracking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update adherence tracking',
      error: error.message
    });
  }
};

module.exports = {
  performMedicationReconciliation,
  resolveReconciliationDiscrepancy,
  checkDrugInteractions,
  getAdherenceTracking,
  updateAdherenceTracking
};