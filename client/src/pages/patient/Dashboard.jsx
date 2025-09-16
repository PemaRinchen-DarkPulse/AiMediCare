import React from 'react';
import { 
  Container, Grid, Box, Typography, Paper, 
  useMediaQuery, useTheme, Avatar, Button, Badge 
} from '@mui/material';
import { 
  NotificationsActive, CalendarToday, Chat, AccountCircle 
} from '@mui/icons-material';

// Mock data (would come from API/context in real implementation)
const mockUser = {
  name: "Pema",
  profileImage: "", // Removed the URL for profile image
  upcomingAppointments: [
    { id: 1, doctor: "Dr. Emily Chen", specialty: "Cardiology", date: "July 15, 2023", time: "10:30 AM", virtual: true },
    { id: 2, doctor: "Dr. Michael Rodriguez", specialty: "General Practice", date: "July 28, 2023", time: "2:15 PM", virtual: false }
  ],
  notifications: [
    { id: 1, type: "medication", message: "Time to take your blood pressure medication", urgent: true },
    { id: 2, type: "appointment", message: "Your lab results are ready to view", urgent: false },
    { id: 3, type: "reminder", message: "Schedule your annual physical exam", urgent: false }
  ],
  healthMetrics: {
    bloodPressure: { current: "124/78", target: "120/80", history: [118, 122, 124, 121, 124] },
    bloodSugar: { current: "112", target: "<100", history: [104, 118, 115, 110, 112] },
    cholesterol: { current: "185", target: "<200", history: [190, 188, 185, 187, 185] },
    weight: { current: "165", target: "155-170", history: [168, 167, 166, 165, 165] }
  },
  medications: [
    { name: "Lisinopril", dosage: "10mg", frequency: "Once daily", timeOfDay: "Morning", adherence: 92 },
    { name: "Metformin", dosage: "500mg", frequency: "Twice daily", timeOfDay: "Morning/Evening", adherence: 85 },
    { name: "Atorvastatin", dosage: "20mg", frequency: "Once daily", timeOfDay: "Evening", adherence: 90 }
  ]
};

// Design tokens - calming healthcare palette
const colors = {
  primary: "#1976d2", // Trustworthy blue 
  secondary: "#4caf50", // Healing green
  accent: "#7c4dff", // Soft purple for accent
  background: "#f5f7fa", // Light background
  surface: "#ffffff",
  text: {
    primary: "#2c3e50",
    secondary: "#546e7a",
    light: "#78909c"
  },
  status: {
    success: "#66bb6a",
    warning: "#ffa726",
    danger: "#ef5350",
    info: "#29b6f6"
  }
};

const Dashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box 
      sx={{ 
        backgroundColor: colors.background, 
        minHeight: '100vh'
      }}
    >
      <Container maxWidth="xl" disableGutters>
        {/* Welcome Area */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3, 
            mb: 3, 
            borderRadius: 2,
            background: `linear-gradient(to right, ${colors.primary}CC, ${colors.accent}CC)`,
            color: 'white'
          }}
        >
          <Grid container alignItems="center" spacing={3}>
            <Grid item>
              <Avatar 
                // Use icon instead of image
                sx={{ width: 64, height: 64, border: '2px solid white' }}
              >
                <AccountCircle sx={{ width: '100%', height: '100%' }} />
              </Avatar>
            </Grid>
            <Grid item xs>
              <Typography variant="h4" gutterBottom>Welcome back, {mockUser.name}</Typography>
              <Typography variant="body1">
                You have {mockUser.upcomingAppointments.length} upcoming appointments and {
                  mockUser.notifications.filter(n => n.urgent).length
                } urgent notifications.
              </Typography>
            </Grid>
            <Grid item>
              <Button 
                variant="contained" 
                startIcon={<Chat />}
                sx={{ 
                  backgroundColor: 'white', 
                  color: colors.primary,
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.9)',
                  }
                }}
              >
                Ask MediAI
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Health Metrics and Notifications Section */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {/* Health Metrics Content */}
          <Grid item xs={12} md={8}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom sx={{ color: colors.text.primary, fontWeight: 600 }}>
                Health Metrics
              </Typography>
              <Grid container spacing={3}>
                {Object.entries(mockUser.healthMetrics).map(([key, metric]) => (
                  <Grid item xs={12} sm={6} key={key}>
                    <Paper 
                      elevation={1} 
                      sx={{ 
                        p: 2, 
                        borderRadius: 2,
                        border: '1px solid rgba(0,0,0,0.08)'
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ color: colors.text.secondary, textTransform: 'capitalize' }}>
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'baseline', mt: 1 }}>
                        <Typography variant="h4" sx={{ color: colors.primary, fontWeight: 500 }}>
                          {metric.current}
                        </Typography>
                        <Typography variant="body2" sx={{ ml: 1, color: colors.text.light }}>
                          Target: {metric.target}
                        </Typography>
                      </Box>
                      <Box 
                        sx={{ 
                          height: 50, 
                          mt: 2,
                          display: 'flex',
                          alignItems: 'flex-end'
                        }}
                      >
                        {metric.history.map((value, i) => (
                          <Box 
                            key={i}
                            sx={{
                              flex: 1,
                              mx: 0.5,
                              height: `${(value / Math.max(...metric.history)) * 100}%`,
                              backgroundColor: colors.primary,
                              borderRadius: '4px 4px 0 0'
                            }}
                          />
                        ))}
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
          
          {/* Notifications */}
          <Grid item xs={12} md={4}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ color: colors.text.primary, fontWeight: 600 }}>
                  Notifications
                </Typography>
                <Badge badgeContent={mockUser.notifications.filter(n => n.urgent).length} color="error">
                  <NotificationsActive color="action" />
                </Badge>
              </Box>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {mockUser.notifications.map(notification => (
                  <Paper 
                    key={notification.id}
                    elevation={1}
                    sx={{ 
                      p: 2, 
                      borderRadius: 2,
                      borderLeft: notification.urgent ? `4px solid ${colors.status.danger}` : 'none',
                      backgroundColor: notification.urgent ? 'rgba(239, 83, 80, 0.08)' : 'white'
                    }}
                  >
                    <Typography variant="body2" sx={{ color: colors.text.primary }}>
                      {notification.message}
                    </Typography>
                  </Paper>
                ))}
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Upcoming Appointments Section */}
        <Paper elevation={0} sx={{ p: 3, borderRadius: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ color: colors.text.primary, fontWeight: 600 }}>
            Upcoming Appointments
          </Typography>
          
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {mockUser.upcomingAppointments.map(appointment => (
              <Grid item xs={12} sm={6} md={4} key={appointment.id}>
                <Paper
                  elevation={1}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: '1px solid rgba(0,0,0,0.08)',
                    height: '100%'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Avatar sx={{ bgcolor: appointment.virtual ? colors.accent : colors.primary, mr: 2 }}>
                      {appointment.doctor.split(' ')[1][0]}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                        {appointment.doctor}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {appointment.specialty}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      <CalendarToday sx={{ fontSize: '0.9rem', mr: 1, verticalAlign: 'middle' }} />
                      {appointment.date} at {appointment.time}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        mt: 1, 
                        color: 'white',
                        backgroundColor: appointment.virtual ? colors.accent : colors.primary,
                        display: 'inline-block',
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        fontSize: '0.75rem'
                      }}
                    >
                      {appointment.virtual ? 'Virtual Consultation' : 'In-person Visit'}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button 
                      variant="contained" 
                      size="small"
                      sx={{ 
                        backgroundColor: appointment.virtual ? colors.accent : colors.primary,
                        '&:hover': {
                          backgroundColor: appointment.virtual ? 
                            `${colors.accent}DD` : `${colors.primary}DD`
                        }
                      }}
                    >
                      {appointment.virtual ? 'Join Call' : 'Directions'}
                    </Button>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Paper>

        {/* Medications Section */}
        <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom sx={{ color: colors.text.primary, fontWeight: 600 }}>
            Medication Tracker
          </Typography>
          
          <Grid container spacing={3}>
            {mockUser.medications.map((medication, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Paper
                  elevation={1}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: '1px solid rgba(0,0,0,0.08)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <Typography variant="h6">{medication.name}</Typography>
                  <Typography variant="body2" color="text.secondary">{medication.dosage}</Typography>
                  
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      <strong>Frequency:</strong> {medication.frequency}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Time:</strong> {medication.timeOfDay}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ mr: 1 }}>Adherence:</Typography>
                    <Box sx={{ 
                      flex: 1, 
                      height: 8, 
                      backgroundColor: 'rgba(0,0,0,0.1)', 
                      borderRadius: 5,
                      position: 'relative'
                    }}>
                      <Box sx={{ 
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: `${medication.adherence}%`,
                        backgroundColor: medication.adherence > 90 ? 
                          colors.status.success : 
                          (medication.adherence > 75 ? colors.status.warning : colors.status.danger),
                        borderRadius: 5
                      }} />
                    </Box>
                    <Typography variant="body2" sx={{ ml: 1, fontWeight: 500 }}>
                      {medication.adherence}%
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button 
                      variant="outlined" 
                      size="small"
                      sx={{ 
                        borderColor: colors.secondary, 
                        color: colors.secondary
                      }}
                    >
                      Refill Request
                    </Button>
                  </Box>
                  
                  {/* Circle decoration in background */}
                  <Box sx={{ 
                    position: 'absolute', 
                    right: -20, 
                    top: -20, 
                    width: 100, 
                    height: 100, 
                    borderRadius: '50%', 
                    backgroundColor: `${colors.secondary}10`
                  }} />
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Paper>
        
        {/* Accessibility Features */}
        <Box sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 1000, display: 'flex', gap: 1 }}>
          <Button 
            size="small" 
            variant="contained"
            sx={{
              backgroundColor: 'rgba(0,0,0,0.7)',
              color: 'white',
              minWidth: 'auto',
              width: 40,
              height: 40,
              borderRadius: '50%'
            }}
            aria-label="Increase text size"
          >
            A+
          </Button>
          <Button 
            size="small" 
            variant="contained"
            sx={{
              backgroundColor: 'rgba(0,0,0,0.7)',
              color: 'white',
              minWidth: 'auto',
              width: 40,
              height: 40,
              borderRadius: '50%'
            }}
            aria-label="High contrast mode"
          >
            <strong>Aa</strong>
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default Dashboard;