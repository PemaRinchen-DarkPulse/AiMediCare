const Appointment = require('../models/Appointment');
const User = require('../models/User');

// Get all appointments for a patient
exports.getPatientAppointments = async (req, res) => {
  try {
    const patientId = req.user._id;
    
    // Find all appointments for this patient
    const appointments = await Appointment.find({ patientId })
      .sort({ date: 1 }) // Sorting by date ascending
      .populate('doctorId', 'name email profileImage specialty location');
    
    // Format appointments for frontend
    const formattedAppointments = appointments.map(appointment => {
      const doctor = appointment.doctorId;
      
      return {
        id: appointment._id,
        providerId: doctor._id,
        providerName: doctor.name,
        providerImage: doctor.profileImage || '',
        specialty: doctor.specialty || '',
        date: appointment.date,
        time: appointment.time,
        type: appointment.type,
        reason: appointment.reason,
        status: appointment.status,
        notes: appointment.notes,
        location: appointment.location || doctor.location || '',
        room: appointment.room,
        createdAt: appointment.createdAt
      };
    });
    
    const now = new Date();
    
    // Only include appointments with status 'confirmed' in upcoming appointments
    const upcomingAppointments = formattedAppointments.filter(
      appointment => new Date(appointment.date) >= now && 
                     appointment.status === 'confirmed'
    );
    
    const pastAppointments = formattedAppointments.filter(
      appointment => new Date(appointment.date) < now || 
                     appointment.status === 'completed'
    );
    
    // Add tracking appointments (pending, doctor_accepted, or declined)
    const trackingAppointments = formattedAppointments.filter(
      appointment => appointment.status === 'pending' || 
                     appointment.status === 'doctor_accepted' ||
                     appointment.status === 'declined'
    );
    
    res.status(200).json({
      status: 'success',
      data: {
        upcomingAppointments,
        pastAppointments,
        trackingAppointments
      }
    });
  } catch (error) {
    console.error('Error fetching patient appointments:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch appointments'
    });
  }
};

// Create a new appointment
exports.createAppointment = async (req, res) => {
  try {
    const { doctorId, date, time, type, reason, additionalNotes } = req.body;
    const patientId = req.user._id;
    
    // Verify the doctor exists and has role 'doctor'
    const doctor = await User.findOne({ _id: doctorId, role: 'doctor' });
    if (!doctor) {
      return res.status(404).json({
        status: 'error',
        message: 'Doctor not found'
      });
    }
    
    // Create new appointment
    const newAppointment = new Appointment({
      patientId,
      doctorId,
      date,
      time,
      type,
      reason,
      notes: additionalNotes, // Save additional notes to the notes field
      location: doctor.location // Add doctor's location from User model
    });
    
    await newAppointment.save();
    
    res.status(201).json({
      status: 'success',
      message: 'Appointment requested successfully',
      data: {
        appointment: newAppointment
      }
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create appointment'
    });
  }
};

// Update an appointment
exports.updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const patientId = req.user._id;
    
    // Find appointment and check if it belongs to this patient
    const appointment = await Appointment.findOne({
      _id: id,
      patientId
    });
    
    if (!appointment) {
      return res.status(404).json({
        status: 'error',
        message: 'Appointment not found or not authorized'
      });
    }
    
    // Update appointment
    appointment.status = status || appointment.status;
    appointment.notes = notes || appointment.notes;
    
    await appointment.save();
    
    res.status(200).json({
      status: 'success',
      message: 'Appointment updated successfully',
      data: {
        appointment
      }
    });
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update appointment'
    });
  }
};

// Doctor accepts or declines an appointment
exports.doctorRespondToAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, notes } = req.body;
    const doctorId = req.user._id;
    
    if (!['accept', 'decline'].includes(action)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid action. Must be "accept" or "decline"'
      });
    }
    
    // Find appointment and check if it belongs to this doctor
    const appointment = await Appointment.findOne({
      _id: id,
      doctorId,
      status: 'pending' // Only pending appointments can be acted upon
    });
    
    if (!appointment) {
      return res.status(404).json({
        status: 'error',
        message: 'Appointment not found, not authorized, or already processed'
      });
    }
    
    // Update appointment status based on doctor's action
    appointment.status = action === 'accept' ? 'doctor_accepted' : 'declined';
    if (notes) {
      appointment.notes = notes;
    }
    
    await appointment.save();
    
    res.status(200).json({
      status: 'success',
      message: `Appointment ${action === 'accept' ? 'accepted' : 'declined'} successfully`,
      data: {
        appointment
      }
    });
  } catch (error) {
    console.error('Error responding to appointment:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to respond to appointment'
    });
  }
};

