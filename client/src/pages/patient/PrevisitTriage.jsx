import React, { useState } from 'react';
import './PrevisitTriage.css';
import { FaUser, FaCalendarAlt, FaUserMd, FaExclamationTriangle, FaCamera, FaCheck } from 'react-icons/fa';
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from 'react-icons/md';

const PrevisitTriage = () => {
  const [expandedAppointment, setExpandedAppointment] = useState(null);
  const [formData, setFormData] = useState({
    glucoseReadings: '',
    symptomChanges: [],
    medicationAdherence: '',
    concerns: '',
    
    rashLocation: [],
    rashDuration: '',
    rashSeverity: '',
    rashImage: null,
    allergies: [],
    allergyOther: '',
    
    headacheDuration: '',
    headacheSeverity: '',
    headacheSymptoms: [],
    neurologicalSymptoms: false,
    visionChanges: false,
    additionalSymptoms: []
  });
  
  const [showUrgentQuestions, setShowUrgentQuestions] = useState(false);

  const toggleAppointment = (index) => {
    if (expandedAppointment === index) {
      setExpandedAppointment(null);
    } else {
      setExpandedAppointment(index);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      if (checked) {
        setFormData({
          ...formData,
          [name]: [...formData[name], value]
        });
      } else {
        setFormData({
          ...formData,
          [name]: formData[name].filter(item => item !== value)
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value
      });

      // Check for urgent symptoms that require additional questions
      if (name === 'headacheSymptoms' && 
          (value.includes('Worst headache ever') || 
           value.includes('Sudden onset'))) {
        setShowUrgentQuestions(true);
      }
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        rashImage: URL.createObjectURL(file)
      });
    }
  };

  const appointments = [
    {
      id: 1,
      date: "October 25, 2023",
      time: "10:00 AM",
      provider: "Dr. Sarah Johnson",
      type: "Diabetes Follow-up",
      department: "Endocrinology",
      medications: ["Metformin 1000mg twice daily", "Januvia 100mg once daily"],
      lastA1C: "7.2% (Measured 3 months ago)",
      urgent: false
    },
    {
      id: 2,
      date: "October 28, 2023",
      time: "2:30 PM",
      provider: "Dr. Michael Chen",
      type: "New Consultation - Skin Condition",
      department: "Dermatology",
      urgent: false
    },
    {
      id: 3,
      date: "October 23, 2023",
      time: "4:15 PM",
      provider: "Dr. Rebecca Taylor",
      type: "Urgent Consultation - Headache",
      department: "Neurology",
      urgent: true
    }
  ];

  return (
    <div className="pre-visit-container">
      <header className="header">
        <h1>Pre-Visit Questionnaires</h1>
        <p className="welcome-text">
          Welcome back, <strong>Maria Rodriguez</strong>. Please complete the following questionnaires
          before your upcoming appointments. This information will help your healthcare provider prepare
          for your visit.
        </p>
        <div className="notification">
          <strong>You have 3 upcoming appointments that require pre-visit information.</strong>
          <p>Please complete at least 2 hours before your scheduled appointment time.</p>
        </div>
      </header>

      <div className="appointments-container">
        {appointments.map((appointment, index) => (
          <div key={appointment.id} className={`appointment-card ${appointment.urgent ? 'urgent' : ''}`}>
            {appointment.urgent && (
              <div className="urgent-flag">
                <FaExclamationTriangle /> Priority Appointment
              </div>
            )}
            
            <div className="appointment-header" onClick={() => toggleAppointment(index)}>
              <div className="appointment-title">
                <h2>{appointment.type}</h2>
                <div className="appointment-details">
                  <span><FaCalendarAlt /> {appointment.date}, {appointment.time}</span>
                  <span><FaUserMd /> {appointment.provider}, {appointment.department}</span>
                </div>
              </div>
              <div className="toggle-icon">
                {expandedAppointment === index ? <MdKeyboardArrowUp /> : <MdKeyboardArrowDown />}
              </div>
            </div>
            
            {expandedAppointment === index && (
              <div className="questionnaire">
                {/* Questionnaire for Diabetes Follow-up */}
                {appointment.id === 1 && (
                  <form className="form-container">
                    <div className="ai-prefilled-section">
                      <h3>AI-Detected Information</h3>
                      <p>Based on your records, we've pre-filled some information. Please verify and update if needed.</p>
                      <div className="prefilled-item">
                        <label>Current Medications:</label>
                        <ul>
                          {appointment.medications.map((med, i) => (
                            <li key={i}>{med}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="prefilled-item">
                        <label>Last A1C Reading:</label>
                        <span>{appointment.lastA1C}</span>
                      </div>
                    </div>

                    <div className="form-section">
                      <h3>Recent Glucose Readings</h3>
                      <div className="form-group">
                        <label>Please enter your glucose readings from the past week (mg/dL):</label>
                        <textarea 
                          name="glucoseReadings" 
                          value={formData.glucoseReadings}
                          onChange={handleInputChange}
                          placeholder="Example: Morning: 120-140, Evening: 130-150"
                          rows="3"
                        ></textarea>
                      </div>
                    </div>

                    <div className="form-section">
                      <h3>Symptom Changes</h3>
                      <div className="form-group checkbox-group">
                        <label>Have you experienced any of the following since your last visit? (Check all that apply)</label>
                        <div className="checkbox-options">
                          <label>
                            <input 
                              type="checkbox" 
                              name="symptomChanges" 
                              value="Increased thirst"
                              checked={formData.symptomChanges.includes("Increased thirst")}
                              onChange={handleInputChange}
                            /> 
                            Increased thirst
                          </label>
                          <label>
                            <input 
                              type="checkbox" 
                              name="symptomChanges" 
                              value="Frequent urination" 
                              checked={formData.symptomChanges.includes("Frequent urination")}
                              onChange={handleInputChange}
                            /> 
                            Frequent urination
                          </label>
                          <label>
                            <input 
                              type="checkbox" 
                              name="symptomChanges" 
                              value="Blurred vision" 
                              checked={formData.symptomChanges.includes("Blurred vision")}
                              onChange={handleInputChange}
                            /> 
                            Blurred vision
                          </label>
                          <label>
                            <input 
                              type="checkbox" 
                              name="symptomChanges" 
                              value="Numbness/tingling in feet" 
                              checked={formData.symptomChanges.includes("Numbness/tingling in feet")}
                              onChange={handleInputChange}
                            /> 
                            Numbness/tingling in feet
                          </label>
                          <label>
                            <input 
                              type="checkbox" 
                              name="symptomChanges" 
                              value="Slow healing wounds" 
                              checked={formData.symptomChanges.includes("Slow healing wounds")}
                              onChange={handleInputChange}
                            /> 
                            Slow healing wounds
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="form-section">
                      <h3>Medication Adherence</h3>
                      <div className="form-group">
                        <label>How often have you taken your diabetes medications as prescribed?</label>
                        <div className="radio-options">
                          <label>
                            <input 
                              type="radio" 
                              name="medicationAdherence" 
                              value="Always (never missed)" 
                              checked={formData.medicationAdherence === "Always (never missed)"}
                              onChange={handleInputChange}
                            /> 
                            Always (never missed)
                          </label>
                          <label>
                            <input 
                              type="radio" 
                              name="medicationAdherence" 
                              value="Most of the time (missed 1-2 doses)" 
                              checked={formData.medicationAdherence === "Most of the time (missed 1-2 doses)"}
                              onChange={handleInputChange}
                            /> 
                            Most of the time (missed 1-2 doses)
                          </label>
                          <label>
                            <input 
                              type="radio" 
                              name="medicationAdherence" 
                              value="Sometimes (missed several doses)" 
                              checked={formData.medicationAdherence === "Sometimes (missed several doses)"}
                              onChange={handleInputChange}
                            /> 
                            Sometimes (missed several doses)
                          </label>
                          <label>
                            <input 
                              type="radio" 
                              name="medicationAdherence" 
                              value="Rarely (missed most doses)" 
                              checked={formData.medicationAdherence === "Rarely (missed most doses)"}
                              onChange={handleInputChange}
                            /> 
                            Rarely (missed most doses)
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="form-section">
                      <h3>Additional Concerns</h3>
                      <div className="form-group">
                        <label>Do you have any specific concerns or questions for the doctor?</label>
                        <textarea 
                          name="concerns" 
                          value={formData.concerns}
                          onChange={handleInputChange}
                          placeholder="Please describe any questions or concerns you want to discuss during your appointment"
                          rows="3"
                        ></textarea>
                      </div>
                    </div>

                    <button type="submit" className="submit-btn">Submit Questionnaire</button>
                  </form>
                )}

                {/* Questionnaire for Skin Rash Consultation */}
                {appointment.id === 2 && (
                  <form className="form-container">
                    <div className="form-section">
                      <h3>Skin Condition Details</h3>
                      <div className="form-group checkbox-group">
                        <label>Where is the rash or skin condition located? (Check all that apply)</label>
                        <div className="checkbox-options">
                          <label>
                            <input 
                              type="checkbox" 
                              name="rashLocation" 
                              value="Face"
                              checked={formData.rashLocation.includes("Face")}
                              onChange={handleInputChange}
                            /> 
                            Face
                          </label>
                          <label>
                            <input 
                              type="checkbox" 
                              name="rashLocation" 
                              value="Neck" 
                              checked={formData.rashLocation.includes("Neck")}
                              onChange={handleInputChange}
                            /> 
                            Neck
                          </label>
                          <label>
                            <input 
                              type="checkbox" 
                              name="rashLocation" 
                              value="Arms" 
                              checked={formData.rashLocation.includes("Arms")}
                              onChange={handleInputChange}
                            /> 
                            Arms
                          </label>
                          <label>
                            <input 
                              type="checkbox" 
                              name="rashLocation" 
                              value="Legs" 
                              checked={formData.rashLocation.includes("Legs")}
                              onChange={handleInputChange}
                            /> 
                            Legs
                          </label>
                          <label>
                            <input 
                              type="checkbox" 
                              name="rashLocation" 
                              value="Torso" 
                              checked={formData.rashLocation.includes("Torso")}
                              onChange={handleInputChange}
                            /> 
                            Torso
                          </label>
                          <label>
                            <input 
                              type="checkbox" 
                              name="rashLocation" 
                              value="Hands/Feet" 
                              checked={formData.rashLocation.includes("Hands/Feet")}
                              onChange={handleInputChange}
                            /> 
                            Hands/Feet
                          </label>
                        </div>
                      </div>

                      <div className="form-group">
                        <label>How long have you had this skin condition?</label>
                        <select 
                          name="rashDuration"
                          value={formData.rashDuration}
                          onChange={handleInputChange}
                        >
                          <option value="">Please select</option>
                          <option value="Less than 24 hours">Less than 24 hours</option>
                          <option value="1-3 days">1-3 days</option>
                          <option value="4-7 days">4-7 days</option>
                          <option value="1-2 weeks">1-2 weeks</option>
                          <option value="More than 2 weeks">More than 2 weeks</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>How severe are your symptoms? (1 = mild, 10 = severe)</label>
                        <div className="severity-scale">
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                            <label key={num} className="severity-option">
                              <input
                                type="radio"
                                name="rashSeverity"
                                value={num.toString()}
                                checked={formData.rashSeverity === num.toString()}
                                onChange={handleInputChange}
                              />
                              {num}
                            </label>
                          ))}
                        </div>
                        <div className="severity-labels">
                          <span>Mild</span>
                          <span>Severe</span>
                        </div>
                      </div>
                    </div>

                    <div className="form-section">
                      <h3>Upload Image</h3>
                      <div className="form-group">
                        <label>Please upload a clear image of the affected area (optional)</label>
                        <div className="image-upload">
                          <label className="upload-button">
                            <FaCamera /> Upload Image
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={handleImageUpload} 
                              style={{ display: 'none' }}
                            />
                          </label>
                          {formData.rashImage && (
                            <div className="image-preview">
                              <img src={formData.rashImage} alt="Uploaded skin condition" />
                              <span className="upload-success"><FaCheck /> Upload successful</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="form-section">
                      <h3>Potential Triggers</h3>
                      <div className="form-group checkbox-group">
                        <label>Do you have any known allergies or sensitivities? (Check all that apply)</label>
                        <div className="checkbox-options">
                          <label>
                            <input 
                              type="checkbox" 
                              name="allergies" 
                              value="Food allergies"
                              checked={formData.allergies.includes("Food allergies")}
                              onChange={handleInputChange}
                            /> 
                            Food allergies
                          </label>
                          <label>
                            <input 
                              type="checkbox" 
                              name="allergies" 
                              value="Medication allergies" 
                              checked={formData.allergies.includes("Medication allergies")}
                              onChange={handleInputChange}
                            /> 
                            Medication allergies
                          </label>
                          <label>
                            <input 
                              type="checkbox" 
                              name="allergies" 
                              value="Seasonal allergies" 
                              checked={formData.allergies.includes("Seasonal allergies")}
                              onChange={handleInputChange}
                            /> 
                            Seasonal allergies
                          </label>
                          <label>
                            <input 
                              type="checkbox" 
                              name="allergies" 
                              value="Contact dermatitis" 
                              checked={formData.allergies.includes("Contact dermatitis")}
                              onChange={handleInputChange}
                            /> 
                            Contact dermatitis (soaps, detergents, metals)
                          </label>
                          <label>
                            <input 
                              type="checkbox" 
                              name="allergies" 
                              value="Other" 
                              checked={formData.allergies.includes("Other")}
                              onChange={handleInputChange}
                            /> 
                            Other
                          </label>
                        </div>

                        {formData.allergies.includes("Other") && (
                          <div className="form-group">
                            <label>Please specify other allergies:</label>
                            <input
                              type="text"
                              name="allergyOther"
                              value={formData.allergyOther}
                              onChange={handleInputChange}
                              placeholder="Please describe other allergies"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <button type="submit" className="submit-btn">Submit Questionnaire</button>
                  </form>
                )}

                {/* Questionnaire for Urgent Headache Consultation */}
                {appointment.id === 3 && (
                  <form className="form-container">
                    <div className="urgent-notice">
                      <FaExclamationTriangle /> 
                      <div>
                        <h3>Urgent Appointment Notice</h3>
                        <p>This information will be immediately forwarded to your provider. If you experience severe symptoms, please seek emergency care.</p>
                      </div>
                    </div>

                    <div className="form-section">
                      <h3>Headache Assessment</h3>
                      <div className="form-group">
                        <label>How long have you been experiencing this headache?</label>
                        <select 
                          name="headacheDuration"
                          value={formData.headacheDuration}
                          onChange={handleInputChange}
                        >
                          <option value="">Please select</option>
                          <option value="Less than 24 hours">Less than 24 hours</option>
                          <option value="1-3 days">1-3 days</option>
                          <option value="4-7 days">4-7 days</option>
                          <option value="1-2 weeks">1-2 weeks</option>
                          <option value="More than 2 weeks">More than 2 weeks</option>
                          <option value="Recurring for months">Recurring for months</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>How severe is your headache? (1 = mild, 10 = worst pain imaginable)</label>
                        <div className="severity-scale">
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                            <label key={num} className="severity-option">
                              <input
                                type="radio"
                                name="headacheSeverity"
                                value={num.toString()}
                                checked={formData.headacheSeverity === num.toString()}
                                onChange={handleInputChange}
                              />
                              {num}
                            </label>
                          ))}
                        </div>
                        <div className="severity-labels">
                          <span>Mild</span>
                          <span>Severe</span>
                        </div>
                      </div>

                      <div className="form-group checkbox-group">
                        <label>Select all that apply to your headache:</label>
                        <div className="checkbox-options">
                          <label>
                            <input 
                              type="checkbox" 
                              name="headacheSymptoms" 
                              value="Pulsating/throbbing"
                              checked={formData.headacheSymptoms.includes("Pulsating/throbbing")}
                              onChange={handleInputChange}
                            /> 
                            Pulsating/throbbing
                          </label>
                          <label>
                            <input 
                              type="checkbox" 
                              name="headacheSymptoms" 
                              value="One-sided pain" 
                              checked={formData.headacheSymptoms.includes("One-sided pain")}
                              onChange={handleInputChange}
                            /> 
                            One-sided pain
                          </label>
                          <label className="urgent-option">
                            <input 
                              type="checkbox" 
                              name="headacheSymptoms" 
                              value="Worst headache ever" 
                              checked={formData.headacheSymptoms.includes("Worst headache ever")}
                              onChange={handleInputChange}
                            /> 
                            Worst headache ever experienced
                          </label>
                          <label className="urgent-option">
                            <input 
                              type="checkbox" 
                              name="headacheSymptoms" 
                              value="Sudden onset" 
                              checked={formData.headacheSymptoms.includes("Sudden onset")}
                              onChange={handleInputChange}
                            /> 
                            Sudden onset (seconds to minutes)
                          </label>
                          <label>
                            <input 
                              type="checkbox" 
                              name="headacheSymptoms" 
                              value="Sensitivity to light" 
                              checked={formData.headacheSymptoms.includes("Sensitivity to light")}
                              onChange={handleInputChange}
                            /> 
                            Sensitivity to light
                          </label>
                          <label>
                            <input 
                              type="checkbox" 
                              name="headacheSymptoms" 
                              value="Sensitivity to sound" 
                              checked={formData.headacheSymptoms.includes("Sensitivity to sound")}
                              onChange={handleInputChange}
                            /> 
                            Sensitivity to sound
                          </label>
                          <label>
                            <input 
                              type="checkbox" 
                              name="headacheSymptoms" 
                              value="Nausea/vomiting" 
                              checked={formData.headacheSymptoms.includes("Nausea/vomiting")}
                              onChange={handleInputChange}
                            /> 
                            Nausea/vomiting
                          </label>
                        </div>
                      </div>
                    </div>

                    {showUrgentQuestions && (
                      <div className="form-section urgent-section">
                        <div className="urgent-alert">
                          <FaExclamationTriangle />
                          <span>Based on your responses, we need additional information. These symptoms may require immediate attention.</span>
                        </div>
                        
                        <h3>Additional Questions</h3>
                        <div className="form-group">
                          <label>Have you experienced any neurological symptoms like confusion, difficulty speaking, or weakness on one side of the body?</label>
                          <div className="radio-options">
                            <label>
                              <input 
                                type="radio" 
                                name="neurologicalSymptoms" 
                                value="true" 
                                checked={formData.neurologicalSymptoms === true}
                                onChange={() => setFormData({...formData, neurologicalSymptoms: true})}
                              /> 
                              Yes
                            </label>
                            <label>
                              <input 
                                type="radio" 
                                name="neurologicalSymptoms" 
                                value="false" 
                                checked={formData.neurologicalSymptoms === false}
                                onChange={() => setFormData({...formData, neurologicalSymptoms: false})}
                              /> 
                              No
                            </label>
                          </div>
                        </div>

                        <div className="form-group">
                          <label>Have you noticed any changes in your vision (blurred vision, double vision, vision loss)?</label>
                          <div className="radio-options">
                            <label>
                              <input 
                                type="radio" 
                                name="visionChanges" 
                                value="true" 
                                checked={formData.visionChanges === true}
                                onChange={() => setFormData({...formData, visionChanges: true})}
                              /> 
                              Yes
                            </label>
                            <label>
                              <input 
                                type="radio" 
                                name="visionChanges" 
                                value="false" 
                                checked={formData.visionChanges === false}
                                onChange={() => setFormData({...formData, visionChanges: false})}
                              /> 
                              No
                            </label>
                          </div>
                        </div>

                        <div className="form-group checkbox-group">
                          <label>Have you experienced any of these additional symptoms? (Check all that apply)</label>
                          <div className="checkbox-options">
                            <label>
                              <input 
                                type="checkbox" 
                                name="additionalSymptoms" 
                                value="Fever"
                                checked={formData.additionalSymptoms.includes("Fever")}
                                onChange={handleInputChange}
                              /> 
                              Fever
                            </label>
                            <label>
                              <input 
                                type="checkbox" 
                                name="additionalSymptoms" 
                                value="Stiff neck" 
                                checked={formData.additionalSymptoms.includes("Stiff neck")}
                                onChange={handleInputChange}
                              /> 
                              Stiff neck
                            </label>
                            <label>
                              <input 
                                type="checkbox" 
                                name="additionalSymptoms" 
                                value="Seizures" 
                                checked={formData.additionalSymptoms.includes("Seizures")}
                                onChange={handleInputChange}
                              /> 
                              Seizures
                            </label>
                            <label>
                              <input 
                                type="checkbox" 
                                name="additionalSymptoms" 
                                value="Loss of consciousness" 
                                checked={formData.additionalSymptoms.includes("Loss of consciousness")}
                                onChange={handleInputChange}
                              /> 
                              Loss of consciousness
                            </label>
                          </div>
                        </div>
                        
                        {(formData.neurologicalSymptoms || 
                          formData.visionChanges || 
                          formData.additionalSymptoms.length > 0) && (
                          <div className="emergency-notice">
                            <h3>URGENT NOTICE</h3>
                            <p>Based on your responses, your symptoms may require immediate medical attention. While we're expediting your telemedicine appointment, please consider seeking emergency care if symptoms worsen.</p>
                            <p>Your responses have been flagged for immediate provider review.</p>
                          </div>
                        )}
                      </div>
                    )}

                    <button type="submit" className="submit-btn urgent-submit">Submit Urgent Questionnaire</button>
                  </form>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PrevisitTriage;