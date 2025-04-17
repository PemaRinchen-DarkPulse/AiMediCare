const User = require('../models/User');
const Doctor = require('../models/Doctor');

// Get all doctors with pagination, filtering, and sorting
exports.getDoctors = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      specialty, 
      location,
      availability,
      consultationType,
      search
    } = req.query;
    
    console.log('Fetching doctors with filters:', { specialty, location, consultationType });
    
    // Build filter object for User model
    const userFilter = { role: 'doctor' };
    
    if (location && location !== 'all') {
      userFilter.location = location;
    }
    
    if (consultationType && consultationType !== 'all') {
      userFilter.consultationTypes = consultationType;
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Find doctors with the applied filters
    let doctors = await User.find(userFilter)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-password -verificationToken -verificationTokenExpires -resetPasswordToken -resetPasswordExpires');
    
    console.log(`Found ${doctors.length} doctors`);
    
    // Get doctor-specific information from Doctor model
    const doctorIds = doctors.map(doctor => doctor._id);
    
    // Build filter for Doctor model
    let doctorFilter = { user: { $in: doctorIds } };
    if (specialty && specialty !== 'all') {
      doctorFilter.specialty = specialty;
    }
    
    const doctorProfiles = await Doctor.find(doctorFilter);
    
    // Create a map for easy lookup
    const doctorProfileMap = {};
    doctorProfiles.forEach(profile => {
      doctorProfileMap[profile.user.toString()] = profile;
    });
    
    // Format the response
    const formattedDoctors = await Promise.all(doctors.map(async (doctor) => {
      // Convert availableDates for frontend
      const availableDates = doctor.availability ? doctor.availability.map(av => av.date) : [];
      
      // Get the doctor profile data
      const doctorProfile = doctorProfileMap[doctor._id.toString()] || {};
      
      // Check education data source based on where it exists
      const education = doctorProfile.education || [];
      
      return {
        id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        phoneNumber: doctor.phoneNumber,
        // Address information
        address: doctor.address || {},
        // Doctor specific info
        specialty: doctorProfile.specialty || '',
        location: doctor.location || doctorProfile?.practiceLocation || (doctorProfile?.clinicDetails?.name) || '',
        profileImage: doctor.profileImage || '',
        image: doctor.profileImage || '', // For frontend compatibility
        rating: doctorProfile.rating || 0,
        totalRatings: doctorProfile.totalRatings || 0,
        languages: doctor.languages || [],
        acceptedInsurance: doctor.acceptedInsurance || [],
        availableDates: availableDates,
        consultationTypes: doctor.consultationTypes || [],
        bio: doctor.bio || '',
        education: education,
        yearsExperience: doctorProfile.experience || doctorProfile.yearsExperience || 0,
        medicalLicenseNumber: doctorProfile.medicalLicenseNumber,
        licenseExpiryDate: doctorProfile.licenseExpiryDate,
        issuingAuthority: doctorProfile.issuingAuthority,
        consultationFee: doctorProfile.consultationFee,
        // Clinic details
        clinicDetails: doctorProfile?.clinicDetails || {
          name: '',
          phone: '',
          website: '',
          address: {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: ''
          }
        },
        // Hospital affiliations
        hospitalAffiliations: doctorProfile?.hospitalAffiliations || []
      };
    }));
    
    // Filter doctors who don't have a specialty if specialty filter is applied
    let filteredDoctors = formattedDoctors;
    if (specialty && specialty !== 'all') {
      filteredDoctors = formattedDoctors.filter(doctor => doctor.specialty === specialty);
    }
    
    // Count total eligible doctors for pagination
    const totalDoctors = filteredDoctors.length > 0 ? 
      await User.countDocuments(userFilter) : 0;
    
    res.status(200).json({
      status: 'success',
      results: filteredDoctors.length,
      totalPages: Math.ceil(totalDoctors / parseInt(limit)),
      currentPage: parseInt(page),
      data: {
        doctors: filteredDoctors
      }
    });
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch doctors'
    });
  }
};

