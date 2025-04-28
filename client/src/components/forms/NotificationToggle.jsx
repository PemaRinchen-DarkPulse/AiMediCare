import React from 'react';
import { Form, FormGroup, Label, Input, Button, Alert, Spinner } from 'reactstrap';

const NotificationToggle = ({ preferences, onSubmit, loading, error, success }) => {
  const [formData, setFormData] = React.useState({
    appointmentReminders: preferences?.appointmentReminders !== undefined ? preferences.appointmentReminders : true,
    healthTips: preferences?.healthTips !== undefined ? preferences.healthTips : true,
    medicationReminders: preferences?.medicationReminders !== undefined ? preferences.medicationReminders : true
  });

  const handleChange = (e) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Form onSubmit={handleSubmit}>
      {error && <Alert color="danger">{error}</Alert>}
      {success && <Alert color="success">{success}</Alert>}
      
      <FormGroup check className="mb-3">
        <Input
          type="checkbox"
          name="appointmentReminders"
          id="appointmentReminders"
          checked={formData.appointmentReminders}
          onChange={handleChange}
        />
        <Label for="appointmentReminders" check>
          <strong>Appointment Reminders</strong>
          <p className="text-muted mb-0 small">
            Receive notifications about upcoming appointments, changes, or cancellations.
          </p>
        </Label>
      </FormGroup>
      
      <FormGroup check className="mb-3">
        <Input
          type="checkbox"
          name="healthTips"
          id="healthTips"
          checked={formData.healthTips}
          onChange={handleChange}
        />
        <Label for="healthTips" check>
          <strong>Health Tips & Newsletters</strong>
          <p className="text-muted mb-0 small">
            Receive periodic health tips, wellness updates, and newsletters.
          </p>
        </Label>
      </FormGroup>
      
      <FormGroup check className="mb-3">
        <Input
          type="checkbox"
          name="medicationReminders"
          id="medicationReminders"
          checked={formData.medicationReminders}
          onChange={handleChange}
        />
        <Label for="medicationReminders" check>
          <strong>Medication Reminders</strong>
          <p className="text-muted mb-0 small">
            Receive reminders to take your medications based on your prescription schedule.
          </p>
        </Label>
      </FormGroup>
      
      <div className="d-flex justify-content-end mt-4">
        <Button type="submit" color="primary" disabled={loading}>
          {loading ? <Spinner size="sm" className="me-2" /> : null}
          Save Notification Preferences
        </Button>
      </div>
    </Form>
  );
};

export default NotificationToggle;