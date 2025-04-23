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
    
    // Find the doctor in User model
    const doctor = await User.findOne({ _id: id, role: 'doctor' })
      .select('-password -verificationToken -verificationTokenExpires -resetPasswordToken -resetPasswordExpires');
    
    if (!doctor) {
      return res.status(404).json({
        status: 'error',
        message: 'Doctor not found'
      });
    }
    
    // Get doctor-specific information from Doctor model
    const doctorProfile = await Doctor.findOne({ user: id });
    
    // Format the response similar to getDoctors
    const availableDates = doctor.availability ? doctor.availability.map(av => av.date) : [];
    const education = doctorProfile?.education || [];
    
    const formattedDoctor = {
      id: doctor._id,
      name: doctor.name,
      email: doctor.email,
      phoneNumber: doctor.phoneNumber,
      // Address information
      address: doctor.address || {},
      // Doctor specific info
      specialty: doctorProfile?.specialty || '',
      location: doctor.location || doctorProfile?.practiceLocation || (doctorProfile?.clinicDetails?.name) || '',
      profileImage: doctor.profileImage || '',
      image: doctor.profileImage || '', // For frontend compatibility
      rating: doctorProfile?.rating || 0,
      totalRatings: doctorProfile?.totalRatings || 0,
      languages: doctor.languages || [],
      acceptedInsurance: doctor.acceptedInsurance || [],
      availableDates: availableDates,
      consultationTypes: doctor.consultationTypes || [],
      bio: doctor.bio || '',
      education: education,
      yearsExperience: doctorProfile?.experience || doctorProfile?.yearsExperience || 0,
      medicalLicenseNumber: doctorProfile?.medicalLicenseNumber,
      licenseExpiryDate: doctorProfile?.licenseExpiryDate,
      issuingAuthority: doctorProfile?.issuingAuthority,
      consultationFee: doctorProfile?.consultationFee,
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