// Get a single doctor by ID
exports.getDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    
    const doctor = await User.findById(id)
      .select('-password -verificationToken -verificationTokenExpires -resetPasswordToken -resetPasswordExpires');
    
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({
        status: 'error',
        message: 'Doctor not found'
      });
    }
    
    // Get doctor-specific information from Doctor model
    const doctorProfile = await Doctor.findOne({ user: id });
    
    // Format doctor data
    const formattedDoctor = {
      id: doctor._id,
      name: doctor.name,
      email: doctor.email,
      phoneNumber: doctor.phoneNumber,
      // Address information
      address: doctor.address || {},
      // Doctor specific info
      specialty: doctorProfile?.specialty || '',
      location: doctor.location || (doctorProfile?.practiceLocation) || (doctorProfile?.clinicDetails?.name) || '',
      profileImage: doctor.profileImage || '',
      image: doctor.profileImage || '', // For frontend compatibility
      rating: doctorProfile?.rating || 0,
      totalRatings: doctorProfile?.totalRatings || 0,
      languages: doctor.languages || [],
      acceptedInsurance: doctor.acceptedInsurance || [],
      availability: doctor.availability || [],
      consultationTypes: doctor.consultationTypes || [],
      bio: doctor.bio || '',
      education: doctorProfile?.education || [],
      yearsExperience: doctorProfile?.experience || doctorProfile?.yearsExperience || 0,
      medicalLicenseNumber: doctorProfile?.medicalLicenseNumber || '',
      licenseExpiryDate: doctorProfile?.licenseExpiryDate || null,
      issuingAuthority: doctorProfile?.issuingAuthority || '',
      hospitalAffiliation: doctorProfile?.hospitalAffiliation || '',
      consultationFee: doctorProfile?.consultationFee || 0,
      // Clinic details
      clinicDetails: doctorProfile?.clinicDetails || {
        name: '',
        phone: '',
        website: '',
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: ''
        }
      },
      // Hospital affiliations
      hospitalAffiliations: doctorProfile?.hospitalAffiliations || []
    };
    
    res.status(200).json({
      status: 'success',
      data: {
        doctor: formattedDoctor
      }
    });
  } catch (error) {
    console.error('Error fetching doctor:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch doctor details'
    });
  }
};

// Get available time slots for a doctor on a specific date
exports.getDoctorAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({
        status: 'error',
        message: 'Date parameter is required'
      });
    }
    
    const doctor = await User.findById(id);
    
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({
        status: 'error',
        message: 'Doctor not found'
      });
    }
    
    // Find availability for the specified date
    const selectedDate = new Date(date);
    const availability = doctor.availability ? doctor.availability.find(
      a => new Date(a.date).toDateString() === selectedDate.toDateString()
    ) : null;
    
    // If no availability is found, return empty slots
    if (!availability) {
      return res.status(200).json({
        status: 'success',
        data: {
          date: selectedDate,
          slots: []
        }
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        date: availability.date,
        slots: availability.slots
      }
    });
  } catch (error) {
    console.error('Error fetching doctor availability:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch doctor availability'
    });
  }
};

