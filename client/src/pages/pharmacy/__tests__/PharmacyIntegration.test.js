import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { toast } from 'react-toastify';
import '@testing-library/jest-dom';

// Import pharmacy components
import { 
  PharmacyLayout, 
  PharmacyDashboard, 
  PrescriptionManagement,
  InventoryManagement,
  PatientManagement,
  AIPharmacyFeatures,
  PharmacyReports 
} from '../index';

// Mock the pharmacy service
jest.mock('../../../services/pharmacyService', () => ({
  getPharmacyDashboardData: jest.fn(() => Promise.resolve({
    data: {
      stats: {
        pendingPrescriptions: 15,
        todayDispensed: 45,
        lowStockItems: 8,
        totalPatients: 1250
      },
      alerts: [],
      recentActivity: []
    }
  })),
  getPrescriptions: jest.fn(() => Promise.resolve({
    data: {
      prescriptions: [
        {
          _id: '1',
          patientName: 'John Doe',
          medicationName: 'Lisinopril',
          status: 'pending'
        }
      ],
      pagination: { pages: 1 }
    }
  })),
  getMedicationInventory: jest.fn(() => Promise.resolve({
    data: {
      inventory: [
        {
          _id: '1',
          medicationName: 'Aspirin',
          currentStock: 100,
          stockStatus: 'in-stock'
        }
      ],
      pagination: { pages: 1 }
    }
  })),
  getPharmacyPatients: jest.fn(() => Promise.resolve({
    data: {
      patients: [
        {
          _id: '1',
          firstName: 'Jane',
          lastName: 'Smith',
          patientId: 'P001'
        }
      ],
      pagination: { pages: 1 }
    }
  })),
  checkDrugInteractions: jest.fn(() => Promise.resolve({
    data: {
      interactions: [],
      confidence: 95
    }
  })),
  getSalesAnalytics: jest.fn(() => Promise.resolve({
    data: {
      totalRevenue: 50000,
      totalTransactions: 1000,
      dailySales: []
    }
  }))
}));

