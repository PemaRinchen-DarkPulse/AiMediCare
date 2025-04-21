import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Nav, NavItem, NavLink, TabContent, TabPane, Alert, Spinner } from 'reactstrap';
import PrescriptionGrid from '../../components/prescriptions/PrescriptionGrid';
import PrescriptionDetail from '../../components/prescriptions/PrescriptionDetail';
import PrescriptionHistory from '../../components/prescriptions/PrescriptionHistory';
import PrescriptionReminder from '../../components/prescriptions/PrescriptionReminder';
import AdherenceProgressBar from '../../components/prescriptions/AdherenceProgressBar';
import MedicalInfoCard from '../../components/patient/MedicalInfoCard';
import { getPatientPrescriptions, getPrescriptionHistory, updateAdherenceStatus, requestRefill } from '../../services/prescriptionService';

const MedicationDashboard = () => {
  const [activeTab, setActiveTab] = useState('current');
  const [selectedMedication, setSelectedMedication] = useState(null);
  const [medications, setMedications] = useState({
    current: [],
    past: [],
    upcoming: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adherenceStats, setAdherenceStats] = useState({
    overall: 0,
    weekly: 0,
    monthly: 0
  });

  // Fetch medications on component mount
  useEffect(() => {
    const fetchMedications = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get all prescriptions
        const prescriptions = await getPatientPrescriptions();
        
        // Filter medications by status
        const current = prescriptions.filter(med => med.status === 'active');
        const past = prescriptions.filter(med => med.status === 'completed' || med.status === 'discontinued');
        const upcoming = prescriptions.filter(med => med.status === 'scheduled');
        
        // Get prescription history for adherence calculation
        const history = await getPrescriptionHistory();
        
        // Calculate adherence statistics
        const calculateAdherence = (data, period = null) => {
          if (!data || data.length === 0) return 0;
          
          const now = new Date();
          const totalDoses = data.reduce((total, record) => {
            // Filter by period if specified
            if (period) {
              const recordDate = new Date(record.date);
              if (period === 'weekly' && (now - recordDate > 7 * 24 * 60 * 60 * 1000)) {
                return total;
              }
              if (period === 'monthly' && (now - recordDate > 30 * 24 * 60 * 60 * 1000)) {
                return total;
              }
            }
            
            return total + record.scheduledDoses;
          }, 0);
          
          const takenDoses = data.reduce((total, record) => {
            // Filter by period if specified
            if (period) {
              const recordDate = new Date(record.date);
              if (period === 'weekly' && (now - recordDate > 7 * 24 * 60 * 60 * 1000)) {
                return total;
              }
              if (period === 'monthly' && (now - recordDate > 30 * 24 * 60 * 60 * 1000)) {
                return total;
              }
            }
            
            return total + record.takenDoses;
          }, 0);
          
          return totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 0;
        };
        
        setAdherenceStats({
          overall: calculateAdherence(history),
          weekly: calculateAdherence(history, 'weekly'),
          monthly: calculateAdherence(history, 'monthly')
        });
        
        setMedications({
          current,
          past,
          upcoming
        });
        
        // Select first medication by default if available
        if (current.length > 0) {
          setSelectedMedication(current[0]);
        }
        
      } catch (err) {
        console.error('Error fetching medications:', err);
        setError('Failed to load medications. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchMedications();
  }, []);

  const handleMedicationSelect = (medication) => {
    setSelectedMedication(medication);
  };

  const handleAdherenceUpdate = async (medicationId, takenDoses, scheduledDoses, date) => {
    try {
      await updateAdherenceStatus(medicationId, { takenDoses, scheduledDoses, date });
      
      // Update adherence stats
      // In a real app, you'd refetch the data or update the state more precisely
      const updatedMedications = await getPatientPrescriptions();
      const current = updatedMedications.filter(med => med.status === 'active');
      
      setMedications(prev => ({
        ...prev,
        current
      }));
      
    } catch (err) {
      console.error('Error updating adherence:', err);
      setError('Failed to update medication adherence. Please try again.');
    }
  };

  const handleRefillRequest = async (medicationId) => {
    try {
      await requestRefill(medicationId);
      
      // Update medication status
      const updatedMedications = await getPatientPrescriptions();
      const current = updatedMedications.filter(med => med.status === 'active');
      
      setMedications(prev => ({
        ...prev,
        current
      }));
      
      // Update selected medication
      if (selectedMedication && selectedMedication.id === medicationId) {
        const updated = updatedMedications.find(med => med.id === medicationId);
        setSelectedMedication(updated);
      }
      
    } catch (err) {
      console.error('Error requesting refill:', err);
      setError('Failed to request medication refill. Please try again.');
    }
  };

  if (loading) {
    return (
      <Container className="d-flex flex-column align-items-center justify-content-center py-5">
        <Spinner color="primary" />
        <p className="mt-3">Loading your medications...</p>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <h1 className="mb-4">Medication Dashboard</h1>
      
      {error && (
        <Alert color="danger" className="mb-4">
          {error}
        </Alert>
      )}
      
      <Row>
        <Col lg="8">
          <Nav tabs className="mb-4">
            <NavItem>
              <NavLink
                className={`cursor-pointer ${activeTab === 'current' ? 'active' : ''}`}
                onClick={() => setActiveTab('current')}
              >
                Current Medications ({medications.current.length})
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={`cursor-pointer ${activeTab === 'past' ? 'active' : ''}`}
                onClick={() => setActiveTab('past')}
              >
                Past Medications ({medications.past.length})
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={`cursor-pointer ${activeTab === 'upcoming' ? 'active' : ''}`}
                onClick={() => setActiveTab('upcoming')}
              >
                Upcoming Medications ({medications.upcoming.length})
              </NavLink>
            </NavItem>
          </Nav>
          
          <TabContent activeTab={activeTab}>
            <TabPane tabId="current">
              {medications.current.length > 0 ? (
                <PrescriptionGrid 
                  prescriptions={medications.current} 
                  onSelect={handleMedicationSelect}
                  selectedId={selectedMedication?.id}
                />
              ) : (
                <Alert color="info">
                  You have no current medications.
                </Alert>
              )}
            </TabPane>
            
            <TabPane tabId="past">
              {medications.past.length > 0 ? (
                <PrescriptionGrid 
                  prescriptions={medications.past} 
                  onSelect={handleMedicationSelect}
                  selectedId={selectedMedication?.id}
                />
              ) : (
                <Alert color="info">
                  You have no past medications.
                </Alert>
              )}
            </TabPane>
            
            <TabPane tabId="upcoming">
              {medications.upcoming.length > 0 ? (
                <PrescriptionGrid 
                  prescriptions={medications.upcoming} 
                  onSelect={handleMedicationSelect}
                  selectedId={selectedMedication?.id}
                />
              ) : (
                <Alert color="info">
                  You have no upcoming medications.
                </Alert>
              )}
            </TabPane>
          </TabContent>
          
          {selectedMedication && (
            <MedicalInfoCard 
              title="Medication Details" 
              icon={<i className="fas fa-pills"></i>}
              className="mt-4"
            >
              <PrescriptionDetail 
                prescription={selectedMedication} 
                onRefillRequest={handleRefillRequest}
              />
            </MedicalInfoCard>
          )}
        </Col>
        
        <Col lg="4">
          <MedicalInfoCard title="Adherence Overview" icon={<i className="fas fa-chart-line"></i>}>
            <h6>Overall Adherence</h6>
            <AdherenceProgressBar 
              percentage={adherenceStats.overall} 
              label={`${adherenceStats.overall}% Overall`}
            />
            
            <h6 className="mt-3">Weekly Adherence</h6>
            <AdherenceProgressBar 
              percentage={adherenceStats.weekly} 
              label={`${adherenceStats.weekly}% This Week`}
              color="info"
            />
            
            <h6 className="mt-3">Monthly Adherence</h6>
            <AdherenceProgressBar 
              percentage={adherenceStats.monthly} 
              label={`${adherenceStats.monthly}% This Month`}
              color="success"
            />
          </MedicalInfoCard>
          
          <MedicalInfoCard 
            title="Medication Reminders" 
            icon={<i className="fas fa-bell"></i>}
            className="mt-4"
          >
            {medications.current.length > 0 ? (
              <div>
                {medications.current.map((medication, index) => (
                  <PrescriptionReminder
                    key={index}
                    prescription={medication}
                    onAdherenceUpdate={(taken, scheduled, date) => 
                      handleAdherenceUpdate(medication.id, taken, scheduled, date)
                    }
                  />
                ))}
              </div>
            ) : (
              <p className="text-muted">No active medication reminders</p>
            )}
          </MedicalInfoCard>
          
          <MedicalInfoCard 
            title="Medication History" 
            icon={<i className="fas fa-history"></i>}
            className="mt-4"
          >
            {selectedMedication ? (
              <PrescriptionHistory prescriptionId={selectedMedication.id} />
            ) : (
              <p className="text-muted">Select a medication to view history</p>
            )}
          </MedicalInfoCard>
        </Col>
      </Row>
    </Container>
  );
};

export default MedicationDashboard;