// Create dummy doctors (for development/testing)
exports.createDummyDoctors = async (req, res) => {
  try {
    // Check if this is a development environment
    if (process.env.NODE_ENV !== 'development') {
      return res.status(403).json({
        status: 'error',
        message: 'This endpoint is only available in development environment'
      });
    }
    
    // Profile images for doctors
    const doctorImages = [
      'https://randomuser.me/api/portraits/women/68.jpg',
      'https://randomuser.me/api/portraits/men/32.jpg',
      'https://randomuser.me/api/portraits/women/45.jpg',
      'https://randomuser.me/api/portraits/men/55.jpg',
      'https://randomuser.me/api/portraits/women/28.jpg',
      'https://randomuser.me/api/portraits/men/42.jpg'
    ];
    
    // Create dummy doctor data
    const dummyDoctorsData = [
      {
        user: {
          name: 'Dr. Sarah Johnson',
          email: 'sarah.johnson@example.com',
          password: 'password123',
          role: 'doctor',
          isVerified: true,
          profileImage: doctorImages[0],
          bio: 'Board-certified physician with 15 years of experience in family medicine.',
          languages: ['English', 'Spanish'],
          acceptedInsurance: ['Blue Cross', 'Aetna', 'Medicare'],
          consultationTypes: ['In-Person Visit', 'Video Call'],
          availability: generateAvailability(),
          address: {
            street: '123 Medical Way',
            city: 'Boston',
            state: 'MA',
            zipCode: '02114',
            country: 'USA'
          }
        },
        doctor: {
          medicalLicenseNumber: 'ML12345678',
          licenseExpiryDate: new Date('2026-12-31'),
          issuingAuthority: 'State Medical Board',
          specialty: 'Primary Care',
          experience: 15,
          rating: 4.8,
          totalRatings: 128,
          hospitalName: 'City General Hospital',
          clinicDetails: {
            name: 'Downtown Medical Center',
            phone: '(617) 555-1234',
            website: 'www.downtownmedical.com',
            address: {
              street: '456 Healthcare Blvd',
              city: 'Boston',
              state: 'MA',
              zipCode: '02115',
              country: 'USA'
            }
          },
          hospitalAffiliations: [{
            hospitalName: 'City General Hospital',
            role: 'Attending Physician',
            startYear: 2010,
            current: true
          }],
          consultationFee: 150
        }
      },
      {
        user: {
          name: 'Dr. Michael Chen',
          email: 'michael.chen@example.com',
          password: 'password123',
          role: 'doctor',
          isVerified: true,
          profileImage: doctorImages[1],
          bio: 'Specialist in cardiovascular health with focus on preventive care.',
          languages: ['English', 'Mandarin'],
          acceptedInsurance: ['Blue Cross', 'UnitedHealth', 'Cigna'],
          consultationTypes: ['In-Person Visit', 'Phone Call'],
          availability: generateAvailability(),
          address: {
            street: '789 Cardio Lane',
            city: 'Chicago',
            state: 'IL',
            zipCode: '60601',
            country: 'USA'
          }
        },
        doctor: {
          medicalLicenseNumber: 'ML87654321',
          licenseExpiryDate: new Date('2027-06-30'),
          issuingAuthority: 'State Medical Board',
          specialty: 'Cardiology',
          experience: 12,
          rating: 4.9,
          totalRatings: 215,
          hospitalName: 'University Medical Center',
          clinicDetails: {
            name: 'Heart & Vascular Institute',
            phone: '(312) 555-2468',
            website: 'www.heartinstitute.org',
            address: {
              street: '101 Cardiac Avenue',
              city: 'Chicago',
              state: 'IL',
              zipCode: '60602',
              country: 'USA'
            }
          },
          hospitalAffiliations: [{
            hospitalName: 'University Medical Center',
            role: 'Cardiologist',
            startYear: 2015,
            current: true
          }],
          consultationFee: 200
        }
      },
      {
        user: {
          name: 'Dr. Amina Patel',
          email: 'amina.patel@example.com',
          password: 'password123',
          role: 'doctor',
          isVerified: true,
          profileImage: doctorImages[2],
          bio: 'Expert in treating various skin conditions with the latest techniques.',
          languages: ['English', 'Hindi', 'Gujarati'],
          acceptedInsurance: ['Aetna', 'Medicare', 'Humana'],
          consultationTypes: ['Video Call', 'In-Person Visit'],
          availability: generateAvailability(),
          address: {
            street: '234 Dermatology Drive',
            city: 'San Francisco',
            state: 'CA',
            zipCode: '94105',
            country: 'USA'
          }
        },
        doctor: {
          medicalLicenseNumber: 'ML55667788',
          licenseExpiryDate: new Date('2027-03-15'),
          issuingAuthority: 'State Medical Board',
          specialty: 'Dermatology',
          experience: 8,
          rating: 4.7,
          totalRatings: 97,
          hospitalName: 'Memorial Hospital',
          clinicDetails: {
            name: 'Skin Health Clinic',
            phone: '(415) 555-9876',
            website: 'www.skinhealthclinic.com',
            address: {
              street: '567 Skincare Street',
              city: 'San Francisco',
              state: 'CA',
              zipCode: '94107',
              country: 'USA'
            }
          },
          hospitalAffiliations: [{
            hospitalName: 'Memorial Hospital',
            role: 'Associate Dermatologist',
            startYear: 2018,
            current: true
          }],
          consultationFee: 175
        }
      },
      {
        user: {
          name: 'Dr. James Wilson',
          email: 'james.wilson@example.com',
          password: 'password123',
          role: 'doctor',
          isVerified: true,
          profileImage: doctorImages[3],
          bio: 'Specializing in anxiety, depression, and stress management.',
          languages: ['English'],
          acceptedInsurance: ['Blue Cross', 'UnitedHealth', 'Medicare'],
          consultationTypes: ['Video Call', 'Phone Call'],
          availability: generateAvailability(),
          address: {
            street: '890 Mental Health Road',
            city: 'New York',
            state: 'NY',
            zipCode: '10016',
            country: 'USA'
          }
        },
        doctor: {
          medicalLicenseNumber: 'ML99887766',
          licenseExpiryDate: new Date('2026-09-20'),
          issuingAuthority: 'State Medical Board',
          specialty: 'Psychiatry',
          experience: 10,
          rating: 4.6,
          totalRatings: 86,
          hospitalName: 'Central Psychiatric Institute',
          clinicDetails: {
            name: 'Behavioral Health Center',
            phone: '(212) 555-5678',
            website: 'www.behavioralhealthcenter.com',
            address: {
              street: '345 Wellness Way',
              city: 'New York',
              state: 'NY',
              zipCode: '10017',
              country: 'USA'
            }
          },
          hospitalAffiliations: [{
            hospitalName: 'Central Psychiatric Institute',
            role: 'Staff Psychiatrist',
            startYear: 2016,
            current: true
          }],
          consultationFee: 190
        }
      },
      {
        user: {
          name: 'Dr. Elena Rodriguez',
          email: 'elena.rodriguez@example.com',
          password: 'password123',
          role: 'doctor',
          isVerified: true,
          profileImage: doctorImages[4],
          bio: 'Neurologist specializing in headache disorders and neurological conditions.',
          languages: ['English', 'Spanish'],
          acceptedInsurance: ['Blue Cross', 'Medicare', 'Cigna'],
          consultationTypes: ['In-Person Visit'],
          availability: generateAvailability(),
          address: {
            street: '567 Brain Avenue',
            city: 'Los Angeles',
            state: 'CA',
            zipCode: '90024',
            country: 'USA'
          }
        },
        doctor: {
          medicalLicenseNumber: 'ML44332211',
          licenseExpiryDate: new Date('2027-01-10'),
          issuingAuthority: 'State Medical Board',
          specialty: 'Neurology',
          experience: 14,
          rating: 4.9,
          totalRatings: 157,
          hospitalName: 'Neuroscience Medical Center',
          clinicDetails: {
            name: 'Neuroscience Institute',
            phone: '(310) 555-7890',
            website: 'www.neuroinstitute.org',
            address: {
              street: '789 Neural Drive',
              city: 'Los Angeles',
              state: 'CA',
              zipCode: '90025',
              country: 'USA'
            }
          },
          hospitalAffiliations: [{
            hospitalName: 'Neuroscience Medical Center',
            role: 'Head of Neurology',
            startYear: 2012,
            current: true
          }],
          consultationFee: 225
        }
      },
      {
        user: {
          name: 'Dr. Robert Kim',
          email: 'robert.kim@example.com',
          password: 'password123',
          role: 'doctor',
          isVerified: true,
          profileImage: doctorImages[5],
          bio: 'Orthopedic surgeon with expertise in sports medicine and joint replacement.',
          languages: ['English', 'Korean'],
          acceptedInsurance: ['Aetna', 'UnitedHealth', 'Blue Cross'],
          consultationTypes: ['In-Person Visit', 'Video Call'],
          availability: generateAvailability(),
          address: {
            street: '123 Joint Street',
            city: 'Seattle',
            state: 'WA',
            zipCode: '98101',
            country: 'USA'
          }
        },
        doctor: {
          medicalLicenseNumber: 'ML11335577',
          licenseExpiryDate: new Date('2026-11-25'),
          issuingAuthority: 'State Medical Board',
          specialty: 'Orthopedics',
          experience: 16,
          rating: 4.8,
          totalRatings: 143,
          hospitalName: 'Sports Medicine Institute',
          clinicDetails: {
            name: 'Sports Medicine & Joint Center',
            phone: '(206) 555-4321',
            website: 'www.sportsmedicinecenter.com',
            address: {
              street: '456 Orthopedic Boulevard',
              city: 'Seattle',
              state: 'WA',
              zipCode: '98102',
              country: 'USA'
            }
          },
          hospitalAffiliations: [{
            hospitalName: 'Sports Medicine Institute',
            role: 'Chief of Orthopedic Surgery',
            startYear: 2014,
            current: true
          }],
          consultationFee: 210
        }
      }
    ];
    
    const createdDoctors = [];
    for (const dummyDoctor of dummyDoctorsData) {
      try {
        // Check if user already exists
        let user = await User.findOne({ email: dummyDoctor.user.email });
        
        if (user) {
          // Update user information if it exists
          user.name = dummyDoctor.user.name;
          user.bio = dummyDoctor.user.bio;
          user.languages = dummyDoctor.user.languages;
          user.acceptedInsurance = dummyDoctor.user.acceptedInsurance;
          user.consultationTypes = dummyDoctor.user.consultationTypes;
          user.availability = dummyDoctor.user.availability;
          user.address = dummyDoctor.user.address;
          
          // Update profile image if it doesn't exist
          if (!user.profileImage) {
            user.profileImage = dummyDoctor.user.profileImage;
          }
          
          await user.save();
        } else {
          // Create new user
          user = new User(dummyDoctor.user);
          await user.save();
        }
        
        // Now handle doctor profile data
        let doctorProfile = await Doctor.findOne({ user: user._id });
        
        if (doctorProfile) {
          // Update doctor profile if it exists
          doctorProfile.medicalLicenseNumber = dummyDoctor.doctor.medicalLicenseNumber;
          doctorProfile.licenseExpiryDate = dummyDoctor.doctor.licenseExpiryDate;
          doctorProfile.issuingAuthority = dummyDoctor.doctor.issuingAuthority;
          doctorProfile.specialty = dummyDoctor.doctor.specialty;
          doctorProfile.experience = dummyDoctor.doctor.experience;
          doctorProfile.rating = dummyDoctor.doctor.rating;
          doctorProfile.totalRatings = dummyDoctor.doctor.totalRatings;
          doctorProfile.hospitalName = dummyDoctor.doctor.hospitalName;
          doctorProfile.clinicDetails = dummyDoctor.doctor.clinicDetails;
          doctorProfile.hospitalAffiliations = dummyDoctor.doctor.hospitalAffiliations;
          doctorProfile.consultationFee = dummyDoctor.doctor.consultationFee;
          
          await doctorProfile.save();
        } else {
          // Create new doctor profile
          doctorProfile = new Doctor({
            user: user._id,
            ...dummyDoctor.doctor
          });
          await doctorProfile.save();
        }
        
        // Add doctor to result array
        createdDoctors.push({
          id: user._id,
          name: user.name,
          email: user.email,
          specialty: doctorProfile.specialty,
          clinicName: doctorProfile.clinicDetails?.name || '',
          hospitalName: doctorProfile.hospitalName || ''
        });
      } catch (err) {
        console.error(`Error creating dummy doctor ${dummyDoctor.user.name}:`, err);
      }
    }
    
    res.status(201).json({
      status: 'success',
      message: 'Dummy doctors created successfully',
      data: {
        count: createdDoctors.length,
        doctors: createdDoctors
      }
    });
  } catch (error) {
    console.error('Error creating dummy doctors:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create dummy doctors'
    });
  }
};

// Helper function to generate random availability for the next 14 days
function generateAvailability() {
  const availability = [];
  const today = new Date();
  
  for (let i = 0; i < 14; i++) {
    // Skip random days to create realistic availability
    if (Math.random() > 0.6) continue;
    
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    
    // Generate time slots
    const slots = [];
    for (let hour = 9; hour < 17; hour++) {
      for (let minute of [0, 30]) {
        // Randomly determine if slot is available
        if (Math.random() > 0.3) {
          const startTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          const endHour = minute === 30 ? hour + 1 : hour;
          const endMinute = minute === 30 ? 0 : 30;
          const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
          
          slots.push({
            startTime,
            endTime,
            isBooked: Math.random() > 0.8 // Some slots are already booked
          });
        }
      }
    }
    
    availability.push({
      date,
      slots
    });
  }
  
  return availability;
}