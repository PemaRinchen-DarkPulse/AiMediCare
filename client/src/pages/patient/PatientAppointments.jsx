import React, { useState, useEffect, useMemo } from 'react';
import AppointmentCalendar from '../../components/patient/AppointmentCalendar';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Tabs, 
  Tab,
  Grid, 
  Card, 
  CardContent, 
  CardActions, 
  Button,
  Radio, 
  RadioGroup, 
  FormControlLabel, 
  TextField, 
  Checkbox,
  FormGroup,
  Chip,
  Snackbar,
  Alert,
  Avatar,
  Divider,
  useMediaQuery,
  Rating
} from '@mui/material';
import { ThemeProvider, createTheme, styled } from '@mui/material/styles';

// Create a theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#9c27b0',
    },
  },
});

// Utility function for date formatting
const formatDate = (date, formatStr) => {
  const options = {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  };
  
  return new Intl.DateTimeFormat('en-US', options).format(date);
};

// Simple date to string conversion for appointment creation
const dateToISOString = (date, timeString) => {
  const [hours, minutes] = timeString.split(':');
  const newDate = new Date(date);
  newDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0);
  return newDate;
};

const PatientAppointments = () => {
  // Current date/time and user info
  const currentDate = new Date('2025-03-10T04:48:41Z');
  const username = "Pema-Rinchen";
  
  // State management
  const [tabValue, setTabValue] = useState(0);
  const [selectedDate, setSelectedDate] = useState(currentDate);
  const [appointmentType, setAppointmentType] = useState('virtual');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [appointmentPurpose, setAppointmentPurpose] = useState('');
  const [step, setStep] = useState(1);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [pastAppointments, setPastAppointments] = useState([]);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  
  // Check if on mobile using window.innerWidth directly to avoid theme context issues
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 600);
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 600);
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  useEffect(() => {
    // Fetch would normally happen here
    setUpcomingAppointments([
      {
        id: 101,
        doctor: 'Dr. Sarah Johnson',
        date: new Date('2025-03-15T10:30:00'),
        type: 'virtual',
        purpose: 'Follow-up consultation',
        status: 'confirmed'
      },
      {
        id: 102,
        doctor: 'Dr. Robert Wilson',
        date: new Date('2025-03-22T14:15:00'),
        type: 'in-person',
        purpose: 'Annual physical examination and comprehensive health check',
        status: 'confirmed'
      }
    ]);
    
    setPastAppointments([
      {
        id: 100,
        doctor: 'Dr. Michael Chen',
        date: new Date('2025-02-20T14:00:00'),
        type: 'in-person',
        purpose: 'Annual checkup',
        status: 'completed'
      },
      {
        id: 99,
        doctor: 'Dr. Anita Patel',
        date: new Date('2025-01-15T09:30:00'),
        type: 'virtual',
        purpose: 'Skin condition consultation',
        status: 'completed'
      },
      {
        id: 98,
        doctor: 'Dr. Sarah Johnson',
        date: new Date('2024-12-05T11:00:00'),
        type: 'in-person',
        purpose: 'Flu symptoms and fever',
        status: 'completed'
      }
    ]);
  }, []);

  // Sample data - in a real app, this would come from API
  const doctors = [
    { id: 1, name: 'Dr. Sarah Johnson', specialty: 'General Practitioner', rating: 4.9, availableTimes: ['09:00', '11:30', '14:00'] },
    { id: 2, name: 'Dr. Michael Chen', specialty: 'Cardiologist', rating: 4.8, availableTimes: ['10:00', '13:30', '16:00'] },
    { id: 3, name: 'Dr. Anita Patel', specialty: 'Dermatologist', rating: 4.7, availableTimes: ['08:30', '12:00', '15:30'] },
    { id: 4, name: 'Dr. Robert Wilson', specialty: 'Neurologist', rating: 4.9, availableTimes: ['09:30', '14:30', '17:00'] },
  ];

  // Tab handling
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Reset booking form when moving to next step
  const handleNext = () => {
    setStep(prevStep => prevStep + 1);
  };
  
  // Get AI recommendations for doctors based on appointment type
  const getRecommendedDoctors = () => {
    // In a real implementation, this would use actual AI logic
    return doctors.slice(0, 2);
  };
  
  // Get AI recommendations for time slots
  const getRecommendedTimeSlots = () => {
    if (!selectedDoctor) return [];
    
    // In a real implementation, this would use AI to determine optimal slots
    const optimalSlot = selectedDoctor.availableTimes[0];
    return selectedDoctor.availableTimes.map(time => ({
      time,
      isRecommended: time === optimalSlot
    }));
  };
  
  // Create new appointment
  const handleCreateAppointment = () => {
    const newAppointment = {
      id: Date.now(),
      doctor: selectedDoctor.name,
      date: dateToISOString(selectedDate, selectedTimeSlot),
      type: appointmentType,
      purpose: appointmentPurpose,
      status: 'confirmed'
    };
    
    setUpcomingAppointments([...upcomingAppointments, newAppointment]);
    setNotification({ 
      show: true, 
      message: 'Appointment scheduled successfully!', 
      type: 'success' 
    });
    
    // Reset form
    setStep(1);
    setSelectedDoctor(null);
    setSelectedTimeSlot(null);
    setAppointmentPurpose('');
    
    // Auto-hide notification after 5 seconds
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 5000);
  };
  
  // Format appointment time
  const formatAppointmentTime = (date) => {
    return formatDate(date);
  };

  // Styled components for custom UI elements
  const TimeSlotButton = styled(Button)(({ theme, recommended, selected }) => ({
    width: '100%',
    marginBottom: theme.spacing(1),
    position: 'relative',
    backgroundColor: selected ? theme.palette.primary.light : 'transparent',
    color: selected ? theme.palette.primary.contrastText : theme.palette.text.primary,
    border: recommended 
      ? `2px solid ${theme.palette.success.main}` 
      : `1px solid ${theme.palette.divider}`,
    '&:hover': {
      backgroundColor: selected ? theme.palette.primary.main : theme.palette.action.hover,
    },
  }));

  const DoctorCard = styled(Card)(({ theme, selected }) => ({
    cursor: 'pointer',
    position: 'relative',
    transition: 'transform 0.2s, box-shadow 0.2s',
    border: selected ? `2px solid ${theme.palette.primary.main}` : 'none',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: theme.shadows[6],
    },
  }));

  // Create array of dates that have appointments (for calendar highlighting)
  const datesWithAppointments = useMemo(() => {
    return upcomingAppointments.map(appointment => {
      const date = new Date(appointment.date);
      // Reset time part for date comparison
      return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    });
  }, [upcomingAppointments]);
  
  // Render booking step content
  const renderBookingStepContent = () => {
    switch(step) {
      case 1: // Appointment type & date selection
        return (
          <Paper elevation={2} sx={{ p: 3, mb: 2, borderRadius: 2 }}>
            <Typography variant="h5" component="h2" sx={{ mb: 2, fontWeight: 'bold' }}>
              Step 1: Select Appointment Type and Date
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>Appointment Type:</Typography>
              <RadioGroup
                row
                value={appointmentType}
                onChange={(e) => setAppointmentType(e.target.value)}
              >
                <FormControlLabel 
                  value="virtual" 
                  control={<Radio color="primary" />} 
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ mr: 1, fontSize: '1.2rem' }}>📹</Box>
                      <Typography>Virtual Consultation</Typography>
                    </Box>
                  }
                  sx={{ mr: 4, pb: 1 }}
                />
                <FormControlLabel 
                  value="in-person" 
                  control={<Radio color="primary" />} 
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ mr: 1, fontSize: '1.2rem' }}>🏥</Box>
                      <Typography>In-Person Visit</Typography>
                    </Box>
                  }
                />
              </RadioGroup>
            </Box>
            
            <Typography variant="subtitle1" sx={{ mb: 2 }}>Select Date:</Typography>
            <Box sx={{ mb: 3 }}>
              <AppointmentCalendar 
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
                minDate={currentDate}
                availableDates={[
                  new Date('2025-03-11T00:00:00'),
                  new Date('2025-03-12T00:00:00'),
                  new Date('2025-03-15T00:00:00')
                ]}
                recommendedDates={[
                  new Date('2025-03-12T00:00:00')
                ]}
                appointmentDates={datesWithAppointments}
              />
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                variant="contained" 
                color="primary"
                onClick={handleNext}
                endIcon="→"
              >
                Continue to Doctor Selection
              </Button>
            </Box>
          </Paper>
        );
        
      case 2: // Doctor selection
        return (
          <Paper elevation={2} sx={{ p: 3, mb: 2, borderRadius: 2 }}>
            <Typography variant="h5" component="h2" sx={{ mb: 2, fontWeight: 'bold' }}>
              Step 2: Select a Doctor
            </Typography>
            
            <Alert severity="info" sx={{ mb: 3 }}>
              Based on your {appointmentType === 'virtual' ? 'virtual consultation' : 'in-person visit'} 
              needs and medical history, we recommend these providers:
            </Alert>
            
            <Grid container spacing={2} sx={{ mb: 4 }}>
              {getRecommendedDoctors().map(doctor => (
                <Grid item xs={12} sm={6} key={doctor.id}>
                  <DoctorCard 
                    selected={selectedDoctor?.id === doctor.id}
                    onClick={() => setSelectedDoctor(doctor)}
                    elevation={selectedDoctor?.id === doctor.id ? 6 : 2}
                  >
                    {selectedDoctor?.id === doctor.id && (
                      <Chip 
                        label="Selected" 
                        color="primary" 
                        size="small" 
                        sx={{ 
                          position: 'absolute', 
                          top: 8, 
                          right: 8 
                        }} 
                      />
                    )}
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Avatar 
                          sx={{ 
                            bgcolor: 'primary.main', 
                            color: 'primary.contrastText',
                            mr: 2
                          }}
                        >
                          {doctor.name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="h6">{doctor.name}</Typography>
                          <Typography color="textSecondary" variant="body2">{doctor.specialty}</Typography>
                        </Box>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Rating value={doctor.rating} precision={0.1} readOnly size="small" />
                        <Typography variant="body2" sx={{ ml: 1 }}>{doctor.rating}</Typography>
                      </Box>
                      
                      <Typography variant="body2" sx={{ fontWeight: 'bold', mt: 1 }}>
                        Available times:
                      </Typography>
                      <Typography variant="body2">
                        {doctor.availableTimes.join(', ')}
                      </Typography>
                    </CardContent>
                  </DoctorCard>
                </Grid>
              ))}
            </Grid>
            
            <Typography variant="h6" sx={{ mb: 2 }}>
              Or select from all available doctors:
            </Typography>
            
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {doctors.filter(d => !getRecommendedDoctors().includes(d)).map(doctor => (
                <Grid item xs={12} sm={6} key={doctor.id}>
                  <DoctorCard 
                    selected={selectedDoctor?.id === doctor.id}
                    onClick={() => setSelectedDoctor(doctor)}
                    elevation={selectedDoctor?.id === doctor.id ? 6 : 1}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Avatar 
                          sx={{ 
                            bgcolor: 'secondary.light', 
                            color: 'secondary.contrastText',
                            mr: 2
                          }}
                        >
                          {doctor.name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="h6">{doctor.name}</Typography>
                          <Typography color="textSecondary" variant="body2">{doctor.specialty}</Typography>
                        </Box>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Rating value={doctor.rating} precision={0.1} readOnly size="small" />
                        <Typography variant="body2" sx={{ ml: 1 }}>{doctor.rating}</Typography>
                      </Box>
                      
                      <Typography variant="body2" sx={{ fontWeight: 'bold', mt: 1 }}>
                        Available times:
                      </Typography>
                      <Typography variant="body2">
                        {doctor.availableTimes.join(', ')}
                      </Typography>
                    </CardContent>
                  </DoctorCard>
                </Grid>
              ))}
            </Grid>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button 
                variant="outlined" 
                color="primary"
                onClick={() => setStep(1)}
              >
                Back
              </Button>
              <Button 
                variant="contained" 
                color="primary"
                onClick={handleNext}
                disabled={!selectedDoctor}
                endIcon="→"
              >
                Continue to Time Selection
              </Button>
            </Box>
          </Paper>
        );
        
      case 3: // Time slot & purpose selection
        return (
          <Paper elevation={2} sx={{ p: 3, mb: 2, borderRadius: 2 }}>
            <Typography variant="h5" component="h2" sx={{ mb: 2, fontWeight: 'bold' }}>
              Step 3: Select Time and Specify Purpose
            </Typography>
            
            <Typography variant="h6" sx={{ mb: 2 }}>
              Available Time Slots for {selectedDoctor?.name} on {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </Typography>
            
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {getRecommendedTimeSlots().map((slot, index) => (
                <Grid item xs={6} sm={4} md={3} key={index}>
                  <TimeSlotButton
                    variant="outlined"
                    selected={selectedTimeSlot === slot.time}
                    recommended={slot.isRecommended}
                    onClick={() => setSelectedTimeSlot(slot.time)}
                    title={slot.isRecommended ? "AI Recommended: Optimal slot based on your history" : ""}
                  >
                    {slot.time}
                    {slot.isRecommended && (
                      <Box 
                        sx={{ 
                          position: 'absolute', 
                          top: 0, 
                          right: 0, 
                          backgroundColor: 'success.main',
                          color: 'white',
                          width: 20,
                          height: 20,
                          borderRadius: '0 0 0 4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.8rem'
                        }}
                      >
                        ✓
                      </Box>
                    )}
                  </TimeSlotButton>
                </Grid>
              ))}
            </Grid>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>Appointment Purpose</Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="Describe your symptoms or reason for visit..."
                value={appointmentPurpose}
                onChange={(e) => setAppointmentPurpose(e.target.value)}
                variant="outlined"
              />
              <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block' }}>
                Please provide details about why you need to see the doctor
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button 
                variant="outlined" 
                color="primary"
                onClick={() => setStep(2)}
              >
                Back
              </Button>
              <Button 
                variant="contained" 
                color="primary"
                onClick={handleCreateAppointment}
                disabled={!selectedTimeSlot || !appointmentPurpose}
                endIcon="✓"
              >
                Confirm Appointment
              </Button>
            </Box>
          </Paper>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" sx={{ mb: 1, fontWeight: 'bold' }}>
          Appointment Management
        </Typography>
        <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary' }}>
          Welcome back, {username}. Manage your healthcare appointments here.
        </Typography>
        
        <Paper sx={{ mb: 4, borderRadius: 2, overflow: 'hidden' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            variant={isMobile ? "fullWidth" : "standard"}
            centered={!isMobile}
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ mr: 1, fontSize: '1.2rem' }}>📅</Box>
                  <Typography>Book Appointment</Typography>
                </Box>
              } 
            />
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ mr: 1, fontSize: '1.2rem' }}>⏰</Box>
                  <Typography>Upcoming ({upcomingAppointments.length})</Typography>
                </Box>
              } 
            />
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ mr: 1, fontSize: '1.2rem' }}>✓</Box>
                  <Typography>Past ({pastAppointments.length})</Typography>
                </Box>
              } 
            />
          </Tabs>
          
          <Box sx={{ p: { xs: 2, sm: 3 } }}>
            {tabValue === 0 && (
              <Box>
                <Typography variant="h5" sx={{ mb: 3 }}>Book a New Appointment</Typography>
                {renderBookingStepContent()}
              </Box>
            )}
            
            {tabValue === 1 && (
              <Box>
                <Typography variant="h5" sx={{ mb: 3 }}>Your Upcoming Appointments</Typography>
                
                {upcomingAppointments.length === 0 ? (
                  <Alert severity="info">
                    You have no upcoming appointments. Book a new appointment to get started.
                  </Alert>
                ) : (
                  <Grid container spacing={3}>
                    {upcomingAppointments.map(appointment => (
                      <Grid item xs={12} sm={6} key={appointment.id}>
                        <Card 
                          sx={{ 
                            height: '100%',
                            borderLeft: 6, 
                            borderColor: appointment.type === 'virtual' ? 'info.main' : 'success.main',
                            position: 'relative',
                            overflow: 'visible'
                          }}
                        >
                          <Chip 
                            label={appointment.type === 'virtual' ? '📹 Virtual' : '🏥 In-Person'} 
                            color={appointment.type === 'virtual' ? 'info' : 'success'}
                            size="small"
                            sx={{ 
                              position: 'absolute', 
                              top: -10, 
                              right: 16 
                            }}
                          />
                          <CardContent sx={{ pb: 1 }}>
                            <Typography variant="h6">{appointment.doctor}</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, color: 'text.secondary' }}>
                              <Box sx={{ mr: 1 }}>⏰</Box>
                              <Typography variant="body2">
                                {formatAppointmentTime(appointment.date)}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', mt: 1, color: 'text.secondary' }}>
                              <Box sx={{ mr: 1 }}>📝</Box>
                              <Typography variant="body2" sx={{ 
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                              }}>
                                {appointment.purpose}
                              </Typography>
                            </Box>
                          </CardContent>
                          <Divider />
                          <CardActions sx={{ justifyContent: 'flex-end', flexWrap: 'wrap', gap: 1, p: 1 }}>
                            <Button 
                              size="small" 
                              startIcon="✏️" 
                              variant="outlined"
                            >
                              Reschedule
                            </Button>
                            <Button 
                              size="small" 
                              startIcon="🗑️" 
                              color="error" 
                              variant="outlined"
                            >
                              Cancel
                            </Button>
                            <Button 
                              size="small" 
                              startIcon="🔔" 
                              color="primary" 
                              variant="contained"
                            >
                              Reminder
                            </Button>
                          </CardActions>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Box>
            )}
            
            {tabValue === 2 && (
              <Box>
                <Typography variant="h5" sx={{ mb: 3 }}>Past Appointments</Typography>
                
                {pastAppointments.length === 0 ? (
                  <Alert severity="info">
                    You have no past appointments.
                  </Alert>
                ) : (
                  <Grid container spacing={3}>
                    {pastAppointments.map(appointment => (
                      <Grid item xs={12} sm={6} key={appointment.id}>
                        <Card sx={{ 
                          height: '100%',
                          backgroundColor: 'action.hover' 
                        }}>
                          <CardContent sx={{ pb: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                              <Typography variant="h6">{appointment.doctor}</Typography>
                              <Chip label={appointment.status} color="default" size="small" />
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, color: 'text.secondary' }}>
                              <Box sx={{ mr: 1 }}>⏰</Box>
                              <Typography variant="body2">
                                {formatAppointmentTime(appointment.date)}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', mt: 1, color: 'text.secondary' }}>
                              <Box sx={{ mr: 1 }}>📝</Box>
                              <Typography variant="body2" sx={{ 
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                              }}>
                                {appointment.purpose}
                              </Typography>
                            </Box>
                          </CardContent>
                          <Divider />
                          <CardActions sx={{ justifyContent: 'flex-end', flexWrap: 'wrap', gap: 1, p: 1 }}>
                            <Button 
                              size="small" 
                              startIcon="📄" 
                              variant="outlined"
                            >
                              View Summary
                            </Button>
                            <Button 
                              size="small" 
                              startIcon="➕" 
                              color="primary" 
                              variant="contained"
                            >
                              Book Follow-up
                            </Button>
                          </CardActions>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Box>
            )}
          </Box>
        </Paper>
        
        {/* Notification toast */}
        <Snackbar 
          open={notification.show} 
          autoHideDuration={5000} 
          onClose={() => setNotification(prev => ({ ...prev, show: false }))}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            onClose={() => setNotification(prev => ({ ...prev, show: false }))} 
            severity={notification.type}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </Container>
    </ThemeProvider>
  );
}

export default PatientAppointments;