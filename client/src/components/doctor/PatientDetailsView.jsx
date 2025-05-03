import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Tabs, Tab, Divider, Grid, Paper, 
  CircularProgress, Alert, Button, List, ListItem, 
  ListItemText, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Dialog, DialogActions, DialogContent, 
  DialogTitle, TextField, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import {
  Edit as EditIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  MonitorHeart as VitalsIcon,
  MedicalInformation as AllergiesIcon,
  History as MedicalHistoryIcon,
  Person as PersonalIcon,
  Timeline as ChronicConditionsIcon,
  Vaccines as ImmunizationsIcon
} from '@mui/icons-material';
import { 
  getPatientById, getPatientVitals, getPatientAllergies, 
  getPatientMedicalHistory, getPatientChronicConditions,
  getPatientImmunizations, addVitalRecord, addAllergyRecord, 
  addMedicalRecord, addChronicCondition, addImmunization
} from '../../services/patientManagementService';

// TabPanel component for tab content
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`patient-tabpanel-${index}`}
      aria-labelledby={`patient-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const PatientDetailsView = ({ patientId }) => {
  // State variables
  const [patient, setPatient] = useState(null);
  const [vitalsData, setVitalsData] = useState(null);
  const [allergies, setAllergies] = useState([]);
  const [medicalHistory, setMedicalHistory] = useState([]);
  const [chronicConditions, setChronicConditions] = useState([]);
  const [immunizations, setImmunizations] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal states
  const [vitalModalOpen, setVitalModalOpen] = useState(false);
  const [allergyModalOpen, setAllergyModalOpen] = useState(false);
  const [medicalHistoryModalOpen, setMedicalHistoryModalOpen] = useState(false);
  const [chronicConditionModalOpen, setChronicConditionModalOpen] = useState(false);
  const [immunizationModalOpen, setImmunizationModalOpen] = useState(false);
  
  // Form states
  const [vitalForm, setVitalForm] = useState({
    vitalType: 'bloodPressure',
    systolic: '',
    diastolic: '',
    value: '',
    unit: 'mmHg', // Adding unit field with default value
    notes: '',
    date: new Date().toISOString().split('T')[0]
  });
  
  const [allergyForm, setAllergyForm] = useState({
    allergen: '',
    reaction: '',
    severity: 'Mild',
    notes: '',
    dateIdentified: new Date().toISOString().split('T')[0]
  });
  
  const [medicalHistoryForm, setMedicalHistoryForm] = useState({
    diagnosis: '',
    provider: '',
    status: 'Active',
    notes: '',
    date: new Date().toISOString().split('T')[0]
  });
  
  const [chronicConditionForm, setChronicConditionForm] = useState({
    condition: '',
    diagnosedDate: new Date().toISOString().split('T')[0],
    severity: 'Mild',
    status: 'Monitoring',
    treatingProvider: '',
    managementPlan: '',
    notes: ''
  });
  
  const [immunizationForm, setImmunizationForm] = useState({
    vaccine: '',
    date: new Date().toISOString().split('T')[0],
    administrator: '',
    facility: '',
    batchNumber: '',
    nextDoseDate: '',
    notes: ''
  });

  // Load patient data
  useEffect(() => {
    if (patientId) {
      loadPatientData();
    }
  }, [patientId]);

  const loadPatientData = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Fetch all patient data in parallel
      const [patientResponse, vitalsResponse, allergiesResponse, 
             medicalHistoryResponse, chronicConditionsResponse, immunizationsResponse] = await Promise.all([
        getPatientById(patientId),
        getPatientVitals(patientId),
        getPatientAllergies(patientId),
        getPatientMedicalHistory(patientId),
        getPatientChronicConditions(patientId),
        getPatientImmunizations(patientId)
      ]);
      
      setPatient(patientResponse.data);
      setVitalsData(vitalsResponse.data);
      setAllergies(allergiesResponse.data);
      setMedicalHistory(medicalHistoryResponse.data);
      setChronicConditions(chronicConditionsResponse.data);
      setImmunizations(immunizationsResponse.data);
    } catch (err) {
      console.error('Error loading patient data:', err);
      setError('Failed to load patient data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Tab change handler
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Modal handlers
  const handleOpenVitalModal = () => setVitalModalOpen(true);
  const handleCloseVitalModal = () => setVitalModalOpen(false);
  
  const handleOpenAllergyModal = () => setAllergyModalOpen(true);
  const handleCloseAllergyModal = () => setAllergyModalOpen(false);
  
  const handleOpenMedicalHistoryModal = () => setMedicalHistoryModalOpen(true);
  const handleCloseMedicalHistoryModal = () => setMedicalHistoryModalOpen(false);
  
  const handleOpenChronicConditionModal = () => setChronicConditionModalOpen(true);
  const handleCloseChronicConditionModal = () => setChronicConditionModalOpen(false);
  
  const handleOpenImmunizationModal = () => setImmunizationModalOpen(true);
  const handleCloseImmunizationModal = () => setImmunizationModalOpen(false);
  
  // Form handlers
  const handleVitalFormChange = (e) => {
    const { name, value } = e.target;
    setVitalForm(prev => ({ ...prev, [name]: value }));
  };
  
  const handleAllergyFormChange = (e) => {
    const { name, value } = e.target;
    setAllergyForm(prev => ({ ...prev, [name]: value }));
  };
  
  const handleMedicalHistoryFormChange = (e) => {
    const { name, value } = e.target;
    setMedicalHistoryForm(prev => ({ ...prev, [name]: value }));
  };
  
  const handleChronicConditionFormChange = (e) => {
    const { name, value } = e.target;
    setChronicConditionForm(prev => ({ ...prev, [name]: value }));
  };
  
  const handleImmunizationFormChange = (e) => {
    const { name, value } = e.target;
    setImmunizationForm(prev => ({ ...prev, [name]: value }));
  };
  
  // Submit handlers
  const handleVitalSubmit = async (e) => {
    e.preventDefault();
    try {
      await addVitalRecord(patientId, vitalForm);
      // Refresh vitals data
      const response = await getPatientVitals(patientId);
      setVitalsData(response.data);
      handleCloseVitalModal();
      
      // Reset form
      setVitalForm({
        vitalType: 'bloodPressure',
        systolic: '',
        diastolic: '',
        value: '',
        unit: 'mmHg', // Ensure unit is included in the reset
        notes: '',
        date: new Date().toISOString().split('T')[0]
      });
    } catch (err) {
      console.error('Error adding vital record:', err);
      setError('Failed to add vital record. Please try again.');
    }
  };
  
  const handleAllergySubmit = async (e) => {
    e.preventDefault();
    try {
      await addAllergyRecord(patientId, allergyForm);
      // Refresh allergy data
      const response = await getPatientAllergies(patientId);
      setAllergies(response.data);
      handleCloseAllergyModal();
      
      // Reset form
      setAllergyForm({
        allergen: '',
        reaction: '',
        severity: 'Mild',
        notes: '',
        dateIdentified: new Date().toISOString().split('T')[0]
      });
    } catch (err) {
      console.error('Error adding allergy record:', err);
      setError('Failed to add allergy record. Please try again.');
    }
  };
  
  const handleMedicalHistorySubmit = async (e) => {
    e.preventDefault();
    try {
      await addMedicalRecord(patientId, medicalHistoryForm);
      // Refresh medical history data
      const response = await getPatientMedicalHistory(patientId);
      setMedicalHistory(response.data);
      handleCloseMedicalHistoryModal();
      
      // Reset form
      setMedicalHistoryForm({
        diagnosis: '',
        provider: '',
        status: 'Active',
        notes: '',
        date: new Date().toISOString().split('T')[0]
      });
    } catch (err) {
      console.error('Error adding medical history record:', err);
      setError('Failed to add medical history record. Please try again.');
    }
  };
  
  const handleChronicConditionSubmit = async (e) => {
    e.preventDefault();
    try {
      await addChronicCondition(patientId, chronicConditionForm);
      // Refresh chronic conditions data
      const response = await getPatientChronicConditions(patientId);
      setChronicConditions(response.data);
      handleCloseChronicConditionModal();
      
      // Reset form
      setChronicConditionForm({
        condition: '',
        diagnosedDate: new Date().toISOString().split('T')[0],
        severity: 'Mild',
        status: 'Monitoring',
        treatingProvider: '',
        managementPlan: '',
        notes: ''
      });
    } catch (err) {
      console.error('Error adding chronic condition:', err);
      setError('Failed to add chronic condition. Please try again.');
    }
  };
  
  const handleImmunizationSubmit = async (e) => {
    e.preventDefault();
    try {
      await addImmunization(patientId, immunizationForm);
      // Refresh immunizations data
      const response = await getPatientImmunizations(patientId);
      setImmunizations(response.data);
      handleCloseImmunizationModal();
      
      // Reset form
      setImmunizationForm({
        vaccine: '',
        date: new Date().toISOString().split('T')[0],
        administrator: '',
        facility: '',
        batchNumber: '',
        nextDoseDate: '',
        notes: ''
      });
    } catch (err) {
      console.error('Error adding immunization:', err);
      setError('Failed to add immunization. Please try again.');
    }
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!patient) {
    return (
      <Alert severity="info" sx={{ mb: 2 }}>
        No patient data found.
      </Alert>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* Patient Basic Information */}
      <Box sx={{ p: 2, mb: 3, border: '1px solid rgba(0, 0, 0, 0.12)', borderRadius: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <PersonalIcon sx={{ mr: 1 }} />
          <Typography variant="h6" component="h2">
            Patient Information
          </Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="body2" color="text.secondary">
              Full Name
            </Typography>
            <Typography variant="body1">
              {patient.user?.name || 'N/A'}
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="body2" color="text.secondary">
              Email
            </Typography>
            <Typography variant="body1">
              {patient.user?.email || 'N/A'}
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="body2" color="text.secondary">
              Phone
            </Typography>
            <Typography variant="body1">
              {patient.user?.phoneNumber || 'N/A'}
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="body2" color="text.secondary">
              Blood Type
            </Typography>
            <Typography variant="body1">
              {patient.bloodType || 'Not specified'}
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="body2" color="text.secondary">
              Height
            </Typography>
            <Typography variant="body1">
              {patient.height ? `${patient.height} cm` : 'Not specified'}
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="body2" color="text.secondary">
              Weight
            </Typography>
            <Typography variant="body1">
              {patient.weight ? `${patient.weight} kg` : 'Not specified'}
            </Typography>
          </Grid>
        </Grid>
      </Box>
      
      {/* Tabs for Medical Data */}
      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="patient medical data tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab icon={<VitalsIcon />} label="Vitals" />
            <Tab icon={<AllergiesIcon />} label="Allergies" />
            <Tab icon={<MedicalHistoryIcon />} label="Medical History" />
            <Tab icon={<ChronicConditionsIcon />} label="Chronic Conditions" />
            <Tab icon={<ImmunizationsIcon />} label="Immunizations" />
          </Tabs>
        </Box>
        
        {/* Vitals Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h6">Vital Signs</Typography>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={handleOpenVitalModal}
            >
              Add Vital Record
            </Button>
          </Box>
          
          {vitalsData && Object.keys(vitalsData).length > 0 ? (
            <Grid container spacing={3}>
              {vitalsData.bloodPressure && vitalsData.bloodPressure.length > 0 && (
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>Blood Pressure</Typography>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell>Systolic</TableCell>
                            <TableCell>Diastolic</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {vitalsData.bloodPressure.slice(0, 5).map((record, index) => (
                            <TableRow key={index}>
                              <TableCell>{formatDate(record.date)}</TableCell>
                              <TableCell>{record.value} mmHg</TableCell>
                              <TableCell>{record.secondaryValue} mmHg</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                </Grid>
              )}
              
              {vitalsData.heartRate && vitalsData.heartRate.length > 0 && (
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>Heart Rate</Typography>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell>Rate</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {vitalsData.heartRate.slice(0, 5).map((record, index) => (
                            <TableRow key={index}>
                              <TableCell>{formatDate(record.date)}</TableCell>
                              <TableCell>{record.value} bpm</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                </Grid>
              )}
              
              {vitalsData.weight && vitalsData.weight.length > 0 && (
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>Weight</Typography>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell>Weight</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {vitalsData.weight.slice(0, 5).map((record, index) => (
                            <TableRow key={index}>
                              <TableCell>{formatDate(record.date)}</TableCell>
                              <TableCell>{record.value} {record.unit || 'kg'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                </Grid>
              )}

              {vitalsData.bloodSugar && vitalsData.bloodSugar.length > 0 && (
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>Blood Sugar</Typography>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell>Reading</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {vitalsData.bloodSugar.slice(0, 5).map((record, index) => (
                            <TableRow key={index}>
                              <TableCell>{formatDate(record.date)}</TableCell>
                              <TableCell>{record.value} {record.unit || 'mg/dL'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                </Grid>
              )}

              {vitalsData.cholesterol && vitalsData.cholesterol.length > 0 && (
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>Cholesterol</Typography>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell>Reading</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {vitalsData.cholesterol.slice(0, 5).map((record, index) => (
                            <TableRow key={index}>
                              <TableCell>{formatDate(record.date)}</TableCell>
                              <TableCell>{record.value} {record.unit || 'mg/dL'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                </Grid>
              )}

              {vitalsData.temperature && vitalsData.temperature.length > 0 && (
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>Temperature</Typography>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell>Reading</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {vitalsData.temperature.slice(0, 5).map((record, index) => (
                            <TableRow key={index}>
                              <TableCell>{formatDate(record.date)}</TableCell>
                              <TableCell>{record.value} {record.unit || '°C'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                </Grid>
              )}

              {vitalsData.oxygenSaturation && vitalsData.oxygenSaturation.length > 0 && (
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>Oxygen Saturation</Typography>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell>Reading</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {vitalsData.oxygenSaturation.slice(0, 5).map((record, index) => (
                            <TableRow key={index}>
                              <TableCell>{formatDate(record.date)}</TableCell>
                              <TableCell>{record.value}{record.unit || '%'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                </Grid>
              )}
              
              {(!vitalsData.bloodPressure || vitalsData.bloodPressure.length === 0) &&
               (!vitalsData.heartRate || vitalsData.heartRate.length === 0) &&
               (!vitalsData.weight || vitalsData.weight.length === 0) &&
               (!vitalsData.bloodSugar || vitalsData.bloodSugar.length === 0) &&
               (!vitalsData.cholesterol || vitalsData.cholesterol.length === 0) &&
               (!vitalsData.temperature || vitalsData.temperature.length === 0) &&
               (!vitalsData.oxygenSaturation || vitalsData.oxygenSaturation.length === 0) && (
                <Grid item xs={12}>
                  <Alert severity="info">No vital records found for this patient.</Alert>
                </Grid>
              )}
            </Grid>
          ) : (
            <Alert severity="info">No vital records found for this patient.</Alert>
          )}
        </TabPanel>
        
        {/* Allergies Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h6">Allergies & Alerts</Typography>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={handleOpenAllergyModal}
            >
              Add Allergy
            </Button>
          </Box>
          
          {allergies.length > 0 ? (
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Allergen</TableCell>
                    <TableCell>Reaction</TableCell>
                    <TableCell>Severity</TableCell>
                    <TableCell>Notes</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {allergies.map((allergy) => (
                    <TableRow key={allergy._id}>
                      <TableCell>{allergy.allergen}</TableCell>
                      <TableCell>{allergy.reaction}</TableCell>
                      <TableCell>{allergy.severity}</TableCell>
                      <TableCell>{allergy.notes}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Alert severity="info">No allergies recorded for this patient.</Alert>
          )}
        </TabPanel>
        
        {/* Medical History Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h6">Medical History</Typography>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={handleOpenMedicalHistoryModal}
            >
              Add Medical Record
            </Button>
          </Box>
          
          {medicalHistory.length > 0 ? (
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Diagnosis</TableCell>
                    <TableCell>Provider</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Notes</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {medicalHistory.map((record) => (
                    <TableRow key={record._id}>
                      <TableCell>{formatDate(record.date)}</TableCell>
                      <TableCell>{record.diagnosis}</TableCell>
                      <TableCell>{record.provider}</TableCell>
                      <TableCell>{record.status}</TableCell>
                      <TableCell>{record.notes}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Alert severity="info">No medical history records found for this patient.</Alert>
          )}
        </TabPanel>
        
        {/* Chronic Conditions Tab */}
        <TabPanel value={tabValue} index={3}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h6">Chronic Conditions</Typography>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={handleOpenChronicConditionModal}
            >
              Add Chronic Condition
            </Button>
          </Box>
          
          {chronicConditions.length > 0 ? (
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Condition</TableCell>
                    <TableCell>Diagnosis Date</TableCell>
                    <TableCell>Severity</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Treating Provider</TableCell>
                    <TableCell>Management Plan</TableCell>
                    <TableCell>Notes</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {chronicConditions.map((condition) => (
                    <TableRow key={condition._id}>
                      <TableCell>{condition.condition}</TableCell>
                      <TableCell>{formatDate(condition.diagnosedDate)}</TableCell>
                      <TableCell>{condition.severity}</TableCell>
                      <TableCell>{condition.status}</TableCell>
                      <TableCell>{condition.treatingProvider}</TableCell>
                      <TableCell>{condition.managementPlan}</TableCell>
                      <TableCell>{condition.notes}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Alert severity="info">No chronic conditions recorded for this patient.</Alert>
          )}
        </TabPanel>
        
        {/* Immunizations Tab */}
        <TabPanel value={tabValue} index={4}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h6">Immunization Records</Typography>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={handleOpenImmunizationModal}
            >
              Add Immunization
            </Button>
          </Box>
          
          {immunizations.length > 0 ? (
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Vaccine</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Administrator</TableCell>
                    <TableCell>Facility</TableCell>
                    <TableCell>Batch Number</TableCell>
                    <TableCell>Next Dose Due</TableCell>
                    <TableCell>Notes</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {immunizations.map((immunization) => (
                    <TableRow key={immunization._id}>
                      <TableCell>{immunization.vaccine}</TableCell>
                      <TableCell>{formatDate(immunization.date)}</TableCell>
                      <TableCell>{immunization.administrator}</TableCell>
                      <TableCell>{immunization.facility}</TableCell>
                      <TableCell>{immunization.batchNumber}</TableCell>
                      <TableCell>{immunization.nextDoseDate ? formatDate(immunization.nextDoseDate) : 'N/A'}</TableCell>
                      <TableCell>{immunization.notes}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Alert severity="info">No immunization records found for this patient.</Alert>
          )}
        </TabPanel>
      </Box>
      
      {/* Add Vital Record Modal */}
      <Dialog open={vitalModalOpen} onClose={handleCloseVitalModal}>
        <DialogTitle>Add Vital Record</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleVitalSubmit} sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Vital Type</InputLabel>
                  <Select
                    name="vitalType"
                    value={vitalForm.vitalType}
                    label="Vital Type"
                    onChange={(e) => {
                      const vitalType = e.target.value;
                      // Update unit based on vital type
                      let unit = '';
                      switch(vitalType) {
                        case 'bloodPressure':
                          unit = 'mmHg';
                          break;
                        case 'heartRate':
                          unit = 'bpm';
                          break;
                        case 'bloodSugar':
                          unit = 'mg/dL';
                          break;
                        case 'weight':
                          unit = 'kg';
                          break;
                        case 'cholesterol':
                          unit = 'mg/dL';
                          break;
                        case 'temperature':
                          unit = '°C';
                          break;
                        case 'oxygenSaturation':
                          unit = '%';
                          break;
                        default:
                          unit = '';
                      }
                      setVitalForm(prev => ({ 
                        ...prev, 
                        vitalType, 
                        unit 
                      }));
                    }}
                  >
                    <MenuItem value="bloodPressure">Blood Pressure</MenuItem>
                    <MenuItem value="heartRate">Heart Rate</MenuItem>
                    <MenuItem value="bloodSugar">Blood Sugar</MenuItem>
                    <MenuItem value="weight">Weight</MenuItem>
                    <MenuItem value="cholesterol">Cholesterol</MenuItem>
                    <MenuItem value="temperature">Temperature</MenuItem>
                    <MenuItem value="oxygenSaturation">Oxygen Saturation</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              {/* Unit field */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Unit</InputLabel>
                  <Select
                    name="unit"
                    value={vitalForm.unit}
                    label="Unit"
                    onChange={handleVitalFormChange}
                    required
                  >
                    {vitalForm.vitalType === 'bloodPressure' && <MenuItem value="mmHg">mmHg</MenuItem>}
                    {vitalForm.vitalType === 'heartRate' && <MenuItem value="bpm">bpm</MenuItem>}
                    {vitalForm.vitalType === 'bloodSugar' && (
                      <>
                        <MenuItem value="mg/dL">mg/dL</MenuItem>
                        <MenuItem value="mmol/L">mmol/L</MenuItem>
                      </>
                    )}
                    {vitalForm.vitalType === 'weight' && (
                      <>
                        <MenuItem value="kg">kg</MenuItem>
                        <MenuItem value="lbs">lbs</MenuItem>
                      </>
                    )}
                    {vitalForm.vitalType === 'cholesterol' && <MenuItem value="mg/dL">mg/dL</MenuItem>}
                    {vitalForm.vitalType === 'temperature' && (
                      <>
                        <MenuItem value="°C">°C</MenuItem>
                        <MenuItem value="°F">°F</MenuItem>
                      </>
                    )}
                    {vitalForm.vitalType === 'oxygenSaturation' && <MenuItem value="%">%</MenuItem>}
                  </Select>
                </FormControl>
              </Grid>
              
              {vitalForm.vitalType === 'bloodPressure' && (
                <>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      name="systolic"
                      label="Systolic (mmHg)"
                      type="number"
                      value={vitalForm.systolic}
                      onChange={handleVitalFormChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      name="diastolic"
                      label="Diastolic (mmHg)"
                      type="number"
                      value={vitalForm.diastolic}
                      onChange={handleVitalFormChange}
                      required
                    />
                  </Grid>
                </>
              )}
              
              {vitalForm.vitalType !== 'bloodPressure' && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    name="value"
                    label={`Value ${
                      vitalForm.vitalType === 'heartRate' ? '(bpm)' :
                      vitalForm.vitalType === 'bloodSugar' ? '(mg/dL)' :
                      vitalForm.vitalType === 'weight' ? '(kg)' :
                      vitalForm.vitalType === 'cholesterol' ? '(mg/dL)' : ''
                    }`}
                    type="number"
                    value={vitalForm.value}
                    onChange={handleVitalFormChange}
                    required
                  />
                </Grid>
              )}
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="date"
                  label="Date"
                  type="date"
                  value={vitalForm.date}
                  onChange={handleVitalFormChange}
                  required
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="notes"
                  label="Notes"
                  multiline
                  rows={2}
                  value={vitalForm.notes}
                  onChange={handleVitalFormChange}
                />
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button onClick={handleCloseVitalModal} sx={{ mr: 1 }}>
                Cancel
              </Button>
              <Button type="submit" variant="contained">
                Save Record
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
      
      {/* Add Allergy Modal */}
      <Dialog open={allergyModalOpen} onClose={handleCloseAllergyModal}>
        <DialogTitle>Add Allergy</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleAllergySubmit} sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="allergen"
                  label="Allergen"
                  value={allergyForm.allergen}
                  onChange={handleAllergyFormChange}
                  required
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="reaction"
                  label="Reaction"
                  value={allergyForm.reaction}
                  onChange={handleAllergyFormChange}
                  required
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Severity</InputLabel>
                  <Select
                    name="severity"
                    value={allergyForm.severity}
                    label="Severity"
                    onChange={handleAllergyFormChange}
                  >
                    <MenuItem value="Mild">Mild</MenuItem>
                    <MenuItem value="Moderate">Moderate</MenuItem>
                    <MenuItem value="Severe">Severe</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="dateIdentified"
                  label="Date Identified"
                  type="date"
                  value={allergyForm.dateIdentified}
                  onChange={handleAllergyFormChange}
                  required
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="notes"
                  label="Notes"
                  multiline
                  rows={2}
                  value={allergyForm.notes}
                  onChange={handleAllergyFormChange}
                />
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button onClick={handleCloseAllergyModal} sx={{ mr: 1 }}>
                Cancel
              </Button>
              <Button type="submit" variant="contained">
                Save Allergy
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
      
      {/* Add Medical History Modal */}
      <Dialog open={medicalHistoryModalOpen} onClose={handleCloseMedicalHistoryModal}>
        <DialogTitle>Add Medical Record</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleMedicalHistorySubmit} sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="diagnosis"
                  label="Diagnosis"
                  value={medicalHistoryForm.diagnosis}
                  onChange={handleMedicalHistoryFormChange}
                  required
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="provider"
                  label="Provider/Doctor"
                  value={medicalHistoryForm.provider}
                  onChange={handleMedicalHistoryFormChange}
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={medicalHistoryForm.status}
                    label="Status"
                    onChange={handleMedicalHistoryFormChange}
                  >
                    <MenuItem value="Active">Active</MenuItem>
                    <MenuItem value="Resolved">Resolved</MenuItem>
                    <MenuItem value="Monitoring">Monitoring</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="date"
                  label="Date"
                  type="date"
                  value={medicalHistoryForm.date}
                  onChange={handleMedicalHistoryFormChange}
                  required
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="notes"
                  label="Notes"
                  multiline
                  rows={3}
                  value={medicalHistoryForm.notes}
                  onChange={handleMedicalHistoryFormChange}
                />
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button onClick={handleCloseMedicalHistoryModal} sx={{ mr: 1 }}>
                Cancel
              </Button>
              <Button type="submit" variant="contained">
                Save Record
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
      
      {/* Add Chronic Condition Modal */}
      <Dialog open={chronicConditionModalOpen} onClose={handleCloseChronicConditionModal}>
        <DialogTitle>Add Chronic Condition</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleChronicConditionSubmit} sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="condition"
                  label="Condition"
                  value={chronicConditionForm.condition}
                  onChange={handleChronicConditionFormChange}
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="diagnosedDate"
                  label="Diagnosis Date"
                  type="date"
                  value={chronicConditionForm.diagnosedDate}
                  onChange={handleChronicConditionFormChange}
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Severity</InputLabel>
                  <Select
                    name="severity"
                    value={chronicConditionForm.severity}
                    label="Severity"
                    onChange={handleChronicConditionFormChange}
                  >
                    <MenuItem value="Mild">Mild</MenuItem>
                    <MenuItem value="Moderate">Moderate</MenuItem>
                    <MenuItem value="Severe">Severe</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="status"
                  label="Status"
                  value={chronicConditionForm.status}
                  onChange={handleChronicConditionFormChange}
                  required
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="treatingProvider"
                  label="Treating Provider"
                  value={chronicConditionForm.treatingProvider}
                  onChange={handleChronicConditionFormChange}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="managementPlan"
                  label="Management Plan"
                  multiline
                  rows={2}
                  value={chronicConditionForm.managementPlan}
                  onChange={handleChronicConditionFormChange}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="notes"
                  label="Notes"
                  multiline
                  rows={2}
                  value={chronicConditionForm.notes}
                  onChange={handleChronicConditionFormChange}
                />
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button onClick={handleCloseChronicConditionModal} sx={{ mr: 1 }}>
                Cancel
              </Button>
              <Button type="submit" variant="contained">
                Save Condition
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
      
      {/* Add Immunization Modal */}
      <Dialog open={immunizationModalOpen} onClose={handleCloseImmunizationModal}>
        <DialogTitle>Add Immunization Record</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleImmunizationSubmit} sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="vaccine"
                  label="Vaccine"
                  value={immunizationForm.vaccine}
                  onChange={handleImmunizationFormChange}
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="date"
                  label="Administration Date"
                  type="date"
                  value={immunizationForm.date}
                  onChange={handleImmunizationFormChange}
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="administrator"
                  label="Administrator"
                  value={immunizationForm.administrator}
                  onChange={handleImmunizationFormChange}
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="facility"
                  label="Facility"
                  value={immunizationForm.facility}
                  onChange={handleImmunizationFormChange}
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="batchNumber"
                  label="Batch Number"
                  value={immunizationForm.batchNumber}
                  onChange={handleImmunizationFormChange}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="nextDoseDate"
                  label="Next Dose Date (if applicable)"
                  type="date"
                  value={immunizationForm.nextDoseDate}
                  onChange={handleImmunizationFormChange}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="notes"
                  label="Notes"
                  multiline
                  rows={2}
                  value={immunizationForm.notes}
                  onChange={handleImmunizationFormChange}
                />
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button onClick={handleCloseImmunizationModal} sx={{ mr: 1 }}>
                Cancel
              </Button>
              <Button type="submit" variant="contained">
                Save Immunization
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default PatientDetailsView;