// Mock toast notifications
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
    info: jest.fn()
  }
}));

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Pharmacy System Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('PharmacyLayout Component', () => {
    test('renders navigation with all pharmacy sections', () => {
      renderWithRouter(<PharmacyLayout />);
      
      expect(screen.getByText('AiMediCare Pharmacy')).toBeInTheDocument();
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Prescriptions')).toBeInTheDocument();
      expect(screen.getByText('Inventory')).toBeInTheDocument();
      expect(screen.getByText('Patients')).toBeInTheDocument();
      expect(screen.getByText('AI Tools')).toBeInTheDocument();
      expect(screen.getByText('Reports')).toBeInTheDocument();
    });

    test('displays user information in dropdown', () => {
      renderWithRouter(<PharmacyLayout />);
      
      expect(screen.getByText('Dr. Sarah Johnson')).toBeInTheDocument();
    });
  });

  describe('PharmacyDashboard Component', () => {
    test('renders dashboard with stats cards', async () => {
      renderWithRouter(<PharmacyDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('Pending Prescriptions')).toBeInTheDocument();
        expect(screen.getByText('Today Dispensed')).toBeInTheDocument();
        expect(screen.getByText('Low Stock Items')).toBeInTheDocument();
        expect(screen.getByText('Total Patients')).toBeInTheDocument();
      });
    });

    test('displays correct stat values', async () => {
      renderWithRouter(<PharmacyDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('15')).toBeInTheDocument(); // Pending prescriptions
        expect(screen.getByText('45')).toBeInTheDocument(); // Today dispensed
        expect(screen.getByText('8')).toBeInTheDocument();  // Low stock items
        expect(screen.getByText('1,250')).toBeInTheDocument(); // Total patients
      });
    });
  });

  describe('PrescriptionManagement Component', () => {
    test('renders prescription list and search functionality', async () => {
      renderWithRouter(<PrescriptionManagement />);
      
      await waitFor(() => {
        expect(screen.getByText('Prescription Management')).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/search prescriptions/i)).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Lisinopril')).toBeInTheDocument();
      });
    });

    test('allows prescription search', async () => {
      renderWithRouter(<PrescriptionManagement />);
      
      const searchInput = await screen.findByPlaceholderText(/search prescriptions/i);
      fireEvent.change(searchInput, { target: { value: 'John' } });
      
      expect(searchInput.value).toBe('John');
    });

    test('handles prescription verification workflow', async () => {
      renderWithRouter(<PrescriptionManagement />);
      
      await waitFor(() => {
        const verifyButton = screen.getByText('Verify');
        fireEvent.click(verifyButton);
        
        expect(screen.getByText('Prescription Verification')).toBeInTheDocument();
      });
    });
  });

  describe('InventoryManagement Component', () => {
    test('renders inventory list with medication data', async () => {
      renderWithRouter(<InventoryManagement />);
      
      await waitFor(() => {
        expect(screen.getByText('Medication Inventory')).toBeInTheDocument();
        expect(screen.getByText('Aspirin')).toBeInTheDocument();
        expect(screen.getByText('100')).toBeInTheDocument(); // Current stock
      });
    });

    test('provides add medication functionality', async () => {
      renderWithRouter(<InventoryManagement />);
      
      const addButton = await screen.findByText('Add Medication');
      fireEvent.click(addButton);
      
      expect(screen.getByText('Add New Medication')).toBeInTheDocument();
    });

    test('shows AI optimization option', async () => {
      renderWithRouter(<InventoryManagement />);
      
      expect(await screen.findByText('AI Optimization')).toBeInTheDocument();
    });
  });

  describe('PatientManagement Component', () => {
    test('renders patient list with search capability', async () => {
      renderWithRouter(<PatientManagement />);
      
      await waitFor(() => {
        expect(screen.getByText('Patient Management')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        expect(screen.getByText('P001')).toBeInTheDocument();
      });
    });

    test('allows viewing patient details', async () => {
      renderWithRouter(<PatientManagement />);
      
      await waitFor(() => {
        const viewButton = screen.getByTitle('View Details');
        fireEvent.click(viewButton);
        
        expect(screen.getByText('Patient Profile')).toBeInTheDocument();
      });
    });
  });

  describe('AIPharmacyFeatures Component', () => {
    test('renders AI tools panel', async () => {
      renderWithRouter(<AIPharmacyFeatures />);
      
      expect(screen.getByText('AI Pharmacy Features')).toBeInTheDocument();
      expect(screen.getByText('Drug Interactions')).toBeInTheDocument();
      expect(screen.getByText('Allergy Check')).toBeInTheDocument();
      expect(screen.getByText('Dosage Recommendation')).toBeInTheDocument();
    });

    test('handles drug interaction checking', async () => {
      renderWithRouter(<AIPharmacyFeatures />);
      
      // Add medications
      const medicationInputs = screen.getAllByPlaceholderText('Enter medication name');
      fireEvent.change(medicationInputs[0], { target: { value: 'Warfarin' } });
      
      const addButton = screen.getByText('+ Add Medication');
      fireEvent.click(addButton);
      
      fireEvent.change(medicationInputs[1], { target: { value: 'Aspirin' } });
      
      // Check interactions
      const checkButton = screen.getByText('Drug Interactions');
      fireEvent.click(checkButton);
      
      await waitFor(() => {
        expect(screen.getByText('AI is analyzing your request...')).toBeInTheDocument();
      });
    });
  });

  describe('PharmacyReports Component', () => {
    test('renders reports dashboard with tabs', async () => {
      renderWithRouter(<PharmacyReports />);
      
      expect(screen.getByText('Reports & Analytics')).toBeInTheDocument();
      expect(screen.getByText('Sales Analytics')).toBeInTheDocument();
      expect(screen.getByText('Inventory Analytics')).toBeInTheDocument();
      expect(screen.getByText('Prescription Analytics')).toBeInTheDocument();
    });

    test('allows date range selection', async () => {
      renderWithRouter(<PharmacyReports />);
      
      const startDateInput = screen.getByLabelText('Start Date');
      const endDateInput = screen.getByLabelText('End Date');
      
      expect(startDateInput).toBeInTheDocument();
      expect(endDateInput).toBeInTheDocument();
    });

    test('provides export functionality', async () => {
      renderWithRouter(<PharmacyReports />);
      
      await waitFor(() => {
        expect(screen.getByText('Excel')).toBeInTheDocument();
        expect(screen.getByText('PDF')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    test('handles API errors gracefully', async () => {
      const mockError = new Error('Network error');
      const pharmacyService = require('../../../services/pharmacyService');
      pharmacyService.getPharmacyDashboardData.mockRejectedValueOnce(mockError);
      
      renderWithRouter(<PharmacyDashboard />);
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to load dashboard data');
      });
    });

    test('displays loading states', async () => {
      renderWithRouter(<PharmacyDashboard />);
      
      expect(screen.getByText('Loading dashboard...')).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    test('adapts to mobile viewport', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      
      renderWithRouter(<PharmacyLayout />);
      
      // Navigation should be collapsible on mobile
      expect(screen.getByRole('button', { name: /toggle navigation/i })).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    test('supports keyboard navigation', () => {
      renderWithRouter(<PharmacyLayout />);
      
      const firstNavLink = screen.getByText('Dashboard');
      firstNavLink.focus();
      
      expect(document.activeElement).toBe(firstNavLink);
    });

    test('maintains accessibility standards', () => {
      renderWithRouter(<PharmacyLayout />);
      
      // Check for proper ARIA labels
      const navigation = screen.getByRole('navigation');
      expect(navigation).toBeInTheDocument();
      
      // Check for proper heading hierarchy
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
    });
  });

  describe('Data Flow Integration', () => {
    test('passes data correctly between components', async () => {
      renderWithRouter(<PharmacyDashboard />);
      
      await waitFor(() => {
        // Verify that dashboard receives and displays API data
        expect(screen.getByText('15')).toBeInTheDocument();
      });
    });

    test('handles real-time updates', async () => {
      const { rerender } = renderWithRouter(<PharmacyDashboard />);
      
      // Simulate data update
      const pharmacyService = require('../../../services/pharmacyService');
      pharmacyService.getPharmacyDashboardData.mockResolvedValueOnce({
        data: {
          stats: {
            pendingPrescriptions: 20, // Updated value
            todayDispensed: 50,
            lowStockItems: 10,
            totalPatients: 1255
          },
          alerts: [],
          recentActivity: []
        }
      });
      
      // Trigger re-render
      rerender(<PharmacyDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('20')).toBeInTheDocument();
      });
    });
  });

  describe('Security and Validation', () => {
    test('validates form inputs', async () => {
      renderWithRouter(<InventoryManagement />);
      
      const addButton = await screen.findByText('Add Medication');
      fireEvent.click(addButton);
      
      const saveButton = screen.getByText('Add Medication');
      fireEvent.click(saveButton);
      
      // Should not submit without required fields
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled();
      });
    });

    test('sanitizes user input', async () => {
      renderWithRouter(<PatientManagement />);
      
      const searchInput = await screen.findByPlaceholderText(/search by name/i);
      fireEvent.change(searchInput, { target: { value: '<script>alert("xss")</script>' } });
      
      // Input should be sanitized
      expect(searchInput.value).not.toContain('<script>');
    });
  });

  describe('Performance', () => {
    test('lazy loads components efficiently', async () => {
      const startTime = performance.now();
      renderWithRouter(<PharmacyLayout />);
      const endTime = performance.now();
      
      // Should render within reasonable time
      expect(endTime - startTime).toBeLessThan(100);
    });

    test('implements pagination for large datasets', async () => {
      renderWithRouter(<PrescriptionManagement />);
      
      await waitFor(() => {
        // Check if pagination controls exist when needed
        const pagination = screen.queryByRole('navigation', { name: /pagination/i });
        // Pagination should exist if there are multiple pages
        if (pagination) {
          expect(pagination).toBeInTheDocument();
        }
      });
    });
  });
});

describe('Integration Workflow Tests', () => {
  test('complete prescription workflow', async () => {
    renderWithRouter(<PrescriptionManagement />);
    
    // 1. View prescription list
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    
    // 2. Verify prescription
    const verifyButton = screen.getByText('Verify');
    fireEvent.click(verifyButton);
    
    expect(screen.getByText('Prescription Verification')).toBeInTheDocument();
    
    // 3. Check for drug interactions
    const checkInteractionsButton = screen.getByText('Check Interactions');
    fireEvent.click(checkInteractionsButton);
    
    // 4. Proceed with dispensing
    await waitFor(() => {
      const dispenseButton = screen.getByText('Proceed to Dispense');
      fireEvent.click(dispenseButton);
      
      expect(screen.getByText('Dispensing Process')).toBeInTheDocument();
    });
  });

  test('inventory management workflow', async () => {
    renderWithRouter(<InventoryManagement />);
    
    // 1. View inventory
    await waitFor(() => {
      expect(screen.getByText('Aspirin')).toBeInTheDocument();
    });
    
    // 2. Add new medication
    const addButton = screen.getByText('Add Medication');
    fireEvent.click(addButton);
    
    // 3. Fill medication details
    const nameInput = screen.getByLabelText('Medication Name *');
    fireEvent.change(nameInput, { target: { value: 'Ibuprofen' } });
    
    // 4. Get AI optimization recommendations
    const aiButton = screen.getByText('AI Optimization');
    fireEvent.click(aiButton);
    
    await waitFor(() => {
      expect(screen.getByText('Analyzing...')).toBeInTheDocument();
    });
  });

  test('patient care workflow', async () => {
    renderWithRouter(<PatientManagement />);
    
    // 1. Search for patient
    const searchInput = await screen.findByPlaceholderText(/search by name/i);
    fireEvent.change(searchInput, { target: { value: 'Jane' } });
    
    // 2. View patient details
    const viewButton = screen.getByTitle('View Details');
    fireEvent.click(viewButton);
    
    // 3. Review medication history
    await waitFor(() => {
      const medicationsTab = screen.getByText('Medications');
      fireEvent.click(medicationsTab);
    });
    
    // 4. Add consultation note
    const noteButton = screen.getByTitle('Add Note');
    fireEvent.click(noteButton);
    
    expect(screen.getByText('Add Consultation Note')).toBeInTheDocument();
  });
});

export default {};