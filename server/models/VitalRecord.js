const mongoose = require('mongoose');

const vitalRecordSchema = mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  vitalType: {
    type: String,
    required: true,
    enum: ['bloodPressure', 'bloodSugar', 'heartRate', 'weight', 'cholesterol', 'temperature', 'oxygenSaturation']
  },
  date: {
    type: Date,
    required: true
  },
  value: {
    type: Number,
    required: function() {
      return this.vitalType !== 'bloodPressure';
    }
  },
  systolic: {
    type: Number,
    required: function() {
      return this.vitalType === 'bloodPressure';
    }
  },
  diastolic: {
    type: Number,
    required: function() {
      return this.vitalType === 'bloodPressure';
    }
  },
  unit: {
    type: String,
    required: true
  },
  recordedBy: {
    type: String
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('VitalRecord', vitalRecordSchema);