// Patient confirms an appointment
exports.patientConfirmAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const patientId = req.user._id;
    
    // Find appointment and check if it belongs to this patient and has been accepted by doctor
    const appointment = await Appointment.findOne({
      _id: id,
      patientId,
      status: 'doctor_accepted' // Only doctor_accepted appointments can be confirmed
    });
    
    if (!appointment) {
      return res.status(404).json({
        status: 'error',
        message: 'Appointment not found, not authorized, or not ready for confirmation'
      });
    }
    
    // Update appointment status to confirmed
    appointment.status = 'confirmed';
    
    await appointment.save();
    
    res.status(200).json({
      status: 'success',
      message: 'Appointment confirmed successfully',
      data: {
        appointment
      }
    });
  } catch (error) {
    console.error('Error confirming appointment:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to confirm appointment'
    });
  }
};

// Get appointments for a doctor that require action
exports.getDoctorAppointments = async (req, res) => {
  try {
    const doctorId = req.user._id;
    
    // Find all appointments for this doctor
    const appointments = await Appointment.find({ doctorId })
      .sort({ date: 1 }) // Sorting by date ascending
      .populate('patientId', 'name email profileImage');
    
    // Format appointments for frontend
    const formattedAppointments = appointments.map(appointment => {
      const patient = appointment.patientId;
      
      return {
        id: appointment._id,
        patientId: patient._id,
        patientName: patient.name,
        patientImage: patient.profileImage || '',
        date: appointment.date,
        time: appointment.time,
        type: appointment.type,
        reason: appointment.reason,
        status: appointment.status,
        notes: appointment.notes,
        clinicalNotes: appointment.clinicalNotes || '', // Return clinical notes as plain text
        location: appointment.location,
        room: appointment.room,
        createdAt: appointment.createdAt
      };
    });
    
    // Separate appointments based on their status
    const pendingAppointments = formattedAppointments.filter(
      appointment => appointment.status === 'pending'
    );
    
    const acceptedAppointments = formattedAppointments.filter(
      appointment => appointment.status === 'doctor_accepted'
    );
    
    const confirmedAppointments = formattedAppointments.filter(
      appointment => appointment.status === 'confirmed'
    );
    
    const pastAppointments = formattedAppointments.filter(
      appointment => appointment.status === 'completed' || 
                     appointment.status === 'cancelled' ||
                     appointment.status === 'no_show'
    );
    
    const declinedAppointments = formattedAppointments.filter(
      appointment => appointment.status === 'declined'
    );
    
    res.status(200).json({
      status: 'success',
      data: {
        pendingAppointments,
        acceptedAppointments,
        confirmedAppointments,
        pastAppointments,
        declinedAppointments
      }
    });
  } catch (error) {
    console.error('Error fetching doctor appointments:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch appointments'
    });
  }
};

