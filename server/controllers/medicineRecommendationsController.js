/**
 * Medicine Recommendation Controller
 * Provides AI-based medicine recommendations for diagnoses
 */

// A simple mapping of diagnoses to recommended medications
// In a production environment, this would be replaced with a more sophisticated system,
// possibly using NLP/ML or connecting to an external medical API
const diagnosisToMedicationMap = {
  // Respiratory conditions
  'common cold': [
    { name: 'Acetaminophen', dosage: '500mg', frequency: 'Every 6 hours as needed', duration: '5 days', instructions: 'Take with food' },
    { name: 'Pseudoephedrine', dosage: '60mg', frequency: 'Every 6 hours as needed', duration: '5 days', instructions: 'May cause insomnia' }
  ],
  'influenza': [
    { name: 'Oseltamivir', dosage: '75mg', frequency: 'Twice daily', duration: '5 days', instructions: 'Take with food to minimize GI upset' },
    { name: 'Acetaminophen', dosage: '500mg', frequency: 'Every 6 hours as needed', duration: '5 days', instructions: 'For fever and body aches' }
  ],
  'pneumonia': [
    { name: 'Amoxicillin', dosage: '500mg', frequency: 'Three times daily', duration: '7-10 days', instructions: 'Complete full course' },
    { name: 'Azithromycin', dosage: '500mg', frequency: 'Once daily', duration: '5 days', instructions: 'Take on empty stomach' }
  ],
  'bronchitis': [
    { name: 'Dextromethorphan', dosage: '20mg', frequency: 'Every 6-8 hours', duration: '7 days', instructions: 'For cough' },
    { name: 'Guaifenesin', dosage: '400mg', frequency: 'Every 4 hours', duration: '7 days', instructions: 'To loosen mucus' }
  ],
  'asthma': [
    { name: 'Albuterol', dosage: '2 puffs', frequency: 'Every 4-6 hours as needed', duration: 'As needed', instructions: 'For acute symptoms' },
    { name: 'Fluticasone', dosage: '1 puff', frequency: 'Twice daily', duration: 'Ongoing', instructions: 'Maintenance therapy' }
  ],
  
  // Cardiovascular conditions
  'hypertension': [
    { name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', duration: 'Ongoing', instructions: 'Take at the same time each day' },
    { name: 'Amlodipine', dosage: '5mg', frequency: 'Once daily', duration: 'Ongoing', instructions: 'May cause swelling in ankles' }
  ],
  'hyperlipidemia': [
    { name: 'Atorvastatin', dosage: '20mg', frequency: 'Once daily at bedtime', duration: 'Ongoing', instructions: 'Avoid grapefruit juice' },
    { name: 'Simvastatin', dosage: '20mg', frequency: 'Once daily at bedtime', duration: 'Ongoing', instructions: 'Report muscle pain' }
  ],
  
  // Gastrointestinal conditions
  'gastritis': [
    { name: 'Omeprazole', dosage: '20mg', frequency: 'Once daily before breakfast', duration: '14 days', instructions: 'Take before eating' },
    { name: 'Famotidine', dosage: '20mg', frequency: 'Twice daily', duration: '14 days', instructions: 'Take with water' }
  ],
  'gerd': [
    { name: 'Esomeprazole', dosage: '40mg', frequency: 'Once daily', duration: '28 days', instructions: 'Take 30 minutes before eating' },
    { name: 'Ranitidine', dosage: '150mg', frequency: 'Twice daily', duration: '14 days', instructions: 'Take with or without food' }
  ],
  'ibs': [
    { name: 'Dicyclomine', dosage: '20mg', frequency: 'Four times daily', duration: 'As needed', instructions: 'Take before meals' },
    { name: 'Loperamide', dosage: '2mg', frequency: 'As needed', duration: 'As needed', instructions: 'For diarrhea' }
  ],
  
  // Pain conditions
  'headache': [
    { name: 'Ibuprofen', dosage: '400mg', frequency: 'Every 6-8 hours as needed', duration: '3 days', instructions: 'Take with food' },
    { name: 'Acetaminophen', dosage: '500mg', frequency: 'Every 6 hours as needed', duration: '3 days', instructions: 'Do not exceed 4g per day' }
  ],
  'migraine': [
    { name: 'Sumatriptan', dosage: '50mg', frequency: 'As needed', duration: 'As needed', instructions: 'Take at first sign of migraine' },
    { name: 'Rizatriptan', dosage: '10mg', frequency: 'As needed', duration: 'As needed', instructions: 'May repeat after 2 hours if needed' }
  ],
  'arthritis': [
    { name: 'Naproxen', dosage: '500mg', frequency: 'Twice daily', duration: 'As needed', instructions: 'Take with food' },
    { name: 'Celecoxib', dosage: '200mg', frequency: 'Once daily', duration: 'As needed', instructions: 'May increase cardiovascular risk' }
  ],
  
  // Mental health conditions
  'depression': [
    { name: 'Sertraline', dosage: '50mg', frequency: 'Once daily', duration: 'Ongoing', instructions: 'May take 2-4 weeks for full effect' },
    { name: 'Fluoxetine', dosage: '20mg', frequency: 'Once daily in the morning', duration: 'Ongoing', instructions: 'May cause insomnia if taken later in day' }
  ],
  'anxiety': [
    { name: 'Escitalopram', dosage: '10mg', frequency: 'Once daily', duration: 'Ongoing', instructions: 'Take at the same time each day' },
    { name: 'Lorazepam', dosage: '0.5mg', frequency: 'As needed', duration: 'Short-term use only', instructions: 'May cause drowsiness' }
  ],
  'insomnia': [
    { name: 'Zolpidem', dosage: '10mg', frequency: 'Once daily at bedtime', duration: '7-10 days', instructions: 'Take only if you have 7-8 hours for sleep' },
    { name: 'Trazodone', dosage: '50mg', frequency: 'Once at bedtime', duration: 'As needed', instructions: 'May cause morning drowsiness' }
  ],
  
  // Endocrine conditions
  'type 2 diabetes': [
    { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily with meals', duration: 'Ongoing', instructions: 'May cause GI upset initially' },
    { name: 'Glipizide', dosage: '5mg', frequency: 'Once daily before breakfast', duration: 'Ongoing', instructions: 'Take 30 minutes before eating' }
  ],
  'hypothyroidism': [
    { name: 'Levothyroxine', dosage: '50mcg', frequency: 'Once daily on empty stomach', duration: 'Ongoing', instructions: 'Take 30-60 minutes before breakfast' }
  ]
};

// Function to find partial matches in diagnoses
const findMatchingDiagnoses = (query) => {
  query = query.toLowerCase().trim();
  const matches = [];

  // Check for exact matches first
  if (diagnosisToMedicationMap[query]) {
    return diagnosisToMedicationMap[query];
  }
  
  // Check for partial matches
  for (const diagnosis in diagnosisToMedicationMap) {
    if (diagnosis.includes(query) || query.includes(diagnosis)) {
      matches.push(...diagnosisToMedicationMap[diagnosis]);
    }
  }
  
  // Check keywords
  const keywords = query.split(/\s+/);
  for (const keyword of keywords) {
    if (keyword.length < 3) continue; // Skip short words
    
    for (const diagnosis in diagnosisToMedicationMap) {
      if (diagnosis.includes(keyword) && !matches.some(m => diagnosisToMedicationMap[diagnosis].includes(m))) {
        matches.push(...diagnosisToMedicationMap[diagnosis]);
      }
    }
  }
  
  // Remove duplicates (based on medication name)
  const uniqueMedications = [];
  const seen = new Set();
  
  for (const med of matches) {
    if (!seen.has(med.name)) {
      seen.add(med.name);
      uniqueMedications.push(med);
    }
  }
  
  return uniqueMedications;
};

// Controller to get medicine recommendations
exports.getMedicineRecommendations = (req, res) => {
  try {
    const { diagnosis } = req.query;
    
    if (!diagnosis) {
      return res.status(400).json({
        status: 'error',
        message: 'Diagnosis parameter is required'
      });
    }
    
    const recommendations = findMatchingDiagnoses(diagnosis);
    
    // Return the recommendations
    res.status(200).json({
      status: 'success',
      recommendations
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};