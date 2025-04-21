const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Patient = require('../models/Patient');
const HealthRecord = require('../models/HealthRecord');
const EmergencyContact = require('../models/EmergencyContact');
const Allergy = require('../models/Allergy');
const ChronicCondition = require('../models/ChronicCondition');
const Medication = require('../models/Medication');
const LabResult = require('../models/LabResult');
const ImagingReport = require('../models/ImagingReport');
const VitalRecord = require('../models/VitalRecord');
const Immunization = require('../models/Immunization');
const TreatmentPlan = require('../models/TreatmentPlan');

dotenv.config();

// Connect to Database
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Seed function
const seedHealthRecords = async () => {
  try {
    console.log('Starting the health records seeding process...');
    
    // Find an existing patient user to associate records with
    const existingUser = await User.findOne({ email: 'patient@example.com' });
    
    if (!existingUser) {
      console.log('Creating a new patient user...');
      // Create a new user if none exists
      const newUser = new User({
        name: 'Pema Rinchen',
        email: 'patient@example.com',
        password: '$2a$10$X/aYlIokIJ5z.dXz3k1ta.TO/gQVCgP9bncboWkbfj9gGk3LFh.My', // hashed 'password123'
        role: 'patient',
        isVerified: true
      });

      await newUser.save();
      console.log('Created new user:', newUser._id);
      
      // Create patient profile with numeric height and weight
      const newPatient = new Patient({
        user: newUser._id,
        name: 'Pema Rinchen',
        dateOfBirth: '1983-06-15',
        gender: 'Female',
        bloodType: 'O+',
        height: 66, // 5'6" in inches
        weight: 165, // Weight in pounds, without the 'lbs' text
        contactInfo: {
          email: 'patient@example.com',
          phone: '(555) 123-4567',
          address: '123 Medical Ave, Wellness City, CA 90210'
        }
      });

      await newPatient.save();
      console.log('Created new patient profile:', newPatient._id);
      
      var patientId = newPatient._id;
    } else {
      console.log('Found existing user:', existingUser._id);
      // Find patient profile
      const existingPatient = await Patient.findOne({ user: existingUser._id });
      
      if (!existingPatient) {
        console.log('Creating patient profile for existing user...');
        const newPatient = new Patient({
          user: existingUser._id,
          name: 'Pema Rinchen',
          dateOfBirth: '1983-06-15',
          gender: 'Female',
          bloodType: 'O+',
          height: 66, // 5'6" in inches
          weight: 165, // Weight in pounds, without the 'lbs' text
          contactInfo: {
            email: 'patient@example.com',
            phone: '(555) 123-4567',
            address: '123 Medical Ave, Wellness City, CA 90210'
          }
        });

        await newPatient.save();
        console.log('Created patient profile for existing user:', newPatient._id);
        var patientId = newPatient._id;
      } else {
        console.log('Found existing patient profile:', existingPatient._id);
        var patientId = existingPatient._id;
      }
    }
    
    // Clear existing health records for this patient
    await Promise.all([
      EmergencyContact.deleteMany({ patient: patientId }),
      HealthRecord.deleteMany({ patient: patientId }),
      Allergy.deleteMany({ patient: patientId }),
      ChronicCondition.deleteMany({ patient: patientId }),
      Medication.deleteMany({ patient: patientId }),
      LabResult.deleteMany({ patient: patientId }),
      ImagingReport.deleteMany({ patient: patientId }),
      VitalRecord.deleteMany({ patient: patientId }),
      Immunization.deleteMany({ patient: patientId }),
      TreatmentPlan.deleteMany({ patient: patientId })
    ]);
    console.log('Cleared existing health records');

    // Create emergency contacts
    const emergencyContact = new EmergencyContact({
      patient: patientId,
      name: 'Tenzin Rinchen',
      relationship: 'Spouse',
      phone: '(555) 987-6543',
      email: 'tenzin.rinchen@example.com'
    });
    await emergencyContact.save();
    console.log('Added emergency contact');

    // Create medical history records
    const medicalHistory = [
      {
        patient: patientId,
        recordType: 'diagnosis',
        date: new Date('2024-11-18'),
        diagnosis: 'Type 2 Diabetes',
        provider: 'Dr. Sarah Johnson',
        status: 'Active',
        notes: 'Initial diagnosis. Started on metformin.'
      },
      {
        patient: patientId,
        recordType: 'diagnosis',
        date: new Date('2023-08-05'),
        diagnosis: 'Hypertension',
        provider: 'Dr. Michael Chen',
        status: 'Active',
        notes: 'Prescribed Lisinopril. Diet and exercise modifications recommended.'
      },
      {
        patient: patientId,
        recordType: 'diagnosis',
        date: new Date('2022-03-20'),
        diagnosis: 'Appendicitis',
        provider: 'Dr. James Wilson',
        status: 'Resolved',
        notes: 'Appendectomy performed. No complications.'
      }
    ];
    await HealthRecord.insertMany(medicalHistory);
    console.log('Added medical history records');

    // Create allergies
    const allergies = [
      {
        patient: patientId,
        allergen: 'Penicillin',
        severity: 'Severe',
        reaction: 'Anaphylaxis',
        dateIdentified: new Date('2010-05-12')
      },
      {
        patient: patientId,
        allergen: 'Shellfish',
        severity: 'Moderate',
        reaction: 'Hives, Difficulty Breathing',
        dateIdentified: new Date('2005-07-23')
      }
    ];
    await Allergy.insertMany(allergies);
    console.log('Added allergies');

    // Create chronic conditions
    const chronicConditions = [
      {
        patient: patientId,
        condition: 'Type 2 Diabetes',
        diagnosedDate: new Date('2024-11-18'),
        status: 'Controlled',
        treatingProvider: 'Dr. Sarah Johnson'
      },
      {
        patient: patientId,
        condition: 'Hypertension',
        diagnosedDate: new Date('2023-08-05'),
        status: 'Controlled',
        treatingProvider: 'Dr. Michael Chen'
      }
    ];
    await ChronicCondition.insertMany(chronicConditions);
    console.log('Added chronic conditions');

    // Create medications
    const medications = [
      {
        patient: patientId,
        name: 'Metformin',
        dosage: '500mg',
        frequency: 'Twice daily',
        startDate: new Date('2024-11-18'),
        prescribedBy: 'Dr. Sarah Johnson',
        purpose: 'Diabetes management',
        adherence: 85,
        refillDate: new Date('2025-05-15')
      },
      {
        patient: patientId,
        name: 'Lisinopril',
        dosage: '10mg',
        frequency: 'Once daily',
        startDate: new Date('2023-08-05'),
        prescribedBy: 'Dr. Michael Chen',
        purpose: 'Hypertension management',
        adherence: 92,
        refillDate: new Date('2025-05-20')
      },
      {
        patient: patientId,
        name: 'Atorvastatin',
        dosage: '20mg',
        frequency: 'Once daily',
        startDate: new Date('2024-01-15'),
        prescribedBy: 'Dr. Sarah Johnson',
        purpose: 'Cholesterol management',
        adherence: 90,
        refillDate: new Date('2025-05-10')
      }
    ];
    await Medication.insertMany(medications);
    console.log('Added medications');

    // Create lab results
    const labResults = [
      {
        patient: patientId,
        testName: 'HbA1c',
        date: new Date('2025-04-01'),
        result: 7.2,
        unit: '%',
        normalRange: '4.0-5.6',
        isAbnormal: true,
        orderedBy: 'Dr. Sarah Johnson',
        notes: 'Improved from previous result of 7.8%'
      },
      {
        patient: patientId,
        testName: 'Blood Glucose (Fasting)',
        date: new Date('2025-04-01'),
        result: 132,
        unit: 'mg/dL',
        normalRange: '70-99',
        isAbnormal: true,
        orderedBy: 'Dr. Sarah Johnson',
        notes: ''
      },
      {
        patient: patientId,
        testName: 'Cholesterol (Total)',
        date: new Date('2025-04-01'),
        result: 185,
        unit: 'mg/dL',
        normalRange: '<200',
        isAbnormal: false,
        orderedBy: 'Dr. Sarah Johnson',
        notes: ''
      },
      {
        patient: patientId,
        testName: 'LDL Cholesterol',
        date: new Date('2025-04-01'),
        result: 110,
        unit: 'mg/dL',
        normalRange: '<100',
        isAbnormal: true,
        orderedBy: 'Dr. Sarah Johnson',
        notes: ''
      },
      {
        patient: patientId,
        testName: 'HDL Cholesterol',
        date: new Date('2025-04-01'),
        result: 52,
        unit: 'mg/dL',
        normalRange: '>40',
        isAbnormal: false,
        orderedBy: 'Dr. Sarah Johnson',
        notes: ''
      },
      {
        patient: patientId,
        testName: 'Blood Pressure',
        date: new Date('2025-04-01'),
        result: '124/78',
        unit: 'mmHg',
        normalRange: '<120/80',
        isAbnormal: false,
        orderedBy: 'Dr. Michael Chen',
        notes: 'Well controlled with current medication'
      }
    ];
    await LabResult.insertMany(labResults);
    console.log('Added lab results');

    // Create imaging reports
    const imagingReports = [
      {
        patient: patientId,
        type: 'Chest X-ray',
        date: new Date('2025-03-15'),
        orderedBy: 'Dr. Michael Chen',
        facility: 'Wellness City Imaging Center',
        findings: 'No abnormalities detected. Lungs clear.',
        imageUrl: 'https://example.com/images/xray123.jpg',
        report: 'https://example.com/reports/xray123.pdf'
      },
      {
        patient: patientId,
        type: 'Abdominal Ultrasound',
        date: new Date('2024-09-22'),
        orderedBy: 'Dr. Sarah Johnson',
        facility: 'Wellness City Imaging Center',
        findings: 'Mild fatty liver. No other abnormalities.',
        imageUrl: 'https://example.com/images/ultrasound456.jpg',
        report: 'https://example.com/reports/ultrasound456.pdf'
      }
    ];
    await ImagingReport.insertMany(imagingReports);
    console.log('Added imaging reports');

    // Create vital records
    // Blood pressure records
    const bpRecords = [];
    const dates = ['2025-04-01', '2025-03-01', '2025-02-01', '2025-01-01', '2024-12-01', '2024-11-01'];
    const systolicValues = [124, 126, 128, 130, 132, 134];
    const diastolicValues = [78, 80, 82, 84, 86, 88];
    
    for (let i = 0; i < dates.length; i++) {
      bpRecords.push({
        patient: patientId,
        vitalType: 'bloodPressure',
        date: new Date(dates[i]),
        systolic: systolicValues[i],
        diastolic: diastolicValues[i],
        unit: 'mmHg',
        recordedBy: 'Dr. Michael Chen'
      });
    }
    await VitalRecord.insertMany(bpRecords);
    
    // Blood sugar records
    const bsRecords = [];
    const bsValues = [112, 118, 121, 125, 128, 135];
    
    for (let i = 0; i < dates.length; i++) {
      bsRecords.push({
        patient: patientId,
        vitalType: 'bloodSugar',
        date: new Date(dates[i]),
        value: bsValues[i],
        unit: 'mg/dL',
        recordedBy: 'Dr. Sarah Johnson'
      });
    }
    await VitalRecord.insertMany(bsRecords);
    
    // Heart rate records
    const hrRecords = [];
    const hrValues = [72, 75, 74, 78, 76, 80];
    
    for (let i = 0; i < dates.length; i++) {
      hrRecords.push({
        patient: patientId,
        vitalType: 'heartRate',
        date: new Date(dates[i]),
        value: hrValues[i],
        unit: 'bpm',
        recordedBy: 'Dr. Michael Chen'
      });
    }
    await VitalRecord.insertMany(hrRecords);
    
    // Weight records
    const weightRecords = [];
    const weightValues = [165, 167, 168, 170, 172, 175];
    
    for (let i = 0; i < dates.length; i++) {
      weightRecords.push({
        patient: patientId,
        vitalType: 'weight',
        date: new Date(dates[i]),
        value: weightValues[i],
        unit: 'lbs',
        recordedBy: 'Dr. Sarah Johnson'
      });
    }
    await VitalRecord.insertMany(weightRecords);
    
    // Cholesterol records
    const cholesterolRecords = [];
    const cholesterolDates = ['2025-04-01', '2024-10-01', '2024-04-01', '2023-10-01', '2023-04-01'];
    const cholesterolValues = [185, 190, 195, 210, 225];
    
    for (let i = 0; i < cholesterolDates.length; i++) {
      cholesterolRecords.push({
        patient: patientId,
        vitalType: 'cholesterol',
        date: new Date(cholesterolDates[i]),
        value: cholesterolValues[i],
        unit: 'mg/dL',
        recordedBy: 'Dr. Sarah Johnson'
      });
    }
    await VitalRecord.insertMany(cholesterolRecords);
    console.log('Added vital records');

    // Create immunizations
    const immunizations = [
      {
        patient: patientId,
        vaccine: 'Influenza (Flu)',
        date: new Date('2024-10-15'),
        administrator: 'Dr. Michael Chen',
        facility: 'Wellness City Medical Center',
        lotNumber: 'FL789456',
        nextDueDate: new Date('2025-10-15')
      },
      {
        patient: patientId,
        vaccine: 'COVID-19 (Booster)',
        date: new Date('2024-09-01'),
        administrator: 'Dr. Sarah Johnson',
        facility: 'Wellness City Medical Center',
        lotNumber: 'CV456789',
        nextDueDate: null
      },
      {
        patient: patientId,
        vaccine: 'Tetanus, Diphtheria, Pertussis (Tdap)',
        date: new Date('2020-05-20'),
        administrator: 'Dr. James Wilson',
        facility: 'Wellness City Medical Center',
        lotNumber: 'TD123456',
        nextDueDate: new Date('2030-05-20')
      }
    ];
    await Immunization.insertMany(immunizations);
    console.log('Added immunizations');

    // Create treatment plans
    const treatmentPlans = [
      {
        patient: patientId,
        condition: 'Type 2 Diabetes',
        provider: 'Dr. Sarah Johnson',
        createdDate: new Date('2024-11-18'),
        lastUpdated: new Date('2025-04-01'),
        goals: [
          { 
            description: 'Reduce HbA1c below 7.0%', 
            status: 'In Progress',
            targetDate: '2025-07-01'
          },
          { 
            description: 'Daily blood glucose monitoring', 
            status: 'Active',
            targetDate: 'Ongoing'
          },
          { 
            description: 'Weight loss of 10 pounds', 
            status: 'Completed',
            targetDate: '2025-03-01'
          }
        ],
        medications: ['Metformin 500mg twice daily'],
        dietaryRecommendations: 'Low carbohydrate diet, limit sugar intake, increase fiber',
        activityRecommendations: '30 minutes of moderate exercise 5 days per week',
        notes: 'Patient has been compliant with medication and exercise regimen. Dietary compliance still needs improvement.'
      },
      {
        patient: patientId,
        condition: 'Hypertension',
        provider: 'Dr. Michael Chen',
        createdDate: new Date('2023-08-05'),
        lastUpdated: new Date('2025-04-01'),
        goals: [
          { 
            description: 'Maintain BP below 130/80 mmHg', 
            status: 'Active',
            targetDate: 'Ongoing'
          },
          { 
            description: 'Reduce sodium intake', 
            status: 'Active',
            targetDate: 'Ongoing'
          }
        ],
        medications: ['Lisinopril 10mg once daily'],
        dietaryRecommendations: 'Reduce sodium intake to less than 2,300 mg per day. DASH diet recommended.',
        activityRecommendations: 'Regular aerobic exercise, minimum 150 minutes per week',
        notes: 'Blood pressure well controlled with current medication and lifestyle modifications.'
      }
    ];
    await TreatmentPlan.insertMany(treatmentPlans);
    console.log('Added treatment plans');

    console.log('Database seeded successfully!');
  } catch (err) {
    console.error('Error seeding database:', err);
  } finally {
    // Disconnect from database
    mongoose.disconnect();
  }
};

// Run the seeding function
seedHealthRecords();