// Create dummy appointments for testing
exports.createDummyAppointments = async (req, res) => {
  try {
    // Check if this is a development environment
    if (process.env.NODE_ENV !== 'development') {
      return res.status(403).json({
        status: 'error',
        message: 'This endpoint is only available in development environment'
      });
    }
    
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        status: 'error',
        message: 'User ID is required'
      });
    }
    
    // Get user
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    // Get doctors - users with role 'doctor'
    const doctors = await User.find({ role: 'doctor' });
    
    if (doctors.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'No doctors found. Please run /api/doctors/seed first'
      });
    }
    
    // Current date
    const now = new Date();
    
    // Generate past appointments
    const pastAppointments = [];
    for (let i = 0; i < 3; i++) {
      const pastDate = new Date(now);
      pastDate.setDate(pastDate.getDate() - (i * 15 + 5)); // 5, 20, 35 days ago
      
      const doctor = doctors[i % doctors.length];
      
      pastAppointments.push({
        patientId: userId,
        doctorId: doctor._id,
        date: pastDate,
        time: `${10 + (i % 7)}:${i % 2 === 0 ? '00' : '30'} ${i % 2 === 0 ? 'AM' : 'PM'}`,
        type: ['In-Person Visit', 'Video Call', 'Phone Call'][i % 3],
        reason: ['Annual checkup', 'Skin rash consultation', 'Migraine evaluation', 'Heart palpitations', 'Anxiety management', 'Knee pain assessment'][i % 6],
        status: 'Completed',
        notes: ['Follow-up in 3 months. Continue with prescribed medication.', 'Recommended mindfulness exercises and adjusted medication dosage.', 'Prescribed physical therapy twice weekly for 6 weeks. Provided home exercise program.'][i % 3],
        location: doctor.location || ''
      });
    }
    
    // Generate upcoming appointments
    const upcomingAppointments = [];
    for (let i = 0; i < 3; i++) {
      const futureDate = new Date(now);
      futureDate.setDate(futureDate.getDate() + (i * 3 + 1)); // 1, 4, 7 days in future
      
      const doctor = doctors[(i + 3) % doctors.length];
      
      upcomingAppointments.push({
        patientId: userId,
        doctorId: doctor._id,
        date: futureDate,
        time: `${10 + (i % 7)}:${i % 2 === 0 ? '00' : '30'} ${i % 2 === 0 ? 'AM' : 'PM'}`,
        type: ['In-Person Visit', 'Video Call', 'Phone Call'][i % 3],
        reason: ['Annual checkup', 'Skin rash consultation', 'Migraine evaluation', 'Heart palpitations', 'Anxiety management', 'Knee pain assessment'][i % 6],
        status: i === 0 ? 'Pending' : 'Confirmed',
        location: doctor.location || ''
      });
    }
    
    // Save all appointments
    const allAppointments = [...pastAppointments, ...upcomingAppointments];
    
    // Check if user already has appointments
    const existingAppointments = await Appointment.find({ patientId: userId });
    
    // Only create new appointments if user doesn't have any
    if (existingAppointments.length > 0) {
      return res.status(200).json({
        status: 'success',
        message: 'User already has appointments',
        data: {
          count: existingAppointments.length,
          appointments: existingAppointments
        }
      });
    }
    
    const createdAppointments = await Appointment.insertMany(allAppointments);
    
    res.status(201).json({
      status: 'success',
      message: 'Dummy appointments created successfully',
      data: {
        count: createdAppointments.length,
        appointments: createdAppointments
      }
    });
  } catch (error) {
    console.error('Error creating dummy appointments:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create dummy appointments'
    });
  }
};

// Doctor updates an appointment (notes and status)
exports.doctorUpdateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const doctorId = req.user._id;
    
    // Find appointment and check if it belongs to this doctor
    const appointment = await Appointment.findOne({
      _id: id,
      doctorId
    });
    
    if (!appointment) {
      return res.status(404).json({
        status: 'error',
        message: 'Appointment not found or not authorized'
      });
    }
    
    // Update appointment
    if (status) appointment.status = status;
    if (notes) appointment.notes = notes;
    
    await appointment.save();
    
    res.status(200).json({
      status: 'success',
      message: 'Appointment updated successfully',
      data: {
        appointment
      }
    });
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update appointment'
    });
  }
};

// Complete an appointment and save clinical notes in a single request
exports.completeAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    const doctorId = req.user._id;
    
    // Find appointment and check if it belongs to this doctor
    const appointment = await Appointment.findOne({
      _id: id,
      doctorId,
      status: { $in: ['confirmed', 'doctor_accepted'] } // Only confirmed or accepted appointments can be completed
    });
    
    if (!appointment) {
      return res.status(404).json({
        status: 'error',
        message: 'Appointment not found, not authorized, or cannot be completed'
      });
    }
    
    // Update appointment with clinical notes as simple text
    appointment.status = 'completed';
    appointment.clinicalNotes = notes || ''; // Store clinical notes directly
    
    await appointment.save();
    
    res.status(200).json({
      status: 'success',
      message: 'Appointment completed successfully',
      data: {
        appointment
      }
    });
  } catch (error) {
    console.error('Error completing appointment:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to complete appointment'
    });
  }
};