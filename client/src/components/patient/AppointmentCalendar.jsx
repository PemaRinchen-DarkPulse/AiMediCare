import React, { useState, useEffect } from 'react';
import { Grid, Typography, Button } from '@mui/material';
import { styled } from '@mui/material/styles';

// Helper function to check if two dates are the same day
const isSameDay = (date1, date2) => {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
};

// Custom styled components
const CalendarDayButton = styled(Button)(({ 
  theme, 
  istoday, 
  isselected, 
  isappointment, 
  isrecommended, 
  isavailable,
  isdisabled
}) => ({
  width: '50px',
  height: '50px',
  margin: '3px',
  borderRadius: '50%',
  minWidth: 'unset',
  padding: 0,
  fontSize: '1.1rem',
  border: istoday === 'true' ? `2px solid ${theme.palette.primary.main}` : 'none',
  color: isdisabled === 'true' ? theme.palette.text.disabled : 
         isselected === 'true' ? theme.palette.primary.contrastText : theme.palette.text.primary,
  backgroundColor: isdisabled === 'true' ? 'transparent' : 
                   isselected === 'true' ? theme.palette.primary.main : 'transparent',
  position: 'relative',
  '&:hover': {
    backgroundColor: isdisabled === 'true' ? 'transparent' : 
                     isselected === 'true' ? theme.palette.primary.dark : theme.palette.action.hover,
  },
  '&::after': isappointment === 'true' ? {
    content: '""',
    position: 'absolute',
    top: '3px',
    right: '3px',
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: theme.palette.success.main,
  } : isrecommended === 'true' ? {
    content: '""',
    position: 'absolute',
    top: '3px',
    right: '3px',
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: theme.palette.info.main,
  } : isavailable === 'true' ? {
    content: '""',
    position: 'absolute',
    top: '3px',
    right: '3px',
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: theme.palette.warning.main,
  } : {},
}));

const MonthNavButton = styled(Button)(({ theme }) => ({
  minWidth: 'unset',
  padding: theme.spacing(0.5),
  fontSize: '1.2rem',
}));

const CalendarContainer = styled('div')(({ theme }) => ({
  width: '100%',
  maxWidth: 420,
  marginLeft: 'auto',
  marginRight: 'auto',
  padding: theme.spacing(2),
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
}));

const CalendarHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
}));

const AppointmentCalendar = ({ 
  selectedDate, 
  onDateChange, 
  minDate,
  availableDates = [],
  recommendedDates = [],
  appointmentDates = [],
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate));
  
  // Update current month when selected date changes
  useEffect(() => {
    setCurrentMonth(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
  }, [selectedDate]);

  // Get day names for header
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Get month names for navigation
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Navigate to previous month
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  // Navigate to next month
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  // Generate calendar days for current month view
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // Get first day of the month
    const firstDay = new Date(year, month, 1);
    
    // Get the day of the week (0 = Sunday, 6 = Saturday)
    const startingDayOfWeek = firstDay.getDay();
    
    // Get the number of days in the month
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Get today's date for comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Calculate minimum selectable date
    let minSelectableDate = null;
    if (minDate) {
      minSelectableDate = new Date(minDate);
      minSelectableDate.setHours(0, 0, 0, 0);
    }
    
    // Create array of day objects
    let days = [];
    
    // Add previous month's days
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthDays - i),
        isCurrentMonth: false,
        isDisabled: true,
      });
    }
    
    // Add current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      date.setHours(0, 0, 0, 0);
      
      // Check if this date is disabled (before minimum date)
      const isDisabled = minSelectableDate ? date < minSelectableDate : false;
      
      days.push({
        date,
        isCurrentMonth: true,
        isToday: isSameDay(date, today),
        isSelected: isSameDay(date, selectedDate),
        isDisabled,
        isAppointment: appointmentDates.some(appointmentDate => isSameDay(appointmentDate, date)),
        isRecommended: recommendedDates.some(recommendedDate => isSameDay(recommendedDate, date)),
        isAvailable: availableDates.some(availableDate => isSameDay(availableDate, date)),
      });
    }
    
    // Add next month's days to complete the calendar grid (total of 42 days = 6 weeks)
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        date: new Date(year, month + 1, day),
        isCurrentMonth: false,
        isDisabled: true,
      });
    }
    
    return days;
  };

  // Handle date selection
  const handleDateSelect = (day) => {
    if (!day.isDisabled) {
      onDateChange(day.date);
    }
  };

  // Generate calendar days
  const calendarDays = generateCalendarDays();

  return (
    <CalendarContainer>
      {/* Calendar Header */}
      <CalendarHeader>
        <MonthNavButton onClick={prevMonth} aria-label="Previous month">
          ◀
        </MonthNavButton>
        <Typography variant="h5" sx={{ fontWeight: 'medium' }}>
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </Typography>
        <MonthNavButton onClick={nextMonth} aria-label="Next month">
          ▶
        </MonthNavButton>
      </CalendarHeader>

      {/* Day names header */}
      <Grid container>
        {dayNames.map(day => (
          <Grid item xs={12/7} key={day} sx={{ textAlign: 'center', mb: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
              {day}
            </Typography>
          </Grid>
        ))}
      </Grid>

      {/* Calendar days */}
      <Grid container>
        {calendarDays.map((day, index) => (
          <Grid item xs={12/7} key={index} sx={{ textAlign: 'center' }}>
            <CalendarDayButton
              istoday={day.isToday ? 'true' : 'false'}
              isselected={day.isSelected ? 'true' : 'false'}
              isappointment={day.isAppointment ? 'true' : 'false'}
              isrecommended={day.isRecommended ? 'true' : 'false'}
              isavailable={day.isAvailable ? 'true' : 'false'}
              isdisabled={day.isDisabled || !day.isCurrentMonth ? 'true' : 'false'}
              onClick={() => handleDateSelect(day)}
              sx={{ 
                opacity: !day.isCurrentMonth ? 0.3 : 1
              }}
              disabled={day.isDisabled || !day.isCurrentMonth}
            >
              {day.date.getDate()}
            </CalendarDayButton>
          </Grid>
        ))}
      </Grid>
      
      {/* Calendar legend */}
      <Grid container spacing={1} sx={{ mt: 3, justifyContent: 'center' }}>
        <Grid item>
          <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ 
              display: 'inline-block',
              width: 10, 
              height: 10, 
              borderRadius: '50%', 
              backgroundColor: '#2e7d32',
              marginRight: 4
            }}></span>
            Appointment
          </Typography>
        </Grid>
        <Grid item>
          <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ 
              display: 'inline-block',
              width: 10, 
              height: 10, 
              borderRadius: '50%', 
              backgroundColor: '#0288d1',
              marginRight: 4
            }}></span>
            Recommended
          </Typography>
        </Grid>
        <Grid item>
          <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ 
              display: 'inline-block',
              width: 10, 
              height: 10, 
              borderRadius: '50%', 
              backgroundColor: '#ed6c02',
              marginRight: 4
            }}></span>
            Available
          </Typography>
        </Grid>
      </Grid>
    </CalendarContainer>
  );
};

export default AppointmentCalendar;
