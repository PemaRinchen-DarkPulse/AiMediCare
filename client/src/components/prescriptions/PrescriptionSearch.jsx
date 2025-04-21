import React, { useState } from 'react';
import { 
  InputGroup, Input, InputGroupText, Button, 
  Form, FormGroup, Label, Row, Col
} from 'reactstrap';
import PropTypes from 'prop-types';
import { FaSearch, FaFilter } from 'react-icons/fa';

const PrescriptionSearch = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    dateRange: 'all',
    doctor: 'all'
  });

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (filterName, value) => {
    setFilters({
      ...filters,
      [filterName]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({
      searchTerm,
      filters
    });
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  return (
    <div className="prescription-search mb-4">
      <Form onSubmit={handleSubmit}>
        <InputGroup className="mb-3">
          <Input
            placeholder="Search prescriptions..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <InputGroupText>
            <Button color="link" className="p-0 text-primary" onClick={toggleFilters}>
              <FaFilter />
            </Button>
          </InputGroupText>
          <Button color="primary">
            <FaSearch className="me-2" /> Search
          </Button>
        </InputGroup>

        {showFilters && (
          <div className="filter-section p-3 bg-light rounded mb-3">
            <Row>
              <Col md={4}>
                <FormGroup>
                  <Label for="status-filter" className="fw-bold">Status</Label>
                  <Input
                    type="select"
                    id="status-filter"
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="expired">Expired</option>
                    <option value="discontinued">Discontinued</option>
                  </Input>
                </FormGroup>
              </Col>
              <Col md={4}>
                <FormGroup>
                  <Label for="date-filter" className="fw-bold">Date Range</Label>
                  <Input
                    type="select"
                    id="date-filter"
                    value={filters.dateRange}
                    onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                  >
                    <option value="all">All Time</option>
                    <option value="last30">Last 30 Days</option>
                    <option value="last90">Last 90 Days</option>
                    <option value="last180">Last 6 Months</option>
                    <option value="last365">Last Year</option>
                  </Input>
                </FormGroup>
              </Col>
              <Col md={4}>
                <FormGroup>
                  <Label for="doctor-filter" className="fw-bold">Healthcare Provider</Label>
                  <Input
                    type="select"
                    id="doctor-filter"
                    value={filters.doctor}
                    onChange={(e) => handleFilterChange('doctor', e.target.value)}
                  >
                    <option value="all">All Providers</option>
                    <option value="dr-smith">Dr. Smith</option>
                    <option value="dr-wilson">Dr. Wilson</option>
                    <option value="dr-davis">Dr. Davis</option>
                  </Input>
                </FormGroup>
              </Col>
            </Row>
          </div>
        )}
      </Form>
    </div>
  );
};

PrescriptionSearch.propTypes = {
  onSearch: PropTypes.func.isRequired
};

export default PrescriptionSearch;