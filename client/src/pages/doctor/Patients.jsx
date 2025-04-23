import React, { useState, useEffect } from 'react';
import { 
  Container, Grid, Paper, Typography, TextField, Button, 
  Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, TablePagination, IconButton, Box, Divider,
  Dialog, DialogActions, DialogContent, DialogTitle,
  Tabs, Tab, CircularProgress, Alert, Tooltip
} from '@mui/material';
import { 
  Search as SearchIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  VisibilityOutlined as ViewIcon
} from '@mui/icons-material';
import { getPatients, deletePatient } from '../../services/patientManagementService';
import PatientDetailsView from '../../components/doctor/PatientDetailsView';

const Patients = () => {
  // State for patient list and pagination
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  // State for modal dialogs
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState(null);

  // Fetch patients on component mount and when search/pagination changes
  useEffect(() => {
    fetchPatients();
  }, [page, rowsPerPage, searchTerm]);

  // Function to fetch patients from API
  const fetchPatients = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await getPatients(page + 1, rowsPerPage, searchTerm);
      setPatients(response.data);
      setTotalCount(response.totalResults);
    } catch (err) {
      console.error('Failed to fetch patients:', err);
      setError('Failed to load patients. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Search handler
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(0); // Reset to first page on new search
  };

  // Modal handlers
  const handleViewPatient = (patient) => {
    setSelectedPatient(patient);
    setIsDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setIsDetailsOpen(false);
    setSelectedPatient(null);
  };

  const handleDeleteConfirm = (patient) => {
    setPatientToDelete(patient);
    setIsConfirmDeleteOpen(true);
  };

  const handleDeleteCancel = () => {
    setIsConfirmDeleteOpen(false);
    setPatientToDelete(null);
  };

  const handleDeletePatient = async () => {
    if (!patientToDelete) return;
    
    setLoading(true);
    try {
      await deletePatient(patientToDelete._id);
      fetchPatients();
      setIsConfirmDeleteOpen(false);
      setPatientToDelete(null);
    } catch (err) {
      console.error('Error deleting patient:', err);
      setError('Failed to delete patient. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Patient Management Header */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h5" component="h1" gutterBottom>
              Patient Management
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button 
                variant="outlined" 
                startIcon={<RefreshIcon />}
                onClick={fetchPatients}
              >
                Refresh
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Search and Filter Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Box sx={{ display: 'flex', flex: 1, alignItems: 'center' }}>
                <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <TextField
                  variant="outlined"
                  size="small"
                  placeholder="Search patients by name..."
                  fullWidth
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Patients Table */}
        <Grid item xs={12}>
          <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            <TableContainer sx={{ maxHeight: 440 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Blood Type</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                        <CircularProgress size={40} />
                      </TableCell>
                    </TableRow>
                  ) : patients.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                        <Typography variant="body1">
                          {searchTerm ? 'No patients match your search criteria' : 'No patients found'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    patients.map((patient) => (
                      <TableRow hover key={patient._id}>
                        <TableCell>{patient.user?.name}</TableCell>
                        <TableCell>{patient.user?.email}</TableCell>
                        <TableCell>{patient.user?.phoneNumber}</TableCell>
                        <TableCell>{patient.bloodType}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex' }}>
                            <Tooltip title="View Patient Details">
                              <IconButton 
                                size="small" 
                                onClick={() => handleViewPatient(patient)}
                                color="primary"
                              >
                                <ViewIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Patient">
                              <IconButton 
                                size="small" 
                                onClick={() => handleDeleteConfirm(patient)}
                                color="error"
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={totalCount}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Paper>
        </Grid>
      </Grid>

      {/* Patient Details Dialog */}
      <Dialog 
        open={isDetailsOpen} 
        onClose={handleCloseDetails}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Patient Details</DialogTitle>
        <DialogContent dividers>
          {selectedPatient && <PatientDetailsView patientId={selectedPatient._id} />}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetails}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <Dialog
        open={isConfirmDeleteOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {patientToDelete?.user?.name}'s record? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeletePatient} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Patients;